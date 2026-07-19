"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { DocumentStatus, SessionUser, DocumentWithAuthor } from "@/types";
import { Send, CheckCircle, XCircle, RotateCcw, UploadCloud, Archive } from "lucide-react";

interface Props {
  doc: DocumentWithAuthor;
  user: SessionUser;
  canSubmit: boolean;
  canApprove: boolean;
  canReject: boolean;
  canPublish: boolean;
  canArchive: boolean;
  small?: boolean;
}

export function WorkflowActions({ doc, user, canSubmit, canApprove, canReject, canPublish, canArchive, small = false }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectOpen, setRejectOpen] = useState(false);

  const handleAction = async (actionPath: string, payload?: any) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/documents/${doc.id}/${actionPath}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expectedVersion: doc.version,
          ...payload,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Action failed");
      }

      toast.success("Document updated successfully");
      router.refresh();
      if (actionPath === "reject") {
        setRejectOpen(false);
        setRejectReason("");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const hasActions = canSubmit || canApprove || canReject || canPublish || canArchive || (doc.status === "REJECTED" && doc.authorId === user.id);

  if (!hasActions) return null;

  const btnClass = small ? "btn btn-sm" : "btn";
  const iconClass = small ? "w-[14px] h-[14px]" : "w-[15px] h-[15px]";

  return (
    <div className={`flex flex-wrap gap-2 ${small ? '' : 'mt-6'}`}>
      {canSubmit && (
        <button onClick={() => handleAction("submit")} disabled={loading} className={`${btnClass} btn-primary`}>
          <Send className={iconClass} /> Submit for Review
        </button>
      )}

      {doc.status === "REJECTED" && doc.authorId === user.id && (
        <button onClick={() => handleAction("reopen")} disabled={loading} className={`${btnClass} btn-secondary`}>
          <RotateCcw className={iconClass} /> Reopen to Draft
        </button>
      )}

      {canApprove && (
        <button onClick={() => handleAction("approve")} disabled={loading} className={`${btnClass} btn-success`}>
          <CheckCircle className={iconClass} /> Approve
        </button>
      )}

      {canReject && (
        <>
          <button className={`${btnClass} btn-danger`} onClick={() => setRejectOpen(true)}>
            <XCircle className={iconClass} /> Reject
          </button>
          
          <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
            <DialogContent 
              className="sm:max-w-[480px] p-0 overflow-hidden rounded-xl shadow-2xl gap-0 !ring-0 !border-0"
              style={{ backgroundColor: '#ffffff' }}
            >
              <DialogHeader 
                style={{ padding: '24px', borderBottom: '1px solid var(--gray-200)', backgroundColor: '#ffffff' }}
              >
                <DialogTitle className="text-lg font-bold text-gray-900 tracking-tight">Reject Document</DialogTitle>
                <p className="text-sm text-gray-500 mt-1">Please provide a reason for rejecting this document. This will be visible to the author.</p>
              </DialogHeader>
              <div style={{ padding: '24px', backgroundColor: '#ffffff' }}>
                <textarea 
                  placeholder="e.g. The section on leave carry-forward needs clarification..." 
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '16px',
                    backgroundColor: 'var(--gray-50)',
                    border: '1px solid var(--gray-300)',
                    borderRadius: '8px',
                    color: 'var(--gray-900)',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    outline: 'none',
                    resize: 'vertical',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#ef4444';
                    e.target.style.backgroundColor = '#ffffff';
                    e.target.style.boxShadow = '0 0 0 4px #fef2f2';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--gray-300)';
                    e.target.style.backgroundColor = 'var(--gray-50)';
                    e.target.style.boxShadow = 'none';
                  }}
                  required
                />
              </div>
              <DialogFooter 
                className="!m-0"
                style={{ 
                  padding: '16px 24px', 
                  borderTop: '1px solid var(--gray-200)', 
                  backgroundColor: 'var(--gray-50)', 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  gap: '12px',
                  borderBottomLeftRadius: '12px',
                  borderBottomRightRadius: '12px'
                }}
              >
                <button 
                  className="btn btn-ghost" 
                  style={{ padding: '10px 16px', borderRadius: '8px' }}
                  onClick={() => setRejectOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-danger shadow-sm" 
                  style={{ padding: '10px 16px', borderRadius: '8px' }}
                  onClick={() => handleAction("reject", { comment: rejectReason })}
                  disabled={loading || !rejectReason.trim()}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Rejecting...
                    </span>
                  ) : (
                    "Confirm Rejection"
                  )}
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}

      {canPublish && (
        <button onClick={() => handleAction("publish")} disabled={loading} className={`${btnClass} btn-primary`}>
          <UploadCloud className={iconClass} /> Publish
        </button>
      )}

      {canArchive && (
        <button onClick={() => handleAction("archive")} disabled={loading} className={`${btnClass} btn-secondary`}>
          <Archive className={iconClass} /> Archive
        </button>
      )}
    </div>
  );
}
