# 🚀 scripts/ — Developer Scripts

One-off scripts that developers run manually for setup or deployment tasks. These are **not** part of the running app.

| File | What it does | How to run |
|---|---|---|
| `deploy-lambda.ts` | Deploys the Remotion composition to AWS Lambda | `npm run deploy:lambda` |

## When to run deploy:lambda

Run this script any time you change the **Remotion composition** (i.e., files in `remotion/`). It uploads the new version to AWS so video rendering uses the latest template.

```bash
# From the project root:
npm run deploy:lambda
```
