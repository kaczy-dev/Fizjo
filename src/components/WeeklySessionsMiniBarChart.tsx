import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ReferenceLine
} from 'recharts';
import { Target, CheckCircle2, Calendar, TrendingUp, Award } from 'lucide-react';
import { TrainingDay } from '../types';

interface Props {
  completedDates?: string[];
  planDays?: TrainingDay[];
  targetGoal?: number; // default 5 sessions
  className?: string;
  onNavigateToPlan?: () => void;
}

interface WeekDayBarData {
  dayIndex: number;
  dayShort: string;
  dayFull: string;
  dateStr: string;
  displayDate: string;
  isToday: boolean;
  isCompleted: boolean;
  completedValue: number; // 1 or 0
  targetValue: number; // 1
}

export const WeeklySessionsMiniBarChart: React.FC<Props> = ({
  completedDates = [],
  planDays = [],
  targetGoal = 5,
  className = '',
  onNavigateToPlan
}) => {
  // Compute the 7 days of the current week (Monday to Sunday)
  const weekData = useMemo(() => {
    const now = new Date();
    // Monday is 1, Sunday is 0 -> adjust so Monday is day 0
    const dayOfWeek = now.getDay();
    const distanceToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);
    monday.setHours(0, 0, 0, 0);

    const todayStr = now.toISOString().split('T')[0];
    const daysShort = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nie'];
    const daysFull = [
      'Poniedziałek',
      'Wtorek',
      'Środa',
      'Czwartek',
      'Piątek',
      'Sobota',
      'Niedziela'
    ];

    const result: WeekDayBarData[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const isToday = dateStr === todayStr;

      // Check if session is completed for this date
      const isDateCompleted = completedDates.includes(dateStr);
      const planDayCompleted = planDays[i]?.completed ?? false;
      const isCompleted = isDateCompleted || (isToday && planDayCompleted);

      result.push({
        dayIndex: i,
        dayShort: daysShort[i],
        dayFull: daysFull[i],
        dateStr,
        displayDate: d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' }),
        isToday,
        isCompleted,
        completedValue: isCompleted ? 1 : 0,
        targetValue: 1
      });
    }

    return result;
  }, [completedDates, planDays]);

  const completedCount = useMemo(() => {
    return weekData.filter(d => d.isCompleted).length;
  }, [weekData]);

  const percentage = Math.min(100, Math.round((completedCount / targetGoal) * 100));
  const isGoalReached = completedCount >= targetGoal;

  return (
    <div
      id="weekly-sessions-bar-card"
      className={`bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs ${className}`}
    >
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Sesje w Bieżącym Tygodniu
            </h3>
            {isGoalReached && (
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <Award className="w-3 h-3" />
                Cel osiągnięty!
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Wizualizacja wykonanych jednostek rehabilitacyjnych w relacji do tygodniowego celu.
          </p>
        </div>

        {/* Goal Indicator Pill */}
        <div className="flex items-center gap-3 self-start sm:self-center bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl px-3.5 py-2">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{completedCount}</span>
              <span className="text-slate-400">/</span>
              <span className="text-teal-600 dark:text-teal-400">{targetGoal} sesji</span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              {percentage}% celu ({isGoalReached ? 'zrealizowano' : `pozostało ${Math.max(0, targetGoal - completedCount)}`})
            </div>
          </div>

          <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
            {percentage}%
          </div>
        </div>
      </div>

      {/* Mini Bar Chart */}
      <div className="h-32 sm:h-36 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={weekData}
            margin={{ top: 10, right: 8, left: -20, bottom: 0 }}
            barCategoryGap="20%"
          >
            <XAxis
              dataKey="dayShort"
              axisLine={false}
              tickLine={false}
              tick={({ x, y, payload }) => {
                const dayItem = weekData.find(d => d.dayShort === payload.value);
                const isToday = dayItem?.isToday;
                const isCompleted = dayItem?.isCompleted;
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      x={0}
                      y={14}
                      textAnchor="middle"
                      className={`text-[11px] font-semibold ${
                        isToday
                          ? 'fill-teal-600 dark:fill-teal-400 font-bold'
                          : isCompleted
                          ? 'fill-slate-800 dark:fill-slate-200'
                          : 'fill-slate-400 dark:fill-slate-500'
                      }`}
                    >
                      {payload.value}
                    </text>
                    {isToday && (
                      <circle cx={0} cy={22} r={2} className="fill-teal-600 dark:fill-teal-400" />
                    )}
                  </g>
                );
              }}
            />
            <YAxis
              domain={[0, 1]}
              ticks={[0, 1]}
              axisLine={false}
              tickLine={false}
              tick={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(15, 118, 110, 0.06)' }}
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const data = payload[0].payload as WeekDayBarData;
                return (
                  <div className="bg-slate-900 text-white text-xs rounded-xl p-2.5 shadow-xl border border-slate-700 min-w-[140px] space-y-1">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1">
                      <span className="font-bold">{data.dayFull}</span>
                      <span className="text-[10px] text-slate-400">{data.displayDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      {data.isCompleted ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="text-emerald-300 font-semibold text-[11px]">
                            Sesja wykonana ✓
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-500 shrink-0" />
                          <span className="text-slate-300 text-[11px]">
                            {data.isToday ? 'Zaplanowana na dziś' : 'Brak sesji'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="completedValue"
              radius={[6, 6, 2, 2]}
              maxBarSize={36}
            >
              {weekData.map((entry, index) => {
                let fill = entry.isCompleted
                  ? '#0d9488' // Teal-600
                  : entry.isToday
                  ? '#94a3b8' // Slate-400
                  : '#e2e8f0'; // Slate-200
                return (
                  <Cell
                    key={`bar-cell-${index}`}
                    fill={fill}
                    className={entry.isCompleted ? 'hover:opacity-90 transition-opacity' : ''}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Legend & Action */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-teal-600 inline-block" />
            <span>Wykonana sesja</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-slate-200 dark:bg-slate-700 inline-block" />
            <span>Dzień bez sesji</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-600 inline-block" />
            <span>Dzisiaj</span>
          </div>
        </div>

        {onNavigateToPlan && (
          <button
            type="button"
            onClick={onNavigateToPlan}
            className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Kalendarz i plan →</span>
          </button>
        )}
      </div>
    </div>
  );
};
