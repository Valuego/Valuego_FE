import { GuestStyleScreen } from '@/features/trip';

type GuestStylePageProps = {
  params: Promise<{ code: string }>;
};

const GuestStylePage = async ({ params }: GuestStylePageProps) => {
  const { code } = await params;
  return <GuestStyleScreen code={decodeURIComponent(code)} />;
};

export default GuestStylePage;
