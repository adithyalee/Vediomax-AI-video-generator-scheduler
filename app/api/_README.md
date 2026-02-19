# 🔌 app/api/ — Backend API Routes

These are **server-side only** API endpoints. They handle logic that should never run in the user's browser (like writing to the database or calling paid APIs).

```
api/
├── inngest/
│   └── route.ts       ← Registers all Inngest background job functions
│                        ⚠️ Don't delete this — Inngest won't work without it
│
├── generate/
│   └── route.ts       ← POST /api/generate
│                        Manually fires the video generation event for a project
│
├── video-series/
│   └── route.ts       ← GET/POST /api/video-series
│                        Fetches or creates video project records
│
└── auth/youtube/
    └── callback/
        └── route.ts   ← Handles YouTube OAuth login callback
```

## ⚠️ Important

- These files run **only on the server** — safe to use `supabase-admin.ts` and secret keys here
- They follow Next.js Route Handler conventions: export `GET`, `POST`, etc.
