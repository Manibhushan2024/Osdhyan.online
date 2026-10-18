'use client';

import { cn } from '@/lib/utils';
import { discountPercent, formatMoney } from '@/lib/razorpay';

type Props = {
    price: number | string | null | undefined;
    mrp?: number | string | null;
    currency?: string;
    isPaid?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
};

/** ₹499 with a struck-through MRP and a discount chip. Free series read "Free". */
export default function PriceTag({ price, mrp, currency = 'INR', isPaid = true, size = 'md', className }: Props) {
    const p = Number(price ?? 0);
    const m = mrp === null || mrp === undefined || mrp === '' ? null : Number(mrp);
    const off = discountPercent(p, m);

    const sizes = {
        sm: { price: 'text-base', mrp: 'text-[10px]', chip: 'text-[7px] px-1.5 py-0.5' },
        md: { price: 'text-2xl', mrp: 'text-xs', chip: 'text-[8px] px-2 py-0.5' },
        lg: { price: 'text-4xl', mrp: 'text-sm', chip: 'text-[9px] px-2.5 py-1' },
    }[size];

    if (!isPaid || p <= 0) {
        return (
            <span className={cn('font-black uppercase tracking-widest text-green-600', sizes.price, className)}>
                Free
            </span>
        );
    }

    return (
        <span className={cn('inline-flex items-baseline gap-2 flex-wrap', className)}>
            <span className={cn('font-black text-foreground tracking-tight', sizes.price)}>{formatMoney(p, currency)}</span>
            {m !== null && m > p && (
                <span className={cn('font-bold text-foreground/40 line-through', sizes.mrp)}>{formatMoney(m, currency)}</span>
            )}
            {off !== null && (
                <span className={cn('rounded-full bg-green-500/10 text-green-600 border border-green-500/20 font-black uppercase tracking-widest', sizes.chip)}>
                    {off}% off
                </span>
            )}
        </span>
    );
}
