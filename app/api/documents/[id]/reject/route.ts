import { NextRequest } from "next/server";
import { handleTransition } from "@/lib/transition-helper";
import { ACTIONS } from "@/types";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handleTransition(req, id, {
    action: ACTIONS.REJECT,
    targetStatus: "REJECTED",
    requireComment: true,
  });
}
