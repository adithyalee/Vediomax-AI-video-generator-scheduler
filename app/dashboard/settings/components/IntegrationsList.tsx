'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { connectIntegration, disconnectIntegration } from '@/actions/settings'; // Import server actions
import Image from 'next/image';
import { toast } from 'sonner';

interface Integration {
    id: string;
    platform: string;
    profile_name: string;
    connected_at: string;
}

interface IntegrationsListProps {
    initialIntegrations: Integration[];
}

const PLATFORMS = [
    {
        id: 'youtube',
        name: 'YouTube',
        description: 'Publish videos directly to your channel',
        icon: '/Logos/youtube.png', // Ensure this asset exists or use placeholder
        color: 'text-red-500',
    },
    {
        id: 'instagram',
        name: 'Instagram',
        description: 'Post Reels to your account',
        icon: '/Logos/instagram.png',
        color: 'text-pink-500',
    },
    {
        id: 'tiktok',
        name: 'TikTok',
        description: 'Share content to TikTok',
        icon: '/Logos/tiktok.png',
        color: 'text-black', // or cyan/pink mix
    },
];

export function IntegrationsList({ initialIntegrations }: IntegrationsListProps) {
    const [connecting, setConnecting] = useState<string | null>(null);
    const [disconnecting, setDisconnecting] = useState<string | null>(null);

    const handleConnect = async (platformId: string) => {
        setConnecting(platformId);
        try {
            const res = await connectIntegration(platformId);
            if (res.success) {
                if (res.url) {
                    window.location.href = res.url; // Redirect for OAuth
                    return;
                }
                toast.success(`Connected to ${platformId}`);
            } else {
                toast.error(res.message || 'Failed to connect');
            }
        } catch (error) {
            console.error(error);
            toast.error('Connection failed');
        } finally {
            if (platformId !== 'youtube') {
                setConnecting(null);
            }
        }
    };

    const handleDisconnect = async (id: string) => {
        setDisconnecting(id);
        try {
            const res = await disconnectIntegration(id);
            if (res.success) {
                toast.success('Disconnected successfully');
            } else {
                toast.error('Failed to disconnect');
            }
        } catch (error) {
            console.error(error);
            toast.error('Disconnection failed');
        } finally {
            setDisconnecting(null);
        }
    };

    return (
        <div className="grid gap-6">
            {PLATFORMS.map((platform) => {
                const integration = initialIntegrations.find(i => i.platform === platform.id);
                const isConnected = !!integration;

                return (
                    <div key={platform.id} className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-slate-900/50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center p-2 relative overflow-hidden">
                                {/* Fallback if image missing */}
                                <div className={`w-full h-full rounded-full ${platform.color} opacity-20 absolute`} />
                                <span className={`font-bold ${platform.color}`}>{platform.name[0]}</span>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white flex items-center gap-2">
                                    {platform.name}
                                    {isConnected && (
                                        <Badge variant="secondary" className="bg-green-500/10 text-green-400 text-xs gap-1 border-green-500/20">
                                            <CheckCircle2 className="w-3 h-3" /> Connected
                                        </Badge>
                                    )}
                                </h4>
                                <p className="text-sm text-slate-400">{isConnected ? `Connected as ${integration?.profile_name}` : platform.description}</p>
                            </div>
                        </div>

                        {isConnected ? (
                            <Button
                                variant="outline"
                                className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                onClick={() => handleDisconnect(integration!.id)}
                                disabled={!!disconnecting}
                            >
                                {disconnecting === integration!.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Disconnect'}
                            </Button>
                        ) : (
                            <Button
                                variant="secondary"
                                className="bg-white/10 hover:bg-white/20 text-white"
                                onClick={() => handleConnect(platform.id)}
                                disabled={!!connecting}
                            >
                                {connecting === platform.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Connect'}
                            </Button>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
