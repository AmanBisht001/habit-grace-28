import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Cloud } from 'lucide-react';

interface SaveIndicatorProps {
  lastSaved: Date | null;
}

export function SaveIndicator({ lastSaved }: SaveIndicatorProps) {
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (lastSaved) {
      setShowSaved(true);
      const timer = setTimeout(() => setShowSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastSaved]);

  return (
    <AnimatePresence>
      {showSaved && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 bg-card/90 backdrop-blur-lg border border-border/50 rounded-xl shadow-lg"
        >
          <Cloud className="w-4 h-4 text-success" />
          <Check className="w-3 h-3 text-success" />
          <span className="text-xs text-muted-foreground">Changes saved</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
