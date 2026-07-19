"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SessionUser } from "@/types";
import { Button } from "@/components/ui/button";
import { LogOut, FileText, CheckCircle, LayoutDashboard, Database, BookOpen } from "lucide-react";
import { toast } from "sonner";

export function Navbar({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      toast.error("Failed to logout");
    }
  };

  const navLinks = [];
  
  if (user.role === "AUTHOR" || user.role === "REVIEWER" || user.role === "ADMIN") {
    navLinks.push({ href: "/", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4 mr-2" /> });
  }

  if (user.role === "AUTHOR" || user.role === "ADMIN") {
    navLinks.push({ href: "/documents", label: "My Documents", icon: <FileText className="w-4 h-4 mr-2" /> });
  }

  if (user.role === "REVIEWER" || user.role === "ADMIN") {
    navLinks.push({ href: "/review", label: "Review Queue", icon: <CheckCircle className="w-4 h-4 mr-2" /> });
  }

  if (user.role === "ADMIN") {
    navLinks.push({ href: "/archive", label: "Archive", icon: <Database className="w-4 h-4 mr-2" /> });
  }

  // Everyone can see published documents
  navLinks.push({ href: "/published", label: "Published Docs", icon: <BookOpen className="w-4 h-4 mr-2" /> });

  return (
    <header className="border-b bg-background sticky top-0 z-10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl tracking-tight">
            Elevate
          </Link>
          <nav className="hidden md:flex gap-1">
            {navLinks.map((link) => (
              <Button
                key={link.href}
                variant={pathname === link.href ? "secondary" : "ghost"}
                asChild
                className="justify-start"
              >
                <Link href={link.href}>
                  {link.icon}
                  {link.label}
                </Link>
              </Button>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-right hidden sm:block">
            <div className="font-medium">{user.name}</div>
            <div className="text-muted-foreground capitalize">{user.role.toLowerCase()}</div>
          </div>
          <Button variant="outline" size="icon" onClick={handleLogout} title="Logout">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
