'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/shared/components/button';
import { Header } from '@/shared/components/header';
import { MobileShell } from '@/shared/components/mobile-shell';
import { TextField } from '@/shared/components/text-field';
import { getErrorMessage, isApiError } from '@/shared/lib/api';
import { cn } from '@/shared/lib/cn';
import { isDemoInviteCode, joinInviteLocally, normalizeInviteInput, useAppSession } from '@/shared/session';

import type { MemberColor } from '../trip.types';

import { GUEST_COLOR_OPTIONS } from '../trip.constants';
import { useJoinGroupAsGuest } from '../trip.hooks';
import { buildInvitePath } from '../trip.lib';
import { GuestMemberBadge } from './guest-invite-chrome';

type GuestJoinProfileScreenProps = {
  code: string;
};

export const GuestJoinProfileScreen = ({ code }: GuestJoinProfileScreenProps) => {
  const router = useRouter();
  const session = useAppSession();
  const joinGroup = useJoinGroupAsGuest();
  const [name, setName] = useState('');
  const [color, setColor] = useState<MemberColor>('BLUE');
  const trimmedName = name.trim();
  const canSubmit = trimmedName.length > 0 && !joinGroup.isPending;
  const trip =
    session.trips.find((item) => normalizeInviteInput(item.inviteCode) === normalizeInviteInput(code)) ?? null;

  const goStyle = () => {
    router.push(`${buildInvitePath(code)}/style`);
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }
    const selectedMember = GUEST_COLOR_OPTIONS.find((option) => option.color === color)?.member ?? 'seojun';

    if (isDemoInviteCode(code)) {
      joinInviteLocally(code, trimmedName, selectedMember);
      goStyle();
      return;
    }

    try {
      await joinGroup.mutateAsync({
        groupLink: code,
        body: { memberName: trimmedName, memberColor: color },
      });
      goStyle();
    } catch (error) {
      if (isApiError(error) && (error.status === 409 || error.errorData?.code === 'GROUP-003')) {
        goStyle();
      }
    }
  };

  return (
    <MobileShell className="bg-white">
      <div className="border-line-hairline flex h-16 items-center justify-between border-b px-5">
        <Header title="뒤로가기" onBack={() => router.push(buildInvitePath(code))} />
        {trip ? <GuestMemberBadge members={trip.members} memberCount={trip.memberCount} /> : <span />}
      </div>
      <div className="flex flex-1 flex-col gap-5 px-5 pt-8 pb-28">
        <div className="flex flex-col gap-2">
          <h1 className="text-ink-900 text-2xl leading-normal font-bold tracking-[-0.5px]">
            반가워요! 👋
            <br />
            어떻게 부를까요?
          </h1>
          <p className="text-text-secondary-soft text-sm font-medium">여행 멤버들에게 보여질 이름이에요</p>
        </div>
        <TextField
          label="이름 또는 별명"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="예: 서준"
        />
        <div className="flex flex-col gap-2.5">
          <p className="text-text-secondary-soft text-[13px] font-semibold">내 색상 고르기</p>
          <div className="border-line-hairline flex gap-3.5 rounded-2xl border bg-white px-5 py-4">
            {GUEST_COLOR_OPTIONS.map((option) => {
              const isSelected = option.color === color;
              return (
                <button
                  key={option.color}
                  type="button"
                  aria-label={`${option.color} 색상 선택`}
                  aria-pressed={isSelected}
                  className={cn(
                    'size-10 rounded-full transition-shadow',
                    option.className,
                    isSelected ? 'ring-brand-blue ring-2 ring-offset-2' : 'opacity-70',
                  )}
                  onClick={() => setColor(option.color)}
                />
              );
            })}
          </div>
        </div>
        {joinGroup.isError ? (
          <p className="text-xs font-medium text-[#e08300]">
            {getErrorMessage(joinGroup.error, '참여에 실패했어요. 링크가 만료되었거나 인원이 가득 찼을 수 있어요.')}
          </p>
        ) : null}
      </div>
      <div className="fixed right-0 bottom-0 left-0 mx-auto w-full max-w-[430px] bg-white px-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <Button variant="primary" fullWidth disabled={!canSubmit} onClick={() => void handleSubmit()}>
          {joinGroup.isPending ? '참여하는 중…' : '다음'}
        </Button>
      </div>
    </MobileShell>
  );
};
