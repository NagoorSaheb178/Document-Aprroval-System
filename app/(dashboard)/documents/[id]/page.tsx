import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { 
  canViewDocument, canEditDocument, canSubmitDocument, 
  canApproveDocument, canRejectDocument, canPublishDocument, canArchiveDocument 
} from "@/lib/permissions";
import { WorkflowActions } from "@/components/WorkflowActions";
import { StatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";
import Link from "next/link";
import { DocumentWithAuthor } from "@/types";
import { Pencil, FileText, Settings2, Info, CheckCircle2, XCircle, Clock, FilePlus2, FileEdit } from "lucide-react";

export default async function DocumentDetailPage(
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  const session = await getSession();
  if (!session) redirect("/login");

  const doc = await prisma.document.findUnique({
    where: { id },
    include: { author: { select: { id: true, name: true, email: true, role: true } } }
  });

  if (!doc) notFound();
  if (!canViewDocument(session, doc)) redirect("/");

  const auditLogs = await prisma.auditLog.findMany({
    where: { documentId: id },
    include: { actor: { select: { name: true, email: true, role: true } } },
    orderBy: { createdAt: 'desc' }
  });

  const canEdit = canEditDocument(session, doc);
  const canSubmit = canSubmitDocument(session, doc);
  const canApprove = canApproveDocument(session, doc);
  const canReject = canRejectDocument(session, doc);
  const canPublish = canPublishDocument(session, doc);
  const canArchive = canArchiveDocument(session);

  return (
    <>
      <div className="page-header">
        <div>

          <h1 className="page-title">{doc.title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <StatusBadge status={doc.status} />
            <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>v{doc.version} • Last updated {format(new Date(doc.updatedAt), "MMM d, yyyy")}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {canEdit && (
            <Link href={`/documents/${doc.id}/edit`} className="btn btn-secondary">
              <Pencil /> Edit
            </Link>
          )}
        </div>
      </div>

      <WorkflowActions 
        doc={doc as DocumentWithAuthor} 
        user={session}
        canSubmit={canSubmit}
        canApprove={canApprove}
        canReject={canReject}
        canPublish={canPublish}
        canArchive={canArchive}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start', marginTop: '24px' }}>
        
        <div className="card card-pad">
          <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--gray-200)', color: 'var(--gray-900)' }}>
            Document Content
          </div>
          <div style={{ fontSize: '14.5px', lineHeight: 1.7, color: 'var(--gray-800)', whiteSpace: 'pre-wrap' }}>
            {doc.body}
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="card card-pad">
            <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Info className="w-[15px] h-[15px] text-[var(--gray-400)]" /> Document Details
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>Author</div>
                <div style={{ fontSize: '13.5px', color: 'var(--gray-900)' }}>{doc.author.name}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>Created</div>
                <div style={{ fontSize: '13.5px', color: 'var(--gray-900)' }}>{format(new Date(doc.createdAt), "MMM d, yyyy HH:mm")}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>Document ID</div>
                <div style={{ fontSize: '13.5px', color: 'var(--gray-900)', fontFamily: 'monospace' }}>{doc.id}</div>
              </div>
            </div>
          </div>

          <div className="card card-pad">
            <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Settings2 className="w-[15px] h-[15px] text-[var(--gray-400)]" /> Audit Trail
            </div>
            
            <div className="timeline">
              {auditLogs.map((log: any) => {
                let Icon = FileText;
                let iconColor = "var(--gray-400)";
                let iconBg = "#fff";
                let borderColor = "var(--gray-200)";

                if (log.action === "APPROVE") {
                  Icon = CheckCircle2;
                  iconColor = "var(--green-600)";
                  iconBg = "var(--green-50)";
                  borderColor = "var(--green-200)";
                } else if (log.action === "REJECT") {
                  Icon = XCircle;
                  iconColor = "var(--red-600)";
                  iconBg = "var(--red-50)";
                  borderColor = "var(--red-200)";
                } else if (log.action === "SUBMIT") {
                  Icon = Clock;
                  iconColor = "var(--amber-500)";
                  iconBg = "#fffbeb";
                  borderColor = "#fde68a";
                } else if (log.action === "PUBLISH") {
                  Icon = CheckCircle2;
                  iconColor = "var(--emerald-600)";
                  iconBg = "var(--emerald-50)";
                  borderColor = "var(--emerald-200)";
                } else if (log.action === "CREATE") {
                  Icon = FilePlus2;
                  iconColor = "var(--blue-500)";
                  iconBg = "var(--blue-50)";
                  borderColor = "var(--blue-200)";
                } else if (log.action === "EDIT") {
                  Icon = FileEdit;
                  iconColor = "var(--gray-600)";
                }

                return (
                  <div key={log.id} className="tl-item">
                    <div className="tl-line"></div>
                    <div className="tl-icon" style={{ background: iconBg, borderColor: borderColor }}>
                      <Icon style={{ color: iconColor, width: '16px', height: '16px' }} />
                    </div>
                    <div className="tl-content">
                      <div className="tl-action">{log.action.replace('_', ' ')}</div>
                      <div className="tl-meta">
                        <span>by {log.actor.name}</span>
                        <span>•</span>
                        <span>{format(new Date(log.createdAt), "MMM d, HH:mm")}</span>
                        <span className="tl-status-chip">{log.newStatus || "N/A"}</span>
                      </div>
                      {log.comment && (
                        <div style={{ marginTop: '8px', padding: '10px 12px', background: 'var(--gray-50)', borderRadius: '8px', fontSize: '13px', color: 'var(--gray-700)', border: '1px solid var(--gray-200)' }}>
                          "{log.comment}"
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
}
