import { inngest } from "../client";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { generateVideoScript, VideoScript } from "@/lib/gemini";

export const generateVideo = inngest.createFunction(
    { id: "generate-video", concurrency: 1 },
    { event: "app/video.generate" },
    async ({ event, step }) => {
        const { projectId } = event.data;

        // Step 1: Fetch data from Supabase
        const project = await step.run("fetch-project-data", async () => {
            const { data, error } = await supabaseAdmin
                .from("video_projects")
                .select("*")
                .eq("id", projectId)
                .single();

            if (error) throw new Error(`Failed to fetch project: ${error.message}`);
            return data;
        });

        // Step 2: Generate video script
        const scriptData: VideoScript = await step.run("generate-script", async () => {
            const durationString = project.duration + ' seconds';
            // Assuming 'style' might be an ID, we might need to map it to a descriptive string if not already. 
            // For now passing project.style_id directly or we'd fetch style name.
            // Let's assume project.topic is the main topic. 
            const result = await generateVideoScript(project.topic, durationString, project.style_id);

            // Log the result to see the JSON in Inngest dashboard
            console.log("Generated Script JSON:", JSON.stringify(result, null, 2));

            return result;
        });

        // Step 3: Generate voice
        const voice = await step.run("generate-voice", async () => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return { audioUrl: "https://example.com/audio.mp3" };
        });

        // Step 4: Generate captions
        const captions = await step.run("generate-captions", async () => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return { captions: [] };
        });

        // Step 5: Generate images
        const images = await step.run("generate-images", async () => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return { imageUrls: ["https://example.com/image.png"] };
        });

        // Step 6: Save everything to database
        const savedProject = await step.run("save-project", async () => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            // Logic to update Supabase with generated assets would go here
            return { status: "completed" };
        });

        return { success: true, project, script, voice, captions, images, savedProject };
    }
);
