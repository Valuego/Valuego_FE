import { InviteScreen } from '@/features/trip';

type InvitePageProps = {
  searchParams: Promise<{ empty?: string }>;
};

const InvitePage = async ({ searchParams }: InvitePageProps) => {
  const params = await searchParams;

  return <InviteScreen empty={params.empty === '1'} />;
};

export default InvitePage;
