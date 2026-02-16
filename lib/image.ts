import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * Generate a single image using Replicate Flux Schnell (REST API) and upload to Supabase Storage.
 * Returns the public Supabase URL (Replicate output URLs expire).
 */
export async function generateImage(
  prompt: string,
  projectId: string,
  index: number,
  apiToken: string
): Promise<string> {
  if (!apiToken) {
    throw new Error("REPLICATE_API_TOKEN is missing");
  }

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
  if (prediction.status !== "succeeded") throw new Error(`Replicate prediction status: ${prediction.status}`);

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
}

export async function generateImages(prompts: string[], projectId: string, apiToken: string): Promise<string[]> {
  const urls: string[] = [];
  for (let i = 0; i < prompts.length; i++) {
    urls.push(await generateImage(prompts[i], projectId, i, apiToken));
  }
  return urls;
}

