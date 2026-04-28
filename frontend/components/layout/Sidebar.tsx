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
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const mount = async () => {
      setMounted(true);
    };
    mount();
  }, []);

  return (
    <aside className="w-64 bg-surface-primary border-r border-border-color h-screen sticky top-0 flex flex-col">
      <div className="p-8">
        <Link href="/" className="flex items-center gap-4 group">
          <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center font-black text-bg-primary shadow-2xl transition-all group-hover:scale-105">
            B
          </div>
          <div className="flex flex-col">
            <span className="text-white font-black text-xl tracking-tighter leading-none">BaseLink</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-6 py-10 space-y-12">
        <div className="space-y-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group text-sm font-bold tracking-tight",
                      isActive 
                        ? "bg-white text-bg-primary shadow-2xl shadow-white/5" 
                        : "text-text-secondary hover:text-white hover:bg-white/5"
                    )}
                  >
                    <item.icon className={cn(
                      "w-5 h-5",
                      isActive ? "text-bg-primary" : "text-text-secondary/40 group-hover:text-white"
                    )} />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      <div className="px-6 py-6 border-t border-border-color space-y-2">
        <Link
          href="/settings"
          className="flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold tracking-tight text-text-secondary hover:text-white hover:bg-white/5 transition-all"
        >
          <Settings className="w-5 h-5 opacity-40 group-hover:opacity-100" />
          Settings
        </Link>
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold tracking-tight text-text-secondary hover:text-white hover:bg-white/5 transition-all"
        >
          <LogOut className="w-5 h-5 opacity-40 group-hover:opacity-100" />
          Logout
        </button>
      </div>

      <div className="p-8 border-t border-border-color bg-surface-primary/30">
        <div className="flex items-center gap-4">
          {mounted && user?.image ? (
            <div className="relative w-10 h-10 rounded-2xl overflow-hidden border border-border-color shadow-xl">
              <Image src={user.image} alt={user.name || 'User'} fill className="object-cover grayscale hover:grayscale-0 transition-all duration-700" referrerPolicy="no-referrer" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-bg-primary flex items-center justify-center border border-border-color">
              <UserCircle className="w-6 h-6 text-text-secondary/30" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate tracking-tight">{mounted ? (user?.name || 'ROOT_USER') : '...'}</p>
            <p className="text-[10px] text-text-secondary mt-1 font-bold uppercase tracking-[0.2em] leading-none opacity-40">Protocol Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
