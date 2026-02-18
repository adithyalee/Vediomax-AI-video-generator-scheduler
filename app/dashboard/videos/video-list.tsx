'use client';

import { VideoProject } from '@/app/dashboard/types';
import { formatDistanceToNow } from 'date-fns';
import { Play, Clock, MoreVertical, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface VideoListProps {
    initialVideos: VideoProject[];
}

export function VideoList({ initialVideos }: VideoListProps) {
    const router = useRouter();
    // In a real app, we might use SWR or React Query to poll for updates if status is 'processing'
    // For now, we'll just use the initial data passed from the server and poll via router.refresh()
    const videos = initialVideos;

    // Polling logic: Check if any video is pending or processing
    const hasActiveJobs = videos.some(v => v.status === 'pending' || v.status === 'processing');

    useEffect(() => {
        if (!hasActiveJobs) return;

        const interval = setInterval(() => {
            router.refresh();
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(interval);
    }, [hasActiveJobs, router]);

    if (videos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center">
                    <Play className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-xl font-semibold text-white">No videos yet</h3>
                <p className="text-slate-400 max-w-sm">
                    Create your first video series to start generating content.
                </p>
                <Link href="/dashboard/create">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        Create New Series
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
                <div
                    key={video.id}
                    className="group bg-slate-900/50 border border-white/5 rounded-xl overflow-hidden hover:border-indigo-500/50 transition-all hover:shadow-2xl hover:shadow-indigo-500/10"
                >
                    {/* THUMBNAIL AREA */}
                    <div className="relative aspect-video bg-slate-950">
                        {video.image_urls && video.image_urls[0] ? (
                            <Image
                                src={video.image_urls[0]}
                                alt={video.series_name || video.topic}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-900">
                                <span className="text-4xl">🎬</span>
                            </div>
                        )}

                        {/* STATUS BADGE */}
                        <div className="absolute top-3 right-3">
                            <Badge className={cn(
                                "backdrop-blur-md shadow-lg",
                                video.status === 'completed' && "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
                                video.status === 'processing' && "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
                                video.status === 'failed' && "bg-red-500/20 text-red-300 border-red-500/30",
                            )}>
                                {video.status === 'processing' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                                {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
                            </Badge>
                        </div>

                        {/* DURATION BADGE */}
                        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur text-white text-xs px-2 py-1 rounded-md font-medium">
                            {video.duration}s
                        </div>
                    </div>

                    {/* CONTENT AREA */}
                    <div className="p-4 space-y-3">
                        <div className="flex justify-between items-start gap-2">
                            <h3 className="font-semibold text-white truncate text-lg group-hover:text-indigo-400 transition-colors">
                                {video.series_name || video.topic}
                            </h3>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white -mr-2">
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-200">
                                    <DropdownMenuItem className="focus:bg-indigo-600 focus:text-white cursor-pointer">
                                        Edit Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="focus:bg-red-600 focus:text-white cursor-pointer text-red-400 hover:text-red-400">
                                        Delete Video
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-400">
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{formatDistanceToNow(new Date(video.created_at), { addSuffix: true })}</span>
                            </div>
                            <div className="bg-slate-800 px-2 py-0.5 rounded-full uppercase text-[10px] tracking-wider font-bold">
                                {video.platform}
                            </div>
                        </div>

                        {/* ACTION BUTTON */}
                        <div className="pt-2">
                            <Button
                                className="w-full bg-slate-800 hover:bg-indigo-600 text-white transition-colors"
                                disabled={video.status === 'processing'}
                            >
                                {video.status === 'processing' ? 'Generating...' : 'View Video'}
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
