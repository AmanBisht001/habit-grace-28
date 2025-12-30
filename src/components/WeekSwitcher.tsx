import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WeekSwitcherProps {
  currentWeek: number;
  totalWeeks: number;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  showCompletionMessage?: boolean;
}

export function WeekSwitcher({
  currentWeek,
  totalWeeks,
  onPreviousWeek,
  onNextWeek,
  showCompletionMessage,
}: WeekSwitcherProps) {
  const isFirstWeek = currentWeek === 1;
  const isLastWeek = currentWeek === totalWeeks;

  return (
    <div className="flex flex-col items-center gap-1 sm:gap-2">
      <div className="flex items-center gap-2 sm:gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPreviousWeek}
          disabled={isFirstWeek}
          className="rounded-xl hover:bg-muted disabled:opacity-30 h-8 w-8 sm:h-10 sm:w-10"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
        
        <div className="text-center min-w-[70px] sm:min-w-[100px]">
          <span className="text-sm sm:text-base font-medium">Week {currentWeek}</span>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onNextWeek}
          disabled={isLastWeek}
          className="rounded-xl hover:bg-muted disabled:opacity-30 h-8 w-8 sm:h-10 sm:w-10"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </div>

      <AnimatePresence>
        {showCompletionMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-medium"
          >
            <PartyPopper className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Week done! Next: Week {currentWeek + 1}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
