import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { mockApi } from "@/src/api/mockApi";
import { ThemeToggle } from "@/src/components/ThemeToggle";

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    try {
      if (mode === "login") {
        await mockApi.auth.login(email, password);
      } else {
        await mockApi.auth.register(email, password, name);
      }
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-50 dark:bg-brand-950 px-4 relative">
      <div className="absolute top-6 left-6">
        <Link to="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
      </div>
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <motion.div 
        className="w-full max-w-md bg-white dark:bg-brand-950 rounded-2xl shadow-sm border border-brand-100 dark:border-brand-800 p-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="flex justify-center mb-8">
          <div className="h-12 w-12 rounded-full bg-brand-50 dark:bg-brand-900 flex items-center justify-center">
            <Mail className="h-6 w-6 text-brand-900 dark:text-brand-50" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center tracking-tight mb-2">
          {mode === "login" ? "Welcome back" : "Create an account"}
        </h2>
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-8">
          {mode === "login" 
            ? "Enter your credentials to access your account" 
            : "Sign up to start sending premium emails"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
              <Input name="name" placeholder="John Doe" required />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <Input name="email" type="email" placeholder="you@example.com" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <Input name="password" type="password" placeholder="••••••••" required />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              mode === "login" ? "Sign In" : "Sign Up"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-brand-900 dark:text-brand-50 font-medium hover:underline"
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
