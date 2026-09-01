'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/shared/components/button';
import { Header } from '@/shared/components/header';
import { MobileShell } from '@/shared/components/mobile-shell';
import { TextField } from '@/shared/components/text-field';
import { addTripTodo, toggleTripTodo, useTripById } from '@/shared/session';

type TodosScreenProps = {
  tripId: string;
};

export const TodosScreen = ({ tripId }: TodosScreenProps) => {
  const router = useRouter();
  const trip = useTripById(tripId);
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (!trip) {
      router.replace('/home');
    }
  }, [router, trip]);

  if (!trip) {
    return null;
  }

  const doneCount = trip.todos.filter((todo) => todo.done).length;

  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col gap-4 px-5 pt-3 pb-28">
        <Header title="개인 할일" onBack={() => router.push(`/trips/${tripId}`)} />
        <p className="text-text-secondary-soft text-sm font-medium">
          {doneCount}/{trip.todos.length} 완료
        </p>

        <ul className="flex flex-col gap-2.5">
          {trip.todos.map((todo) => (
            <li key={todo.id}>
              <button
                type="button"
                onClick={() => toggleTripTodo(tripId, todo.id)}
                className="border-line-hairline flex w-full items-center gap-3 rounded-2xl border bg-white px-4 py-3.5 text-left"
              >
                <span
                  className={`flex size-6 items-center justify-center rounded-full text-xs font-bold text-white ${
                    todo.done ? 'bg-brand-success' : 'bg-[rgba(112,115,132,0.28)]'
                  }`}
                >
                  {todo.done ? '✓' : ''}
                </span>
                <span
                  className={`text-sm font-bold ${todo.done ? 'text-text-secondary-soft line-through' : 'text-ink-900'}`}
                >
                  {todo.title}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <TextField
          label="할일 추가"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="예: 렌터카 보험 확인"
        />
      </div>
      <div className="bg-surface-gray fixed right-0 bottom-0 left-0 mx-auto w-full max-w-[430px] px-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <Button
          variant="primary"
          fullWidth
          onClick={() => {
            addTripTodo(tripId, title);
            setTitle('');
          }}
        >
          할일 추가
        </Button>
      </div>
    </MobileShell>
  );
};
