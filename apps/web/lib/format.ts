export const CURRENCY_SYMBOL = '৳';
export const CURRENCY_CODE = 'BDT';

export function formatPrice(amount: number | undefined | null): string {
    if (amount === undefined || amount === null) return `${CURRENCY_SYMBOL}0`;
    // Format with commas for thousands
    return `${CURRENCY_SYMBOL}${amount.toLocaleString('en-BD')}`;
}
