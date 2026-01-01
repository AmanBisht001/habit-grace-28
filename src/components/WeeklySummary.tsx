import { motion, AnimatePresence } from 'framer-motion';
import { PartyPopper, TrendingUp } from 'lucide-react';

interface WeeklySummaryProps {
  show: boolean;
  weekNumber: number;
  percentage: number;
}

export function WeeklySummary({ show, weekNumber, percentage }: WeeklySummaryProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="glass-card-elevated px-6 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
              <PartyPopper className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Week {weekNumber} Complete!</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                {percentage}% completion rate
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
