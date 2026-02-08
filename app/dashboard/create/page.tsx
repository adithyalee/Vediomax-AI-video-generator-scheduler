'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { WizardFooter } from '@/components/WizardFooter';
// Import steps
import { StepTopic } from './components/StepTopic';
import { StepLanguage } from './components/StepLanguage';
import { StepMusic } from './components/StepMusic';

const STEPS = [
    { label: 'Topic', number: 1 },
    { label: 'Language', number: 2 },
    { label: 'Music', number: 3 },
    { label: 'Image', number: 4 },
    { label: 'Captions', number: 5 },
    { label: 'Review', number: 6 },
];

export interface WizardData {
    topic: string;
    customTopic: string;
    language: string;
    voice: string;
    music: string[];
}

export default function CreateSeriesPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [wizardData, setWizardData] = useState<WizardData>({
        topic: '',
        customTopic: '',
        language: '',
        voice: '',
        music: [],
    });

    const handleNext = () => {
        console.log("Current Data:", wizardData);
        if (currentStep < 6) {
            setCurrentStep(prev => prev + 1);
        } else {
            console.log("Creating Series...", wizardData);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    // Validation logic
    // We can verify validity here or pass validation functions to steps
    const isStep1Valid = !!wizardData.topic && (wizardData.topic !== 'custom' || !!wizardData.customTopic.trim());
    const isStep2Valid = !!wizardData.language && !!wizardData.voice;
    const isStep3Valid = (wizardData.music || []).length > 0;

    let isNextDisabled = true;
    if (currentStep === 1) isNextDisabled = !isStep1Valid;
    if (currentStep === 2) isNextDisabled = !isStep2Valid;
    if (currentStep === 3) isNextDisabled = !isStep3Valid;

    return (
        <div className="flex flex-col h-full max-w-5xl mx-auto">
            {/* HEADER & PROGRESS */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-6">Create New Series</h1>

                {/* Horizontal Stepper */}
                <div className="relative mb-10">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800 -z-10 rounded-full"></div>
                    <div
                        className="absolute top-1/2 left-0 h-1 bg-indigo-600 -z-10 rounded-full transition-all duration-300"
                        style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                    ></div>

                    <div className="flex justify-between">
                        {STEPS.map((step) => (
                            <div key={step.number} className="flex flex-col items-center gap-2">
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 bg-slate-950",
                                    currentStep >= step.number
                                        ? "border-indigo-600 text-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                                        : "border-slate-700 text-slate-500"
                                )}>
                                    {currentStep > step.number ? '✓' : step.number}
                                </div>
                                <span className={cn(
                                    "text-xs font-medium transition-colors duration-300 uppercase tracking-wider",
                                    currentStep >= step.number ? "text-indigo-400" : "text-slate-600"
                                )}>{step.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* DYNAMIC FORM STEPS */}
            <div className="flex-1 min-h-[400px] flex flex-col">
                {currentStep === 1 && (
                    <StepTopic wizardData={wizardData} setWizardData={setWizardData} />
                )}

                {currentStep === 2 && (
                    <StepLanguage wizardData={wizardData} setWizardData={setWizardData} />
                )}

                {currentStep === 3 && (
                    <StepMusic wizardData={wizardData} setWizardData={setWizardData} />
                )}

                {/* FUTURE STEPS PLACEHOLDER */}
                {currentStep > 3 && (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-white">Step {currentStep}</h2>
                            <p className="text-slate-400">Coming soon!</p>
                        </div>
                    </div>
                )}
            </div>

            <WizardFooter
                currentStep={currentStep}
                isNextDisabled={isNextDisabled}
                onNext={handleNext}
                onBack={handleBack}
            />
        </div>
    );
}
