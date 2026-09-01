import { Suspense } from 'react';

import { KakaoCallbackScreen } from '@/features/auth';

const KakaoCallbackPage = () => {
  return (
    <Suspense
      fallback={
        <div className="bg-surface-gray flex min-h-dvh items-center justify-center text-sm text-[rgba(55,56,60,0.61)]">
          카카오 로그인 처리 중…
        </div>
      }
    >
      <KakaoCallbackScreen />
    </Suspense>
  );
};

export default KakaoCallbackPage;
