import Link from 'next/link';

import { PageContainer } from '@/shared/components/page-container';

const LINKS = [
  { href: '/', label: '앱 진입 (세션 리다이렉트)' },
  { href: '/home', label: '홈' },
  { href: '/games', label: '미니게임' },
  { href: '/games/roulette', label: '벌칙 룰렛' },
  { href: '/games/ladder', label: '사다리타기' },
  { href: '/my', label: '마이페이지' },
  { href: '/my/personality', label: '내 성향 카드' },
  { href: '/my/notifications', label: '알림 설정' },
  { href: '/my/settlements', label: '지난 정산 내역' },
  { href: '/join', label: '참여 코드 합류' },
  { href: '/trips/new', label: '그룹 만들기' },
  { href: '/trips/new/style', label: '성향 입력' },
  { href: '/trips/new/confirm', label: 'AI 조건 확인' },
  { href: '/login', label: '로그인' },
  { href: '/onboarding', label: '온보딩' },
  { href: '/welcome', label: '웰컴' },
  { href: '/components', label: '공통 컴포넌트' },
] as const;

const DevPreviewPage = () => {
  return (
    <PageContainer className="flex flex-col items-start gap-6 py-16">
      <div className="flex flex-col gap-2">
        <p className="text-body-sm text-text-subtle">가치가자</p>
        <h1 className="text-heading-xl text-text-basic font-bold">화면 미리보기</h1>
        <p className="text-body-base text-text-subtle">개발용 링크입니다. 실제 흐름은 / 에서 시작하세요.</p>
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

export default DevPreviewPage;
