import { VideoList } from './video-list';
import { VideoProject } from '@/app/dashboard/types';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { currentUser } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export default async function VideosPage() {
    const user = await currentUser();

    if (!user) {
        return <div>Please sign in to view videos.</div>;
    }

    // Use supabaseAdmin because we are identifying the user via Clerk 
    // and need to bypass RLS or simply select based on the user_id column we trust.
    // In a real production app with RLS, we might generate a custom JWT for Supabase 
    // or just use the service role key carefully as we do here.
    const { data: videos, error } = await supabaseAdmin
        .from('video_projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching videos:", error);
        return <div className="text-red-400">Failed to load videos.</div>;
    }

    return (
        <div className="container mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">My Videos</h1>
                    <p className="text-slate-400">Manage and view your generated content.</p>
                </div>
            </div>

            <VideoList initialVideos={(videos || []) as VideoProject[]} />
        </div>
    );
}
