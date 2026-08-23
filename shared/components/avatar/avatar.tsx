import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/lib/cn';

const MEMBER_INITIAL: Record<NonNullable<VariantProps<typeof avatarVariants>['member']>, string> = {
  doyeon: '도',
  seojun: '서',
  hayeong: '하',
  minjae: '민',
};

export const avatarVariants = cva('inline-flex items-center justify-center rounded-full font-bold text-white', {
  variants: {
    member: {
      doyeon: 'bg-member-doyeon',
      seojun: 'bg-member-seojun',
      hayeong: 'bg-member-hayeong',
      minjae: 'bg-member-minjae',
    },
    size: {
      sm: 'size-7 text-[10px]',
      md: 'size-11 text-base',
      lg: 'size-14 text-xl',
    },
  },
  defaultVariants: {
    member: 'doyeon',
    size: 'md',
  },
});

type AvatarProps = VariantProps<typeof avatarVariants> & {
  className?: string;
  initial?: string;
  label?: string;
};

export const Avatar = ({ member = 'doyeon', size = 'md', className, initial, label }: AvatarProps) => {
  const resolvedMember = member ?? 'doyeon';
  const displayInitial = initial ?? MEMBER_INITIAL[resolvedMember];

  return (
    <div
      className={cn(avatarVariants({ member: resolvedMember, size }), className)}
      aria-label={label ?? displayInitial}
      role="img"
    >
      {displayInitial}
    </div>
  );
};
