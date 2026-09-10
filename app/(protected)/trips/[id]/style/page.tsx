import { GroupStyleScreen } from '@/features/trip';

type GroupStylePageProps = {
  params: Promise<{ id: string }>;
};

const GroupStylePage = async ({ params }: GroupStylePageProps) => {
  const { id } = await params;
  return <GroupStyleScreen tripId={id} />;
};

export default GroupStylePage;
