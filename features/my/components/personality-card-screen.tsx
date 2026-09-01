'use client';

import { Header } from '@/shared/components/header';
import { MobileShell } from '@/shared/components/mobile-shell';
import { useAppSession, useTripDraft } from '@/shared/session';

const activityLabel = (activity: number) => {
  if (activity >= 70) {
    return '알차게 (5/5)';
  }
  if (activity >= 45) {
    return '알차게 (4/5)';
  }
  return '여유롭게 (2/5)';
};

export const PersonalityCardScreen = () => {
  const session = useAppSession();
  const draft = useTripDraft();
  const user = session.user;
  const budget = draft?.budget ?? '적당히';
  const foods = draft?.foods?.join(' · ') ?? '한식 · 카페';
  const activity = draft?.activity ?? 52;

  const rows = [
    { label: '활동 강도', value: activityLabel(activity) },
    { label: '예산 감각', value: budget },
    { label: '선호 음식', value: foods },
  ] as const;

  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col gap-4 px-5 pt-4">
        <Header title="내 성향 카드" />

        <section className="border-line-hairline rounded-2xl border bg-white px-6 py-7">
          <p className="text-text-secondary-soft text-[12.5px] font-bold">나의 여행 DNA</p>
          <h2 className="text-ink-900 mt-2 text-[22px] font-bold tracking-[-0.5px]">{user.personalityTitle}</h2>
          <p className="text-text-body mt-3 text-sm font-medium">{user.personalityDescription}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {user.tags.map((tag) => (
              <span
                key={tag}
                className="bg-brand-blue/10 text-brand-blue rounded-full px-2.5 py-1.5 text-xs font-semibold"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>

        <ul className="border-line-hairline overflow-hidden rounded-2xl border bg-white">
          {rows.map((row, index) => (
            <li
              key={row.label}
              className={`flex h-[62px] items-center justify-between px-[18px] ${
                index < rows.length - 1 ? 'border-line-hairline border-b' : ''
              }`}
            >
              <span className="text-ink-900 text-sm font-medium">{row.label}</span>
              <span className="text-ink-900 text-sm font-bold">{row.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </MobileShell>
  );
};
