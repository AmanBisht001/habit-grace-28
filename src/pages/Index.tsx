import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, format, isToday, isSameMonth } from 'date-fns';
import { Header } from '@/components/Header';
import { HabitsList } from '@/components/HabitsList';
import { HabitGrid } from '@/components/HabitGrid';
import { DailyGreeting } from '@/components/DailyGreeting';
import { SaveIndicator } from '@/components/SaveIndicator';
import { GoToTodayButton } from '@/components/GoToTodayButton';
import { WeeklySummary } from '@/components/WeeklySummary';
import { OnboardingTour } from '@/components/OnboardingTour';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { PrivacyInfo } from '@/components/PrivacyInfo';
import { useHabitData } from '@/hooks/useHabitData';
import { toast } from 'sonner';

const Index = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(1);
  const [showWeekCompletionMessage, setShowWeekCompletionMessage] = useState(false);
  const [showWeeklySummary, setShowWeeklySummary] = useState(false);
  const [completedWeekNumber, setCompletedWeekNumber] = useState(1);
  const [completedWeekPercentage, setCompletedWeekPercentage] = useState(0);
  const prevWeekCompleteRef = useRef(false);
  const hasInitialized = useRef(false);
  
  const { 
    habits, 
    entries,
    joinDate,
    lastSaved,
    getHabitStatus, 
    toggleHabitStatus, 
    getHabitStats,
    getMonthlyStats,
    updateHabit,
    addHabit,
    removeHabit,
    restoreHabit,
    isDateBeforeJoin,
    getYesterdayStats,
    getWeekProgress,
  } = useHabitData();

  // Calculate total weeks in the current month
  const totalWeeks = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    const firstDayOfWeek = getDay(start);
    const mondayOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    const totalDaysWithOffset = days.length + mondayOffset;
    
    return Math.ceil(totalDaysWithOffset / 7);
  }, [currentMonth]);

  // Get weeks array for navigation
  const weeksArray = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    const weeks: (Date | null)[][] = [];
    let currentWeekDaysArr: (Date | null)[] = [];
    
    const firstDayOfWeek = getDay(start);
    const mondayOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    for (let i = 0; i < mondayOffset; i++) {
      currentWeekDaysArr.push(null);
    }
    
    days.forEach((day) => {
      currentWeekDaysArr.push(day);
      if (currentWeekDaysArr.length === 7) {
        weeks.push(currentWeekDaysArr);
        currentWeekDaysArr = [];
      }
    });
    
    if (currentWeekDaysArr.length > 0) {
      while (currentWeekDaysArr.length < 7) {
        currentWeekDaysArr.push(null);
      }
      weeks.push(currentWeekDaysArr);
    }
    
    return weeks;
  }, [currentMonth]);

  // Get current week's days for completion check
  const currentWeekDays = useMemo(() => {
    return weeksArray[currentWeek - 1] || [];
  }, [weeksArray, currentWeek]);

  // Calculate week progress
  const weekProgress = useMemo(() => {
    return getWeekProgress(currentWeekDays);
  }, [getWeekProgress, currentWeekDays]);

  // Check if we're viewing today's week
  const isOnTodayWeek = useMemo(() => {
    if (!isSameMonth(currentMonth, new Date())) return false;
    for (const day of currentWeekDays) {
      if (day && isToday(day)) return true;
    }
    return false;
  }, [currentMonth, currentWeekDays]);

  // Find which week contains today and auto-navigate on load
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const today = new Date();
    
    // If current month is not the same as today's month, switch to today's month
    if (!isSameMonth(currentMonth, today)) {
      setCurrentMonth(today);
      return; // Will re-run after month change
    }

    // Find which week contains today
    for (let weekIndex = 0; weekIndex < weeksArray.length; weekIndex++) {
      const week = weeksArray[weekIndex];
      for (const day of week) {
        if (day && isToday(day)) {
          setCurrentWeek(weekIndex + 1);
          return;
        }
      }
    }
  }, [weeksArray, currentMonth]);

  // Check if current week is complete
  const isCurrentWeekComplete = useMemo(() => {
    const validDays = currentWeekDays.filter((day): day is Date => day !== null);
    if (validDays.length === 0) return false;

    for (const day of validDays) {
      const dateStr = format(day, 'yyyy-MM-dd');
      for (const habit of habits) {
        const status = getHabitStatus(habit.id, dateStr);
        if (status === 'empty') {
          return false;
        }
      }
    }
    return true;
  }, [currentWeekDays, habits, getHabitStatus]);

  // Auto-advance when week is complete
  useEffect(() => {
    if (isCurrentWeekComplete && !prevWeekCompleteRef.current) {
      const isLastWeek = currentWeek === totalWeeks;
      
      // Show weekly summary
      setCompletedWeekNumber(currentWeek);
      setCompletedWeekPercentage(weekProgress);
      setShowWeeklySummary(true);
      setTimeout(() => setShowWeeklySummary(false), 3000);
      
      if (isLastWeek) {
        // Auto-advance to next month
        setTimeout(() => {
          toast.success('Month completed! 🎉 Moving to next month');
          setCurrentMonth(prev => addMonths(prev, 1));
          setCurrentWeek(1);
        }, 500);
      } else {
        // Show completion message and advance to next week
        setShowWeekCompletionMessage(true);
        setTimeout(() => {
          setCurrentWeek(prev => prev + 1);
          setShowWeekCompletionMessage(false);
        }, 1500);
      }
    }
    prevWeekCompleteRef.current = isCurrentWeekComplete;
  }, [isCurrentWeekComplete, currentWeek, totalWeeks, weekProgress]);

  const monthlyStats = useMemo(() => getMonthlyStats(currentMonth), [getMonthlyStats, currentMonth]);
  const yesterdayStats = useMemo(() => getYesterdayStats(), [getYesterdayStats]);

  const handlePreviousMonth = useCallback(() => {
    setCurrentMonth(prev => subMonths(prev, 1));
    setCurrentWeek(1);
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth(prev => addMonths(prev, 1));
    setCurrentWeek(1);
  }, []);

  const handlePreviousWeek = useCallback(() => {
    setCurrentWeek(prev => Math.max(1, prev - 1));
  }, []);

  const handleNextWeek = useCallback(() => {
    setCurrentWeek(prev => Math.min(totalWeeks, prev + 1));
  }, [totalWeeks]);

  const handleGoToToday = useCallback(() => {
    const today = new Date();
    setCurrentMonth(today);
    
    // Find today's week
    const start = startOfMonth(today);
    const end = endOfMonth(today);
    const days = eachDayOfInterval({ start, end });
    
    const tempWeeks: (Date | null)[][] = [];
    let tempWeekDays: (Date | null)[] = [];
    
    const firstDayOfWeek = getDay(start);
    const mondayOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    for (let i = 0; i < mondayOffset; i++) {
      tempWeekDays.push(null);
    }
    
    days.forEach((day) => {
      tempWeekDays.push(day);
      if (tempWeekDays.length === 7) {
        tempWeeks.push(tempWeekDays);
        tempWeekDays = [];
      }
    });
    
    if (tempWeekDays.length > 0) {
      while (tempWeekDays.length < 7) {
        tempWeekDays.push(null);
      }
      tempWeeks.push(tempWeekDays);
    }
    
    for (let weekIndex = 0; weekIndex < tempWeeks.length; weekIndex++) {
      const week = tempWeeks[weekIndex];
      for (const day of week) {
        if (day && isToday(day)) {
          setCurrentWeek(weekIndex + 1);
          return;
        }
      }
    }
  }, []);

  return (
    <div className="min-h-screen p-2 sm:p-4 lg:p-6">
      <div className="max-w-[1600px] mx-auto">
        <Header
          currentMonth={currentMonth}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
          monthlyPercentage={monthlyStats.percentage}
        />

        <DailyGreeting yesterdayStats={yesterdayStats} />

        <div className="flex items-center justify-end mb-3">
          <GoToTodayButton onClick={handleGoToToday} isOnToday={isOnTodayWeek} />
        </div>

        <div className="flex flex-col xl:grid xl:grid-cols-12 gap-4 sm:gap-6">
          {/* Left Panel - Habits List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="xl:col-span-4 order-2 xl:order-1"
          >
            <HabitsList 
              habits={habits}
              entries={entries}
              joinDate={joinDate}
              getHabitStats={getHabitStats}
              getHabitStatus={getHabitStatus}
              currentMonth={currentMonth}
              onUpdateHabit={updateHabit}
              onAddHabit={addHabit}
              onRemoveHabit={removeHabit}
              onRestoreHabit={restoreHabit}
            />
          </motion.div>

          {/* Right Panel - Grid */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="xl:col-span-8 order-1 xl:order-2"
          >
            <HabitGrid
              habits={habits}
              currentMonth={currentMonth}
              currentWeek={currentWeek}
              totalWeeks={totalWeeks}
              weekProgress={weekProgress}
              onPreviousWeek={handlePreviousWeek}
              onNextWeek={handleNextWeek}
              getHabitStatus={getHabitStatus}
              toggleHabitStatus={toggleHabitStatus}
              showWeekCompletionMessage={showWeekCompletionMessage}
              isDateBeforeJoin={isDateBeforeJoin}
            />
          </motion.div>
        </div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-4 sm:mt-6 glass-card p-3 sm:p-4 flex items-center justify-center gap-3 sm:gap-6 flex-wrap"
          role="region"
          aria-label="Habit status legend"
        >
          <span className="text-xs sm:text-sm text-muted-foreground font-medium">Legend:</span>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="habit-marker habit-marker-empty w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg" aria-hidden="true" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">Pending</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="habit-marker habit-marker-completed w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg flex items-center justify-center" aria-hidden="true">
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-[10px] sm:text-xs text-muted-foreground">Done</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="habit-marker habit-marker-skipped w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg flex items-center justify-center" aria-hidden="true">
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-warning-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <span className="text-[10px] sm:text-xs text-muted-foreground">Skipped</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="habit-marker habit-marker-paused w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg flex items-center justify-center" aria-hidden="true">
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6" />
              </svg>
            </div>
            <span className="text-[10px] sm:text-xs text-muted-foreground">Paused</span>
          </div>
        </motion.div>

        {/* Footer */}
        <footer className="mt-6 sm:mt-8 text-center text-[10px] sm:text-xs text-muted-foreground px-2 space-y-2">
          <p>Tap markers to cycle: Pending → Completed → Missed → Skipped</p>
          <p className="text-muted-foreground/70">
            Use <kbd className="px-1.5 py-0.5 rounded bg-muted text-[9px] font-mono">Tab</kbd> to navigate, 
            <kbd className="px-1.5 py-0.5 rounded bg-muted text-[9px] font-mono ml-1">Enter</kbd> or 
            <kbd className="px-1.5 py-0.5 rounded bg-muted text-[9px] font-mono ml-1">Space</kbd> to toggle
          </p>
          <div className="flex items-center justify-center pt-2">
            <PrivacyInfo />
          </div>
        </footer>
      </div>

      <SaveIndicator lastSaved={lastSaved} />
      <WeeklySummary 
        show={showWeeklySummary} 
        weekNumber={completedWeekNumber} 
        percentage={completedWeekPercentage} 
      />
      <OnboardingTour />
      <OfflineIndicator />
    </div>
  );
};

export default Index;
