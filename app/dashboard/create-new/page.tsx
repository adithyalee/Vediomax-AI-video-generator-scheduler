'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Ghost, History, Gavel, Sparkles, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const STEPS = [
    { label: 'Topic', number: 1 },
    { label: 'Language', number: 2 },
    { label: 'Voice', number: 3 },
    { label: 'Image', number: 4 },
    { label: 'Captions', number: 5 },
    { label: 'Review', number: 6 },
];

const NICHES = [
    { id: 'scary', label: 'Scary Stories', icon: Ghost, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    { id: 'history', label: 'History', icon: History, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { id: 'crime', label: 'True Crime', icon: Gavel, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
    { id: 'custom', label: 'Custom Topic', icon: Sparkles, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
];

export default function CreateNewSeriesPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedNiche, setSelectedNiche] = useState<string | null>(null);
    const [customTopic, setCustomTopic] = useState('');

    const handleContinue = () => {
        if (selectedNiche) {
            console.log("Selected:", selectedNiche === 'custom' ? customTopic : selectedNiche);
            // Logic to move to next step will go here
            setCurrentStep(prev => Math.min(prev + 1, 6));
        }
    };

    return (
        <div className="flex flex-col h-full max-w-5xl mx-auto">
            {/* HEADER & PROGRESS */}
            <div className="mb-12">
                <h1 className="text-3xl font-bold text-white mb-6">Create New Series</h1>

                {/* Progress Bar */}
                <div className="relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800 -z-10 rounded-full"></div>
                    <div
                        className="absolute top-1/2 left-0 h-1 bg-indigo-600 -z-10 rounded-full transition-all duration-300"
                        style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                    ></div>

                    <div className="flex justify-between">
                        {STEPS.map((step) => (
                            <div key={step.number} className="flex flex-col items-center gap-2">
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300",
                                    currentStep >= step.number
                                        ? "bg-indigo-600 border-indigo-600 text-white"
                                        : "bg-slate-900 border-slate-700 text-slate-500"
                                )}>
                                    {step.number}
                                </div>
                                <span className={cn(
                                    "text-xs font-medium transition-colors duration-300",
                                    currentStep >= step.number ? "text-white" : "text-slate-600"
                                )}>{step.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* STEP CONTENT */}
            <div className="flex-1">
                {currentStep === 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold text-white">Select a Topic</h2>
                            <p className="text-slate-400">What kind of videos do you want to create?</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {NICHES.map((niche) => (
                                <div
                                    key={niche.id}
                                    onClick={() => setSelectedNiche(niche.id)}
                                    className={cn(
                                        "relative cursor-pointer group rounded-xl border-2 p-6 transition-all duration-200 hover:border-indigo-500/50",
                                        selectedNiche === niche.id
                                            ? "border-indigo-500 bg-indigo-500/10"
                                            : "border-white/5 bg-slate-900/50 hover:bg-slate-900"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn("p-3 rounded-lg", niche.bg)}>
                                            <niche.icon className={cn("w-6 h-6", niche.color)} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-white text-lg">{niche.label}</h3>
                                            {niche.id === 'custom' && selectedNiche === 'custom' && (
                                                <div className="mt-3" onClick={e => e.stopPropagation()}>
                                                    <Input
                                                        placeholder="E.g., Space facts, Daily motivation..."
                                                        className="bg-slate-950 border-slate-700 text-white focus-visible:ring-indigo-500"
                                                        value={customTopic}
                                                        onChange={(e) => setCustomTopic(e.target.value)}
                                                        autoFocus
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        {selectedNiche === niche.id && (
                                            <div className="absolute top-4 right-4 w-3 h-3 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>

            {/* FOOTER ACTIONS */}
            <div className="mt-12 flex justify-end pt-6 border-t border-white/10">
                <Button
                    size="lg"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 px-8"
                    disabled={!selectedNiche || (selectedNiche === 'custom' && !customTopic.trim())}
                    onClick={handleContinue}
                >
                    Continue <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
