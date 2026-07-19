"use client";

import { LogIn } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);



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
        

        
      </div>
    </div>
  );
}
