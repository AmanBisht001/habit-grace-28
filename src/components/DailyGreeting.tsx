import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

interface DailyGreetingProps {
  yesterdayStats?: {
    completed: number;
    total: number;
    skipped: number;
  };
}

const GREETINGS = {
  morning: [
    "Good morning 🌅 Let's make today count",
    "Rise and shine ✨ A fresh start awaits",
    "Morning! ☀️ Ready to build great habits?",
  ],
  afternoon: [
    "Good afternoon 🌤️ Keep the momentum going",
    "Afternoon check-in 📋 How's your progress?",
    "Hey there 👋 Still time to hit your goals",
  ],
  evening: [
    "Good evening 🌙 Time to wrap up strong",
    "Evening vibes 🌆 Let's finish what we started",
    "Night owl? 🦉 Complete those final habits",
  ],
};

export function DailyGreeting({ yesterdayStats }: DailyGreetingProps) {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    let timeOfDay: 'morning' | 'afternoon' | 'evening';
    
    if (hour < 12) timeOfDay = 'morning';
    else if (hour < 17) timeOfDay = 'afternoon';
    else timeOfDay = 'evening';
    
    const messages = GREETINGS[timeOfDay];
    // Use day of year for consistent daily message
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return messages[dayOfYear % messages.length];
  }, []);

  const showYesterdaySummary = yesterdayStats && yesterdayStats.total > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-3 sm:p-4 mb-4"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <p className="text-sm sm:text-base font-medium text-foreground">{greeting}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        
        {showYesterdaySummary && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg text-xs"
          >
            <span className="text-muted-foreground">Yesterday:</span>
            <span className="font-medium text-success">{yesterdayStats.completed} done</span>
            {yesterdayStats.skipped > 0 && (
              <span className="text-muted-foreground">· {yesterdayStats.skipped} skipped</span>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
