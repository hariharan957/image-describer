# Image Describer — Vision Dashboard

An interactive dashboard that takes an image as input and returns a detailed AI description powered by **OpenRouter** (vision-capable model, free tier available).

- Drag-and-drop, click to browse, or paste an image
- Pick a description style: **Detailed**, **Concise**, **Creative**, **Bullets**, **Tags**
- History grid of all previous uploads (click to re-open in a modal)
- Copy-to-clipboard for descriptions
- Dark, modern UI built with React + Vite + Tailwind

## Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, lucide-react
- **Backend:** Node.js, Express, OpenRouter REST API (no SDK — just `fetch`)
- **Model:** `nvidia/nemotron-nano-12b-v2-vl:free` by default (configurable via `OPENROUTER_MODEL`)

## Project layout

```
image-describer/
├── client/      React + Vite dashboard
├── server/      Express API that calls Claude
├── package.json Root scripts (concurrently)
└── .gitignore
```

## Setup

### 1. Install everything

```bash
cd image-describer
npm install
npm --prefix server install
npm --prefix client install
```

Or the shortcut:

```bash
npm run install:all
```

### 2. Add your OpenRouter API key

```bash
cp server/.env.example server/.env
# then edit server/.env and set:
# OPENROUTER_API_KEY=sk-or-v1-...
```

You can get a free key at https://openrouter.ai/keys. Any OpenRouter model that supports image input will work — set `OPENROUTER_MODEL=...` in `server/.env` to override the default.

> ⚠️ OpenRouter's `:free` tier logs prompts and outputs to improve the providers' models. Don't upload anything private. Switch to a paid model for privacy.

### 3. Start dev (client + server together)

```bash
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:3001  (`GET /api/health` → `{ ok: true, configured: true }`)

## How it works

1. You upload an image in the browser (max 10 MB, stored as base64 in memory only).
2. The client POSTs `{ image, mime, style, fileName }` to `/api/describe`.
3. The server sends the image + a style-specific prompt to OpenRouter (`/api/v1/chat/completions`).
4. The description comes back and is shown in the right panel; a thumbnail is added to the history grid.
5. The server keeps the last 100 items in memory (no DB) — they survive page refreshes but are cleared on server restart.

## API

| Method | Path                | Description                                      |
|--------|---------------------|--------------------------------------------------|
| GET    | `/api/health`       | `{ ok, configured, model }`                      |
| POST   | `/api/describe`     | `{ image, mime, style, fileName }` → description |
| GET    | `/api/history`      | List of past descriptions                        |
| GET    | `/api/history/:id`  | One history item                                 |
| DELETE | `/api/history`      | Clear all history                                |

## Notes

- **Privacy:** images and descriptions are kept in the server's memory only and never logged.
- **No API key?** The dashboard still works, you'll see a banner explaining how to set `OPENROUTER_API_KEY`, and `/api/describe` will return a clear 503 error.
- **Cost:** Default model is free (`:free` tier). Other OpenRouter models are pay-per-token — usually cents per image.
