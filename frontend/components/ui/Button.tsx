import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl text-sm font-semibold tracking-tight transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.96] cursor-pointer select-none apple-edge-highlight",
  {
    variants: {
      variant: {
        primary: "bg-white text-black hover:bg-white/90 shadow-lg shadow-white/5 border border-white/20 active:bg-white/80",
        secondary: "apple-glass text-white border border-white/15 hover:bg-white/10 active:bg-white/15 shadow-sm",
        ghost: "bg-transparent text-text-secondary hover:text-white hover:bg-white/5 active:bg-white/10",
        danger: "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 active:bg-red-500/30 font-semibold shadow-sm",
      },
      size: {
        sm: "px-3.5 py-1.5 h-8 gap-1.5 text-xs rounded-lg",
        md: "px-5 py-2.5 h-10 gap-2 text-sm rounded-xl",
        lg: "px-7 py-3.5 h-12 gap-3 text-base rounded-2xl",
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
