import { LaborReviewScreen } from '@/features/trip';

type LaborPageProps = {
  params: Promise<{ id: string }>;
};

const LaborPage = async ({ params }: LaborPageProps) => {
  const { id } = await params;
  return <LaborReviewScreen tripId={id} />;
};

export default LaborPage;
