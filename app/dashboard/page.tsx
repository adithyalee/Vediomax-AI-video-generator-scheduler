import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { syncUserToSupabase } from '@/actions/user';

export default async function DashboardPage() {
    const user = await currentUser();

    if (!user) {
        redirect('/sign-in');
    }

    // ...

    // --- SYNC USER TO SUPABASE ---
    const syncResult = await syncUserToSupabase(user);
    // -----------------------------

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-white">Dashboard</h2>
            </div>
            <div className="py-4">
                {!syncResult.success && (
                    <div className="mb-8 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-500">
                        <h3 className="font-bold">Database Sync Error</h3>
                        <p className="text-sm opacity-90">{syncResult.error}</p>
                        <p className="text-xs mt-2 text-slate-400">Check your server logs for more details.</p>
                    </div>
                )}

                <div className="rounded-lg border border-white/10 bg-slate-900/50 p-8 text-center text-slate-400 shadow-sm">
                    <h3 className="text-lg font-medium text-white">No Series Created</h3>
                    <p className="mt-2 text-slate-400">You haven't created any video series yet. Click the button in the sidebar to get started.</p>
                </div>
            </div>
        </div>
    );
}
