import { Link } from "react-router-dom";
import { Button } from "@/src/components/ui/Button";
import { Mail, Zap, BarChart3, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { ThemeToggle } from "@/src/components/ThemeToggle";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-brand-950 selection:bg-brand-100 dark:selection:bg-brand-800">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <Mail className="h-6 w-6 text-brand-900 dark:text-brand-50" />
          <span className="text-xl font-bold tracking-tighter">BaseLink</span>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Link to="/auth?mode=login">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link to="/auth?mode=signup">
            <Button>Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-8 pt-24 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-brand-900 dark:text-brand-50 mb-6 max-w-4xl mx-auto leading-tight">
            Send emails that <span className="text-gray-400 dark:text-gray-500">actually</span> get read.
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
            A high-performance, minimalist email-sending platform designed for modern SaaS teams. Built with Spring Boot and React.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth?mode=signup">
              <Button size="lg" className="w-full sm:w-auto group">
                Start for free
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                View Live Demo
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="grid md:grid-cols-3 gap-12 mt-32 text-left"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        >
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-lg bg-brand-50 dark:bg-brand-900 flex items-center justify-center">
              <Zap className="h-6 w-6 text-brand-900 dark:text-brand-50" />
            </div>
            <h3 className="text-xl font-semibold">Lightning Fast</h3>
            <p className="text-gray-600 dark:text-gray-400">Built on a high-performance Spring Boot backend with optimized PostgreSQL queries.</p>
          </div>
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-lg bg-brand-50 dark:bg-brand-900 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-brand-900 dark:text-brand-50" />
            </div>
            <h3 className="text-xl font-semibold">Advanced Analytics</h3>
            <p className="text-gray-600 dark:text-gray-400">Track open rates, click-throughs, and delivery metrics in real-time.</p>
          </div>
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-lg bg-brand-50 dark:bg-brand-900 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-brand-900 dark:text-brand-50" />
            </div>
            <h3 className="text-xl font-semibold">Enterprise Security</h3>
            <p className="text-gray-600 dark:text-gray-400">JWT-based authentication, role-based access control, and secure data encryption.</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
