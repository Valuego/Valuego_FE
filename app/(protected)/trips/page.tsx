'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { buildTripHref } from '@/features/trip';
import { useAppSession } from '@/shared/session';

const TripsIndexPage = () => {
  const router = useRouter();
  const session = useAppSession();

  useEffect(() => {
    if (session.activeTripId) {
      router.replace(buildTripHref(session.activeTripId, 'schedule'));
      return;
    }
    router.replace('/home');
  }, [router, session.activeTripId]);

  return (
    <div className="bg-surface-gray flex min-h-dvh items-center justify-center text-sm text-[rgba(55,56,60,0.61)]">
      여행 일정을 불러오는 중…
    </div>
  );
};

export default TripsIndexPage;
