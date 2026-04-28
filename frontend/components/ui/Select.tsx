'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function CustomSelect({ options, value, onChange, placeholder = "Select option...", className }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 rounded-xl h-11 px-4 flex items-center justify-between text-white text-xs font-medium cursor-pointer transition-all outline-none shadow-sm"
      >
        <span className={cn("truncate", !selectedOption && "text-text-secondary")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={cn("w-4 h-4 text-white/30 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 w-full bg-[#0a0a0c] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto"
          >
            <div className="p-1.5 space-y-0.5">
              {options.length === 0 ? (
                <p className="text-[10px] text-text-secondary/40 text-center py-4 italic uppercase tracking-widest">No options</p>
              ) : (
                options.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between",
                      option.value === value 
                        ? "bg-white text-bg-primary" 
                        : "text-white/80 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {option.value === value && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
