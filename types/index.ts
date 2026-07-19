export type DocumentStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "PUBLISHED" | "ARCHIVED";
export type Role = "AUTHOR" | "REVIEWER" | "ADMIN" | "VIEWER";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface DocumentWithAuthor {
  id: string;
  title: string;
  body: string;
  status: DocumentStatus;
  authorId: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  author: { id: string; name: string; email: string; role: Role };
}

export interface AuditLogEntry {
  id: string;
  documentId: string;
  actorId: string;
  action: string;
  previousStatus: DocumentStatus | null;
  newStatus: DocumentStatus | null;
  comment: string | null;
  metadata: unknown;
  createdAt: Date;
  actor: { id: string; name: string; email: string };
}

export type ApiResponse<T> =
  | { data: T; error?: never }
  | { error: string; data?: never };

// ---------------------------------------------------------------------------
// Action constants
// ---------------------------------------------------------------------------

export const ACTIONS = {
  CREATE: "CREATE",
  EDIT: "EDIT",
  SUBMIT: "SUBMIT",
  APPROVE: "APPROVE",
  REJECT: "REJECT",
  REOPEN: "REOPEN",
  PUBLISH: "PUBLISH",
  ARCHIVE: "ARCHIVE",
} as const;

export type ActionType = (typeof ACTIONS)[keyof typeof ACTIONS];
