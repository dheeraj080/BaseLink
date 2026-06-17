'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, AlertCircle, Loader2, Github, CheckCircle2, ShieldCheck, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { handleError } from '@/lib/utils';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const mfaSchema = z.object({
  code: z.string().length(6, 'Authentication code must be 6 digits'),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type MfaFormValues = z.infer<typeof mfaSchema>;

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const mfaForm = useForm<MfaFormValues>({
    resolver: zodResolver(mfaSchema),
  });

  const [lastUsedProvider, setLastUsedProvider] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLastUsedProvider(localStorage.getItem('lastUsedProvider'));
    }
  }, []);

  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await authService.login(data);
      
      if (response.mfaRequired && response.mfaToken) {
        setMfaRequired(true);
        setMfaToken(response.mfaToken);
        toast.success('Two-factor authentication required');
        return;
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('lastUsedProvider', 'CREDENTIALS');
      }
      login(response);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onMfaSubmit = async (data: MfaFormValues) => {
    if (!mfaToken) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await authService.verify2fa(mfaToken, data.code);
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastUsedProvider', 'CREDENTIALS');
      }
      login(response);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid authentication code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuthLogin = async (provider: 'GOOGLE' | 'GITHUB') => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastUsedProvider', provider);
      }
      const { url } = await authService.getOAuthUrl(provider);
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      window.open(
        url,
        `login_with_${provider}`,
        `width=${width},height=${height},left=${left},top=${top}`
      );
    } catch (err) {
      handleError(err, `Failed to initiate ${provider} login.`);
      setError(`Failed to initiate ${provider} login.`);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('onrender.com')) {
        return;
      }

      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const { payload } = event.data;
        login(payload);
        router.push('/');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [login, router]);

  return (
    <div className="min-h-screen flex bg-onyx overflow-hidden">
      {/* Left Side: Art/Visuals */}
      <div className="hidden lg:flex lg:w-[60%] relative bg-onyx-100 items-center justify-center overflow-hidden border-r border-onyx-400">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-onyx-100 via-onyx to-onyx-100 z-0"></div>
        
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.03, 0.05, 0.03]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute w-[800px] h-[800px] border border-soft-linen rounded-full pointer-events-none"
        ></motion.div>
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
            opacity: [0.02, 0.04, 0.02]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute w-[600px] h-[600px] border border-soft-linen rounded-full pointer-events-none"
        ></motion.div>

        <div className="relative z-10 p-16 max-w-xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Link href="/" className="inline-flex items-center gap-4 mb-12 group">
              <div className="w-12 h-12 bg-soft-linen rounded-2xl flex items-center justify-center shadow-2xl shadow-soft-linen/20 group-hover:scale-105 transition-all duration-500">
                <span className="text-onyx font-black text-2xl uppercase italic">B</span>
              </div>
              <span className="text-3xl font-bold text-soft-linen tracking-tighter">BaseLink</span>
            </Link>
            
            <h1 className="text-6xl font-bold text-soft-linen leading-[0.9] tracking-tighter mb-8">
              {mfaRequired ? 'SECURE' : 'CONNECTIONS'} <br/>
              <span className="text-silver italic font-serif">{mfaRequired ? 'verification.' : 'refined.'}</span>
            </h1>
            
            <p className="text-lg text-silver font-medium leading-relaxed mb-12 max-w-md">
              {mfaRequired 
                ? 'Multi-factor authentication is active on your account. Please enter the code from your authenticator app.'
                : 'The next generation of enterprise contact management. Secure, scalable, and designed for high-performance teams.'}
            </p>

            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-onyx-400">
              <div>
                <p className="text-3xl font-light text-soft-linen mb-1">99.9%</p>
                <p className="text-[10px] font-bold text-silver uppercase tracking-widest">Uptime Reliability</p>
              </div>
              <div>
                <p className="text-3xl font-light text-soft-linen mb-1">RFC 6238</p>
                <p className="text-[10px] font-bold text-silver uppercase tracking-widest">TOTP Standard</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-[40%] flex items-center justify-center p-8 bg-onyx relative">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none lg:hidden" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full"
        >
          <div className="mb-10 lg:hidden text-center">
            <Link href="/" className="inline-flex items-center gap-3 mb-8 group">
              <div className="w-10 h-10 bg-soft-linen rounded-xl flex items-center justify-center">
                <span className="text-onyx font-bold text-xl italic font-serif">B</span>
              </div>
              <span className="text-2xl font-bold text-soft-linen tracking-tight">BaseLink</span>
            </Link>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl font-bold text-soft-linen tracking-tight leading-tight">
              {mfaRequired ? 'Verify Identity' : 'Welcome back'}
            </h2>
            <p className="text-silver font-medium mt-3">
              {mfaRequired ? 'Enter your 6-digit security code' : 'Access your enterprise dashboard'}
            </p>
          </div>

        <div className="bg-onyx-100 border border-onyx-400 p-10 rounded-2xl shadow-xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            {!mfaRequired ? (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                  {searchParams?.get('reset') === 'true' && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-soft-linen/5 border border-soft-linen/20 rounded-xl flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-soft-linen shrink-0" />
                      <p className="text-xs font-semibold text-soft-linen leading-relaxed">Password updated. You can now log in.</p>
                    </motion.div>
                  )}

                  {error && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-soft-linen/5 border border-soft-linen/10 rounded-xl flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-soft-linen/70 shrink-0" />
                      <p className="text-xs font-semibold text-soft-linen/90 leading-relaxed">{error}</p>
                    </motion.div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-silver uppercase tracking-wider ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-silver" />
                      <input
                        {...loginForm.register('email')}
                        type="email"
                        className="w-full bg-onyx border border-onyx-400 rounded-xl py-3 pl-12 pr-4 focus:ring-1 focus:ring-silver outline-none transition-all text-soft-linen text-sm placeholder:text-onyx-300"
                        placeholder="name@company.com"
                      />
                    </div>
                    {loginForm.formState.errors.email && <p className="text-[10px] font-semibold text-silver mt-1 ml-1">{loginForm.formState.errors.email.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-xs font-semibold text-silver uppercase tracking-wider">Password</label>
                      <Link href="/auth/forgot-password" core-id="forgot-password" className="text-[10px] font-semibold text-soft-linen hover:text-white-smoke uppercase tracking-wider transition-colors">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-silver" />
                      <input
                        {...loginForm.register('password')}
                        type="password"
                        className="w-full bg-onyx border border-onyx-400 rounded-xl py-3 pl-12 pr-4 focus:ring-1 focus:ring-silver outline-none transition-all text-soft-linen text-sm placeholder:text-onyx-300"
                        placeholder="••••••••"
                      />
                    </div>
                    {loginForm.formState.errors.password && <p className="text-[10px] font-semibold text-silver mt-1 ml-1">{loginForm.formState.errors.password.message}</p>}
                  </div>

                  <button
                    id="login-button"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-soft-linen hover:bg-white-smoke text-onyx rounded-xl py-3.5 font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-lg shadow-soft-linen/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-onyx-400"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                      <span className="bg-onyx-100 px-4 text-silver">Or continue with</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => handleOAuthLogin('GOOGLE')}
                      className="flex items-center justify-center gap-3 bg-onyx border border-onyx-400 hover:border-silver/30 rounded-xl py-3 text-soft-linen text-xs font-bold uppercase tracking-wider transition-all relative"
                    >
                      {lastUsedProvider === 'GOOGLE' && (
                        <span className="absolute -top-2 right-2 bg-white text-onyx text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-lg border border-onyx-400">LAST USED</span>
                      )}
                      <div className="w-4 h-4 bg-soft-linen rounded-full flex items-center justify-center text-[10px] text-onyx font-bold">G</div>
                      Google
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOAuthLogin('GITHUB')}
                      className="flex items-center justify-center gap-3 bg-onyx border border-onyx-400 hover:border-silver/30 rounded-xl py-3 text-soft-linen text-xs font-bold uppercase tracking-wider transition-all relative"
                    >
                      {lastUsedProvider === 'GITHUB' && (
                        <span className="absolute -top-2 right-2 bg-white text-onyx text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-lg border border-onyx-400">LAST USED</span>
                      )}
                      <Github className="w-4 h-4" />
                      GitHub
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="mfa-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={mfaForm.handleSubmit(onMfaSubmit)} className="space-y-8">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-soft-linen/10 rounded-2xl flex items-center justify-center border border-soft-linen/20">
                      <KeyRound className="w-8 h-8 text-soft-linen" />
                    </div>
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-soft-linen/5 border border-soft-linen/10 rounded-xl flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-soft-linen/70 shrink-0" />
                      <p className="text-xs font-semibold text-soft-linen/90 leading-relaxed">{error}</p>
                    </motion.div>
                  )}

                  <div className="space-y-4">
                    <label className="text-xs font-semibold text-silver uppercase tracking-wider block text-center">Authentication Code</label>
                    <div className="relative">
                      <input
                        {...mfaForm.register('code')}
                        type="text"
                        maxLength={6}
                        autoFocus
                        className="w-full bg-onyx border border-onyx-400 rounded-xl py-4 text-center text-2xl font-mono tracking-[0.5em] focus:ring-1 focus:ring-silver outline-none transition-all text-soft-linen placeholder:text-onyx-300"
                        placeholder="000000"
                      />
                    </div>
                    {mfaForm.formState.errors.code && <p className="text-[10px] font-semibold text-silver text-center">{mfaForm.formState.errors.code.message}</p>}
                  </div>

                  <div className="space-y-4">
                    <button
                      id="verify-mfa-button"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-soft-linen hover:bg-white-smoke text-onyx rounded-xl py-3.5 font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-lg shadow-soft-linen/10 transition-all active:scale-[0.99]"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Verify & Sign In
                          <ShieldCheck className="w-4 h-4" />
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setMfaRequired(false)}
                      className="w-full text-[10px] font-bold text-silver hover:text-soft-linen uppercase tracking-widest transition-colors"
                    >
                      Back to login
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-xs font-semibold text-silver mt-8">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-soft-linen hover:text-white-smoke transition-colors uppercase tracking-wider">
              Register now
            </Link>
          </p>
        </div>
        
        <div className="mt-8 text-center">
            <p className="text-[9px] font-bold text-onyx-400 uppercase tracking-widest">© 2024 BaseLink • Secure Enterprise Access</p>
        </div>
      </motion.div>
    </div>
  </div>
  );
}
