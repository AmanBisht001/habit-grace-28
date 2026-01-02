import { useState } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export type HabitFilter = 'all' | 'pending' | 'active';

interface HabitSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filter: HabitFilter;
  onFilterChange: (filter: HabitFilter) => void;
}

export function HabitSearch({ 
  searchQuery, 
  onSearchChange, 
  filter, 
  onFilterChange 
}: HabitSearchProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="flex items-center gap-2 mb-3">
      <div className={cn(
        "relative flex-1 transition-all duration-200",
        isFocused && "ring-2 ring-primary/20 rounded-lg"
      )}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search habits..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="pl-9 pr-8 h-9 text-sm"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className={cn(
              "h-9 w-9 shrink-0",
              filter !== 'all' && "border-primary/50 bg-primary/5"
            )}
          >
            <Filter className={cn(
              "w-4 h-4",
              filter !== 'all' && "text-primary"
            )} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Filter by
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={filter === 'all'}
            onCheckedChange={() => onFilterChange('all')}
          >
            All habits
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filter === 'pending'}
            onCheckedChange={() => onFilterChange('pending')}
          >
            Pending today
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filter === 'active'}
            onCheckedChange={() => onFilterChange('active')}
          >
            Active streaks
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
