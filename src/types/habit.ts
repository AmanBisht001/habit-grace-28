export type HabitStatus = 'empty' | 'completed' | 'missed' | 'skipped';

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  monthlyGoal: number;
}

export interface HabitEntry {
  habitId: string;
  date: string; // YYYY-MM-DD format
  status: HabitStatus;
}

export interface HabitData {
  habits: Habit[];
  entries: Record<string, HabitStatus>; // key: `${habitId}-${date}`
}

export const DEFAULT_HABITS: Habit[] = [
  { id: 'wake-up', name: 'Wake up at 6AM', emoji: '⏰', monthlyGoal: 30 },
  { id: 'no-snooze', name: 'No Snoozing', emoji: '🚫', monthlyGoal: 30 },
  { id: 'water', name: 'Drink 3L Water', emoji: '💧', monthlyGoal: 30 },
  { id: 'gym', name: 'Gym Workout', emoji: '🏋️', monthlyGoal: 20 },
  { id: 'stretch', name: 'Stretching', emoji: '🧘', monthlyGoal: 30 },
  { id: 'read', name: 'Read 10 Pages', emoji: '📘', monthlyGoal: 30 },
  { id: 'meditate', name: 'Meditation', emoji: '🧠', monthlyGoal: 30 },
  { id: 'study', name: 'Study 1 Hour', emoji: '⭐', monthlyGoal: 25 },
  { id: 'skincare', name: 'Skincare Routine', emoji: '✨', monthlyGoal: 30 },
  { id: 'social-media', name: 'Limit Social Media', emoji: '📵', monthlyGoal: 30 },
  { id: 'no-alcohol', name: 'No Alcohol', emoji: '🚫', monthlyGoal: 30 },
  { id: 'expenses', name: 'Track Expenses', emoji: '💵', monthlyGoal: 30 },
];
