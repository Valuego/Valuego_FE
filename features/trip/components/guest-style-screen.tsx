'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { getErrorMessage, isApiError } from '@/shared/lib/api';
import { isDemoInviteCode } from '@/shared/session';

import { useCreateGuestStyle } from '../trip.hooks';
import { buildInvitePath, toCreateStyleRequest } from '../trip.lib';
import { TravelStyleForm } from './travel-style-form';

type GuestStyleScreenProps = {
  code: string;
};

export const GuestStyleScreen = ({ code }: GuestStyleScreenProps) => {
  const router = useRouter();
  const createStyle = useCreateGuestStyle();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (value: { budget: string; foods: string[]; activity: number }) => {
    setErrorMessage(null);
    if (isDemoInviteCode(code)) {
      router.push(`${buildInvitePath(code)}/complete`);
      return;
    }
    try {
      await createStyle.mutateAsync(
        toCreateStyleRequest({
          destinationLabel: '부산',
          title: '',
          startDate: '',
          endDate: '',
          memberCount: 4,
          transport: 'car',
          budgetLabel: value.budget,
          foodLabels: value.foods,
          activitySlider: value.activity,
        }),
      );
      router.push(`${buildInvitePath(code)}/complete`);
    } catch (error) {
      if (isApiError(error) && error.errorData?.code === 'STYLE-001') {
        router.push(`${buildInvitePath(code)}/complete`);
        return;
      }
      setErrorMessage(getErrorMessage(error, '여행 스타일을 저장하지 못했어요.'));
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
