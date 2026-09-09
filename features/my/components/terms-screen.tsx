'use client';

import { Header } from '@/shared/components/header';
import { MobileShell } from '@/shared/components/mobile-shell';

export const TermsScreen = () => {
  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col gap-4 px-5 pt-4 pb-8">
        <Header title="약관·개인정보" />
        <section className="border-line-hairline flex flex-col gap-3 rounded-2xl border bg-white px-5 py-5">
          <h2 className="text-ink-900 text-base font-bold">서비스 이용약관</h2>
          <p className="text-text-secondary-soft text-sm leading-[1.5] font-medium">
            가치가자(Valuego)는 친구들과 우정여행을 계획하고, 일정·게임·정산을 함께 쓰는 서비스입니다. 계정을 만들거나
            카카오 로그인을 하면 본 약관에 동의하게 됩니다.
          </p>
        </section>
        <section className="border-line-hairline flex flex-col gap-3 rounded-2xl border bg-white px-5 py-5">
          <h2 className="text-ink-900 text-base font-bold">개인정보 처리방침</h2>
          <p className="text-text-secondary-soft text-sm leading-[1.5] font-medium">
            서비스 제공을 위해 닉네임, 이메일, 프로필 색상, 여행 그룹 정보를 수집합니다. 카카오 로그인을 쓰는 경우
            카카오가 제공하는 계정 정보를 받아 회원 식별에만 사용합니다.
          </p>
          <p className="text-text-secondary-soft text-sm leading-[1.5] font-medium">
            수집한 정보는 여행 그룹 운영과 정산 기록 외에 쓰지 않으며, 회원 탈퇴 또는 보관 기간이 끝나면 지웁니다.
          </p>
        </section>
      </div>
    </MobileShell>
  );
};
