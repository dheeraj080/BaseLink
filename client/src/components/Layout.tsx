import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Calendar, Settings, LogOut, Mail } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

export default function Layout() {
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Contacts", path: "/contacts", icon: Users },
    { name: "Scheduler", path: "/scheduler", icon: Calendar },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-brand-50 dark:bg-brand-950">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-brand-950 border-r border-brand-100 dark:border-brand-800 flex flex-col">
        <div className="h-16 flex items-center justify-between px-6 border-b border-brand-100 dark:border-brand-800">
          <div className="flex items-center">
            <Mail className="h-6 w-6 text-brand-900 dark:text-brand-50 mr-2" />
            <span className="text-lg font-semibold tracking-tight">BaseLink</span>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-brand-50 text-brand-900 dark:bg-brand-900 dark:text-brand-50"
                    : "text-gray-600 dark:text-gray-400 hover:bg-brand-50 dark:hover:bg-brand-900 hover:text-brand-900 dark:hover:text-brand-50"
                )}
              >
                <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-brand-900 dark:text-brand-50" : "text-gray-400 dark:text-gray-500")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-brand-100 dark:border-brand-800 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 rounded-md hover:bg-brand-50 dark:hover:bg-brand-900 hover:text-brand-900 dark:hover:text-brand-50 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
            Sign out
          </Link>
          <ThemeToggle />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
