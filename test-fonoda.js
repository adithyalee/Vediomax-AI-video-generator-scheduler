const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testFonoda() {
    const apiKey = process.env.FONODA_API_KEY;
    if (!apiKey) {
        console.error("❌ FONODA_API_KEY is missing in .env.local");
        return;
    }

    console.log("Testing Fonoda TTS...");
    console.log(`Using API Key: ${apiKey.substring(0, 5)}...`);

    try {
        const text = "क्या आपने कभी सोचा है कि अगर हर ज़रूरी जानकारी, मौसम से लेकर ताज़ा खबरों तक, सिर्फ़ एक कमांड पर मिल जाए, तो आपका रोज़मर्रा का जीवन कितना आसान और मज़ेदार हो सकता है?";

        console.log("Sending request to Fonoda...");
        const response = await fetch("https://api.fonada.ai/tts/generate-audio-large", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                input: text,
                voice: "Vaanee",
                language: "Hindi"
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Fonoda API error: ${response.status} ${errorText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        fs.writeFileSync('test-fonoda.mp3', buffer);
        console.log("✅ SUCCESS! Audio saved to 'test-fonoda.mp3'");

    } catch (error) {
        console.error("❌ FAILED:", error.message);
    }
}

testFonoda();
