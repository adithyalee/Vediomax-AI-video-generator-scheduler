'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';

const pricingPlans = [
    {
        name: 'Free',
        price: '$0',
        period: '/month',
        description: 'Perfect for trying out VideoMax.',
        features: [
            '1 Active Series',
            'Connect Email & YouTube',
            'Standard Quality (720p)',
            'Watermarked Videos',
        ],
        cta: 'Current Plan',
        popular: false,
        disabled: true,
    },
    {
        name: 'Basic',
        price: '$29',
        period: '/month',
        description: 'For creators building a small portfolio.',
        features: [
            '3 Active Series',
            'Connect Email & YouTube',
            'High Definition (1080p)',
            'No Watermarks',
            'Priority Rendering',
        ],
        cta: 'Upgrade to Basic',
        popular: true,
        disabled: false,
    },
    {
        name: 'Unlimited',
        price: '$99',
        period: '/month',
        description: 'For serious creators and agencies.',
        features: [
            'Unlimited Series',
            'Connect All Platforms (YT, Insta, TikTok)',
            '4K Logic Rendering',
            'API Access',
            'Dedicated Support',
        ],
        cta: 'Upgrade to Unlimited',
        popular: false,
        disabled: false,
    },
];

interface PricingTableProps {
    currentTier: 'free' | 'basic' | 'unlimited';
}

export function PricingTable({ currentTier }: PricingTableProps) {
    const { user, isLoaded } = useUser();
    const [loading, setLoading] = useState<string | null>(null);

    const handleUpgrade = (planName: string) => {
        setLoading(planName);
        // TODO: Replace with real Stripe/LemonSqueezy checkout redirect
        setTimeout(() => {
            setLoading(null);
            toast.info(`Payment integration coming soon!`, {
                description: `${planName} plan checkout will be available shortly. Contact us to upgrade manually.`,
                duration: 5000,
            });
        }, 1500);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {pricingPlans.map((plan) => {
                    const isCurrent = plan.name.toLowerCase() === currentTier;

                    return (
                        <div
                            key={plan.name}
                            className={cn(
                                "relative flex flex-col p-6 rounded-2xl border bg-slate-900/50 backdrop-blur-sm transition-all duration-300 hover:border-slate-700",
                                plan.popular ? "border-indigo-500 shadow-2xl shadow-indigo-500/10" : "border-slate-800",
                                isCurrent ? "border-slate-600 bg-slate-800/50" : ""
                            )}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full text-xs font-bold text-white shadow-lg">
                                    MOST POPULAR
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-white mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                                    <span className="text-sm text-slate-400">{plan.period}</span>
                                </div>
                                <p className="text-sm text-slate-400 mt-2">{plan.description}</p>
                            </div>

                            <div className="flex-1 flex flex-col gap-3 mb-6">
                                {plan.features.map((feature) => (
                                    <div key={feature} className="flex items-start gap-2 text-sm text-slate-300">
                                        <Check className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                onClick={() => handleUpgrade(plan.name)}
                                disabled={isCurrent || loading === plan.name}
                                className={cn(
                                    "w-full font-semibold transition-all",
                                    plan.popular && !isCurrent
                                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25"
                                        : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                                )}
                                variant={plan.popular && !isCurrent ? "default" : "outline"}
                            >
                                {loading === plan.name ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : isCurrent ? (
                                    "Current Plan"
                                ) : (
                                    plan.cta
                                )}
                            </Button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
