'use server';

import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function getIntegrations() {
    const { userId } = await auth();
    if (!userId) return [];

    const { data } = await supabaseAdmin
        .from('social_integrations')
        .select('*')
        .eq('user_id', userId);

    return data || [];
}

export async function connectIntegration(platform: string) {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    // Check subscription limits
    const { canConnectPlatform } = await import('@/lib/subscription');
    const allowed = await canConnectPlatform(userId, platform);

    if (!allowed) {
        // We throw an error that the frontend can catch/display, or handling via query param
        return { success: false, message: `Upgrade required to connect ${platform}.` };
    }

    if (platform === 'youtube') {
        const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/youtube/callback`;
        const scope = "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/userinfo.profile";

        const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;

        // We can't return specific redirect from server action easily to client component to trigger window.location
        // But we can return the URL and let client handle it.
        return { success: true, url };
    }

    // Other platforms (placeholders)
    // Check if already connected
    const existing = await supabaseAdmin
        .from('social_integrations')
        .select('id')
        .eq('user_id', userId)
        .eq('platform', platform)
        .single();

    if (existing.data) {
        return { success: false, message: 'Already connected' };
    }

    const { error } = await supabaseAdmin.from('social_integrations').insert({
        user_id: userId,
        platform,
        profile_name: `Demo User (${platform})`,
        access_token: 'mock_token',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    });

    if (error) throw new Error(error.message);

    revalidatePath('/dashboard/settings');
    return { success: true };
}

export async function disconnectIntegration(id: string) {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    const { error } = await supabaseAdmin
        .from('social_integrations')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

    if (error) throw new Error(error.message);

    revalidatePath('/dashboard/settings');
    return { success: true };
}

export async function deleteAccount() {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    // Delete from public.users (cascade should handle video_projects and assets)
    // Note: Clerk user deletion requires Clerk Backend API key and is separate.
    // Here we just clear the app data.

    const { error } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('user_id', userId);

    if (error) throw new Error(error.message);

    return { success: true };
}
