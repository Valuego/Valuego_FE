'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/shared/components/button';
import { Header } from '@/shared/components/header';
import { MobileShell } from '@/shared/components/mobile-shell';
import { TextField } from '@/shared/components/text-field';
import { addTripExpense, advanceTripPhase, useTripById } from '@/shared/session';

type SettlementBoardScreenProps = {
  tripId: string;
};

export const SettlementBoardScreen = ({ tripId }: SettlementBoardScreenProps) => {
  const router = useRouter();
  const trip = useTripById(tripId);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (!trip) {
      router.replace('/home');
    }
  }, [router, trip]);

  const total = useMemo(() => trip?.expenses.reduce((acc, item) => acc + item.amount, 0) ?? 0, [trip]);
  const perPerson = trip && trip.members.length > 0 ? Math.round(total / trip.members.length) : 0;

  if (!trip) {
    return null;
  }

  const handleAdd = () => {
    addTripExpense(tripId, {
      title,
      amount: Number(amount.replace(/,/g, '')),
      payerName: trip.members[0]?.name ?? '나',
    });
    setTitle('');
    setAmount('');
  };

  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col gap-4 px-5 pt-3 pb-40">
        <Header title="정산하기" onBack={() => router.push(`/trips/${tripId}`)} />

        <section className="border-line-hairline rounded-2xl border bg-white px-5 py-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-text-secondary-soft text-sm">총 지출</p>
              <p className="text-ink-900 text-xl font-bold">{total.toLocaleString('ko-KR')}원</p>
            </div>
            <div className="text-right">
              <p className="text-text-secondary-soft text-xs">1인당</p>
              <p className="text-ink-900 text-[15px] font-bold">{perPerson.toLocaleString('ko-KR')}원</p>
            </div>
          </div>
        </section>

        <ul className="flex flex-col gap-2.5">
          {trip.expenses.length === 0 ? (
            <li className="border-line-hairline rounded-2xl border bg-white px-4 py-5 text-center text-sm text-[rgba(55,56,60,0.45)]">
              아직 지출 기록이 없어요
            </li>
          ) : (
            trip.expenses.map((expense) => (
              <li
                key={expense.id}
                className="border-line-hairline flex items-center justify-between rounded-2xl border bg-white px-4 py-3.5"
              >
                <div>
                  <p className="text-ink-900 text-sm font-bold">{expense.title}</p>
                  <p className="text-text-secondary-soft text-xs font-medium">{expense.payerName} 결제</p>
                </div>
                <p className="text-ink-900 text-sm font-bold">{expense.amount.toLocaleString('ko-KR')}원</p>
              </li>
            ))
          )}
        </ul>

        <div className="flex flex-col gap-3">
          <TextField
            label="항목"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="예: 점심 식사"
          />
          <TextField
            label="금액"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="예: 48000"
            inputMode="numeric"
          />
        </div>
      </div>

      <div className="bg-surface-gray fixed right-0 bottom-0 left-0 mx-auto flex w-full max-w-[430px] flex-col gap-2 px-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <Button variant="primary" fullWidth onClick={handleAdd}>
          지출 추가
        </Button>
        {trip.phase !== 'settled' ? (
          <Button
            variant="outline"
            fullWidth
            onClick={() => {
              advanceTripPhase(tripId, 'settled');
              router.push('/my/settlements');
            }}
          >
            정산 완료 처리
          </Button>
        ) : null}
      </div>
    </MobileShell>
  );
};
