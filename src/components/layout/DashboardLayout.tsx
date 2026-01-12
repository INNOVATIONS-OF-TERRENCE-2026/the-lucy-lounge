// src/components/layout/DashboardLayout.tsx

import { Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  role: "patient" | "family" | "provider" | "admin";
  className?: string;
}

export function DashboardLayout({ role, className }: DashboardLayoutProps) {
  return (
    <div className={cn("min-h-screen flex bg-background", className)}>
      {/* Sidebar placeholder (role-based later) */}
      <aside className="w-64 border-r border-border hidden lg:block">
        <div className="p-6 font-bold text-lg">
          {role.toUpperCase()} PORTAL
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
