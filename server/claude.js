import 'dotenv/config';

const STYLE_PROMPTS = {
  detailed:
    'Provide a detailed, thorough description of the image. Cover the main subject, setting, colors, composition, mood, and any notable details or text visible. Aim for 4-6 sentences.',
  concise:
    'Give a concise 1-2 sentence description of the most important thing in the image.',
  creative:
    'Write a vivid, engaging description of the image as if narrating to someone who cannot see it. Use sensory language. Aim for 4-6 sentences.',
  tags:
    'Respond with ONLY a comma-separated list of 8-15 descriptive tags or keywords that best describe the image. No other text.',
  bullet:
    'Describe the image as a bulleted list of observations: subject, setting, colors, text, mood, notable details. Use markdown bullet points.',
};

export const DEFAULT_MODEL = 'google/gemini-2.5-flash';

export function isConfigured() {
  return Boolean(process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.startsWith('sk-'));
}

export function currentModel() {
  return process.env.OPENROUTER_MODEL || DEFAULT_MODEL;
}

export function buildPrompt(style) {
  const styleInstruction = STYLE_PROMPTS[style] || STYLE_PROMPTS.detailed;
  return `You are an expert image captioning assistant. Look carefully at the image and ${styleInstruction}`;
}

export async function describeImage({ base64, mime, style = 'detailed', signal }) {
  if (!isConfigured()) {
    throw new Error('OPENROUTER_API_KEY is not configured. Add it to server/.env and restart the server.');
  }
  const model = currentModel();
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      // OpenRouter recommends these for the app attribution; harmless if you skip.
      'HTTP-Referer': 'http://localhost:5173',
      'X-Title': 'Image Describer Dashboard',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mime};base64,${base64}` },
            },
            { type: 'text', text: buildPrompt(style) },
          ],
        },
      ],
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    let message = `OpenRouter request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error?.message) message = data.error.message;
    } catch { /* ignore */ }
    throw new Error(message);
  }

  const data = await res.json();
  const text = (data?.choices?.[0]?.message?.content || '').trim();
  if (!text) {
    throw new Error('Model returned an empty response. Try a different model or check your OpenRouter rate limits.');
  }
  return text;
}
