import { useEffect, useRef, useState } from 'react';
import { Sparkles, Loader2, AlertTriangle, Copy, Check, ImageIcon } from 'lucide-react';
import type { Style } from '../lib/api';

interface Props {
  file: { dataUrl: string; name: string; size: number; mime: string } | null;
  description: string;
  loading: boolean;
  error: string | null;
  style: Style;
}

function renderFormatted(text: string, style: Style) {
  if (style === 'bullet') {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => l.replace(/^[-*•·]\s*/, ''));
    return (
      <ul className="space-y-2 list-disc pl-5 marker:text-accent-400">
        {lines.map((l, i) => (
          <li key={i}>{l}</li>
        ))}
      </ul>
    );
  }
  if (style === 'tags') {
    const tags = text
      .split(/[,\n]/)
      .map((t) => t.trim())
      .filter(Boolean);
    return (
      <div className="flex flex-wrap gap-2">
        {tags.map((t, i) => (
          <span key={i} className="chip chip-active">{t}</span>
        ))}
      </div>
    );
  }
  return <p className="whitespace-pre-wrap leading-relaxed text-slate-100">{text}</p>;
}

export default function DescriptionPanel({ file, description, loading, error, style }: Props) {
  const [copied, setCopied] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent-400" />
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Description
          </h2>
          {style && (
            <span className="text-xs text-slate-500 capitalize">· {style}</span>
          )}
        </div>
        {description && !loading && (
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(description);
                setCopied(true);
              } catch { /* ignore */ }
            }}
            className="btn-ghost text-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-5 gap-0">
        {/* Image preview */}
        <div className="md:col-span-2 bg-ink-950/60 p-4 flex items-center justify-center min-h-[280px] border-b md:border-b-0 md:border-r border-white/5">
          {file ? (
            <img
              src={file.dataUrl}
              alt={file.name}
              className="max-h-[420px] w-auto rounded-lg ring-1 ring-white/10 object-contain"
            />
          ) : (
            <div className="text-center text-slate-500 space-y-2">
              <ImageIcon className="w-10 h-10 mx-auto opacity-50" />
              <p className="text-sm">Upload an image to see a description here.</p>
            </div>
          )}
        </div>

        {/* Description text */}
        <div className="md:col-span-3 p-5 min-h-[280px] flex flex-col">
          {loading ? (
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Loader2 className="w-4 h-4 animate-spin text-accent-400" />
                Analyzing image with Claude…
              </div>
              <div className="space-y-2">
                <div className="h-3 rounded shimmer" />
                <div className="h-3 rounded shimmer w-11/12" />
                <div className="h-3 rounded shimmer w-10/12" />
                <div className="h-3 rounded shimmer w-8/12" />
              </div>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-semibold text-rose-300">Couldn't describe the image</div>
                <div className="text-sm text-slate-300 mt-1">{error}</div>
              </div>
            </div>
          ) : description ? (
            <div ref={textRef} className="text-[15px] text-slate-100 flex-1">
              {renderFormatted(description, style)}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-slate-500">
              Pick an image, then click <span className="text-slate-300 mx-1 font-medium">Describe image</span>.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
