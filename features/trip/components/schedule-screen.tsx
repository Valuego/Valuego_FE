'use client';

import { useQueries } from '@tanstack/react-query';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import EditIcon from '@/shared/assets/icons/edit.svg';
import EllipsisVerticalIcon from '@/shared/assets/icons/ellipsis-vertical.svg';
import TrashIcon from '@/shared/assets/icons/trash.svg';
import { BottomSheet } from '@/shared/components/bottom-sheet';
import { Button } from '@/shared/components/button';
import { Header } from '@/shared/components/header';
import { KakaoMap } from '@/shared/components/kakao-map';
import { MobileShell } from '@/shared/components/mobile-shell';
import { TextField } from '@/shared/components/text-field';
import { getErrorMessage } from '@/shared/lib/api';
import { cn } from '@/shared/lib/cn';

import type { ScheduleDay, SchedulePlace } from '../trip.types';

import { placeVoteQueryOptions } from '../trip.api';
import {
  rememberActiveTrip,
  useConfirmSchedule,
  useCreatePlace,
  useDeletePlace,
  useScheduleQuery,
  useTripView,
  useUpdatePlace,
} from '../trip.hooks';
import {
  buildTripHref,
  formatDayChipDate,
  formatScheduleSummary,
  formatVisitTime,
  getDestinationMapCenter,
  getPlaceTypeStyle,
  isHostStyleComplete,
  isScheduleNotFound,
  parseGroupId,
} from '../trip.lib';

const EMPTY_DAYS: ScheduleDay[] = [];

type ScheduleScreenProps = {
  tripId: string;
};

type PlaceFormValue = {
  name: string;
  visitTime: string;
  memoUrl: string;
};

const EMPTY_FORM: PlaceFormValue = { name: '', visitTime: '', memoUrl: '' };

const toVisitTimePayload = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  return trimmed.length === 5 ? `${trimmed}:00` : trimmed;
};

