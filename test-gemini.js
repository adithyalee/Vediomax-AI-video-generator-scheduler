const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function testGemini() {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    console.log("Testing API Key:", apiKey ? "Loaded (starts with " + apiKey.substring(0, 5) + "...)" : "Not Loaded");

    if (!apiKey) {
        console.error("Please ensure .env.local exists and has NEXT_PUBLIC_GEMINI_API_KEY");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // List of models to try in order of preference/likelihood to work
    const modelsToTest = [
        "gemini-2.0-flash-lite",
        "gemini-2.0-flash-lite-preview-02-05", // Often very open
        "gemini-flash-latest",
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest"
    ];

    console.log("Starting model connectivity test...");

    for (const modelName of modelsToTest) {
        console.log(`\n--------------------------------------------------`);
        console.log(`Testing model: ${modelName} ...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say 'Hello' if you can hear me.");
            const responseText = result.response.text();

            console.log(`✅ SUCCESS! Model '${modelName}' works!`);
            console.log(`Response: ${responseText}`);
            console.log(`\n>>> RECOMMENDATION: Update lib/gemini.ts to use model: "${modelName}"`);
            return;
        } catch (e) {
            let errorMsg = e.message;
            if (e.message.includes("404")) errorMsg = "404 Not Found (Access Denied / Invalid Model Name)";
            if (e.message.includes("429")) errorMsg = "429 Quota Exceeded (No free tier remaining)";
            console.log(`❌ FAILED ${modelName}: ${errorMsg}`);
        }
    }

    console.log("\n--------------------------------------------------");
    console.log("❌ All tested models failed. Please check your API key quotas or billing.");
}

testGemini();
