import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { assertValidTransition } from "@/lib/workflow";
import { ActionWithVersionSchema, RejectSchema } from "@/lib/zod-schemas";
import { DocumentStatus } from "@/types";
import { ACTIONS } from "@/types";

type TransitionEndpointConfig = {
  action: string;
  targetStatus: DocumentStatus;
  requireComment?: boolean;
};

export async function handleTransition(
  req: NextRequest, 
  id: string, 
  config: TransitionEndpointConfig
) {
  try {
    const user = await requireAuth();
    const document = await prisma.document.findUnique({ where: { id } });
    if (!document) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();
    const schema = config.requireComment ? RejectSchema : ActionWithVersionSchema;
    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const { expectedVersion } = result.data;
    const comment = 'comment' in result.data ? result.data.comment : null;

    if (document.version !== expectedVersion) {
      return NextResponse.json({ error: "This document changed. Refresh and try again." }, { status: 409 });
    }

    try {
      assertValidTransition(document.status, config.targetStatus, user, document);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    const updatedDoc = await prisma.$transaction(async (tx: any) => {
      const updated = await tx.document.update({
        where: { id, version: expectedVersion },
        data: {
          status: config.targetStatus,
          version: { increment: 1 },
        },
      });

      await tx.auditLog.create({
        data: {
          documentId: id,
          actorId: user.id,
          action: config.action,
          previousStatus: document.status,
          newStatus: config.targetStatus,
          comment,
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
