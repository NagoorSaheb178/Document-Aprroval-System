import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { CreateDocumentSchema } from "@/lib/zod-schemas";
import { ACTIONS } from "@/types";
import { DocumentStatus } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as DocumentStatus | null;
    
    let whereClause: any = {};
    
    // Base role filtering
    if (user.role === "VIEWER") {
      whereClause.status = "PUBLISHED";
    } else if (user.role === "AUTHOR") {
      whereClause.authorId = user.id;
    } else if (user.role === "REVIEWER") {
      // Reviewers see anything not DRAFT
      whereClause.status = { not: "DRAFT" };
    }
    // Admins see everything (no base filter needed)

    // Specific status requested filter
    if (status) {
      if (user.role === "VIEWER" && status !== "PUBLISHED") {
        return NextResponse.json({ data: [] }); // Viewers ONLY see published
      }
      whereClause.status = status;
    }

    const documents = await prisma.document.findMany({
      where: whereClause,
      include: {
        author: {
          select: { id: true, name: true, email: true, role: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({ data: documents });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    
    if (user.role !== "AUTHOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const result = CreateDocumentSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const { title, body: docBody } = result.data;

    // Use a transaction for initial creation + audit log
    const doc = await prisma.$transaction(async (tx: any) => {
      const newDoc = await tx.document.create({
        data: {
          title,
          body: docBody,
          status: "DRAFT",
          authorId: user.id,
        },
      });

      await tx.auditLog.create({
        data: {
          documentId: newDoc.id,
          actorId: user.id,
          action: ACTIONS.CREATE,
          newStatus: "DRAFT",
        }
      });

      return newDoc;
    });

    return NextResponse.json({ data: doc }, { status: 201 });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
