import { MinigameHubScreen } from '@/features/minigame';

type TripGamesPageProps = {
  params: Promise<{ id: string }>;
};

const TripGamesPage = async ({ params }: TripGamesPageProps) => {
  const { id } = await params;
  return <MinigameHubScreen tripId={id} />;
};

export default TripGamesPage;
