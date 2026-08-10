'use client';

import type { ReactNode } from 'react';

import { useEffect } from 'react';

import { cn } from '@/shared/lib/cn';

type BottomSheetProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
};

export const BottomSheet = ({ open, onOpenChange, title, description, children, className }: BottomSheetProps) => {
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="닫기"
        className="absolute inset-0 bg-black/40"
        onClick={() => onOpenChange?.(false)}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="bottom-sheet-title"
        className={cn(
          'relative w-full max-w-[430px] rounded-t-3xl bg-white px-5 pt-3 pb-[calc(28px+env(safe-area-inset-bottom))]',
          'shadow-[0px_-8px_16px_rgba(23,23,25,0.18)]',
          className,
        )}
      >
        <div className="bg-handle-muted mx-auto h-1 w-10 rounded-full" aria-hidden />
        <h2 id="bottom-sheet-title" className="text-ink-900 mt-4 text-lg font-bold tracking-[-0.3px]">
          {title}
        </h2>
        {Boolean(description) && <p className="text-text-secondary-soft mt-2 text-sm font-medium">{description}</p>}
        {Boolean(children) && <div className="mt-4">{children}</div>}
      </section>
    </div>
  );
};
