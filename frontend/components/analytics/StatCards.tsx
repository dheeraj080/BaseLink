import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Metric {
  label: string;
  value: number | string;
  icon: LucideIcon;
}

interface StatCardsProps {
  metrics: Metric[];
  loading: boolean;
  mounted: boolean;
}

export function StatCards({ metrics, loading, mounted }: StatCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
      {metrics.slice(0, 4).map((metric) => (
        <div key={metric.label} className="p-6 bg-onyx/40 border border-onyx-400 rounded-2xl hover:border-soft-linen/20 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-onyx-400 rounded-xl">
              <metric.icon className="w-4 h-4 text-soft-linen" />
            </div>
            <p className="text-xs font-bold text-silver uppercase tracking-wider">{metric.label}</p>
          </div>
          <h3 className="text-4xl font-black text-soft-linen tracking-tight mt-3">
            {!mounted || loading ? '—' : typeof metric.value === 'number' ? metric.value.toLocaleString('en-US') : metric.value}
          </h3>
        </div>
      ))}
    </div>
  );
}
