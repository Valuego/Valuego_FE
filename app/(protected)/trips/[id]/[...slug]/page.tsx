import { redirect } from 'next/navigation';

import { LadderScreen, MinigameHubScreen, RouletteScreen } from '@/features/minigame';
import {
  BlindValueScreen,
  ExpenseRecordScreen,
  InviteScreen,
  LaborResultScreen,
  LaborReviewScreen,
  PlaceDetailScreen,
  RecapCardScreen,
  RolesScreen,
  ScheduleScreen,
  SettlementBoardScreen,
  SettlementStartScreen,
  SettlementStatusScreen,
  TimelineScreen,
  TodosScreen,
} from '@/features/trip';

type TripCatchAllPageProps = {
  params: Promise<{ id: string; slug: string[] }>;
};

const TripCatchAllPage = async ({ params }: TripCatchAllPageProps) => {
  const { id, slug } = await params;
  const [section, sub] = slug;

  if (section === 'schedule' && sub) {
    return <PlaceDetailScreen tripId={id} placeId={sub} />;
  }
  if (section === 'schedule' || section === 'j') {
    return <ScheduleScreen tripId={id} />;
  }
  if (section === 'invite') {
    return <InviteScreen tripId={id} />;
  }
  if (section === 'games' && sub === 'roulette') {
    return <RouletteScreen tripId={id} />;
  }
  if (section === 'games' && sub === 'ladder') {
    return <LadderScreen tripId={id} />;
  }
  if (section === 'games') {
    return <MinigameHubScreen tripId={id} />;
  }
  if (section === 'roles') {
    return <RolesScreen tripId={id} />;
  }
  if (section === 'todos') {
    return <TodosScreen tripId={id} />;
  }
  if (section === 'timeline') {
    return <TimelineScreen tripId={id} />;
  }
  if (section === 'expenses') {
    return <ExpenseRecordScreen tripId={id} />;
  }
  if (section === 'settlement' && sub === 'labor') {
    return <LaborReviewScreen tripId={id} />;
  }
  if (section === 'settlement' && sub === 'values') {
    return <BlindValueScreen tripId={id} />;
  }
  if (section === 'settlement' && sub === 'status') {
    return <SettlementStatusScreen tripId={id} />;
  }
  if (section === 'settlement' && sub === 'result') {
    return <LaborResultScreen tripId={id} />;
  }
  if (section === 'settlement' && sub === 'board') {
    return <SettlementBoardScreen tripId={id} />;
  }
  if (section === 'settlement' && sub === 'recap') {
    return <RecapCardScreen tripId={id} />;
  }
  if (section === 'settlement') {
    return <SettlementStartScreen tripId={id} />;
  }

  redirect(`/trips/${encodeURIComponent(id)}`);
};

export default TripCatchAllPage;
