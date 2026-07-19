"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, FileEdit, Send, ListChecks, 
  Globe, Archive, History, Settings, LogOut 
} from "lucide-react";
import { SessionUser } from "@/types";
import { useRouter } from "next/navigation";

interface Props {
  user: SessionUser;
}

export function Sidebar({ user }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const NAV_ITEMS = [
    { key: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['AUTHOR', 'REVIEWER', 'ADMIN', 'VIEWER'] },
    { key: '/drafts', label: 'My Drafts', icon: FileEdit, roles: ['AUTHOR', 'ADMIN'] },
    { key: '/submitted', label: 'Submitted', icon: Send, roles: ['AUTHOR', 'ADMIN'] },
    { key: '/review', label: 'Review Queue', icon: ListChecks, roles: ['REVIEWER', 'ADMIN'] },
    { key: '/published', label: 'Published', icon: Globe, roles: ['AUTHOR', 'REVIEWER', 'ADMIN', 'VIEWER'] },
    { key: '/archive', label: 'Archive', icon: Archive, roles: ['AUTHOR', 'REVIEWER', 'ADMIN'] },
    { key: '/audit', label: 'Audit History', icon: History, roles: ['AUTHOR', 'REVIEWER', 'ADMIN'] },
    { key: '/settings', label: 'Settings', icon: Settings, roles: ['AUTHOR', 'REVIEWER', 'ADMIN', 'VIEWER'] },
  ];

  const visibleNav = NAV_ITEMS.filter(n => n.roles.includes(user.role));

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const roleColors: Record<string, string> = {
    AUTHOR: '#2563EB',
    REVIEWER: '#7C3AED',
    ADMIN: '#DC2626',
    VIEWER: '#059669'
  };
  const color = roleColors[user.role] || '#6b7280';

  return (
    <>
      <div 
        className="sidebar-overlay" 
        onClick={() => {
          if (typeof document !== 'undefined') {
            document.body.classList.remove('sidebar-open');
          }
        }}
      ></div>
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">D</div>
          <div className="logo-text">Elevate</div>
        </div>
        <nav className="sidebar-nav">
          {visibleNav.map((n) => (
            <Link 
              key={n.key} 
              href={n.key}
              className={`nav-item ${pathname === n.key ? 'active' : ''}`}
              onClick={() => {
                if (typeof document !== 'undefined') {
                  document.body.classList.remove('sidebar-open');
                }
              }}
            >
              <n.icon className="w-[17px] h-[17px] shrink-0" />
              <span>{n.label}</span>
            </Link>
          ))}
          <div className="divider" style={{ margin: '10px 4px' }}></div>
          <button 
            onClick={handleLogout}
            className="nav-item w-full text-left"
          >
            <LogOut className="w-[17px] h-[17px] shrink-0" />
            <span>Logout</span>
          </button>
        </nav>
        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '10px', background: 'var(--gray-50)' }}>
            <div className="avatar" style={{ width: '32px', height: '32px', background: color, fontSize: '12px' }}>
              {getInitials(user.name)}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--gray-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--gray-500)', textTransform: 'capitalize' }}>
                {user.role.toLowerCase()}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
