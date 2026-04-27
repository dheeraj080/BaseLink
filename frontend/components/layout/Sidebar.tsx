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
    <aside className="w-64 bg-onyx border-r border-onyx-400 h-screen sticky top-0 flex flex-col">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-soft-linen rounded-lg flex items-center justify-center font-bold text-onyx shadow-sm ring-1 ring-white-smoke/30">
            B
          </div>
          <span className="text-soft-linen font-bold text-lg tracking-tight">BaseLink</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-8">
        <div>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group text-sm font-medium",
                      isActive 
                        ? "bg-soft-linen/10 text-soft-linen border border-soft-linen/20" 
                        : "text-silver hover:text-soft-linen hover:bg-onyx-100 border border-transparent"
                    )}
                  >
                    <item.icon className={cn(
                      "w-4 h-4",
                      isActive ? "text-soft-linen" : "text-silver/70 group-hover:text-white-smoke"
                    )} />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      <div className="p-4 border-t border-onyx-400 space-y-1">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-silver hover:text-soft-linen hover:bg-onyx-100 transition-all border border-transparent"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-silver hover:text-soft-linen hover:bg-soft-linen/5 transition-all border border-transparent"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      <div className="p-6 border-t border-onyx-400 bg-onyx-100/30">
        <div className="flex items-center gap-3">
          {mounted && user?.image ? (
            <div className="relative w-9 h-9 rounded-full overflow-hidden ring-1 ring-onyx-400 ring-offset-2 ring-offset-onyx">
              <Image src={user.image} alt={user.name || 'User'} fill className="object-cover" referrerPolicy="no-referrer" />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-full bg-onyx-400 flex items-center justify-center border border-onyx-300">
              <UserCircle className="w-5 h-5 text-silver" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-soft-linen truncate leading-none">{mounted ? (user?.name || 'User') : '...'}</p>
            <p className="text-[10px] text-silver mt-1 font-medium truncate">Account Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
