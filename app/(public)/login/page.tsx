import { LoginScreen } from '@/features/auth';

type LoginPageProps = {
  searchParams: Promise<{ kakaoError?: string }>;
};

const LoginPage = async ({ searchParams }: LoginPageProps) => {
  const params = await searchParams;
  return <LoginScreen kakaoErrorFromCallback={params.kakaoError ?? null} />;
};

export default LoginPage;
