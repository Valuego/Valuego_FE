import { RouletteScreen } from '@/features/minigame';

type TripRoulettePageProps = {
  params: Promise<{ id: string }>;
};

const TripRoulettePage = async ({ params }: TripRoulettePageProps) => {
  const { id } = await params;
  return <RouletteScreen tripId={id} />;
};

export default TripRoulettePage;
