'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { Avatar } from '@/shared/components/avatar';
import { Button } from '@/shared/components/button';
import { Chip } from '@/shared/components/chip';
import { Header } from '@/shared/components/header';
import { MobileShell } from '@/shared/components/mobile-shell';
import { getErrorMessage } from '@/shared/lib/api';
import { cn } from '@/shared/lib/cn';
import { addTripExpense } from '@/shared/session';

import { rememberActiveTrip, useTripView } from '../trip.hooks';

const EXPENSE_CATEGORIES = ['🍽️ 식사', '🚕 이동', '🏨 숙소'] as const;

type ExpenseRecordScreenProps = {
  tripId: string;
  initialView?: 'form' | 'list';
};

const parseAmount = (raw: string) => {
  const digits = raw.replace(/[^\d]/g, '');
  return digits ? Number(digits) : 0;
};

const expenseEmoji = (title: string) => {
  if (title.includes('식사')) {
    return '🍜';
  }
  if (title.includes('이동')) {
    return '🚕';
  }
  if (title.includes('숙소')) {
    return '🏨';
  }
  return '💳';
};

export const ExpenseRecordScreen = ({ tripId, initialView = 'form' }: ExpenseRecordScreenProps) => {
  const router = useRouter();
  const { trip, isLoading, isError, error } = useTripView(tripId);
  const [view, setView] = useState<'form' | 'list'>(initialView);
  const [amountInput, setAmountInput] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [category, setCategory] = useState<(typeof EXPENSE_CATEGORIES)[number] | null>(null);
  const amount = parseAmount(amountInput);

  useEffect(() => {
    if (trip) {
      rememberActiveTrip(trip.id);
    }
  }, [trip]);

  useEffect(() => {
    if (!isLoading && !trip) {
      router.replace('/home');
    }
  }, [isLoading, router, trip]);

  const canSubmit = Boolean(trip && amount > 0 && selectedMemberIds.length > 0 && category);

  const selectedNames = useMemo(() => {
    if (!trip) {
      return [];
    }
    return trip.members.filter((member) => selectedMemberIds.includes(member.id)).map((member) => member.name);
  }, [selectedMemberIds, trip]);

  const totalSpent = useMemo(() => trip?.expenses.reduce((acc, item) => acc + item.amount, 0) ?? 0, [trip]);

  if (isLoading) {
    return (
      <MobileShell className="bg-surface-gray">
        <div className="flex flex-1 items-center justify-center text-sm text-[rgba(55,56,60,0.61)]">
          지출 기록을 불러오는 중…
        </div>
      </MobileShell>
    );
  }

  if (!trip) {
    return (
      <MobileShell className="bg-surface-gray">
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-5 text-center">
          <p className="text-sm font-medium text-[#e08300]">
            {isError ? getErrorMessage(error) : '여행을 찾을 수 없어요.'}
          </p>
          <Button variant="outline" onClick={() => router.push('/home')}>
            홈으로
          </Button>
        </div>
      </MobileShell>
    );
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
    setAmountInput('');
    setSelectedMemberIds([]);
    setCategory(null);
    setView('list');
  };

  if (view === 'list') {
    return (
      <MobileShell className="bg-surface-gray">
        <div className="flex flex-1 flex-col gap-4 px-5 pt-3 pb-8">
          <Header title="지출 기록" onBack={() => router.push(`/trips/${tripId}`)} />
          <p className="text-text-secondary-soft text-sm font-bold">오늘 기록</p>
          <ul className="border-line-hairline overflow-hidden rounded-2xl border bg-white">
            {trip.expenses.length === 0 ? (
              <li className="text-text-secondary-soft px-3.5 py-4 text-sm font-medium">아직 지출 기록이 없어요</li>
            ) : (
              trip.expenses.map((expense, index) => (
                <li
                  key={expense.id}
                  className={cn(
                    'flex items-center gap-3 px-3.5 py-3',
                    index === 0 ? '' : 'border-line-hairline border-t',
                  )}
                >
                  <span className="text-xl">{expenseEmoji(expense.title)}</span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <p className="text-ink-900 text-sm font-bold">{expense.title}</p>
                    <p className="text-text-secondary-soft text-xs font-medium">{expense.payerName}</p>
                  </div>
                  <p className="text-ink-900 text-sm font-bold">{expense.amount.toLocaleString('ko-KR')}원</p>
                </li>
              ))
            )}
          </ul>
          <button
            type="button"
            className="flex h-[60px] items-center justify-between rounded-[14px] bg-[rgba(51,102,255,0.06)] px-3.5"
            onClick={() => setView('form')}
          >
            <span className="flex flex-col gap-0.5 text-left">
              <span className="text-ink-900 text-sm font-bold">지금까지 쓴 금액</span>
              <span className="text-text-secondary-soft text-xs font-medium">
                {totalSpent.toLocaleString('ko-KR')}원
              </span>
            </span>
            <span className="text-brand-blue text-sm font-bold">지출 기록하러 가기 →</span>
          </button>
        </div>
      </MobileShell>
    );
  }

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
