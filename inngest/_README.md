# ⚙️ inngest/ — Background Job Workers

Inngest lets the app run **long-running tasks in the background** (like generating a video) without blocking the user's browser.

```
inngest/
├── client.ts              ← Creates the Inngest connection (don't change this)
└── functions/
    ├── generate-video.ts  ← 🔥 The main video generation pipeline (10 steps)
    ├── check-scheduled-videos.ts ← Cron job to trigger scheduled videos
    └── hello.ts           ← Simple test function to verify Inngest is working
```

## The Video Generation Pipeline (generate-video.ts)

When a user schedules a video, `generate-video.ts` runs these steps in order:

1. **Fetch project** — loads the project data from Supabase
2. **Generate script** — calls Gemini AI to write the script
3. **Generate voice** — converts script to MP3 audio
4. **Generate captions** — transcribes audio into word-level captions
5. **Generate images** — creates AI images from the script
6. **Render video** — sends everything to Remotion on AWS Lambda
7. **Save results** — writes all URLs back to Supabase
8. **Send email** — notifies the user via Plunk
9. **Publish to YouTube** — (if configured)

## 👉 Running Inngest locally

```bash
npm run inngest
```

Then Inngest DevServer is available at **http://localhost:8288**
