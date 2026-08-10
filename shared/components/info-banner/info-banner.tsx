import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/lib/cn';

const ACCENT_EMOJI = {
  blue: '💡',
  green: '✅',
  purple: '✨',
} as const;

export const infoBannerVariants = cva('flex h-12 w-full items-center gap-2.5 rounded-xl px-4 py-3.5', {
  variants: {
    accent: {
      blue: 'bg-brand-blue/7',
      green: 'bg-brand-success/7',
      purple: 'bg-brand-purple/7',
    },
  },
  defaultVariants: {
    accent: 'blue',
  },
});

type InfoBannerProps = VariantProps<typeof infoBannerVariants> & {
  message: string;
  className?: string;
  emoji?: string;
};

export const InfoBanner = ({ accent = 'blue', message, className, emoji }: InfoBannerProps) => {
  const resolvedAccent = accent ?? 'blue';

  return (
    <div className={cn(infoBannerVariants({ accent: resolvedAccent }), className)} role="status">
      <span className="shrink-0 text-base" aria-hidden>
        {emoji ?? ACCENT_EMOJI[resolvedAccent]}
      </span>
      <p className="text-text-body min-w-0 flex-1 text-[13.5px] font-semibold tracking-[-0.1px]">{message}</p>
    </div>
  );
};
