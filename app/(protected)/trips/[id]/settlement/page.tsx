import { SettlementStartScreen } from '@/features/trip';

type SettlementPageProps = {
  params: Promise<{ id: string }>;
};

const SettlementPage = async ({ params }: SettlementPageProps) => {
  const { id } = await params;
  return <SettlementStartScreen tripId={id} />;
};

export default SettlementPage;
