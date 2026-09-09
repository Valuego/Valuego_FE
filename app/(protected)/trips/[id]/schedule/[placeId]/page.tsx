import { PlaceDetailScreen } from '@/features/trip';

type PlaceDetailPageProps = {
  params: Promise<{ id: string; placeId: string }>;
};

const PlaceDetailPage = async ({ params }: PlaceDetailPageProps) => {
  const { id, placeId } = await params;
  return <PlaceDetailScreen tripId={id} placeId={placeId} />;
};

export default PlaceDetailPage;
