import { useEffect, useState } from "react";
import { mockApi } from "@/src/api/mockApi";
import { Users, Mail, MousePointerClick, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "motion/react";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    mockApi.stats.getOverview().then(setStats);
    mockApi.stats.getChartData().then(setChartData);
  }, []);

  if (!stats) return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-gray-200 rounded w-3/4"></div><div className="space-y-2"><div className="h-4 bg-gray-200 rounded"></div><div className="h-4 bg-gray-200 rounded w-5/6"></div></div></div></div>;

  const statCards = [
    { title: "Total Subscribers", value: stats.totalSubscribers, icon: Users, trend: "+12%" },
    { title: "Emails Sent", value: stats.emailsSentThisMonth.toLocaleString(), icon: Mail, trend: "+4%" },
    { title: "Avg Open Rate", value: `${stats.avgOpenRate}%`, icon: Activity, trend: "+2.1%" },
    { title: "Avg Click Rate", value: `${stats.avgClickRate}%`, icon: MousePointerClick, trend: "-0.4%" },
  ];

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-gray-500">Here's what's happening with your email campaigns today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-brand-950 p-6 rounded-xl border border-brand-100 dark:border-brand-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-lg bg-brand-50 dark:bg-brand-900 flex items-center justify-center">
                <stat.icon className="h-5 w-5 text-brand-900 dark:text-brand-50" />
              </div>
              <span className={`text-sm font-medium ${stat.trend.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {stat.trend}
              </span>
            </div>
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{stat.title}</h3>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-brand-950 p-6 rounded-xl border border-brand-100 dark:border-brand-800 shadow-sm">
        <h3 className="text-lg font-semibold mb-6">Engagement Overview</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#71717a" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#71717a" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorOpened" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a1a1aa" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#a1a1aa" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #3f3f46', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#18181b', color: '#f4f4f5' }}
              />
              <Area type="monotone" dataKey="sent" stroke="#d4d4d8" strokeWidth={2} fillOpacity={1} fill="url(#colorSent)" />
              <Area type="monotone" dataKey="opened" stroke="#a1a1aa" strokeWidth={2} fillOpacity={1} fill="url(#colorOpened)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
