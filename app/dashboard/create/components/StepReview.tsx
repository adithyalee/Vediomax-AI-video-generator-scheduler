'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Clock,
    Instagram,
    Youtube,
    Mail,
    Video,
    Film
} from 'lucide-react';

interface StepReviewProps {
    wizardData: any;
    setWizardData: (data: any) => void;
}

export function StepReview({ wizardData, setWizardData }: StepReviewProps) {

    // Helper to update specific fields
    const updateField = (field: string, value: any) => {
        setWizardData((prev: any) => ({ ...prev, [field]: value }));
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col space-y-8 max-w-2xl mx-auto w-full"
        >
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white">Final Details</h2>
                <p className="text-slate-400">Review settings and schedule your series.</p>
            </div>

            <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 backdrop-blur-xl shadow-2xl relative overflow-hidden">

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full pointer-events-none -z-10" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full pointer-events-none -z-10" />

                {/* 1. Series Title */}
                <div className="space-y-3 mb-6">
                    <Label htmlFor="seriesName" className="text-white text-base font-semibold">Series Name</Label>
                    <Input
                        id="seriesName"
                        placeholder="e.g. Daily Tech Facts"
                        className="bg-slate-950/50 border-slate-700/50 text-white h-14 text-lg focus:border-indigo-500 transition-colors"
                        value={wizardData.seriesName || ''}
                        onChange={(e) => updateField('seriesName', e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* 2. Video Duration */}
                    <div className="space-y-3">
                        <Label className="text-white text-base font-semibold">Duration & Format</Label>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { id: '30-60', label: 'Short', desc: '30-60s' },
                                { id: '60-90', label: 'Long', desc: '60-90s' }
                            ].map((opt) => (
                                <div
                                    key={opt.id}
                                    onClick={() => updateField('duration', opt.id)}
                                    className={cn(
                                        "p-3 rounded-xl border transition-all cursor-pointer flex flex-col items-center gap-1",
                                        wizardData.duration === opt.id
                                            ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                                            : "bg-slate-950/50 border-white/5 text-slate-400 hover:border-indigo-500/30 hover:bg-slate-900"
                                    )}
                                >
                                    <span className="font-bold text-sm">{opt.label}</span>
                                    <span className="text-[10px] opacity-70">{opt.desc}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Scheduling */}
                    <div className="space-y-3">
                        <Label className="text-white text-base font-semibold">Schedule Time</Label>
                        <div className="relative">
                            <Input
                                type="time"
                                className="bg-slate-950/50 border-slate-700/50 text-white h-14 pl-12 text-lg"
                                value={wizardData.scheduleTime || ''}
                                onChange={(e) => updateField('scheduleTime', e.target.value)}
                            />
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* 3. Platform */}
                <div className="space-y-3 mb-6">
                    <Label className="text-white text-base font-semibold">Destination</Label>
                    <div className="grid grid-cols-4 gap-3">
                        {[
                            { id: 'tiktok', label: 'TikTok', icon: Film },
                            { id: 'youtube', label: 'YouTube', icon: Youtube },
                            { id: 'instagram', label: 'Instagram', icon: Instagram },
                            { id: 'email', label: 'Email', icon: Mail },
                        ].map((platform) => (
                            <div
                                key={platform.id}
                                onClick={() => updateField('platform', platform.id)}
                                className={cn(
                                    "p-3 rounded-xl border transition-all cursor-pointer flex flex-col items-center gap-2 group",
                                    wizardData.platform === platform.id
                                        ? "bg-gradient-to-br from-indigo-600/80 to-purple-600/80 border-transparent text-white shadow-lg shadow-indigo-500/20"
                                        : "bg-slate-950/50 border-white/5 text-slate-400 hover:border-indigo-500/30 hover:bg-slate-900"
                                )}
                            >
                                <platform.icon className={cn(
                                    "w-6 h-6 transition-all duration-300",
                                    wizardData.platform === platform.id ? "scale-110" : "group-hover:scale-110 group-hover:text-white"
                                )} />
                                <span className="text-[10px] font-bold uppercase tracking-wider">{platform.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Info Note */}
                <div className="bg-indigo-950/30 p-4 rounded-xl border border-indigo-500/20 flex gap-3 text-sm">
                    <div className="min-w-[20px] pt-0.5">ℹ️</div>
                    <div className="text-indigo-200/80">
                        Generation begins <span className="text-indigo-300 font-bold">3-6 hours</span> before publish time. We'll email you when it's ready for final review.
                    </div>
                </div>

            </div>
        </motion.div>
    );
}
