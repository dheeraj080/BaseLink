'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Calendar, ChevronDown } from 'lucide-react';
import { analyticsService } from '@/services/analytics.service';
import { CustomSelect } from '@/components/ui/Select';

export function PerformanceChart() {
  const [allTimelineData, setAllTimelineData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState('Last 30 Days');
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  useEffect(() => {
    async function loadTimeline() {
      try {
        const timeline = await analyticsService.getTimeline();
        if (Array.isArray(timeline)) {
          setAllTimelineData(timeline);
        } else {
          setAllTimelineData([]);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadTimeline();
  }, []);

  useEffect(() => {
    if (allTimelineData.length === 0) {
      setTrendData([]);
      return;
    }

    let filtered = [...allTimelineData];
    const now = new Date();

    if (timeframe !== 'Custom Range...') {
      let daysToKeep = 30;
      if (timeframe === 'Last 7 Days') daysToKeep = 7;
      else if (timeframe === 'Last 14 Days') daysToKeep = 14;
      else if (timeframe === 'Last 30 Days') daysToKeep = 30;
      else if (timeframe === 'Last 90 Days') daysToKeep = 90;
      else if (timeframe === 'Last 6 Months') daysToKeep = 180;
      else if (timeframe === 'Last 1 Year') daysToKeep = 365;

      const cutoffDate = new Date();
      cutoffDate.setDate(now.getDate() - daysToKeep);
      cutoffDate.setHours(0, 0, 0, 0);

      filtered = allTimelineData.filter(point => {
        if (!point.date) return false;
        const pointDate = new Date(point.date + 'T00:00:00');
        return pointDate >= cutoffDate;
      });
    } else {
      if (customStart) {
        const startDate = new Date(customStart + 'T00:00:00');
        filtered = filtered.filter(point => point.date && new Date(point.date + 'T00:00:00') >= startDate);
      }
      if (customEnd) {
        const endDate = new Date(customEnd + 'T00:00:00');
        filtered = filtered.filter(point => point.date && new Date(point.date + 'T00:00:00') <= endDate);
      }
    }

    const formatted = filtered.map(point => {
      const date = point.date ? new Date(point.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Today';
      const oRate = point.sent > 0 ? (point.opens / point.sent) * 100 : 0;
      const cRate = point.sent > 0 ? (point.clicks / point.sent) * 100 : 0;
      return {
        week: date,
        sent: point.sent,
        opens: point.opens,
        clicks: point.clicks,
        unsubscribed: point.unsubscribed,
        openRate: parseFloat(oRate.toFixed(1)),
        clickRate: parseFloat(cRate.toFixed(1))
      };
    });

    if (formatted.length === 1) {
      setTrendData([
        { week: 'Baseline', sent: 0, opens: 0, clicks: 0, unsubscribed: 0, openRate: 0, clickRate: 0 },
        formatted[0]
      ]);
    } else {
      setTrendData(formatted);
    }
  }, [allTimelineData, timeframe, customStart, customEnd]);

  const timeframes = [
    'Last 7 Days',
    'Last 14 Days',
    'Last 30 Days',
    'Last 90 Days',
    'Last 6 Months',
    'Last 1 Year',
    'Custom Range...'
  ];

  return (
    <div className="bg-surface-primary border border-border-color rounded-2xl p-6 shadow-sm h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h3 className="text-lg font-bold text-text-main tracking-tight">Campaign Performance</h3>
          <p className="text-[10px] font-bold text-text-secondary mt-1 uppercase tracking-widest">Historical outreach engagement metrics</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#6366f1]"></div>
              <span className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em] leading-none">Sent</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></div>
              <span className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em] leading-none">Opens</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></div>
              <span className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em] leading-none">Clicks</span>
            </div>
          </div>

          <CustomSelect
            options={timeframes.map(tf => ({ value: tf, label: tf }))}
            value={timeframe}
            onChange={(val) => {
              setTimeframe(val);
              setShowCustomRange(val === 'Custom Range...');
            }}
            className="min-w-[160px]"
          />
        </div>
      </div>

      {showCustomRange && (
        <div className="mb-8 flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-3 bg-bg-primary border border-border-color px-4 py-2 rounded-xl">
            <Calendar className="w-4 h-4 text-text-secondary" />
            <input type="date" className="bg-transparent text-[10px] text-text-secondary outline-none border-none font-bold uppercase tracking-widest" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
          </div>
          <span className="text-text-secondary text-[10px] font-bold uppercase tracking-widest">to</span>
          <div className="flex items-center gap-3 bg-bg-primary border border-border-color px-4 py-2 rounded-xl">
            <Calendar className="w-4 h-4 text-text-secondary" />
            <input type="date" className="bg-transparent text-[10px] text-text-secondary outline-none border-none font-bold uppercase tracking-widest" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
          </div>
        </div>
      )}

      <div className="flex-1 w-full" style={{ height: '350px' }}>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={trendData} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorOpens" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
            <XAxis
              dataKey="week"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 600 }}
              dy={15}
            />
            <YAxis
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 600 }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 600 }}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(10, 10, 12, 0.85)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '24px',
                fontSize: '11px',
                color: '#ffffff',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                padding: '20px'
              }}
              itemStyle={{ fontSize: '11px', padding: '6px 0', fontWeight: 'bold' }}
              labelStyle={{ color: 'rgba(255,255,255,0.5)', fontWeight: 'bold', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}
              cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="sent"
              name="Sent Volume"
              stroke="#6366f1"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: '#0a0a0c' }}
              activeDot={{ r: 7, fill: '#6366f1', stroke: '#ffffff', strokeWidth: 2 }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="opens"
              name="Open Volume"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: '#0a0a0c' }}
              activeDot={{ r: 7, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="clicks"
              name="Click Rate"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 5, fill: '#f59e0b' }}
            />
            <Line
              yAxisId="right"
              type="step"
              dataKey="openRate"
              name="Ratio %"
              stroke="#333333"
              strokeDasharray="4 4"
              strokeWidth={1}
              opacity={0.8}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
