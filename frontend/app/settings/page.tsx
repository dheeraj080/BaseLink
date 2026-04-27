'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, 
  Settings as SettingsIcon, 
  Key, 
  Bell, 
  Shield, 
  Globe, 
  Database,
  Save,
  Loader2,
  Camera
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

import Image from 'next/image';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [isSaving, setIsSaving] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-soft-linen tracking-tight">Account Settings</h1>
        <p className="text-silver text-sm mt-1">Manage your personal profile, security, and notification preferences.</p>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-10">
        <aside className="w-full md:w-60 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                activeTab === tab.id 
                  ? "bg-onyx-400 text-soft-linen shadow-sm" 
                  : "text-silver hover:text-white-smoke hover:bg-onyx"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
          <div className="pt-6 mt-6 border-t border-onyx-400">
            <p className="text-[10px] font-bold uppercase tracking-widest text-silver/50 px-4 mb-2">Platform</p>
            <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-silver hover:text-white-smoke hover:bg-onyx transition-all rounded-lg">
              <Globe className="w-4 h-4" />
              Integrations
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-silver hover:text-white-smoke hover:bg-onyx transition-all rounded-lg">
              <Database className="w-4 h-4" />
              API Settings
            </button>
          </div>
        </aside>

        <div className="flex-1 bg-onyx border border-onyx-400 rounded-xl shadow-sm p-8">
          {activeTab === 'profile' && (
            <div className="space-y-8">
              <div className="flex items-center gap-8">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-onyx border-2 border-onyx-400 shadow-sm flex items-center justify-center overflow-hidden">
                    {user?.image ? (
                      <div className="relative w-full h-full">
                        <Image src={user.image} alt="" fill className="object-cover" referrerPolicy="no-referrer" />
                      </div>
                    ) : (
                      <User className="w-10 h-10 text-onyx-700" />
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 bg-soft-linen text-onyx rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-soft-linen">{user?.name || 'User Name'}</h3>
                  <p className="text-soft-linen font-semibold px-2 py-0.5 bg-soft-linen/10 border border-soft-linen/20 rounded w-fit mt-1 uppercase tracking-wider">Account Admin</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <Input
                  label="Full Name"
                  defaultValue={user?.name}
                  placeholder="e.g. John Doe"
                />
                <Input
                  label="Email Address"
                  type="email"
                  defaultValue={user?.email}
                  placeholder="e.g. john@example.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-silver uppercase tracking-wider ml-1">Short Bio</label>
                <textarea
                  className="w-full bg-onyx border border-onyx-400 rounded-lg py-3 px-4 focus:ring-1 focus:ring-silver/50 outline-none transition-all resize-none text-soft-linen text-sm placeholder:text-onyx-700"
                  rows={4}
                  placeholder="Tell us a bit about yourself..."
                ></textarea>
              </div>

              <div className="flex justify-end pt-6 border-t border-onyx-400">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  leftIcon={isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-soft-linen flex items-center gap-2">
                  <Key className="w-5 h-5 text-soft-linen" />
                  Change Password
                </h3>
                <div className="space-y-4">
                  <Input label="Current Password" type="password" placeholder="••••••••" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="New Password" type="password" placeholder="••••••••" />
                    <Input label="Confirm New Password" type="password" placeholder="••••••••" />
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-onyx-400 space-y-6">
                <h3 className="text-lg font-bold text-soft-linen flex items-center gap-2">
                  <Shield className="w-5 h-5 text-soft-linen" />
                  Two-Factor Authentication
                </h3>
                <div className="p-5 bg-soft-linen/5 border border-soft-linen/10 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-soft-linen">Extra security layer</p>
                    <p className="text-xs text-silver mt-0.5">Protect your account with a secondary login verification step.</p>
                  </div>
                  <Button variant="secondary" className="bg-soft-linen/10 text-soft-linen border-soft-linen/20 hover:bg-soft-linen/20">
                    Enable 2FA
                  </Button>
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-onyx-400">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  leftIcon={isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                >
                  Update Security
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-soft-linen flex items-center gap-2">
                  <Bell className="w-5 h-5 text-soft-linen" />
                  Email Notifications
                </h3>
                <div className="space-y-3">
                  {[
                    { id: 'sent', label: 'Campaign Delivery', desc: 'Notify me when an email campaign is successfully delivered.' },
                    { id: 'bounces', label: 'High Bounce Warnings', desc: 'Alert me if campaign bounce rates exceed 5%.' },
                    { id: 'weekly', label: 'Weekly Summary', desc: 'Receive a report of your weekly activity and analytics.' }
                  ].map(notify => (
                    <div key={notify.id} className="flex items-center justify-between p-5 bg-onyx-100/50 border border-onyx-400 rounded-xl hover:border-soft-linen/20 transition-all">
                      <div>
                        <p className="text-sm font-bold text-soft-linen">{notify.label}</p>
                        <p className="text-xs text-silver mt-0.5">{notify.desc}</p>
                      </div>
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-10 h-5 bg-onyx-400 rounded-full peer peer-focus:ring-1 peer-focus:ring-silver/50 peer-checked:after:translate-x-full peer-checked:after:border-soft-linen after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-silver after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-soft-linen after:border-onyx-400 peer-checked:after:bg-onyx shadow-inner"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-onyx-400">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  leftIcon={isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                >
                  Save Preferences
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
