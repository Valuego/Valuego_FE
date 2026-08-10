export const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

export const startOfDay = (date: Date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

export const isSameDay = (a: Date | null | undefined, b: Date | null | undefined) => {
  if (!a || !b) {
    return false;
  }
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
};

export const isBeforeDay = (a: Date, b: Date) => startOfDay(a).getTime() < startOfDay(b).getTime();

export const isWithinRange = (date: Date, start: Date | null, end: Date | null) => {
  if (!start || !end) {
    return false;
  }
  const time = startOfDay(date).getTime();
  return time > startOfDay(start).getTime() && time < startOfDay(end).getTime();
};

export const formatDateDot = (date: Date | null) => {
  if (!date) {
    return '';
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};

export type CalendarCell = {
  key: string;
  date: Date;
  inCurrentMonth: boolean;
};

export const buildCalendarCells = (year: number, monthIndex: number): CalendarCell[] => {
  const firstDay = new Date(year, monthIndex, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const prevMonthDays = new Date(year, monthIndex, 0).getDate();

  const cells: CalendarCell[] = [];

  for (let index = 0; index < startWeekday; index += 1) {
    const day = prevMonthDays - startWeekday + index + 1;
    const date = new Date(year, monthIndex - 1, day);
    cells.push({
      key: `prev-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
      date,
      inCurrentMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, monthIndex, day);
    cells.push({
      key: `curr-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
      date,
      inCurrentMonth: true,
    });
  }

  while (cells.length % 7 !== 0 || cells.length < 42) {
    const day = cells.length - (startWeekday + daysInMonth) + 1;
    const date = new Date(year, monthIndex + 1, day);
    cells.push({
      key: `next-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
      date,
      inCurrentMonth: false,
    });
  }

  return cells;
};
