import { useState, useEffect, useCallback } from 'react';
import { Habit, HabitData, HabitStatus, DEFAULT_HABITS } from '@/types/habit';

const STORAGE_KEY = 'habit-tracker-data';

const getInitialData = (): HabitData => {
  if (typeof window === 'undefined') {
    return { habits: DEFAULT_HABITS, entries: {} };
  }
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return { habits: DEFAULT_HABITS, entries: {} };
    }
  }
  return { habits: DEFAULT_HABITS, entries: {} };
};

export function useHabitData() {
  const [data, setData] = useState<HabitData>(getInitialData);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const updateHabit = useCallback((updatedHabit: Habit) => {
    setData((prev) => ({
      ...prev,
      habits: prev.habits.map((h) =>
        h.id === updatedHabit.id ? updatedHabit : h
      ),
    }));
  }, []);

  const toggleHabitStatus = useCallback((habitId: string, date: string) => {
    setData((prev) => {
      const key = `${habitId}-${date}`;
      const currentStatus = prev.entries[key] || 'empty';
      
      const statusCycle: HabitStatus[] = ['empty', 'completed', 'missed', 'skipped'];
      const currentIndex = statusCycle.indexOf(currentStatus);
      const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
      
      return {
        ...prev,
        entries: {
          ...prev.entries,
          [key]: nextStatus,
        },
      };
    });
  }, []);

  const setHabitStatus = useCallback((habitId: string, date: string, status: HabitStatus) => {
    setData((prev) => ({
      ...prev,
      entries: {
        ...prev.entries,
        [`${habitId}-${date}`]: status,
      },
    }));
  }, []);

  const getHabitStatus = useCallback((habitId: string, date: string): HabitStatus => {
    return data.entries[`${habitId}-${date}`] || 'empty';
  }, [data.entries]);

  const getHabitStats = useCallback((habitId: string, month: Date) => {
    const habit = data.habits.find(h => h.id === habitId);
    if (!habit) return { completed: 0, remaining: 0, percentage: 0 };

    const year = month.getFullYear();
    const monthNum = month.getMonth();
    const daysInMonth = new Date(year, monthNum + 1, 0).getDate();
    
    let completed = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(monthNum + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      if (data.entries[`${habitId}-${dateStr}`] === 'completed') {
        completed++;
      }
    }

    const remaining = Math.max(0, habit.monthlyGoal - completed);
    const percentage = Math.min(100, Math.round((completed / habit.monthlyGoal) * 100));

    return { completed, remaining, percentage };
  }, [data.habits, data.entries]);

  const getMonthlyStats = useCallback((month: Date) => {
    let totalCompleted = 0;
    let totalGoals = 0;

    data.habits.forEach(habit => {
      const stats = getHabitStats(habit.id, month);
      totalCompleted += stats.completed;
      totalGoals += habit.monthlyGoal;
    });

    const percentage = totalGoals > 0 ? Math.round((totalCompleted / totalGoals) * 100) : 0;
    return { totalCompleted, totalGoals, percentage };
  }, [data.habits, getHabitStats]);

  const getDailyStats = useCallback((month: Date) => {
    const year = month.getFullYear();
    const monthNum = month.getMonth();
    const daysInMonth = new Date(year, monthNum + 1, 0).getDate();
    const dailyData = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(monthNum + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      let completed = 0;
      
      data.habits.forEach(habit => {
        if (data.entries[`${habit.id}-${dateStr}`] === 'completed') {
          completed++;
        }
      });

      dailyData.push({
        day,
        date: dateStr,
        completed,
        total: data.habits.length,
        percentage: Math.round((completed / data.habits.length) * 100),
      });
    }

    return dailyData;
  }, [data.habits, data.entries]);

  const getWeeklyStats = useCallback((month: Date) => {
    const dailyStats = getDailyStats(month);
    const weeks = [];
    
    for (let i = 0; i < dailyStats.length; i += 7) {
      const weekDays = dailyStats.slice(i, i + 7);
      const weekCompleted = weekDays.reduce((sum, day) => sum + day.completed, 0);
      const weekTotal = weekDays.reduce((sum, day) => sum + day.total, 0);
      
      weeks.push({
        week: Math.floor(i / 7) + 1,
        completed: weekCompleted,
        total: weekTotal,
        percentage: Math.round((weekCompleted / weekTotal) * 100),
      });
    }

    return weeks;
  }, [getDailyStats]);

  const getTopHabits = useCallback((month: Date) => {
    return data.habits
      .map(habit => ({
        ...habit,
        ...getHabitStats(habit.id, month),
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5);
  }, [data.habits, getHabitStats]);

  return {
    habits: data.habits,
    updateHabit,
    toggleHabitStatus,
    setHabitStatus,
    getHabitStatus,
    getHabitStats,
    getMonthlyStats,
    getDailyStats,
    getWeeklyStats,
    getTopHabits,
  };
}
