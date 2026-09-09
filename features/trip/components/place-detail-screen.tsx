'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Button } from '@/shared/components/button';
import { Header } from '@/shared/components/header';
import { MobileShell } from '@/shared/components/mobile-shell';
import { getErrorMessage } from '@/shared/lib/api';
import { cn } from '@/shared/lib/cn';

import type { PlaceVoteStatus, SchedulePlace } from '../trip.types';

import {
  usePlaceCommentsQuery,
  usePlaceVoteQuery,
  useScheduleQuery,
  useTogglePlaceVote,
  useTripView,
} from '../trip.hooks';
import { formatVisitTime, getPlaceTypeStyle } from '../trip.lib';

type PlaceDetailScreenProps = {
  tripId: string;
  placeId: string;
};

const findPlace = (days: { places: SchedulePlace[] }[] | undefined, placeId: number) => {
  if (!days) {
    return null;
  }
  for (const day of days) {
    const matched = day.places.find((place) => place.travelPlaceId === placeId);
    if (matched) {
      return matched;
    }
  }
  return null;
};

export const PlaceDetailScreen = ({ tripId, placeId }: PlaceDetailScreenProps) => {
  const router = useRouter();
  const parsedPlaceId = Number(placeId);
  const { trip, isGuest } = useTripView(tripId);
  const scheduleQuery = useScheduleQuery(tripId);
  const voteQuery = usePlaceVoteQuery(parsedPlaceId);
  const commentsQuery = usePlaceCommentsQuery(parsedPlaceId);
  const toggleVote = useTogglePlaceVote(parsedPlaceId);
  const place = findPlace(scheduleQuery.data?.days, parsedPlaceId);
  const typeStyle = getPlaceTypeStyle(place?.placeType);
  const vote = voteQuery.data;

  const handleVote = (voteStatus: PlaceVoteStatus) => {
    void toggleVote.mutateAsync(voteStatus);
  };

  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col gap-4 px-5 pt-3 pb-28">
        <Header title={place?.name ?? '경유지 상세'} onBack={() => router.push(`/trips/${tripId}/schedule`)} />

        {scheduleQuery.isPending ? (
          <p className="text-text-secondary-soft text-sm font-medium">장소 정보를 불러오는 중…</p>
        ) : null}

        {place ? (
          <section className="border-line-hairline overflow-hidden rounded-2xl border bg-white">
            {place.imageUrl ? (
              <div className="relative h-40 w-full">
                <Image
                  src={place.imageUrl}
                  alt={place.name ?? '장소 이미지'}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            ) : (
              <div className={cn('flex h-40 items-center justify-center text-5xl', typeStyle.thumbClassName)}>
                <span aria-hidden>{typeStyle.emoji}</span>
              </div>
            )}
            <div className="flex flex-col gap-2 px-[18px] py-4">
              <div className="flex items-center gap-2">
                <h2 className="text-ink-900 flex-1 text-[18px] font-bold">{place.name ?? '장소 정보 없음'}</h2>
                <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', typeStyle.pillClassName)}>
                  {typeStyle.label}
                </span>
              </div>
              <p className="text-text-secondary-soft text-sm font-medium">
                {formatVisitTime(place.visitTime)}
                {place.address ? ` · ${place.address}` : ''}
              </p>
              {place.reason ? (
                <p className="text-text-secondary-soft text-[12.5px] font-medium">{place.reason}</p>
              ) : null}
              {place.memoUrl ? (
                <p className="text-text-secondary-soft truncate text-xs font-medium">🔗 {place.memoUrl}</p>
              ) : null}
            </div>
          </section>
        ) : null}

        <section className="border-line-hairline rounded-2xl border bg-white p-[18px]">
          <p className="text-ink-900 text-sm font-bold">이 경유지 어때요?</p>
          <p className="text-text-secondary-soft mt-1 text-[12.5px] font-medium">
            좋아요/별로예요로 의견을 남겨 주세요.
          </p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              className={cn(
                'flex h-12 flex-1 items-center justify-center rounded-xl text-sm font-bold',
                vote?.voteStatus === 'LIKE'
                  ? 'bg-brand-blue text-white'
                  : 'border-line-hairline text-ink-900 border bg-white',
              )}
              disabled={toggleVote.isPending}
              onClick={() => handleVote('LIKE')}
            >
              👍 좋아요 {vote ? vote.likeCount : ''}
            </button>
            <button
              type="button"
              className={cn(
                'flex h-12 flex-1 items-center justify-center rounded-xl text-sm font-bold',
                vote?.voteStatus === 'DISLIKE'
                  ? 'bg-ink-900 text-white'
                  : 'border-line-hairline text-ink-900 border bg-white',
              )}
              disabled={toggleVote.isPending}
              onClick={() => handleVote('DISLIKE')}
            >
              👎 별로예요 {vote ? vote.dislikeCount : ''}
            </button>
          </div>
          {vote ? (
            <p className="text-text-secondary-soft mt-3 text-xs font-medium">
              {vote.totalGroupMemberCount}명 중 {vote.totalParticipantCount}명 참여 · 좋아요 {vote.likePercentage}%
            </p>
          ) : null}
          {toggleVote.isError ? (
            <p className="mt-2 text-sm font-medium text-[#e08300]">{getErrorMessage(toggleVote.error)}</p>
          ) : null}
        </section>

        <section className="border-line-hairline rounded-2xl border bg-white p-[18px]">
          <p className="text-ink-900 text-sm font-bold">의견 {commentsQuery.data?.commentCount ?? ''}</p>
          {commentsQuery.data?.comments.length ? (
            <ul className="mt-3 flex flex-col gap-3">
              {commentsQuery.data.comments.map((comment) => (
                <li key={comment.commentId} className="flex flex-col gap-1">
                  <p className="text-ink-900 text-sm font-bold">{comment.nickname ?? '멤버'}</p>
                  <p className="text-text-secondary-soft text-[13px] font-medium">{comment.content}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-text-secondary-soft mt-2 text-[12.5px] font-medium">
              {isGuest ? '아직 의견이 없어요. 호스트가 남긴 의견을 여기서 볼 수 있어요.' : '아직 의견이 없어요.'}
            </p>
          )}
        </section>
      </div>
      <div className="bg-surface-gray fixed right-0 bottom-0 left-0 mx-auto w-full max-w-[430px] px-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <Button
          variant="outline"
          fullWidth
          onClick={() => router.push(trip ? `/trips/${trip.id}` : `/trips/${tripId}`)}
        >
          대기실로
        </Button>
      </div>
    </MobileShell>
  );
};
