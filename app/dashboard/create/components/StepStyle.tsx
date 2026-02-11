'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react'; // Using Check icon for selection
import { motion } from 'framer-motion';
import { VideoStyles, VideoStyle } from '../data/styles';
import Image from 'next/image';

interface StepStyleProps {
    wizardData: any;
    setWizardData: (data: any) => void;
}

export function StepStyle({ wizardData, setWizardData }: StepStyleProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col space-y-8"
        >
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white">Choose Visual Style</h2>
                <p className="text-slate-400">Select the visual aesthetic for your video.</p>
            </div>

            {/* Horizontal Scroll Container */}
            <div className="flex-1 flex items-center overflow-x-auto pb-6 custom-scrollbar px-4 -mx-4">
                <div className="flex gap-6 mx-auto">
                    {VideoStyles.map((style: VideoStyle) => (
                        <div
                            key={style.id}
                            onClick={() => setWizardData((prev: any) => ({ ...prev, image: style.id }))} // 'image' field in wizardData stores the style ID
                            className={cn(
                                "relative w-[180px] aspect-[9/16] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 group hover:scale-105 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]",
                                wizardData.image === style.id
                                    ? "ring-4 ring-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.5)] scale-105"
                                    : "opacity-70 hover:opacity-100 ring-1 ring-white/10"
                            )}
                        >
                            <Image
                                src={style.image}
                                alt={style.label}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                sizes="(max-width: 768px) 150px, 180px"
                            />

                            {/* Overlay Label */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4">
                                <h3 className={cn(
                                    "font-bold text-lg text-center transition-colors",
                                    wizardData.image === style.id ? "text-indigo-400" : "text-white"
                                )}>
                                    {style.label}
                                </h3>
                            </div>

                            {/* Selection Indicator */}
                            {wizardData.image === style.id && (
                                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg border border-white/20">
                                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
