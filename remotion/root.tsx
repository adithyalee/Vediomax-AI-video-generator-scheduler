import { registerRoot } from 'remotion';
import { Composition } from 'remotion';
import { Main } from './MyComp/Main';

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="Main"
                component={Main}
                durationInFrames={300} // Fallback
                calculateMetadata={async ({ props }) => {
                    const durationInFrames = props.durationInFrames || 300;
                    return {
                        durationInFrames,
                        props
                    };
                }}
                fps={30}
                width={1080}
                height={1920}
                defaultProps={{
                    imageUrls: [],
                    audioUrl: '',
                    captions: [],
                    script: { videoTitle: 'My Title', script: 'My Script', imagePrompts: [] },
                    durationInFrames: 300 // Default prop
                }}
            />
        </>
    );
};

registerRoot(RemotionRoot);
