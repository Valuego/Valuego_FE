import type { MemberKey } from '@/shared/session';

import type { MemberColor } from './trip.types';

export const GUEST_COLOR_OPTIONS: {
  color: MemberColor;
  member: MemberKey;
  className: string;
}[] = [
  { color: 'BLUE', member: 'doyeon', className: 'bg-member-doyeon' },
  { color: 'PURPLE', member: 'seojun', className: 'bg-member-seojun' },
  { color: 'SKYBLUE', member: 'hayeong', className: 'bg-member-hayeong' },
  { color: 'ORANGE', member: 'minjae', className: 'bg-member-minjae' },
];

export const PLACE_TYPE_STYLE: Record<
  string,
  { label: string; emoji: string; pillClassName: string; thumbClassName: string }
> = {
  이동: {
    label: '이동',
    emoji: '🚄',
    pillClassName: 'bg-[rgba(112,115,132,0.08)] text-text-secondary-soft',
    thumbClassName: 'bg-[#eaf6ec]',
  },
  관광: {
    label: '관광',
    emoji: '🏘️',
    pillClassName: 'bg-brand-blue/8 text-brand-blue',
    thumbClassName: 'bg-[#edf0fa]',
  },
  식사: {
    label: '식사',
    emoji: '🍜',
    pillClassName: 'bg-[rgba(255,146,0,0.1)] text-[#e08300]',
    thumbClassName: 'bg-[#fff3db]',
  },
};

export const DEFAULT_PLACE_TYPE_STYLE = {
  label: '장소',
  emoji: '📍',
  pillClassName: 'bg-brand-blue/8 text-brand-blue',
  thumbClassName: 'bg-[#edf0fa]',
};

export const INVITE_HIGHLIGHTS = [
  { id: 'ai', label: 'AI가 짜는 우리 그룹 맞춤 일정' },
  { id: 'game', label: '애매한 결정은 게임으로' },
  { id: 'settle', label: '보이지 않는 수고까지 정산' },
] as const;
