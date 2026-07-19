# Document Approval System

A production-quality document approval workflow system. Built to enforce a strict state machine, centralized role-based authorization, optimistic concurrency control, and append-only audit logging.

## Tech Stack
- Next.js 15 (App Router, Server Components)
- React, TypeScript, Tailwind CSS, shadcn/ui
- Prisma ORM, Supabase PostgreSQL
- Zod (Validation), jose (Session JWT), bcryptjs (Passwords)

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the environment variables:
   Rename `.env.example` to `.env` (or use the existing `.env` with Supabase connection string).
4. Sync database and seed:
   ```bash
   npx prisma db push
   npx tsx prisma/seed.ts
   ```
5. Run the development server:
   ```bash
   npm run dev
   ```

## Seeded Users

| Email | Password | Role |
|-------|----------|------|
| alice@example.com | password123 | AUTHOR |
| bob@example.com | password123 | REVIEWER |
| admin@example.com | password123 | ADMIN |
| viewer@example.com | password123 | VIEWER |

## Architecture Overview

- **Server-Side Validation**: All workflow state transitions and role permissions are strictly validated on the server.
- **Transactions**: Document state changes and the corresponding `AuditLog` entry are executed within a single `$transaction`.
- **Optimistic Concurrency**: Every document mutation requires an `expectedVersion` matching the database version to prevent stale overrides.
- **Append-Only Logging**: Audit logs are created alongside every mutation, and they are never updated or deleted.
