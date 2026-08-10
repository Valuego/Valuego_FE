import Link from 'next/link';

import { Button } from '@/shared/components/button';
import { PageContainer } from '@/shared/components/page-container';

const NotFound = () => {
  return (
    <section className="flex flex-1 flex-col items-center py-[180px]">
      <PageContainer className="flex w-full flex-col items-center gap-4 py-10">
        <h1 className="text-heading-xl text-text-basic text-center leading-normal font-bold">Page not found</h1>
        <p className="text-body-xl text-text-subtle text-center leading-normal font-medium">
          요청하신 페이지를 찾을 수 없습니다.
        </p>
        <Button asChild variant="primary" size="large">
          <Link href="/">홈으로 가기</Link>
        </Button>
      </PageContainer>
    </section>
  );
};

export default NotFound;
