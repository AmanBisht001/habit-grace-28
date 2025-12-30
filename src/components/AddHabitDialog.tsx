import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface AddHabitDialogProps {
  onAddHabit: (habit: { name: string; emoji: string; monthlyGoal: number }) => void;
}

const EMOJI_OPTIONS = ['💪', '🏃', '📚', '💧', '🧘', '🎯', '✨', '🌟', '💡', '🎨', '🎵', '💤', '🥗', '🚶', '🧠', '⏰', '📝', '🎮', '🌿', '❤️'];

export function AddHabitDialog({ onAddHabit }: AddHabitDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('💪');
  const [monthlyGoal, setMonthlyGoal] = useState(30);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter a habit name');
      return;
    }
    
    if (monthlyGoal < 1 || monthlyGoal > 31) {
      toast.error('Monthly goal must be between 1 and 31');
      return;
    }

    onAddHabit({ name: name.trim(), emoji, monthlyGoal });
    toast.success('Habit added successfully!');
    
    // Reset form
    setName('');
    setEmoji('💪');
    setMonthlyGoal(30);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2 border-dashed border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50"
        >
          <Plus className="w-4 h-4" />
          Add Habit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] glass-card-elevated">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <span className="text-2xl">➕</span>
            Add New Habit
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="emoji" className="text-sm font-medium">Choose an Emoji</Label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((e) => (
                <motion.button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
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
              onChange={(e) => setMonthlyGoal(parseInt(e.target.value) || 1)}
              className="h-11"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 gap-2">
              <Plus className="w-4 h-4" />
              Add Habit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
