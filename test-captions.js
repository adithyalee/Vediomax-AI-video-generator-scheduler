const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testCaptions() {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
        console.error("❌ DEEPGRAM_API_KEY is missing in .env.local");
        return;
    }

    // Use a public audio URL for testing (Deepgram's sample or one of ours if known)
    // Let's use a reliable external sample to test the API itself.
    const audioUrl = "https://static.deepgram.com/examples/interview_speech-analytics.wav";

    console.log("Testing Deepgram Captions...");
    console.log(`Using API Key: ${apiKey.substring(0, 5)}...`);
    console.log(`Audio URL: ${audioUrl}`);

    try {
        const response = await fetch("https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&punctuate=true&utterances=true", {
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

        const words = result.results?.channels?.[0]?.alternatives?.[0]?.words;

        if (!words) {
            console.log("No words found (might be silence or error in structure). Full result:", JSON.stringify(result, null, 2));
        } else {
            console.log(`✅ SUCCESS! Received ${words.length} words.`);
            console.log("First 5 words:", JSON.stringify(words.slice(0, 5), null, 2));
        }

    } catch (error) {
        console.error("❌ FAILED:", error.message);
    }
}

testCaptions();
