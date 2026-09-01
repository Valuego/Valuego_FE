'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { Avatar } from '@/shared/components/avatar';
import { Button } from '@/shared/components/button';
import { Header } from '@/shared/components/header';
import { MobileShell } from '@/shared/components/mobile-shell';
import { cn } from '@/shared/lib/cn';
import { recordGameResult, useActiveTrip } from '@/shared/session';

import {
  LADDER_RUNGS,
  MAX_PARTICIPANTS,
  MIN_PARTICIPANTS,
  MINIGAME_MEMBERS,
  type MemberKey,
  type MinigameMember,
} from '../minigame.constants';
import { ParticipantStepper } from './participant-stepper';

const columnPct = (index: number, count: number) => {
  if (count <= 1) {
    return 50;
  }
  return 11.6 + ((86.2 - 11.6) * index) / (count - 1);
};

const avatarPct = (index: number, count: number) => columnPct(index, count) - 4.6;
const resultPct = (index: number, count: number) => columnPct(index, count) - 6.6;

const traceLadder = (startCol: number, colCount: number, rungs: readonly { fromCol: number; y: number }[]) => {
  let col = startCol;
  const sorted = [...rungs].filter((r) => r.fromCol < colCount - 1).sort((a, b) => a.y - b.y);
  const pathVerticals: { col: number; y0: number; y1: number }[] = [];
  const pathHorizontals: { fromCol: number; y: number }[] = [];
  let yCursor = 0;

  for (const rung of sorted) {
    if (rung.fromCol === col || rung.fromCol + 1 === col) {
      pathVerticals.push({ col, y0: yCursor, y1: rung.y });
      pathHorizontals.push(rung);
      col = rung.fromCol === col ? rung.fromCol + 1 : rung.fromCol;
      yCursor = rung.y;
    }
  }

  pathVerticals.push({ col, y0: yCursor, y1: 1 });

  return { endCol: col, pathVerticals, pathHorizontals };
};

type LadderBoardProps = {
  members: MinigameMember[];
  bangCol: number;
  path: ReturnType<typeof traceLadder> | null;
};

