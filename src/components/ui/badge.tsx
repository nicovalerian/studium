import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        outline: 'text-foreground',
        // Soft status tones: tinted fill, dark text from the same hue (all >= 4.5:1).
        neutral: 'border-transparent bg-warm-100 text-warm-600',
        info: 'border-transparent bg-sand-light text-sand-dark',
        success: 'border-transparent bg-sage-light text-sage-dark',
        danger: 'border-transparent bg-destructive/10 text-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge };
