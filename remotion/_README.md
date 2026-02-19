# 🎬 remotion/ — Video Rendering Templates

This folder contains the **Remotion** video composition — the actual template that gets rendered into an MP4.

Remotion is a React-based video renderer. You write your video layout as React components, and it renders them frame-by-frame into a real video.

## How it works

1. The video generation pipeline in `inngest/functions/generate-video.ts` assembles all assets (images, audio, captions)
2. It sends them to **AWS Lambda** which runs the Remotion renderer
3. The renderer uses the composition in this folder to produce the final `.mp4`

## 👉 How to edit the video template

- The main composition lives here and uses the `imageUrls`, `audioUrl`, `captions`, and `script` as input props
- To change fonts, animations, caption styles, or layout → edit the composition files here
- After any changes, you must re-deploy to Lambda: `npm run deploy:lambda`

## ⚠️ Important

- Do NOT change `inputProps` structure without also updating `inngest/functions/generate-video.ts`
