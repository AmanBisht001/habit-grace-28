import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Pause } from 'lucide-react';
import { HabitStatus } from '@/types/habit';
import { cn } from '@/lib/utils';

interface HabitMarkerProps {
  status: HabitStatus;
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
  isToday?: boolean;
}

const sizeClasses = {
  sm: 'w-6 h-6 rounded-lg',
  md: 'w-8 h-8 rounded-xl',
  lg: 'w-10 h-10 rounded-xl',
};

const iconSizes = {
  sm: 12,
  md: 14,
  lg: 16,
};

export function HabitMarker({ status, onClick, size = 'md', isToday = false }: HabitMarkerProps) {
  const iconSize = iconSizes[size];

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'habit-marker relative flex items-center justify-center transition-all duration-300',
        sizeClasses[size],
        {
          'habit-marker-empty': status === 'empty',
          'habit-marker-completed': status === 'completed',
          'habit-marker-missed': status === 'missed',
          'habit-marker-skipped': status === 'skipped',
        },
        isToday && status === 'empty' && 'ring-2 ring-primary/30 ring-offset-2 ring-offset-background'
      )}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Mark habit as ${status}`}
    >
      <AnimatePresence mode="wait">
        {status === 'completed' && (
          <motion.div
            key="check"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <Check size={iconSize} className="text-primary-foreground" strokeWidth={3} />
          </motion.div>
        )}
        {status === 'missed' && (
          <motion.div
            key="x"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <X size={iconSize} className="text-destructive-foreground" strokeWidth={3} />
          </motion.div>
        )}
        {status === 'skipped' && (
          <motion.div
            key="pause"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <Pause size={iconSize} className="text-warning-foreground" strokeWidth={3} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
