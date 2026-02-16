import { Languages, DeepgramVoices, FonadalabVoices } from "@/app/dashboard/create/data/voices";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function generateVoice(script: string, language: string, voiceName: string, projectId: string) {
    // 1. Find the language configuration
    const langConfig = Languages.find(l => l.language === language);

    if (!langConfig) {
        throw new Error(`Unsupported language: ${language}`);
    }

    let audioBuffer: Buffer;

    // 2. Route to the correct provider
    if (langConfig.modelName === 'deepgram') {
        audioBuffer = await generateDeepgramVoice(script, voiceName);
    } else if (langConfig.modelName === 'fonadalab') {
        // Fonoda expects full language name like "Hindi", not "hi-IN"
        audioBuffer = await generateFonodaVoice(script, voiceName, langConfig.language);
    } else {
        throw new Error(`Unknown voice provider: ${langConfig.modelName}`);
    }

    // 3. Upload to Supabase Storage
    // Ensure the bucket exists (this is usually done once manuallly, but we assume 'generated-voice' exists)
    const fileName = `${projectId}/voice-${Date.now()}.mp3`;

    const { data, error } = await supabaseAdmin
        .storage
        .from('generated-voice')
        .upload(fileName, audioBuffer, {
            contentType: 'audio/mpeg',
            upsert: true
        });

    if (error) {
        throw new Error(`Failed to upload voice to Supabase: ${error.message}`);
    }

    // 4. Get Public URL
    const { data: { publicUrl } } = supabaseAdmin
        .storage
        .from('generated-voice')
        .getPublicUrl(fileName);

    return publicUrl;
}

async function generateDeepgramVoice(text: string, voiceName: string): Promise<Buffer> {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) throw new Error("DEEPGRAM_API_KEY is missing");

    // Default to a known voice if not found.
    // Deepgram expects models like "aura-asteria-en"
    const model = voiceName || "aura-asteria-en";

    const response = await fetch(`https://api.deepgram.com/v1/speak?model=${model}`, {
        method: "POST",
        headers: {
            "Authorization": `Token ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Deepgram API error: ${response.status} ${errorText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

async function generateFonodaVoice(text: string, voiceName: string, language: string): Promise<Buffer> {
    const apiKey = process.env.FONODA_API_KEY;
    if (!apiKey) {
        throw new Error("FONODA_API_KEY is missing in .env.local");
    }

    const response = await fetch("https://api.fonada.ai/tts/generate-audio-large", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            input: text,
            voice: voiceName,
            language: language
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Fonoda API error: ${response.status} ${errorText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}
