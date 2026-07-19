"use client";

import { AuditLogEntry } from "@/types";
import { format } from "date-fns";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "./StatusBadge";

export function AuditLogTable({ logs }: { logs: AuditLogEntry[] }) {
  if (logs.length === 0) {
    return <div className="text-center p-8 text-muted-foreground border rounded-md">No history available.</div>;
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Actor</TableHead>
            <TableHead>Status Change</TableHead>
            <TableHead>Comment</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="whitespace-nowrap">
                {format(new Date(log.createdAt), "MMM d, yyyy HH:mm")}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="font-mono">{log.action}</Badge>
              </TableCell>
              <TableCell>
                <div>
                  <span className="font-medium">{log.actor.name}</span>
                </div>
                <div className="text-xs text-muted-foreground">{log.actor.email}</div>
              </TableCell>
              <TableCell>
                {log.previousStatus && log.newStatus ? (
                  <div className="flex items-center gap-2">
                    <StatusBadge status={log.previousStatus} />
                    <span className="text-muted-foreground text-xs">→</span>
                    <StatusBadge status={log.newStatus} />
                  </div>
                ) : log.newStatus ? (
                  <StatusBadge status={log.newStatus} />
                ) : (
                  <span className="text-muted-foreground text-xs">-</span>
                )}
              </TableCell>
              <TableCell className="max-w-[200px] truncate" title={log.comment || ""}>
                {log.comment || <span className="text-muted-foreground text-xs">-</span>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
