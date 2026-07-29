'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { emailService } from '@/services/email.service';
import {
  Send,
  Mail,
  ShieldCheck,
  Users,
  BarChart2,
  Lock,
  CheckCircle2,
  ChevronRight,
  Search,
  Activity,
  Sliders,
  X,
  ArrowRight,
  ArrowUpRight,
  Github,
  FileText,
  Radio,
  Workflow
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function BaseLinkLandingPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'dispatches' | 'logs' | 'templates'>('overview');
  const [emailLogs, setEmailLogs] = useState([
    { id: '1', recipient: 'alex@company.com', subject: 'Welcome to BaseLink Cloud', status: 'DELIVERED', time: '12s ago', spf: true, dkim: true },
    { id: '2', recipient: 'sarah@startup.io', subject: 'Your magic link login token #9204', status: 'DELIVERED', time: '45s ago', spf: true, dkim: true },
    { id: '3', recipient: 'devops@enterprise.org', subject: 'Monthly usage summary report', status: 'DELIVERED', time: '2m ago', spf: true, dkim: true },
  ]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    emailService.getLogs().then((logs) => {
      if (Array.isArray(logs) && logs.length > 0) {
        const formatted = logs.slice(0, 5).map((l, i) => ({
          id: String(l.id || i),
          recipient: l.recipient,
          subject: l.subject,
          status: (l.status || 'SENT').toUpperCase(),
          time: l.sentAt ? new Date(l.sentAt).toLocaleTimeString() : 'Just now',
          spf: true,
          dkim: true,
        }));
        setEmailLogs(formatted);
      }
    }).catch(() => {
      // Keep initial fallback if unauthenticated
    });
  }, []);

  // 42 Capabilities Data grouped into 7 Core Pillars (Focused on Email & Communication)
  const capabilitiesData = [
    {
      pillarId: '01',
      title: 'Dispatch & API',
      icon: Send,
      items: [
        { name: 'REST API & SDKs', desc: 'Sub-50ms dispatch latency via HTTP REST endpoint or official client libraries.' },
        { name: 'SMTP Gateway', desc: 'Drop-in SMTP relay support for legacy backends, WordPress, and frameworks.' },
        { name: 'Dynamic Templating', desc: 'Pass custom JSON payloads with variable substitution and conditional logic.' },
        { name: 'Batch Sending', desc: 'Dispatch up to 100,000 emails per request with background queuing.' },
        { name: 'Scheduled Triggers', desc: 'Schedule dispatches for exact timestamps or subscriber timezones.' },
        { name: 'Automatic Retries', desc: 'Intelligent exponential backoff retries for transient destination failures.' }
      ]
    },
    {
      pillarId: '02',
      title: 'Deliverability & DNS',
      icon: ShieldCheck,
      items: [
        { name: 'Automated SPF & DKIM', desc: 'Instant DNS verification and automated DKIM key signing per domain.' },
        { name: 'DMARC Compliance', desc: 'Built-in DMARC alignment monitoring and alignment reports.' },
        { name: 'Dedicated IP Pools', desc: 'Isolated IP addresses with automated reputation warming strategies.' },
        { name: 'Bounce Management', desc: 'Automatic hard & soft bounce parsing with instant address suppression.' },
        { name: 'Spam Score Checks', desc: 'Pre-flight email content analysis to prevent spam filter triggers.' },
        { name: 'Custom Return-Path', desc: 'Branded return-path subdomains for 100% white-labeled delivery.' }
      ]
    },
    {
      pillarId: '03',
      title: 'Templates & Content',
      icon: FileText,
      items: [
        { name: 'Visual Drag & Drop', desc: 'Create responsive email designs without touching HTML code.' },
        { name: 'Raw HTML Editor', desc: 'Full code editor with live split-screen preview and asset hosting.' },
        { name: 'Dynamic Personalization', desc: 'Handle Liquid tags, fallback strings, and nested arrays.' },
        { name: 'Device Previews', desc: 'Inspect rendering across desktop, tablet, and mobile clients.' },
        { name: 'Version History', desc: 'Track template revisions with one-click restore and diff comparison.' },
        { name: 'Test Dispatches', desc: 'Send real test emails to team members before publishing live.' }
      ]
    },
    {
      pillarId: '04',
      title: 'Analytics & Tracking',
      icon: BarChart2,
      items: [
        { name: 'Real-time Open Rates', desc: 'Privacy-focused tracking pixels with bot detection filtering.' },
        { name: 'Click-Through Insights', desc: 'Link click tracking, heatmaps, and top URL performance charts.' },
        { name: '7-Day Trend Charts', desc: 'Visual trendlines and volume growth metrics across dispatch channels.' },
        { name: 'Unsubscribe Tracking', desc: 'One-click unsubscribe links compliant with RFC 8058 headers.' },
        { name: 'Geo & Client Data', desc: 'Anonymized geographic distribution and email client breakdown.' },
        { name: 'Exportable Metrics', desc: 'Download CSV reports or stream analytics directly via REST API.' }
      ]
    },
    {
      pillarId: '05',
      title: 'Audience & Contacts',
      icon: Users,
      items: [
        { name: 'Contact Lists', desc: 'Organize subscribers into static lists or dynamic rule-based segments.' },
        { name: 'Custom Attributes', desc: 'Store arbitrary metadata key-values per contact for hyper-targeting.' },
        { name: 'Bulk CSV Import', desc: 'Import hundreds of thousands of contacts with automated deduplication.' },
        { name: 'Global Suppressions', desc: 'Automated suppression list preventing sends to complained or bounced emails.' },
        { name: 'Contact Timelines', desc: 'View complete activity histories and delivery logs per recipient.' },
        { name: 'GDPR Data Cleanup', desc: 'One-click right-to-be-forgotten contact purge tools.' }
      ]
    },
    {
      pillarId: '06',
      title: 'Security & Webhooks',
      icon: Lock,
      items: [
        { name: 'Scoped API Keys', desc: 'Granular permissions restricting keys by domain, function, or IP.' },
        { name: 'Real-time Webhooks', desc: 'HTTP POST notifications for delivered, opened, clicked, and bounced events.' },
        { name: 'TLS Encryption', desc: 'Enforced TLS 1.3 in-transit encryption for all outbound mail relays.' },
        { name: 'Rate Limiting', desc: 'Configurable rate limits to protect sending reputation and budget.' },
        { name: 'Audit Logging', desc: 'Detailed log of all API key creations, domain edits, and template changes.' },
        { name: 'IP Whitelisting', desc: 'Restrict API access exclusively to your application server IP addresses.' }
      ]
    },
    {
      pillarId: '07',
      title: 'Workspaces & Teams',
      icon: Workflow,
      items: [
        { name: 'Multi-Tenant Workspaces', desc: 'Separate environments for production, staging, and client accounts.' },
        { name: 'Role-Based Access', desc: 'Assign Owner, Admin, Developer, or Analyst roles per workspace.' },
        { name: 'Shared Domain Pools', desc: 'Configure domains once and share them across authorized projects.' },
        { name: 'Team Invitations', desc: 'Invite team members via email with expiring invitation tokens.' },
        { name: 'Usage Quotas', desc: 'Set dispatch thresholds and receive threshold alert notifications.' },
        { name: 'Compliance Retention', desc: 'Configurable log retention policies suitable for SOC 2 compliance.' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 font-sans selection:bg-white/20 selection:text-white relative overflow-x-hidden">
      
      {/* Background Lighting Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute top-[1200px] left-0 w-[500px] h-[500px] bg-blue-500/5 blur-[160px] pointer-events-none" />
      <div className="absolute top-[2800px] right-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[180px] pointer-events-none" />

      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#090a0f]/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-full border border-white/20 bg-white/5 flex items-center justify-center group-hover:border-white/40 transition-colors">
              <Mail className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">BaseLink</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#capabilities" className="hover:text-white transition-colors">Capabilities</a>
            <a href="#comparison" className="hover:text-white transition-colors">Comparison</a>
          </nav>

          <div className="flex items-center gap-4">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer" 
              className="p-2 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white transition-colors"
              title="GitHub Repository"
            >
              <Github className="w-5 h-5" />
            </a>
            <Link 
              href="/auth/login" 
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Log In
            </Link>
            <Link 
              href="/auth/register" 
              className="h-9 px-4 rounded-full bg-white text-black font-semibold text-xs flex items-center gap-1.5 hover:bg-slate-200 transition-all shadow-lg active:scale-95"
            >
              Start Free <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="pt-20 pb-24 px-6 max-w-7xl mx-auto text-center relative z-10">
        {/* Main Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight text-white mb-6 leading-[1.05]"
        >
          Send emails at lightspeed.<br />
          <span className="font-serif italic font-normal text-slate-300">Own your deliverability.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 font-normal leading-relaxed text-balance"
        >
          High-deliverability transactional mail, automated campaigns, and real-time analytics. Built for modern apps with sub-50ms REST API and SMTP support.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link 
            href="/auth/register"
            className="w-full sm:w-auto h-12 px-8 rounded-full bg-white text-black font-semibold text-sm flex items-center justify-center gap-2 hover:bg-slate-200 transition-all shadow-xl hover:scale-[1.02] active:scale-95"
          >
            Start Free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link 
            href="/auth/login"
            className="w-full sm:w-auto h-12 px-8 rounded-full bg-white/5 border border-white/10 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-white/10 hover:border-white/20 transition-all"
          >
            View Live Dashboard <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </Link>
        </motion.div>

        {/* Interactive App Dashboard Mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-6 rounded-3xl border border-white/15 bg-[#0f1118]/90 p-3 sm:p-4 shadow-2xl shadow-black/80 max-w-6xl mx-auto text-left relative overflow-hidden backdrop-blur-xl"
        >
          {/* Mac Window Header */}
          <div className="flex items-center justify-between pb-3 px-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
              {(['overview', 'dispatches', 'logs', 'templates'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-3 py-1 rounded-lg font-medium capitalize transition-all cursor-pointer",
                    activeTab === tab ? "bg-white/10 text-white shadow-sm font-semibold" : "text-slate-400 hover:text-white"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[11px] text-slate-300">mail-relay-us-east</span>
            </div>
          </div>

          {/* App Window Body */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-4">
            {/* Sidebar */}
            <div className="md:col-span-3 space-y-3 border-r border-white/10 pr-3 hidden md:block">
              <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs text-white font-medium">
                <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-indigo-400" /> mail.company.com</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">Verified</span>
              </div>

              <div className="space-y-1 text-xs">
                <button 
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={cn(
                    "w-full px-3 py-1.5 rounded-lg flex items-center justify-between text-left transition-colors cursor-pointer",
                    activeTab === 'overview' ? "bg-white/10 text-white font-semibold" : "text-slate-400 hover:text-white"
                  )}
                >
                  <span className="flex items-center gap-2"><Send className="w-3.5 h-3.5" /> Overview</span>
                </button>

                <button 
                  type="button"
                  onClick={() => setActiveTab('dispatches')}
                  className={cn(
                    "w-full px-3 py-1.5 rounded-lg flex items-center justify-between text-left transition-colors cursor-pointer",
                    activeTab === 'dispatches' ? "bg-white/10 text-white font-semibold" : "text-slate-400 hover:text-white"
                  )}
                >
                  <span className="flex items-center gap-2"><Activity className="w-3.5 h-3.5" /> Dispatches</span>
                  <span className="text-[10px] bg-white/20 px-1.5 rounded font-mono">24.8k</span>
                </button>

                <Link href="/contacts" className="px-3 py-1.5 text-slate-400 hover:text-white flex items-center justify-between transition-colors rounded-lg hover:bg-white/5">
                  <span className="flex items-center gap-2"><Users className="w-3.5 h-3.5" /> Contacts</span>
                  <span className="text-[10px] font-mono">12.4k</span>
                </Link>

                <Link href="/analytics" className="px-3 py-1.5 text-slate-400 hover:text-white flex items-center justify-between transition-colors rounded-lg hover:bg-white/5">
                  <span className="flex items-center gap-2"><BarChart2 className="w-3.5 h-3.5" /> Analytics</span>
                </Link>

                <Link href="/settings/email" className="px-3 py-1.5 text-slate-400 hover:text-white flex items-center justify-between transition-colors rounded-lg hover:bg-white/5">
                  <span className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5" /> Domain DNS</span>
                </Link>

                <Link href="/settings" className="px-3 py-1.5 text-slate-400 hover:text-white flex items-center justify-between transition-colors rounded-lg hover:bg-white/5">
                  <span className="flex items-center gap-2"><Sliders className="w-3.5 h-3.5" /> API Keys</span>
                </Link>
              </div>
            </div>

            {/* Main Interface Content */}
            <div className="md:col-span-9 space-y-4">
              {activeTab === 'overview' && (
                <>
                  {/* Header Status Card */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">Production Sending Pipeline</h3>
                        <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">Healthy</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 font-mono">SPF: PASS · DKIM: PASS · DMARC: PASS · Sub-40ms latency</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href="/campaigns" className="px-3 py-1.5 rounded-lg bg-white text-black hover:bg-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all">
                        Send Email <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                  {/* Dynamic Content view */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
                      <span className="text-[11px] font-medium text-slate-400">Total Sent (7 Days)</span>
                      <div className="text-xl font-bold text-white mt-1">24,812</div>
                      <span className="text-[10px] text-emerald-400 font-mono">+18.4% growth</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
                      <span className="text-[11px] font-medium text-slate-400">Avg Open Rate</span>
                      <div className="text-xl font-bold text-white mt-1">64.2%</div>
                      <span className="text-[10px] text-emerald-400 font-mono">Top deliverability</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
                      <span className="text-[11px] font-medium text-slate-400">Click-Through Rate</span>
                      <div className="text-xl font-bold text-white mt-1">28.9%</div>
                      <span className="text-[10px] text-indigo-400 font-mono">RFC 8058 compliant</span>
                    </div>
                  </div>

                  {/* Terminal / Live Dispatch Logs Preview */}
                  <div className="p-4 rounded-2xl bg-black/60 border border-white/10 font-mono text-xs text-slate-300 space-y-1.5 overflow-x-auto">
                    <div className="text-slate-500 text-[11px] font-semibold border-b border-white/10 pb-2 mb-2 flex items-center justify-between">
                      <span>LIVE TRANSACTIONAL DISPATCH STREAM · BASELINK ENGINE</span>
                      <span className="text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> STREAMING</span>
                    </div>
                    <p><span className="text-indigo-400">[10:14:02]</span> REST API POST /v1/email/send <span className="text-emerald-400">200 OK (22ms)</span></p>
                    <p><span className="text-indigo-400">[10:14:04]</span> SPF & DKIM signature attached for target.dev...</p>
                    <p><span className="text-indigo-400">[10:14:08]</span> Handshake TLS 1.3 completed · Delivered to user@target.dev</p>
                    <p><span className="text-emerald-400">[10:14:12]</span> Webhook dispatched: event=email.delivered</p>
                  </div>
                </>
              )}

              {activeTab === 'dispatches' && (
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">Recent Dispatches</h3>
                      <p className="text-xs text-slate-400">Real-time status of transactional emails sent via REST API & SMTP.</p>
                    </div>
                    <Link
                      href="/campaigns"
                      className="px-3 py-1.5 rounded-lg bg-white text-black hover:bg-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Compose Email
                    </Link>
                  </div>

                  <div className="space-y-2 font-mono text-xs">
                    {emailLogs.map((log) => (
                      <div key={log.id} className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <div>
                            <span className="text-white font-semibold">{log.recipient}</span>
                            <span className="text-slate-400 text-[11px] block">{log.subject}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{log.status}</span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">{log.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'logs' && (
                <div className="p-4 rounded-2xl bg-black/70 border border-white/10 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-slate-400 text-[11px] font-bold">EVENT LOG AUDIT TRAIL</span>
                    <span className="text-emerald-400 text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded">TLS 1.3 ENCRYPTED</span>
                  </div>
                  <div className="space-y-2 text-slate-300">
                    <p><span className="text-indigo-400">[10:14:15]</span> EVENT <span className="text-emerald-400">email.delivered</span> id=msg_89234 status=200</p>
                    <p><span className="text-indigo-400">[10:14:12]</span> DKIM signature algorithm rsa-sha256 verified for domain.com</p>
                    <p><span className="text-indigo-400">[10:13:58]</span> API AUTH key_id=pk_live_829314 client_ip=192.168.1.1</p>
                    <p><span className="text-indigo-400">[10:13:42]</span> EVENT <span className="text-indigo-300">email.opened</span> recipient=alex@company.com client=AppleMail</p>
                  </div>
                </div>
              )}

              {activeTab === 'templates' && (
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Dynamic Templates</h3>
                    <Link href="/templates" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                      Manage Templates <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { name: 'Magic Link Auth', slug: 'auth-magic-link', desc: 'Secure one-time login links with 15-minute token expiry.' },
                      { name: 'Password Reset', slug: 'account-reset-password', desc: 'Branded reset password flow with safety warnings.' },
                      { name: 'Purchase Receipt', slug: 'billing-invoice-receipt', desc: 'Itemized receipt breakdown with VAT and transaction ID.' },
                      { name: 'Welcome Onboarding', slug: 'welcome-series-v1', desc: 'High-converting onboarding greeting email.' }
                    ].map((tpl) => (
                      <div key={tpl.slug} className="p-3 rounded-xl bg-black/40 border border-white/10 hover:border-white/20 transition-all">
                        <div className="font-bold text-white mb-0.5">{tpl.name}</div>
                        <div className="font-mono text-[10px] text-indigo-400 mb-1">{tpl.slug}</div>
                        <div className="text-slate-400 text-[11px]">{tpl.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* 3. CORE PLATFORM GRID ("Everything between your app and the inbox") */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-[11px] font-bold text-indigo-400 tracking-[0.3em] uppercase mb-3">PLATFORM</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Everything between your app and the inbox
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            We handle the DNS validation, DKIM signing, deliverability, and rate limits. You build your product.
          </p>
        </div>

        {/* 6 Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              num: '01',
              badge: 'DISPATCH',
              title: 'REST API & SMTP',
              desc: 'Send transactional emails via HTTP REST endpoints or standard SMTP with sub-50ms dispatch latency.',
              icon: Send,
            },
            {
              num: '02',
              badge: 'DELIVERABILITY',
              title: '100% SPF & DKIM',
              desc: 'Automated DNS key signing, DMARC alignment, and dedicated IP pools for inbox placement.',
              icon: ShieldCheck,
            },
            {
              num: '03',
              badge: 'AUDIENCE',
              title: 'Contact Lists',
              desc: 'Segment subscribers, tag contacts, store custom metadata, and manage automatic suppressions.',
              icon: Users,
            },
            {
              num: '04',
              badge: 'CAMPAIGNS',
              title: 'Visual Templates',
              desc: 'Design responsive HTML templates with code or drag-and-drop. Preview across mobile and desktop.',
              icon: FileText,
            },
            {
              num: '05',
              badge: 'ANALYTICS',
              title: 'Real-time Metrics',
              desc: 'Track opens, clicks, unsubscribes, bounces, and 7-day performance growth with zero delay.',
              icon: BarChart2,
            },
            {
              num: '06',
              badge: 'WEBHOOKS',
              title: 'Live Event Streams',
              desc: 'Instant HTTP webhooks for delivered, opened, clicked, bounced, and failed email events.',
              icon: Radio,
            },
          ].map((item, idx) => (
            <motion.div
              key={item.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="text-2xl font-bold font-mono text-slate-500 group-hover:text-slate-300 transition-colors">
                    {item.num}
                  </span>
                  <span className="text-[10px] font-bold tracking-[0.2em] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full uppercase">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight mb-3 group-hover:text-indigo-200 transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500 group-hover:text-slate-300 transition-colors">
                <span>Enterprise grade</span>
                <item.icon className="w-4 h-4" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. HOW IT WORKS TIMELINE */}
      <section id="how-it-works" className="py-24 px-6 max-w-5xl mx-auto border-t border-white/10">
        <div className="text-center mb-16">
          <p className="text-[11px] font-bold text-slate-500 tracking-[0.3em] uppercase mb-3">HOW IT WORKS</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            From API call to primary inbox in under 2 seconds.
          </h2>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
            Zero deliverability guesswork. Here’s how BaseLink ensures every transactional mail arrives on target.
          </p>
        </div>

        {/* Vertical Stepper Timeline */}
        <div className="space-y-8 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-white/10">
          {[
            {
              step: '01',
              title: 'Verify Sending Domain',
              desc: 'Add your domain name and copy the 1-click SPF, DKIM, and DMARC DNS records into your provider. Instant verification.'
            },
            {
              step: '02',
              title: 'Integrate API or SMTP',
              desc: 'Pass your API key or SMTP credentials to your app. Our REST API SDK supports Node.js, Python, Go, PHP, and cURL.'
            },
            {
              step: '03',
              title: 'Design or Pass Payload',
              desc: 'Use dynamic HTML templates or supply clean JSON payloads for personalized password resets, receipts, or login links.'
            },
            {
              step: '04',
              title: 'Dispatch & Sign',
              desc: 'BaseLink validates content, attaches DKIM signatures, routes via optimized IP relays, and delivers with enforced TLS 1.3.'
            },
            {
              step: '05',
              title: 'Track & Webhook',
              desc: 'Monitor real-time open rates, click tracking, bounce logs, and receive instant HTTP webhooks for every event.'
            }
          ].map((item, idx) => (
            <motion.div 
              key={item.step}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="relative pl-16 group"
            >
              <div className="absolute left-0 top-0 w-12 h-12 rounded-full bg-[#090a0f] border border-white/20 text-white font-mono text-sm font-bold flex items-center justify-center group-hover:border-white transition-colors z-10 shadow-lg">
                {item.step}
              </div>
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 group-hover:border-white/20 transition-all">
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. FORTY-TWO CAPABILITIES MATRIX */}
      <section id="capabilities" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-[11px] font-bold text-indigo-400 tracking-[0.3em] uppercase mb-3">THE FULL PLATFORM</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Forty-two email capabilities, one engine.
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Everything you need for transactional dispatch, campaigns, analytics, and deliverability.
          </p>

          {/* Quick Search for Capabilities */}
          <div className="mt-8 relative max-w-md mx-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search all 42 capabilities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-11 pr-4 rounded-full bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white/30"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Matrix Grid */}
        <div className="space-y-12">
          {capabilitiesData.map((pillar) => {
            const filteredItems = pillar.items.filter(item => 
              item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
              item.desc.toLowerCase().includes(searchTerm.toLowerCase())
            );

            if (searchTerm && filteredItems.length === 0) return null;

            return (
              <div key={pillar.pillarId} className="p-8 rounded-3xl bg-white/[0.015] border border-white/10">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                  <span className="text-xl font-mono font-bold text-slate-500">{pillar.pillarId}</span>
                  <pillar.icon className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-xl font-bold text-white">{pillar.title}</h3>
                  <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-full font-mono ml-auto">6 Capabilities</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map((cap) => (
                    <div key={cap.name} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all hover:bg-white/[0.04]">
                      <div className="flex items-center gap-2 mb-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <h4 className="text-sm font-bold text-white">{cap.name}</h4>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed pl-5.5">{cap.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. COMPARISON TABLE */}
      <section id="comparison" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-[11px] font-bold text-slate-500 tracking-[0.3em] uppercase mb-3">COMPARED TO ALTERNATIVES</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Built for developers who value deliverability.
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Compare BaseLink against legacy transactional mail vendors and marketing software.
          </p>
        </div>

        {/* Comparison Matrix Table */}
        <div className="overflow-x-auto rounded-3xl border border-white/10 bg-white/[0.01]">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03]">
                <th className="p-5 font-bold text-slate-400 uppercase tracking-wider text-[11px]">FEATURE</th>
                <th className="p-5 font-bold text-white uppercase tracking-wider text-[11px] bg-indigo-500/10 border-x border-indigo-500/20">
                  <span className="flex items-center gap-2 text-indigo-300">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" /> BASELINK
                  </span>
                </th>
                <th className="p-5 font-bold text-slate-400 uppercase tracking-wider text-[11px]">LEGACY SENDGRID / MAILCHIMP</th>
                <th className="p-5 font-bold text-slate-400 uppercase tracking-wider text-[11px]">AWS SES / RAW SMTP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {[
                {
                  feature: 'API Dispatch Latency',
                  baselink: 'Sub-50ms HTTP REST API',
                  legacy: '200ms–800ms API latency',
                  aws: 'Fast API, complex credentials'
                },
                {
                  feature: 'DNS Setup & SPF/DKIM',
                  baselink: 'Automated 1-click verification',
                  legacy: 'Manual CNAME / TXT entry',
                  aws: 'Manual IAM & route53 policy rules'
                },
                {
                  feature: 'Visual & Code Templates',
                  baselink: 'Built-in drag-and-drop & HTML editor',
                  legacy: 'Complex paid add-on module',
                  aws: 'None — raw HTML code only'
                },
                {
                  feature: 'Audience & Segments',
                  baselink: 'Built-in lists & custom contact metadata',
                  legacy: 'Expensive per-contact tier bumps',
                  aws: 'None — requires third party tool'
                },
                {
                  feature: 'Deliverability & 7-Day Growth',
                  baselink: 'Real-time analytics & trend indicators',
                  legacy: 'Delayed 24-hour aggregate charts',
                  aws: 'Raw CloudWatch log metrics'
                }
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-5 font-semibold text-slate-200">{row.feature}</td>
                  <td className="p-5 font-bold text-emerald-300 bg-indigo-500/5 border-x border-indigo-500/10">{row.baselink}</td>
                  <td className="p-5 text-slate-400">{row.legacy}</td>
                  <td className="p-5 text-slate-400">{row.aws}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="border-t border-white/10 py-12 px-6 max-w-7xl mx-auto text-xs text-slate-400">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
              <Mail className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-white text-sm">BaseLink</span>
            <span className="text-slate-600">|</span>
            <span>High-deliverability email platform</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/auth/login" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/auth/register" className="hover:text-white transition-colors">Register</Link>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#capabilities" className="hover:text-white transition-colors">Capabilities</a>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-white/5 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-500 text-[11px]">
          <p>© {new Date().getFullYear()} BaseLink Inc. All rights reserved.</p>
          <p className="font-mono">Sub-50ms REST API · SPF/DKIM Verified · 99.99% Uptime SLA</p>
        </div>
      </footer>
    </div>
  );
}
