'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import RoulettePointerIcon from '@/shared/assets/icons/roulette-pointer.svg';
import { Avatar } from '@/shared/components/avatar';
import { Button } from '@/shared/components/button';
import { Header } from '@/shared/components/header';
import { MobileShell } from '@/shared/components/mobile-shell';
import { cn } from '@/shared/lib/cn';
import { recordGameResult, useActiveTrip } from '@/shared/session';

import {
  MAX_PARTICIPANTS,
  MIN_PARTICIPANTS,
  MINIGAME_MEMBERS,
  ROULETTE_SEGMENT_ORDER,
  type MemberKey,
} from '../minigame.constants';
import { ParticipantStepper } from './participant-stepper';

const SEGMENT_MID_DEG: Record<MemberKey, number> = {
  minjae: 45,
  doyeon: 135,
  seojun: 225,
  hayeong: 315,
};

const LABEL_STYLE: Record<MemberKey, string> = {
  hayeong: 'left-[22%] top-[25%]',
  minjae: 'left-[70%] top-[25%]',
  seojun: 'left-[22%] top-[70%]',
  doyeon: 'left-[70%] top-[70%]',
};

const SPIN_MS = 3200;

export const RouletteScreen = () => {
  const router = useRouter();
  const activeTrip = useActiveTrip();
  const tripMembers = useMemo(() => {
    if (!activeTrip || activeTrip.members.length === 0) {
      return MINIGAME_MEMBERS;
    }
    return activeTrip.members.map((member) => ({
      key: member.member,
      name: member.name,
      initial: member.name.slice(0, 1),
      colorClass: `bg-member-${member.member}`,
      colorHex: '',
    }));
  }, [activeTrip]);

  const defaultCount = Math.min(MAX_PARTICIPANTS, Math.max(MIN_PARTICIPANTS, tripMembers.length));
  const [count, setCount] = useState(defaultCount);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winnerKey, setWinnerKey] = useState<MemberKey | null>(null);
  const [recorded, setRecorded] = useState(false);

  const participants = tripMembers.slice(0, count);
  const segmentKeys = ROULETTE_SEGMENT_ORDER.filter((key) => participants.some((p) => p.key === key));

  const handleSpin = () => {
    if (spinning || segmentKeys.length === 0) {
      return;
    }

    // eslint-disable-next-line react-hooks/purity -- event handler pick
    const nextWinner = segmentKeys[Math.floor(Math.random() * segmentKeys.length)] ?? segmentKeys[0];
    const targetMid = SEGMENT_MID_DEG[nextWinner];
    const base = rotation % 360;
    const deltaToTarget = ((360 - targetMid - base) % 360) + 360 * 4;

    setWinnerKey(null);
    setRecorded(false);
    setSpinning(true);
    setRotation(rotation + deltaToTarget);

    window.setTimeout(() => {
      setWinnerKey(nextWinner);
      setSpinning(false);

      const winner =
        participants.find((m) => m.key === nextWinner) ?? MINIGAME_MEMBERS.find((m) => m.key === nextWinner);
      if (activeTrip && winner) {
        recordGameResult(activeTrip.id, {
          game: 'roulette',
          winnerKey: nextWinner,
          winnerName: winner.name,
          label: `벌칙 룰렛 · ${winner.name}`,
        });
        setRecorded(true);
      }
    }, SPIN_MS);
  };

  const winner = winnerKey ? participants.find((m) => m.key === winnerKey) : null;
  const showResult = Boolean(winner) && !spinning;

  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col px-5 pt-3 pb-5">
        <Header title="벌칙 룰렛" />

        {!showResult ? (
          <ParticipantStepper
            count={count}
            min={MIN_PARTICIPANTS}
            max={Math.min(MAX_PARTICIPANTS, tripMembers.length)}
            onChange={(next) => {
              setCount(next);
              setWinnerKey(null);
              setRecorded(false);
            }}
            className="mt-3"
          />
        ) : null}

        <div className="relative mx-auto mt-6 flex h-[300px] w-full max-w-[402px] items-center justify-center">
          <div className="absolute top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-1">
            <RoulettePointerIcon className="h-[22px] w-[26px] rotate-180" aria-hidden />
          </div>

          <div
            className="relative size-[264px] transition-transform ease-out"
            style={{
              transform: `rotate(${rotation}deg)`,
              transitionDuration: spinning ? `${SPIN_MS}ms` : '0ms',
            }}
          >
            <Image
              src="/minigame/roulette-wheel.png"
              alt=""
              width={264}
              height={264}
              className="size-[264px]"
              priority
            />
            {ROULETTE_SEGMENT_ORDER.map((key) => {
              const member = participants.find((m) => m.key === key);
              if (!member) {
                return null;
              }

              return (
                <span
                  key={key}
                  className={cn(
                    'pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-[13.5px] font-bold text-white',
                    LABEL_STYLE[key],
                  )}
                >
                  {member.name}
                </span>
              );
            })}
          </div>

          <div className="pointer-events-none absolute top-1/2 left-1/2 z-10 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white">
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
        ) : (
          <ul className="mt-2 flex flex-wrap gap-2.5">
            {participants.map((member) => (
              <li
                key={member.key}
                className="flex h-[54px] w-[calc(50%-5px)] items-center gap-2.5 rounded-[14px] bg-white p-3"
              >
                <Avatar member={member.key} size="sm" className="size-[30px] text-xs" />
                <span className="text-text-body text-[13.5px] font-bold">{member.name}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex flex-col gap-2.5 pt-6">
          <Button variant="primary" fullWidth disabled={spinning} onClick={handleSpin}>
            {showResult ? '다시 돌리기' : '돌리기'}
          </Button>
          {showResult ? (
            <Button variant="outline" fullWidth onClick={() => router.push('/games')}>
              미니게임 허브로
            </Button>
          ) : null}
        </div>
      </div>
    </MobileShell>
  );
};
