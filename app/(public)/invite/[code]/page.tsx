import { GuestInviteLandingScreen } from '@/features/trip';

type InviteLandingPageProps = {
  params: Promise<{ code: string }>;
};

const InviteLandingPage = async ({ params }: InviteLandingPageProps) => {
  const { code } = await params;
  return <GuestInviteLandingScreen code={decodeURIComponent(code)} />;
};

export default InviteLandingPage;
