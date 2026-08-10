import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/lib/cn';

const MEMBER_INITIAL: Record<NonNullable<VariantProps<typeof avatarVariants>['member']>, string> = {
  doyeon: '도',
  seojun: '서',
  hayeong: '하',
  minjae: '민',
};

export const avatarVariants = cva(
  'inline-flex size-11 items-center justify-center rounded-full text-base font-bold text-white',
  {
    variants: {
      member: {
        doyeon: 'bg-member-doyeon',
        seojun: 'bg-member-seojun',
        hayeong: 'bg-member-hayeong',
        minjae: 'bg-member-minjae',
      },
    },
    defaultVariants: {
      member: 'doyeon',
    },
  },
);

type AvatarProps = VariantProps<typeof avatarVariants> & {
  className?: string;
  initial?: string;
  label?: string;
};

export const Avatar = ({ member = 'doyeon', className, initial, label }: AvatarProps) => {
  const resolvedMember = member ?? 'doyeon';
  const displayInitial = initial ?? MEMBER_INITIAL[resolvedMember];

  return (
    <div
      className={cn(avatarVariants({ member: resolvedMember }), className)}
      aria-label={label ?? displayInitial}
      role="img"
    >
      {displayInitial}
    </div>
  );
};
