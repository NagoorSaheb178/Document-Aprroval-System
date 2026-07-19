import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Settings } from "lucide-react";
import Link from "next/link";

export default async function SettingsPage() {
  const session = await getSession();
  
  if (!session) {
    redirect("/");
  }

  return (
    <>
      <div className="page-header">
        <div>

          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account and application preferences.</p>
        </div>
      </div>

      <div className="card card-pad">
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px", fontSize: "16px", fontWeight: 700, color: "var(--gray-900)" }}>
          <Settings className="w-[18px] h-[18px]" style={{ color: "var(--gray-500)" }} />
          Account Details
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '16px', fontSize: '14px' }}>
          <div style={{ color: 'var(--gray-500)', fontWeight: 600 }}>Name</div>
          <div style={{ color: 'var(--gray-900)' }}>{session.name}</div>
          
          <div style={{ color: 'var(--gray-500)', fontWeight: 600 }}>Email</div>
          <div style={{ color: 'var(--gray-900)' }}>{session.email}</div>
          
          <div style={{ color: 'var(--gray-500)', fontWeight: 600 }}>Role</div>
          <div>
            <span className="role-pill" style={{ background: "var(--gray-100)", color: "var(--gray-600)" }}>
              {session.role}
            </span>
          </div>
        </div>
        
        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--gray-200)' }}>
          <p style={{ color: 'var(--gray-500)', fontSize: '13px' }}>
            Note: This is a demo environment. Settings and roles cannot be changed manually.
          </p>
        </div>
      </div>
    </>
  );
}
