import React from 'react';
import { motion } from 'motion/react';

interface StatCardItem {
  name: string;
  value: string | number;
}

interface DashboardStatsProps {
  statCards: StatCardItem[];
  isStatsLoading: boolean;
}

export function DashboardStats({ statCards, isStatsLoading }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, i) => (
        <motion.div
          key={stat.name}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 + 0.2 }}
          className="p-8 bg-surface-primary border border-border-color rounded-[24px] relative overflow-hidden group hover:border-white/20 transition-all hover:shadow-2xl hover:shadow-white/[0.02] flex flex-col justify-between min-h-[140px]"
        >
          <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.3em]">{stat.name}</p>
          <h3 className="text-4xl font-black text-text-main tracking-tighter mt-4">{isStatsLoading ? '---' : stat.value}</h3>
        </motion.div>
      ))}
    </div>
  );
}
