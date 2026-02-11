'use client';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Ghost, Zap, Lightbulb, Activity, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

const AVAILABLE_NICHES = [
    {
        id: 'scary',
        label: 'Scary Stories',
        description: 'Spooky tales and urban legends.',
        icon: Ghost,
        color: 'text-purple-400',
        bg: 'bg-purple-500/10 border-purple-500/20'
    },
    {
        id: 'motivational',
        label: 'Motivational',
        description: 'Inspiring quotes and success stories.',
        icon: Zap,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/20'
    },
    {
        id: 'interesting',
        label: 'Interesting Facts',
        description: 'Mind-blowing trivia and curiosity.',
        icon: Lightbulb,
        color: 'text-blue-400',
        bg: 'bg-blue-500/10 border-blue-500/20'
    },
    {
        id: 'health',
        label: 'Health & Fitness',
        description: 'Workouts, diet tips, and wellness.',
        icon: Activity,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
        id: 'finance',
        label: 'Finance Tips',
        description: 'Money management, investing, and wealth.',
        icon: TrendingUp,
        color: 'text-green-400',
        bg: 'bg-green-500/10 border-green-500/20'
    },
    {
        id: 'history',
        label: 'History',
        description: 'Past events and historical figures.',
        icon: Sparkles,
        color: 'text-orange-400',
        bg: 'bg-orange-500/10 border-orange-500/20'
    },
];

interface StepTopicProps {
    wizardData: any;
    setWizardData: (data: any) => void;
}

export function StepTopic({ wizardData, setWizardData }: StepTopicProps) {
    const [activeTab, setActiveTab] = useState<'available' | 'custom'>('available');

    // Update parent about tab state if needed, or just infer validility in parent
    // For now we manage tab state locally as it's UI logic, but data goes to parent

    return (
        <div className="flex-1 flex flex-col">
            <div className="text-center space-y-2 mb-8">
                <h2 className="text-2xl font-bold text-white">Select a Niche</h2>
                <p className="text-slate-400">Choose a topic for your automated videos.</p>
            </div>

            {/* TABS */}
            <div className="flex justify-center mb-8">
                <div className="bg-slate-900 p-1 rounded-full flex gap-1 border border-white/5">
                    <button
                        onClick={() => setActiveTab('available')}
                        className={cn(
                            "px-6 py-2 rounded-full text-sm font-medium transition-all duration-200",
                            activeTab === 'available'
                                ? "bg-indigo-600 text-white shadow-lg"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        Available Niches
                    </button>
                    <button
                        onClick={() => setActiveTab('custom')}
                        className={cn(
                            "px-6 py-2 rounded-full text-sm font-medium transition-all duration-200",
                            activeTab === 'custom'
                                ? "bg-indigo-600 text-white shadow-lg"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        Custom Niche
                    </button>
                </div>
            </div>

            {/* TAB CONTENT */}
            <div className="flex-1">
                {activeTab === 'available' ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="h-96 overflow-y-auto pr-2 custom-scrollbar"
                    >

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                            {AVAILABLE_NICHES.map((niche) => {
                                const isSelected = wizardData.topic === niche.id;
                                return (
                                    <motion.div
                                        key={niche.id}
                                        onClick={() => setWizardData((prev: any) => ({ ...prev, topic: niche.id }))}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={cn(
                                            "relative cursor-pointer group rounded-xl p-5 transition-all duration-300 overflow-hidden",
                                            isSelected
                                                ? "bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-2 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.3)]"
                                                : "bg-slate-900 border border-white/10 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10"
                                        )}
                                    >
                                        <div className="flex items-start gap-4 relative z-10">
                                            <div className={cn(
                                                "p-3 rounded-lg mt-1 transition-colors duration-300",
                                                isSelected ? "bg-indigo-500 text-white" : niche.bg
                                            )}>
                                                <niche.icon className={cn(
                                                    "w-6 h-6 transition-colors duration-300",
                                                    isSelected ? "text-white" : niche.color
                                                )} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className={cn(
                                                    "font-bold text-lg transition-colors duration-300",
                                                    isSelected ? "text-white" : "text-slate-200 group-hover:text-white"
                                                )}>
                                                    {niche.label}
                                                </h3>
                                                <p className="text-sm text-slate-400 mt-1 leading-relaxed">{niche.description}</p>
                                            </div>
                                            {isSelected && (
                                                <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg animate-in zoom-in spin-in-90 duration-300">
                                                    <span className="text-xs text-white font-bold">✓</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Background Glow Effect */}
                                        <div className={cn(
                                            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                                            "bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 ease-in-out"
                                        )} />
                                    </motion.div>
                                );
                            })}
                        </div>

                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center p-10 border border-dashed border-white/10 rounded-2xl bg-slate-900/20 h-96"
                    >
                        <div className="w-full max-w-md space-y-4">
                            <div className="text-center">
                                <Sparkles className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-white">Create Your Own</h3>
                                <p className="text-slate-400 text-sm">Type any topic and we'll generate content for it.</p>
                            </div>
                            <Input
                                placeholder="E.g., Underwater Basket Weaving..."
                                className="bg-slate-950 border-slate-700 text-white focus-visible:ring-indigo-500 h-12 text-lg"
                                value={wizardData.customTopic}
                                onChange={(e) => setWizardData((prev: any) => ({ ...prev, customTopic: e.target.value }))}
                                autoFocus
                            />
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
