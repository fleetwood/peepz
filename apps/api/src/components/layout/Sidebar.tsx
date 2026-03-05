"use client";

import { clientEnv } from "@peeps/config/env";
import { BarChart, Heart, Home, Users, LucideAppWindow } from "lucide-react";
import { useLayout } from "@/context/LayoutProvider";
import UserSidebar from "../user/UserSidebar";
import PeepsLogo from "./Logo";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const { isWarmTheme, navigate, pathname, setDialog } = useLayout();

  const navItems = [
    { icon: Home, label: "Home", page: "/", onClick: () => navigate("/") },
    { icon: Users, label: "Family", page: "/family", onClick: () => navigate("/family/123") },
    { icon: Heart, label: "Memories", page: "/memories", onClick: () => navigate("/memories") },
    ...(clientEnv.isDev
      ? [
        { icon: BarChart, label: "Theme", page: "/theme", onClick: () => navigate("/theme") },
        { icon: LucideAppWindow, label: "Dialog", onclick: () => setDialog({ title: "Dialog Title", children: <div>Dialog Content</div> }) }
      ]
      : []),
  ];

  return (
    <aside className="w-20 md:w-64 h-full flex flex-col flex-shrink-0">
      <div className="p-4 md:p-6 flex items-center justify-center md:justify-start">
        <PeepsLogo s32 className="h-8 w-8" />
        <h2 className={cn(
          `hidden md:block font-extrabold tracking-tight`,
          isWarmTheme ? "text-gradient-yellow-orange" : "text-gradient-orange-yellow"
        )}>
          EEPS
        </h2>
      </div>

      <div className="p-4">
        <UserSidebar />
      </div>

      <nav className="flex-1 p-3">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.page && item.page.includes(pathname);
            return (
              <li key={item.label}>
                <button
                  className={cn(
                    `w-full flex items-center justify-center md:justify-start gap-4 px-4 py-3 rounded-lg transition-ease-200`,
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-primary hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={item.onClick}
                >
                  <Icon className="w-6 h-6" />
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

Sidebar.displayName = "Sidebar";
export default Sidebar;
