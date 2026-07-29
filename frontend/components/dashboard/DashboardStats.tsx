import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatCardItem {
  name: string;
  value: string | number;
  icon?: LucideIcon;
  color?: string;
  bg?: string;
  trendPercentage?: string;
  trendIsPositive?: boolean;
  trendLabel?: string;
  sparklineData?: number[];
  sparklineLabels?: string[];
}

interface DashboardStatsProps {
  statCards: StatCardItem[];
  isStatsLoading: boolean;
}

function MiniSparkline({
  data,
  labels,
  isPositive = true,
}: {
  data: number[];
  labels?: string[];
  isPositive?: boolean;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;

  const width = 128;
  const height = 40;
  const paddingX = 4;
  const paddingY = 6;

  const points = data.map((val, idx) => {
    const x = paddingX + (idx / (data.length - 1)) * (width - 2 * paddingX);
    const y = height - paddingY - ((val - min) / range) * (height - 2 * paddingY);
    return { x, y, val, label: labels?.[idx] || `Day ${idx + 1}` };
  });

  const pathD = points.reduce((acc, point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prev = points[i - 1];
    const cx1 = prev.x + (point.x - prev.x) / 2;
    const cy1 = prev.y;
    const cx2 = prev.x + (point.x - prev.x) / 2;
    const cy2 = point.y;
    return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${point.x} ${point.y}`;
  }, '');

  const lastPoint = points[points.length - 1];
  const areaD = `${pathD} L ${lastPoint.x} ${height} L ${points[0].x} ${height} Z`;

  const strokeColor = isPositive ? '#10b981' : '#f43f5e';
  const gradientId = `sparkline-grad-${Math.floor(Math.random() * 1000000)}`;

  return (
    <div className="relative group/sparkline flex flex-col items-end">
      {/* Tooltip on point hover */}
      <AnimatePresence>
        {hoveredIdx !== null && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute -top-7 right-0 z-20 px-2 py-0.5 rounded-md bg-black/90 border border-white/20 text-[10px] font-mono text-white whitespace-nowrap shadow-xl pointer-events-none flex items-center gap-1.5"
          >
            <span className="text-slate-400">{points[hoveredIdx].label}:</span>
            <span className="font-bold text-emerald-400">{points[hoveredIdx].val.toLocaleString()}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <svg
        width={width}
        height={height}
        className="overflow-visible cursor-crosshair"
        onMouseLeave={() => setHoveredIdx(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity={0.4} />
            <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
          </linearGradient>
        </defs>

        {/* Fill Area under Curve */}
        <path d={areaD} fill={`url(#${gradientId})`} />

        {/* Main Trend Line */}
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Interactive hover points & default end indicator */}
        {points.map((p, idx) => (
          <g key={idx}>
            {/* Hit box for hover */}
            <rect
              x={p.x - 8}
              y={0}
              width={16}
              height={height}
              fill="transparent"
              onMouseEnter={() => setHoveredIdx(idx)}
            />

            {/* Glowing dot on end or hovered point */}
            {(hoveredIdx === idx || (hoveredIdx === null && idx === points.length - 1)) && (
              <>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={5}
                  fill={strokeColor}
                  className="animate-ping opacity-75"
                />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={3.5}
                  fill="#000000"
                  stroke={strokeColor}
                  strokeWidth={2}
                />
              </>
            )}
          </g>
        ))}
      </svg>
      <span className="text-[9px] font-mono text-slate-500 mt-1 uppercase tracking-wider">7-day trend</span>
    </div>
  );
}

export function DashboardStats({ statCards, isStatsLoading }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {statCards.map((stat, i) => {
        const IconComponent = stat.icon;
        const hasSparkline = Array.isArray(stat.sparklineData) && stat.sparklineData.length > 1;

        return (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: 'spring',
              bounce: 0,
              duration: 0.35,
              delay: i * 0.04 + 0.1,
            }}
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="p-6 apple-glass-card rounded-[22px] border border-white/10 relative overflow-hidden group hover:border-white/20 transition-all duration-200 apple-edge-highlight cursor-pointer flex flex-col justify-between"
          >
            {/* Card Top Header */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {IconComponent && (
                  <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                    <IconComponent className="w-3.5 h-3.5" />
                  </div>
                )}
                <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-widest">
                  {stat.name}
                </p>
              </div>

              {/* Trend Percentage Badge */}
              {stat.trendPercentage && (
                <div
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border font-mono',
                    stat.trendIsPositive !== false
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  )}
                >
                  {stat.trendIsPositive !== false ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>{stat.trendPercentage}</span>
                </div>
              )}
            </div>

            {/* Card Middle / Bottom Content */}
            <div className="mt-4 flex items-end justify-between gap-3">
              <div>
                <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  {isStatsLoading ? (
                    <span className="inline-block w-16 h-8 bg-white/10 animate-pulse rounded-md" />
                  ) : (
                    typeof stat.value === 'number' ? stat.value.toLocaleString('en-US') : stat.value
                  )}
                </h3>
                {stat.trendLabel && (
                  <p className="text-[11px] font-medium text-slate-400 mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {stat.trendLabel}
                  </p>
                )}
              </div>

              {/* Mini Line Chart / Sparkline */}
              {hasSparkline && !isStatsLoading && (
                <MiniSparkline
                  data={stat.sparklineData!}
                  labels={stat.sparklineLabels}
                  isPositive={stat.trendIsPositive !== false}
                />
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

