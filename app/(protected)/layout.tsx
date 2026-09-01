import type { ReactNode } from 'react';

import { RequireAuth } from '@/shared/components/require-auth';

const ProtectedLayout = ({ children }: { children: ReactNode }) => {
  return <RequireAuth>{children}</RequireAuth>;
};

export default ProtectedLayout;
