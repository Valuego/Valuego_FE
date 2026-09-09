import { SettlementBoardScreen } from '@/features/trip';

type BoardPageProps = {
  params: Promise<{ id: string }>;
};

const BoardPage = async ({ params }: BoardPageProps) => {
  const { id } = await params;
  return <SettlementBoardScreen tripId={id} />;
};

export default BoardPage;
