import Image from 'next/image';

import { cn } from '@/shared/lib/cn';

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
};

export const BrandLogo = ({ className, priority = false }: BrandLogoProps) => {
  return (
    <Image
      src="/logo.svg"
      alt="가치가자"
      width={104}
      height={104}
      priority={priority}
      className={cn('h-[104px] w-[104px] object-contain', className)}
    />
  );
};
