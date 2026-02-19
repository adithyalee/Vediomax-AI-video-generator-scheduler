'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
}

export function UpgradeModal({ isOpen, onClose, title = "Upgrade to Pro", description = "You've reached the limit of your current plan." }: UpgradeModalProps) {
    const router = useRouter();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-slate-950 border-slate-800 text-white p-0 overflow-hidden">
                <div className="relative h-32 bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
                    <Sparkles className="h-12 w-12 text-white/80 animate-pulse" />
                    <div className="absolute top-2 right-2">
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X className="h-4 w-4 text-white/70" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-2 text-center">
                        <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            {description} <br />
                            Unlock higher limits and premium features.
                        </DialogDescription>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                            <Check className="h-4 w-4 text-indigo-400 shrink-0" />
                            <span>Create more series</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                            <Check className="h-4 w-4 text-indigo-400 shrink-0" />
                            <span>Connect more social platforms</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                            <Check className="h-4 w-4 text-indigo-400 shrink-0" />
                            <span>Remove watermarks</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold h-11"
                            onClick={() => {
                                onClose();
                                router.push('/dashboard/billing');
                            }}
                        >
                            View Plans
                        </Button>
                        <Button variant="ghost" className="w-full text-slate-400 hover:text-white" onClick={onClose}>
                            Maybe Later
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
