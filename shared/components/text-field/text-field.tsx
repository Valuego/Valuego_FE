'use client';

import type { ComponentProps } from 'react';

import { useId, useState } from 'react';

import { cn } from '@/shared/lib/cn';

type TextFieldProps = Omit<ComponentProps<'input'>, 'size'> & {
  label: string;
  containerClassName?: string;
};

export const TextField = ({
  label,
  className,
  containerClassName,
  id,
  disabled,
  value,
  defaultValue,
  onChange,
  onFocus,
  onBlur,
  ...restProps
}: TextFieldProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [focused, setFocused] = useState(false);
  const [uncontrolledValue, setUncontrolledValue] = useState(String(defaultValue ?? ''));
  const isControlled = value !== undefined;
  const hasValue = isControlled ? String(value).length > 0 : uncontrolledValue.length > 0;

  return (
    <label className={cn('flex w-full flex-col gap-2', containerClassName)} htmlFor={inputId}>
      <span className="text-text-secondary-soft text-[13px] font-semibold">{label}</span>
      <span
        className={cn(
          'flex h-14 w-full items-center overflow-hidden rounded-xl px-4 transition-colors',
          focused && 'border-brand-blue border-[1.5px] bg-white',
          !focused && hasValue && 'border-line-hairline border bg-white',
          !focused && !hasValue && 'bg-surface-muted',
          disabled && 'opacity-50',
        )}
      >
        <input
          id={inputId}
          disabled={disabled}
          value={value}
          defaultValue={defaultValue}
          className={cn(
            'placeholder:text-text-placeholder w-full bg-transparent text-[15px] font-medium outline-none',
            hasValue || focused ? 'text-ink-900' : 'text-text-placeholder',
            className,
          )}
          onChange={(event) => {
            if (!isControlled) {
              setUncontrolledValue(event.target.value);
            }
            onChange?.(event);
          }}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...restProps}
        />
      </span>
    </label>
  );
};
