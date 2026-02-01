"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  FileText,
  CreditCard,
  Users,
  Settings,
  X,
} from "lucide-react";

const navItems = [
  {
    label: "Orders",
    href: "/admin/orders",
    icon: FileText,
  },
  {
    label: "Leads",
    href: "/admin/leads",
    icon: Users,
  },
  {
    label: "Billing",
    href: "/admin/billing",
    icon: CreditCard,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

interface AdminNavProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminNav({ isOpen, onClose }: AdminNavProps) {
  const pathname = usePathname();

  const handleNavClick = () => {
    // Close mobile nav when clicking a link
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 border-r border-border bg-card transition-transform duration-200 ease-in-out",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-14 items-center justify-between border-b border-border px-4">
            <Link href="/admin" className="flex items-center gap-2" onClick={handleNavClick}>
              <span className="text-lg font-bold text-foreground">ApplyBetter</span>
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                Admin
              </span>
            </Link>
            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-foreground hover:bg-primary/10 hover:text-primary lg:hidden"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

        </div>
      </aside>
    </>
  );
}
