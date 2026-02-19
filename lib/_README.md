# 📦 lib/ — Service Clients & Utility Functions

This folder contains all the **"glue code"** that connects the app to external services. Think of each file as a helper that knows how to talk to one specific service.

| File | What it does |
|---|---|
| `gemini.ts` | Uses Google Gemini AI to **write the video script** |
| `voice.ts` | Converts the script to **audio** using Deepgram or Fonada |
| `caption.ts` | Turns the audio into **word-level captions** using Deepgram |
| `image.ts` | Generates **AI images** for the video using Replicate |
| `supabase.ts` | Browser-safe Supabase client (use in client components) |
| `supabase-admin.ts` | Admin Supabase client (use in server actions / API routes only) |
| `subscription.ts` | Defines plan limits (Free/Basic/Unlimited) and checks if user can create |
| `plunk.ts` | Email client to send notifications via Plunk |
| `utils.ts` | Small helpers like `cn()` for combining CSS class names |

## 👉 How to edit

- **Change the video script prompt?** → Edit `gemini.ts`
- **Change the voice provider?** → Edit `voice.ts`
- **Change subscription plan limits?** → Edit `subscription.ts`
- **Add a new external service?** → Create a new file here, e.g. `tiktok.ts`
