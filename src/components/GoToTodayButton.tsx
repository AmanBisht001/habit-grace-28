import { motion } from 'framer-motion';
import { CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GoToTodayButtonProps {
  onClick: () => void;
  isOnToday: boolean;
}

export function GoToTodayButton({ onClick, isOnToday }: GoToTodayButtonProps) {
  if (isOnToday) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <Button
        variant="outline"
        size="sm"
        onClick={onClick}
        className="gap-1.5 rounded-xl bg-primary/10 border-primary/20 hover:bg-primary/20 text-primary text-xs"
      >
        <CalendarDays className="w-3.5 h-3.5" />
        <span className="hidden xs:inline">Go to Today</span>
        <span className="xs:hidden">Today</span>
      </Button>
    </motion.div>
  );
}
