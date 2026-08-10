'use client';

import { useState } from 'react';

import { Avatar } from '@/shared/components/avatar';
import { BottomSheet } from '@/shared/components/bottom-sheet';
import { Button } from '@/shared/components/button';
import { Chip } from '@/shared/components/chip';
import { DatePicker } from '@/shared/components/date-picker';
import { Header } from '@/shared/components/header';
import { InfoBanner } from '@/shared/components/info-banner';
import { MobileShell } from '@/shared/components/mobile-shell';
import { ProgressBar } from '@/shared/components/progress-bar';
import { Slider } from '@/shared/components/slider';
import { TextField } from '@/shared/components/text-field';
import { Toggle } from '@/shared/components/toggle';

const ComponentsPage = () => {
  const [toggleOn, setToggleOn] = useState(true);
  const [chipSelected, setChipSelected] = useState(true);
  const [sliderValue, setSliderValue] = useState(52);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [nickname, setNickname] = useState('');

  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-col gap-8 px-5 py-6">
        <Header title="공통 컴포넌트" onBack={() => history.back()} />

        <section className="flex flex-col gap-3">
          <h2 className="text-ink-900 text-base font-bold">Button</h2>
          <div className="flex flex-col gap-2">
            <Button variant="primary" fullWidth>
              다음으로
            </Button>
            <Button variant="dark" fullWidth>
              다음으로
            </Button>
            <Button variant="success" fullWidth>
              다음으로
            </Button>
            <Button variant="outline" fullWidth>
              다음으로
            </Button>
            <Button variant="ghost" fullWidth>
              다음으로
            </Button>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-ink-900 text-base font-bold">Avatar</h2>
          <div className="flex gap-3">
            <Avatar member="doyeon" />
            <Avatar member="seojun" />
            <Avatar member="hayeong" />
            <Avatar member="minjae" />
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-ink-900 text-base font-bold">Chip</h2>
          <div className="flex flex-wrap gap-2">
            <Chip label="부산" accent="blue" selected={chipSelected} onClick={() => setChipSelected((prev) => !prev)} />
            <Chip label="부산" accent="blue" selected={false} />
            <Chip label="부산" accent="purple" selected />
            <Chip label="부산" accent="purple" selected={false} />
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-ink-900 text-base font-bold">Info Banner</h2>
          <InfoBanner accent="blue" message="안내 메시지를 입력하세요" />
          <InfoBanner accent="green" message="안내 메시지를 입력하세요" />
          <InfoBanner accent="purple" message="안내 메시지를 입력하세요" />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-ink-900 text-base font-bold">Progress / Slider / Toggle</h2>
          <ProgressBar value={52} />
          <Slider value={sliderValue} onValueChange={setSliderValue} />
          <div className="flex items-center gap-3">
            <Toggle checked={toggleOn} onCheckedChange={setToggleOn} />
            <Toggle checked={!toggleOn} onCheckedChange={(checked) => setToggleOn(!checked)} />
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-ink-900 text-base font-bold">Text Field</h2>
          <TextField
            label="이름 또는 별명"
            placeholder="닉네임을 입력하세요"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
          />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-ink-900 text-base font-bold">Bottom Sheet</h2>
          <Button variant="primary" fullWidth onClick={() => setSheetOpen(true)}>
            바텀시트 열기
          </Button>
        </section>

        <section className="flex flex-col gap-3 pb-10">
          <h2 className="text-ink-900 text-base font-bold">Date Picker</h2>
          <DatePicker mode="day" />
          <DatePicker mode="period" />
        </section>
      </div>

      <BottomSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title="말로 일정 수정하기"
        description={`예) "둘째 날 저녁은 해산물로 바꿔줘"`}
      >
        <TextField label="수정 내용" placeholder="수정할 내용을 입력하세요" />
      </BottomSheet>
    </MobileShell>
  );
};

export default ComponentsPage;
