'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { DESTINATIONS } from '@/features/home/home.constants';
import CalendarIcon from '@/shared/assets/icons/calendar.svg';
import { BottomSheet } from '@/shared/components/bottom-sheet';
import { Button } from '@/shared/components/button';
import { Chip } from '@/shared/components/chip';
import { DatePicker } from '@/shared/components/date-picker';
import { Header } from '@/shared/components/header';
import { MobileShell } from '@/shared/components/mobile-shell';
import { ProgressBar } from '@/shared/components/progress-bar';
import { cn } from '@/shared/lib/cn';
import { startTripDraft, useTripDraft } from '@/shared/session';
import type { Transport } from '@/shared/session';

import { formatDateRangeLabel, formatNightsLabel, getDefaultTripDates, parseIsoDate, toIsoDate } from '../trip.lib';

export const CreateGroupScreen = () => {
  const router = useRouter();
  const draft = useTripDraft();
  const defaultDates = useMemo(() => getDefaultTripDates(), []);
  const [destination, setDestination] = useState<(typeof DESTINATIONS)[number]>(
    (draft?.destination as (typeof DESTINATIONS)[number]) ?? '부산',
  );
  const [memberCount, setMemberCount] = useState(draft?.memberCount ?? 4);
  const [transport, setTransport] = useState<Transport>(draft?.transport ?? 'car');
  const [dateOpen, setDateOpen] = useState(false);
  const [range, setRange] = useState<{ start: Date | null; end: Date | null }>(() => {
    if (draft?.startDate && draft?.endDate) {
      return { start: parseIsoDate(draft.startDate), end: parseIsoDate(draft.endDate) };
    }
    return { start: parseIsoDate(defaultDates.startDate), end: parseIsoDate(defaultDates.endDate) };
  });

  const start = range.start;
  const end = range.end;
  const hasCompleteRange = Boolean(start && end);
  const nightsLabel = start && end ? formatNightsLabel(start, end) : '기간을 선택하세요';
  const dateLabel = start && end ? formatDateRangeLabel(start, end) : '날짜를 선택해 주세요';
  const canSubmit = memberCount >= 2 && memberCount <= 8 && hasCompleteRange;

  const handleSubmit = () => {
    if (!start || !end) {
      return;
    }
    startTripDraft({
      destination,
      memberCount,
      transport,
      dateLabel,
      nightsLabel,
      startDate: toIsoDate(start),
      endDate: toIsoDate(end),
    });
    router.push('/trips/new/style');
  };

  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col gap-4 px-5 pt-3 pb-28">
        <Header title="그룹 만들기" />
        <div className="flex items-center gap-2.5">
          <ProgressBar value={33} className="flex-1" />
          <span className="text-text-placeholder text-[12.5px] font-bold">1/3</span>
        </div>

        <section className="border-line-hairline flex flex-col gap-3.5 rounded-2xl border bg-white p-[18px]">
          <h2 className="text-ink-900 text-base font-bold tracking-[-0.2px]">어디로 떠나요?</h2>
          <div className="flex flex-wrap gap-2">
            {DESTINATIONS.map((city) => (
              <Chip
                key={city}
                label={city}
                selected={destination === city}
                onClick={() => setDestination(city)}
                className="min-w-[103px] flex-1"
              />
            ))}
          </div>
        </section>

        <section className="border-line-hairline flex flex-col gap-3.5 rounded-2xl border bg-white p-[18px]">
          <h2 className="text-ink-900 text-base font-bold tracking-[-0.2px]">언제 가나요?</h2>
          <button
            type="button"
            className="bg-surface-gray flex w-full items-center justify-between rounded-[10px] px-3.5 py-3"
            onClick={() => setDateOpen(true)}
          >
            <span className="text-ink-900 flex items-center gap-2 text-sm font-semibold">
              <CalendarIcon className="size-5" aria-hidden />
              {dateLabel}
            </span>
            <span className="text-brand-blue text-xs font-medium">{nightsLabel}</span>
          </button>
        </section>

        <section className="border-line-hairline rounded-2xl border bg-white p-[18px]">
          <div className="flex items-center justify-between">
            <h2 className="text-ink-900 text-base font-bold tracking-[-0.2px]">인원</h2>
            <div className="bg-surface-gray flex items-center gap-4 rounded-[10px] px-1.5 py-1">
              <button
                type="button"
                aria-label="인원 감소"
                className="text-text-secondary-soft px-1 text-lg font-bold"
                onClick={() => setMemberCount((prev) => Math.max(2, prev - 1))}
              >
                −
              </button>
              <span className="text-ink-900 min-w-3 text-center text-base font-bold">{memberCount}</span>
              <button
                type="button"
                aria-label="인원 증가"
                className="text-text-secondary-soft px-1 text-lg font-bold"
                onClick={() => setMemberCount((prev) => Math.min(8, prev + 1))}
              >
                +
              </button>
            </div>
          </div>
        </section>

        <section className="border-line-hairline flex flex-col gap-3.5 rounded-2xl border bg-white p-[18px]">
          <h2 className="text-ink-900 text-base font-bold tracking-[-0.2px]">이동 수단</h2>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => setTransport('car')}
              className={cn(
                'flex flex-1 flex-col items-center gap-1.5 rounded-[13px] border py-4',
                transport === 'car'
                  ? 'border-brand-blue bg-brand-blue/6 text-brand-blue border-[1.5px]'
                  : 'border-line-hairline bg-surface-gray text-ink-900',
              )}
            >
              <span className="text-[22px]">🚗</span>
              <span className="text-[13.5px] font-semibold">자가용·렌터카</span>
            </button>
            <button
              type="button"
              onClick={() => setTransport('transit')}
              className={cn(
                'flex flex-1 flex-col items-center gap-1.5 rounded-[13px] border py-4',
                transport === 'transit'
                  ? 'border-brand-blue bg-brand-blue/6 text-brand-blue border-[1.5px]'
                  : 'border-line-hairline bg-surface-gray text-ink-900',
              )}
            >
              <span className="text-[22px]">🚆</span>
              <span className="text-[13.5px] font-semibold">대중교통</span>
            </button>
          </div>
        </section>
      </div>

      <div className="bg-surface-gray fixed right-0 bottom-0 left-0 mx-auto w-full max-w-[430px] px-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <Button variant="primary" fullWidth disabled={!canSubmit} onClick={handleSubmit}>
          다음
        </Button>
      </div>

      <BottomSheet
        open={dateOpen}
        title="여행 기간"
        className="max-h-[90dvh] overflow-y-auto"
        onOpenChange={setDateOpen}
      >
        <DatePicker
          mode="period"
          rangeValue={range}
          onRangeSelect={setRange}
          onCancel={() => setDateOpen(false)}
          onConfirm={() => {
            if (range.start && range.end) {
              setDateOpen(false);
            }
          }}
        />
      </BottomSheet>
    </MobileShell>
  );
};
