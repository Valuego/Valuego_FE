import { TripLobbyScreen } from '@/features/trip';

type TripLobbyPageProps = {
  params: Promise<{ id: string }>;
};

const TripLobbyPage = async ({ params }: TripLobbyPageProps) => {
  const { id } = await params;
  return <TripLobbyScreen tripId={id} />;
};

export default TripLobbyPage;
