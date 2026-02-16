'use client';

import { useEffect, useState } from 'react';
import { VideoProject } from '../types';
import { SeriesCard } from './SeriesCard';
import { TestCard } from './TestCard';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';

export function SeriesList() {
    const [series, setSeries] = useState<VideoProject[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSeries = async () => {
            try {
                const res = await fetch('/api/video-series');
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                setSeries(data);
            } catch (err) {
                console.error(err);
                setError('Failed to load series');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSeries();
    }, []);

    const handleDelete = (id: string) => {
        setSeries(prev => prev.filter(s => s.id !== id));
        toast.success("Series deleted");
    };

    const handleTogglePause = (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'paused' ? 'active' : 'paused';
        setSeries(prev => prev.map(s => s.id === id ? { ...s, status: newStatus as any } : s));
        toast.success(newStatus === 'paused' ? "Series paused" : "Series resumed");
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-500 text-center">
                {error}
            </div>
        );
    }

    if (series.length === 0) {
        return (
            <div className="rounded-lg border border-white/10 bg-slate-900/50 p-12 text-center text-slate-400 shadow-sm flex flex-col items-center">
                <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4">
                    <Plus className="w-8 h-8 text-indigo-500" />
                </div>
                <h3 className="text-xl font-medium text-white">No Series Created</h3>
                <p className="mt-2 text-slate-400 max-w-sm mx-auto mb-6">
                    You haven't created any video series yet. Start generating automated content today.
                </p>
                <Link href="/dashboard/create">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        Create Your First Series
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <TestCard series={series} />
            {series.map((project: VideoProject) => (
                <SeriesCard
                    key={project.id}
                    project={project}
                    onDelete={handleDelete}
                    onTogglePause={handleTogglePause}
                />
            ))}
        </div>
    );
}
