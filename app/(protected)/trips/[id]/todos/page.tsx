import { TodosScreen } from '@/features/trip';

type TodosPageProps = {
  params: Promise<{ id: string }>;
};

const TodosPage = async ({ params }: TodosPageProps) => {
  const { id } = await params;
  return <TodosScreen tripId={id} />;
};

export default TodosPage;
