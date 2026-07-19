import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { canEditDocument } from "@/lib/permissions";
import { DocumentForm } from "@/components/DocumentForm";
import { DocumentWithAuthor } from "@/types";

export default async function EditDocumentPage(
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
  
  if (!canEditDocument(session, doc)) {
    redirect(`/documents/${id}`);
  }

  return (
    <div className="py-6">
      <DocumentForm initialData={doc as DocumentWithAuthor} />
    </div>
  );
}
