'use server'

import { getSupabaseService } from "@/lib/supabaseService";
import { revalidatePath } from "next/cache";

export type MerchantProfilePayload = {
    id: string;
    full_name: string;
    shop_name: string;
    phone: string;
};

export async function updateMerchantProfileAction(profile: MerchantProfilePayload) {
    const supabase = getSupabaseService();

    try {
        const { error } = await supabase
            .from('admins')
            .update({
                full_name: profile.full_name,
                shop_name: profile.shop_name,
                phone: profile.phone
            })
            .eq('id', profile.id);

        if (error) throw error;

        revalidatePath('/admin/settings');
        return { success: true };
    } catch (error: any) {
        console.error("updateMerchantProfileAction Error:", error);
        return { success: false, error: error.message };
    }
}
