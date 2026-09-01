'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/shared/components/button';
import { Header } from '@/shared/components/header';
import { InfoBanner } from '@/shared/components/info-banner';
import { MobileShell } from '@/shared/components/mobile-shell';
import { TextField } from '@/shared/components/text-field';
import { joinTripByCode } from '@/shared/session';

export const JoinTripScreen = () => {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleJoin = () => {
    const result = joinTripByCode(code);
    if (!result.ok) {
      setError(result.reason);
      return;
    }
    setError(null);
    router.push(`/trips/${result.trip.id}`);
  };

  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col gap-4 px-5 pt-3 pb-28">
        <Header title="참여 코드 입력" />
        <InfoBanner accent="blue" message="친구가 보낸 링크나 코드 끝 4자리를 입력하세요." />
        <TextField
          label="참여 코드"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="예: gn26 또는 gachigachi.app/j/gn26"
        />
        {error ? <p className="text-sm font-medium text-[#e08300]">{error}</p> : null}
        <p className="text-text-secondary-soft text-xs font-medium">데모: gn26 / jj26</p>
      </div>
      <div className="bg-surface-gray fixed right-0 bottom-0 left-0 mx-auto w-full max-w-[430px] px-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <Button variant="primary" fullWidth onClick={handleJoin}>
          일행 대기실로 입장
        </Button>
      </div>
    </MobileShell>
  );
};
