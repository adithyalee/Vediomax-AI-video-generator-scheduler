import { PricingTable } from '@/components/billing/PricingTable';
import { auth } from '@clerk/nextjs/server';
import { getUserTier } from '@/lib/subscription';

export default async function BillingPage() {
    const { userId } = await auth();
    const currentTier = userId ? await getUserTier(userId) : 'free';

    return (
        <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto w-full">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">Billing & Plans</h1>
                <p className="text-slate-400">Manage your subscription and billing details.</p>
            </div>

            <PricingTable currentTier={currentTier} />
        </div>
    );
}
