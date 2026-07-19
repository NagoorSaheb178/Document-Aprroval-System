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
            <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden bg-white rounded-xl shadow-xl border border-gray-200 gap-0">
              <DialogHeader className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                <DialogTitle className="text-lg font-bold text-gray-900 tracking-tight">Reject Document</DialogTitle>
                <p className="text-sm text-gray-500 mt-1">Please provide a reason for rejecting this document. This will be visible to the author.</p>
              </DialogHeader>
              <div className="p-6">
                <textarea 
                  placeholder="e.g. The section on leave carry-forward needs clarification..." 
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-50 transition-all outline-none resize-y text-sm"
                  required
                />
              </div>
              <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-row justify-end gap-3 sm:justify-end">
                <button 
                  className="btn btn-ghost" 
                  onClick={() => setRejectOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-danger shadow-sm" 
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
