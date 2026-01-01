import { useMemo, useCallback } from 'react';
import { format, subDays, parseISO, isAfter, isBefore, startOfDay } from 'date-fns';
import { HabitStatus } from '@/types/habit';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  isActive: boolean;
}

export function useHabitStreaks(
  habitId: string,
  entries: Record<string, HabitStatus>,
  joinDate: string
) {
  const getStreakData = useCallback((): StreakData => {
    const today = startOfDay(new Date());
    const joinDateParsed = startOfDay(parseISO(joinDate));
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let isActive = false;
    
    // Check from today backwards
    let checkDate = today;
    let foundFirstCompleted = false;
    
    // First, check if today is completed for active streak
    const todayStr = format(today, 'yyyy-MM-dd');
    const todayStatus = entries[`${habitId}-${todayStr}`];
    
    // Calculate current streak (going backwards from today)
    let streakDate = today;
    while (isAfter(streakDate, joinDateParsed) || format(streakDate, 'yyyy-MM-dd') === format(joinDateParsed, 'yyyy-MM-dd')) {
      const dateStr = format(streakDate, 'yyyy-MM-dd');
      const status = entries[`${habitId}-${dateStr}`];
      
      if (status === 'completed') {
        currentStreak++;
        streakDate = subDays(streakDate, 1);
      } else if (dateStr === todayStr) {
        // Today hasn't been marked yet, check yesterday
        streakDate = subDays(streakDate, 1);
      } else {
        // Streak broken
        break;
      }
    }
    
    // Check if streak is active (completed today or yesterday)
    const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd');
    isActive = todayStatus === 'completed' || 
      (entries[`${habitId}-${yesterdayStr}`] === 'completed' && todayStatus !== 'skipped');
    
    // Calculate longest streak (scan all entries)
    let scanDate = joinDateParsed;
    while (isBefore(scanDate, today) || format(scanDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      const dateStr = format(scanDate, 'yyyy-MM-dd');
      const status = entries[`${habitId}-${dateStr}`];
      
      if (status === 'completed') {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
      
      scanDate = new Date(scanDate.getTime() + 86400000); // Add one day
    }
    
    longestStreak = Math.max(longestStreak, currentStreak);
    
    return { currentStreak, longestStreak, isActive };
  }, [habitId, entries, joinDate]);

  return useMemo(() => getStreakData(), [getStreakData]);
}

export function useAllHabitStreaks(
  habitIds: string[],
  entries: Record<string, HabitStatus>,
  joinDate: string
): Record<string, StreakData> {
  return useMemo(() => {
    const streaks: Record<string, StreakData> = {};
    const today = startOfDay(new Date());
    const joinDateParsed = startOfDay(parseISO(joinDate));
    
    for (const habitId of habitIds) {
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      let isActive = false;
      
      const todayStr = format(today, 'yyyy-MM-dd');
      const todayStatus = entries[`${habitId}-${todayStr}`];
      
      // Calculate current streak
      let streakDate = today;
      while (isAfter(streakDate, joinDateParsed) || format(streakDate, 'yyyy-MM-dd') === format(joinDateParsed, 'yyyy-MM-dd')) {
        const dateStr = format(streakDate, 'yyyy-MM-dd');
        const status = entries[`${habitId}-${dateStr}`];
        
        if (status === 'completed') {
          currentStreak++;
          streakDate = subDays(streakDate, 1);
        } else if (dateStr === todayStr) {
          streakDate = subDays(streakDate, 1);
        } else {
          break;
        }
      }
      
      const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd');
      isActive = todayStatus === 'completed' || 
        (entries[`${habitId}-${yesterdayStr}`] === 'completed' && todayStatus !== 'skipped');
      
      // Calculate longest streak
      let scanDate = joinDateParsed;
      while (isBefore(scanDate, today) || format(scanDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
        const dateStr = format(scanDate, 'yyyy-MM-dd');
        const status = entries[`${habitId}-${dateStr}`];
        
        if (status === 'completed') {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
        
        scanDate = new Date(scanDate.getTime() + 86400000);
      }
      
      longestStreak = Math.max(longestStreak, currentStreak);
      streaks[habitId] = { currentStreak, longestStreak, isActive };
    }
    
    return streaks;
  }, [habitIds, entries, joinDate]);
}
