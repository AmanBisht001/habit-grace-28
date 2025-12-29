import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Target, Award, Calendar } from 'lucide-react';
import { Habit } from '@/types/habit';

interface DashboardProps {
  habits: Habit[];
  currentMonth: Date;
  getMonthlyStats: (month: Date) => { totalCompleted: number; totalGoals: number; percentage: number };
  getDailyStats: (month: Date) => Array<{ day: number; completed: number; total: number; percentage: number }>;
  getWeeklyStats: (month: Date) => Array<{ week: number; completed: number; total: number; percentage: number }>;
  getTopHabits: (month: Date) => Array<Habit & { completed: number; percentage: number }>;
}

export function Dashboard({ 
  currentMonth, 
  getMonthlyStats, 
  getDailyStats, 
  getWeeklyStats, 
  getTopHabits 
}: DashboardProps) {
  const monthlyStats = useMemo(() => getMonthlyStats(currentMonth), [getMonthlyStats, currentMonth]);
  const dailyStats = useMemo(() => getDailyStats(currentMonth), [getDailyStats, currentMonth]);
  const weeklyStats = useMemo(() => getWeeklyStats(currentMonth), [getWeeklyStats, currentMonth]);
  const topHabits = useMemo(() => getTopHabits(currentMonth), [getTopHabits, currentMonth]);

  const pieData = [
    { name: 'Completed', value: monthlyStats.totalCompleted, color: 'hsl(175, 70%, 45%)' },
    { name: 'Remaining', value: monthlyStats.totalGoals - monthlyStats.totalCompleted, color: 'hsl(220, 15%, 88%)' },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="text-sm font-medium">{payload[0].payload.day ? `Day ${payload[0].payload.day}` : `Week ${payload[0].payload.week}`}</p>
          <p className="text-xs text-muted-foreground">
            {payload[0].value} habits completed ({payload[0].payload.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-6">
      <h2 className="section-title mb-6 flex items-center gap-2">
        <span className="text-2xl">📈</span>
        Dashboard
      </h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="stat-card"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Target size={16} />
            <span className="stat-label">Completion Rate</span>
          </div>
          <div className="stat-value">{monthlyStats.percentage}%</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="stat-card"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp size={16} />
            <span className="stat-label">Habits Done</span>
          </div>
          <div className="stat-value">{monthlyStats.totalCompleted}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="stat-card"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar size={16} />
            <span className="stat-label">Total Goals</span>
          </div>
          <div className="stat-value">{monthlyStats.totalGoals}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="stat-card"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Award size={16} />
            <span className="stat-label">Best Week</span>
          </div>
          <div className="stat-value">
            W{weeklyStats.reduce((max, w) => w.percentage > max.percentage ? w : max, weeklyStats[0])?.week || 1}
          </div>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Donut Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-muted/30 rounded-2xl p-4"
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Monthly Progress</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground">Done</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-muted" />
              <span className="text-xs text-muted-foreground">Left</span>
            </div>
          </div>
        </motion.div>

        {/* Area Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-muted/30 rounded-2xl p-4"
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Daily Trend</h3>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={dailyStats.slice(0, 15)}>
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(175, 70%, 45%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(175, 70%, 45%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(220, 10%, 50%)' }} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="completed" 
                stroke="hsl(175, 70%, 45%)" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorCompleted)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-muted/30 rounded-2xl p-4"
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Weekly Performance</h3>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={weeklyStats}>
              <XAxis 
                dataKey="week" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: 'hsl(220, 10%, 50%)' }}
                tickFormatter={(value) => `W${value}`}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="completed" 
                fill="hsl(175, 70%, 45%)" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Top Habits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-muted/30 rounded-2xl p-4"
      >
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Top Performers</h3>
        <div className="space-y-3">
          {topHabits.map((habit, index) => (
            <div key={habit.id} className="flex items-center gap-3">
              <span className="text-lg font-bold text-primary w-6">#{index + 1}</span>
              <span className="text-xl">{habit.emoji}</span>
              <span className="text-sm font-medium flex-1">{habit.name}</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${habit.percentage}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-muted-foreground w-10">
                  {habit.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
