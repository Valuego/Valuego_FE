import { Header } from '@/shared/components/header';
import { MobileShell } from '@/shared/components/mobile-shell';
import { TabBar } from '@/shared/components/tab-bar';

const NotificationsPage = () => {
  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col gap-4 px-5 pt-4">
        <Header title="알림" />
        <p className="text-text-secondary-soft text-sm">알림 목록은 추후 구현됩니다.</p>
      </div>
      <TabBar />
    </MobileShell>
  );
};

export default NotificationsPage;
