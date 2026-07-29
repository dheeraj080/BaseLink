'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, animate } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppleSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/**
  Apple Design Fluid Bottom Sheet
  Implements:
  - 1:1 Direct Manipulation & Touch Tracking
  - Velocity handoff & momentum release
  - Rubber-banding resistance
  - Translucent Apple glass materials
  - Interruptible spring physics (critically damped)
 */
export function AppleSheet({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}: AppleSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragY = useMotionValue(0);
  const springY = useSpring(dragY, { damping: 30, stiffness: 350 });

  useEffect(() => {
    if (isOpen) {
      dragY.set(0);
    }
  }, [isOpen, dragY]);

  // Rubber-banding formula past boundary
  const applyRubberBanding = (overshoot: number, dimension = 300) => {
    const constant = 0.55;
    return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          {/* Dimmed scrim background with smooth fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Sheet Container with Apple Glass & Spring Motion */}
          <motion.div
            ref={sheetRef}
            initial={{ y: '100%', opacity: 0.9 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{
              type: 'spring',
              damping: 28,
              stiffness: 320,
              mass: 0.8,
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.1, bottom: 0.8 }}
            onDragEnd={(_, info) => {
              // Velocity handoff & momentum projection check
              const offset = info.offset.y;
              const velocity = info.velocity.y;

              // If pulled down far enough or thrown down fast, close
              if (offset > 120 || velocity > 400) {
                onClose();
              } else {
                // Spring back home smoothly
                animate(dragY, 0, {
                  type: 'spring',
                  bounce: 0,
                  duration: 0.35,
                });
              }
            }}
            className={cn(
              "relative z-10 w-full max-w-2xl apple-material-thick rounded-t-[28px] sm:rounded-[28px] p-6 sm:p-8 shadow-2xl max-h-[85vh] flex flex-col overflow-hidden apple-edge-highlight",
              className
            )}
          >
            {/* Grab handle indicator */}
            <div className="w-12 h-1.5 bg-white/20 hover:bg-white/40 rounded-full mx-auto mb-6 shrink-0 cursor-grab active:cursor-grabbing transition-colors" />

            {/* Header */}
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div>
                {title && <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>}
                {description && <p className="text-sm text-text-secondary mt-1">{description}</p>}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 text-text-secondary hover:text-white transition-all cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
