import { LadderScreen } from '@/features/minigame';

type TripLadderPageProps = {
  params: Promise<{ id: string }>;
};

const TripLadderPage = async ({ params }: TripLadderPageProps) => {
  const { id } = await params;
  return <LadderScreen tripId={id} />;
};

export default TripLadderPage;
