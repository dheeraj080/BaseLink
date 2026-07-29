'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users,
  Mail,
  BarChart3,
  Settings,
  LogOut,
  LayoutDashboard,
  FileText,
  UserCircle
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

import Image from 'next/image';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Campaigns', href: '/campaigns', icon: Mail },
  { name: 'Templates', href: '/templates', icon: FileText },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [mounted] = React.useState(() => typeof window !== 'undefined');

  return (
    <aside className="w-64 apple-glass border-r border-white/10 h-screen sticky top-0 flex flex-col z-30 select-none">
      <div className="p-6 pb-2">
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center font-bold text-black shadow-lg shadow-white/10 transition-transform duration-200 group-hover:scale-105 active:scale-95 apple-edge-highlight">
            B
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-lg tracking-tight">BaseLink</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        <div className="space-y-1">
          <ul className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <li key={item.name} className="relative">
                  <Link
                    href={item.href}
                    className={cn(
                      "relative flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl transition-all duration-150 text-sm font-semibold tracking-tight active:scale-[0.97] cursor-pointer z-10",
                      isActive
                        ? "text-black"
                        : "text-text-secondary hover:text-white hover:bg-white/5"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebarActivePill"
                        className="absolute inset-0 bg-white rounded-xl shadow-md z-[-1]"
                        transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
                      />
                    )}
                    <item.icon className={cn(
                      "w-4 h-4 transition-colors",
                      isActive ? "text-black" : "text-text-secondary/60 group-hover:text-white"
                    )} />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      <div className="px-4 py-4 border-t border-white/10 space-y-1">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold tracking-tight transition-all duration-150 active:scale-[0.97]",
            pathname.startsWith('/settings')
              ? "bg-white/10 text-white"
              : "text-text-secondary hover:text-white hover:bg-white/5"
          )}
        >
          <Settings className="w-4 h-4 opacity-60" />
          <span>Settings</span>
        </Link>
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold tracking-tight text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-all duration-150 active:scale-[0.97] cursor-pointer"
        >
          <LogOut className="w-4 h-4 opacity-60" />
          <span>Logout</span>
        </button>
      </div>

      <div className="p-4 border-t border-white/10 apple-glass-bar">
        <div className="flex items-center gap-3">
          {mounted && user?.image ? (
            <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-white/15 shadow-md">
              <Image src={user.image} alt={user.name || 'User'} fill className="object-cover" referrerPolicy="no-referrer" />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/15">
              <UserCircle className="w-5 h-5 text-white/40" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate tracking-tight">{mounted ? (user?.name || 'Demo User') : '...'}</p>
            <p className="text-[11px] font-medium text-text-secondary truncate">{mounted ? (user?.email || 'admin@baselink.io') : ''}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
