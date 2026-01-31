import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vaohkfonpifdvwarsnac.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhb2hrZm9ucGlmZHZ3YXJzbmFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4OTAwNjcsImV4cCI6MjA4NDQ2NjA2N30.uqCcZflkUESMQVGfMnkK5fsf3pEiksKJImnnPtaZ3iQ';

// separate client for admin with its own storage key to allow dual-login
export const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false, // Don't steal auth from URL intended for main site if possible, or irrelevant
        storageKey: 'sb-admin-token' // <--- CRITICAL: Different storage key
    }
});
