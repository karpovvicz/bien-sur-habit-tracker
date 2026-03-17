export type DayRecord = {
  date: string;
  completed: boolean;
  completedAt: string | null;
};

export type TrackerState = {
  records: Record<string, DayRecord>;
  commitment: string;
};