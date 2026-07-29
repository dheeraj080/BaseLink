import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="text-[11px] font-semibold text-text-secondary ml-1 tracking-tight">
            {label}
          </label>
        )}
        <div className="relative group">
          {leftIcon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary transition-colors duration-150 group-focus-within:text-white pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full apple-glass rounded-xl py-2.5 outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-150 placeholder:text-text-secondary/40 text-sm text-white shadow-sm font-medium apple-edge-highlight",
              leftIcon ? "pl-10 pr-3.5" : "px-3.5",
              error ? "border-red-500/50 focus:ring-red-500/20 focus:border-red-500" : "",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs font-medium text-red-400 ml-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
