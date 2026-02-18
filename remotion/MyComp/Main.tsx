import { AbsoluteFill, Audio, Sequence, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { Captions } from './Captions';
import { Scene } from './Scene';

// Define Props schema
export const myCompSchema = z.object({
    imageUrls: z.array(z.string()),
    audioUrl: z.string(),
    captions: z.array(z.any()), // TODO: Type properly based on Deepgram output
    script: z.object({
        videoTitle: z.string(),
        script: z.string(),
        imagePrompts: z.array(z.string()),
    }),
    durationInFrames: z.number().optional()
});

export const Main: React.FC<z.infer<typeof myCompSchema>> = ({ imageUrls, audioUrl, captions, script }) => {
    const { durationInFrames } = useVideoConfig();

    // Calculate duration per image (simple even split for now)
    const totalImages = imageUrls.length || 1;
    const durationPerImage = Math.floor(durationInFrames / totalImages);

    return (
        <AbsoluteFill style={{ backgroundColor: 'black' }}>
            {/* Audio Track */}
            {audioUrl && <Audio src={audioUrl} />}

            {/* Image Sequence with Slide Down Animation */}
            {imageUrls.map((url, i) => {
                const start = i * durationPerImage;
                // Last image takes remaining frames to avoid gaps
                const duration = i === totalImages - 1 ? durationInFrames - start : durationPerImage;

                return (
                    <Sequence key={i} from={start} durationInFrames={duration}>
                        <Scene imageUrl={url} title={i === 0 ? script.videoTitle : undefined} />
                    </Sequence>
                );
            })}

            {/* Captions Overlay */}
            <Captions captions={captions} />
        </AbsoluteFill>
    );
};
