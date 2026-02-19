# 🎬 VideoMax — Beginner's Guide to the Codebase

Welcome! This document explains every folder and file in the project so you know exactly where to go when you want to make a change.

---

## 📁 Project Map

```
vediomax/
├── app/                        ← All pages (the website)
│   ├── page.tsx                ← The landing / home page
│   ├── layout.tsx              ← Root HTML shell (fonts, theme)
│   ├── globals.css             ← Global styles
│   ├── sign-in/                ← Sign-in page (powered by Clerk)
│   ├── sign-up/                ← Sign-up page (powered by Clerk)
│   ├── dashboard/              ← Everything inside the app after login
│   │   ├── page.tsx            ← Main dashboard overview page
│   │   ├── layout.tsx          ← Dashboard shell (includes the sidebar)
│   │   ├── create/             ← "Create New Series" wizard (6 steps)
│   │   ├── create-new/         ← Alias/redirect for create
│   │   ├── videos/             ← "My Videos" list page
│   │   ├── billing/            ← Subscription & billing page
│   │   ├── settings/           ← Account settings page
│   │   └── components/         ← Shared dashboard-only components
│   └── api/                    ← Backend API (server-side only)
│       ├── inngest/            ← Inngest webhook listener
│       ├── generate/           ← API to manually trigger generation
│       ├── video-series/       ← API to list/manage video projects
│       └── auth/youtube/       ← YouTube OAuth callback handler
│
├── components/                 ← Reusable UI building blocks
│   ├── ui/                     ← shadcn/ui base components (buttons, cards, etc.)
│   ├── emails/                 ← Email templates (VideoReadyEmail)
│   ├── billing/                ← Pricing table, plan cards
│   ├── Sidebar.tsx             ← The left navigation sidebar
│   ├── UpgradeModal.tsx        ← "Upgrade your plan" popup
│   └── WizardFooter.tsx        ← Back / Next buttons in the wizard
│
├── lib/                        ← Utility functions & service clients
│   ├── supabase.ts             ← Supabase client (browser-safe)
│   ├── supabase-admin.ts       ← Supabase admin client (server-only)
│   ├── gemini.ts               ← Google Gemini AI (script generation)
│   ├── voice.ts                ← Text-to-Speech (Deepgram / Fonada)
│   ├── caption.ts              ← Caption generation (Deepgram)
│   ├── image.ts                ← AI image generation (Replicate)
│   ├── plunk.ts                ← Email sending client (Plunk)
│   ├── subscription.ts         ← Subscription tier limits & checks
│   └── utils.ts                ← Helper functions (e.g. cn())
│
├── inngest/                    ← Background job workers
│   ├── client.ts               ← Inngest client setup
│   └── functions/
│       ├── generate-video.ts   ← Main video generation pipeline
│       ├── check-scheduled-videos.ts ← Scheduled video trigger
│       └── hello.ts            ← Test function
│
├── remotion/                   ← Video rendering (Remotion)
│   └── ...                     ← Composition, root, exported props
│
├── supabase/
│   └── migrations/             ← SQL migration history for the database
│
├── scripts/
│   └── deploy-lambda.ts        ← Script to deploy Remotion to AWS Lambda
│
├── public/                     ← Static assets (images, fonts, etc.)
│
├── .env                        ← Non-secret environment variables
├── .env.local                  ← 🔑 Secret API keys (never commit this!)
├── middleware.ts               ← Route authentication guard (Clerk)
└── next.config.ts              ← Next.js configuration
```

---

## 🔑 Where are the API Keys?

All secret keys live in **`.env.local`**. Open that file to see all the services the app connects to:

| Variable | What it's for |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase browser (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase server (admin) key |
| `GEMINI_API_KEY` | Google AI script generation |
| `DEEPGRAM_API_KEY` | Voice & caption generation |
| `REPLICATE_API_TOKEN` | AI image generation |
| `AWS_ACCESS_KEY_ID` | AWS Lambda video rendering |
| `AWS_SECRET_ACCESS_KEY` | AWS Lambda video rendering |
| `REMOTION_SERVE_URL` | Deployed Remotion bundle URL |
| `REMOTION_FUNCTION_NAME` | Lambda function name |
| `NEXT_PUBLIC_CLERK_*` | User authentication (Clerk) |
| `PLUNK_API_KEY` | Sending emails |
| `GOOGLE_CLIENT_ID/SECRET` | YouTube OAuth |

---

## 🏗️ How the App Works (Simple Flow)

```
User fills wizard → scheduleSeries() (actions.ts)
  → Saves to Supabase (video_projects table)
  → Fires `app/video.generate` Inngest event
    → generate-video.ts runs steps in order:
        1. Gemini AI writes the script
        2. Deepgram/Fonada generates voice audio
        3. Deepgram generates word-level captions
        4. Replicate generates images
        5. Remotion Lambda renders the final video
        6. Results saved back to Supabase
        7. Email sent to user via Plunk
        8. (Optional) Video published to YouTube
```

---

## 🚀 Running the App Locally

```bash
# 1. Install packages
npm install

# 2. Start the Next.js dev server
npm run dev

# 3. In a separate terminal, start Inngest (background jobs)
npm run inngest
```

Then open **http://localhost:3000**.

---

## 🗄️ Database (Supabase)

The main tables are:

| Table | What it stores |
|---|---|
| `users` | User profiles + subscription tier |
| `video_projects` | Every video/series created |
| `video_assets` | Generated assets (script, voice, images, video) per project |
| `social_integrations` | Connected YouTube/TikTok/Instagram accounts |

SQL migration files are in **`supabase/migrations/`**.

---

## 📦 Subscription Tiers

Defined in **`lib/subscription.ts`**:

| Tier | Series Limit | Platforms |
|---|---|---|
| Free | 1 | YouTube only |
| Basic | 3 | YouTube only |
| Unlimited | Unlimited | YouTube, Instagram, TikTok |

---

## 🛠️ Common Tasks

| Task | Where to go |
|---|---|
| Change the landing page | `app/page.tsx` |
| Edit the dashboard homepage | `app/dashboard/page.tsx` |
| Change sidebar links | `components/Sidebar.tsx` |
| Add a new wizard step | `app/dashboard/create/components/` |
| Change pricing/plans | `components/billing/` + `lib/subscription.ts` |
| Fix video generation | `inngest/functions/generate-video.ts` |
| Change video rendering | `remotion/` |
| Modify email templates | `components/emails/` |
| Change API keys | `.env.local` |
| Run a database migration | `supabase/migrations/` |
