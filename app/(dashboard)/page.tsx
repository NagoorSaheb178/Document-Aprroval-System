import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DocumentTable } from "@/components/DocumentTable";
import { DocumentWithAuthor } from "@/types";
import { FileText, CheckCircle, Clock, Plus } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null; // handled by layout redirect

  let docs: any[] = [];
  let stats = { total: 0, pending: 0, approved: 0 };

  if (session.role === "AUTHOR") {
    const [fetchedDocs, total, pending, approved] = await Promise.all([
      prisma.document.findMany({
        where: { authorId: session.id },
        include: { author: { select: { id: true, name: true, email: true, role: true } } },
        orderBy: { updatedAt: 'desc' },
        take: 5
      }),
      prisma.document.count({ where: { authorId: session.id } }),
      prisma.document.count({ where: { authorId: session.id, status: "SUBMITTED" } }),
      prisma.document.count({ where: { authorId: session.id, status: { in: ["APPROVED", "PUBLISHED"] } } })
    ]);
    docs = fetchedDocs;
    stats = { total, pending, approved };
  } else if (session.role === "REVIEWER") {
    const [fetchedDocs, pending, approved] = await Promise.all([
      prisma.document.findMany({
        where: { status: "SUBMITTED" },
        include: { author: { select: { id: true, name: true, email: true, role: true } } },
        orderBy: { updatedAt: 'desc' },
        take: 5
      }),
      prisma.document.count({ where: { status: "SUBMITTED" } }),
      prisma.document.count({ where: { status: { in: ["APPROVED", "PUBLISHED"] } } })
    ]);
    docs = fetchedDocs;
    stats.pending = pending;
    stats.approved = approved;
  } else if (session.role === "ADMIN") {
    const [fetchedDocs, total, pending, approved] = await Promise.all([
      prisma.document.findMany({
        include: { author: { select: { id: true, name: true, email: true, role: true } } },
        orderBy: { updatedAt: 'desc' },
        take: 5
      }),
      prisma.document.count(),
      prisma.document.count({ where: { status: "SUBMITTED" } }),
      prisma.document.count({ where: { status: { in: ["APPROVED", "PUBLISHED"] } } })
    ]);
    docs = fetchedDocs;
    stats = { total, pending, approved };
  } else if (session.role === "VIEWER") {
    const [fetchedDocs, total, pending, approved] = await Promise.all([
      prisma.document.findMany({
        where: { status: "PUBLISHED" },
        include: { author: { select: { id: true, name: true, email: true, role: true } } },
        orderBy: { updatedAt: 'desc' },
        take: 5
      }),
      prisma.document.count({ where: { status: "PUBLISHED" } }),
      prisma.document.count({ where: { status: "SUBMITTED" } }),
      prisma.document.count({ where: { status: { in: ["APPROVED", "PUBLISHED"] } } })
    ]);
    docs = fetchedDocs;
    stats = { total, pending, approved };
  }

  const roleTitleMap: Record<string, string> = {
    AUTHOR: "Author Dashboard",
    REVIEWER: "Reviewer Overview",
    ADMIN: "Admin Control Panel",
    VIEWER: "Document Viewer"
  };

  return (
    <>
      <div className="page-header">
        <div>

          <h1 className="page-title">{roleTitleMap[session.role]}</h1>
          <p className="page-subtitle">Welcome back, {session.name}. Here's what's happening.</p>
        </div>
        {session.role === "AUTHOR" && (
          <Link href="/documents/new" className="btn btn-primary">
            <Plus /> Create Document
          </Link>
        )}
      </div>

      <div className="stat-grid">
        <div className="card stat-card">
          <div className="stat-top">
            <div className="stat-icon" style={{ background: "var(--blue-50)", color: "var(--blue-600)" }}>
              <FileText />
            </div>
          </div>
          <div className="stat-value">{session.role === "REVIEWER" ? "-" : stats.total}</div>
          <div className="stat-label">{session.role === "AUTHOR" ? "My Documents" : "Total Documents"}</div>
        </div>

        <div className="card stat-card">
          <div className="stat-top">
            <div className="stat-icon" style={{ background: "var(--amber-500)20", color: "var(--amber-500)" }}>
              <Clock />
            </div>
          </div>
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending Review</div>
        </div>

        <div className="card stat-card">
          <div className="stat-top">
            <div className="stat-icon" style={{ background: "var(--green-50)", color: "var(--green-600)" }}>
              <CheckCircle />
            </div>
          </div>
          <div className="stat-value">{stats.approved}</div>
          <div className="stat-label">Approved</div>
        </div>
      </div>

      <div className="card card-pad">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--gray-900)" }}>
            {session.role === "REVIEWER" ? "Action Required" : "Recent Documents"}
          </div>
          <Link href={session.role === "REVIEWER" ? "/review" : "/documents"} className="btn btn-ghost btn-sm">
            View All
          </Link>
        </div>
        
        <DocumentTable documents={docs as DocumentWithAuthor[]} currentUser={session} compact={false} />
      </div>
    </>
  );
}
