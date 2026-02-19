import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { helloWorld } from "@/inngest/functions/hello";
import { generateVideo } from "@/inngest/functions/generate-video";
import { checkScheduledVideos } from "@/inngest/functions/check-scheduled-videos";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        helloWorld,
        generateVideo,
        checkScheduledVideos,
    ],
});
