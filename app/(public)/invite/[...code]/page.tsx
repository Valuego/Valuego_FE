import { redirect } from 'next/navigation';

import {
  GuestInviteLandingScreen,
  GuestJoinCompleteScreen,
  GuestJoinProfileScreen,
  GuestOnboardingScreen,
  GuestStyleScreen,
} from '@/features/trip';
import { normalizeInviteInput } from '@/shared/session';

type InviteCatchAllPageProps = {
  params: Promise<{ code: string[] }>;
};

const INVITE_STEPS = ['onboarding', 'profile', 'style', 'complete'] as const;
type InviteStep = (typeof INVITE_STEPS)[number];

const isInviteStep = (value: string): value is InviteStep => {
  return INVITE_STEPS.some((step) => step === value);
};

const decodeSegment = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const InviteCatchAllPage = async ({ params }: InviteCatchAllPageProps) => {
  const { code: segments } = await params;
  const last = segments[segments.length - 1] ?? '';
  const step = isInviteStep(last) ? last : null;
  const rawCode = (step ? segments.slice(0, -1) : segments).map(decodeSegment).join('/');
  const token = normalizeInviteInput(rawCode);

  if (!token) {
    redirect('/join');
  }

  if (step === 'onboarding') {
    return <GuestOnboardingScreen code={token} />;
  }
  if (step === 'profile') {
    return <GuestJoinProfileScreen code={token} />;
  }
  if (step === 'style') {
    return <GuestStyleScreen code={token} />;
  }
  if (step === 'complete') {
    return <GuestJoinCompleteScreen code={token} />;
  }

  return <GuestInviteLandingScreen code={token} />;
};

export default InviteCatchAllPage;
