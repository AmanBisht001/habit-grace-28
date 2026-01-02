import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X, Lock, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PrivacyInfo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Shield className="w-3.5 h-3.5" />
        <span>Privacy & Data</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card-elevated w-full max-w-md p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">
                  Privacy & Data
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="p-2 rounded-lg bg-success/10 h-fit">
                    <HardDrive className="w-4 h-4 text-success" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground text-sm">Local Storage Only</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      All your habit data is stored locally on your device. Nothing is sent to any server.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 h-fit">
                    <Lock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground text-sm">Your Data, Your Control</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      We don't collect, share, or sell any of your personal data. Your habits are completely private.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-foreground">Note:</strong> Clearing your browser data will delete your habit history. Consider exporting your data if you need a backup.
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setIsOpen(false)}
                className="w-full mt-4"
              >
                Got it
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
