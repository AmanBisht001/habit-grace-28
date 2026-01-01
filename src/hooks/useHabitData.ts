import { useState, useEffect, useCallback, useMemo } from 'react';
import { Habit, HabitData, HabitStatus, DEFAULT_HABITS } from '@/types/habit';
import { format, isBefore, isToday, parseISO, startOfDay, subDays, isAfter } from 'date-fns';

const STORAGE_KEY = 'habit-tracker-data';

const getTodayStr = () => format(new Date(), 'yyyy-MM-dd');

const getInitialData = (): HabitData => {
  if (typeof window === 'undefined') {
    return { habits: DEFAULT_HABITS, entries: {}, joinDate: getTodayStr() };
  }
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Ensure joinDate exists (migration for old data)
      if (!parsed.joinDate) {
        parsed.joinDate = getTodayStr();
      }
      return parsed;
    } catch {
      return { habits: DEFAULT_HABITS, entries: {}, joinDate: getTodayStr() };
    }
  }
  return { habits: DEFAULT_HABITS, entries: {}, joinDate: getTodayStr() };
};

export function useHabitData() {
  const [data, setData] = useState<HabitData>(getInitialData);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setLastSaved(new Date());
  }, [data]);

  const updateHabit = useCallback((updatedHabit: Habit) => {
    setData((prev) => ({
      ...prev,
      habits: prev.habits.map((h) =>
        h.id === updatedHabit.id ? updatedHabit : h
      ),
    }));
  }, []);

  const addHabit = useCallback((newHabit: Omit<Habit, 'id'>) => {
    const id = `habit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setData((prev) => ({
      ...prev,
      habits: [...prev.habits, { ...newHabit, id }],
    }));
  }, []);

  const removeHabit = useCallback((habitId: string) => {
    setData((prev) => {
      // Remove habit and all its entries
      const newEntries = { ...prev.entries };
      Object.keys(newEntries).forEach((key) => {
        if (key.startsWith(`${habitId}-`)) {
          delete newEntries[key];
        }
      });
      
      return {
        ...prev,
        habits: prev.habits.filter((h) => h.id !== habitId),
        entries: newEntries,
      };
    });
  }, []);

  const toggleHabitStatus = useCallback((habitId: string, date: string) => {
    setData((prev) => {
      const key = `${habitId}-${date}`;
      const currentStatus = prev.entries[key] || 'empty';
      
      // Don't allow changing paused status
      if (currentStatus === 'paused') return prev;
      
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
    const joinDate = parseISO(data.joinDate);
    const checkDate = parseISO(date);
    const today = startOfDay(new Date());
    
    // Before join date: paused
    if (isBefore(checkDate, startOfDay(joinDate))) {
      return 'paused';
    }
    
    const storedStatus = data.entries[`${habitId}-${date}`];
    
    // If there's a stored status, return it
    if (storedStatus) {
      return storedStatus;
    }
    
    // If the date is in the past (not today) and no status, mark as skipped
    if (isBefore(checkDate, today) && !isToday(checkDate)) {
      return 'skipped';
    }
    
    // Today or future: empty (pending)
    return 'empty';
  }, [data.entries, data.joinDate]);

  const isDateBeforeJoin = useCallback((date: string): boolean => {
    const joinDate = parseISO(data.joinDate);
    const checkDate = parseISO(date);
    return isBefore(checkDate, startOfDay(joinDate));
  }, [data.joinDate]);

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

  const getYesterdayStats = useCallback(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = format(yesterday, 'yyyy-MM-dd');
    
    let completed = 0;
    let skipped = 0;
    
    data.habits.forEach(habit => {
      const status = data.entries[`${habit.id}-${dateStr}`];
      if (status === 'completed') completed++;
      else if (status === 'skipped' || status === 'missed') skipped++;
    });
    
    return { completed, total: data.habits.length, skipped };
  }, [data.habits, data.entries]);

  const getWeekProgress = useCallback((weekDays: (Date | null)[]) => {
    const validDays = weekDays.filter((d): d is Date => d !== null);
    if (validDays.length === 0 || data.habits.length === 0) return 0;
    
    let totalPossible = 0;
    let totalCompleted = 0;
    
    validDays.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const joinDateParsed = parseISO(data.joinDate);
      const dayDate = parseISO(dateStr);
      
      // Only count days after join date
      if (!isBefore(dayDate, startOfDay(joinDateParsed))) {
        data.habits.forEach(habit => {
          totalPossible++;
          if (data.entries[`${habit.id}-${dateStr}`] === 'completed') {
            totalCompleted++;
          }
        });
      }
    });
    
    return totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
  }, [data.habits, data.entries, data.joinDate]);

  return {
    habits: data.habits,
    entries: data.entries,
    joinDate: data.joinDate,
    lastSaved,
    updateHabit,
    addHabit,
    removeHabit,
    toggleHabitStatus,
    setHabitStatus,
    getHabitStatus,
    isDateBeforeJoin,
    getHabitStats,
    getMonthlyStats,
    getDailyStats,
    getWeeklyStats,
    getTopHabits,
    getYesterdayStats,
    getWeekProgress,
  };
}
