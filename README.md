# 🎬 Vediomax

An automated short-form video series generator that compiles scripts, voiceovers, captions, and AI-generated images into complete, publishable videos.

[![Next.js](https://img.shields.io/badge/Next.js-16.2.1-black.svg?logo=next.js)](#)
[![Remotion](https://img.shields.io/badge/Remotion-4.0.424-blue.svg?logo=remotion)](#)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green.svg?logo=supabase)](#)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-blueviolet.svg?logo=clerk)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#)

---

## 📋 Table of Contents
- [Project Overview](#-project-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [Contributing](#-contributing)
- [Roadmap](#-roadmap)
- [License](#-license)
- [Contact](#-contact)

---

## 🔍 Project Overview

Vediomax is an AI-powered short-form video "series" generator. The platform is designed to automate the process of creating and rendering content for platforms like YouTube Shorts, TikTok, and Instagram Reels. 

### Why it exists
Creating consistent short-form video content is incredibly time-consuming, requiring script writing, voiceover recording, subtitle sync, video editing, and stock asset gathering. Vediomax automates the entire pipeline by coordinating multiple AI models to do the heavy lifting in a scheduled or manual background flow.

### Who it's for
- **Content Creators** looking to maintain a high-frequency posting schedule.
- **Social Media Managers** aiming to automate video production for multiple channels.
- **Developers** interested in exploring video orchestration pipelines using Remotion, Supabase, Inngest, and modern Generative AI services.

---

## 📦 Features

- **Dynamic Series Wizard:** A 6-step wizard flow for users to define their video's topic, language/voice, artistic style, captions, and automated schedule.
- **Gemini AI Scripting:** Automatically writes engaging scripts customized to the selected topic and style.
- **Text-to-Speech (TTS):** Generates high-quality voiceovers in multiple languages using Deepgram or Fonada TTS.
- **Word-Level Subtitles:** Transcribes the voiceover with Deepgram STT to generate precise, timed word-level captions.
- **FLUX Schnell Image Generation:** Produces contextual images matching the generated script via Replicate.
- **Cloud Video Rendering:** Uses Remotion to assemble all assets (audio, captions, images) and renders the final MP4 via AWS Lambda.
- **Intelligent Credit Protection:** Prevents duplicate API spending during local development and testing by caching and reusing already-generated assets (`script`, `voice`, `captions`, `images`).
- **Dashboard Test Bench:** An interactive test card to run pipelines with `reuseOnly: true` (which hydrates missing assets from Supabase Storage without hitting paid APIs).
- **YouTube Integration:** Direct, automated publishing of rendered videos to YouTube via OAuth.
- **Email Notifications:** Delivers an email with the finished video link using the Plunk email service.

---

## 🛠 Tech Stack

- **Core Framework:** Next.js (App Router, React 19)
- **Styling & UI:** Vanilla CSS, TailwindCSS, Radix UI, Framer Motion, shadcn/ui
- **Authentication:** Clerk
- **Database & Storage:** Supabase (PostgreSQL & Supabase Storage)
- **Job Orchestration:** Inngest (Background runs, event-driven queues, retry logic)
- **Generative AI & API integrations:**
  - Google Gemini AI (`@google/genai`, `@google/generative-ai`)
  - Deepgram & Fonada (Text-to-Speech)
  - Deepgram (Speech-to-Text Transcription)
  - Replicate FLUX Schnell (Image generation)
- **Video Composition:** Remotion (CLI, Lambda, Player)
- **Email Client:** Plunk Email API
- **Deployment:** AWS Lambda (for rendering), Vercel (for Next.js app host)

---

## 📥 Installation

Follow these steps to set up Vediomax locally:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/username/vediomax.git
   cd vediomax/vediomax
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the `vediomax/vediomax` folder:
   ```bash
   touch .env.local
   ```
   *(Populate it using the variables listed in the [Configuration](#-configuration) section).*

---

## ▶️ Usage

### Run the App Locally

To start the local development environment, run the following commands in separate terminal sessions:

1. **Start the Next.js Dev Server:**
   ```bash
   npm run dev
   ```
   *The application will be running at [http://localhost:3000](http://localhost:3000).*

2. **Start the Inngest Dev Server:**
   ```bash
   npm run inngest
   ```
   *Access the Inngest Dev UI at [http://localhost:8288](http://localhost:8288) to monitor background jobs.*

### Safe Testing (Dashboard Test Card)

To run a generation pipeline test without spending real money on paid APIs:
1. Go to the dashboard.
2. Find the **TEST Card** (defined in `TestCard.tsx`).
3. Choose a series from the dropdown.
4. Click **Run Test**. This fires `/api/generate` with `reuseOnly: true`, using cached assets in your database/storage.

### Deploying Remotion Lambda

To bundle and deploy the video composition to AWS Lambda:
```bash
npm run deploy:lambda
```

---

## 📁 Project Structure

```
vediomax/
├── app/                        ← Next.js Pages & API Routes
│   ├── api/                    ← Server-side API endpoints (inngest, generate, video-series, auth/youtube)
│   ├── dashboard/              ← Logged-in dashboard pages (create series wizard, videos, settings)
│   ├── layout.tsx              ← Root HTML shell
│   └── globals.css             ← Global styling
├── components/                 ← Reusable UI building blocks
│   ├── ui/                     ← shadcn/ui components
│   ├── billing/                ← Pricing plans & upgrade modals
│   ├── emails/                 ← React Email templates
│   └── Sidebar.tsx             ← Navigation sidebar
├── inngest/                    ← Background jobs & workflows
│   ├── client.ts               ← Inngest client configuration
│   └── functions/              ← Worker logic (generate-video, check-scheduled-videos)
├── lib/                        ← Client SDK integrations & utilities
│   ├── supabase.ts             ← Supabase client setup
│   ├── gemini.ts               ← Gemini API scripts
│   ├── voice.ts                ← Text-to-Speech logic
│   └── subscription.ts         ← Subscription checks & limits
├── public/                     ← Static assets (images, fonts, icons)
├── remotion/                   ← Video compositions, roots, and elements
├── scripts/                    ← Automation scripts (Lambda deployment)
├── supabase/                   ← Database configurations & SQL migrations
├── package.json                ← Dependencies and scripts
└── middleware.ts               ← Auth guard & routing rules (Clerk)
```

---

## ⚙️ Configuration

Define the following environment variables in your `.env.local` file:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Supabase Configurations
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Third Party AI APIs
GEMINI_API_KEY=your_google_gemini_api_key
DEEPGRAM_API_KEY=your_deepgram_api_key
FONADA_API_KEY=your_fonada_api_key
REPLICATE_API_TOKEN=your_replicate_api_token

# Email & Notifications (Plunk)
PLUNK_API_KEY=your_plunk_api_key

# AWS Lambda Video Rendering (Remotion)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
REMOTION_SERVE_URL=your_remotion_serve_url
REMOTION_FUNCTION_NAME=your_lambda_function_name

# YouTube Integration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Database Tables (Supabase)

The main database tables configured in Supabase are:

| Table | Purpose | Main Columns |
|---|---|---|
| `users` | User profiles and pricing tiers | `id`, `email`, `subscription_tier` (`Free`, `Basic`, `Unlimited`) |
| `video_projects` | Series configurations & metadata | `id`, `topic`, `language`, `voice`, `style`, `captions`, `schedule` |
| `video_assets` | Video assets associated with each project | `id`, `project_id`, `voice_url`, `script_data`, `captions`, `image_urls` |
| `social_integrations` | Connected third-party publisher credentials | `id`, `user_id`, `platform` (e.g. YouTube), `oauth_token` |

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

1. **Fork** the repository.
2. Create a new branch: `git checkout -b feature/your-feature-name`.
3. Commit your changes with descriptive messages.
4. Push to the branch and open a **Pull Request**.

---

## 🗺 Roadmap

- [ ] Actual **video assembly** (FFmpeg) to combine images + voice + captions into a final video file.
- [ ] Persisted **delete/pause** actions in the Dashboard UI (currently local state only).
- [ ] Support using `schedule_time` to schedule posting automatically.
- [ ] Add direct support for TikTok and Instagram Reels publishing.
- [ ] Support custom font uploads for styled caption overlays.
- [ ] Integrate background music overlay generation.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📬 Contact

**Vediomax Project Maintainer**
- GitHub: [yourusername](https://github.com/yourusername)
- Email: support@vediomax.com
- Project Link: [https://github.com/yourusername/vediomax](https://github.com/yourusername/vediomax)
