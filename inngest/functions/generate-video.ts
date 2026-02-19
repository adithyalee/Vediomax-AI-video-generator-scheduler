import { inngest } from "../client";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { generateVideoScript, VideoScript } from "@/lib/gemini";
import { generateVoice } from "@/lib/voice";
import { generateCaptions } from "@/lib/caption";
import { generateImages } from "@/lib/image";
import { Languages } from "@/app/dashboard/create/data/voices";
import { plunk } from "@/lib/plunk"; // [NEW]
import { VideoReadyEmail } from "@/components/emails/VideoReadyEmail"; // [NEW]
import { render } from "@react-email/components"; // [NEW]

// Define a more specific type if possible, or keep as any for now but cleaner
type VideoProject = any;

function normalizeScriptData(raw: any, project: VideoProject): VideoScript | null {
  if (!raw) return null;
  let obj: any = raw;
  if (typeof raw === "string") {
    try {
      obj = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (!obj || typeof obj !== "object") return null;
  const script = String(obj.script ?? "").trim();
  if (!script) return null;
  const imagePrompts = obj.imagePrompts ?? obj.image_prompts ?? [];
  return {
    videoTitle: obj.videoTitle ?? obj.video_title ?? project.series_name ?? "",
    script,
    imagePrompts: Array.isArray(imagePrompts) ? imagePrompts : [],
  };
}

function languageCodeFor(project: VideoProject): string {
  const lang = project?.language || "English";
  const cfg = Languages.find((l: any) => l.language === lang);
  return cfg?.modelLangCode ?? "en-US";
}

export const generateVideo = inngest.createFunction(
  { id: "generate-video", concurrency: 1 },
  { event: "app/video.generate" },
  async ({ event, step }) => {
    const { projectId, force = false, reuseOnly = false } = (event.data as any) ?? {};

    // Helper to save generated assets
    const saveAsset = async (type: 'script' | 'voice' | 'image' | 'captions' | 'video', content: string | null, url: string | null, metadata: any = {}) => {
      try {
        await supabaseAdmin.from("video_assets").insert({
          project_id: projectId,
          asset_type: type,
          content,
          url,
          metadata
        });
      } catch (err) {
        console.error(`Failed to save asset (${type}):`, err);
        // Don't fail the whole generation if tracking fails
      }
    };

    // Step 1: Fetch project from Supabase
    const project = await step.run("fetch-project-data", async () => {
      const { data, error } = await supabaseAdmin
        .from("video_projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (error) throw new Error(`Failed to fetch project: ${error.message}`);
      return data as VideoProject;
    });

    // Mark as processing
    await step.run("set-status-processing", async () => {
      await supabaseAdmin.from("video_projects").update({ status: "processing" }).eq("id", projectId);
      return { ok: true };
    });

    // Step 2: Script (Gemini) — reuse if already saved
    const scriptData: VideoScript = await step.run("generate-script", async () => {
      const existing = !force ? normalizeScriptData(project.script_data, project) : null;
      if (existing) return existing;

      if (reuseOnly) {
        // In test mode we do NOT call Gemini; return a stub (won't overwrite DB because script is empty)
        return { videoTitle: project.series_name ?? "", script: "", imagePrompts: [] as string[] };
      }

      const topic = project.topic === "custom" ? project.custom_topic || project.topic : project.topic;
      const durationString = `${project.duration} seconds`;
      const generated = await generateVideoScript(topic, durationString, project.style_id);

      // Save newly generated script
      await saveAsset("script", JSON.stringify(generated), null, { source: "gemini", model: "gemini-flash-latest" });

      return generated;
    });

    // Step 3: Voice — logic split to avoid nested steps
    const voice = await step.run("generate-voice", async () => {
      // 3.1 Use existing DB field if available (and not forced)
      if (!force && project.voice_url) {
        console.log("Reusing existing voice URL:", project.voice_url);
        return { audioUrl: String(project.voice_url) };
      }

      // 3.2 Reuse Only Mode: Fetch from Storage (no paid API)
      if (reuseOnly) {
        // Direct Supabase call (no nested step.run)
        const { data, error } = await supabaseAdmin.storage.from("generated-voice").list(projectId, { limit: 100 });
        if (error) throw new Error(`Failed to list generated-voice: ${error.message}`);

        const files = (data || [])
          .filter((f: any) => typeof f?.name === "string" && f.name.toLowerCase().endsWith(".mp3"))
          .sort((a: any, b: any) => {
            const ta = new Date(a.updated_at || a.created_at || 0).getTime();
            const tb = new Date(b.updated_at || b.created_at || 0).getTime();
            return tb - ta;
          });

        const latest = files[0];
        if (!latest?.name) throw new Error("TEST mode: voice_url is missing (and no voice file found in Storage).");

        const filePath = `${projectId}/${latest.name}`;
        const { data: pub } = supabaseAdmin.storage.from("generated-voice").getPublicUrl(filePath);
        const audioUrl = pub.publicUrl;

        // Update DB so next time it's faster
        const { error: updErr } = await supabaseAdmin.from("video_projects").update({ voice_url: audioUrl }).eq("id", projectId);
        if (updErr) throw new Error(`Failed to persist voice_url: ${updErr.message}`);

        return { audioUrl };
      }

      // 3.3 Full Generation Mode (Paid API)
      const audioUrl = await generateVoice(
        scriptData.script,
        project.language || "English",
        project.voice || "aura-asteria-en",
        projectId
      );

      // Save newly generated voice
      await saveAsset("voice", null, audioUrl, {
        source: "deepgram/fonada",
        voice: project.voice,
        language: project.language
      });

      return { audioUrl };
    });

    // Step 4: Captions
    const captions = await step.run("generate-captions", async () => {
      if (!force && Array.isArray(project.captions) && project.captions.length > 0) {
        return { captions: project.captions as any[] };
      }
      if (reuseOnly) {
        throw new Error("TEST mode: captions are missing; generate once to save them before testing.");
      }
      const langCode = languageCodeFor(project);
      const words = await generateCaptions(voice.audioUrl, langCode);

      // Save newly generated captions
      await saveAsset("captions", JSON.stringify(words), null, {
        source: "deepgram",
        language: langCode
      });

      return { captions: words };
    });

    // Step 5: Images
    const images = await step.run("generate-images", async () => {
      // 5.1 Use existing DB field
      if (!force && Array.isArray(project.image_urls) && project.image_urls.length > 0) {
        console.log("Reusing existing image URLs:", project.image_urls.length);
        return { imageUrls: project.image_urls as string[] };
      }

      // 5.2 Reuse Only Mode: Fetch from Storage
      if (reuseOnly) {
        // Direct Supabase call (no nested step.run)
        const { data, error } = await supabaseAdmin.storage.from("generated-images").list(projectId, { limit: 200 });
        if (error) throw new Error(`Failed to list generated-images: ${error.message}`);

        const files = (data || [])
          .filter((f: any) => typeof f?.name === "string" && /\.(png|jpg|jpeg|webp)$/i.test(f.name))
          .sort((a: any, b: any) => {
            const ta = new Date(a.updated_at || a.created_at || 0).getTime();
            const tb = new Date(b.updated_at || b.created_at || 0).getTime();
            return tb - ta;
          });

        if (!files.length) throw new Error("TEST mode: image_urls are missing (and no images found in Storage).");

        const picked = files.slice(0, 7).reverse();
        const urls = picked.map((f: any) => {
          const filePath = `${projectId}/${f.name}`;
          const { data: pub } = supabaseAdmin.storage.from("generated-images").getPublicUrl(filePath);
          return pub.publicUrl;
        });

        // Update DB
        const { error: updErr } = await supabaseAdmin.from("video_projects").update({ image_urls: urls }).eq("id", projectId);
        if (updErr) throw new Error(`Failed to persist image_urls: ${updErr.message}`);

        return { imageUrls: urls };
      }

      // 5.3 Full Generation Mode (Paid API)
      const replicateToken = process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_TOKEN;
      if (!replicateToken) throw new Error("REPLICATE_API_TOKEN is missing in .env.local");

      const prompts = (scriptData.imagePrompts?.length ? scriptData.imagePrompts : [scriptData.videoTitle || "cinematic scene"]) as string[];
      const imageUrls = await generateImages(prompts, projectId, replicateToken);

      // Save newly generated images (batch)
      for (const [i, url] of imageUrls.entries()) {
        await saveAsset("image", prompts[i] || "", url, {
          source: "replicate",
          model: "flux-schnell",
          index: i
        });
      }

      return { imageUrls };
    });

    // Step 5.5: Render Video (Remotion Lambda)
    const video = await step.run("render-video", async () => {
      if (reuseOnly) {
        console.log("Skipping render in reuse mode");
        return { videoUrl: null };
      }

      const region = process.env.REMOTION_AWS_REGION || "us-east-1";
      const serveUrl = process.env.REMOTION_SERVE_URL;
      const functionName = process.env.REMOTION_FUNCTION_NAME;

      if (!serveUrl || !functionName) {
        console.warn("Missing REMOTION_SERVE_URL or REMOTION_FUNCTION_NAME. Skipping rendering.");
        return { videoUrl: null };
      }

      console.log("DEBUG: AWS Config Check");
      console.log("Region:", region);

      // Retrieve keys from process.env (loaded from .env.local)
      const keyId = process.env.AWS_ACCESS_KEY_ID;
      const secret = process.env.AWS_SECRET_ACCESS_KEY;

      console.log("AccessKeyId:", keyId ? keyId.slice(0, 5) + "..." : "MISSING");
      // Force-set REMOTION_ prefixed env vars to ensure Remotion Lambda picks them up
      if (keyId && secret) {
        process.env.REMOTION_AWS_ACCESS_KEY_ID = keyId;
        process.env.REMOTION_AWS_SECRET_ACCESS_KEY = secret;
      }

      console.log("AccessKeyId:", keyId.slice(0, 5) + "...");
      console.log("SecretAccessKey length:", secret.length);

      // Dynamic import to avoid build issues if package specific constraints
      const { renderMediaOnLambda, getRenderProgress } = await import('@remotion/lambda/client');

      // Calculate duration based on captions (last word end time)
      // Default to 10s (300 frames) if no captions
      let durationInFrames = 300;
      if (captions.captions && captions.captions.length > 0) {
        const lastWord = captions.captions[captions.captions.length - 1];
        const endSeconds = lastWord.end || 0;
        // Add 2 seconds buffer after speech ends
        durationInFrames = Math.ceil((endSeconds + 2) * 30);
      }
      // Ensure minimum duration of 5 seconds
      durationInFrames = Math.max(durationInFrames, 150);

      const inputProps = {
        imageUrls: images.imageUrls,
        audioUrl: voice.audioUrl,
        captions: captions.captions,
        script: scriptData,
        durationInFrames // Pass duration in props for calculateMetadata
      };

      console.log(`Starting Lambda Render... Duration: ${durationInFrames} frames (${(durationInFrames / 30).toFixed(1)}s)`);

      const { renderId, bucketName } = await renderMediaOnLambda({
        region: region as any,
        functionName,
        serveUrl,
        composition: "Main",
        inputProps,
        codec: "h264",
        maxRetries: 1,
        concurrencyPerLambda: 1,
        framesPerLambda: 2000,
      } as any);

      console.log(`Render started: ${renderId} in ${bucketName}`);

      // Poll for completion
      let videoUrl: string | null = null;
      let attempts = 0;

      while (!videoUrl && attempts < 240) { // Timeout after ~20 minutes (matches Lambda 15min + buffer)
        await new Promise(r => setTimeout(r, 5000));
        attempts++;

        const progress = await getRenderProgress({
          renderId,
          bucketName,
          functionName: functionName!,
          region: region as any,
        });

        if (progress.fatalErrorEncountered) {
          throw new Error(`Render failed: ${progress.errors[0].message}`);
        }

        if (progress.done) {
          videoUrl = progress.outputFile as string;
        } else {
          console.log(`Rendering... ${Math.round(progress.overallProgress * 100)}%`);
        }
      }

      if (!videoUrl) {
        throw new Error("Render timed out");
      }

      console.log("Render complete:", videoUrl);
      await saveAsset("video", null, videoUrl, { renderId });

      return { videoUrl };
    });

    // Step 6: Save to DB (split updates + retry)
    const savedProject = await step.run("save-project", async () => {
      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
      const runWithRetry = async (label: string, fn: () => Promise<void>) => {
        let lastErr: unknown;
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            await fn();
            return;
          } catch (err) {
            lastErr = err;
            await sleep(500 * Math.pow(2, attempt - 1));
          }
        }
        const msg = lastErr instanceof Error ? `${lastErr.name}: ${lastErr.message}` : String(lastErr);
        throw new Error(`Failed to save project (${label}) after 3 attempts: ${msg}`);
      };

      await runWithRetry("base-fields", async () => {
        const patch: any = {
          voice_url: voice.audioUrl,
          image_urls: images.imageUrls,
          status: video?.videoUrl ? "completed" : "processing", // Only complete if video rendered
          video_url: video?.videoUrl
        };
        // Only save script_data if we actually have a script (avoid overwriting in reuseOnly stub)
        if (scriptData?.script && String(scriptData.script).trim()) patch.script_data = scriptData;

        const { error } = await supabaseAdmin.from("video_projects").update(patch).eq("id", projectId);
        if (error) throw new Error(error.message);
      });

      await runWithRetry("captions", async () => {
        const { error } = await supabaseAdmin.from("video_projects").update({ captions: captions.captions }).eq("id", projectId);
        if (error) throw new Error(error.message);
      });

      // Status update logic moved above
      if (video?.videoUrl) {
        await runWithRetry("final-status", async () => {
          const { error } = await supabaseAdmin.from("video_projects").update({ status: "completed" }).eq("id", projectId);
          if (error) throw new Error(error.message);
        });
      }

      return { status: "completed" };
    });

    // Step 7: Send Email Notification [NEW]
    if (video?.videoUrl && plunk) {
      await step.run("send-email", async () => {
        // 1. Fetch user email
        const { data: user, error: userErr } = await supabaseAdmin
          .from("users")
          .select("email, name") // Select name too if available
          .eq("user_id", project.user_id) // primary key linkage
          .single();

        if (userErr || !user?.email) {
          console.warn("Could not find user email for notification:", userErr);
          return { sent: false, reason: "user_not_found" };
        }

        // 2. Render email
        const emailHtml = await render(
          VideoReadyEmail({
            videoUrl: video!.videoUrl!,
            videoTitle: scriptData.videoTitle,
            thumbnailUrl: images.imageUrls?.[0], // Use first image as thumbnail
            userName: user.name || "Creator",
          })
        );

        // 3. Send via Plunk
        const result = await plunk!.emails.send({
          to: user.email,
          subject: "Your video is ready! 🎬",
          body: emailHtml,
        });

        return { sent: true, result };
      });
    }

    return { success: true, projectId, script: scriptData, voice, captions, images, video, savedProject };
  }
);
