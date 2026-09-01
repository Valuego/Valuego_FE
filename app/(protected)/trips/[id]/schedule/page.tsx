import { ScheduleScreen } from '@/features/trip';

type SchedulePageProps = {
  params: Promise<{ id: string }>;
};

const SchedulePage = async ({ params }: SchedulePageProps) => {
  const { id } = await params;
  return <ScheduleScreen tripId={id} />;
};

export default SchedulePage;
