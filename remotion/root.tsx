import { registerRoot } from 'remotion';
import { Composition } from 'remotion';
import { Main } from './MyComp/Main';

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="Main"
                component={Main}
                durationInFrames={1800} // Default to 60s (safeguard)
                calculateMetadata={async ({ props }) => {
                    const durationInFrames = props.durationInFrames ? Number(props.durationInFrames) : 1800;
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
