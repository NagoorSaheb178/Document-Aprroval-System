import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { History, FileText } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function AuditHistoryPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  if (session.role === "VIEWER") {
    redirect("/"); // viewers cannot see global audit log
  }

  const logs = await prisma.auditLog.findMany({
    include: { 
      actor: { select: { name: true, role: true } },
      document: { select: { title: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 50 // Limit to 50 for demo
  });

  return (
    <>
      <div className="page-header">
        <div>

          <h1 className="page-title">Global Audit Trail</h1>
          <p className="page-subtitle">A chronological record of all document workflow activities.</p>
        </div>
      </div>

      <div className="card card-pad">
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px", fontSize: "16px", fontWeight: 700, color: "var(--gray-900)" }}>
          <History className="w-[18px] h-[18px]" style={{ color: "var(--gray-500)" }} />
          Recent Activity
        </div>

        {logs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><History className="w-6 h-6" /></div>
            <div className="empty-title">No audit logs found</div>
            <div className="empty-sub">There is no recorded activity yet.</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Document</th>
                  <th>Target State</th>
                  <th>Comments</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td style={{ color: "var(--gray-500)", whiteSpace: "nowrap" }}>
                      {format(new Date(log.createdAt), "MMM d, yyyy HH:mm")}
                    </td>
                    <td>
                      <div className="doc-title-cell">{log.actor.name}</div>
                      <div className="doc-meta">{log.actor.role}</div>
                    </td>
                    <td>
                      <span className="badge" style={{ background: "var(--gray-100)", color: "var(--gray-700)" }}>
                        {log.action.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <Link href={`/documents/${log.documentId}`} style={{ color: "var(--blue-600)", fontWeight: 500, textDecoration: "underline" }} className="hover:text-blue-800">
                        {log.document.title.length > 30 ? log.document.title.substring(0, 30) + "..." : log.document.title}
                      </Link>
                    </td>
                    <td>
                      <span className="role-pill" style={{ background: "var(--gray-100)", color: "var(--gray-600)" }}>
                        {log.newStatus || "N/A"}
                      </span>
                    </td>
                    <td style={{ color: "var(--gray-600)", fontSize: "13px", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {log.comment || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
