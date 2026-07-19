import { DocumentStatus } from "@/types";
import { SessionUser } from "@/types";
import { 
  canSubmitDocument, 
  canApproveDocument, 
  canRejectDocument, 
  canPublishDocument, 
  canArchiveDocument 
} from "./permissions";

export function assertValidTransition(
  from: DocumentStatus,
  to: DocumentStatus,
  user: SessionUser,
  doc: { authorId: string; status: DocumentStatus }
): void {
  // 1. Check validity of transition
  const valid = isValidTransition(from, to);
  if (!valid) {
    throw new Error(`Invalid state transition from ${from} to ${to}`);
  }

  // 2. Check permissions for the specific transition action
  let allowed = false;

  if (to === "SUBMITTED" && from === "DRAFT") {
    allowed = canSubmitDocument(user, doc);
  } else if (to === "APPROVED" && from === "SUBMITTED") {
    allowed = canApproveDocument(user, doc);
  } else if (to === "REJECTED" && from === "SUBMITTED") {
    allowed = canRejectDocument(user, doc);
  } else if (to === "DRAFT" && from === "REJECTED") {
    // Reopen
    allowed = canSubmitDocument(user, doc);
  } else if (to === "PUBLISHED" && from === "APPROVED") {
    allowed = canPublishDocument(user, doc);
  } else if (to === "ARCHIVED") {
    allowed = canArchiveDocument(user);
  }

  if (!allowed) {
    throw new Error(`User ${user.id} (${user.role}) is not allowed to transition document from ${from} to ${to}`);
  }
}

export function isValidTransition(from: DocumentStatus, to: DocumentStatus): boolean {
  const transitions: Record<DocumentStatus, DocumentStatus[]> = {
    DRAFT: ["SUBMITTED", "ARCHIVED"],
    SUBMITTED: ["APPROVED", "REJECTED", "ARCHIVED"],
    REJECTED: ["DRAFT", "ARCHIVED"], // from REJECTED, author can reopen to DRAFT
    APPROVED: ["PUBLISHED", "ARCHIVED"],
    PUBLISHED: ["ARCHIVED"],
    ARCHIVED: [] // terminal state
  };

  return transitions[from]?.includes(to) ?? false;
}
