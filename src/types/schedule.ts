import { ScheduleEvent, ViewType } from './api';

export interface EventCardProps {
  event: ScheduleEvent;
}

export interface EventListProps {
  events: ScheduleEvent[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
}

export interface CalendarViewProps {
  viewType: ViewType;
  selectedDate: Date;
  selectedWeek: number;
  selectedMonth: number;
  selectedYear: number;
  events: ScheduleEvent[];
  onDateSelect: (date: Date) => void;
}
