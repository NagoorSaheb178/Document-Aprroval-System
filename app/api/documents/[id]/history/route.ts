import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { canViewDocument } from "@/lib/permissions";

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

    const history = await prisma.auditLog.findMany({
      where: { documentId: id },
      include: {
        actor: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ data: history });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
