# Design Note

### Most Important Invariants
1. A document must never become `PUBLISHED` unless a Reviewer or Admin approved it.
2. A document cannot change state without a matching Audit Log event.
3. A user cannot act on a document outside of their role capabilities (e.g., Author cannot approve their own document, Viewers can only see Published docs).
4. Stale updates from clients must be rejected to prevent silent overwrites.

### Where Invariants Are Enforced
- **Database (Prisma)**: Enforces foreign key integrity, valid ENUM values for status, and append-only constraints purely by design (application logic never uses `UPDATE/DELETE` on AuditLog).
- **Application Code (API Routes)**: Validates state transitions via `lib/workflow.ts`, enforces permissions via `lib/permissions.ts`, and verifies `expectedVersion`. Uses `prisma.$transaction` to guarantee state change and audit log atomicity.

### Permissions Strategy
Permissions are centralized in pure functions inside `lib/permissions.ts`. Every API route securely extracts the User from a signed `jose` JWT in the HTTP-only cookie, loads the target document, and passes both to the pure permission function. UI buttons are hidden based on the exact same logic.

### Concurrency & Stale Updates
Implemented **Optimistic Concurrency Control**. The `Document` schema has a `version` field. Every edit or state transition payload must include the `expectedVersion`. 
Before writing, the server does two checks: 
1. Early check (`if doc.version !== expectedVersion return 409`).
2. Atomic check inside the transaction (`where: { id, version: expectedVersion }`).
If they mismatch, the client receives HTTP 409: "This document changed. Refresh and try again."

### Audit Events Consistency
Every state change wraps the document update and the audit log insert in a single `prisma.$transaction`. If the audit log insert fails, the state change rolls back. This makes it impossible for the document to change state without leaving a log.

### Considered Failure Cases
- **Simultaneous Reviewers**: Both open a submitted document. One approves, the other rejects a few seconds later. The second request fails with HTTP 409 due to version mismatch.
- **Direct API Call Abuse**: Attempting a state transition (`/api/documents/[id]/approve`) by manually sending HTTP requests without having the correct role or attempting an invalid transition (e.g., DRAFT -> APPROVED directly). Centralized workflow/permission libraries reject this 100% of the time on the server.
- **Audit Log Disconnect**: The server crashes exactly after the document updates but before the audit log is written. Fixed by Prisma Transactions.

### Future Improvements (Production System)
- Add rate limiting and CSRF protection.
- Move from seeded users to a robust Auth provider (e.g., NextAuth, Supabase Auth) with MFA.
- Add database-level Row Level Security (RLS) as a defense-in-depth measure.
- Implement cursor-based infinite scrolling for logs and documents instead of loading everything in memory.
