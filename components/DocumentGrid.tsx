"use client";

import { DocumentWithAuthor } from "@/types";
import { DocumentCard } from "./DocumentCard";
import { useSearch } from "./SearchContext";

export function DocumentGrid({ documents }: { documents: DocumentWithAuthor[] }) {
  const { search } = useSearch();

  const filtered = documents.filter(doc => {
    if (!search) return true;
    const q = search.toLowerCase();
    return doc.title.toLowerCase().includes(q) || 
           (doc.author?.name || '').toLowerCase().includes(q) ||
           doc.status.toLowerCase().includes(q);
  });

  if (filtered.length === 0) {
    return (
        <div className="text-center p-12 border rounded-lg bg-card mt-8">
          <p className="text-muted-foreground">No documents found matching the search criteria.</p>
        </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filtered.map(doc => (
        <DocumentCard key={doc.id} doc={doc} />
      ))}
    </div>
  );
}
