"use client";

import { Menu, Search, Bell, ChevronDown } from "lucide-react";
import { SessionUser } from "@/types";
import { useSearch } from "./SearchContext";

interface Props {
  user: SessionUser;
}

export function Topbar({ user }: Props) {
  const { search, setSearch } = useSearch();

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
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button 
          className="icon-btn mobile-toggle"
          onClick={() => {
            if (typeof document !== 'undefined') {
              document.body.classList.toggle('sidebar-open');
            }
          }}
        >
          <Menu className="w-[18px] h-[18px]" />
        </button>
        <div className="search-box hidden sm:flex">
          <Search className="w-[15px] h-[15px]" />
          <input 
            type="text" 
            placeholder="Search documents..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      
      <div className="topbar-right">
        <button className="icon-btn relative">
          <Bell className="w-[18px] h-[18px]" />
          <span className="notif-dot"></span>
        </button>
        
        <div style={{ width: '1px', height: '22px', background: 'var(--gray-200)' }}></div>
        
        <button className="avatar-btn">
          <div className="avatar" style={{ width: '30px', height: '30px', background: color, fontSize: '11px' }}>
            {getInitials(user.name)}
          </div>
          <ChevronDown style={{ width: '14px', height: '14px', color: 'var(--gray-400)' }} />
        </button>
      </div>
    </header>
  );
}
