import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * Generate a single image using Replicate Flux Schnell (REST API) and upload to Supabase Storage.
 * Returns the public Supabase URL (Replicate output URLs expire).
 */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function generateImage(
  prompt: string,
  projectId: string,
  index: number,
  apiToken: string,
  retryCount = 0
): Promise<string> {
  if (!apiToken) {
    throw new Error("REPLICATE_API_TOKEN is missing");
  }

  try {
    const createRes = await fetch(
      "https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
          Prefer: "wait=60",
        },
        body: JSON.stringify({
          input: { prompt, output_format: "png" },
        }),
      }
    );

    if (createRes.status === 429) {
      if (retryCount >= 3) {
        throw new Error("Replicate API rate limit exceeded after 3 retries");
      }
      const retryAfter = createRes.headers.get("Retry-After");
      const waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : 10000 * Math.pow(2, retryCount); // Default to exponential backoff
      console.log(`Rate limit hit. Retrying in ${waitTime}ms...`);
      await sleep(waitTime);
      return generateImage(prompt, projectId, index, apiToken, retryCount + 1);
    }

    if (!createRes.ok) {
      const errText = await createRes.text();
      throw new Error(`Replicate API error: ${createRes.status} ${errText}`);
    }

    const prediction = (await createRes.json()) as {
      output?: string | string[];
      status?: string;
      error?: string;
    };

    if (prediction.error) throw new Error(`Replicate prediction failed: ${prediction.error}`);
    // If it's still starting or processing after wait=60, we might need to poll. 
    // consistently dealing with "succeeded" is safest.
    if (prediction.status !== "succeeded") {
      // For simplicity in this fix, we'll treat it as a failure if it didn't finish in 60s
      // or implement a polling loop if needed. But Flux Schnell is usually fast.
      throw new Error(`Replicate prediction status: ${prediction.status}`);
    }

    const out = prediction.output;
    const replicateUrl = Array.isArray(out) ? out[0] : out;
    if (!replicateUrl || typeof replicateUrl !== "string") {
      throw new Error("Replicate returned no image URL");
    }

    // Download and store in Supabase Storage (Replicate URLs expire)
    const imgRes = await fetch(replicateUrl);
    if (!imgRes.ok) throw new Error(`Failed to fetch image from Replicate: ${imgRes.status}`);

    const buffer = Buffer.from(await imgRes.arrayBuffer());
    const fileName = `${projectId}/image-${index}-${Date.now()}.png`;

    const { error } = await supabaseAdmin.storage.from("generated-images").upload(fileName, buffer, {
      contentType: "image/png",
      upsert: true,
    });
    if (error) throw new Error(`Failed to upload image to Supabase: ${error.message}`);

    const { data } = supabaseAdmin.storage.from("generated-images").getPublicUrl(fileName);
    return data.publicUrl;

  } catch (err: any) {
    if (retryCount < 3 && err.message?.includes("fetch failed")) {
      // Network blip retry
      await sleep(2000);
      return generateImage(prompt, projectId, index, apiToken, retryCount + 1);
    }
    throw err;
  }
}

export async function generateImages(prompts: string[], projectId: string, apiToken: string): Promise<string[]> {
  const urls: string[] = [];
  for (let i = 0; i < prompts.length; i++) {
    // Add a delay BEFORE processing (except the first one if we wanted, but safer to always space them)
    // Actually, simple sequential logic:
    if (i > 0) {
      // 6 requests per min = 1 request every 10 sec. 
      // Flux generation takes time, so we just need to ensure we don't start the NEXT one too soon.
      // But simpler is just to ensure a minimum padding.
      // Let's force a 5s sleep between items to be safe, combined with execution time it should be > 10s.
      await sleep(5000);
    }

    // We use a try/catch here to allow partial success? 
    // The requirement is usually all or nothing, but let's just let it fail if one fails for now.
    const url = await generateImage(prompts[i], projectId, i, apiToken);
    urls.push(url);
  }
  return urls;
}

