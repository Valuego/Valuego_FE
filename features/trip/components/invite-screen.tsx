'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import type { MemberKey } from '@/features/home/home.constants';
import { Avatar } from '@/shared/components/avatar';
import { Button } from '@/shared/components/button';
import { Header } from '@/shared/components/header';
import { InfoBanner } from '@/shared/components/info-banner';
import { MobileShell } from '@/shared/components/mobile-shell';
import { StatusPill } from '@/shared/components/status-pill';

type InviteMember = {
  id: string;
  name: string;
  role: string;
  member: MemberKey;
  status: 'done' | 'pending' | 'host';
  statusLabel: string;
};

const INVITE_URL = 'gachigachi.app/j/8f2k';

const FILLED_MEMBERS: InviteMember[] = [
  {
    id: '1',
    name: '도연',
    role: '나 · 호스트',
    member: 'doyeon',
    status: 'host',
    statusLabel: '성향 완료',
  },
  {
    id: '2',
    name: '서준',
    role: '친구',
    member: 'seojun',
    status: 'done',
    statusLabel: '완료',
  },
  {
    id: '3',
    name: '하영',
    role: '친구',
    member: 'hayeong',
    status: 'done',
    statusLabel: '완료',
  },
  {
    id: '4',
    name: '민재',
    role: '친구',
    member: 'minjae',
    status: 'pending',
    statusLabel: '대기중',
  },
];

type InviteScreenProps = {
  empty?: boolean;
};

export const InviteScreen = ({ empty = false }: InviteScreenProps) => {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const members = empty ? FILLED_MEMBERS.slice(0, 1) : FILLED_MEMBERS;
  const completedCount = members.filter((member) => member.status !== 'pending').length;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`https://${INVITE_URL}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col gap-4 px-5 pt-3 pb-28">
        <Header title="친구 초대하기" />
        <InfoBanner accent="blue" message="링크를 공유하면 친구가 바로 참여할 수 있어요" />

        <div className="bg-surface-muted flex h-[51px] items-center justify-between rounded-xl px-3">
          <p className="text-ink-900 text-sm font-medium">{INVITE_URL}</p>
          <button
            type="button"
            onClick={handleCopy}
            className="bg-brand-blue rounded-lg px-3 py-1.5 text-[12.5px] font-bold text-white"
          >
            {copied ? '복사됨' : 'URL 복사'}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-ink-900 text-sm font-bold">참여 현황</p>
          <p className="text-text-secondary-soft text-sm font-medium">{completedCount}/4 완료</p>
        </div>

        <ul className="border-line-hairline overflow-hidden rounded-2xl border bg-white">
          {members.map((member) => (
            <li key={member.id} className="flex h-[60px] items-center gap-3 px-3.5">
              <Avatar member={member.member} size="sm" className="size-9 text-sm" />
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="text-ink-900 text-sm font-bold">{member.name}</p>
                <p className="text-text-secondary-soft text-xs font-medium">{member.role}</p>
              </div>
              <StatusPill
                label={member.statusLabel}
                tone={member.status === 'pending' ? 'pending' : member.status === 'host' ? 'host' : 'done'}
              />
            </li>
          ))}

          {empty ? (
            <li className="flex flex-col items-center px-6 py-5 text-center">
              <div className="text-brand-blue mb-3 flex size-[74px] items-center justify-center rounded-full bg-[#edf0fa] text-[40px] font-bold">
                ?
              </div>
              <p className="text-ink-900 text-base font-bold">아직 친구가 참여하기 전이에요</p>
              <p className="text-text-secondary-soft mt-2 text-sm leading-[1.5]">
                친구가 초대를 수락하면 목록에 나타나요.
                <br />
                성향 입력까지 마치면 완료로 표시돼요.
              </p>
              <Button variant="primary" className="mt-4 h-12 w-full max-w-[280px]" onClick={handleCopy}>
                초대 링크 다시 보내기
              </Button>
            </li>
          ) : null}
        </ul>
      </div>

      <div className="bg-surface-gray fixed right-0 bottom-0 left-0 mx-auto w-full max-w-[430px] px-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <Button variant="primary" fullWidth onClick={() => router.push('/home')}>
          {empty ? '홈으로 돌아가기' : '일정 만들러 가기'}
        </Button>
      </div>
    </MobileShell>
  );
};
