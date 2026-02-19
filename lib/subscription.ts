import { supabaseAdmin } from "@/lib/supabase-admin";

export type SubscriptionTier = 'free' | 'basic' | 'unlimited';

export const SUBSCRIPTION_LIMITS = {
    free: {
        seriesLimit: 1,
        allowedPlatforms: ['email', 'youtube'],
    },
    basic: {
        seriesLimit: 3,
        allowedPlatforms: ['email', 'youtube'],
    },
    unlimited: {
        seriesLimit: Infinity,
        allowedPlatforms: ['email', 'youtube', 'instagram', 'tiktok'],
    },
};

export async function getUserTier(userId: string): Promise<SubscriptionTier> {
    const { data, error } = await supabaseAdmin
        .from('users')
        .select('subscription_tier')
        .eq('user_id', userId)
        .single();

    if (error || !data) return 'free';
    return data.subscription_tier as SubscriptionTier;
}

export async function canCreateSeries(userId: string): Promise<{ allowed: boolean; limit: number; current: number }> {
    const tier = await getUserTier(userId);
    const limits = SUBSCRIPTION_LIMITS[tier];

    if (limits.seriesLimit === Infinity) {
        return { allowed: true, limit: Infinity, current: 0 };
    }

    // Count existing series (video_projects where type/status implies a distinct series - keeping it simple: count projects)
    // Wait, "series" usually implies a project. Let's assume 1 project = 1 series for now based on current app structure.
    const { count, error } = await supabaseAdmin
        .from('video_projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

    const currentCount = count || 0;

    return {
        allowed: currentCount < limits.seriesLimit,
        limit: limits.seriesLimit,
        current: currentCount,
    };
}

export async function canConnectPlatform(userId: string, platform: string): Promise<boolean> {
    const tier = await getUserTier(userId);
    const limits = SUBSCRIPTION_LIMITS[tier];

    return limits.allowedPlatforms.includes(platform.toLowerCase());
}
