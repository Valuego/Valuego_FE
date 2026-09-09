import { GuestJoinProfileScreen } from '@/features/trip';

type GuestJoinProfilePageProps = {
  params: Promise<{ code: string }>;
};

const GuestJoinProfilePage = async ({ params }: GuestJoinProfilePageProps) => {
  const { code } = await params;
  return <GuestJoinProfileScreen code={decodeURIComponent(code)} />;
};

export default GuestJoinProfilePage;
