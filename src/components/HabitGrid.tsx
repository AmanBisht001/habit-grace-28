import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday } from 'date-fns';
import { Habit, HabitStatus } from '@/types/habit';
import { HabitMarker } from './HabitMarker';
import { WeekSwitcher } from './WeekSwitcher';
import { cn } from '@/lib/utils';

interface HabitGridProps {
  habits: Habit[];
  currentMonth: Date;
  currentWeek: number;
  totalWeeks: number;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  getHabitStatus: (habitId: string, date: string) => HabitStatus;
  toggleHabitStatus: (habitId: string, date: string) => void;
  showWeekCompletionMessage?: boolean;
  isDateBeforeJoin: (date: string) => boolean;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function HabitGrid({ 
  habits, 
  currentMonth, 
  currentWeek,
  totalWeeks,
  onPreviousWeek,
  onNextWeek,
  getHabitStatus, 
  toggleHabitStatus,
  showWeekCompletionMessage,
  isDateBeforeJoin,
}: HabitGridProps) {
  const weeks = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    // Group days into weeks
    const weeksArray: (Date | null)[][] = [];
    let currentWeekDays: (Date | null)[] = [];
    
    // Add empty slots for days before the first of the month
    const firstDayOfWeek = getDay(start);
    const mondayOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    for (let i = 0; i < mondayOffset; i++) {
      currentWeekDays.push(null);
    }
    
    days.forEach((day) => {
      currentWeekDays.push(day);
      if (currentWeekDays.length === 7) {
        weeksArray.push(currentWeekDays);
        currentWeekDays = [];
      }
    });
    
    // Add remaining days to the last week
    if (currentWeekDays.length > 0) {
      while (currentWeekDays.length < 7) {
        currentWeekDays.push(null);
      }
      weeksArray.push(currentWeekDays);
    }
    
    return weeksArray;
  }, [currentMonth]);

  // Get the current week's days (1-indexed)
  const activeWeekDays = weeks[currentWeek - 1] || [];

  return (
    <div className="glass-card p-3 sm:p-6 overflow-x-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
        <h2 className="section-title flex items-center gap-2 text-base sm:text-lg">
          <span className="text-xl sm:text-2xl">📊</span>
          Weekly Tracker
        </h2>
        
        <WeekSwitcher
          currentWeek={currentWeek}
          totalWeeks={totalWeeks}
          onPreviousWeek={onPreviousWeek}
          onNextWeek={onNextWeek}
          showCompletionMessage={showWeekCompletionMessage}
        />
      </div>

      <div className="min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentMonth.toISOString()}-week-${currentWeek}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Day headers */}
            <div className="flex gap-1 sm:gap-2 mb-3">
              <div className="w-24 sm:w-36 flex-shrink-0" /> {/* Spacer for habit names */}
              {DAYS.map((day, dayIndex) => {
                const currentDay = activeWeekDays[dayIndex];
                const isTodayDate = currentDay && isToday(currentDay);
                
                return (
                  <div 
                    key={day} 
                    className={cn(
                      'day-header flex flex-col items-center gap-0.5 sm:gap-1 w-8 sm:w-10 flex-shrink-0',
                      isTodayDate && 'text-success font-bold'
                    )}
                  >
                    <span className={cn(
                      'text-[9px] sm:text-[10px]',
                      isTodayDate && 'text-success'
                    )}>{day.slice(0, 2)}</span>
                    {currentDay && (
                      <span className={cn(
                        'text-[10px] sm:text-xs',
                        isTodayDate && 'bg-success text-success-foreground rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-bold'
                      )}>
                        {format(currentDay, 'd')}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Habit rows */}
            {habits.map((habit, habitIndex) => (
              <motion.div 
                key={habit.id} 
                className="flex items-center gap-1 sm:gap-2 py-1 sm:py-1.5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: habitIndex * 0.03 }}
              >
                <div className="w-24 sm:w-36 flex-shrink-0 flex items-center gap-1 sm:gap-2">
                  <span className="text-base sm:text-lg">{habit.emoji}</span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground truncate">{habit.name}</span>
                </div>
                
                {activeWeekDays.map((day, dayIndex) => {
                  if (!day) {
                    return <div key={dayIndex} className="w-8 sm:w-10 h-7 sm:h-8 flex items-center justify-center flex-shrink-0" />;
                  }
                  
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const status = getHabitStatus(habit.id, dateStr);
                  const isTodayDate = isToday(day);
                  const isPaused = isDateBeforeJoin(dateStr);
                  
                  return (
                    <div 
                      key={dateStr} 
                      className={cn(
                        'w-8 sm:w-10 flex items-center justify-center relative flex-shrink-0',
                        isTodayDate && 'today-column'
                      )}
                    >
                      {isTodayDate && (
                        <div className="absolute inset-0 -m-0.5 sm:-m-1 bg-success/10 rounded-lg sm:rounded-xl ring-1 sm:ring-2 ring-success/30" />
                      )}
                      <HabitMarker
                        status={status}
                        onClick={() => toggleHabitStatus(habit.id, dateStr)}
                        size="sm"
                        isToday={isTodayDate}
                        disabled={isPaused}
                      />
                    </div>
                  );
                })}
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
