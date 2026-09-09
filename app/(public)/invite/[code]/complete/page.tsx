import { GuestJoinCompleteScreen } from '@/features/trip';

type GuestJoinCompletePageProps = {
  params: Promise<{ code: string }>;
};

const GuestJoinCompletePage = async ({ params }: GuestJoinCompletePageProps) => {
  const { code } = await params;
  return <GuestJoinCompleteScreen code={decodeURIComponent(code)} />;
};

export default GuestJoinCompletePage;
