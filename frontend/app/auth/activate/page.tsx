'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authService } from '@/services/auth.service';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Key, ArrowRight, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

const activateSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(6, 'Code must be exactly 6 digits'),
});

type ActivateValues = z.infer<typeof activateSchema>;

export default function ActivatePage() {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ActivateValues>({
    resolver: zodResolver(activateSchema),
    defaultValues: {
      email: searchParams?.get('email') || '',
    }
  });

  useEffect(() => {
    const email = searchParams?.get('email');
    if (email) setValue('email', email);
  }, [searchParams, setValue]);

  const onSubmit = async (data: ActivateValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await authService.activate(data.email, data.code);
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/auth/login?activated=true');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Activation failed. The code may be invalid or expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-onyx overflow-hidden">
      {/* Left Side: Art/Visuals */}
      <div className="hidden lg:flex lg:w-[60%] relative bg-onyx-100 items-center justify-center overflow-hidden border-r border-onyx-400">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-onyx-100 via-onyx to-onyx-100 z-0"></div>
        
        <motion.div 
          animate={{ 
            scale: [1.1, 1, 1.1],
            rotate: [0, -45, 0],
            opacity: [0.02, 0.05, 0.02]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute w-[900px] h-[900px] border border-soft-linen rounded-full pointer-events-none"
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
            
            <h1 className="text-6xl font-bold text-soft-linen leading-[0.9] tracking-tighter mb-8 text-shadow-xl ">
              VERIFY <br/>
              <span className="text-silver italic font-serif">identity.</span>
            </h1>
            
            <p className="text-lg text-silver font-medium leading-relaxed mb-12 max-w-md">
              Secure your account by verifying your email address. This one-time activation ensures your data remains protected.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-[40%] flex items-center justify-center p-8 bg-onyx px-4 py-12 relative overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full relative z-10"
        >
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl font-bold text-soft-linen tracking-tight leading-tight">Activate Account</h2>
            <p className="text-silver font-medium mt-3">Enter the verification code sent to your inbox</p>
          </div>

          <div className="bg-onyx-100 border border-onyx-400 p-10 rounded-2xl shadow-xl relative overflow-hidden">
            {isSuccess ? (
              <div className="text-center space-y-6 py-6">
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-soft-linen/10 rounded-full flex items-center justify-center border border-soft-linen/20">
                    <CheckCircle2 className="w-10 h-10 text-soft-linen" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-soft-linen mb-2">Activated!</h3>
                  <p className="text-silver text-sm leading-relaxed">
                    Your account is now active. Redirecting you to the login page...
                  </p>
                </div>
                <div className="flex justify-center">
                   <Loader2 className="w-6 h-6 animate-spin text-soft-linen" />
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-soft-linen/5 border border-soft-linen/10 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-soft-linen/70 shrink-0" />
                    <p className="text-xs font-semibold text-soft-linen/90 leading-relaxed">{error}</p>
                  </motion.div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-silver uppercase tracking-wider ml-1">Email Address</label>
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full bg-onyx border border-onyx-400 rounded-xl py-3 px-4 focus:ring-1 focus:ring-silver outline-none transition-all text-soft-linen text-sm placeholder:text-onyx-300"
                    placeholder="name@company.com"
                  />
                  {errors.email && <p className="text-[10px] font-semibold text-silver mt-1 ml-1">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-silver uppercase tracking-wider ml-1">Verification Code</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-silver" />
                    <input
                      {...register('code')}
                      type="text"
                      maxLength={6}
                      className="w-full bg-onyx border border-onyx-400 rounded-xl py-3 pl-12 pr-4 focus:ring-1 focus:ring-silver outline-none transition-all text-soft-linen text-sm placeholder:text-onyx-300 font-mono tracking-widest"
                      placeholder="000000"
                    />
                  </div>
                  {errors.code && <p className="text-[10px] font-semibold text-silver mt-1 ml-1">{errors.code.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-soft-linen hover:bg-white-smoke text-onyx rounded-xl py-3.5 font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50 active:scale-[0.99] mt-2"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify Account <ShieldCheck className="w-4 h-4" /></>}
                </button>

                <p className="text-center text-xs font-semibold text-silver mt-4">
                  Didn&apos;t get a code? Check your spam folder or{' '}
                  <Link href="/auth/register" className="text-soft-linen hover:text-white-smoke transition-colors uppercase tracking-wider">
                    try again
                  </Link>
                </p>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
