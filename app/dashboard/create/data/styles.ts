export interface VideoStyle {
    id: string;
    label: string;
    image: string;
}

export const VideoStyles: VideoStyle[] = [
    {
        id: "realistic",
        label: "Realistic",
        image: "/Styles/realistic.png"
    },
    {
        id: "cartoon", // Renamed from '3d-render' for cleaner ID? No, keep it matching filename logic for now or mapped
        label: "3D Render",
        image: "/Styles/3d-render.png"
    },
    {
        id: "anime",
        label: "Anime",
        image: "/Styles/anime.png"
    },
    {
        id: "cinematic",
        label: "Cinematic",
        image: "/Styles/cinematic.png"
    },
    {
        id: "cyberpunk",
        label: "Cyberpunk",
        image: "/Styles/cyberpunk.png"
    },
    {
        id: "gta",
        label: "GTA Style",
        image: "/Styles/gta.png"
    }
];
