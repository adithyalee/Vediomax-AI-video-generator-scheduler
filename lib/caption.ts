export async function generateCaptions(audioUrl: string, languageCode?: string) {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
        throw new Error("DEEPGRAM_API_KEY is missing");
    }

    const params = new URLSearchParams({
        model: "nova-2",
        smart_format: "true",
        punctuate: "true",
        utterances: "true",
        ...(languageCode ? { language: languageCode } : {}),
    });

    const response = await fetch(`https://api.deepgram.com/v1/listen?${params.toString()}`, {
        method: "POST",
        headers: {
            "Authorization": `Token ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ url: audioUrl })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Deepgram API error: ${response.status} ${errorText}`);
    }

    const result = await response.json();

    // Return the words with timestamps (most flexible for video editing)
    // Deepgram structure: results.channels[0].alternatives[0].words
    const words = result.results?.channels?.[0]?.alternatives?.[0]?.words;

    if (!words) {
        console.warn("Deepgram returned no words:", JSON.stringify(result));
        return [];
    }

    return words;
}
