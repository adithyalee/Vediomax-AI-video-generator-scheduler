# 🌐 app/ — All Pages of the Website

This folder follows **Next.js App Router** conventions. Each subfolder with a `page.tsx` becomes its own URL route.

```
app/
├── page.tsx          ← Home page (https://yourdomain.com/)
├── layout.tsx        ← Root HTML wrapper — adds fonts, theme provider, Clerk auth
├── globals.css       ← Global CSS styles (dark background, typography)
│
├── sign-in/          ← Sign-in page at /sign-in (auto-handled by Clerk)
├── sign-up/          ← Sign-up page at /sign-up (auto-handled by Clerk)
│
├── dashboard/        ← The logged-in area of the app (see dashboard/_README.md)
│
└── api/              ← Server-side API endpoints
    ├── inngest/      ← Inngest webhook (do not delete – required for background jobs)
    ├── generate/     ← POST endpoint to manually trigger video generation
    ├── video-series/ ← GET/POST for video project CRUD
    └── auth/youtube/ ← YouTube OAuth redirect callback
```

## ⚠️ Important Rules (Next.js)

- Every `page.tsx` is a **page** (URL route)
- Every `layout.tsx` wraps all child pages in that folder
- Files in `api/` are **server-only** backend functions, not pages
- Never put secret keys in files starting with `page.tsx` — they'll be sent to the browser!
