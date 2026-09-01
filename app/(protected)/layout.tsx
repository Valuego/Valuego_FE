import type { ReactNode } from 'react';

import { RequireAuth } from '@/features/auth';

const ProtectedLayout = ({ children }: { children: ReactNode }) => {
  return <RequireAuth>{children}</RequireAuth>;
};

export default ProtectedLayout;
