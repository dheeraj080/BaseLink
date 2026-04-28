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
          <label className="text-xs font-medium text-text-secondary ml-1 uppercase tracking-widest">
            {label}
          </label>
        )}
        <div className="relative group">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary transition-colors duration-200 group-focus-within:text-white">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full bg-bg-primary border border-border-color rounded-lg py-2 outline-none focus:ring-4 focus:ring-white/5 focus:border-white transition-all duration-300 placeholder:text-text-secondary/30 text-sm text-text-main shadow-sm",
              leftIcon ? "pl-10 pr-3" : "px-3",
              error ? "border-text-secondary/40 focus:ring-white/5 focus:border-text-main" : "",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs font-semibold text-text-main ml-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
