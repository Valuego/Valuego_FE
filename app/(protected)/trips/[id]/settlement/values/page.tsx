import { BlindValueScreen } from '@/features/trip';

type ValuesPageProps = {
  params: Promise<{ id: string }>;
};

const ValuesPage = async ({ params }: ValuesPageProps) => {
  const { id } = await params;
  return <BlindValueScreen tripId={id} />;
};

export default ValuesPage;
