'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { getErrorMessage, isApiError } from '@/shared/lib/api';

import { useCreateLeaderStyle, useTripView } from '../trip.hooks';
import { buildTripHref, toCreateStyleRequest } from '../trip.lib';
import { TravelStyleForm } from './travel-style-form';

type GroupStyleScreenProps = {
  tripId: string;
};

export const GroupStyleScreen = ({ tripId }: GroupStyleScreenProps) => {
  const router = useRouter();
  const { trip, groupId } = useTripView(tripId);
  const createStyle = useCreateLeaderStyle(groupId ?? 0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (value: { budget: string; foods: string[]; activity: number }) => {
    if (!groupId) {
      router.push(buildTripHref(tripId));
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
      router.push(buildTripHref(tripId, 'invite'));
    } catch (error) {
      if (isApiError(error) && error.errorData?.code === 'STYLE-001') {
        router.push(buildTripHref(tripId, 'invite'));
        return;
      }
      setErrorMessage(getErrorMessage(error, '여행 스타일을 저장하지 못했어요.'));
    }
  };

  return (
    <TravelStyleForm
      onBack={() => router.push(buildTripHref(tripId, 'invite'))}
      onSubmit={(value) => void handleSubmit(value)}
      submitLabel="초대 화면으로"
      isSubmitting={createStyle.isPending}
      errorMessage={errorMessage}
    />
  );
};
