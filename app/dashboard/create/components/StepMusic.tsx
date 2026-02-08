'use client';

import { cn } from '@/lib/utils';
import { Play, Pause, Music } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { BackgroundMusic, MusicTrack } from '../data/music';
import { Button } from '@/components/ui/button';

interface StepMusicProps {
    wizardData: any;
    setWizardData: (data: any) => void;
}

export function StepMusic({ wizardData, setWizardData }: StepMusicProps) {
    const [playingTrack, setPlayingTrack] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const handlePlayPreview = (trackUrl: string) => {
        // Stop currently playing audio if any
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        // If clicking the same track that is playing, just stop and reset state
        if (playingTrack === trackUrl) {
            setPlayingTrack(null);
            return;
        }

        // Play new audio
        try {
            const audio = new Audio(trackUrl);
            audioRef.current = audio;
            setPlayingTrack(trackUrl);

            audio.play().catch(err => {
                console.error("Failed to play audio:", err);
                setPlayingTrack(null);
            });

            audio.onended = () => {
                setPlayingTrack(null);
            };
        } catch (error) {
            console.error("Error creating audio object:", error);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, []);

    const toggleSelection = (trackUrl: string) => {
        const currentSelection = wizardData.music || [];
        let newSelection;
        if (currentSelection.includes(trackUrl)) {
            newSelection = currentSelection.filter((url: string) => url !== trackUrl);
        } else {
            newSelection = [...currentSelection, trackUrl];
        }
        setWizardData((prev: any) => ({ ...prev, music: newSelection }));
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col space-y-8"
        >
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white">Background Music</h2>
                <p className="text-slate-400">Select music tracks for your series. (Multi-select allowed)</p>
            </div>

            <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {BackgroundMusic.map((track: MusicTrack) => {
                    const isSelected = (wizardData.music || []).includes(track.url);
                    const isPlaying = playingTrack === track.url;

                    return (
                        <div
                            key={track.url}
                            className={cn(
                                "flex items-center justify-between p-4 rounded-xl border transition-all duration-200 group",
                                isSelected
                                    ? "bg-indigo-500/10 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.2)]"
                                    : "bg-slate-900 border-white/10 hover:bg-slate-800"
                            )}
                        >
                            <div
                                className="flex items-center gap-4 flex-1 cursor-pointer"
                                onClick={() => toggleSelection(track.url)}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                                    isSelected ? "bg-indigo-500 text-white" : "bg-white/5 text-slate-400"
                                )}>
                                    <Music className="w-5 h-5" />
                                </div>

                                <div className="flex-1">
                                    <h3 className={cn(
                                        "font-medium transition-colors",
                                        isSelected ? "text-white" : "text-slate-300"
                                    )}>
                                        {track.name}
                                    </h3>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Play Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handlePlayPreview(track.url);
                                    }}
                                    className="p-3 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/5"
                                >
                                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                </button>

                                {/* Selection Checkbox Visual */}
                                <div
                                    className={cn(
                                        "w-6 h-6 rounded border-2 flex items-center justify-center ml-2 transition-all cursor-pointer",
                                        isSelected
                                            ? "bg-indigo-600 border-indigo-600"
                                            : "border-slate-600 group-hover:border-slate-500"
                                    )}
                                    onClick={() => toggleSelection(track.url)}
                                >
                                    {isSelected && <span className="text-white text-sm font-bold">✓</span>}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}
