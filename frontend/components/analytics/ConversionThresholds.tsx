import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface RateItem {
  label: string;
  value: number;
  color: string;
}

interface ConversionThresholdsProps {
  rates: RateItem[];
  loading: boolean;
}

export function ConversionThresholds({ rates, loading }: ConversionThresholdsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
      {rates.map((rate) => (
        <div key={rate.label} className="p-5 bg-onyx-400/20 border border-onyx-400/30 rounded-xl">
          <span className="text-[10px] font-bold text-silver/60 uppercase tracking-wider block mb-1">{rate.label}</span>
          <span className="text-2xl font-black text-soft-linen">
            {loading ? '—' : `${rate.value.toFixed(1)}%`}
          </span>
          <div className="h-1 bg-onyx-400/50 rounded-full overflow-hidden mt-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${rate.value}%` }}
              className={cn("h-full bg-soft-linen", rate.color)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
