import React from 'react';
import { motion } from 'motion/react';
import { Target } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface CampaignItem {
  subject: string;
  total: number;
  sent: number;
  failed: number;
  openRate: number;
  clickRate: number;
  deliveryRate: number;
}

interface CampaignIntelligenceProps {
  campaigns: CampaignItem[];
  selectedCampaign: string;
}

export function CampaignIntelligence({ campaigns, selectedCampaign }: CampaignIntelligenceProps) {
  if (campaigns.length === 0 || selectedCampaign !== 'all') return null;

  return (
    <div className="space-y-6 mt-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-onyx-400 rounded-xl border border-onyx-300">
            <Target className="w-5 h-5 text-soft-linen" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-soft-linen tracking-tight">Campaign Intelligence</h3>
            <p className="text-xs text-silver/60 mt-0.5 font-medium">Real-time performance across dispatched sequences.</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-xs text-soft-linen/80 hover:text-white border border-onyx-400 hover:border-onyx-300 rounded-xl font-semibold px-4">
          View All
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {campaigns.slice(0, 5).map((campaign, idx) => (
          <motion.div
            key={campaign.subject}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05, duration: 0.4 }}
            className="group relative bg-onyx/30 backdrop-blur-md border border-onyx-400 rounded-[24px] p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-soft-linen/20 hover:bg-onyx/40 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-soft-linen/[0.01]"
          >
            <div className="flex items-start lg:items-center gap-5 flex-1">
              <div className="flex flex-col items-center justify-center">
                <span className={cn(
                  "text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border shadow-inner",
                  campaign.deliveryRate > 0.8 
                    ? "bg-green-500/10 text-green-400 border-green-500/20" 
                    : "bg-silver/10 text-silver border-silver/20"
                )}>
                  {campaign.deliveryRate > 0.8 ? 'FINISHED' : 'DRAFT'}
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-bold text-soft-linen tracking-tight group-hover:text-white transition-colors">
                  {campaign.subject}
                </h4>
                <div className="flex items-center gap-2.5 text-[11px] text-silver/50 font-medium">
                  <span>Broadcast Node</span>
                  <span className="w-1 h-1 rounded-full bg-onyx-400" />
                  <div className="flex items-center gap-1.5 text-soft-linen/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-soft-linen/80" />
                    <span>Default List</span>
                  </div>
                </div>
                <div className="pt-2">
                  <span className="text-[8px] font-bold px-2 py-0.5 bg-onyx-400 border border-onyx-300 text-silver/80 rounded uppercase tracking-wider">
                    seq-{idx + 1}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap lg:flex-nowrap items-center gap-8 lg:gap-12 border-t lg:border-t-0 border-onyx-400/50 pt-4 lg:pt-0">
              <div className="flex gap-8 text-[11px]">
                <div>
                  <span className="text-silver/40 block uppercase font-bold tracking-widest text-[9px] mb-1">Created</span>
                  <span className="text-soft-linen/80 font-medium whitespace-nowrap">Mon, 27 Apr</span>
                </div>
                {campaign.deliveryRate > 0.8 && (
                  <div>
                    <span className="text-silver/40 block uppercase font-bold tracking-widest text-[9px] mb-1">Finalized</span>
                    <span className="text-soft-linen/80 font-medium whitespace-nowrap">Tue, 28 Apr</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-4 gap-6 lg:gap-8 bg-onyx-400/20 border border-onyx-400/40 rounded-2xl p-4 lg:p-5 flex-1 min-w-[280px]">
                <div className="text-center">
                  <span className="text-[9px] text-silver/40 block uppercase font-bold tracking-wider mb-1">Views</span>
                  <span className="text-sm font-bold text-soft-linen font-mono">
                    {Math.floor(campaign.sent * campaign.openRate).toLocaleString()}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-[9px] text-silver/40 block uppercase font-bold tracking-wider mb-1">Clicks</span>
                  <span className="text-sm font-bold text-soft-linen font-mono">
                    {Math.floor(campaign.sent * campaign.clickRate).toLocaleString()}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-[9px] text-silver/40 block uppercase font-bold tracking-wider mb-1">Sent</span>
                  <span className="text-sm font-bold text-soft-linen font-mono">
                    {campaign.sent}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-[9px] text-silver/40 block uppercase font-bold tracking-wider mb-1">Bounce</span>
                  <span className="text-sm font-bold text-soft-linen font-mono">
                    {campaign.failed}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
