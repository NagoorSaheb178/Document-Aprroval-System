import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '60vh', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gray-700)' }}>Loading...</div>
      <div style={{ fontSize: '13px', color: 'var(--gray-500)', marginTop: '4px' }}>Please wait while we fetch your data.</div>
    </div>
  );
}
