import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pencil } from 'lucide-react';
import { Habit } from '@/types/habit';
import { ProgressRing } from './ProgressRing';
import { EditHabitDialog } from './EditHabitDialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HabitsListProps {
  habits: Habit[];
  getHabitStats: (habitId: string, month: Date) => { completed: number; remaining: number; percentage: number };
  currentMonth: Date;
  onUpdateHabit: (habit: Habit) => void;
}

export function HabitsList({ habits, getHabitStats, currentMonth, onUpdateHabit }: HabitsListProps) {
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleEditClick = (habit: Habit) => {
    setEditingHabit(habit);
    setDialogOpen(true);
  };

  return (
    <>
      <div className="glass-card p-6">
        <h2 className="section-title mb-4 flex items-center gap-2">
          <span className="text-2xl">📋</span>
          Daily Habits
        </h2>
        
        <div className="space-y-1">
          {habits.map((habit, index) => {
            const stats = getHabitStats(habit.id, currentMonth);
            const isGoalReached = stats.percentage >= 100;
            const isBehind = stats.percentage < (new Date().getDate() / 30) * 100 - 10;

            return (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'habit-row group',
                  isGoalReached && 'bg-success-muted',
                  isBehind && !isGoalReached && 'bg-warning-muted/50'
                )}
              >
                <span className="text-2xl flex-shrink-0">{habit.emoji}</span>
                
                <div className="flex-1 min-w-0">
                  <p className="habit-name truncate">{habit.name}</p>
                  <p className="habit-goal">
                    {stats.completed} / {habit.monthlyGoal} days
                    {isGoalReached && <span className="ml-2 text-success">✓ Goal reached!</span>}
                    {isBehind && !isGoalReached && <span className="ml-2 text-warning">⚠ Falling behind</span>}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 rounded-lg"
                    onClick={() => handleEditClick(habit)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <span className={cn(
                    'text-sm font-semibold',
                    isGoalReached ? 'text-success' : isBehind ? 'text-warning' : 'text-muted-foreground'
                  )}>
                    {stats.percentage}%
                  </span>
                  <ProgressRing 
                    percentage={stats.percentage} 
                    size={36} 
                    strokeWidth={3}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <EditHabitDialog
        habit={editingHabit}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={onUpdateHabit}
      />
    </>
  );
}
