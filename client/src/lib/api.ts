export type Style = 'detailed' | 'concise' | 'creative' | 'tags' | 'bullet';

export interface HistoryItem {
  id: string;
  fileName: string;
  mime: string;
  image: string; // base64
  style: Style;
  description: string;
  summary: string;
  createdAt: string;
}

export interface DescribeResult {
  id: string;
  description: string;
  summary: string;
}

export async function checkHealth(): Promise<{ ok: boolean; configured: boolean; model: string }> {
  const res = await fetch('/api/health');
  if (!res.ok) throw new Error('Server not reachable');
  return res.json();
}

export async function describeImage(
  image: string,
  mime: string,
  style: Style,
  fileName: string
): Promise<DescribeResult> {
  const res = await fetch('/api/describe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image, mime, style, fileName }),
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  return res.json();
}

export async function fetchHistory(): Promise<HistoryItem[]> {
  const res = await fetch('/api/history');
  if (!res.ok) throw new Error('Failed to load history');
  const data = await res.json();
  return data.items || [];
}

export async function clearHistory(): Promise<void> {
  await fetch('/api/history', { method: 'DELETE' });
}
