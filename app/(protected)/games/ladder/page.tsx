'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useActiveTrip } from '@/shared/session';

const GamesLadderRedirectPage = () => {
  const router = useRouter();
  const activeTrip = useActiveTrip();

  useEffect(() => {
    if (activeTrip) {
      router.replace(`/trips/${activeTrip.id}/games/ladder`);
      return;
    }
    router.replace('/trips/join');
  }, [activeTrip, router]);

  return null;
};

export default GamesLadderRedirectPage;
