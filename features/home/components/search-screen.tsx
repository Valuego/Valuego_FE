'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { buildTripHref, groupToTrip, rememberActiveTrip, useMyGroupsQuery } from '@/features/trip';
import { Header } from '@/shared/components/header';
import { MobileShell } from '@/shared/components/mobile-shell';
import { TabBar } from '@/shared/components/tab-bar';
import { TextField } from '@/shared/components/text-field';
import { getErrorMessage } from '@/shared/lib/api';

export const SearchScreen = () => {
  const groupsQuery = useMyGroupsQuery();
  const [query, setQuery] = useState('');
  const trips = useMemo(() => {
    const ongoing = (groupsQuery.data?.ongoingGroups ?? []).map((group) => groupToTrip(group));
    const past = (groupsQuery.data?.pastGroups ?? []).map((group) => groupToTrip(group));
    return [...ongoing, ...past];
  }, [groupsQuery.data]);

  const keyword = query.trim().toLowerCase();
  const results = keyword
    ? trips.filter((trip) => `${trip.title} ${trip.destination}`.toLowerCase().includes(keyword))
    : trips;

  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col gap-4 px-5 pt-4 pb-4">
        <Header title="검색" />
        <TextField
          label="여행 검색"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="도시나 여행 이름"
        />
        {groupsQuery.isError ? (
          <p className="text-sm font-medium text-[#e08300]">{getErrorMessage(groupsQuery.error)}</p>
        ) : null}
        {groupsQuery.isPending ? (
          <p className="text-text-secondary-soft text-sm font-medium">여행을 불러오는 중…</p>
        ) : null}
        {results.length === 0 && !groupsQuery.isPending ? (
          <p className="text-text-secondary-soft text-sm font-medium">맞는 여행이 없어요.</p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {results.map((trip) => (
              <li key={trip.id}>
                <Link
                  href={buildTripHref(trip.id, 'schedule')}
                  className="border-line-hairline flex flex-col gap-1 rounded-2xl border bg-white px-4 py-3.5"
                  onClick={() => rememberActiveTrip(trip.id)}
                >
                  <span className="text-ink-900 text-sm font-bold">{trip.title}</span>
                  <span className="text-text-secondary-soft text-xs font-medium">
                    {trip.destination} · {trip.dateLabel}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <TabBar />
    </MobileShell>
  );
};
