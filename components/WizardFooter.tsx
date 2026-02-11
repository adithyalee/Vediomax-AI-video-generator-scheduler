import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface WizardFooterProps {
    currentStep: number;
    isNextDisabled: boolean;
    isPending?: boolean;
    onNext: () => void;
    onBack: () => void;
    nextLabel?: string;
}

export function WizardFooter({
    currentStep,
    isNextDisabled,
    isPending = false,
    onNext,
    onBack,
    nextLabel
}: WizardFooterProps) {
    return (
        <div className="mt-12 flex justify-between pt-6 border-t border-white/10">
            {currentStep === 1 ? (
                <Link href="/dashboard">
                    <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/10 gap-2">
                        <ChevronLeft className="w-4 h-4" /> Cancel
                    </Button>
                </Link>
            ) : (
                <Button
                    variant="ghost"
                    onClick={onBack}
                    disabled={isPending}
                    className="text-slate-400 hover:text-white hover:bg-white/10 gap-2"
                >
                    <ChevronLeft className="w-4 h-4" /> Back
                </Button>
            )}

            <Button
                size="lg"
                className={cn(
                    "gap-2 px-8 transition-all duration-300",
                    isNextDisabled || isPending
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]"
                )}
                disabled={isNextDisabled || isPending}
                onClick={onNext}
            >
                {isPending ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        {nextLabel || (currentStep === 6 ? 'Create Series' : 'Continue')}
                        <ChevronRight className="w-4 h-4" />
                    </>
                )}
            </Button>
        </div>
    );
}
