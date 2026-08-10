export type OnboardingStep = {
  id: string;
  emoji: string;
  title: string;
  description: string;
  ctaLabel: string;
};

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'ai-schedule',
    emoji: '🗳️',
    title: '취향을 반영한 일정을 AI가 짜드려요',
    description: '가고 싶은 곳에 투표하고, 아쉬우면 말로 고치세요\nAI가 동선을 다시 맞춰 드려요',
    ctaLabel: '다음',
  },
  {
    id: 'decision-game',
    emoji: '🎯',
    title: '애매한 결정은 30초 게임으로',
    description: '"아무거나"만 세 번째 나왔다면\n룰렛과 사다리타기로 30초 만에 끝내요',
    ctaLabel: '다음',
  },
  {
    id: 'fair-settle',
    emoji: '💌',
    title: '보이지 않는 수고까지 공정하게 정산',
    description: '운전, 음식만들기, 일정 짜기까지\n영수증에 안 남는 몫도 함께 계산해요.',
    ctaLabel: '친구들과 첫 여행 일정 짜러가기',
  },
];

export type WelcomeFeature = {
  id: string;
  badge: string;
  badgeClassName: string;
  title: string;
  description: string;
};

export const WELCOME_FEATURES: WelcomeFeature[] = [
  {
    id: 'ai',
    badge: 'AI',
    badgeClassName: 'bg-brand-blue/8 text-brand-blue',
    title: 'AI가 짜는 우리 그룹 맞춤 일정',
    description: '이동수단·취향 반영, 말로 수정',
  },
  {
    id: 'game',
    badge: '30초',
    badgeClassName: 'bg-brand-purple/8 text-brand-purple',
    title: '애매한 결정은 게임으로',
    description: '룰렛·사다리·로컬 퀴즈로 30초 결정',
  },
  {
    id: 'settle',
    badge: '₩',
    badgeClassName: 'bg-brand-cyan/10 text-brand-cyan',
    title: '보이지 않는 수고까지 정산',
    description: '운전·계획도 인정받는 수고 경매',
  },
];
