import { useCallback, useEffect, useMemo, useState } from 'react';
import { Sparkles, KeyRound, Github } from 'lucide-react';
import ImageUploader from './components/ImageUploader';
import DescriptionPanel from './components/DescriptionPanel';
import HistoryGrid from './components/HistoryGrid';
import StatsBar from './components/StatsBar';
import { checkHealth, clearHistory, describeImage, fetchHistory, type HistoryItem, type Style } from './lib/api';

type UploadedFile = {
  dataUrl: string;
  base64: string;
  mime: string;
  name: string;
  size: number;
};

export default function App() {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [style, setStyle] = useState<Style>('detailed');
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [health, setHealth] = useState<{ configured: boolean; model: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const h = await checkHealth();
        setHealth({ configured: h.configured, model: h.model });
      } catch {
        setHealth({ configured: false, model: 'server offline' });
      }
      try {
        setHistory(await fetchHistory());
      } catch {/* ignore */}
    })();
  }, []);

  const onDescribe = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setDescription('');
    try {
      const result = await describeImage(file.base64, file.mime, style, file.name);
      setDescription(result.description);
      const fresh = await fetchHistory();
      setHistory(fresh);
    } catch (e: any) {
      setError(e?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [file, style]);

  const onClearHistory = useCallback(async () => {
    await clearHistory();
    setHistory([]);
  }, []);

  const onPickFromHistory = useCallback((item: HistoryItem) => {
    setFile({
      dataUrl: `data:${item.mime};base64,${item.image}`,
      base64: item.image,
      mime: item.mime,
      name: item.fileName,
      size: 0,
    });
    setStyle(item.style);
    setDescription(item.description);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const avgLength = useMemo(() => {
    if (history.length === 0) return 0;
    return Math.round(
      history.reduce((s, h) => s + h.description.length, 0) / history.length
    );
  }, [history]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-white/5 bg-ink-950/40 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-100 leading-tight">Image Describer</div>
              <div className="text-[11px] text-slate-400 leading-tight">Powered by OpenRouter Vision</div>
            </div>
          </div>
          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5" />
            {health?.configured ? 'API key configured' : 'Set up API key →'}
          </a>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-5 py-6 space-y-6">
        {!health?.configured && (
          <div className="card p-4 border-amber-500/20 bg-amber-500/5">
            <div className="flex items-start gap-3">
              <KeyRound className="w-5 h-5 text-amber-300 mt-0.5 shrink-0" />
              <div className="text-sm text-amber-100/90">
                <span className="font-semibold text-amber-200">API key not set.</span>{' '}
                Add your <code className="px-1.5 py-0.5 rounded bg-black/30 text-amber-200">OPENROUTER_API_KEY</code> to{' '}
                <code className="px-1.5 py-0.5 rounded bg-black/30 text-amber-200">image-describer/server/.env</code>{' '}
                and restart the server. Get a free one at{' '}
                <a
                  className="underline text-amber-200"
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noreferrer"
                >
                  openrouter.ai/keys
                </a>
                . The dashboard still works — you just won't get a description.
              </div>
            </div>
          </div>
        )}

        <StatsBar
          total={history.length}
          avgLength={avgLength}
          configured={!!health?.configured}
          model={health?.model || 'claude-sonnet-5'}
        />

        <div className="grid lg:grid-cols-[380px,1fr] gap-6">
          <div className="space-y-4 lg:sticky lg:top-20 self-start">
            <ImageUploader
              file={file}
              onSelect={setFile}
              onClear={() => { setFile(null); setDescription(''); setError(null); }}
              style={style}
              onStyleChange={setStyle}
              disabled={loading}
            />
            <button
              onClick={onDescribe}
              disabled={!file || loading}
              className="btn-primary w-full justify-center text-base py-3"
            >
              <Sparkles className="w-4 h-4" />
              {loading ? 'Describing…' : 'Describe image'}
            </button>
            {file && (
              <div className="text-xs text-slate-500 text-center">
                Style: <span className="text-slate-300 capitalize">{style}</span> ·{' '}
                {(file.size / 1024).toFixed(1)} KB
              </div>
            )}
          </div>

          <div className="space-y-6">
            <DescriptionPanel
              file={file}
              description={description}
              loading={loading}
              error={error}
              style={style}
            />
            <HistoryGrid items={history} onSelect={onPickFromHistory} onClear={onClearHistory} />
          </div>
        </div>
      </main>

      <footer className="border-t border-white/5 py-4 text-center text-xs text-slate-500">
        Built with React, Vite, Tailwind, and the Anthropic API ·{' '}
        <span className="text-slate-400">Images and descriptions stay on your local machine.</span>
      </footer>
    </div>
  );
}
