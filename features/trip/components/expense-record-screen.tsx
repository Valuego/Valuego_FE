'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { Avatar } from '@/shared/components/avatar';
import { Button } from '@/shared/components/button';
import { Chip } from '@/shared/components/chip';
import { Header } from '@/shared/components/header';
import { MobileShell } from '@/shared/components/mobile-shell';
import { cn } from '@/shared/lib/cn';
import { addTripExpense, upsertLocalTrip } from '@/shared/session';

import { rememberActiveTrip, useTripView } from '../trip.hooks';

const EXPENSE_CATEGORIES = ['🍽️ 식사', '🚕 이동', '🏨 숙소'] as const;

type ExpenseRecordScreenProps = {
  tripId: string;
};

const parseAmount = (raw: string) => {
  const digits = raw.replace(/[^\d]/g, '');
  return digits ? Number(digits) : 0;
};

export const ExpenseRecordScreen = ({ tripId }: ExpenseRecordScreenProps) => {
  const router = useRouter();
  const { trip } = useTripView(tripId);
  const [amountInput, setAmountInput] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [category, setCategory] = useState<(typeof EXPENSE_CATEGORIES)[number] | null>(null);
  const amount = parseAmount(amountInput);

  useEffect(() => {
    if (trip) {
      rememberActiveTrip(trip.id);
      upsertLocalTrip(trip);
    }
  }, [trip]);

  useEffect(() => {
    if (!trip) {
      router.replace('/home');
    }
  }, [router, trip]);

  const canSubmit = Boolean(trip && amount > 0 && selectedMemberIds.length > 0 && category);

  const selectedNames = useMemo(() => {
    if (!trip) {
      return [];
    }
    return trip.members.filter((member) => selectedMemberIds.includes(member.id)).map((member) => member.name);
  }, [selectedMemberIds, trip]);

  if (!trip) {
    return null;
  }

  const toggleMember = (memberId: string) => {
    setSelectedMemberIds((current) =>
      current.includes(memberId) ? current.filter((id) => id !== memberId) : [...current, memberId],
    );
  };

  const handleSubmit = () => {
    if (!canSubmit || !category) {
      return;
    }
    addTripExpense(tripId, {
      title: category,
      amount,
      payerName: selectedNames[0] ?? trip.members[0]?.name ?? '나',
    });
    router.push(`/trips/${tripId}/settlement`);
  };

  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col gap-4 px-5 pt-3 pb-28">
        <Header title="지출 기록" onBack={() => router.push(`/trips/${tripId}`)} />

        <label className="border-line-hairline flex flex-col items-center gap-1 rounded-[18px] border bg-white py-[26px]">
          <span className="text-text-secondary-soft text-[13px] font-bold">얼마를 썼나요?</span>
          <input
            value={amountInput}
            inputMode="numeric"
            aria-label="금액"
            placeholder="0원"
            className="text-ink-900 placeholder:text-ink-900 w-full bg-transparent text-center text-[34px] font-extrabold tracking-[-0.5px] outline-none"
            onChange={(event) => setAmountInput(event.target.value)}
          />
        </label>

        <section className="border-line-hairline flex flex-col gap-3 rounded-2xl border bg-white p-[18px]">
          <p className="text-ink-900 text-[15px] font-bold tracking-[-0.2px]">누가 함께 썼나요?</p>
          <div className="flex gap-2.5">
            {trip.members.map((member) => {
              const selected = selectedMemberIds.includes(member.id);
              return (
                <button
                  key={member.id}
                  type="button"
                  aria-pressed={selected}
                  className={cn('rounded-full', selected ? 'opacity-100' : 'opacity-30')}
                  onClick={() => toggleMember(member.id)}
                >
                  <Avatar member={member.member} size="md" initial={member.name.slice(0, 1)} className="size-11" />
                </button>
              );
            })}
          </div>
        </section>

        <section className="border-line-hairline flex flex-col gap-3 rounded-2xl border bg-white p-[18px]">
          <p className="text-ink-900 text-[15px] font-bold tracking-[-0.2px]">분류</p>
          <div className="flex gap-2">
            {EXPENSE_CATEGORIES.map((item) => (
              <Chip key={item} label={item} selected={category === item} onClick={() => setCategory(item)} />
            ))}
          </div>
        </section>
      </div>
      <div className="bg-surface-gray fixed right-0 bottom-0 left-0 mx-auto w-full max-w-[430px] px-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <Button variant="primary" fullWidth disabled={!canSubmit} onClick={handleSubmit}>
          지출 기록하기
        </Button>
      </div>
    </MobileShell>
  );
};
