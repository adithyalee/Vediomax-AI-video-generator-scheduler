'use client';

import React, { useState } from 'react';

import { cn } from '@/lib/utils';
import { WizardFooter } from '@/components/WizardFooter';
// Import steps
import { StepTopic } from './components/StepTopic';
import { StepLanguage } from './components/StepLanguage';
import { StepMusic } from './components/StepMusic';
import { StepStyle } from './components/StepStyle';
import { StepCaption } from './components/StepCaption';
import { StepReview } from './components/StepReview';
import { WizardData } from './types';
import { scheduleSeries, getSeriesById, updateSeries } from './actions';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';


const STEPS = [
    { label: 'Topic', number: 1 },
    { label: 'Language', number: 2 },
    { label: 'Music', number: 3 },
    { label: 'Style', number: 4 },
    { label: 'Caption', number: 5 },
    { label: 'Schedule', number: 6 },
];


export default function CreateSeriesPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const seriesId = searchParams.get('id');

    const [currentStep, setCurrentStep] = useState(1);
    const [isPending, startTransition] = React.useTransition();
    const [isLoadingData, setIsLoadingData] = useState(false);

    // Initial State
    const [wizardData, setWizardData] = useState<WizardData>({
        topic: '',
        customTopic: '',
        language: '',
        voice: '',
        music: [],
        image: '',
        caption: '',
        seriesName: '',
        duration: '',
        platform: '',
        scheduleTime: '',
    });

    // Fetch data if editing
    useEffect(() => {
        if (seriesId) {
            setIsLoadingData(true);
            getSeriesById(seriesId)
                .then(data => {
                    if (data) {
                        setWizardData({
                            topic: data.topic,
                            customTopic: data.custom_topic || '',
                            language: data.language,
                            voice: data.voice,
                            music: data.music || [],
                            image: data.style_id,
                            caption: data.caption_style,
                            seriesName: data.series_name,
                            duration: data.duration,
                            platform: data.platform,
                            scheduleTime: data.schedule_time || '',
                        });
                    }
                })
                .catch(err => console.error("Failed to load series:", err))
                .finally(() => setIsLoadingData(false));
        }
    }, [seriesId]);

    const handleNext = () => {
        if (currentStep < 6) {
            setCurrentStep(prev => prev + 1);
        } else {
            // Final Submission (Create or Update)
            startTransition(async () => {
                try {
                    if (seriesId) {
                        await updateSeries(seriesId, wizardData);
                    } else {
                        await scheduleSeries(wizardData);
                    }
                    // Redirect to videos page after success
                    router.push('/dashboard/videos');
                } catch (error) {
                    console.error("Failed to save series:", error);
                    // Optionally add toast here
                }
            });
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
    const isStep4Valid = !!wizardData.image;
    const isStep5Valid = !!wizardData.caption;
    const isStep6Valid = !!wizardData.seriesName && !!wizardData.duration && !!wizardData.platform && !!wizardData.scheduleTime;

    let isNextDisabled = true;
    if (currentStep === 1) isNextDisabled = !isStep1Valid;
    if (currentStep === 2) isNextDisabled = !isStep2Valid;
    if (currentStep === 3) isNextDisabled = !isStep3Valid;
    if (currentStep === 4) isNextDisabled = !isStep4Valid;
    if (currentStep === 5) isNextDisabled = !isStep5Valid;
    if (currentStep === 6) isNextDisabled = !isStep6Valid;

    return (
        <div className="flex flex-col h-full max-w-5xl mx-auto">
            {/* HEADER & PROGRESS */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-6">
                    {seriesId ? 'Edit Series' : 'Create New Series'}
                </h1>

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

                {currentStep === 4 && (
                    <StepStyle wizardData={wizardData} setWizardData={setWizardData} />
                )}

                {currentStep === 5 && (
                    <StepCaption wizardData={wizardData} setWizardData={setWizardData} />
                )}

                {currentStep === 6 && (
                    <StepReview wizardData={wizardData} setWizardData={setWizardData} />
                )}
            </div>

            <WizardFooter
                currentStep={currentStep}
                isNextDisabled={isNextDisabled}
                isPending={isPending}
                onNext={handleNext}
                onBack={handleBack}
                nextLabel={currentStep === 6 ? (seriesId ? 'Update Series' : 'Schedule') : 'Continue'}
            />
        </div>
    );
}
