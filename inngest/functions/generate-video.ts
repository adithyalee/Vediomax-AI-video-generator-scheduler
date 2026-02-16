import { inngest } from "../client";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { generateVideoScript, VideoScript } from "@/lib/gemini";
import { generateVoice } from "@/lib/voice";
import { generateCaptions } from "@/lib/caption";
import { generateImages } from "@/lib/image";
import { Languages } from "@/app/dashboard/create/data/voices";

type AnyProject = any;

function normalizeScriptData(raw: any, project: AnyProject): VideoScript | null {
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

function languageCodeFor(project: AnyProject): string {
  const lang = project?.language || "English";
  const cfg = Languages.find((l: any) => l.language === lang);
  return cfg?.modelLangCode ?? "en-US";
}

export const generateVideo = inngest.createFunction(
  { id: "generate-video", concurrency: 1 },
  { event: "app/video.generate" },
  async ({ event, step }) => {
    const { projectId, force = false, reuseOnly = false } = (event.data as any) ?? {};

    // Step 1: Fetch project from Supabase
    const project = await step.run("fetch-project-data", async () => {
      const { data, error } = await supabaseAdmin
        .from("video_projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (error) throw new Error(`Failed to fetch project: ${error.message}`);
      return data as AnyProject;
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
        return { videoTitle: project.series_name ?? "", script: "", imagePrompts: [] };
      }

      const topic = project.topic === "custom" ? project.custom_topic || project.topic : project.topic;
      const durationString = `${project.duration} seconds`;
      return await generateVideoScript(topic, durationString, project.style_id);
    });

    // Step 3: Voice — reuse DB field, else hydrate from Storage in reuseOnly, else generate (paid)
    const voice = await step.run("generate-voice", async () => {
      if (!force && project.voice_url) return { audioUrl: String(project.voice_url) };

      if (reuseOnly) {
        const hydrated = await step.run("hydrate-voice-url-from-storage", async () => {
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
          if (!latest?.name) return null;
          const filePath = `${projectId}/${latest.name}`;
          const { data: pub } = supabaseAdmin.storage.from("generated-voice").getPublicUrl(filePath);
          const audioUrl = pub.publicUrl;
          const { error: updErr } = await supabaseAdmin.from("video_projects").update({ voice_url: audioUrl }).eq("id", projectId);
          if (updErr) throw new Error(`Failed to persist voice_url: ${updErr.message}`);
          return audioUrl;
        });

        if (hydrated) return { audioUrl: hydrated };
        throw new Error("TEST mode: voice_url is missing (and no voice file found in Storage).");
      }

      const audioUrl = await generateVoice(
        scriptData.script,
        project.language || "English",
        project.voice || "aura-asteria-en",
        projectId
      );
      return { audioUrl };
    });

    // Step 4: Captions — reuse DB field, else generate (paid). In reuseOnly, fail if missing.
    const captions = await step.run("generate-captions", async () => {
      if (!force && Array.isArray(project.captions) && project.captions.length > 0) {
        return { captions: project.captions as any[] };
      }
      if (reuseOnly) {
        throw new Error("TEST mode: captions are missing; generate once to save them before testing.");
      }
      const langCode = languageCodeFor(project);
      const words = await generateCaptions(voice.audioUrl, langCode);
      return { captions: words };
    });

    // Step 5: Images — reuse DB field, else hydrate from Storage in reuseOnly, else generate (paid)
    const images = await step.run("generate-images", async () => {
      if (!force && Array.isArray(project.image_urls) && project.image_urls.length > 0) {
        return { imageUrls: project.image_urls as string[] };
      }

      if (reuseOnly) {
        const hydrated = await step.run("hydrate-image-urls-from-storage", async () => {
          const { data, error } = await supabaseAdmin.storage.from("generated-images").list(projectId, { limit: 200 });
          if (error) throw new Error(`Failed to list generated-images: ${error.message}`);
          const files = (data || [])
            .filter((f: any) => typeof f?.name === "string" && /\.(png|jpg|jpeg|webp)$/i.test(f.name))
            .sort((a: any, b: any) => {
              const ta = new Date(a.updated_at || a.created_at || 0).getTime();
              const tb = new Date(b.updated_at || b.created_at || 0).getTime();
              return tb - ta;
            });
          if (!files.length) return null;
          const picked = files.slice(0, 7).reverse();
          const urls = picked.map((f: any) => {
            const filePath = `${projectId}/${f.name}`;
            const { data: pub } = supabaseAdmin.storage.from("generated-images").getPublicUrl(filePath);
            return pub.publicUrl;
          });
          const { error: updErr } = await supabaseAdmin.from("video_projects").update({ image_urls: urls }).eq("id", projectId);
          if (updErr) throw new Error(`Failed to persist image_urls: ${updErr.message}`);
          return urls;
        });
        if (hydrated) return { imageUrls: hydrated };
        throw new Error("TEST mode: image_urls are missing (and no images found in Storage).");
      }

      const replicateToken = process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_TOKEN;
      if (!replicateToken) throw new Error("REPLICATE_API_TOKEN is missing in .env.local");

      const prompts = (scriptData.imagePrompts?.length ? scriptData.imagePrompts : [scriptData.videoTitle || "cinematic scene"]) as string[];
      const imageUrls = await generateImages(prompts, projectId, replicateToken);
      return { imageUrls };
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
          status: "processing",
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

      await runWithRetry("final-status", async () => {
        const { error } = await supabaseAdmin.from("video_projects").update({ status: "completed" }).eq("id", projectId);
        if (error) throw new Error(error.message);
      });

      return { status: "completed" };
    });

    return { success: true, projectId, script: scriptData, voice, captions, images, savedProject };
  }
);
