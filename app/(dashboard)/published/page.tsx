import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DocumentTable } from "@/components/DocumentTable";
import { DocumentWithAuthor } from "@/types";
import { FileText, Globe } from "lucide-react";
import Link from "next/link";

export default async function PublishedPage() {
  const session = await getSession();
  
  if (!session) {
    redirect("/");
  }

  const docs = await prisma.document.findMany({
    where: { status: "PUBLISHED" },
    include: { author: { select: { id: true, name: true, email: true, role: true } } },
    orderBy: { updatedAt: 'desc' }
  });

  return (
    <>
      <div className="page-header">
        <div>

          <h1 className="page-title">Published Documents</h1>
          <p className="page-subtitle">Finalized, approved, and published documents available to all users.</p>
        </div>
      </div>

      <div className="card card-pad">
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px", fontSize: "16px", fontWeight: 700, color: "var(--gray-900)" }}>
          <Globe className="w-[18px] h-[18px]" style={{ color: "var(--gray-500)" }} />
          Published
        </div>
        <DocumentTable documents={docs as DocumentWithAuthor[]} currentUser={session} />
      </div>
    </>
  );
}
