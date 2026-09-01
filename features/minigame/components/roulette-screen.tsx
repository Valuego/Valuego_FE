'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import RoulettePointerIcon from '@/shared/assets/icons/roulette-pointer.svg';
import { Button } from '@/shared/components/button';
import { Header } from '@/shared/components/header';
import { MobileShell } from '@/shared/components/mobile-shell';
import { recordGameResult, useActiveTrip, useTripById } from '@/shared/session';

import { MAX_PARTICIPANTS, MIN_PARTICIPANTS, MINIGAME_MEMBERS } from '../minigame.constants';
import { buildParticipants, ParticipantNameFields, resizeParticipantNames } from './participant-name-fields';
import { ParticipantStepper } from './participant-stepper';
import { getSpinDelta, RouletteWheel } from './roulette-wheel';

const SPIN_MS = 3200;

export const RouletteScreen = ({ tripId }: { tripId?: string }) => {
  const router = useRouter();
  const activeTrip = useActiveTrip();
  const tripFromId = useTripById(tripId ?? '');
  const trip = tripId ? tripFromId : activeTrip;
  const gamesHub = trip ? `/trips/${trip.id}/games` : '/games';

  const seedNames = useMemo(() => {
    if (trip && trip.members.length > 0) {
      return trip.members.map((member) => member.name);
    }
    return MINIGAME_MEMBERS.map((member) => member.name);
  }, [trip]);

  const defaultCount = Math.min(MAX_PARTICIPANTS, Math.max(MIN_PARTICIPANTS, seedNames.length || 4));
  const [count, setCount] = useState(defaultCount);
  const [names, setNames] = useState(() => seedNames.slice(0, defaultCount));
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [recorded, setRecorded] = useState(false);

  const participants = buildParticipants(count, names);

  const handleCountChange = (next: number) => {
    setCount(next);
    setNames((prev) => resizeParticipantNames(prev, next, seedNames));
    setWinnerIndex(null);
    setRecorded(false);
    setRotation(0);
  };

  const handleSpin = () => {
    if (spinning || participants.length === 0) {
      return;
    }

    const nextWinnerIndex = Math.floor(Math.random() * participants.length);
    const delta = getSpinDelta(rotation, nextWinnerIndex, participants.length);

    setWinnerIndex(null);
    setRecorded(false);
    setSpinning(true);
    setRotation(rotation + delta);

    window.setTimeout(() => {
      setWinnerIndex(nextWinnerIndex);
      setSpinning(false);

      const winner = participants[nextWinnerIndex];
      if (trip && winner) {
        recordGameResult(trip.id, {
          game: 'roulette',
          winnerKey: winner.key,
          winnerName: winner.name,
          label: `벌칙 룰렛 · ${winner.name}`,
        });
        setRecorded(true);
      }
    }, SPIN_MS);
  };

  const winner = winnerIndex !== null ? participants[winnerIndex] : null;
  const showResult = Boolean(winner) && !spinning;

  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col px-5 pt-3 pb-5">
        <Header title="벌칙 룰렛" />

        {!showResult ? (
          <>
            <ParticipantStepper
              count={count}
              min={MIN_PARTICIPANTS}
              max={MAX_PARTICIPANTS}
              onChange={handleCountChange}
              className="mt-3"
            />
            <ParticipantNameFields
              names={names}
              onChangeName={(index, value) => {
                setNames((prev) => prev.map((item, i) => (i === index ? value : item)));
                setWinnerIndex(null);
                setRecorded(false);
              }}
              className="mt-3"
            />
          </>
        ) : null}

        <div className="relative mx-auto mt-6 flex h-[300px] w-full max-w-[402px] items-center justify-center">
          <div className="absolute top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-1">
            <RoulettePointerIcon className="h-[22px] w-[26px] rotate-180" aria-hidden />
          </div>

          <RouletteWheel participants={participants} rotation={rotation} spinning={spinning} spinMs={SPIN_MS} />

          <div className="pointer-events-none absolute top-1/2 left-1/2 z-10 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_1px_6px_rgba(23,23,25,0.12)]">
            <span className="text-2xl" aria-hidden>
              🎯
            </span>
          </div>
        </div>

        {showResult && winner ? (
          <div className="mt-2 flex flex-col items-center gap-1 rounded-[18px] bg-gradient-to-r from-[#ff9200] to-[#ff6b42] py-[18px]">
            <p className="text-[13px] font-bold text-white/90">오늘의 당첨자</p>
            <p className="text-[26px] font-extrabold tracking-[-0.5px] text-white">{winner.name} 🎉</p>
            {recorded ? <p className="mt-1 text-[11px] font-medium text-white/80">타임라인에 기록됐어요</p> : null}
          </div>
        ) : null}

        <div className="mt-auto flex flex-col gap-2.5 pt-6">
          <Button variant="primary" fullWidth disabled={spinning} onClick={handleSpin}>
            {showResult ? '다시 돌리기' : '돌리기'}
          </Button>
          {showResult ? (
            <Button variant="outline" fullWidth onClick={() => router.push(gamesHub)}>
              미니게임 허브로
            </Button>
          ) : null}
        </div>
      </div>
    </MobileShell>
  );
};
