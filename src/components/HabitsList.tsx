import { useState, useMemo, memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Trash2, Flame, Plus } from 'lucide-react';
import { Habit, HabitStatus } from '@/types/habit';
import { ProgressRing } from './ProgressRing';
import { HabitFormDialog } from './HabitFormDialog';
import { DeleteHabitDialog } from './DeleteHabitDialog';
import { HabitSearch, HabitFilter } from './HabitSearch';
import { EmptyState } from './EmptyState';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAllHabitStreaks } from '@/hooks/useHabitStreaks';
import { format } from 'date-fns';

interface HabitsListProps {
  habits: Habit[];
  entries: Record<string, HabitStatus>;
  joinDate: string;
  getHabitStats: (habitId: string, month: Date) => { completed: number; remaining: number; percentage: number };
  getHabitStatus: (habitId: string, date: string) => HabitStatus;
  currentMonth: Date;
  onUpdateHabit: (habit: Habit) => void;
  onAddHabit: (habit: { name: string; emoji: string; monthlyGoal: number }) => void;
  onRemoveHabit: (habitId: string) => void;
  onRestoreHabit?: (habit: Habit) => void;
}

// Memoized habit row for better performance
const HabitRow = memo(function HabitRow({ 
  habit, 
  stats, 
  streak,
  onEdit, 
  onDelete,
  index,
}: {
  habit: Habit;
  stats: { completed: number; remaining: number; percentage: number };
  streak: { currentStreak: number; longestStreak: number; isActive: boolean } | undefined;
  onEdit: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
  index: number;
}) {
  const isGoalReached = stats.percentage >= 100;
  const isBehind = stats.percentage < (new Date().getDate() / 30) * 100 - 10;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className={cn(
        'habit-row group py-2 sm:py-3 px-2 sm:px-4 gap-2 sm:gap-4',
        isGoalReached && 'bg-success-muted',
        isBehind && !isGoalReached && 'bg-warning-muted/50'
      )}
    >
      <span className="text-lg sm:text-2xl flex-shrink-0" role="img" aria-label={habit.name}>
        {habit.emoji}
      </span>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="habit-name truncate text-sm sm:text-base">{habit.name}</p>
          {streak && streak.currentStreak > 0 && streak.isActive && (
            <span 
              className="flex items-center gap-0.5 text-xs text-warning font-medium"
              title={`${streak.currentStreak} day streak`}
            >
              <Flame className="w-3 h-3 text-warning" aria-hidden="true" />
              {streak.currentStreak}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <p className="habit-goal text-[10px] sm:text-xs">
            {stats.completed} / {habit.monthlyGoal} days
            {isGoalReached && <span className="ml-1 sm:ml-2 text-success" aria-label="Goal reached">✓</span>}
            {isBehind && !isGoalReached && <span className="ml-1 sm:ml-2 text-warning" aria-label="Behind schedule">⚠</span>}
          </p>
          {streak && streak.longestStreak > streak.currentStreak && (
            <span className="text-[9px] sm:text-[10px] text-muted-foreground">
              Best: {streak.longestStreak}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity h-7 w-7 sm:h-8 sm:w-8 rounded-lg"
          onClick={() => onEdit(habit)}
          aria-label={`Edit ${habit.name}`}
        >
          <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity h-7 w-7 sm:h-8 sm:w-8 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(habit)}
          aria-label={`Delete ${habit.name}`}
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
});

export function HabitsList({ 
  habits, 
  entries, 
  joinDate, 
  getHabitStats, 
  getHabitStatus,
  currentMonth, 
  onUpdateHabit, 
  onAddHabit, 
  onRemoveHabit,
  onRestoreHabit,
}: HabitsListProps) {
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deletingHabit, setDeletingHabit] = useState<Habit | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<HabitFilter>('all');
  const [deletedHabit, setDeletedHabit] = useState<Habit | null>(null);
  
  const habitIds = habits.map(h => h.id);
  const streaks = useAllHabitStreaks(habitIds, entries, joinDate);
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Filter habits based on search and filter
  const filteredHabits = useMemo(() => {
    let result = habits;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(h => 
        h.name.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filter === 'pending') {
      result = result.filter(h => {
        const status = getHabitStatus(h.id, todayStr);
        return status === 'empty';
      });
    } else if (filter === 'active') {
      result = result.filter(h => {
        const streak = streaks[h.id];
        return streak && streak.isActive && streak.currentStreak > 0;
      });
    }

    return result;
  }, [habits, searchQuery, filter, getHabitStatus, streaks, todayStr]);

  const handleAddClick = useCallback(() => {
    setFormMode('add');
    setEditingHabit(null);
    setFormDialogOpen(true);
  }, []);

  const handleEditClick = useCallback((habit: Habit) => {
    setFormMode('edit');
    setEditingHabit(habit);
    setFormDialogOpen(true);
  }, []);

  const handleDeleteClick = useCallback((habit: Habit) => {
    setDeletingHabit(habit);
    setDeleteDialogOpen(true);
  }, []);

  const handleFormSave = useCallback((data: { name: string; emoji: string; monthlyGoal: number; id?: string }) => {
    if (formMode === 'add') {
      onAddHabit({ name: data.name, emoji: data.emoji, monthlyGoal: data.monthlyGoal });
    } else if (data.id) {
      onUpdateHabit({
        id: data.id,
        name: data.name,
        emoji: data.emoji,
        monthlyGoal: data.monthlyGoal,
      });
    }
  }, [formMode, onAddHabit, onUpdateHabit]);

  const handleConfirmDelete = useCallback((habitId: string) => {
    const habitToDelete = habits.find(h => h.id === habitId);
    if (habitToDelete) {
      setDeletedHabit(habitToDelete);
      onRemoveHabit(habitId);
      
      toast('Habit deleted', {
        duration: 5000,
        action: {
          label: 'Undo',
          onClick: () => {
            if (onRestoreHabit && deletedHabit) {
              onRestoreHabit(deletedHabit);
              toast.success('Habit restored');
            }
            setDeletedHabit(null);
          },
        },
      });
    }
    setDeleteDialogOpen(false);
    setDeletingHabit(null);
  }, [habits, onRemoveHabit, onRestoreHabit, deletedHabit]);

  return (
    <>
      <div className="glass-card p-3 sm:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="section-title flex items-center gap-2 text-base sm:text-lg">
            <span className="text-xl sm:text-2xl" role="img" aria-label="Habits list">📋</span>
            Daily Habits
          </h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleAddClick}
            className="gap-1 sm:gap-2 border-dashed border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 px-2 sm:px-3 h-8 sm:h-9 text-xs sm:text-sm"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Add Habit</span>
            <span className="xs:hidden">Add</span>
          </Button>
        </div>
        
        {habits.length > 0 && (
          <HabitSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filter={filter}
            onFilterChange={setFilter}
          />
        )}
        
        <div className="space-y-0.5 sm:space-y-1" role="list" aria-label="Habits">
          {habits.length === 0 ? (
            <EmptyState type="no-habits" onAction={handleAddClick} />
          ) : filteredHabits.length === 0 ? (
            <EmptyState type="no-results" />
          ) : (
            filteredHabits.map((habit, index) => (
              <HabitRow
                key={habit.id}
                habit={habit}
                stats={getHabitStats(habit.id, currentMonth)}
                streak={streaks[habit.id]}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                index={index}
              />
            ))
          )}
        </div>
      </div>

      <HabitFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        mode={formMode}
        habit={editingHabit}
        onSave={handleFormSave}
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
