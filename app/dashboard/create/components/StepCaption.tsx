'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { CaptionStyles, CaptionStyle } from '../data/captions';
import { useState, useEffect } from 'react';

interface StepCaptionProps {
    wizardData: any;
    setWizardData: (data: any) => void;
}

// Reusable Preview Component
function CaptionPreview({ styleId }: { styleId: string }) {
    // Sample text broken into words for word-by-word animations
    const words = ["This", "is", "a", "caption", "style"];

    if (styleId === 'hormozi') {
        return (
            <div className="flex flex-wrap justify-center gap-2 p-4 bg-black/50 rounded-lg w-full h-full items-center">
                {words.map((word, i) => (
                    <motion.span
                        key={i}
                        className={cn(
                            "text-2xl font-black uppercase",
                            i % 2 === 0 ? "text-yellow-400" : "text-white"
                        )}
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.2,
                            repeatDelay: 1
                        }}
                    >
                        {word}
                    </motion.span>
                ))}
            </div>
        );
    }

    if (styleId === 'beast') {
        return (
            <div className="flex flex-wrap justify-center gap-2 p-4 bg-black/50 rounded-lg w-full h-full items-center">
                {words.map((word, i) => (
                    <motion.span
                        key={i}
                        className="text-2xl font-black text-white uppercase drop-shadow-[0_2px_0_rgba(0,0,0,1)]"
                        style={{ WebkitTextStroke: '1px black' }}
                        animate={{
                            rotate: [0, -5, 5, 0],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{
                            duration: 0.4,
                            repeat: Infinity,
                            delay: i * 0.1,
                            repeatDelay: 2
                        }}
                    >
                        {word}
                    </motion.span>
                ))}
            </div>
        );
    }

    if (styleId === 'typewriter') {
        // Typing full sentence effect
        const text = "This is a caption style";
        const [displayedText, setDisplayedText] = useState("");

        useEffect(() => {
            let i = 0;
            const interval = setInterval(() => {
                setDisplayedText(text.slice(0, i + 1));
                i++;
                if (i > text.length) i = 0; // Loop
            }, 150);
            return () => clearInterval(interval);
        }, []);

        return (
            <div className="flex justify-center items-center w-full h-full bg-black/50 rounded-lg p-4">
                <span className="text-xl font-mono text-green-400 border-r-2 border-green-400 pr-1 animate-pulse">
                    {displayedText}
                </span>
            </div>
        );
    }

    if (styleId === 'glitch') {
        return (
            <div className="flex justify-center items-center w-full h-full bg-black/50 rounded-lg p-4">
                <motion.div
                    className="text-2xl font-bold text-white relative"
                    animate={{
                        x: [0, -2, 2, -1, 1, 0],
                        y: [0, 1, -1, 0]
                    }}
                    transition={{
                        duration: 0.2,
                        repeat: Infinity,
                        repeatDelay: 0.5
                    }}
                >
                    <span className="absolute top-0 left-0 -ml-[2px] text-red-500 opacity-70 mix-blend-screen animate-pulse">GLITCH</span>
                    <span className="absolute top-0 left-0 ml-[2px] text-blue-500 opacity-70 mix-blend-screen animate-pulse">GLITCH</span>
                    GLITCH
                </motion.div>
            </div>
        )
    }

    if (styleId === 'neon') {
        return (
            <div className="flex justify-center items-center w-full h-full bg-black/90 rounded-lg p-4">
                <motion.span
                    className="text-3xl font-bold text-pink-500 tracking-wider font-script"
                    style={{ textShadow: "0 0 10px #ec4899, 0 0 20px #ec4899" }}
                    animate={{
                        opacity: [1, 0.8, 1, 0.9, 0.4, 1]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity
                    }}
                >
                    Neon Glow
                </motion.span>
            </div>
        );
    }

    if (styleId === 'minimal') {
        return (
            <div className="flex flex-col justify-center items-center w-full h-full bg-white/10 rounded-lg p-4">
                <motion.span
                    className="text-lg font-medium text-slate-200"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        repeatDelay: 1
                    }}
                >
                    Minimalist Design
                </motion.span>
            </div>
        );
    }

    return null;
}

export function StepCaption({ wizardData, setWizardData }: StepCaptionProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col space-y-8"
        >
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white">Choose Caption Style</h2>
                <p className="text-slate-400">Select how your captions will be animated.</p>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {CaptionStyles.map((style) => (
                    <motion.div
                        key={style.id}
                        onClick={() => setWizardData((prev: any) => ({ ...prev, caption: style.id }))}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                            "relative group flex flex-col rounded-xl border-2 transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-sm",
                            wizardData.caption === style.id
                                ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_30px_rgba(99,102,241,0.3)]"
                                : "border-white/5 bg-slate-900/50 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10"
                        )}
                    >
                        {/* PREVIEW AREA */}
                        <div className="h-32 w-full p-2 relative flex items-center justify-center bg-grid-pattern overflow-hidden">
                            {/* Background Glow */}
                            <div className={cn(
                                "absolute inset-0 transition-opacity duration-500",
                                wizardData.caption === style.id ? "opacity-20 bg-indigo-500/20" : "opacity-0 group-hover:opacity-10"
                            )}></div>
                            <CaptionPreview styleId={style.id} />
                        </div>

                        {/* INFO AREA */}
                        <div className={cn(
                            "p-4 border-t transition-colors relative z-10",
                            wizardData.caption === style.id ? "border-indigo-500/30 bg-indigo-900/20" : "border-white/5 bg-slate-950/30"
                        )}>
                            <div className="flex justify-between items-center mb-1">
                                <h3 className={cn(
                                    "font-bold text-lg transition-colors",
                                    wizardData.caption === style.id ? "text-indigo-300" : "text-white group-hover:text-indigo-200"
                                )}>
                                    {style.label}
                                </h3>
                                {wizardData.caption === style.id && (
                                    <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                                        <span className="text-[10px] text-white font-bold">✓</span>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">{style.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

        </motion.div>
    );
}
