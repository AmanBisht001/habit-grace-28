import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProgressRing } from './ProgressRing';

interface HeaderProps {
  currentMonth: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  monthlyPercentage: number;
}

export function Header({ currentMonth, onPreviousMonth, onNextMonth, monthlyPercentage }: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card-elevated px-6 py-4 mb-6 flex items-center justify-between sticky top-4 z-10"
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-glow">
            HabitFlow
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPreviousMonth}
          className="rounded-xl hover:bg-muted"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        
        <div className="text-center min-w-[160px]">
          <h2 className="text-lg font-semibold">{format(currentMonth, 'MMMM yyyy')}</h2>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onNextMonth}
          className="rounded-xl hover:bg-muted"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Monthly Progress</p>
          <p className="text-lg font-bold text-primary">{monthlyPercentage}%</p>
        </div>
        <ProgressRing percentage={monthlyPercentage} size={48} strokeWidth={4} />
      </div>
    </motion.header>
  );
}
