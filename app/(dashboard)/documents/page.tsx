import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DocumentGrid } from "@/components/DocumentGrid";
import { DocumentWithAuthor } from "@/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, Filter } from "lucide-react";

export default async function DocumentsPage(
  props: { searchParams?: Promise<{ status?: string }> }
) {
  const searchParams = await props.searchParams;
  const session = await getSession();
  if (!session) return null;

  const status = searchParams?.status as any;

  let whereClause: any = {};
  
  if (session.role === "VIEWER") {
    whereClause.status = "PUBLISHED";
  } else if (session.role === "AUTHOR") {
    whereClause.authorId = session.id;
  } else if (session.role === "REVIEWER") {
    whereClause.status = { not: "DRAFT" };
  }

  if (status) {
    whereClause.status = status;
  }

  const docs = await prisma.document.findMany({
    where: whereClause,
    include: { author: { select: { id: true, name: true, email: true, role: true } } },
    orderBy: { updatedAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">Manage your documents and workflow.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/documents"><Filter className="w-4 h-4 mr-2"/> All</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/documents?status=DRAFT">Drafts</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/documents?status=SUBMITTED">Submitted</Link>
          </Button>
          {session.role === "AUTHOR" && (
            <Button asChild size="sm">
              <Link href="/documents/new"><FileText className="w-4 h-4 mr-2"/> New Document</Link>
            </Button>
          )}
        </div>
      </div>

      <DocumentGrid documents={docs as DocumentWithAuthor[]} />
    </div>
  );
}
