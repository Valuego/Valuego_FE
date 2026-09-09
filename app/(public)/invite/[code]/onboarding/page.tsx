import { GuestOnboardingScreen } from '@/features/trip';

type GuestOnboardingPageProps = {
  params: Promise<{ code: string }>;
};

const GuestOnboardingPage = async ({ params }: GuestOnboardingPageProps) => {
  const { code } = await params;
  return <GuestOnboardingScreen code={decodeURIComponent(code)} />;
};

export default GuestOnboardingPage;
