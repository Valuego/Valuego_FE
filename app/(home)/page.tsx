import Link from 'next/link';

import { PageContainer } from '@/shared/components/page-container';

const LINKS = [
  { href: '/components', label: '공통 컴포넌트' },
  { href: '/login', label: '로그인' },
  { href: '/onboarding', label: '온보딩 인트로' },
  { href: '/welcome', label: '가치 소개 + 로그인' },
] as const;

const Home = () => {
  return (
    <PageContainer className="flex flex-col items-start gap-6 py-16">
      <div className="flex flex-col gap-2">
        <p className="text-body-sm text-text-subtle">가치가자</p>
        <h1 className="text-heading-xl text-text-basic font-bold">로그인 · 온보딩 미리보기</h1>
        <p className="text-body-base text-text-subtle">PWA 기준으로 구성된 화면입니다. 모바일 폭에서 확인해 주세요.</p>
      </div>
      <ul className="flex w-full max-w-sm flex-col gap-3">
        {LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="bg-brand-blue block rounded-xl px-5 py-3.5 text-center text-[15px] font-semibold text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </PageContainer>
  );
};

export default Home;
