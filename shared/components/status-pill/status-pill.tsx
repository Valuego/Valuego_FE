import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/lib/cn';

export const statusPillVariants = cva(
  'inline-flex h-[22px] items-center justify-center rounded-full px-2.5 text-[12px] font-bold whitespace-nowrap',
  {
    variants: {
      tone: {
        done: 'bg-brand-success/10 text-brand-success',
        pending: 'bg-surface-muted text-text-secondary-soft',
        idle: 'bg-surface-muted text-ink-900',
        host: 'bg-brand-blue/10 text-brand-blue',
        warning: 'bg-[rgba(255,146,0,0.1)] text-[#ff9200]',
      },
    },
    defaultVariants: {
      tone: 'pending',
    },
  },
);

type StatusPillProps = VariantProps<typeof statusPillVariants> & {
  label: string;
  className?: string;
};

export const StatusPill = ({ label, tone = 'pending', className }: StatusPillProps) => {
  return <span className={cn(statusPillVariants({ tone }), className)}>{label}</span>;
};
