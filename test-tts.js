const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testDeepgram() {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
        console.error("❌ DEEPGRAM_API_KEY is missing in .env.local");
        return;
    }

    console.log("Testing Deepgram TTS...");
    console.log(`Using API Key: ${apiKey.substring(0, 5)}...`);

    try {
        const text = "Hello! This is a test of the Deepgram voice generation.";
        const model = "aura-asteria-en"; // Default testing voice

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
        const buffer = Buffer.from(arrayBuffer);

        fs.writeFileSync('test-voice.mp3', buffer);
        console.log("✅ SUCCESS! Audio saved to 'test-voice.mp3'");

    } catch (error) {
        console.error("❌ FAILED:", error.message);
    }
}

testDeepgram();