export const ScheduleScreen = ({ tripId }: ScheduleScreenProps) => {
  const router = useRouter();
  const { trip, group, isGuest, isLoading: isTripLoading } = useTripView(tripId);
  const scheduleQuery = useScheduleQuery(tripId);
  const groupId = parseGroupId(tripId) ?? 0;
  const confirmSchedule = useConfirmSchedule(groupId);
  const createPlace = useCreatePlace(groupId);
  const updatePlace = useUpdatePlace(groupId);
  const deletePlace = useDeletePlace(groupId);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [editing, setEditing] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [sheetMode, setSheetMode] = useState<{ type: 'add' } | { type: 'edit'; place: SchedulePlace } | null>(null);
  const [formValue, setFormValue] = useState<PlaceFormValue>(EMPTY_FORM);
  const [placeError, setPlaceError] = useState<string | null>(null);
  const redirectedRef = useRef(false);

  useEffect(() => {
    rememberActiveTrip(tripId);
  }, [tripId]);

  const days = scheduleQuery.data?.days ?? EMPTY_DAYS;
  const activeDayNumber = selectedDay ?? days[0]?.dayNumber ?? 1;
  const activeDay = days.find((day) => day.dayNumber === activeDayNumber) ?? days[0];
  const voteQueries = useQueries({
    queries: (activeDay?.places ?? []).map((place) => placeVoteQueryOptions(place.travelPlaceId)),
  });
  const mapPlaces = (activeDay?.places ?? []).map((place) => ({
    id: place.travelPlaceId,
    lat: place.latitude,
    lng: place.longitude,
    name: place.name,
    address: place.address,
  }));

  const notFound =
    days.length === 0 &&
    (isScheduleNotFound(scheduleQuery.error) || (!scheduleQuery.isPending && !scheduleQuery.isError));
  const errorMessage = scheduleQuery.isError && !notFound ? getErrorMessage(scheduleQuery.error) : null;
  const totalDistance = activeDay?.totalDistanceKm;
  const isHost = !isGuest;
  const isConfirmable = isHost && trip?.phase !== 'ongoing' && trip?.phase !== 'settling' && trip?.phase !== 'settled';
  const canEditPlaces = Boolean(isConfirmable && activeDay && editing);

  useEffect(() => {
    if (redirectedRef.current || isGuest || isTripLoading || scheduleQuery.isPending || !trip) {
      return;
    }
    if (days.length > 0) {
      return;
    }
    if (scheduleQuery.isError && !isScheduleNotFound(scheduleQuery.error)) {
      return;
    }
    redirectedRef.current = true;
    router.replace(isHostStyleComplete(trip) ? buildTripHref(tripId, 'prep') : buildTripHref(tripId, 'style'));
  }, [
    days.length,
    isGuest,
    isTripLoading,
    router,
    scheduleQuery.error,
    scheduleQuery.isError,
    scheduleQuery.isPending,
    trip,
    tripId,
  ]);

  useEffect(() => {
    if (openMenuId === null) {
      return;
    }
    const closeMenu = () => setOpenMenuId(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, [openMenuId]);

  const handleConfirm = async () => {
    if (!groupId) {
      return;
    }
    setPlaceError(null);
    try {
      await confirmSchedule.mutateAsync();
      router.push(buildTripHref(tripId));
    } catch (error) {
      setPlaceError(getErrorMessage(error, '일정을 확정하지 못했어요.'));
    }
  };

  const openAddSheet = () => {
    setFormValue(EMPTY_FORM);
    setPlaceError(null);
    setOpenMenuId(null);
    setSheetMode({ type: 'add' });
  };

  const openEditSheet = (place: SchedulePlace) => {
    setFormValue({
      name: place.name ?? '',
      visitTime: formatVisitTime(place.visitTime) === '시간 미정' ? '' : formatVisitTime(place.visitTime),
      memoUrl: place.memoUrl ?? '',
    });
    setPlaceError(null);
    setOpenMenuId(null);
    setSheetMode({ type: 'edit', place });
  };

  const closeSheet = () => {
    setSheetMode(null);
    setPlaceError(null);
  };

  const handleSubmitPlace = async () => {
    if (!formValue.name.trim() || !sheetMode) {
      return;
    }
    setPlaceError(null);
    try {
      if (sheetMode.type === 'add') {
        if (!activeDay) {
          return;
        }
        await createPlace.mutateAsync({
          travelDayId: activeDay.travelDayId,
          scheduleOrder: activeDay.places.length + 1,
          customName: formValue.name.trim(),
          visitTime: toVisitTimePayload(formValue.visitTime),
          memoUrl: formValue.memoUrl.trim() || undefined,
        });
      } else {
        await updatePlace.mutateAsync({
          travelPlaceId: sheetMode.place.travelPlaceId,
          body: {
            customName: formValue.name.trim(),
            visitTime: toVisitTimePayload(formValue.visitTime),
            memoUrl: formValue.memoUrl.trim() || undefined,
          },
        });
      }
      closeSheet();
    } catch (error) {
      setPlaceError(getErrorMessage(error, '장소를 저장하지 못했어요.'));
    }
  };

  const handleDeletePlace = (travelPlaceId: number) => {
    setOpenMenuId(null);
    deletePlace.mutate(travelPlaceId);
  };

  const handleBack = () => {
    if (!trip) {
      router.push('/home');
      return;
    }
    if (trip.phase === 'ongoing' || trip.phase === 'settling') {
      router.push(buildTripHref(trip.id));
      return;
    }
    if (isGuest) {
      router.push('/home');
      return;
    }
    router.push(buildTripHref(trip.id, 'prep'));
  };

  if (isTripLoading || scheduleQuery.isPending) {
    return (
      <MobileShell className="bg-surface-gray">
        <div className="flex flex-1 items-center justify-center text-sm text-[rgba(55,56,60,0.61)]">
          일정을 불러오는 중…
        </div>
      </MobileShell>
    );
  }

  if (!isGuest && days.length === 0 && !errorMessage) {
    return (
      <MobileShell className="bg-surface-gray">
        <div className="flex flex-1 items-center justify-center text-sm text-[rgba(55,56,60,0.61)]">
          일정 조건으로 이동하는 중…
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col gap-3 px-5 pt-3 pb-28">
        <Header title={trip ? `${trip.destination} 일정 초안` : 'AI 일정'} onBack={handleBack} />

        {days.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto">
            {days.map((day) => {
              const isActive = day.dayNumber === activeDay?.dayNumber;
              const dateLabel = group?.startDate ? formatDayChipDate(group.startDate, day.dayNumber) : null;
              return (
                <button
                  key={`day-${day.dayNumber}`}
                  type="button"
                  className={cn(
                    'flex flex-col items-center gap-0.5 rounded-[11px] px-3.5 py-2',
                    isActive ? 'bg-ink-900 text-white' : 'bg-[rgba(112,115,132,0.08)] text-[rgba(46,47,51,0.88)]',
                  )}
                  onClick={() => setSelectedDay(day.dayNumber)}
                >
                  <span className="text-[13.5px] font-bold">Day {day.dayNumber}</span>
                  {dateLabel ? (
                    <span
                      className={cn(
                        'text-[10.5px] font-medium opacity-85',
                        isActive ? 'text-white' : 'text-text-secondary-soft',
                      )}
                    >
                      {dateLabel}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}

        {activeDay ? (
          <p className="text-ink-900 text-center text-sm font-medium">
            {formatScheduleSummary(activeDay.places.length, trip?.transport ?? 'car', totalDistance)}
          </p>
        ) : null}

        {activeDay ? (
          <KakaoMap
            places={mapPlaces}
            badge={`Day ${activeDay.dayNumber} · 경유지 ${activeDay.places.length}곳`}
            fallbackCenter={getDestinationMapCenter(trip?.destination)}
          />
        ) : null}

        {isGuest && notFound ? (
          <div className="border-line-hairline rounded-2xl border bg-white p-[18px]">
            <p className="text-ink-900 text-sm font-bold">아직 생성된 일정이 없어요</p>
            <p className="text-text-secondary-soft mt-1 text-[12.5px] font-medium">
              호스트가 일정을 만들면 여기서 구경할 수 있어요.
            </p>
          </div>
        ) : null}

        {errorMessage ? <p className="text-sm font-medium text-[#e08300]">{errorMessage}</p> : null}

        {activeDay ? (
          <ul className="flex flex-col gap-3">
            {activeDay.places.map((place, placeIndex) => {
              const typeStyle = getPlaceTypeStyle(place.placeType);
              const vote = voteQueries[placeIndex]?.data;
              return (
                <li key={place.travelPlaceId} className="relative flex items-start gap-2.5">
                  <p className="text-text-secondary-soft w-[38px] shrink-0 pt-4 text-right text-[11.5px] font-bold">
                    {formatVisitTime(place.visitTime)}
                  </p>
                  <div className="relative min-w-0 flex-1">
                    <button
                      type="button"
                      className="border-line-hairline flex w-full min-w-0 gap-3 rounded-[14px] border bg-white px-3.5 py-3 text-left"
                      onClick={() => router.push(buildTripHref(tripId, 'schedule', String(place.travelPlaceId)))}
                    >
                      {place.imageUrl ? (
                        <Image
                          src={place.imageUrl}
                          alt=""
                          width={80}
                          height={80}
                          unoptimized
                          className="size-20 shrink-0 rounded-[14px] object-cover"
                        />
                      ) : (
                        <div
                          className={cn(
                            'flex size-20 shrink-0 items-center justify-center rounded-[14px] text-[40px]',
                            typeStyle.thumbClassName,
                          )}
                        >
                          <span aria-hidden>{typeStyle.emoji}</span>
                        </div>
                      )}
                      <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <p className="text-ink-900 min-w-0 flex-1 truncate text-[14.5px] font-bold">
                            {place.name ?? '장소 정보 없음'}
                          </p>
                          <span
                            className={cn(
                              'shrink-0 rounded-full px-2.5 py-1 text-xs font-medium',
                              typeStyle.pillClassName,
                            )}
                          >
                            {typeStyle.label}
                          </span>
                          {canEditPlaces ? <span className="size-6 shrink-0" aria-hidden /> : null}
                        </div>
                        {place.address ? (
                          <p className="text-text-secondary-soft truncate text-xs font-medium">{place.address}</p>
                        ) : null}
                        {vote ? (
                          <div className="flex items-center gap-1.5">
                            <span className="rounded-full bg-[rgba(112,115,132,0.06)] px-2 py-1 text-[11px] font-semibold text-[rgba(55,56,60,0.61)]">
                              👍 {vote.likeCount}
                            </span>
                            <span className="rounded-full bg-[rgba(112,115,132,0.06)] px-2 py-1 text-[11px] font-semibold text-[rgba(55,56,60,0.61)]">
                              👎 {vote.dislikeCount}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </button>
                    {canEditPlaces ? (
                      <button
                        type="button"
                        aria-label="장소 메뉴"
                        className="absolute top-2 right-2 flex size-6 items-center justify-center"
                        onClick={(event) => {
                          event.stopPropagation();
                          setOpenMenuId((current) => (current === place.travelPlaceId ? null : place.travelPlaceId));
                        }}
                      >
                        <EllipsisVerticalIcon aria-hidden />
                      </button>
                    ) : null}
                    {openMenuId === place.travelPlaceId ? (
                      <div
                        className="absolute top-9 right-1 z-10 flex min-w-[160px] flex-col overflow-hidden rounded-lg border border-[#e5e7eb] bg-white p-2 shadow-[0px_4px_12px_rgba(23,23,25,0.12)]"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <button
                          type="button"
                          className="flex h-12 w-full items-center justify-between rounded-md px-4 text-left text-base text-[#111827]"
                          onClick={() => openEditSheet(place)}
                        >
                          수정
                          <EditIcon aria-hidden />
                        </button>
                        <button
                          type="button"
                          className="flex h-12 w-full items-center justify-between rounded-md px-4 text-left text-base text-[#111827]"
                          onClick={() => handleDeletePlace(place.travelPlaceId)}
                        >
                          삭제
                          <TrashIcon aria-hidden />
                        </button>
                      </div>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}

        {canEditPlaces ? (
          <button
            type="button"
            className="ml-12 rounded-[14px] border border-[#4164ff] bg-[#edf0fa] px-3.5 py-3 text-center text-[14.5px] font-bold text-[#3366ff]"
            onClick={openAddSheet}
          >
            장소 직접 추가
          </button>
        ) : null}
      </div>

      <div className="border-line-hairline fixed right-0 bottom-0 left-0 mx-auto flex w-full max-w-[430px] flex-col gap-2 border-t bg-white px-5 pt-3 pb-[calc(20px+env(safe-area-inset-bottom))]">
        {isConfirmable ? (
          <>
            {placeError ? <p className="text-sm font-medium text-[#e08300]">{placeError}</p> : null}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-brand-blue text-brand-blue flex-1 border-[1.5px] text-base"
                onClick={() => setEditing((prev) => !prev)}
              >
                일정 수정
              </Button>
              <Button
                variant="primary"
                className="flex-1 text-base"
                disabled={days.length === 0 || confirmSchedule.isPending}
                onClick={() => void handleConfirm()}
              >
                {confirmSchedule.isPending ? '확정하는 중…' : '이 일정으로 확정'}
              </Button>
            </div>
          </>
        ) : isGuest ? (
          <Button variant="primary" fullWidth onClick={() => router.push('/home')}>
            홈으로
          </Button>
        ) : (
          <Button variant="primary" fullWidth onClick={() => router.push(buildTripHref(tripId))}>
            여행 중 홈으로
          </Button>
        )}
      </div>

      <BottomSheet
        open={sheetMode !== null}
        title={sheetMode?.type === 'add' ? '장소 직접 추가' : '장소 정보 수정'}
        onOpenChange={(open) => {
          if (!open) {
            closeSheet();
          }
        }}
      >
        <div className="flex flex-col gap-3">
          <TextField
            label="장소 이름"
            value={formValue.name}
            placeholder="예: 흰여울문화마을"
            onChange={(event) => setFormValue((prev) => ({ ...prev, name: event.target.value }))}
          />
          <TextField
            label="방문 시간 (선택)"
            value={formValue.visitTime}
            placeholder="예: 14:30"
            onChange={(event) => setFormValue((prev) => ({ ...prev, visitTime: event.target.value }))}
          />
          <TextField
            label="참고 링크 (선택)"
            value={formValue.memoUrl}
            placeholder="예: 네이버 지도 링크"
            onChange={(event) => setFormValue((prev) => ({ ...prev, memoUrl: event.target.value }))}
          />
          {placeError ? <p className="text-sm font-medium text-[#e08300]">{placeError}</p> : null}
          <Button
            variant="primary"
            fullWidth
            disabled={!formValue.name.trim() || createPlace.isPending || updatePlace.isPending}
            onClick={() => void handleSubmitPlace()}
          >
            {createPlace.isPending || updatePlace.isPending ? '저장하는 중…' : '저장하기'}
          </Button>
        </div>
      </BottomSheet>
    </MobileShell>
  );
};
