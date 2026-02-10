import { supabase, Address, mapAddress } from './common';

// -- CUSTOMERS --

export async function getCustomers(phoneQuery?: string) {
    const { data, error } = await supabase
        .from('User')
        .select('*');

    if (error) {
        console.error('Error fetching customers:', error);
        return [];
    }
    // Map User table fields to profile-like structure
    return data.map((user: any) => ({
        id: user.id,
        full_name: user.name,
        avatar_url: user.image,
        phone: user.phone,
        email: user.email,
        created_at: user.createdAt
    }));
}

export async function getCustomerById(id: string) {
    const { data, error } = await supabase
        .from('User')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error(`Error fetching customer ${id}:`, error);
        return null;
    }
    return {
        ...data,
        full_name: data.name,
        avatar_url: data.image
    };
}

// -- ADDRESSES --

export async function getUserAddresses(userId: string): Promise<Address[]> {
    const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching addresses:', error);
        return [];
    }

    return data.map(mapAddress);
}

export async function saveAddress(userId: string, address: Partial<Address>) {
    if (address.id) {
        const { error } = await supabase
            .from('addresses')
            .update({
                label: address.label,
                full_name: address.fullName,
                phone: address.phone,
                street: address.street,
                city: address.city,
                state: address.state,
                postal_code: address.postalCode,
                country: address.country,
                is_default: address.isDefault
            })
            .eq('id', address.id)
            .eq('user_id', userId);

        if (error) throw error;
    } else {
        const { error } = await supabase
            .from('addresses')
            .insert({
                user_id: userId,
                label: address.label,
                full_name: address.fullName,
                phone: address.phone,
                street: address.street,
                city: address.city,
                state: address.state,
                postal_code: address.postalCode,
                country: address.country,
                is_default: address.isDefault
            });

        if (error) throw error;
    }
}

export async function deleteAddress(id: string) {
    const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

export async function setDefaultAddress(userId: string, id: string) {
    const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', id)
        .eq('user_id', userId);

    if (error) throw error;
}

// -- REVIEWS --

export async function checkReviewEligibility(userId: string, productId: string | number): Promise<boolean> {
    const { data: eligibleOrders, error } = await supabase
        .from('orders')
        .select(`
            id,
            status,
            order_items!inner(product_id)
        `)
        .eq('user_id', userId)
        .eq('status', 'delivered')
        .eq('order_items.product_id', productId)
        .limit(1);

    if (error) {
        console.error('Error checking eligibility:', error);
        return false;
    }

    const { data: existingReview, error: reviewError } = await supabase
        .from('reviews')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .maybeSingle();

    if (reviewError) {
        console.error('Error checking existing reviews:', reviewError);
    }

    const hasPurchased = eligibleOrders && eligibleOrders.length > 0;
    const hasReviewed = !!existingReview;

    return hasPurchased && !hasReviewed;
}

export async function getAdminReviews(filters?: { rating?: number | 'all', visibility?: 'all' | 'visible' | 'hidden' }) {
    let query = supabase
        .from('reviews')
        .select(`
            *,
            profiles (full_name, avatar_url),
            products (name, images)
        `)
        .order('created_at', { ascending: false });

    if (filters?.rating && filters.rating !== 'all') {
        query = query.eq('rating', filters.rating);
    }

    if (filters?.visibility) {
        if (filters.visibility === 'visible') {
            query = query.eq('is_hidden', false);
        } else if (filters.visibility === 'hidden') {
            query = query.eq('is_hidden', true);
        }
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching admin reviews:', error);
        throw error;
    }
    return data;
}

export async function toggleReviewVisibility(id: number | string, isHidden: boolean) {
    const { error } = await supabase
        .from('reviews')
        .update({ is_hidden: isHidden })
        .eq('id', id);

    if (error) throw error;
}
