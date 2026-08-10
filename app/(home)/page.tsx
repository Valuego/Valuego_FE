import { PageContainer } from '@/shared/components/page-container';

const Home = () => {
  return (
    <PageContainer className="flex flex-col items-start gap-4 py-20">
      <p className="text-body-sm text-text-subtle">Valuego</p>
      <h1 className="text-heading-xl text-text-basic font-bold">프론트엔드 초기 세팅이 완료되었습니다.</h1>
      <p className="text-body-base text-text-subtle">
        Next.js 16 · TypeScript · pnpm · Tailwind CSS 4 · TanStack Query · ESLint/Prettier/Husky
      </p>
    </PageContainer>
  );
};

export default Home;
