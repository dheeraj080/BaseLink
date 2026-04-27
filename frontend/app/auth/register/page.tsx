'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      router.push('/auth/login?registered=true');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
        
        {/* Abstract Art Elements */}
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
            opacity: [0.03, 0.05, 0.03]
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute w-[800px] h-[800px] border border-soft-linen rounded-full pointer-events-none"
        ></motion.div>
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, 180, 0],
            opacity: [0.02, 0.04, 0.02]
          }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
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
            
            <h1 className="text-6xl font-bold text-soft-linen leading-[0.9] tracking-tighter mb-8 text-shadow-xl ">
              JOIN THE <br/>
              <span className="text-silver italic font-serif">network.</span>
            </h1>
            
            <p className="text-lg text-silver font-medium leading-relaxed mb-12 max-w-md">
              Start managing your enterprise contacts with military-grade precision and world-class analytics.
            </p>

            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-onyx-400">
              <div>
                <p className="text-3xl font-light text-soft-linen mb-1">Scale</p>
                <p className="text-[10px] font-bold text-silver uppercase tracking-widest">Global Infrastructure</p>
              </div>
              <div>
                <p className="text-3xl font-light text-soft-linen mb-1">Secure</p>
                <p className="text-[10px] font-bold text-silver uppercase tracking-widest">Zero Trust Protocol</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Decorative Rail Text */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-12 pointer-events-none opacity-20">
          <p className="[writing-mode:vertical-rl] rotate-180 text-[10px] font-bold text-soft-linen uppercase tracking-[0.4em]">Register Access</p>
          <div className="h-24 w-px bg-soft-linen/20 mx-auto"></div>
          <p className="[writing-mode:vertical-rl] rotate-180 text-[10px] font-bold text-soft-linen uppercase tracking-[0.4em]">BaseLink v2.4</p>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-[40%] flex items-center justify-center p-8 bg-onyx px-4 py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none lg:hidden" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full relative z-10"
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
            <h2 className="text-4xl font-bold text-soft-linen tracking-tight leading-tight">Create account</h2>
            <p className="text-silver font-medium mt-3">Start your 14-day premium trial today</p>
          </div>

        <div className="bg-onyx-100 border border-onyx-400 p-10 rounded-2xl shadow-xl relative overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-soft-linen/5 border border-soft-linen/10 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-soft-linen/70 shrink-0" />
                <p className="text-xs font-semibold text-soft-linen/90 leading-relaxed">{error}</p>
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-silver uppercase tracking-wider ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-silver" />
                <input
                  {...register('name')}
                  type="text"
                  className="w-full bg-onyx border border-onyx-400 rounded-xl py-3 pl-12 pr-4 focus:ring-1 focus:ring-silver outline-none transition-all text-soft-linen text-sm placeholder:text-onyx-300"
                  placeholder="John Doe"
                />
              </div>
              {errors.name && <p className="text-[10px] font-semibold text-silver mt-1 ml-1">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-silver uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-silver" />
                <input
                  {...register('email')}
                  type="email"
                  className="w-full bg-onyx border border-onyx-400 rounded-xl py-3 pl-12 pr-4 focus:ring-1 focus:ring-silver outline-none transition-all text-soft-linen text-sm placeholder:text-onyx-300"
                  placeholder="name@company.com"
                />
              </div>
              {errors.email && <p className="text-[10px] font-semibold text-silver mt-1 ml-1">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-silver uppercase tracking-wider ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-silver" />
                  <input
                    {...register('password')}
                    type="password"
                    className="w-full bg-onyx border border-onyx-400 rounded-xl py-3 pl-12 pr-4 focus:ring-1 focus:ring-silver outline-none transition-all text-soft-linen text-sm placeholder:text-onyx-300"
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && <p className="text-[10px] font-semibold text-silver mt-1 ml-1">{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-silver uppercase tracking-wider ml-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-silver" />
                  <input
                    {...register('confirmPassword')}
                    type="password"
                    className="w-full bg-onyx border border-onyx-400 rounded-xl py-3 pl-12 pr-4 focus:ring-1 focus:ring-silver outline-none transition-all text-soft-linen text-sm placeholder:text-onyx-300"
                    placeholder="••••••••"
                  />
                </div>
                {errors.confirmPassword && <p className="text-[10px] font-semibold text-silver mt-1 ml-1">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <button
              id="register-button"
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-soft-linen hover:bg-white-smoke text-onyx rounded-xl py-3.5 font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-lg shadow-soft-linen/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] mt-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Register
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs font-semibold text-silver mt-8">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-soft-linen hover:text-white-smoke transition-colors uppercase tracking-wider">
              Log in
            </Link>
          </p>
        </div>
        
        <div className="mt-8 text-center">
            <p className="text-[9px] font-bold text-onyx-400 uppercase tracking-widest">© 2024 BaseLink • Enterprise Registration</p>
        </div>
      </motion.div>
    </div>
  </div>
  );
}
