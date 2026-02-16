# Vediomax — Project Notes (for teammates)

This file explains what was built, what problems we hit, and how to test **without repeatedly spending paid API credits**.

## What this app is

Vediomax is a short-form video “series” generator:

- User creates a **series** in the dashboard (topic, language/voice, style, captions, schedule).
- Clicking **Generate Video** triggers an **Inngest job** that generates assets:
  - Script (Gemini)
  - Voiceover audio (Deepgram or Fonada)
  - Captions (Deepgram transcription)
  - Images (Replicate FLUX Schnell)
- Assets are saved to **Supabase** (DB + Storage).

## Tech stack (high level)

- **Next.js App Router** (`app/`)
- **Clerk** for authentication
- **Supabase**
  - Postgres table: `video_projects`
  - Storage buckets:
    - `generated-voice` (mp3)
    - `generated-images` (png/jpg/webp)
- **Inngest** for background orchestration
- **Gemini** for script generation
- **Deepgram** for voice + captions
- **Replicate** for image generation (paid credits)

## Where the generation pipeline lives

- Inngest handler route: `app/api/inngest/route.ts`
- Inngest function: `inngest/functions/generate-video.ts`
- Trigger endpoint (UI calls this): `app/api/generate/route.ts`

### Inngest steps (current)

1. **Fetch project** from `video_projects` (Supabase)
2. **Script** (Gemini) → stored as `video_projects.script_data` (json)
3. **Voice** (Deepgram/Fonada) → stored in Storage + URL saved in DB as `video_projects.voice_url`
4. **Captions** (Deepgram STT) → stored in DB as `video_projects.captions` (json)
5. **Images** (Replicate FLUX Schnell) → stored in Storage + URLs saved in DB as `video_projects.image_urls` (json array)
6. **Save** fields to DB + status updates

## How we avoid spending credits repeatedly (important)

Paid API calls (Gemini / Deepgram / Replicate) can get expensive.

### Reuse-by-default behavior

The Inngest function is implemented to **reuse already-generated assets** from the database:

- If `script_data` exists → it **does not call Gemini again**
- If `voice_url` exists → it **does not call Deepgram/Fonada TTS again**
- If `captions` exists → it **does not call Deepgram transcription again**
- If `image_urls` exists → it **does not call Replicate again**

### Force regeneration (explicit spend)

`POST /api/generate` supports:

- `force: true` → regenerate and spend credits again
- default is `force: false` → reuse if possible

### Reuse-only test mode (never spend)

`POST /api/generate` supports:

- `reuseOnly: true` → the run will **never call paid APIs**
  - If something is missing, the run fails early (so we don’t accidentally spend).

This is used by the Dashboard **TEST card** (see below).

### Hydration from Storage (when DB fields are missing)

Sometimes the files exist in Supabase Storage but the DB columns weren’t saved (or saving failed earlier).
In **reuseOnly** mode, the pipeline tries to “hydrate” missing fields:

- If `voice_url` is missing, it lists `generated-voice/<projectId>/` and writes the newest mp3 public URL back to `video_projects.voice_url`.
- If `image_urls` is missing, it lists `generated-images/<projectId>/` and writes a list of newest image URLs back to `video_projects.image_urls`.

Captions cannot be hydrated from Storage (they’re text), so captions must exist in DB for reuse-only tests.

## Dashboard TEST card (for safe testing)

File: `app/dashboard/components/TestCard.tsx` (rendered in `SeriesList.tsx`)

What it does:

- Lets you choose a series from a dropdown (“Using …”).
- Clicking **Run Test** triggers `/api/generate` with `reuseOnly: true`.
- This creates an Inngest run you can inspect in the Inngest dashboard.

## Supabase schema expectations

Table: `video_projects` should have these columns (in addition to your existing ones):

- `voice_url` (text)
- `script_data` (jsonb)
- `captions` (jsonb)
- `image_urls` (jsonb, default `[]`)

Migrations live under `supabase/migrations/`.

## Environment variables (do NOT commit secrets)

Required server-side keys (examples only):

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DEEPGRAM_API_KEY`
- `FONODA_API_KEY` (if using Fonada languages)
- `NEXT_PUBLIC_GEMINI_API_KEY`
- `REPLICATE_API_TOKEN`

If a token/key is ever pasted into chat or logs, **rotate it immediately**.

## How to run locally

From the project root (`vediomax/vediomax`):

```bash
npm run dev
```

In another terminal:

```bash
npm run inngest
```

## Common errors we saw

- **Replicate 402 Insufficient credit**: means the Replicate account has no credit/balance.
- **Env var missing**: usually fixed by restarting `npm run dev` after editing `.env.local`.
- **Supabase save “fetch failed”**: can happen with large payloads or transient network; we split DB updates and added retries.

## What’s still not implemented (future)

- Actual **video assembly** (FFmpeg) to combine images + voice + captions into a final video file
- Persisted **delete/pause** actions (UI currently updates local state only)
- Using `schedule_time` to actually schedule posting

