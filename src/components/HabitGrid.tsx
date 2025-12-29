import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday } from 'date-fns';
import { Habit, HabitStatus } from '@/types/habit';
import { HabitMarker } from './HabitMarker';
import { cn } from '@/lib/utils';

interface HabitGridProps {
  habits: Habit[];
  currentMonth: Date;
  getHabitStatus: (habitId: string, date: string) => HabitStatus;
  toggleHabitStatus: (habitId: string, date: string) => void;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function HabitGrid({ habits, currentMonth, getHabitStatus, toggleHabitStatus }: HabitGridProps) {
  const weeks = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    // Group days into weeks
    const weeksArray: Date[][] = [];
    let currentWeek: Date[] = [];
    
    // Add empty slots for days before the first of the month
    const firstDayOfWeek = getDay(start);
    const mondayOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    for (let i = 0; i < mondayOffset; i++) {
      currentWeek.push(null as unknown as Date);
    }
    
    days.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeksArray.push(currentWeek);
        currentWeek = [];
      }
    });
    
    // Add remaining days to the last week
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null as unknown as Date);
      }
      weeksArray.push(currentWeek);
    }
    
    return weeksArray;
  }, [currentMonth]);

  return (
    <div className="glass-card p-6 overflow-x-auto">
      <h2 className="section-title mb-4 flex items-center gap-2">
        <span className="text-2xl">📊</span>
        Monthly Tracker
      </h2>

      <div className="min-w-[800px]">
        {weeks.map((week, weekIndex) => (
          <motion.div
            key={weekIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: weekIndex * 0.1 }}
            className="mb-6"
          >
            <div className="week-header mb-3">Week {weekIndex + 1}</div>
            
            {/* Day headers */}
            <div className="flex gap-2 mb-2">
              <div className="w-36 flex-shrink-0" /> {/* Spacer for habit names */}
              {DAYS.map((day, dayIndex) => {
                const currentDay = week[dayIndex];
                const isTodayDate = currentDay && isToday(currentDay);
                
                return (
                  <div 
                    key={day} 
                    className={cn(
                      'day-header flex flex-col items-center gap-1',
                      isTodayDate && 'text-primary font-semibold'
                    )}
                  >
                    <span className="text-[10px]">{day}</span>
                    {currentDay && (
                      <span className={cn(
                        'text-xs',
                        isTodayDate && 'bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center'
                      )}>
                        {format(currentDay, 'd')}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Habit rows */}
            {habits.map((habit) => (
              <div key={habit.id} className="flex items-center gap-2 py-1">
                <div className="w-36 flex-shrink-0 flex items-center gap-2">
                  <span className="text-lg">{habit.emoji}</span>
                  <span className="text-xs text-muted-foreground truncate">{habit.name}</span>
                </div>
                
                {week.map((day, dayIndex) => {
                  if (!day) {
                    return <div key={dayIndex} className="w-8 h-8" />;
                  }
                  
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const status = getHabitStatus(habit.id, dateStr);
                  const isTodayDate = isToday(day);
                  
                  return (
                    <div 
                      key={dateStr} 
                      className={cn(
                        'flex items-center justify-center',
                        isTodayDate && 'relative'
                      )}
                    >
                      {isTodayDate && (
                        <div className="absolute inset-0 -m-1 bg-primary/10 rounded-xl" />
                      )}
                      <HabitMarker
                        status={status}
                        onClick={() => toggleHabitStatus(habit.id, dateStr)}
                        size="md"
                        isToday={isTodayDate}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
