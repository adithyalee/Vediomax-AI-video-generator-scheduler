'use server';

import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { WizardData } from './types';
import { redirect } from 'next/navigation';

export async function scheduleSeries(data: WizardData) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error('User not authenticated');
    }

    // Check subscription limits
    const { canCreateSeries } = await import('@/lib/subscription');
    const { allowed, limit } = await canCreateSeries(userId);

    if (!allowed) {
        return {
            success: false,
            error: `Plan limit reached: You can only create ${limit} series on your current plan.`,
            code: 'LIMIT_REACHED'
        };
    }

    // Insert into Supabase
    const { error } = await supabaseAdmin.from('video_projects').insert({
        user_id: userId, // Explicitly set user_id from Clerk
        topic: data.topic,
        custom_topic: data.customTopic,
        language: data.language,
        voice: data.voice,
        music: data.music, // Supabase handles array automatically if column is text[]
        style_id: data.image, // Mapping 'image' to 'style_id'
        caption_style: data.caption,
        series_name: data.seriesName,
        duration: data.duration,
        platform: data.platform,
        schedule_time: new Date().toISOString(), // Or data.scheduleTime if you have a specific picker
        status: 'pending'
    });

    if (error) {
        console.error('Error scheduling series:', error);
        throw new Error(`Failed to schedule series: ${error.message} (Code: ${error.code}, Details: ${error.details})`);
    }

    // Redirect to dashboard on success
    redirect('/dashboard');
}

export async function getSeriesById(id: string) {
    const { userId } = await auth();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabaseAdmin
        .from('video_projects')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function updateSeries(id: string, data: WizardData) {
    const { userId } = await auth();
    if (!userId) throw new Error('User not authenticated');

    const { error } = await supabaseAdmin
        .from('video_projects')
        .update({
            topic: data.topic,
            custom_topic: data.customTopic,
            language: data.language,
            voice: data.voice,
            music: data.music,
            style_id: data.image,
            caption_style: data.caption,
            series_name: data.seriesName,
            duration: data.duration,
            platform: data.platform,
            schedule_time: data.scheduleTime || new Date().toISOString(),
            status: 'pending' // Reset status on update? Or keep? Let's reset to pending if they change parameters
        })
        .eq('id', id)
        .eq('user_id', userId);

    if (error) {
        console.error('Error updating series:', error);
        throw new Error(`Failed to update series: ${error.message}`);
    }

    redirect('/dashboard');
}
