import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { addMonths, subMonths } from 'date-fns';
import { Header } from '@/components/Header';
import { Dashboard } from '@/components/Dashboard';
import { useHabitData } from '@/hooks/useHabitData';

const DashboardPage = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { 
    habits, 
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
      <div className="max-w-[1200px] mx-auto">
        <Header
          currentMonth={currentMonth}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
          monthlyPercentage={monthlyStats.percentage}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
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
    </div>
  );
};

export default DashboardPage;
