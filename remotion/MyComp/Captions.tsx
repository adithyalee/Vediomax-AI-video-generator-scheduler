import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

interface Word {
    word: string;
    start: number;
    end: number;
    confidence: number;
    punctuated_word?: string; // Deepgram often provides this
}

interface CaptionsProps {
    captions: Word[];
}

export const Captions: React.FC<CaptionsProps> = ({ captions }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const currentTime = frame / fps;

    // Group words into chunks of 3 for display
    // We want to find the chunk that contains the current time
    const currentChunk = useMemo(() => {
        if (!captions || captions.length === 0) return null;

        // Find the active word
        const activeWordIndex = captions.findIndex(
            (w) => currentTime >= w.start && currentTime <= w.end
        );

        // If in silence (between words), find the next upcoming word to keep context or previous
        // Better: Find the word that *should* be active or was just active
        let targetIndex = activeWordIndex;
        if (targetIndex === -1) {
            // If not on exact word, find the segment we are in
            targetIndex = captions.findIndex((w) => currentTime < w.start);
            if (targetIndex === -1) targetIndex = captions.length - 1; // End of audio
            else targetIndex = Math.max(0, targetIndex - 1); // Previous word
        }

        // Calculate chunk index (floored division by 3)
        const chunkIndex = Math.floor(targetIndex / 3);
        const start = chunkIndex * 3;
        const end = start + 3;

        return captions.slice(start, end);
    }, [captions, currentTime]);

    if (!currentChunk || currentChunk.length === 0) return null;

    return (
        <AbsoluteFill
            style={{
                justifyContent: 'flex-end',
                alignItems: 'center',
                paddingBottom: 150, // Position near bottom
            }}
        >
            <div
                style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    padding: '20px 40px',
                    borderRadius: '20px',
                    display: 'flex',
                    gap: '12px',
                    flexWrap: 'wrap',
                    maxWidth: '80%',
                    justifyContent: 'center',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(5px)',
                }}
            >
                {currentChunk.map((w, i) => {
                    const isActive = currentTime >= w.start && currentTime <= w.end;

                    return (
                        <span
                            key={i}
                            style={{
                                color: isActive ? '#facc15' : 'white', // Yellow highlight for active word
                                fontSize: 50,
                                fontFamily: 'sans-serif',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                textShadow: '2px 2px 0px rgba(0,0,0,0.5)',
                                transform: isActive ? 'scale(1.1)' : 'scale(1)',
                                transition: 'all 0.1s ease',
                            }}
                        >
                            {w.punctuated_word || w.word}
                        </span>
                    );
                })}
            </div>
        </AbsoluteFill>
    );
};
