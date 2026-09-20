'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Avatar } from '@/shared/components/avatar';
import { Button } from '@/shared/components/button';
import { Chip } from '@/shared/components/chip';
import { Header } from '@/shared/components/header';
import { MobileShell } from '@/shared/components/mobile-shell';
import { getErrorMessage } from '@/shared/lib/api';
import { cn } from '@/shared/lib/cn';

import { EXPENSE_CATEGORY_OPTIONS, expenseCategoryEmoji, expenseCategoryLabel } from '../trip.constants';
import { useCreateExpense, useExpensesQuery, useTripView } from '../trip.hooks';
import { parseGroupId, toIsoDate } from '../trip.lib';

type ExpenseRecordScreenProps = {
  tripId: string;
  initialView?: 'form' | 'list';
};

const parseAmount = (raw: string) => {
  const digits = raw.replace(/[^\d]/g, '');
  return digits ? Number(digits) : 0;
};

export const ExpenseRecordScreen = ({ tripId, initialView = 'form' }: ExpenseRecordScreenProps) => {
  const router = useRouter();
  const groupId = parseGroupId(tripId) ?? 0;
  const { trip, isLoading, isError, error } = useTripView(tripId);
  const expensesQuery = useExpensesQuery(groupId);
  const createExpense = useCreateExpense(groupId);
  const [view, setView] = useState<'form' | 'list'>(initialView);
  const [amountInput, setAmountInput] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [category, setCategory] = useState<(typeof EXPENSE_CATEGORY_OPTIONS)[number] | null>(null);
  const amount = parseAmount(amountInput);

  const canSubmit = Boolean(
    groupId && amount > 0 && selectedMemberIds.length > 0 && category && !createExpense.isPending,
  );

  if (isLoading) {
    return (
      <MobileShell className="bg-surface-gray">
        <div className="flex flex-1 items-center justify-center text-sm text-[rgba(55,56,60,0.61)]">
          지출 기록을 불러오는 중…
        </div>
      </MobileShell>
    );
  }

  if (!trip || !groupId) {
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

  const handleSubmit = async () => {
    if (!canSubmit || !category) {
      return;
    }
    try {
      await createExpense.mutateAsync({
        groupId,
        amount,
        category: category.category,
        expenseDate: toIsoDate(new Date()),
        payers: [{ groupMemberId: Number(selectedMemberIds[0]) }],
        participants: selectedMemberIds.map((id) => ({ groupMemberId: Number(id), isIncluded: true })),
      });
      setAmountInput('');
      setSelectedMemberIds([]);
      setCategory(null);
      setView('list');
    } catch {
      // 에러 메시지는 아래 createExpense.isError 영역에서 그대로 보여준다.
    }
  };

  const expenses = expensesQuery.data?.expenseInfoResDtos ?? [];
  const totalSpent = expensesQuery.data?.totalAmount ?? 0;

  if (view === 'list') {
    return (
      <MobileShell className="bg-surface-gray">
        <div className="flex flex-1 flex-col gap-4 px-5 pt-3 pb-8">
          <Header title="지출 기록" onBack={() => router.push(`/trips/${tripId}`)} />
          <p className="text-text-secondary-soft text-sm font-bold">전체 기록</p>
          <ul className="border-line-hairline overflow-hidden rounded-2xl border bg-white">
            {expensesQuery.isPending ? (
              <li className="text-text-secondary-soft px-3.5 py-4 text-sm font-medium">불러오는 중…</li>
            ) : expenses.length === 0 ? (
              <li className="text-text-secondary-soft px-3.5 py-4 text-sm font-medium">아직 지출 기록이 없어요</li>
            ) : (
              expenses.map((expense, index) => (
                <li
                  key={expense.expenseId}
                  className={cn(
                    'flex items-center gap-3 px-3.5 py-3',
                    index === 0 ? '' : 'border-line-hairline border-t',
                  )}
                >
                  <span className="text-xl">{expenseCategoryEmoji(expense.category)}</span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <p className="text-ink-900 text-sm font-bold">{expenseCategoryLabel(expense.category)}</p>
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
          <div className="flex items-baseline justify-center gap-1">
            <input
              value={amount ? amount.toLocaleString('ko-KR') : ''}
              inputMode="numeric"
              aria-label="금액"
              placeholder="0"
              className="text-ink-900 placeholder:text-ink-900 w-full max-w-[220px] bg-transparent text-right text-[34px] font-extrabold tracking-[-0.5px] outline-none"
              onChange={(event) => setAmountInput(event.target.value)}
            />
            <span className="text-ink-900 text-[22px] font-extrabold">원</span>
          </div>
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
          <div className="flex flex-wrap gap-2">
            {EXPENSE_CATEGORY_OPTIONS.map((item) => (
              <Chip
                key={item.category}
                label={`${item.emoji} ${item.label}`}
                selected={category?.category === item.category}
                onClick={() => setCategory(item)}
              />
            ))}
          </div>
        </section>

        {createExpense.isError ? (
          <p className="text-sm font-medium text-[#e08300]">{getErrorMessage(createExpense.error)}</p>
        ) : null}
      </div>
      <div className="bg-surface-gray fixed right-0 bottom-0 left-0 mx-auto w-full max-w-[430px] px-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <Button variant="primary" fullWidth disabled={!canSubmit} onClick={() => void handleSubmit()}>
          {createExpense.isPending ? '기록하는 중…' : '지출 기록하기'}
        </Button>
      </div>
    </MobileShell>
  );
};
