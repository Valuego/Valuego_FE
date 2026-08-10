import Image from 'next/image';

import { cn } from '@/shared/lib/cn';

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
};

export const BrandLogo = ({ className, priority = false }: BrandLogoProps) => {
  return (
    <Image
      src="/brand/logo-gachigaja.svg"
      alt="가치가자"
      width={287}
      height={104}
      priority={priority}
      className={cn('h-[104px] w-[287px] object-contain', className)}
    />
  );
};
