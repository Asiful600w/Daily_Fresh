// Server-side product validation utility

import { z } from 'zod';

/**
 * Strips HTML tags from a string to prevent XSS.
 */
function stripHtml(str: string): string {
    return str.replace(/<[^>]*>/g, '').trim();
}

/**
 * Zod schema for product validation.
 * Applied server-side before any database operation.
 */
export const productSchema = z.object({
    id: z.number().int().positive().optional(),

    name: z
        .string()
        .min(2, 'Product name must be at least 2 characters')
        .max(200, 'Product name must be under 200 characters')
        .transform(stripHtml),

    price: z
        .number()
        .positive('Price must be greater than 0')
        .max(999999, 'Price cannot exceed 999,999'),

    originalPrice: z
        .number()
        .positive('Original price must be greater than 0')
        .max(999999, 'Original price cannot exceed 999,999')
        .optional()
        .nullable(),

    description: z
        .string()
        .max(5000, 'Description must be under 5,000 characters')
        .transform(stripHtml),

    category: z
        .string()
        .min(1, 'Category is required'),

    subcategory: z.string().optional().nullable(),

    stockQuantity: z
        .number()
        .int('Stock must be a whole number')
        .min(0, 'Stock cannot be negative')
        .max(99999, 'Stock cannot exceed 99,999'),

    quantity: z.string().max(50).optional().nullable(),

    images: z
        .array(z.string().url('Each image must be a valid URL'))
        .max(6, 'Maximum 6 images allowed')
        .default([]),

    colors: z
        .array(z.string().max(30).transform(stripHtml))
        .max(20)
        .optional()
        .nullable(),

    sizes: z
        .array(z.string().max(20).transform(stripHtml))
        .max(20)
        .optional()
        .nullable(),

    discountPercent: z
        .number()
        .min(0, 'Discount cannot be negative')
        .max(100, 'Discount cannot exceed 100%')
        .optional()
        .nullable(),

    specialCategoryId: z.number().int().positive().optional().nullable(),

    // These are overridden server-side for MERCHANT, so we accept but don't trust
    merchantId: z.string().optional().nullable(),
    shopName: z.string().max(200).optional().nullable(),

    // SEO fields
    metaTitle: z
        .string()
        .max(70, 'Meta title must be under 70 characters')
        .transform(stripHtml)
        .optional()
        .nullable(),

    metaDescription: z
        .string()
        .max(160, 'Meta description must be under 160 characters')
        .transform(stripHtml)
        .optional()
        .nullable(),

    keywords: z
        .array(z.string().max(50).transform(stripHtml))
        .max(20)
        .optional()
        .nullable(),

    canonicalUrl: z.string().url().max(500).optional().nullable().or(z.literal('')),
    noIndex: z.boolean().optional().nullable(),
    ogImage: z.string().url().max(500).optional().nullable().or(z.literal('')),
});

export type ValidatedProduct = z.infer<typeof productSchema>;

/**
 * Validate product data. Returns either the validated data or an error message.
 */
export function validateProduct(data: unknown): { success: true; data: ValidatedProduct } |
{ success: false; error: string } {
    const result = productSchema.safeParse(data);
    if (!result.success) {
        const firstError = result.error.issues[0];
        return {
            success: false,
            error: `${firstError.path.join('.')}: ${firstError.message}`,
        };
    }
    return { success: true, data: result.data };
}
