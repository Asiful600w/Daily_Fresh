
import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | undefined

export function createClient() {
    if (typeof window === 'undefined') {
        return createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookieOptions: {
                    name: 'web-auth-token',
                }
            }
        );
    }

    if ((window as any)._supabaseClient) {
        return (window as any)._supabaseClient;
    }

    const client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookieOptions: {
                name: 'web-auth-token',
            }
        }
    );

    (window as any)._supabaseClient = client;
    return client;
}
