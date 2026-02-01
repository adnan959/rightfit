"use client";

import { AdminNav } from "./AdminNav";

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
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      
      <main className="pl-64">
        {/* Header */}
        {(title || actions) && (
          <div className="border-b border-gray-200 bg-white px-8 py-4">
            <div className="flex items-center justify-between">
              {title && (
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              )}
              {actions && <div className="flex items-center gap-3">{actions}</div>}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
