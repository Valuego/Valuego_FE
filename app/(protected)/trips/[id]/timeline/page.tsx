import { TimelineScreen } from '@/features/trip';

type TimelinePageProps = {
  params: Promise<{ id: string }>;
};

const TimelinePage = async ({ params }: TimelinePageProps) => {
  const { id } = await params;
  return <TimelineScreen tripId={id} />;
};

export default TimelinePage;
