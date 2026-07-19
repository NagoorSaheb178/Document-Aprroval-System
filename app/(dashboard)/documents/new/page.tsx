import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DocumentForm } from "@/components/DocumentForm";

export default async function NewDocumentPage() {
  const session = await getSession();
  
  if (session?.role !== "AUTHOR") {
    redirect("/");
  }

  return (
    <div className="py-6">
      <DocumentForm />
    </div>
  );
}
