import { Header } from '@/shared/components/header';
import { MobileShell } from '@/shared/components/mobile-shell';

const TAGS = ['#부지런', '#맛집헌터', '#가성비'] as const;

const ROWS = [
  { label: '활동 강도', value: '알차게 (4/5)' },
  { label: '예산 감각', value: '적당히' },
  { label: '선호 음식', value: '한식 · 카페' },
] as const;

export const PersonalityCardScreen = () => {
  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col gap-4 px-5 pt-4">
        <Header title="내 성향 카드" />

        <section className="border-line-hairline rounded-2xl border bg-white px-6 py-7">
          <p className="text-text-secondary-soft text-[12.5px] font-bold">나의 여행 DNA</p>
          <h2 className="text-ink-900 mt-2 text-[22px] font-bold tracking-[-0.5px]">액티비티 러버</h2>
          <p className="text-text-body mt-3 text-sm font-medium">알찬 일정을 좋아하고, 맛집은 꼭 들르는 타입</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {TAGS.map((tag) => (
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
          {ROWS.map((row, index) => (
            <li
              key={row.label}
              className={`flex h-[62px] items-center justify-between px-[18px] ${
                index < ROWS.length - 1 ? 'border-line-hairline border-b' : ''
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
