'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Button } from '@/shared/components/button';
import { MobileShell } from '@/shared/components/mobile-shell';
import { getErrorMessage } from '@/shared/lib/api';

import { rememberActiveTrip, useScheduleQuery, useTripView } from '../trip.hooks';
import { isHostStyleComplete, isScheduleNotFound, resolvePlanningPath } from '../trip.lib';
import { OngoingTripHomeScreen } from './ongoing-trip-home-screen';

type TripLobbyScreenProps = {
  tripId: string;
};

export const TripLobbyScreen = ({ tripId }: TripLobbyScreenProps) => {
  const router = useRouter();
  const { trip, isGuest, isLoading, isError, error } = useTripView(tripId);
  const scheduleQuery = useScheduleQuery(tripId);
  const isOngoing = trip?.phase === 'ongoing' || trip?.phase === 'settling';

  useEffect(() => {
    rememberActiveTrip(tripId);
  }, [tripId]);

  useEffect(() => {
    if (!isLoading && !isError && !trip) {
      router.replace(isGuest ? '/join' : '/home');
    }
  }, [isError, isGuest, isLoading, router, trip]);

  useEffect(() => {
    if (isLoading || isOngoing || !trip || scheduleQuery.isPending) {
      return;
    }

    const hasSchedule = Boolean(scheduleQuery.data?.days.length);
    if (!hasSchedule && scheduleQuery.isError && !isScheduleNotFound(scheduleQuery.error)) {
      return;
    }

    router.replace(
      resolvePlanningPath({
        tripId,
        isGuest,
        hasSchedule,
        hostStyleComplete: isHostStyleComplete(trip),
      }),
    );
  }, [
    isGuest,
    isLoading,
    isOngoing,
    router,
    scheduleQuery.data,
    scheduleQuery.error,
    scheduleQuery.isError,
    scheduleQuery.isPending,
    trip,
    tripId,
  ]);

  if (isOngoing && trip) {
    return <OngoingTripHomeScreen tripId={tripId} />;
  }

  if (isLoading || scheduleQuery.isPending) {
    return (
      <MobileShell className="bg-surface-gray">
        <div className="flex flex-1 items-center justify-center text-sm text-[rgba(55,56,60,0.61)]">
          다음 단계로 이동하는 중…
        </div>
      </MobileShell>
    );
  }

  if (!trip) {
    return (
      <MobileShell className="bg-surface-gray">
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-5 text-center">
          <p className="text-sm font-medium text-[#e08300]">
            {isError ? getErrorMessage(error) : '그룹을 찾을 수 없어요.'}
          </p>
          <Button variant="outline" onClick={() => router.push(isGuest ? '/join' : '/home')}>
            {isGuest ? '초대 링크로' : '홈으로'}
          </Button>
        </div>
      </MobileShell>
    );
  }

  if (scheduleQuery.isError && !isScheduleNotFound(scheduleQuery.error)) {
    return (
      <MobileShell className="bg-surface-gray">
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-5 text-center">
          <p className="text-sm font-medium text-[#e08300]">{getErrorMessage(scheduleQuery.error)}</p>
          <Button variant="outline" onClick={() => router.push('/home')}>
            홈으로
          </Button>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 items-center justify-center text-sm text-[rgba(55,56,60,0.61)]">
        다음 단계로 이동하는 중…
      </div>
    </MobileShell>
  );
};
