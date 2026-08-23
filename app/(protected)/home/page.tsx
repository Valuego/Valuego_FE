import { HomeScreen } from '@/features/home';

type HomePageProps = {
  searchParams: Promise<{ empty?: string }>;
};

const HomePage = async ({ searchParams }: HomePageProps) => {
  const params = await searchParams;

  return <HomeScreen hasActiveTrip={params.empty !== '1'} />;
};

export default HomePage;
