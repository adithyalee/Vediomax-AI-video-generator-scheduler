'use client';

import { cn } from '@/lib/utils';
import { Volume2, Play, Pause } from 'lucide-react';
import { motion } from 'framer-motion';

import { useRef, useState, useEffect } from 'react';
import { Languages, DeepgramVoices, FonadalabVoices } from '../data/voices';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface StepLanguageProps {
    wizardData: any;
    setWizardData: (data: any) => void;
}

export function StepLanguage({ wizardData, setWizardData }: StepLanguageProps) {
    const [playingVoice, setPlayingVoice] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const handlePlayPreview = (previewUrl: string) => {
        // Stop currently playing audio if any
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        // If clicking the same voice that is playing, just stop and reset state
        if (playingVoice === previewUrl) {
            setPlayingVoice(null);
            return;
        }

        // Play new audio
        try {
            const audio = new Audio(previewUrl);
            audioRef.current = audio;
            setPlayingVoice(previewUrl);

            audio.play().catch(err => {
                console.error("Failed to play audio:", err);
                setPlayingVoice(null); // Reset UI on error
            });

            audio.onended = () => {
                setPlayingVoice(null);
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

    // Derived Data
    const selectedLanguageObj = Languages.find(l => l.language === wizardData.language);
    const availableVoices = selectedLanguageObj?.modelName === 'deepgram' ? DeepgramVoices :
        selectedLanguageObj?.modelName === 'fonadalab' ? FonadalabVoices : [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col space-y-8"
        >
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white">Choose Language & Voice</h2>
                <p className="text-slate-400">Select the narrator for your video series.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* LANGUAGE SELECT (DROPDOWN) */}
                <div className="md:col-span-1 space-y-4">
                    <label className="text-sm font-medium text-slate-300">Target Language</label>
                    <Select
                        value={wizardData.language}
                        onValueChange={(value) => {
                            setWizardData((prev: any) => ({ ...prev, language: value, voice: '' }));
                        }}
                    >
                        <SelectTrigger className="w-full bg-slate-900 border-white/10 text-white h-12">
                            <SelectValue placeholder="Select Language" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10 text-white max-h-[300px]">
                            {Languages.map((lang) => (
                                <SelectItem key={lang.language} value={lang.language} className="focus:bg-indigo-600 focus:text-white cursor-pointer">
                                    <span className="flex items-center gap-2">
                                        <span className="text-lg">{lang.countryFlag}</span>
                                        {lang.language}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {selectedLanguageObj && (
                        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4 mt-4">
                            <div className="text-sm text-indigo-300 font-medium mb-1">Provider</div>
                            <div className="text-white capitalize font-bold">{selectedLanguageObj.modelName}</div>
                        </div>
                    )}
                </div>

                {/* VOICE SELECT */}
                <div className="md:col-span-2 space-y-4">
                    <label className="text-sm font-medium text-slate-300">Available Voices</label>
                    {!wizardData.language ? (
                        <div className="h-64 flex items-center justify-center border border-dashed border-white/10 rounded-xl bg-slate-900/30">
                            <p className="text-slate-500">Select a language to see voices</p>
                        </div>
                    ) : availableVoices.length === 0 ? (
                        <div className="h-64 flex items-center justify-center border border-dashed border-white/10 rounded-xl bg-slate-900/30">
                            <p className="text-slate-500">No voices available for this language.</p>
                        </div>
                    ) : (

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {availableVoices.map((voice: any) => {
                                const isSelected = wizardData.voice === voice.modelName;
                                const isPlaying = playingVoice === voice.preview;

                                return (
                                    <motion.div
                                        key={voice.modelName}
                                        onClick={() => setWizardData((prev: any) => ({ ...prev, voice: voice.modelName }))}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={cn(
                                            "relative p-4 rounded-xl border transition-all cursor-pointer group overflow-hidden",
                                            isSelected
                                                ? "bg-indigo-500/10 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]"
                                                : "bg-slate-900 border-white/10 hover:border-indigo-500/50 hover:bg-slate-800"
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-3 relative z-10">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                                                    voice.gender === 'male' ? "bg-blue-500/20 text-blue-400" : "bg-pink-500/20 text-pink-400",
                                                    isSelected && "bg-white text-indigo-600"
                                                )}>
                                                    <Volume2 className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className={cn(
                                                        "font-bold text-sm capitalize transition-colors",
                                                        isSelected ? "text-white" : "text-slate-200"
                                                    )}>
                                                        {voice.modelName.split('-')[2] || voice.modelName}
                                                    </h4>
                                                    <span className="text-xs text-slate-500 capitalize">{voice.gender}</span>
                                                </div>
                                            </div>

                                            {/* PREVIEW BUTTON */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handlePlayPreview(voice.preview);
                                                }}
                                                className={cn(
                                                    "w-8 h-8 rounded-full flex items-center justify-center transition-all border",
                                                    isPlaying
                                                        ? "bg-indigo-500 border-indigo-500 text-white animate-pulse"
                                                        : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-indigo-500 hover:border-indigo-500"
                                                )}
                                            >
                                                {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
                                            </button>
                                        </div>

                                        {/* Waveform Visualization (Fake) */}
                                        <div className="flex items-center justify-center gap-0.5 h-6 mb-2 opacity-50 relative z-10">
                                            {[...Array(20)].map((_, i) => (
                                                <motion.div
                                                    key={i}
                                                    className={cn(
                                                        "w-1 rounded-full",
                                                        isSelected ? "bg-indigo-400" : "bg-slate-600"
                                                    )}
                                                    animate={{
                                                        height: isPlaying ? [5, Math.random() * 15 + 5, 5] : 4
                                                    }}
                                                    transition={{
                                                        duration: 0.5,
                                                        repeat: isPlaying ? Infinity : 0,
                                                        delay: i * 0.05
                                                    }}
                                                />
                                            ))}
                                        </div>

                                        <div className="flex justify-between items-center mt-2 relative z-10">
                                            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                                                {selectedLanguageObj?.modelName}
                                            </span>
                                            {isSelected && (
                                                <div className="flex items-center gap-1 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/20">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                                    <span className="text-[10px] text-indigo-300 font-bold">Selected</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Background Glow */}
                                        {isSelected && (
                                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none" />
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>

                    )}
                </div>
            </div>
        </motion.div>
    );
}
