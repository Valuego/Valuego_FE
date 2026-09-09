'use client';

import { Avatar } from '@/shared/components/avatar';
import { cn } from '@/shared/lib/cn';
import type { TripMember } from '@/shared/session';

type GuestUrlBarProps = {
  groupLink: string;
};

export const GuestUrlBar = ({ groupLink }: GuestUrlBarProps) => {
  const origin = typeof window === 'undefined' ? '' : window.location.host;

  return (
    <div className="bg-surface-gray px-4 pt-3">
      <div className="flex h-9 w-full items-center justify-center gap-1.5 overflow-hidden rounded-[10px] bg-white">
        <span className="text-[11px]" aria-hidden>
          🔒
        </span>
        <p className="text-text-secondary-soft truncate text-[12.5px] font-medium">
          {origin}/invite/{groupLink}
        </p>
      </div>
    </div>
  );
};

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
