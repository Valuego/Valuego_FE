import type { ComponentProps, ReactElement } from 'react';

import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@/shared/lib/cn';

export const buttonVariants = cva(
  'inline-flex h-[52px] items-center justify-center gap-2 rounded-xl px-[30px] text-[15.5px] font-semibold tracking-[-0.3px] transition-opacity cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-brand-blue text-white hover:opacity-90 active:opacity-80',
        dark: 'bg-ink-900 text-white hover:opacity-90 active:opacity-80',
        success: 'bg-brand-success text-white hover:opacity-90 active:opacity-80',
        outline: 'border-line-hairline bg-white text-ink-900 border hover:bg-surface-muted active:bg-surface-muted',
        ghost: 'bg-transparent text-brand-blue hover:opacity-80 active:opacity-70',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto self-start',
      },
    },
    defaultVariants: {
      variant: 'primary',
      fullWidth: false,
    },
  },
);

interface Props extends ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  leftIcon?: ReactElement;
  rightIcon?: ReactElement;
}

export const Button = ({
  className,
  variant,
  fullWidth,
  children,
  disabled,
  asChild,
  leftIcon,
  rightIcon,
  type = 'button',
  ...restProps
}: Props) => {
  const Component = asChild ? Slot.Root : 'button';

  return (
    <Component
      type={asChild ? undefined : type}
      className={cn(buttonVariants({ variant, fullWidth }), className)}
      disabled={disabled}
      {...restProps}
    >
      {Boolean(leftIcon) && leftIcon}
      <Slot.Slottable>{children}</Slot.Slottable>
      {Boolean(rightIcon) && rightIcon}
    </Component>
  );
};
