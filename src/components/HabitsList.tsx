import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Trash2 } from 'lucide-react';
import { Habit } from '@/types/habit';
import { ProgressRing } from './ProgressRing';
import { EditHabitDialog } from './EditHabitDialog';
import { AddHabitDialog } from './AddHabitDialog';
import { DeleteHabitDialog } from './DeleteHabitDialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface HabitsListProps {
  habits: Habit[];
  getHabitStats: (habitId: string, month: Date) => { completed: number; remaining: number; percentage: number };
  currentMonth: Date;
  onUpdateHabit: (habit: Habit) => void;
  onAddHabit: (habit: { name: string; emoji: string; monthlyGoal: number }) => void;
  onRemoveHabit: (habitId: string) => void;
}

export function HabitsList({ habits, getHabitStats, currentMonth, onUpdateHabit, onAddHabit, onRemoveHabit }: HabitsListProps) {
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deletingHabit, setDeletingHabit] = useState<Habit | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleEditClick = (habit: Habit) => {
    setEditingHabit(habit);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (habit: Habit) => {
    setDeletingHabit(habit);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = (habitId: string) => {
    onRemoveHabit(habitId);
    toast.success('Habit deleted successfully');
    setDeleteDialogOpen(false);
    setDeletingHabit(null);
  };

  return (
    <>
      <div className="glass-card p-3 sm:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="section-title flex items-center gap-2 text-base sm:text-lg">
            <span className="text-xl sm:text-2xl">📋</span>
            Daily Habits
          </h2>
          <AddHabitDialog onAddHabit={onAddHabit} />
        </div>
        
        <div className="space-y-0.5 sm:space-y-1">
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
                  'habit-row group py-2 sm:py-3 px-2 sm:px-4 gap-2 sm:gap-4',
                  isGoalReached && 'bg-success-muted',
                  isBehind && !isGoalReached && 'bg-warning-muted/50'
                )}
              >
                <span className="text-lg sm:text-2xl flex-shrink-0">{habit.emoji}</span>
                
                <div className="flex-1 min-w-0">
                  <p className="habit-name truncate text-sm sm:text-base">{habit.name}</p>
                  <p className="habit-goal text-[10px] sm:text-xs">
                    {stats.completed} / {habit.monthlyGoal} days
                    {isGoalReached && <span className="ml-1 sm:ml-2 text-success">✓</span>}
                    {isBehind && !isGoalReached && <span className="ml-1 sm:ml-2 text-warning">⚠</span>}
                  </p>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity h-7 w-7 sm:h-8 sm:w-8 rounded-lg"
                    onClick={() => handleEditClick(habit)}
                  >
                    <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity h-7 w-7 sm:h-8 sm:w-8 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteClick(habit)}
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                  <span className={cn(
                    'text-xs sm:text-sm font-semibold min-w-[32px] sm:min-w-[40px] text-right',
                    isGoalReached ? 'text-success' : isBehind ? 'text-warning' : 'text-muted-foreground'
                  )}>
                    {stats.percentage}%
                  </span>
                  <ProgressRing 
                    percentage={stats.percentage} 
                    size={28} 
                    strokeWidth={2.5}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <EditHabitDialog
        habit={editingHabit}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={onUpdateHabit}
      />

      <DeleteHabitDialog
        habit={deletingHabit}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
