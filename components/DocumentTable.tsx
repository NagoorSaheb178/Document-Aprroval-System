"use client";

import { DocumentWithAuthor } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { StatusBadge } from "./StatusBadge";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { WorkflowActions } from "./WorkflowActions";
import { SessionUser } from "@/types";
import { useSearch } from "./SearchContext";

import { 
  canSubmitDocument, 
  canApproveDocument, 
  canRejectDocument, 
  canPublishDocument, 
  canArchiveDocument 
} from "@/lib/permissions";

interface Props {
  documents: DocumentWithAuthor[];
  compact?: boolean;
  currentUser: SessionUser;
}

export function DocumentTable({ documents, compact = false, currentUser }: Props) {
  const router = useRouter();
  const { search } = useSearch();

  const filteredDocuments = documents.filter(doc => {
    if (!search) return true;
    const q = search.toLowerCase();
    return doc.title.toLowerCase().includes(q) || 
           doc.author.name.toLowerCase().includes(q) ||
           doc.status.toLowerCase().includes(q);
  });

  if (filteredDocuments.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon"><Eye className="w-6 h-6" /></div>
        <div className="empty-title">No documents found</div>
        <div className="empty-sub">There are no documents to show here.</div>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Last Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredDocuments.map((doc) => (
            <tr 
              key={doc.id} 
              onClick={() => router.push(`/documents/${doc.id}`)}
              style={{ cursor: "pointer" }}
            >
              <td>
                <div className="doc-title-cell">{doc.title}</div>
                {!compact && (
                  <div className="doc-meta">by {doc.author.name}</div>
                )}
              </td>
              <td>
                <StatusBadge status={doc.status} />
              </td>
              <td style={{ color: "var(--gray-500)" }}>
                {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
              </td>
              <td onClick={(e) => e.stopPropagation()}>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button 
                    className="btn btn-ghost btn-sm"
                    onClick={() => router.push(`/documents/${doc.id}`)}
                  >
                    <Eye className="w-[15px] h-[15px]" /> View
                  </button>
                  <WorkflowActions 
                    doc={doc} 
                    user={currentUser} 
                    small 
                    canSubmit={canSubmitDocument(currentUser, doc)}
                    canApprove={canApproveDocument(currentUser, doc)}
                    canReject={canRejectDocument(currentUser, doc)}
                    canPublish={canPublishDocument(currentUser, doc)}
                    canArchive={canArchiveDocument(currentUser) && doc.status !== 'ARCHIVED'}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
