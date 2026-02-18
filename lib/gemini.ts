import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;


export interface VideoScript {
  videoTitle: string;
  script: string;
  imagePrompts: string[];
}

export async function generateVideoScript(topic: string, duration: string, style: string): Promise<VideoScript> {
  console.log("Checking Gemini API Key availability:", apiKey ? "Present" : "Missing");
  if (!apiKey) {
    throw new Error("Gemini API Key is not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const prompt = `
    You are an AI video script writer. Generate a video script for a short video about "${topic}".
    
    Constraints:
    - Duration: ${duration}
    - Style: ${style}
    - If duration is 30-40 seconds, the script MUST be at least 150 words.
    - If duration is 60-70 seconds, the script MUST be at least 300 words.
    - Generate 4-7 detailed image prompts that match the script's narrative.
    - The script should be engaging, natural, and ready for voiceover.
    
    Output Format: JSON only. strictly no markdown.
    {
      "videoTitle": "Catchy Title",
      "script": "Full voiceover script here...",
      "imagePrompts": [
        "Detailed image prompt 1...",
        "Detailed image prompt 2..."
      ]
    }
    `;

  const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest", // Using latest alias which is confirmed to work
    generationConfig: {
      responseMimeType: "application/json"
    }
  });

  const result = await model.generateContent(prompt);

  // @ts-ignore
  const text = result.response.candidates[0].content.parts[0].text;

  if (!text) {
    throw new Error("Gemini returned empty response");
  }

  try {
    const script = JSON.parse(text) as VideoScript;
    return script;
  } catch (error) {
    console.error("Failed to parse Gemini response:", text);
    throw new Error("Failed to generate valid JSON script");
  }
}
