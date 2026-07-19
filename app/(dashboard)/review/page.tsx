import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DocumentTable } from "@/components/DocumentTable";
import { DocumentWithAuthor } from "@/types";
import { FileText, ListChecks } from "lucide-react";
import Link from "next/link";

export default async function ReviewQueuePage() {
  const session = await getSession();
  
  if (!session || (session.role !== "REVIEWER" && session.role !== "ADMIN")) {
    redirect("/");
  }

  const docs = await prisma.document.findMany({
    where: { status: "SUBMITTED" },
    include: { author: { select: { id: true, name: true, email: true, role: true } } },
    orderBy: { updatedAt: 'asc' }
  });

  return (
    <>
      <div className="page-header">
        <div>

          <h1 className="page-title">Review Queue</h1>
          <p className="page-subtitle">Documents that are awaiting your review and approval.</p>
        </div>
      </div>

      <div className="card card-pad">
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px", fontSize: "16px", fontWeight: 700, color: "var(--gray-900)" }}>
          <ListChecks className="w-[18px] h-[18px]" style={{ color: "var(--gray-500)" }} />
          Action Required
        </div>
        <DocumentTable documents={docs as DocumentWithAuthor[]} currentUser={session} />
      </div>
    </>
  );
}
