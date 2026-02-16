export interface VideoProject {
    id: string;
    created_at: string;
    user_id: string;
    topic: string; // from 'topic'
    title: string; // from 'series_name' (mapped in query) or just use the raw column
    series_name: string;
    style_id: string; // from 'style_id'
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'paused' | 'active';
    video_url?: string;
    voice_url?: string;
    script_data?: any;
    captions?: any[];
    image_urls?: string[];
    // Add other fields as needed for display
    platform: string;
    duration: string;
}
