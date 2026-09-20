import { Suspense } from 'react';

import { BlindValueScreen } from '@/features/trip';

type ValuesPageProps = {
  params: Promise<{ id: string }>;
};

const ValuesPage = async ({ params }: ValuesPageProps) => {
  const { id } = await params;
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-[#191627] text-sm text-[#c9bcff]">
          수고 가치를 불러오는 중…
        </div>
      }
    >
      <BlindValueScreen tripId={id} />
    </Suspense>
  );
};

export default ValuesPage;
