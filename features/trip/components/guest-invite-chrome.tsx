'use client';

import { Avatar } from '@/shared/components/avatar';
import { cn } from '@/shared/lib/cn';
import type { TripMember } from '@/shared/session';

type GuestMemberBadgeProps = {
  members: TripMember[];
  memberCount: number;
};

export const GuestMemberBadge = ({ members, memberCount }: GuestMemberBadgeProps) => {
  const joinedCount = members.length;

  return (
    <div className="flex h-11 items-center gap-2 rounded-full bg-[rgba(51,102,255,0.12)] px-3 py-2">
      <div className="flex items-center">
        {members.slice(0, 4).map((member, index) => (
          <Avatar
            key={member.id}
            member={member.member}
            size="sm"
            initial={member.name.slice(0, 1)}
            className={cn('size-6 text-xs font-medium', index === 0 ? '' : '-ml-2')}
          />
        ))}
      </div>
      <p className="text-brand-blue text-[11.5px] font-bold whitespace-nowrap">
        {joinedCount}/{memberCount} 참여
      </p>
    </div>
  );
};
