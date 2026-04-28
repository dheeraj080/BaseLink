import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] cursor-pointer",
  {
    variants: {
      variant: {
        primary: "bg-white text-bg-primary hover:bg-text-main shadow-sm border border-white",
        secondary: "bg-surface-secondary text-text-main border border-border-color hover:bg-surface-primary hover:text-white transition-all shadow-sm",
        ghost: "bg-transparent text-text-secondary hover:text-white hover:bg-surface-primary",
        danger: "bg-bg-primary text-text-main border border-border-color hover:bg-surface-secondary hover:text-white transition-all shadow-sm font-semibold hover:border-text-secondary/20",
      },
      size: {
        sm: "px-3 py-1.5 h-8 gap-1.5 text-xs",
        md: "px-4 py-2.5 h-10 gap-2",
        lg: "px-6 py-3 h-12 gap-3 text-base",
      },
      fullWidth: {
        true: "w-full",
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    }
  }
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, loading, leftIcon, rightIcon, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
        {!loading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
