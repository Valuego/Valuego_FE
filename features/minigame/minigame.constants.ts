export type MemberKey = 'doyeon' | 'seojun' | 'hayeong' | 'minjae';

export type MinigameMember = {
  key: MemberKey;
  name: string;
  initial: string;
  colorClass: string;
  colorHex: string;
};

export const MINIGAME_MEMBERS: MinigameMember[] = [
  { key: 'doyeon', name: '도연', initial: '도', colorClass: 'bg-member-doyeon', colorHex: '#3366ff' },
  { key: 'seojun', name: '서준', initial: '서', colorClass: 'bg-member-seojun', colorHex: '#6541f2' },
  { key: 'hayeong', name: '하영', initial: '하', colorClass: 'bg-member-hayeong', colorHex: '#00bdde' },
  { key: 'minjae', name: '민재', initial: '민', colorClass: 'bg-member-minjae', colorHex: '#ff9200' },
];

/** 룰렛 세그먼트 시계방향(12시 기준): 민재 → 도연 → 서준 → 하영 */
export const ROULETTE_SEGMENT_ORDER: MemberKey[] = ['minjae', 'doyeon', 'seojun', 'hayeong'];

export const MIN_PARTICIPANTS = 2;
export const MAX_PARTICIPANTS = 4;

export const GAMES = [
  {
    slug: 'roulette',
    title: '벌칙 룰렛',
    description: '커피 쏘기 · 짐 들기 — 꽝 1명 뽑기',
    emoji: '🎯',
    iconBg: 'bg-[#edf0fa]',
  },
  {
    slug: 'ladder',
    title: '사다리타기',
    description: '인원 골라서 꽝 1명 · 순서 정하기',
    emoji: '🪜',
    iconBg: 'bg-warning-100',
  },
] as const;

/** 사다리 가로줄: fromCol → fromCol+1, y는 보드 내부 비율(세로선 영역 기준) */
export const LADDER_RUNGS = [
  { fromCol: 0, y: 0.23 },
  { fromCol: 2, y: 0.14 },
  { fromCol: 1, y: 0.41 },
  { fromCol: 0, y: 0.59 },
  { fromCol: 1, y: 0.77 },
] as const;
