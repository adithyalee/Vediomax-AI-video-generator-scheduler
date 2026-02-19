# 🧙 app/dashboard/create/ — The Video Creation Wizard

This is the multi-step form where users build a new video series. It has 6 steps.

```
create/
├── page.tsx          ← Main wizard controller — manages step state
├── actions.ts        ← Server-side functions (save to Supabase, check limits)
├── types.ts          ← TypeScript type for the wizard data (WizardData)
│
├── components/       ← One file per step
│   ├── StepTopic.tsx    ← Step 1: Pick a topic
│   ├── StepLanguage.tsx ← Step 2: Pick language & voice
│   ├── StepMusic.tsx    ← Step 3: Pick background music
│   ├── StepStyle.tsx    ← Step 4: Pick visual style
│   ├── StepCaption.tsx  ← Step 5: Pick caption style
│   └── StepReview.tsx   ← Step 6: Review & schedule
│
└── data/             ← Static option lists (the choices the user sees)
    ├── voices.ts     ← Available voices per language
    ├── music.ts      ← Available music tracks
    ├── styles.ts     ← Available visual styles
    └── captions.ts   ← Available caption styles
```

## 👉 How to edit

- **Add a new topic?** → Edit `data/` files (add the option to the list)
- **Change what happens when user submits?** → Edit `actions.ts → scheduleSeries()`
- **Change step layout/design?** → Edit the matching file in `components/`
- **Add a new step?** → Create a new `StepX.tsx` in `components/`, then add it to `page.tsx`
