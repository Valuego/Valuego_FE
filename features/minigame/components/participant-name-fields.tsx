'use client';

import { Avatar } from '@/shared/components/avatar';
import { cn } from '@/shared/lib/cn';

import type { MemberKey } from '../minigame.constants';

import { MINIGAME_MEMBERS } from '../minigame.constants';

export type EditableParticipant = {
  id: string;
  key: MemberKey;
  name: string;
};

export const buildParticipants = (count: number, names: string[]): EditableParticipant[] => {
  return Array.from({ length: count }, (_, index) => {
    const fallback = MINIGAME_MEMBERS[index % MINIGAME_MEMBERS.length];
    return {
      id: `p-${index}`,
      key: fallback.key,
      name: names[index]?.trim() || fallback.name,
    };
  });
};

export const resizeParticipantNames = (prev: string[], nextCount: number, seedNames: string[]) => {
  if (nextCount === prev.length) {
    return prev;
  }

  if (nextCount < prev.length) {
    return prev.slice(0, nextCount);
  }

  const next = [...prev];
  while (next.length < nextCount) {
    const index = next.length;
    next.push(seedNames[index] ?? `참가자${index + 1}`);
  }
  return next;
};

type ParticipantNameFieldsProps = {
  names: string[];
  onChangeName: (index: number, value: string) => void;
  className?: string;
};

export const ParticipantNameFields = ({ names, onChangeName, className }: ParticipantNameFieldsProps) => {
  return (
    <ul className={cn('flex flex-col gap-2.5', className)}>
      {names.map((name, index) => {
        const member = MINIGAME_MEMBERS[index % MINIGAME_MEMBERS.length];
        return (
          <li key={member.key} className="flex h-[54px] items-center gap-2.5 rounded-[14px] bg-white p-3">
            <Avatar member={member.key} size="sm" className="size-[30px] shrink-0 text-xs" />
            <input
              type="text"
              value={name}
              aria-label={`${index + 1}번 참가자 이름`}
              placeholder={`참가자${index + 1}`}
              onChange={(event) => onChangeName(index, event.target.value)}
              className="text-text-body placeholder:text-text-placeholder min-w-0 flex-1 bg-transparent text-[13.5px] font-bold outline-none"
            />
          </li>
        );
      })}
    </ul>
  );
};