const LadderBoard = ({ members, bangCol, path }: LadderBoardProps) => {
  const colCount = members.length;
  const rungs = LADDER_RUNGS.filter((r) => r.fromCol < colCount - 1);

  return (
    <div className="border-line-hairline relative h-[340px] w-full overflow-hidden rounded-[18px] border bg-white">
      {members.map((member, index) => (
        <div key={member.key} className="absolute top-3.5" style={{ left: `${avatarPct(index, colCount)}%` }}>
          <Avatar member={member.key} size="sm" className="size-[33px] text-[9px]" />
        </div>
      ))}

      <div className="absolute top-[59px] right-0 left-0 h-[220px]">
        {Array.from({ length: colCount }, (_, col) => (
          <div
            key={`v-base-${members[col]?.key ?? col}`}
            className="absolute top-0 h-full w-1 rounded-sm bg-[rgba(255,146,0,0.35)]"
            style={{ left: `${columnPct(col, colCount)}%` }}
          />
        ))}

        {rungs.map((rung) => {
          const left = columnPct(rung.fromCol, colCount);
          const right = columnPct(rung.fromCol + 1, colCount);
          return (
            <div
              key={`h-base-${rung.fromCol}-${rung.y}`}
              className="absolute h-[5px] rounded-sm bg-[rgba(255,146,0,0.35)]"
              style={{
                left: `calc(${left}% + 2px)`,
                width: `calc(${right - left}% - 2px)`,
                top: `${rung.y * 100}%`,
              }}
            />
          );
        })}

        {path?.pathVerticals.map((seg) => (
          <div
            key={`v-path-${members[seg.col]?.key ?? seg.col}-${seg.y0}-${seg.y1}`}
            className="absolute w-1 rounded-sm bg-[#ff9200]"
            style={{
              left: `${columnPct(seg.col, colCount)}%`,
              top: `${seg.y0 * 100}%`,
              height: `${(seg.y1 - seg.y0) * 100}%`,
            }}
          />
        ))}

        {path?.pathHorizontals.map((rung) => {
          const left = columnPct(rung.fromCol, colCount);
          const right = columnPct(rung.fromCol + 1, colCount);
          return (
            <div
              key={`h-path-${rung.fromCol}-${rung.y}`}
              className="absolute h-[5px] rounded-sm bg-[#ff9200]"
              style={{
                left: `calc(${left}% + 2px)`,
                width: `calc(${right - left}% - 2px)`,
                top: `${rung.y * 100}%`,
              }}
            />
          );
        })}
      </div>

      {members.map((member, index) => {
        const isBang = index === bangCol;
        return (
          <div
            key={`result-${member.key}`}
            className={cn(
              'absolute top-[295px] rounded-full px-2 py-[5px]',
              isBang ? 'bg-[rgba(255,146,0,0.15)]' : 'bg-[rgba(112,115,132,0.08)]',
            )}
            style={{ left: `${resultPct(index, colCount)}%` }}
          >
            <p
              className={cn(
                'text-[10.5px] font-bold whitespace-nowrap',
                isBang ? 'text-[#e08300]' : 'text-text-secondary-soft',
              )}
            >
              {isBang ? '💥 꽝' : '☁️ 통과'}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export const LadderScreen = () => {
  const router = useRouter();
  const activeTrip = useActiveTrip();
  const tripMembers = useMemo((): MinigameMember[] => {
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
  const [started, setStarted] = useState(false);
  const [winnerKey, setWinnerKey] = useState<MemberKey | null>(null);
  const [bangCol, setBangCol] = useState(1);
  const [path, setPath] = useState<ReturnType<typeof traceLadder> | null>(null);
  const [recorded, setRecorded] = useState(false);

  const members = tripMembers.slice(0, count);

  const handleStart = () => {
    // eslint-disable-next-line react-hooks/purity -- event handler pick
    const startCol = Math.floor(Math.random() * members.length);
    const rungs = LADDER_RUNGS.filter((r) => r.fromCol < members.length - 1);
    const nextPath = traceLadder(startCol, members.length, rungs);
    const winner = members[startCol];

    setBangCol(nextPath.endCol);
    setWinnerKey(winner?.key ?? null);
    setPath(nextPath);
    setStarted(true);

    if (activeTrip && winner) {
      recordGameResult(activeTrip.id, {
        game: 'ladder',
        winnerKey: winner.key,
        winnerName: winner.name,
        label: `사다리타기 · ${winner.name}`,
      });
      setRecorded(true);
    }
  };

  const handleReset = () => {
    setStarted(false);
    setWinnerKey(null);
    setBangCol(1);
    setPath(null);
    setRecorded(false);
  };

  const winner = winnerKey ? members.find((m) => m.key === winnerKey) : null;

  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col px-5 pt-3 pb-5">
        <Header title="사다리타기" />

        <ParticipantStepper
          count={count}
          min={MIN_PARTICIPANTS}
          max={Math.min(MAX_PARTICIPANTS, tripMembers.length)}
          onChange={(next) => {
            setCount(next);
            handleReset();
          }}
          className="mt-3"
        />

        <div className="mt-4">
          <LadderBoard members={members} bangCol={bangCol} path={started ? path : null} />
        </div>

        {started && winner ? (
          <div
            className="mt-5 flex flex-col items-center gap-1 rounded-2xl py-4"
            style={{ backgroundImage: 'linear-gradient(165deg, #ff9200 0%, #ff6b42 71%)' }}
          >
            <p className="text-base font-bold tracking-[-0.3px] text-white">{winner.name}님 당첨!</p>
            <p className="text-xs font-medium text-white">사다리는 공정하니까 원망 없기 🙏</p>
            {recorded ? <p className="text-[11px] font-medium text-white/80">타임라인에 기록됐어요</p> : null}
          </div>
        ) : null}

        <div className="mt-auto flex flex-col gap-2.5 pt-6">
          <Button variant="primary" fullWidth onClick={started ? handleReset : handleStart}>
            {started ? '다시하기' : '사다리타기 시작'}
          </Button>
          {started ? (
            <Button variant="outline" fullWidth onClick={() => router.push('/games')}>
              미니게임 허브로
            </Button>
          ) : null}
        </div>
      </div>
    </MobileShell>
  );
};
