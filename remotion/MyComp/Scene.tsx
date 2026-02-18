import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface SceneProps {
    imageUrl: string;
    title?: string;
}

export const Scene: React.FC<SceneProps> = ({ imageUrl, title }) => {
    const frame = useCurrentFrame();
    const { fps, width } = useVideoConfig();

    // Slide down animation
    const entrance = spring({
        frame,
        fps,
        config: {
            damping: 200,
        },
    });

    // Interpolate Y position: Start from -100% (top) to 0 (center)
    const translateY = interpolate(entrance, [0, 1], [-100, 0]);

    // Scale animation for a slight "Ken Burns" effect after entrance
    const scale = interpolate(frame, [0, 150], [1, 1.05], {
        extrapolateRight: 'clamp',
    });

    return (
        <AbsoluteFill style={{ overflow: 'hidden' }}>
            <AbsoluteFill
                style={{
                    transform: `translateY(${translateY}%) scale(${scale})`,
                }}
            >
                <Img
                    src={imageUrl}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                />
            </AbsoluteFill>

            {title && (
                <AbsoluteFill
                    style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 10,
                        backgroundColor: 'rgba(0,0,0,0.3)'
                    }}
                >
                    <h1
                        style={{
                            fontFamily: 'sans-serif',
                            fontSize: 80,
                            color: 'white',
                            textAlign: 'center',
                            textTransform: 'uppercase',
                            letterSpacing: '10px',
                            fontWeight: 'bold',
                            textShadow: '0 0 20px rgba(0,0,0,0.8)',
                            opacity: interpolate(frame, [0, 30, 80], [0, 1, 0])
                        }}
                    >
                        {title}
                    </h1>
                </AbsoluteFill>
            )}
        </AbsoluteFill>
    );
};
