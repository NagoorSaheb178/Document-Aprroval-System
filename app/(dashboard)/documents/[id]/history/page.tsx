import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { canViewDocument } from "@/lib/permissions";
import { AuditLogTable } from "@/components/AuditLogTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuditLogEntry } from "@/types";

export default async function DocumentHistoryPage(
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  const session = await getSession();
  if (!session) redirect("/login");

  const doc = await prisma.document.findUnique({
    where: { id },
  });

  if (!doc) notFound();
  
  if (!canViewDocument(session, doc)) {
    redirect("/");
  }

  const logs = await prisma.auditLog.findMany({
    where: { documentId: id },
    include: { actor: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/documents/${doc.id}`}><ArrowLeft className="w-5 h-5"/></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit History</h1>
          <p className="text-muted-foreground text-sm">Document: {doc.title}</p>
        </div>
      </div>

      <AuditLogTable logs={logs as unknown as AuditLogEntry[]} />
    </div>
  );
}
