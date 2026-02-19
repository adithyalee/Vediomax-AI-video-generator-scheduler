import { inngest } from "../client";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const checkScheduledVideos = inngest.createFunction(
    { id: "check-scheduled-videos" },
    { cron: "*/30 * * * *" }, // Run every 30 minutes
    async ({ step }) => {
        // 1. Get all active projects
        const projects = await step.run("fetch-active-projects", async () => {
            const { data, error } = await supabaseAdmin
                .from("video_projects")
                .select("*")
                .eq("status", "active");

            if (error) throw new Error(`Failed to fetch projects: ${error.message}`);
            return data || [];
        });

        if (projects.length === 0) {
            return { message: "No active projects found" };
        }

        const triggered = [];

        // 2. Iterate and check schedule
        for (const project of projects) {
            // 2.1 Parse schedule time
            // Assuming schedule_time is ISO string or "HH:MM" format. 
            // If full ISO, extract time. If just time, usage is direct.
            // Based on previous file reads, it seems to be an ISO string `new Date().toISOString()`.

            if (!project.schedule_time) continue;

            const scheduleDate = new Date(project.schedule_time);
            const scheduleHour = scheduleDate.getHours();
            const scheduleMinute = scheduleDate.getMinutes();

            // Current UTC time (Server time)
            const now = new Date();
            // Target is 2 hours BEFORE schedule
            // So if schedule is 14:00, we want to run at 12:00.
            // We check if (Now + 2 hours) matches Schedule Time (approx)

            const targetTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // Now + 2h
            const targetHour = targetTime.getUTCHours(); // Use UTC for consistency if stored as UTC ISO
            const targetMinute = targetTime.getUTCMinutes();

            // Compare closely (within the last 30 mins window)
            // Since cron runs every 30 mins, we check if the scheduled time falls within the NEXT 30 mins from our "Now + 2h" mark? 
            // OR simpler: check if `schedule_time` (HH:MM) is roughly equal to `targetTime` (HH:MM).

            // Let's assume strict UTC comparison for simplicity first.
            // We need to match the Hour and Minute window.

            // Extract project Time-of-Day (UTC)
            const pDate = new Date(project.schedule_time);
            const pHour = pDate.getUTCHours();
            // We don't care about the date part of schedule_time if it's "every day".
            // Just the time component.

            // Check if we already generated for this project TODAY
            const alreadyGenerated = await step.run(`check-generated-${project.id}`, async () => {
                const startOfDay = new Date();
                startOfDay.setUTCHours(0, 0, 0, 0);

                const { count } = await supabaseAdmin
                    .from("video_assets")
                    .select("*", { count: "exact", head: true })
                    .eq("project_id", project.id)
                    .eq("asset_type", "video")
                    .gte("created_at", startOfDay.toISOString());

                return count ? count > 0 : false;
            });

            if (alreadyGenerated) {
                continue;
            }

            // Check time window (simple equality on Hour for now, assuming 30 min cron hits the hour)
            // Logic: Is the current time + 2 hours within the same hour as scheduled time?
            if (targetHour === pHour) {
                // Trigger generation
                await step.run(`trigger-generation-${project.id}`, async () => {
                    await inngest.send({
                        name: "app/video.generate",
                        data: {
                            projectId: project.id,
                            force: false,
                            reuseOnly: false
                        }
                    });
                });
                triggered.push(project.id);
            }
        }

        return { triggered, count: triggered.length };
    }
);
