'use server'

import { supabaseAdmin } from "@/lib/supabase-admin";

export async function syncUserToSupabase(user: any) {
    console.log("--> STARTING SYNC for user:", user.id);

    // Check if secret key is loaded
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error("❌ CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing in env!");
        return { success: false, error: 'Missing service role key' };
    }

    try {
        console.log("Checking if user exists in Supabase...");
        const { data: existingUser, error: fetchError } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('userid', user.id)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found"
            console.error("❌ Error fetching user:", fetchError);
        }

        if (!existingUser) {
            console.log(`Syncing new user to Supabase: ${user.id}`);
            const email = user.emailAddresses[0]?.emailAddress;
            const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';

            console.log("Attempting insert with:", { userid: user.id, email, name });

            const { error: insertError } = await supabaseAdmin.from('users').insert({
                userid: user.id,
                email: email,
                name: name,
            });

            if (insertError) {
                console.error('❌ Error syncing user to Supabase:', insertError);
                return { success: false, error: insertError.message };
            }
            console.log("✅ User successfully inserted!");
        } else {
            console.log("ℹ️ User already exists in Supabase.");
        }
        return { success: true };
    } catch (error) {
        console.error('❌ Unexpected error during user sync:', error);
        return { success: false, error: 'Unexpected error' };
    }
}
