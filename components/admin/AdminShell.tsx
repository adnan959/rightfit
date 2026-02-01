"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminNav } from "./AdminNav";
import { Button } from "@/components/ui/button";
import { Menu, LogOut } from "lucide-react";

interface AdminShellProps {
  children: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
}

export function AdminShell({
  children,
  title,
  actions,
}: AdminShellProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminNav isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />
      
      {/* Mobile header */}
      <div className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-card px-4 lg:hidden">
        <button
          onClick={() => setIsMobileNavOpen(true)}
          className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/admin" className="flex items-center gap-2">
          <span className="font-bold text-foreground">ApplyBetter</span>
          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
            Admin
          </span>
        </Link>
      </div>
      
      <main className="lg:pl-64">
        {/* Header - aligned with sidebar logo height (h-14) */}
        <div className="flex h-14 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
          {title && (
            <h1 className="text-lg font-bold text-foreground">{title}</h1>
          )}
          {!title && <div />}
          <div className="flex items-center gap-2">
            {actions}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
}
