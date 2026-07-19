"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DocumentWithAuthor } from "@/types";

interface DocumentFormProps {
  initialData?: DocumentWithAuthor;
}

export function DocumentForm({ initialData }: DocumentFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || "");
  const [body, setBody] = useState(initialData?.body || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error("Title and body are required");
      return;
    }

    setLoading(true);

    try {
      const url = initialData ? `/api/documents/${initialData.id}` : "/api/documents";
      const method = initialData ? "PATCH" : "POST";
      
      const payload = {
        title,
        body,
        ...(initialData ? { expectedVersion: initialData.version } : {}),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save document");
      }

      toast.success(initialData ? "Document updated" : "Document created");
      router.push(`/documents/${data.data.id}`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card w-full max-w-3xl mx-auto shadow-sm fade-in">
      <div className="card-pad border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
          {initialData ? "Edit Document" : "Create New Document"}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {initialData ? "Update the details of your document below." : "Fill out the information below to start a new document."}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card-pad space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700">
              Title
            </label>
            <input
              id="title"
              placeholder="e.g. Employee Leave Policy"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="body" className="block text-sm font-semibold text-gray-700">
              Content
            </label>
            <textarea
              id="body"
              placeholder="Write your document content here... Use markdown if needed."
              className="w-full px-4 py-3 min-h-[350px] bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none resize-y"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
          </div>
        </div>
        
        <div className="card-pad border-t border-gray-100 bg-gray-50/50 flex justify-between items-center rounded-b-xl">
          <button 
            type="button" 
            className="btn btn-ghost" 
            onClick={() => router.back()}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary shadow-sm"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              initialData ? "Save Changes" : "Create Document"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
