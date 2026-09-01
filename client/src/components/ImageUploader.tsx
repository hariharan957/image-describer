import { useCallback, useEffect, useRef, useState } from 'react';
import { Image as ImageIcon, Upload, X, ClipboardPaste, FileImage } from 'lucide-react';
import type { Style } from '../lib/api';

interface Props {
  file: { dataUrl: string; base64: string; mime: string; name: string; size: number } | null;
  onSelect: (file: { dataUrl: string; base64: string; mime: string; name: string; size: number }) => void;
  onClear: () => void;
  style: Style;
  onStyleChange: (s: Style) => void;
  disabled?: boolean;
}

const STYLES: { id: Style; label: string; hint: string }[] = [
  { id: 'detailed', label: 'Detailed', hint: '4-6 sentences, covers everything' },
  { id: 'concise', label: 'Concise', hint: '1-2 sentences, just the gist' },
  { id: 'creative', label: 'Creative', hint: 'Vivid, sensory narration' },
  { id: 'bullet', label: 'Bullets', hint: 'Structured observations' },
  { id: 'tags', label: 'Tags', hint: 'Keyword list only' },
];

function fileToPayload(file: File) {
  return new Promise<{ dataUrl: string; base64: string; mime: string; name: string; size: number }>(
    (resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Could not read file'));
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(',')[1] || '';
        resolve({ dataUrl, base64, mime: file.type, name: file.name, size: file.size });
      };
      reader.readAsDataURL(file);
    }
  );
}

export default function ImageUploader({ file, onSelect, onClear, style, onStyleChange, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accept = useCallback(async (f: File) => {
    setError(null);
    if (!f.type.startsWith('image/')) {
      setError('Only image files are supported.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File is too large. Max 10 MB.');
      return;
    }
    const payload = await fileToPayload(f);
    onSelect(payload);
  }, [onSelect]);

  // Paste from clipboard
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (disabled) return;
      const item = [...(e.clipboardData?.items || [])].find((i) => i.type.startsWith('image/'));
      if (!item) return;
      const f = item.getAsFile();
      if (f) accept(f);
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [accept, disabled]);

  return (
    <div className="card p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Upload</h2>
        {file && (
          <button onClick={onClear} className="btn-ghost text-xs">
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={async (e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f) await accept(f);
        }}
        onClick={() => inputRef.current?.click()}
        className={[
          'group relative cursor-pointer rounded-xl border-2 border-dashed transition p-6',
          dragging ? 'border-accent-500 bg-accent-500/10' : 'border-white/10 hover:border-white/20 bg-ink-800/40',
          file ? 'p-3' : '',
        ].join(' ')}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) await accept(f);
            e.target.value = '';
          }}
        />
        {file ? (
          <div className="flex items-center gap-3">
            <img src={file.dataUrl} alt="preview" className="w-20 h-20 object-cover rounded-lg ring-1 ring-white/10" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-100 truncate">
                <FileImage className="w-4 h-4 text-accent-400 shrink-0" />
                <span className="truncate">{file.name}</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {(file.size / 1024).toFixed(1)} KB · {file.mime}
              </div>
              <div className="text-xs text-accent-400 mt-1.5">Click to choose a different image</div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center gap-2 py-2">
            <div className="w-12 h-12 rounded-full bg-accent-500/15 text-accent-400 flex items-center justify-center group-hover:scale-105 transition">
              <Upload className="w-5 h-5" />
            </div>
            <div className="text-sm font-medium text-slate-200">Drop an image, click to browse, or paste</div>
            <div className="text-xs text-slate-400">PNG, JPG, GIF, WebP up to 10 MB</div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <ClipboardPaste className="w-3.5 h-3.5" /> Ctrl+V works anywhere
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div>
        <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Style</div>
        <div className="flex flex-wrap gap-2">
          {STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => onStyleChange(s.id)}
              className={['chip', style === s.id ? 'chip-active' : ''].join(' ')}
              title={s.hint}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {STYLES.find((s) => s.id === style)?.hint}
        </p>
      </div>
    </div>
  );
}
