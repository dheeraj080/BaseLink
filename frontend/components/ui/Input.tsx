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
          <label className="text-xs font-medium text-silver ml-1">
            {label}
          </label>
        )}
        <div className="relative group">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-silver transition-colors duration-200">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full bg-onyx border border-onyx-400 rounded-lg py-2 outline-none focus:ring-2 focus:ring-silver/20 focus:border-silver transition-all duration-200 placeholder:text-silver/50 text-sm text-soft-linen shadow-sm",
              leftIcon ? "pl-10 pr-3" : "px-3",
              error ? "border-soft-linen/40 focus:ring-silver/20 focus:border-soft-linen" : "",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs font-semibold text-white-smoke ml-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
