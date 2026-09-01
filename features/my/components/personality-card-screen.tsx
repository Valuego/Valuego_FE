'use client';

import { Header } from '@/shared/components/header';
import { MobileShell } from '@/shared/components/mobile-shell';
import { TabBar } from '@/shared/components/tab-bar';
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
  const foods = draft?.foods?.length ? draft.foods.join(' · ') : '한식 · 카페';
  const activity = draft?.activity ?? 52;

  const rows = [
    { label: '활동 강도', value: activityLabel(activity), valueClassName: 'text-brand-blue' },
    { label: '예산 감각', value: budget, valueClassName: 'text-brand-success' },
    { label: '선호 음식', value: foods, valueClassName: 'text-member-minjae' },
  ] as const;

  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col gap-4 px-5 pt-4 pb-4">
        <Header title="내 성향 카드" />

        <section
          className="flex flex-col gap-3 rounded-2xl px-6 py-7"
          style={{
            backgroundImage: 'linear-gradient(140deg, #3366ff 2%, #4b93ff 82%)',
          }}
        >
          <p className="text-[12.5px] font-bold tracking-[1px] text-white/80">나의 여행 DNA</p>
          <h2 className="text-[26px] font-extrabold tracking-[-0.5px] text-white">{user.personalityTitle}</h2>
          <p className="text-sm font-medium text-white/85">{user.personalityDescription}</p>
          <div className="flex flex-wrap gap-2">
            {user.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-white/20 px-[11px] py-1.5 text-[11.5px] font-bold text-white">
                {tag}
              </span>
            ))}
          </div>
        </section>

        <ul className="flex flex-col gap-3">
          {rows.map((row) => (
            <li
              key={row.label}
              className="border-line-hairline flex h-[62px] items-center justify-between rounded-xl border bg-white px-[18px]"
            >
              <span className="text-text-secondary-soft text-sm font-medium">{row.label}</span>
              <span className={`text-sm font-medium ${row.valueClassName}`}>{row.value}</span>
            </li>
          ))}
        </ul>
      </div>
      <TabBar />
    </MobileShell>
  );
};
