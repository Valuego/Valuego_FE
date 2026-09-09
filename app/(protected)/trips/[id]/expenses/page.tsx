import { ExpenseRecordScreen } from '@/features/trip';

type ExpensePageProps = {
  params: Promise<{ id: string }>;
};

const ExpensePage = async ({ params }: ExpensePageProps) => {
  const { id } = await params;
  return <ExpenseRecordScreen tripId={id} />;
};

export default ExpensePage;
