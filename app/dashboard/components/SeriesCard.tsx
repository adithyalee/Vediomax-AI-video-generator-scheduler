'use client';

import { VideoProject } from '../types';
import { VideoStyles } from '../create/data/styles';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    MoreVertical,
    Play,
    Pause,
    Trash2,
    Edit,
    Video as VideoIcon,
    Loader2
} from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface SeriesCardProps {
    project: VideoProject;
    onDelete?: (id: string) => void;
    onTogglePause?: (id: string, currentStatus: string) => void;
}

export function SeriesCard({ project, onDelete, onTogglePause }: SeriesCardProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    // Find style for thumbnail
    const styleObj = VideoStyles.find(s => s.id === project.style_id);
    const thumbnail = styleObj?.image || '/Styles/realistic.png'; // Fallback

    const handleGenerate = async () => {
        setIsGenerating(true);
        console.log("Starting generation for project:", project.id); // Debug Log 1
        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ projectId: project.id }),
            });

            console.log("API Response status:", response.status); // Debug Log 2

            if (!response.ok) {
                const errorData = await response.json(); // Try to get error details
                console.error("API Error details:", errorData);
                throw new Error(errorData.error || 'Failed to start generation');
            }

            const data = await response.json();
            console.log("Generation started successfully:", data); // Debug Log 3
            // Optional: Show success toast here
        } catch (error) {
            console.error("Generation failed catch block:", error);
            // Optional: Show error toast here
        } finally {
            setIsGenerating(false);
            console.log("Generation process finished (finally block)"); // Debug Log 4
        }
    };

    return (
        <div className="group relative bg-slate-900/50 border border-white/10 rounded-xl overflow-hidden hover:border-indigo-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 hover:bg-slate-900">

            {/* THUMBNAIL AREA */}
            <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                <Image
                    src={thumbnail}
                    alt={project.series_name}
                    fill
                    className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90" />

                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                    <Badge variant="outline" className={cn(
                        "backdrop-blur-md border-white/10",
                        project.status === 'active' || project.status === 'completed' ? "bg-green-500/20 text-green-400" :
                            project.status === 'pending' ? "bg-yellow-500/20 text-yellow-400" :
                                project.status === 'paused' ? "bg-red-500/20 text-red-400" :
                                    "bg-slate-500/20 text-slate-400"
                    )}>
                        <div className={cn(
                            "w-1.5 h-1.5 rounded-full mr-2",
                            project.status === 'active' || project.status === 'completed' ? "bg-green-400 animate-pulse" :
                                project.status === 'pending' ? "bg-yellow-400" :
                                    project.status === 'paused' ? "bg-red-400" :
                                        "bg-slate-400"
                        )} />
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </Badge>
                </div>

                {/* Edit Icon (Top Right) */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/dashboard/create?id=${project.id}`}>
                        <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-black/50 hover:bg-white text-white hover:text-black backdrop-blur-md">
                            <Edit className="w-3.5 h-3.5" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="font-bold text-white text-lg line-clamp-1 group-hover:text-indigo-400 transition-colors">
                            {project.series_name}
                        </h3>
                        <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                            <span className="capitalize">{project.topic}</span>
                            <span>•</span>
                            <span className="capitalize">{project.platform}</span>
                            <span>•</span>
                            <span>{new Date(project.created_at).toLocaleDateString()}</span>
                        </p>
                    </div>

                    {/* ACTIONS MENU */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-slate-400 hover:text-white">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-40 bg-slate-900 border-white/10 text-slate-200">
                            <div className="flex flex-col gap-1">
                                <Link href={`/dashboard/create?id=${project.id}`} className="w-full">
                                    <Button variant="ghost" size="sm" className="w-full justify-start gap-2 hover:bg-white/10">
                                        <Edit className="w-4 h-4" /> Edit
                                    </Button>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="justify-start gap-2 hover:bg-white/10"
                                    onClick={() => onTogglePause?.(project.id, project.status)}
                                >
                                    {project.status === 'paused' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                                    {project.status === 'paused' ? 'Resume' : 'Pause'}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="justify-start gap-2 hover:bg-red-500/20 hover:text-red-400 text-red-400/80"
                                    onClick={() => onDelete?.(project.id)}
                                >
                                    <Trash2 className="w-4 h-4" /> Delete
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                {/* BOTTOM ACTIONS */}
                <div className="mt-4 flex flex-col gap-2">
                    <Button
                        onClick={handleGenerate}
                        disabled={isGenerating || project.status === 'paused'}
                        className={cn(
                            "w-full gap-2 font-semibold transition-all shadow-lg",
                            project.status === 'paused'
                                ? "bg-slate-800 text-slate-500"
                                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/20"
                        )}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                            </>
                        ) : (
                            <>
                                <VideoIcon className="w-4 h-4" /> Generate Video
                            </>
                        )}
                    </Button>

                    <div className="flex justify-center mt-1">
                        <Button variant="link" className="text-xs text-slate-500 hover:text-indigo-400 h-auto p-0">
                            View Generated Videos
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
