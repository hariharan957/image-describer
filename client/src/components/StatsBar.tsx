import { Image as ImageIcon, Sparkles, Activity } from 'lucide-react';
import type { HistoryItem } from '../lib/api';

interface Props {
  total: number;
  avgLength: number;
  configured: boolean;
  model: string;
}

export default function StatsBar({ total, avgLength, configured, model }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Stat icon={<ImageIcon className="w-4 h-4" />} label="Uploads" value={total.toString()} />
      <Stat icon={<Sparkles className="w-4 h-4" />} label="Avg. length" value={`${avgLength} chars`} />
      <Stat
        icon={<Activity className="w-4 h-4" />}
        label="Status"
        value={configured ? 'API ready' : 'No API key'}
        tone={configured ? 'good' : 'warn'}
      />
      <Stat icon={<Sparkles className="w-4 h-4" />} label="Model" value={model} subtle />
    </div>
  );
}

function Stat({
  icon, label, value, tone, subtle,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: 'good' | 'warn';
  subtle?: boolean;
}) {
  const valueClass = tone === 'good'
    ? 'text-emerald-300'
    : tone === 'warn'
    ? 'text-amber-300'
    : 'text-slate-100';
  return (
    <div className="card p-3.5 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${subtle ? 'bg-white/5 text-slate-400' : 'bg-accent-500/15 text-accent-400'}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{label}</div>
        <div className={`text-sm font-semibold truncate ${valueClass}`}>{value}</div>
      </div>
    </div>
  );
}
