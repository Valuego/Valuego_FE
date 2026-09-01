import { RolesScreen } from '@/features/trip';

type RolesPageProps = {
  params: Promise<{ id: string }>;
};

const RolesPage = async ({ params }: RolesPageProps) => {
  const { id } = await params;
  return <RolesScreen tripId={id} />;
};

export default RolesPage;
