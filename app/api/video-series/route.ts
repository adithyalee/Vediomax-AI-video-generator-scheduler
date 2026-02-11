import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { data, error } = await supabaseAdmin
            .from('video_projects')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching series:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Internal Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
