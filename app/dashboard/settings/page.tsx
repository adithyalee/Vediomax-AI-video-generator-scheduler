import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getIntegrations } from '@/actions/settings'; // Server action
import { IntegrationsList } from './components/IntegrationsList';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
// We'll implement a client component for the delete button to handle confirmation
import { DeleteAccountButton } from './components/DeleteAccountButton';

export default async function SettingsPage() {
    const user = await currentUser();

    if (!user) {
        redirect('/sign-in');
    }

    const integrations = await getIntegrations();

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white glow-text">Settings</h2>
                    <p className="text-muted-foreground mt-2">
                        Manage your integrations and account preferences.
                    </p>
                </div>
            </div>

            <Separator className="bg-white/10" />

            {/* INTEGRATIONS SECTION */}
            <section className="space-y-4">
                <div>
                    <h3 className="text-lg font-medium text-white">Social Integrations</h3>
                    <p className="text-sm text-slate-400">
                        Connect your social accounts to automatically publish generated videos.
                    </p>
                </div>

                <Card className="bg-slate-950 border-white/10">
                    <CardContent className="p-6">
                        <IntegrationsList initialIntegrations={integrations} />
                    </CardContent>
                </Card>
            </section>

            <Separator className="bg-white/10" />

            {/* DANGER ZONE */}
            <section className="space-y-4">
                <div>
                    <h3 className="text-lg font-medium text-red-500">Danger Zone</h3>
                    <p className="text-sm text-slate-400">
                        Irreversible actions for your account.
                    </p>
                </div>

                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h4 className="font-semibold text-red-400">Delete Account</h4>
                        <p className="text-sm text-red-400/70 mt-1">
                            Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                    </div>
                    <DeleteAccountButton />
                </div>
            </section>
        </div>
    );
}
