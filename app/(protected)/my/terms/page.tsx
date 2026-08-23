import { Header } from '@/shared/components/header';
import { MobileShell } from '@/shared/components/mobile-shell';

const TermsPage = () => {
  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col gap-4 px-5 pt-4">
        <Header title="약관·개인정보" />
        <p className="text-text-secondary-soft text-sm leading-[1.5]">
          약관 및 개인정보 처리방침 내용은 추후 연동됩니다.
        </p>
      </div>
    </MobileShell>
  );
};

export default TermsPage;
