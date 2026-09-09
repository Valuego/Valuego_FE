import { SettlementStatusScreen } from '@/features/trip';

type StatusPageProps = {
  params: Promise<{ id: string }>;
};

const StatusPage = async ({ params }: StatusPageProps) => {
  const { id } = await params;
  return <SettlementStatusScreen tripId={id} />;
};

export default StatusPage;
