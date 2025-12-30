import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, format, isToday, isSameMonth } from 'date-fns';
import { Header } from '@/components/Header';
import { HabitsList } from '@/components/HabitsList';
import { HabitGrid } from '@/components/HabitGrid';
import { useHabitData } from '@/hooks/useHabitData';
import { toast } from 'sonner';

const Index = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(1);
  const [showWeekCompletionMessage, setShowWeekCompletionMessage] = useState(false);
  const prevWeekCompleteRef = useRef(false);
  const hasInitialized = useRef(false);
  
  const { 
    habits, 
    getHabitStatus, 
    toggleHabitStatus, 
    getHabitStats,
    getMonthlyStats,
    updateHabit,
    addHabit,
    removeHabit,
    isDateBeforeJoin,
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
  }, [isCurrentWeekComplete, currentWeek, totalWeeks]);

  const monthlyStats = useMemo(() => getMonthlyStats(currentMonth), [getMonthlyStats, currentMonth]);

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

  return (
    <div className="min-h-screen p-2 sm:p-4 lg:p-6">
      <div className="max-w-[1600px] mx-auto">
        <Header
          currentMonth={currentMonth}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
          monthlyPercentage={monthlyStats.percentage}
        />

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
              getHabitStats={getHabitStats}
              currentMonth={currentMonth}
              onUpdateHabit={updateHabit}
              onAddHabit={addHabit}
              onRemoveHabit={removeHabit}
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
        >
          <span className="text-xs sm:text-sm text-muted-foreground font-medium">Legend:</span>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="habit-marker habit-marker-empty w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">Pending</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="habit-marker habit-marker-completed w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg flex items-center justify-center">
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-[10px] sm:text-xs text-muted-foreground">Done</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="habit-marker habit-marker-skipped w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg flex items-center justify-center">
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-warning-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <span className="text-[10px] sm:text-xs text-muted-foreground">Skipped</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="habit-marker habit-marker-paused w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg flex items-center justify-center">
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6" />
              </svg>
            </div>
            <span className="text-[10px] sm:text-xs text-muted-foreground">Paused</span>
          </div>
        </motion.div>

        {/* Footer */}
        <footer className="mt-6 sm:mt-8 text-center text-[10px] sm:text-xs text-muted-foreground px-2">
          <p>Tap markers to cycle: Pending → Completed → Missed → Skipped</p>
          <p className="mt-1">Data auto-saves to local storage</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
