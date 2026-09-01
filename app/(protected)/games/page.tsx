'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useActiveTrip } from '@/shared/session';

const GamesRedirectPage = () => {
  const router = useRouter();
  const activeTrip = useActiveTrip();

  useEffect(() => {
    if (activeTrip) {
      router.replace(`/trips/${activeTrip.id}/games`);
      return;
    }
    router.replace('/home');
  }, [activeTrip, router]);

  return (
    <div className="bg-surface-gray flex min-h-dvh items-center justify-center text-sm text-[rgba(55,56,60,0.61)]">
      미니게임으로 이동 중…
    </div>
  );
};

export default GamesRedirectPage;
