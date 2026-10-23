import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { inngest } from "@/inngest/client";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { projectId, force, reuseOnly } = await req.json();

        if (!projectId) {
            return NextResponse.json({ error: "ProjectId is required" }, { status: 400 });
        }

        const { data: project } = await supabaseAdmin
            .from("video_projects")
            .select("id")
            .eq("id", projectId)
            .eq("user_id", userId)
            .maybeSingle();

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        const sent = await inngest.send({
            name: "app/video.generate",
            data: {
                projectId: projectId,
                force: Boolean(force),
                reuseOnly: Boolean(reuseOnly),
            }
        });

        console.log("Inngest event sent: app/video.generate");

        return NextResponse.json({ success: true, message: "Video generation started", sent });

    } catch (error) {
        console.error("Error triggering video generation:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
