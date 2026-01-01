import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Sparkles, LayoutGrid, BarChart3 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ProgressRing } from './ProgressRing';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '@/lib/utils';

interface HeaderProps {
  currentMonth: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  monthlyPercentage: number;
}

export function Header({ currentMonth, onPreviousMonth, onNextMonth, monthlyPercentage }: HeaderProps) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Tracker', icon: LayoutGrid },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card-elevated px-3 sm:px-6 py-3 sm:py-4 mb-4 sm:mb-6 flex flex-col sm:flex-row items-center gap-3 sm:gap-0 sm:justify-between sticky top-2 sm:top-4 z-10"
    >
      {/* Top row on mobile: Logo + Navigation */}
      <div className="flex items-center justify-between w-full sm:w-auto gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          <h1 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-glow">
            HabitFlow
          </h1>
        </div>

        <div className="flex items-center gap-1">
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'rounded-xl gap-1 sm:gap-2 transition-all px-2 sm:px-3',
                      isActive 
                        ? 'bg-primary/10 text-primary hover:bg-primary/15' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="hidden xs:inline text-xs sm:text-sm">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>
          <ThemeToggle />
        </div>
      </div>

      {/* Bottom row on mobile: Month switcher + Progress */}
      <div className="flex items-center justify-between w-full sm:w-auto gap-2 sm:gap-4">
        <div className="flex items-center gap-1 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPreviousMonth}
            className="rounded-xl hover:bg-muted h-8 w-8 sm:h-10 sm:w-10"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          
          <div className="text-center min-w-[100px] sm:min-w-[140px]">
            <h2 className="text-sm sm:text-lg font-semibold">{format(currentMonth, 'MMM yyyy')}</h2>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onNextMonth}
            className="rounded-xl hover:bg-muted h-8 w-8 sm:h-10 sm:w-10"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-right">
            <p className="text-[10px] sm:text-xs text-muted-foreground">Progress</p>
            <p className="text-sm sm:text-lg font-bold text-primary">{monthlyPercentage}%</p>
          </div>
          <ProgressRing percentage={monthlyPercentage} size={36} strokeWidth={3} />
        </div>
      </div>
    </motion.header>
  );
}
