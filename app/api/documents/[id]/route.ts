import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { canViewDocument, canEditDocument } from "@/lib/permissions";
import { EditDocumentSchema } from "@/lib/zod-schemas";
import { ACTIONS } from "@/types";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    
    const document = await prisma.document.findUnique({
      where: { id },
      include: { author: { select: { id: true, name: true, email: true, role: true } } }
    });

    if (!document) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (!canViewDocument(user, document)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ data: document });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const document = await prisma.document.findUnique({ where: { id } });
    if (!document) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (!canEditDocument(user, document)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const result = EditDocumentSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const { title, body: docBody, expectedVersion } = result.data;

    // Optimistic Concurrency Check
    if (document.version !== expectedVersion) {
      return NextResponse.json({ error: "This document changed. Refresh and try again." }, { status: 409 });
    }

    const updatedDoc = await prisma.$transaction(async (tx) => {
      // Re-verify version in transaction
      const updated = await tx.document.update({
        where: { id, version: expectedVersion },
        data: {
          ...(title && { title }),
          ...(docBody && { body: docBody }),
          version: { increment: 1 },
        },
      });

      await tx.auditLog.create({
        data: {
          documentId: id,
          actorId: user.id,
          action: ACTIONS.EDIT,
        }
      });

      return updated;
    });

    return NextResponse.json({ data: updatedDoc });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.code === 'P2025') {
       return NextResponse.json({ error: "This document changed. Refresh and try again." }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
