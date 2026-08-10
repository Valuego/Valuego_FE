'use client';

import type { ComponentProps } from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/lib/cn';

export const chipVariants = cva(
  'inline-flex h-10 min-w-[80px] cursor-pointer items-center justify-center rounded-full px-[17px] text-sm font-semibold tracking-[-0.2px] transition-colors',
  {
    variants: {
      accent: {
        blue: '',
        purple: '',
      },
      selected: {
        true: '',
        false: 'border-line-hairline bg-surface-gray text-text-body border',
      },
    },
    compoundVariants: [
      {
        accent: 'blue',
        selected: true,
        className: 'border-brand-blue bg-brand-blue/10 text-brand-blue border-[1.5px]',
      },
      {
        accent: 'purple',
        selected: true,
        className: 'border-brand-purple bg-brand-purple/10 text-brand-purple border-[1.5px]',
      },
    ],
    defaultVariants: {
      accent: 'blue',
      selected: false,
    },
  },
);

type ChipProps = Omit<ComponentProps<'button'>, 'children'> &
  VariantProps<typeof chipVariants> & {
    label: string;
  };

export const Chip = ({
  label,
  accent = 'blue',
  selected = false,
  className,
  type = 'button',
  ...restProps
}: ChipProps) => {
  return (
    <button
      type={type}
      aria-pressed={Boolean(selected)}
      className={cn(chipVariants({ accent, selected }), className)}
      {...restProps}
    >
      {label}
    </button>
  );
};
