export type ClosedReason = 'weekend' | 'hours';

export interface CurrentInfo {
  dayOfWeek: string;
  periods: number[] | null;
  label: string;
  isOpen: boolean;
  closedReason?: ClosedReason;
}

export interface DevOverride {
  day: number;
  totalMin: number;
}
