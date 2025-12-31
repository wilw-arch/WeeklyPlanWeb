export interface BigEvent {
  id: string;
  type: string;
  content: string;
  status: string;
}

export interface HabitItem {
  id: string;
  name: string;
  target: number;
  // Array of 7 booleans (Mon-Sun)
  days: boolean[];
  remarks: string;
}

export interface HabitCategory {
  name: string;
  items: HabitItem[];
}

export interface MetricItem {
  id: string;
  name: string;
  target: number;
  // Array of 7 numbers (Mon-Sun), null allows for empty cells
  days: (number | string)[]; 
  remarks: string;
}

export interface ReviewSection {
  input: string;
  output: string;
  keep: string;
  improve: string;
}

export interface WeekData {
  id: string; // ISO Date string of the Monday
  title: string; // e.g., "9月-周计划复盘"
  startDate: string; // ISO Date
  endDate: string; // ISO Date
  
  bigEvents: BigEvent[];
  habitCategories: HabitCategory[];
  metrics: MetricItem[];
  review: ReviewSection;
}

export const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];