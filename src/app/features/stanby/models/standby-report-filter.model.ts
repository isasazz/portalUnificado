export type StandbyReportFilterMode = 'month' | 'range';

export interface StandbyReportMonthFilter {
  mode: 'month';
  year: number;
  /** 0–11, igual que Date#getMonth() */
  month: number;
}

export interface StandbyReportRangeFilter {
  mode: 'range';
  from: Date;
  to: Date;
}

export type StandbyReportFilter =
  | StandbyReportMonthFilter
  | StandbyReportRangeFilter;
