"use client";

import { cn } from "@/lib/utils";

export interface Tab {
  id: string;
  label: string;
}

interface AdminTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function AdminTabs({
  tabs,
  activeTab,
  onTabChange,
  className,
}: AdminTabsProps) {
  return (
    <div className={cn("mb-6 border-b border-gray-200", className)}>
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "border-b-2 py-4 px-1 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "border-coral-500 text-coral-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
