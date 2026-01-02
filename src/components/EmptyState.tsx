import { motion } from 'framer-motion';
import { Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  type: 'no-habits' | 'no-activity' | 'no-results';
  onAction?: () => void;
}

const emptyStates = {
  'no-habits': {
    emoji: '🌱',
    title: 'No habits yet',
    description: 'Start building better habits today. Add your first habit to begin tracking your progress.',
    actionLabel: 'Add Your First Habit',
    actionIcon: Plus,
  },
  'no-activity': {
    emoji: '📅',
    title: 'No activity this week',
    description: 'This week has no tracked habits yet. Navigate to the current week to start logging.',
    actionLabel: 'Go to Today',
    actionIcon: Calendar,
  },
  'no-results': {
    emoji: '🔍',
    title: 'No habits found',
    description: 'No habits match your search. Try adjusting your search or filters.',
    actionLabel: undefined,
    actionIcon: undefined,
  },
};

export function EmptyState({ type, onAction }: EmptyStateProps) {
  const state = emptyStates[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-8 sm:py-12 px-4 text-center"
    >
      <motion.span 
        className="text-5xl sm:text-6xl mb-4"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        {state.emoji}
      </motion.span>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {state.title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-4">
        {state.description}
      </p>
      {state.actionLabel && onAction && (
        <Button onClick={onAction} className="gap-2">
          {state.actionIcon && <state.actionIcon className="w-4 h-4" />}
          {state.actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
