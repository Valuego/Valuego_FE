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

/** 사다리 가로줄 y 오프셋 패턴(보드 내부 비율, 세로선 영역 기준) — 컬럼 간격마다 순환 적용 */
const LADDER_RUNG_Y_PATTERN = [0.23, 0.41, 0.59, 0.77, 0.14, 0.32, 0.5, 0.68, 0.86] as const;

/** 참가자 수(컬럼 수)에 맞춰 인접한 컬럼마다 최소 1개의 가로줄을 생성한다 (2~8명 대응) */
export const buildLadderRungs = (colCount: number): { fromCol: number; y: number }[] =>
  Array.from({ length: Math.max(colCount - 1, 0) }, (_, fromCol) => ({
    fromCol,
    y: LADDER_RUNG_Y_PATTERN[fromCol % LADDER_RUNG_Y_PATTERN.length],
  }));
