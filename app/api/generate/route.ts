import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/inngest/client";

export async function POST(req: NextRequest) {
    try {
        const { projectId } = await req.json();

        if (!projectId) {
            return NextResponse.json({ error: "ProjectId is required" }, { status: 400 });
        }

        console.log("Received generate request for project:", projectId);

        await inngest.send({
            name: "app/video.generate",
            data: {
                projectId: projectId
            }
        });

        console.log("Inngest event sent: app/video.generate");

        return NextResponse.json({ success: true, message: "Video generation started" });

    } catch (error) {
        console.error("Error triggering video generation:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
