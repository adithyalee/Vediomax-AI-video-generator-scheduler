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
    - If duration is 30-40 seconds, generate 4-5 image prompts.
    - If duration is 60-70 seconds, generate 5-6 image prompts.
    - The script should be natural, engaging, and ready for voiceover.
    
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
    model: "gemini-flash-latest", // Confirmed working model with quota
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
