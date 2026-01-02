import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    // Check initial state
    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto z-50"
        >
          <div className="glass-card-elevated px-4 py-3 flex items-center gap-3 text-warning border-warning/30">
            <WifiOff className="w-4 h-4 shrink-0" />
            <div className="text-sm">
              <p className="font-medium">You're offline</p>
              <p className="text-xs text-muted-foreground">Changes are saved locally</p>
            </div>
          </div>
        </motion.div>
      )}
      
      {showReconnected && isOnline && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto z-50"
        >
          <div className="glass-card-elevated px-4 py-3 flex items-center gap-3 text-success border-success/30">
            <Wifi className="w-4 h-4 shrink-0" />
            <p className="text-sm font-medium">Back online</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
