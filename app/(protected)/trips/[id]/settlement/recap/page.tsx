import { RecapCardScreen } from '@/features/trip';

type RecapPageProps = {
  params: Promise<{ id: string }>;
};

const RecapPage = async ({ params }: RecapPageProps) => {
  const { id } = await params;
  return <RecapCardScreen tripId={id} />;
};

export default RecapPage;
