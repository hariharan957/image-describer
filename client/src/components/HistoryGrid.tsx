import { useState } from 'react';
import { History, Trash2, X, Calendar, Tag as TagIcon } from 'lucide-react';
import type { HistoryItem } from '../lib/api';

interface Props {
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function HistoryGrid({ items, onSelect, onClear }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = items.find((i) => i.id === openId) || null;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-accent-400" />
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            History
          </h2>
          <span className="text-xs text-slate-500">· {items.length} {items.length === 1 ? 'image' : 'images'}</span>
        </div>
        {items.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Clear all history?')) onClear();
            }}
            className="btn-ghost text-xs"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center text-slate-500 py-10 text-sm">
          No descriptions yet. Upload an image to start your history.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {items.map((it) => (
            <button
              key={it.id}
              onClick={() => { onSelect(it); setOpenId(it.id); }}
              className="group text-left rounded-xl border border-white/5 bg-ink-800/40 hover:border-accent-500/50 hover:bg-ink-800 transition overflow-hidden"
            >
              <div className="aspect-square bg-ink-950 overflow-hidden">
                <img
                  src={`data:${it.mime};base64,${it.image}`}
                  alt={it.fileName}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
              </div>
              <div className="p-2.5 space-y-1.5">
                <div className="text-xs font-medium text-slate-200 truncate">{it.fileName}</div>
                <div className="text-[11px] text-slate-400 line-clamp-2">{it.summary}</div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span className="inline-flex items-center gap-1">
                    <TagIcon className="w-3 h-3" /> {it.style}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {formatTime(it.createdAt)}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpenId(null)}
        >
          <div
            className="card max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-100 truncate">{open.fileName}</div>
                <div className="text-xs text-slate-400">
                  {open.style} · {formatTime(open.createdAt)}
                </div>
              </div>
              <button onClick={() => setOpenId(null)} className="btn-ghost text-xs">
                <X className="w-3.5 h-3.5" /> Close
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-0 overflow-auto">
              <div className="bg-ink-950 p-4 flex items-center justify-center">
                <img
                  src={`data:${open.mime};base64,${open.image}`}
                  alt={open.fileName}
                  className="max-h-[60vh] w-auto rounded-lg object-contain"
                />
              </div>
              <div className="p-5 text-sm text-slate-100 whitespace-pre-wrap leading-relaxed">
                {open.description}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
