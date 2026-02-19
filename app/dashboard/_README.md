# 📊 app/dashboard/ — The Logged-In App

Everything in this folder is only visible to **signed-in users** (enforced by `middleware.ts`).

```
dashboard/
├── layout.tsx        ← Dashboard shell: wraps every page with the Sidebar
├── page.tsx          ← The main dashboard overview (/dashboard)
├── types.ts          ← TypeScript types shared across dashboard pages
│
├── create/           ← 🧙 "Create New Series" multi-step wizard
├── create-new/       ← Redirects to /create
├── videos/           ← "My Videos" list (/dashboard/videos)
├── billing/          ← Pricing & subscription page (/dashboard/billing)
├── settings/         ← Account settings (/dashboard/settings)
│
└── components/       ← Small components used only within the dashboard
```

## 👉 How to edit

- **Change what shows on the main dashboard?** → `page.tsx`
- **Change the sidebar/navigation?** → `../../components/Sidebar.tsx`
- **Change the video creation wizard?** → `create/`
- **Change subscription plans display?** → `billing/`
- **Change connected accounts (YouTube etc.)?** → `settings/`
