'use client';

import { useMemo, useState } from 'react';

import ChevronDownIcon from '@/shared/assets/icons/chevron-down.svg';
import ChevronLeftIcon from '@/shared/assets/icons/chevron-left.svg';
import CloseIcon from '@/shared/assets/icons/close.svg';
import { Button } from '@/shared/components/button';
import { cn } from '@/shared/lib/cn';

import { WEEKDAYS, buildCalendarCells, formatDateDot, isSameDay, isWithinRange, startOfDay } from './date-picker.lib';

type DatePickerMode = 'day' | 'period';

type DatePickerProps = {
  mode?: DatePickerMode;
  value?: Date | null;
  rangeValue?: { start: Date | null; end: Date | null };
  onSelect?: (date: Date | null) => void;
  onRangeSelect?: (range: { start: Date | null; end: Date | null }) => void;
  onCancel?: () => void;
  onConfirm?: () => void;
  className?: string;
};

export const DatePicker = ({
  mode = 'day',
  value = null,
  rangeValue,
  onSelect,
  onRangeSelect,
  onCancel,
  onConfirm,
  className,
}: DatePickerProps) => {
  const today = startOfDay(new Date());
  const initial = value ?? rangeValue?.start ?? today;
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const [selected, setSelected] = useState<Date | null>(value);
  const [range, setRange] = useState<{ start: Date | null; end: Date | null }>(
    rangeValue ?? { start: null, end: null },
  );

  const cells = useMemo(() => buildCalendarCells(viewYear, viewMonth), [viewYear, viewMonth]);

  const moveMonth = (delta: number) => {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const handleDayClick = (date: Date) => {
    const nextDate = startOfDay(date);

    if (mode === 'day') {
      setSelected(nextDate);
      onSelect?.(nextDate);
      return;
    }

    if (!range.start || (range.start && range.end)) {
      const nextRange = { start: nextDate, end: null };
      setRange(nextRange);
      onRangeSelect?.(nextRange);
      return;
    }

    if (nextDate.getTime() < range.start.getTime()) {
      const nextRange = { start: nextDate, end: range.start };
      setRange(nextRange);
      onRangeSelect?.(nextRange);
      return;
    }

    const nextRange = { start: range.start, end: nextDate };
    setRange(nextRange);
    onRangeSelect?.(nextRange);
  };

  const handleToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    if (mode === 'day') {
      setSelected(today);
      onSelect?.(today);
      return;
    }
    const nextRange = { start: today, end: null };
    setRange(nextRange);
    onRangeSelect?.(nextRange);
  };

  const clearStart = () => {
    const nextRange = { start: null, end: range.end };
    setRange(nextRange);
    onRangeSelect?.(nextRange);
  };

  const clearEnd = () => {
    const nextRange = { start: range.start, end: null };
    setRange(nextRange);
    onRangeSelect?.(nextRange);
  };

  return (
    <div
      className={cn(
        'border-calendar-border bg-calendar-surface w-full overflow-hidden rounded-xl border pt-4',
        className,
      )}
    >
      <div className="flex items-center gap-4 px-6 py-2">
        <button
          type="button"
          aria-label="이전 달"
          onClick={() => moveMonth(-1)}
          className="border-border-gray-light flex size-8 cursor-pointer items-center justify-center rounded-full border-[0.8px] bg-transparent"
        >
          <ChevronLeftIcon className="h-4 w-[9.6px] -rotate-90 text-gray-800" aria-hidden />
        </button>

        <div className="flex flex-1 items-center justify-center">
          <button
            type="button"
            className="text-text-basic flex h-10 items-center gap-1 px-2 text-xl font-bold tracking-[-0.5px]"
          >
            {viewYear}년
            <ChevronDownIcon className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            className="text-text-basic flex h-10 items-center gap-1 px-2 text-xl font-bold tracking-[-0.5px]"
          >
            {viewMonth + 1}월
            <ChevronDownIcon className="size-4" aria-hidden />
          </button>
        </div>

        <button
          type="button"
          aria-label="다음 달"
          onClick={() => moveMonth(1)}
          className="border-border-gray-light flex size-8 cursor-pointer items-center justify-center rounded-full border-[0.8px] bg-transparent"
        >
          <ChevronLeftIcon className="h-4 w-[9.6px] rotate-90 text-gray-800" aria-hidden />
        </button>
      </div>

      <div className="grid grid-cols-7 px-3 pt-2">
        {WEEKDAYS.map((weekday) => (
          <div key={weekday} className="text-text-subtle flex h-10 items-center justify-center text-[13px] font-medium">
            {weekday}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 px-3 pb-2">
        {cells.map((cell) => {
          const isToday = isSameDay(cell.date, today);
          const isSelectedDay = mode === 'day' && isSameDay(cell.date, selected);
          const isRangeStart = mode === 'period' && isSameDay(cell.date, range.start);
          const isRangeEnd = mode === 'period' && isSameDay(cell.date, range.end);
          const inRange = mode === 'period' && isWithinRange(cell.date, range.start, range.end);
          const isEdge = isRangeStart || isRangeEnd;

          return (
            <button
              key={cell.key}
              type="button"
              onClick={() => handleDayClick(cell.date)}
              className={cn(
                'relative flex h-11 items-center justify-center',
                inRange && 'bg-white',
                isRangeStart && range.end && 'rounded-l-full bg-white',
                isRangeEnd && range.start && 'rounded-r-full bg-white',
              )}
            >
              <span
                className={cn(
                  'relative z-10 flex size-11 items-center justify-center rounded-full text-[17px] leading-[1.5]',
                  !cell.inCurrentMonth && 'text-text-disabled',
                  cell.inCurrentMonth && !isEdge && !isSelectedDay && 'text-text-basic opacity-80',
                  (isSelectedDay || isEdge) && 'bg-calendar-selected text-white opacity-100',
                )}
              >
                {cell.date.getDate()}
                {Boolean(isToday) && (
                  <span className="bg-calendar-today absolute bottom-1.5 left-1/2 size-1 -translate-x-1/2 rounded-full" />
                )}
              </span>
            </button>
          );
        })}
      </div>

      {mode === 'period' && (
        <div className="grid grid-cols-2 gap-3 px-5 pb-4">
          <DateInputField label="시작일" value={formatDateDot(range.start)} onClear={clearStart} />
          <DateInputField label="종료일" value={formatDateDot(range.end)} onClear={clearEnd} />
        </div>
      )}

      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-5 py-4">
        <button
          type="button"
          onClick={handleToday}
          className="border-line-hairline text-ink-900 cursor-pointer rounded-lg border px-3 py-2 text-sm font-semibold"
        >
          오늘
        </button>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-10 px-4 text-sm" onClick={onCancel}>
            취소
          </Button>
          <Button variant="primary" className="h-10 px-4 text-sm" onClick={onConfirm}>
            선택
          </Button>
        </div>
      </div>
    </div>
  );
};

type DateInputFieldProps = {
  label: string;
  value: string;
  onClear: () => void;
};

const DateInputField = ({ label, value, onClear }: DateInputFieldProps) => {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-text-secondary-soft text-xs font-semibold">{label}</span>
      <span className="border-line-hairline flex h-11 items-center justify-between rounded-xl border bg-white px-3">
        <span className={cn('text-sm font-medium', value ? 'text-ink-900' : 'text-text-placeholder')}>
          {value || '날짜 선택'}
        </span>
        {Boolean(value) && (
          <button type="button" aria-label={`${label} 지우기`} onClick={onClear} className="cursor-pointer">
            <CloseIcon className="size-4" aria-hidden />
          </button>
        )}
      </span>
    </label>
  );
};
