# 🗄️ supabase/ — Database Migrations

This folder tracks the history of all **database schema changes** (like adding new columns or tables).

```
supabase/
└── migrations/
    ├── add_subscription_tier.sql  ← Added subscription_tier column to users table
    └── ...                        ← Future migration files go here
```

## What is a migration?

A migration is a SQL script that makes a one-time change to your database structure. You run it once in the Supabase SQL editor.

## 👉 How to add a new column or table

1. Write a new `.sql` file in `migrations/` describing your change
2. Run it in the **Supabase Dashboard → SQL Editor**
3. Commit the `.sql` file so others know what changed

## Main Tables

| Table | Purpose |
|---|---|
| `users` | User profiles + subscription tier |
| `video_projects` | All video series / projects |
| `video_assets` | Generated assets (script, voice, images, video) |
| `social_integrations` | Connected social media accounts |
