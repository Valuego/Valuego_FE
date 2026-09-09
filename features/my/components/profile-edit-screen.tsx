'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { type MemberColor, useUpdateUserProfile, useUserProfileQuery } from '@/features/auth';
import { GUEST_COLOR_OPTIONS } from '@/features/trip/trip.constants';
import { Button } from '@/shared/components/button';
import { Header } from '@/shared/components/header';
import { MobileShell } from '@/shared/components/mobile-shell';
import { TextField } from '@/shared/components/text-field';
import { getErrorMessage } from '@/shared/lib/api';
import { cn } from '@/shared/lib/cn';
import type { MemberKey } from '@/shared/session';
import { useAppSession } from '@/shared/session';

const KEY_TO_COLOR: Record<MemberKey, MemberColor> = {
  doyeon: 'BLUE',
  seojun: 'PURPLE',
  hayeong: 'SKYBLUE',
  minjae: 'ORANGE',
};

export const ProfileEditScreen = () => {
  const router = useRouter();
  const session = useAppSession();
  const profileQuery = useUserProfileQuery(!session.isGuest);
  const updateProfile = useUpdateUserProfile();
  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const [colorDraft, setColorDraft] = useState<MemberColor | null>(null);
  const currentName = profileQuery.data?.nickname ?? session.user.name;
  const currentColor = profileQuery.data?.memberColor ?? KEY_TO_COLOR[session.user.member];
  const name = nameDraft ?? currentName;
  const color = colorDraft ?? currentColor;
  const trimmedName = name.trim();
  const hasChanges = trimmedName.length > 0 && (trimmedName !== currentName || color !== currentColor);
  const canSubmit = hasChanges && !updateProfile.isPending;

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }
    try {
      await updateProfile.mutateAsync({ nickname: trimmedName, memberColor: color });
      router.push('/my');
    } catch {
      // mutation error is rendered below
    }
  };

  return (
    <MobileShell className="bg-white">
      <div className="flex flex-1 flex-col gap-5 px-5 pt-4 pb-28">
        <Header title="내 정보 수정" onBack={() => router.push('/my')} />
        <p className="text-text-secondary-soft text-sm font-medium">여행 멤버들에게 보여질 이름이에요</p>
        <TextField label="이름" value={name} onChange={(event) => setNameDraft(event.target.value)} />
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
                  onClick={() => setColorDraft(option.color)}
                />
              );
            })}
          </div>
        </div>
        {updateProfile.isError ? (
          <p className="text-sm font-medium text-[#e08300]">{getErrorMessage(updateProfile.error)}</p>
        ) : null}
      </div>
      <div className="fixed right-0 bottom-0 left-0 mx-auto w-full max-w-[430px] bg-white px-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <Button variant="primary" fullWidth disabled={!canSubmit} onClick={() => void handleSubmit()}>
          {updateProfile.isPending ? '수정하는 중…' : '수정'}
        </Button>
      </div>
    </MobileShell>
  );
};
