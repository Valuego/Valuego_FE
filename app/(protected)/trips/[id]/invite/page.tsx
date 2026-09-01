import { InviteScreen } from '@/features/trip';

type InvitePageProps = {
  params: Promise<{ id: string }>;
};

const InvitePage = async ({ params }: InvitePageProps) => {
  const { id } = await params;

  return <InviteScreen tripId={id} />;
};

export default InvitePage;
