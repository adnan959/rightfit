"use client";

import { AdminNav } from "./AdminNav";

interface AdminShellProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}

export function AdminShell({
  children,
  title,
  description,
  actions,
}: AdminShellProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      
      <main className="pl-64">
        {/* Header */}
        {(title || actions) && (
          <div className="border-b border-gray-200 bg-white px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                {title && (
                  <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                )}
                {description && (
                  <p className="mt-1 text-sm text-gray-500">{description}</p>
                )}
              </div>
              {actions && <div className="flex items-center gap-3">{actions}</div>}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
