'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { getErrorMessage, isApiError } from '@/shared/lib/api';
import { completeHostStyle } from '@/shared/session';

import { useCreateLeaderStyle, useTripView } from '../trip.hooks';
import { buildTripHref, toCreateStyleRequest } from '../trip.lib';
import { TravelStyleForm } from './travel-style-form';

type GroupStyleScreenProps = {
  tripId: string;
};

export const GroupStyleScreen = ({ tripId }: GroupStyleScreenProps) => {
  const router = useRouter();
  const { trip, groupId, isGuest, isLoading } = useTripView(tripId);
  const createStyle = useCreateLeaderStyle(groupId ?? 0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (isGuest) {
      router.replace(buildTripHref(tripId));
    }
  }, [isGuest, isLoading, router, tripId]);

  const handleSubmit = async (value: { budget: string; foods: string[]; activity: number }) => {
    if (!groupId) {
      completeHostStyle(tripId, value);
      router.push(buildTripHref(tripId, 'prep'));
      return;
    }

    setErrorMessage(null);
    try {
      await createStyle.mutateAsync(
        toCreateStyleRequest({
          destinationLabel: trip?.destination ?? '부산',
          title: trip?.title ?? '',
          startDate: '',
          endDate: '',
          memberCount: trip?.memberCount ?? 4,
          transport: trip?.transport ?? 'car',
          budgetLabel: value.budget,
          foodLabels: value.foods,
          activitySlider: value.activity,
        }),
      );
      completeHostStyle(tripId, value);
      router.push(buildTripHref(tripId, 'prep'));
    } catch (error) {
      if (isApiError(error) && error.errorData?.code === 'STYLE-001') {
        completeHostStyle(tripId, value);
        router.push(buildTripHref(tripId, 'prep'));
        return;
      }
      setErrorMessage(getErrorMessage(error, '여행 스타일을 저장하지 못했어요.'));
    }
  };

  return (
    <TravelStyleForm
      onBack={() => router.push(buildTripHref(tripId, 'invite'))}
      onSubmit={(value) => void handleSubmit(value)}
      submitLabel="AI 일정 조건 확인하기"
      isSubmitting={createStyle.isPending}
      errorMessage={errorMessage}
    />
  );
};
