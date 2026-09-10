'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { isApiError } from '@/shared/lib/api';
import { isDemoInviteCode, normalizeInviteInput, useAppSession } from '@/shared/session';

import { useCreateGuestStyle } from '../trip.hooks';
import { buildInvitePath, parseGroupId, toCreateStyleRequest } from '../trip.lib';
import { TravelStyleForm } from './travel-style-form';

type GuestStyleScreenProps = {
  code: string;
};

export const GuestStyleScreen = ({ code }: GuestStyleScreenProps) => {
  const router = useRouter();
  const session = useAppSession();
  const createStyle = useCreateGuestStyle();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const trip =
    session.trips.find((item) => normalizeInviteInput(item.inviteCode) === normalizeInviteInput(code)) ?? null;
  const hasRemoteGroup = Boolean(trip && parseGroupId(trip.id));

  const goComplete = () => {
    router.push(`${buildInvitePath(code)}/complete`);
  };

  const handleSubmit = async (value: { budget: string; foods: string[]; activity: number }) => {
    setErrorMessage(null);
    if (isDemoInviteCode(code) || !hasRemoteGroup) {
      goComplete();
      return;
    }
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
      goComplete();
    } catch (error) {
      if (isApiError(error) && error.errorData?.code === 'STYLE-001') {
        goComplete();
        return;
      }
      goComplete();
    }
  };

  return (
    <TravelStyleForm
      onBack={() => router.push(`${buildInvitePath(code)}/profile`)}
      onSubmit={(value) => void handleSubmit(value)}
      submitLabel="참여 완료하기"
      isSubmitting={createStyle.isPending}
      errorMessage={errorMessage}
    />
  );
};
