import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { syncUserToSupabase } from '@/actions/user';

export default async function DashboardPage() {
    const user = await currentUser();

    if (!user) {
        redirect('/sign-in');
    }

    // --- SYNC USER TO SUPABASE ---
    const syncResult = await syncUserToSupabase(user);
    // -----------------------------

    return (
        <div className="flex min-h-screen flex-col bg-slate-950 text-white">
            <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur p-4">
                <div className="container mx-auto flex items-center justify-between">
                    <h1 className="text-xl font-bold">Vediomax Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-400">Welcome, {user.firstName || user.emailAddresses[0].emailAddress}</span>
                        {/* UserButton will be here if we import it, but it's client-side */}
                    </div>
                </div>
            </header>
            <main className="flex-1 p-8">
                <div className="container mx-auto">
                    {!syncResult.success && (
                        <div className="mb-8 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-500">
                            <h3 className="font-bold">Database Sync Error</h3>
                            <p className="text-sm opacity-90">{syncResult.error}</p>
                            <p className="text-xs mt-2 text-slate-400">Check your server logs for more details.</p>
                        </div>
                    )}
                    <h2 className="text-2xl font-bold mb-4">Your Videos</h2>
                    <p className="text-slate-400">No videos created yet.</p>
                </div>
            </main>
        </div>
    );
}
