import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { addMonths, subMonths } from 'date-fns';
import { Header } from '@/components/Header';
import { HabitsList } from '@/components/HabitsList';
import { HabitGrid } from '@/components/HabitGrid';
import { Dashboard } from '@/components/Dashboard';
import { useHabitData } from '@/hooks/useHabitData';

const Index = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { 
    habits, 
    getHabitStatus, 
    toggleHabitStatus, 
    getHabitStats,
    getMonthlyStats,
    getDailyStats,
    getWeeklyStats,
    getTopHabits
  } = useHabitData();

  const monthlyStats = useMemo(() => getMonthlyStats(currentMonth), [getMonthlyStats, currentMonth]);

  const handlePreviousMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-[1600px] mx-auto">
        <Header
          currentMonth={currentMonth}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
          monthlyPercentage={monthlyStats.percentage}
        />

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Panel - Habits List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="xl:col-span-4"
          >
            <HabitsList 
              habits={habits} 
              getHabitStats={getHabitStats}
              currentMonth={currentMonth}
            />
          </motion.div>

          {/* Right Panel - Grid & Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="xl:col-span-8 space-y-6"
          >
            <HabitGrid
              habits={habits}
              currentMonth={currentMonth}
              getHabitStatus={getHabitStatus}
              toggleHabitStatus={toggleHabitStatus}
            />

            <Dashboard
              habits={habits}
              currentMonth={currentMonth}
              getMonthlyStats={getMonthlyStats}
              getDailyStats={getDailyStats}
              getWeeklyStats={getWeeklyStats}
              getTopHabits={getTopHabits}
            />
          </motion.div>
        </div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 glass-card p-4 flex items-center justify-center gap-6"
        >
          <span className="text-sm text-muted-foreground font-medium">Legend:</span>
          <div className="flex items-center gap-2">
            <div className="habit-marker habit-marker-empty w-6 h-6 rounded-lg" />
            <span className="text-xs text-muted-foreground">Empty</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="habit-marker habit-marker-completed w-6 h-6 rounded-lg flex items-center justify-center">
              <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-xs text-muted-foreground">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="habit-marker habit-marker-missed w-6 h-6 rounded-lg flex items-center justify-center">
              <svg className="w-3 h-3 text-destructive-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <span className="text-xs text-muted-foreground">Missed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="habit-marker habit-marker-skipped w-6 h-6 rounded-lg flex items-center justify-center">
              <svg className="w-3 h-3 text-warning-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6" />
              </svg>
            </div>
            <span className="text-xs text-muted-foreground">Skipped</span>
          </div>
        </motion.div>

        {/* Footer */}
        <footer className="mt-8 text-center text-xs text-muted-foreground">
          <p>Click markers to cycle: Empty → Completed → Missed → Skipped</p>
          <p className="mt-1">Data auto-saves to local storage</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
