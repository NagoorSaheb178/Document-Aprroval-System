import { DocumentStatus, SessionUser } from "@/types";

export function canCreateDocument(user: SessionUser): boolean {
  return user.role === "AUTHOR";
}

export function canEditDocument(user: SessionUser, doc: { authorId: string; status: DocumentStatus }): boolean {
  return user.role === "AUTHOR" && doc.authorId === user.id && (doc.status === "DRAFT" || doc.status === "REJECTED");
}

export function canSubmitDocument(user: SessionUser, doc: { authorId: string; status: DocumentStatus }): boolean {
  return user.role === "AUTHOR" && doc.authorId === user.id && (doc.status === "DRAFT" || doc.status === "REJECTED");
}

export function canApproveDocument(user: SessionUser, doc: { authorId: string; status: DocumentStatus }): boolean {
  // Reviewer can approve, but NOT their own document
  return user.role === "REVIEWER" && doc.authorId !== user.id && doc.status === "SUBMITTED";
}

export function canRejectDocument(user: SessionUser, doc: { authorId: string; status: DocumentStatus }): boolean {
  // Reviewer can reject, but NOT their own document
  return user.role === "REVIEWER" && doc.authorId !== user.id && doc.status === "SUBMITTED";
}

export function canPublishDocument(user: SessionUser, doc: { status: DocumentStatus }): boolean {
  // Both Reviewer and Admin can publish an approved document (as per the prompt)
  return (user.role === "REVIEWER" || user.role === "ADMIN") && doc.status === "APPROVED";
}

export function canArchiveDocument(user: SessionUser): boolean {
  return user.role === "ADMIN";
}

export function canViewDocument(user: SessionUser, doc: { authorId: string; status: DocumentStatus }): boolean {
  if (doc.status === "PUBLISHED") return true; // Everyone can see published docs
  if (user.role === "ADMIN") return true; // Admins see everything
  if (user.role === "REVIEWER" && doc.status !== "DRAFT") return true; // Reviewers see submitted/approved/rejected docs
  if (user.role === "AUTHOR" && doc.authorId === user.id) return true; // Authors see their own docs
  return false;
}
