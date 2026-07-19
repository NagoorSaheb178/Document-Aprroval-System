import { DocumentStatus } from "@/types";

export function StatusBadge({ status }: { status: DocumentStatus }) {
  const map: Record<DocumentStatus, { cls: string; label: string }> = {
    DRAFT: { cls: "badge-draft", label: "Draft" },
    SUBMITTED: { cls: "badge-submitted", label: "Submitted" },
    APPROVED: { cls: "badge-approved", label: "Approved" },
    REJECTED: { cls: "badge-rejected", label: "Rejected" },
    PUBLISHED: { cls: "badge-published", label: "Published" },
    ARCHIVED: { cls: "badge-archived", label: "Archived" },
  };

  const m = map[status];
  
  return (
    <span className={`badge ${m.cls}`}>
      <span className="dot"></span>
      {m.label}
    </span>
  );
}
