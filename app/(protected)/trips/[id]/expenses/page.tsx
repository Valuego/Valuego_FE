import { ExpenseRecordScreen } from '@/features/trip';

type ExpensePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ view?: string }>;
};

const ExpensePage = async ({ params, searchParams }: ExpensePageProps) => {
  const { id } = await params;
  const { view } = await searchParams;
  return <ExpenseRecordScreen tripId={id} initialView={view === 'list' ? 'list' : 'form'} />;
};

export default ExpensePage;
