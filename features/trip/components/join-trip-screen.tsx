'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/shared/components/button';
import { Header } from '@/shared/components/header';
import { InfoBanner } from '@/shared/components/info-banner';
import { MobileShell } from '@/shared/components/mobile-shell';
import { TextField } from '@/shared/components/text-field';
import { normalizeInviteInput } from '@/shared/session';

import { buildInvitePath } from '../trip.lib';

export const JoinTripScreen = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeFromQuery = searchParams.get('code');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!codeFromQuery) {
      return;
    }
    router.replace(buildInvitePath(codeFromQuery));
  }, [codeFromQuery, router]);

  const handleJoin = () => {
    const token = normalizeInviteInput(code);
    if (!token) {
      setError('참여 코드를 입력해 주세요.');
      return;
    }
    setError(null);
    router.push(buildInvitePath(token));
  };

  if (codeFromQuery) {
    return (
      <MobileShell className="bg-surface-gray">
        <div className="flex flex-1 items-center justify-center text-sm text-[rgba(55,56,60,0.61)]">
          초대 링크로 이동 중…
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col gap-4 px-5 pt-3 pb-28">
        <Header title="참여 코드 입력" />
        <InfoBanner accent="blue" message="친구가 보낸 링크나 초대 코드를 입력하세요." />
        <TextField
          label="참여 코드"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="초대 링크 또는 코드 (체험: demo)"
        />
        <p className="text-text-secondary-soft text-xs font-medium">로컬 체험은 코드 `demo` 를 입력하면 돼요.</p>
        {error ? <p className="text-sm font-medium text-[#e08300]">{error}</p> : null}
      </div>
      <div className="bg-surface-gray fixed right-0 bottom-0 left-0 mx-auto w-full max-w-[430px] px-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <Button variant="primary" fullWidth onClick={handleJoin}>
          초대 화면으로 이동
        </Button>
      </div>
    </MobileShell>
  );
};
