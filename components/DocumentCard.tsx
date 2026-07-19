import { DocumentStatus } from "@/types";
import { format } from "date-fns";
import { StatusBadge } from "./StatusBadge";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { DocumentWithAuthor } from "@/types";
import { FileText, Clock } from "lucide-react";

export function DocumentCard({ doc }: { doc: DocumentWithAuthor }) {
  return (
    <Link href={`/documents/${doc.id}`} className="block transition-transform hover:scale-[1.01]">
      <Card className="premium-card flex flex-col hover:-translate-y-0.5 group">
        <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
          <div className="flex justify-between items-start gap-4">
            <CardTitle className="text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">{doc.title}</CardTitle>
            <StatusBadge status={doc.status} />
          </div>
          <CardDescription className="flex items-center gap-2 mt-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{doc.author.name}</span>
          </CardDescription>
        </CardHeader>
        <CardFooter className="pt-4 pb-4 text-xs text-muted-foreground flex justify-between">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Last updated {format(new Date(doc.updatedAt), "MMM d, yyyy")}</span>
          </div>
          <div>v{doc.version}</div>
        </CardFooter>
      </Card>
    </Link>
  );
}
