import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get("code");
        const error = searchParams.get("error");

        // This route is hit by Google, so we don't have Clerk auth context directly in the request usually?
        // Wait, if it's a client-side redirect, we should have the session cookies. 
        // Let's try to get userId. If not, we might need to pass state parameter.
        const { userId } = await auth();
        console.log("YouTube Callback - UserId:", userId);

        if (error) {
            console.error("YouTube Callback - Error Params:", error);
            return NextResponse.redirect(new URL(`/dashboard/settings?error=${error}`, req.url));
        }

        if (!code) {
            console.error("YouTube Callback - No code provided");
            return NextResponse.json({ error: "No code provided" }, { status: 400 });
        }

        if (!userId) {
            console.error("YouTube Callback - No userId found in session");
            return NextResponse.redirect(new URL(`/sign-in?redirect_url=${encodeURIComponent(req.url)}`, req.url));
        }

        // Exchange code for token
        console.log("Exchanging code for token...");
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID!,
                client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                redirect_uri: `${new URL(req.url).origin}/api/auth/youtube/callback`,
                grant_type: "authorization_code",
            }),
        });

        const tokens = await tokenResponse.json();

        if (tokens.error) {
            console.error("Token exchange error:", tokens);
            return NextResponse.redirect(new URL(`/dashboard/settings?error=token_exchange_failed`, req.url));
        }

        console.log("Token exchange successful. Fetching profile...");

        // Fetch user profile from Google to get channel name
        const profileResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: {
                Authorization: `Bearer ${tokens.access_token}`,
            },
        });
        const profile = await profileResponse.json();
        console.log("Profile fetched:", profile.name);

        // Save to DB
        // Check if exists
        const { data: existing, error: fetchError } = await supabaseAdmin
            .from("social_integrations")
            .select("id")
            .eq("user_id", userId)
            .eq("platform", "youtube")
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error("DB Fetch Error:", fetchError);
        }

        const data = {
            user_id: userId,
            platform: "youtube",
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token, // Only returned on first consent or if prompt=consent
            expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
            profile_name: profile.name || profile.email,
            profile_url: profile.picture,
            connected_at: new Date().toISOString(),
        };

        if (existing) {
            console.log("Updating existing integration...");
            const { error: updateError } = await supabaseAdmin.from("social_integrations").update(data).eq("id", existing.id);
            if (updateError) console.error("Update Error:", updateError);
        } else {
            console.log("Inserting new integration...");
            const { error: insertError } = await supabaseAdmin.from("social_integrations").insert(data);
            if (insertError) console.error("Insert Error:", insertError);
        }

        console.log("Integration saved successfully. Redirecting...");

        return NextResponse.redirect(new URL("/dashboard/settings?success=youtube_connected", req.url));

    } catch (err) {
        console.error("OAuth Callback Error:", err);
        return NextResponse.redirect(new URL(`/dashboard/settings?error=internal_error`, req.url));
    }
}
