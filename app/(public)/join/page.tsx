import { Suspense } from 'react';

import { JoinTripScreen } from '@/features/trip';

const JoinTripPage = () => {
  return (
    <Suspense
      fallback={
        <div className="bg-surface-gray flex min-h-dvh items-center justify-center text-sm text-[rgba(55,56,60,0.61)]">
          참여 화면을 불러오는 중…
        </div>
      }
    >
      <JoinTripScreen />
    </Suspense>
  );
};

export default JoinTripPage;
