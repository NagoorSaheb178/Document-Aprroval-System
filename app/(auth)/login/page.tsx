"use client";

import { LogIn } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const USERS = [
    { id: 'cm02abcd001', name: 'Alice', role: 'AUTHOR', color: '#2563EB', initials: 'A', email: 'alice@example.com' },
    { id: 'cm02abcd002', name: 'Bob', role: 'REVIEWER', color: '#7C3AED', initials: 'B', email: 'bob@example.com' },
    { id: 'cm02abcd003', name: 'Admin', role: 'ADMIN', color: '#DC2626', initials: 'AD', email: 'admin@example.com' },
    { id: 'cm02abcd004', name: 'Viewer', role: 'VIEWER', color: '#059669', initials: 'V', email: 'viewer@example.com' },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Login failed");
      }
      
      window.location.href = "/";
    } catch (err: any) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  const autofill = (uEmail: string) => {
    setEmail(uEmail);
    setPassword("password123");
  };

  return (
    <div className="login-wrap">
      <div className="login-inner fade-in" style={{ maxWidth: '500px' }}>
        <div className="login-head" style={{ marginBottom: '32px' }}>
          <div className="login-logo">E</div>
          <h1 className="login-title">Elevate</h1>
          <p className="login-sub">Enterprise document approval &amp; workflow management</p>
        </div>
        
        <div className="card card-pad" style={{ marginBottom: '24px' }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--gray-700)', marginBottom: '6px' }}>Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--gray-300)', fontSize: '14px', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--gray-700)', marginBottom: '6px' }}>Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--gray-300)', fontSize: '14px', outline: 'none' }}
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary btn-block" 
              style={{ marginTop: '8px', padding: '12px' }}
              disabled={loading}
            >
              <LogIn className="w-[15px] h-[15px]" /> {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
        
        <div className="seed-label" style={{ marginTop: '32px' }}>Demo Credentials (Click to Autofill)</div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {USERS.map(u => (
            <div 
              key={u.id} 
              onClick={() => autofill(u.email)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#fff', borderRadius: '8px', border: '1px solid var(--gray-200)', cursor: 'pointer', transition: 'border-color 0.2s' }}
              className="hover:border-blue-500"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: u.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
                  {u.initials}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-900)' }}>{u.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{u.email}</div>
                </div>
              </div>
              <span className="role-pill" style={{ background: `${u.color}1A`, color: u.color }}>
                {u.role}
              </span>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
}
