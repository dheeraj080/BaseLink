'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Mail, 
  Server, 
  Key, 
  Save, 
  Send, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';

type ProviderType = 'SMTP' | 'RESEND' | 'SENDGRID' | 'BREVO' | 'MAILGUN' | 'POSTMARK';

interface EmailConfigForm {
  providerType: ProviderType;
  fromEmail: String;
  smtpHost: String;
  smtpPort: String;
  smtpUsername: String;
  apiKey: String;
}

export default function EmailSettingsPage() {
  const [provider, setProvider] = useState<ProviderType>('SMTP');
  const [fromEmail, setFromEmail] = useState('');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('');
  const [smtpUsername, setSmtpUsername] = useState('');
  const [apiKey, setApiKey] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    let active = true;
    const loadConfig = async () => {
      try {
        const response = await api.get('/email/config');
        if (active && response.data && response.data.configured) {
          const data = response.data;
          setProvider(data.providerType);
          setFromEmail(data.fromEmail || '');
          setSmtpHost(data.smtpHost || '');
          setSmtpPort(data.smtpPort ? String(data.smtpPort) : '');
          setSmtpUsername(data.smtpUsername || '');
          setApiKey(data.apiKey || '');
        }
      } catch (error: any) {
        if (active) toast.error('Failed to load email configurations');
      } finally {
        if (active) setIsLoading(false);
      }
    };
    loadConfig();
    return () => {
      active = false;
    };
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await api.get('/email/config');
      if (response.data && response.data.configured) {
        const data = response.data;
        setProvider(data.providerType);
        setFromEmail(data.fromEmail || '');
        setSmtpHost(data.smtpHost || '');
        setSmtpPort(data.smtpPort ? String(data.smtpPort) : '');
        setSmtpUsername(data.smtpUsername || '');
        setApiKey(data.apiKey || '');
      }
    } catch (error: any) {
      toast.error('Failed to load email configurations');
    } finally {
      setIsLoading(false);
    }
  };

  const getPayload = () => {
    return {
      providerType: provider,
      fromEmail,
      smtpHost: provider === 'SMTP' ? smtpHost : null,
      smtpPort: provider === 'SMTP' ? smtpPort : null,
      smtpUsername: provider === 'SMTP' ? smtpUsername : null,
      apiKey: apiKey,
    };
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromEmail) {
      toast.error('Sender email (From Email) is required');
      return;
    }
    setIsSaving(true);
    try {
      await api.post('/email/config', getPayload());
      toast.success('Email settings saved successfully');
      fetchConfig();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!fromEmail) {
      toast.error('Sender email (From Email) is required for testing');
      return;
    }
    setIsTesting(true);
    try {
      const response = await api.post('/email/config/test', getPayload());
      if (response.data && response.data.success) {
        toast.success(response.data.message || 'Test connection successful!');
      } else {
        toast.error(response.data.message || 'Test connection failed');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Connection test failed');
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-silver" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-soft-linen tracking-tight">Email Service Configurations</h1>
        <p className="text-silver text-sm mt-1">Configure your outgoing email provider (SMTP or HTTP APIs) to avoid local server connection issues.</p>
      </motion.div>

      <div className="bg-onyx border border-onyx-400 rounded-xl shadow-sm p-8">
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Provider Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-silver uppercase tracking-wider ml-1">Email Provider Type</label>
            <select
              value={provider}
              onChange={(e) => {
                setProvider(e.target.value as ProviderType);
                if (e.target.value !== 'SMTP' && apiKey === '••••••••••••') {
                  setApiKey(''); // Clear mask if swapping API types to avoid overwrite issues
                }
              }}
              className="w-full bg-bg-primary border border-border-color rounded-lg py-2.5 px-3 outline-none focus:ring-4 focus:ring-white/5 focus:border-white transition-all text-soft-linen text-sm placeholder:text-text-secondary/30"
            >
              <option value="SMTP">SMTP Server (Gmail, AWS SES, Custom SMTP)</option>
              <option value="RESEND">Resend HTTP API (Port 443)</option>
              <option value="SENDGRID">SendGrid HTTP API (Port 443)</option>
              <option value="BREVO">Brevo HTTP API (Port 443)</option>
              <option value="MAILGUN">Mailgun HTTP API (Port 443)</option>
              <option value="POSTMARK">Postmark HTTP API (Port 443)</option>
            </select>
          </div>

          {/* Common Field: Sender Email */}
          <div className="grid grid-cols-1 gap-6">
            <Input
              label="From Email (Sender)"
              type="email"
              value={fromEmail}
              onChange={(e) => setFromEmail(e.target.value)}
              placeholder="noreply@yourdomain.com"
              leftIcon={<Mail className="w-4 h-4 text-text-secondary" />}
              required
            />
          </div>

          {/* Conditional Layouts */}
          {provider === 'SMTP' ? (
            <div className="space-y-6 border-t border-onyx-400 pt-6">
              <h3 className="text-sm font-semibold text-soft-linen uppercase tracking-wider flex items-center gap-2">
                <Server className="w-4 h-4" />
                SMTP Configuration Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                  label="SMTP Host"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  placeholder="smtp.gmail.com"
                  required
                />
                <Input
                  label="SMTP Port"
                  type="number"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                  placeholder="587"
                  required
                />
                <Input
                  label="SMTP Username"
                  value={smtpUsername}
                  onChange={(e) => setSmtpUsername(e.target.value)}
                  placeholder="user@example.com"
                  required
                />
              </div>

              <Input
                label="SMTP Password / Auth Token"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="••••••••••••"
                leftIcon={<Key className="w-4 h-4 text-text-secondary" />}
                required
              />
            </div>
          ) : (
            <div className="space-y-6 border-t border-onyx-400 pt-6">
              <h3 className="text-sm font-semibold text-soft-linen uppercase tracking-wider flex items-center gap-2">
                <Key className="w-4 h-4" />
                HTTP API Authentication Details
              </h3>
              <div className="p-4 bg-soft-linen/5 border border-soft-linen/10 rounded-xl flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-soft-linen/70 shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-silver leading-relaxed">
                  HTTP API delivery runs over standard SSL Port 443, bypassing ISP and network blockages that usually affect standard SMTP. Make sure to generate your credentials from your provider dashboard.
                </p>
              </div>

              <Input
                label={`${provider.charAt(0) + provider.slice(1).toLowerCase()} API Key`}
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter API Key / Token"
                leftIcon={<Key className="w-4 h-4 text-text-secondary" />}
                required
              />
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-onyx-400">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-soft-linen border border-onyx-400 hover:border-silver/30 bg-onyx-100 hover:bg-onyx-400 rounded-lg px-4 py-2.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {isTesting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Test Connection
            </button>

            <Button
              type="submit"
              disabled={isSaving}
              leftIcon={isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            >
              Save Configuration
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}
