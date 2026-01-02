import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Save } from 'lucide-react';
import { Habit } from '@/types/habit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

interface HabitFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit';
  habit?: Habit | null;
  onSave: (habit: { name: string; emoji: string; monthlyGoal: number; id?: string }) => void;
}

const EMOJI_OPTIONS = ['💪', '🏃', '📚', '💧', '🧘', '🎯', '✨', '🌟', '💡', '🎨', '🎵', '💤', '🥗', '🚶', '🧠', '⏰', '📝', '🎮', '🌿', '❤️'];

function HabitForm({ 
  mode, 
  habit, 
  onSave, 
  onCancel 
}: { 
  mode: 'add' | 'edit'; 
  habit?: Habit | null; 
  onSave: (habit: { name: string; emoji: string; monthlyGoal: number; id?: string }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('💪');
  const [monthlyGoal, setMonthlyGoal] = useState(30);

  useEffect(() => {
    if (mode === 'edit' && habit) {
      setName(habit.name);
      setEmoji(habit.emoji);
      setMonthlyGoal(habit.monthlyGoal);
    } else {
      setName('');
      setEmoji('💪');
      setMonthlyGoal(30);
    }
  }, [mode, habit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('Please enter a habit name');
      return;
    }
    if (trimmedName.length > 50) {
      toast.error('Habit name must be less than 50 characters');
      return;
    }
    if (monthlyGoal < 1 || monthlyGoal > 31) {
      toast.error('Monthly goal must be between 1 and 31');
      return;
    }

    onSave({
      name: trimmedName,
      emoji,
      monthlyGoal,
      id: habit?.id,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      <div className="space-y-2">
        <Label htmlFor="emoji" className="text-xs sm:text-sm font-medium">Choose an Emoji</Label>
        <div className="grid grid-cols-10 gap-1.5 sm:gap-2 max-h-32 overflow-y-auto p-1">
          {EMOJI_OPTIONS.map((e) => (
            <motion.button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl text-base sm:text-xl flex items-center justify-center transition-all ${
                emoji === e 
                  ? 'bg-primary/20 ring-2 ring-primary scale-110' 
                  : 'bg-muted hover:bg-muted/80'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {e}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">Habit Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Morning Jog"
          className="h-11"
          maxLength={50}
          autoComplete="off"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="goal" className="text-sm font-medium">Monthly Goal (days)</Label>
        <Input
          id="goal"
          type="number"
          min={1}
          max={31}
          value={monthlyGoal}
          onChange={(e) => setMonthlyGoal(Math.min(31, Math.max(1, parseInt(e.target.value) || 1)))}
          className="h-11"
        />
        <p className="text-xs text-muted-foreground">
          Number of days you want to complete this habit each month
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit" className="flex-1 gap-2">
          {mode === 'add' ? (
            <>
              <Plus className="w-4 h-4" />
              Add Habit
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export function HabitFormDialog({ open, onOpenChange, mode, habit, onSave }: HabitFormDialogProps) {
  const isMobile = useIsMobile();

  const handleSave = (data: { name: string; emoji: string; monthlyGoal: number; id?: string }) => {
    onSave(data);
    onOpenChange(false);
    toast.success(mode === 'add' ? 'Habit added successfully!' : 'Habit updated successfully!');
  };

  const title = mode === 'add' ? 'Add New Habit' : 'Edit Habit';
  const description = mode === 'add' 
    ? 'Create a new habit to track daily' 
    : 'Update your habit details';

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="px-4 pb-8 max-h-[90vh]">
          <DrawerHeader className="text-left pb-2">
            <DrawerTitle className="text-lg font-semibold flex items-center gap-2">
              <span className="text-xl">{mode === 'add' ? '➕' : '✏️'}</span>
              {title}
            </DrawerTitle>
            <DrawerDescription className="text-sm text-muted-foreground">
              {description}
            </DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto">
            <HabitForm 
              mode={mode} 
              habit={habit} 
              onSave={handleSave} 
              onCancel={() => onOpenChange(false)} 
            />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] glass-card-elevated max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            <span className="text-xl sm:text-2xl">{mode === 'add' ? '➕' : '✏️'}</span>
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>
        <HabitForm 
          mode={mode} 
          habit={habit} 
          onSave={handleSave} 
          onCancel={() => onOpenChange(false)} 
        />
      </DialogContent>
    </Dialog>
  );
}
