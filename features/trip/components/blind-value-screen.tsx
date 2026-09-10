'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/shared/components/button';
import { Slider } from '@/shared/components/slider';
import { saveLaborValue } from '@/shared/session';

import { rememberActiveTrip, useTripView } from '../trip.hooks';

type BlindValueScreenProps = {
  tripId: string;
};

const MAX_AMOUNT = 30000;

export const BlindValueScreen = ({ tripId }: BlindValueScreenProps) => {
  const router = useRouter();
  const { trip, isLoading } = useTripView(tripId);
  const [index, setIndex] = useState(0);
  const [draftAmount, setDraftAmount] = useState<number | null>(null);
  const [draftNote, setDraftNote] = useState<string | null>(null);

  const cards = useMemo(() => {
    if (!trip) {
      return [];
    }
    return trip.laborCategories
      .map((category) => {
        const member = trip.members.find((item) => item.id === category.assigneeId);
        if (!member) {
          return null;
        }
        return { category, member };
      })
      .filter(
        (item): item is { category: (typeof trip.laborCategories)[number]; member: (typeof trip.members)[number] } =>
          Boolean(item),
      );
  }, [trip]);

  const current = cards[index];
  const submittedCount = trip?.laborValues.length ?? 0;
  const saved = current && trip ? trip.laborValues.find((item) => item.memberId === current.member.id) : undefined;
  const amount = draftAmount ?? saved?.amount ?? 15000;
  const note = draftNote ?? saved?.note ?? '덕분에 편하게 다녔어 🙏 다음엔 내가 할게!';

  useEffect(() => {
    rememberActiveTrip(tripId);
  }, [tripId]);

  useEffect(() => {
    if (!isLoading && !trip) {
      router.replace('/home');
    }
  }, [isLoading, router, trip]);

  const moveTo = (nextIndex: number) => {
    setIndex(nextIndex);
    setDraftAmount(null);
    setDraftNote(null);
  };

  if (isLoading || !trip) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#191627] text-sm text-[#c9bcff]">
        수고 가치를 불러오는 중…
      </div>
    );
  }

  const handleSubmit = () => {
    if (current) {
      saveLaborValue(tripId, current.member.id, amount, note);
    }
    if (index < cards.length - 1) {
      moveTo(index + 1);
      return;
    }
    router.push(`/trips/${tripId}/settlement/status`);
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-[#191627] px-5 pt-3 pb-[calc(24px+env(safe-area-inset-bottom))]">
      <header className="flex h-11 items-center gap-2">
        <button
          type="button"
          aria-label="뒤로가기"
          className="flex size-6 items-center justify-center text-white"
          onClick={() => router.push(`/trips/${tripId}/settlement/labor`)}
        >
          ‹
        </button>
        <h1 className="flex-1 text-[22px] font-bold tracking-[-0.5px] text-white">수고 가치 측정</h1>
        <span className="rounded-full bg-[rgba(101,65,242,0.35)] px-2.5 py-1 text-[11px] font-bold text-white">
          🔒 비공개
        </span>
      </header>

      <div className="flex flex-1 flex-col items-center gap-5 pt-8">
        <span className="rounded-full bg-[rgba(101,65,242,0.15)] px-3 py-2 text-xs font-medium text-[#c9bcff]">
          {submittedCount}/{Math.max(cards.length, 1)} 완료
        </span>

        {current ? (
          <>
            <div className="flex w-full items-center justify-between">
              <button
                type="button"
                aria-label="이전"
                className="flex size-11 items-center justify-center rounded-full bg-white/5 text-white"
                disabled={index === 0}
                onClick={() => moveTo(Math.max(0, index - 1))}
              >
                ‹
              </button>
              <div className="flex flex-col items-center gap-2.5">
                <div
                  className={`flex size-14 items-center justify-center rounded-full text-xl font-bold text-white ${
                    current.member.member === 'doyeon'
                      ? 'bg-member-doyeon'
                      : current.member.member === 'seojun'
                        ? 'bg-member-seojun'
                        : current.member.member === 'hayeong'
                          ? 'bg-member-hayeong'
                          : 'bg-member-minjae'
                  }`}
                >
                  {current.member.name.slice(0, 1)}
                </div>
                <p className="text-lg font-bold tracking-[-0.3px] text-white">
                  {current.member.name}님의 {current.category.title}
                </p>
                <p className="text-[13px] font-medium text-[#c9bcff]">여행 중 보이지 않은 수고를 인정해요.</p>
              </div>
              <button
                type="button"
                aria-label="다음"
                className="flex size-11 items-center justify-center rounded-full bg-white/5 text-white"
                disabled={index >= cards.length - 1}
                onClick={() => moveTo(Math.min(cards.length - 1, index + 1))}
              >
                ›
              </button>
            </div>

            <p className="text-[38px] font-extrabold tracking-[-1px] text-white">{amount.toLocaleString('ko-KR')}원</p>
            <div className="w-full max-w-[355px]">
              <Slider value={amount} min={0} max={MAX_AMOUNT} step={1000} onValueChange={setDraftAmount} />
              <div className="mt-2 flex justify-between text-xs text-[#f2f2f7]">
                <span>0원</span>
                <span>{MAX_AMOUNT.toLocaleString('ko-KR')}원</span>
              </div>
            </div>
            <p className="text-sm font-medium text-[#c9bcff]">추천 구간: 12,000 ~ 20,000원</p>
            <label className="flex w-full flex-col gap-2 rounded-[14px] bg-white/6 p-3.5">
              <span className="text-sm font-bold text-[#c9bcff]">고마운 한마디 (선택)</span>
              <textarea
                value={note}
                rows={2}
                className="resize-none bg-transparent text-sm leading-[1.5] font-medium text-white outline-none"
                onChange={(event) => setDraftNote(event.target.value)}
              />
            </label>
            <p className="text-xs font-medium text-white/40">제출하면 수정할 수 없어요 · 블라인드 집계</p>
          </>
        ) : (
          <p className="text-sm font-medium text-[#c9bcff]">먼저 수고 기록에서 친구를 골라 주세요.</p>
        )}
      </div>

      <div className="mt-auto flex gap-2.5 pt-6">
        <Button
          variant="outline"
          className="h-[52px] flex-1 px-3 text-[15px]"
          onClick={() => router.push(`/trips/${tripId}/settlement/status`)}
        >
          정산 진행상태 확인
        </Button>
        <Button variant="primary" className="bg-brand-purple h-[52px] flex-1 px-3 text-[15px]" onClick={handleSubmit}>
          비공개로 제출하기
        </Button>
      </div>
    </div>
  );
};
