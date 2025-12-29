import { useState, useEffect } from 'react';
import { Habit } from '@/types/habit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface EditHabitDialogProps {
  habit: Habit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (habit: Habit) => void;
}

const EMOJI_OPTIONS = ['⏰', '🚫', '💧', '🏋️', '🧘', '📘', '🧠', '⭐', '✨', '📵', '💵', '🎯', '💪', '🏃', '🍎', '😴', '🎨', '🎵', '✍️', '🧹'];

export function EditHabitDialog({ habit, open, onOpenChange, onSave }: EditHabitDialogProps) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('');
  const [monthlyGoal, setMonthlyGoal] = useState(30);

  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setEmoji(habit.emoji);
      setMonthlyGoal(habit.monthlyGoal);
    }
  }, [habit]);

  const handleSave = () => {
    if (!habit) return;
    
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('Habit name cannot be empty');
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
      ...habit,
      name: trimmedName,
      emoji,
      monthlyGoal,
    });
    onOpenChange(false);
    toast.success('Habit updated successfully');
  };

  if (!habit) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Habit</DialogTitle>
          <DialogDescription>
            Update your habit details. Changes will be saved automatically.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="emoji">Emoji</Label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`w-10 h-10 text-xl rounded-lg transition-all ${
                    emoji === e
                      ? 'bg-primary/20 ring-2 ring-primary scale-110'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Habit Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter habit name"
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal">Monthly Goal (days)</Label>
            <Input
              id="goal"
              type="number"
              min={1}
              max={31}
              value={monthlyGoal}
              onChange={(e) => setMonthlyGoal(Math.min(31, Math.max(1, parseInt(e.target.value) || 1)))}
            />
            <p className="text-xs text-muted-foreground">
              Number of days you want to complete this habit each month
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
