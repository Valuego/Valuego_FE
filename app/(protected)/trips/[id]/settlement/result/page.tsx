import { LaborResultScreen } from '@/features/trip';

type ResultPageProps = {
  params: Promise<{ id: string }>;
};

const ResultPage = async ({ params }: ResultPageProps) => {
  const { id } = await params;
  return <LaborResultScreen tripId={id} />;
};

export default ResultPage;
