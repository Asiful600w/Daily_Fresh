'use server';

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { revalidatePath } from "next/cache";

export interface Address {
    id: string;
    label: string;
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
}

export async function getUserAddresses() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return [];

        const { data, error } = await supabaseAdmin
            .from('addresses')
            .select('*')
            .eq('user_id', user.id)
            .order('is_default', { ascending: false });

        if (error) {
            console.error('Error fetching addresses:', error);
            return [];
        }

        return data.map((addr: any) => ({
            id: addr.id,
            label: addr.label,
            fullName: addr.full_name,
            phone: addr.phone,
            street: addr.street,
            city: addr.city,
            state: addr.state,
            postalCode: addr.postal_code,
            country: addr.country,
            isDefault: addr.is_default,
        }));
    } catch (error) {
        console.error('Server Action Error:', error);
        return [];
    }
}

export async function saveAddress(addressData: Partial<Address>) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error("Unauthorized");

        const payload = {
            user_id: user.id,
            label: addressData.label,
            full_name: addressData.fullName,
            phone: addressData.phone,
            street: addressData.street,
            city: addressData.city,
            state: addressData.state,
            postal_code: addressData.postalCode,
            country: addressData.country,
            is_default: addressData.isDefault
        };

        let result;

        if (addressData.id) {
            // Update
            result = await supabaseAdmin
                .from('addresses')
                .update(payload)
                .eq('id', addressData.id)
                .eq('user_id', user.id);
        } else {
            // Insert
            result = await supabaseAdmin
                .from('addresses')
                .insert(payload);
        }

        if (result.error) throw result.error;

        revalidatePath('/profile/addresses');
        return { success: true };
    } catch (error) {
        console.error('Error saving address:', error);
        throw error;
    }
}

export async function deleteAddress(id: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error("Unauthorized");

        const { error } = await supabaseAdmin
            .from('addresses')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) throw error;

        revalidatePath('/profile/addresses');
        return { success: true };
    } catch (error) {
        console.error('Error deleting address:', error);
        throw error;
    }
}

export async function setDefaultAddress(id: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error("Unauthorized");

        const { error } = await supabaseAdmin
            .from('addresses')
            .update({ is_default: true })
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) throw error;

        revalidatePath('/profile/addresses');
        return { success: true };
    } catch (error) {
        console.error('Error setting default address:', error);
        throw error;
    }
}
