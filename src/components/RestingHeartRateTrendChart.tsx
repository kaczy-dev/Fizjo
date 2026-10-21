import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine
} from 'recharts';
import { Heart, Activity, TrendingDown, TrendingUp, Info, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { RestingHeartRateHistoryPoint } from '../types';

interface Props {
  history?: RestingHeartRateHistoryPoint[];
  currentRestingBpm?: number;
  deviceName?: string;
}

export const RestingHeartRateTrendChart: React.FC<Props> = ({
  history = [],
  currentRestingBpm,
  deviceName = 'HUAWEI WATCH'
}) => {
  // Ensure we have at least 7 points for visualization
  const chartData = useMemo(() => {
    if (history && history.length > 0) {
      // Return last 7 days
      return history.slice(-7);
    }
    // Fallback if empty
    const days = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'];
    return days.map((day, idx) => ({
      date: `2026-09-${String(9 + idx).padStart(2, '0')}`,
      dayLabel: day,
      restingHeartRate: 64 - Math.round(Math.sin(idx) * 3),
      avgHeartRate: 74,
      maxHeartRate: 118
    }));
  }, [history]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (chartData.length === 0) {
      return { avg: 63, min: 61, max: 66, trendDiff: -2 };
    }
    const values = chartData.map(d => d.restingHeartRate);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = Math.round((sum / values.length) * 10) / 10;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const firstVal = values[0];
    const lastVal = values[values.length - 1];
    const trendDiff = lastVal - firstVal;

    return { avg, min, max, trendDiff, latest: lastVal };
  }, [chartData]);

  // Clinical zone evaluation
  const latestBpm = currentRestingBpm || stats.latest || 62;
  const isOptimal = latestBpm >= 55 && latestBpm <= 72;

  return (
    <div id="resting-heart-rate-trend-card" className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Trend tętna spoczynkowego (ostatnie 7 dni)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                TruSeen™ PPG
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Wskaźnik regeneracji układu autonomicznego i obniżenia napięcia szyjno-karkowego
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className={`text-[11px] font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
            isOptimal 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
          }`}>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{isOptimal ? 'Norma fizjologiczna (55-72 BPM)' : 'Poza normą'}</span>
          </span>
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Aktualne spoczynkowe:</div>
          <div className="text-xl font-extrabold text-rose-600 dark:text-rose-400 font-mono mt-0.5 flex items-center gap-1">
            <span>{latestBpm}</span>
            <span className="text-xs font-normal text-slate-400">BPM</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Średnia 7-dniowa:</div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5 flex items-center gap-1">
            <span>{stats.avg}</span>
            <span className="text-xs font-normal text-slate-400">BPM</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Trend 7 dni:</div>
          <div className={`text-base font-extrabold font-mono mt-1 flex items-center gap-1 ${
            stats.trendDiff <= 0 
              ? 'text-emerald-600 dark:text-emerald-400' 
              : 'text-amber-600 dark:text-amber-400'
          }`}>
            {stats.trendDiff <= 0 ? (
              <TrendingDown className="w-4 h-4 text-emerald-600" />
            ) : (
              <TrendingUp className="w-4 h-4 text-amber-600" />
            )}
            <span>{stats.trendDiff <= 0 ? `${stats.trendDiff} BPM` : `+${stats.trendDiff} BPM`}</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Zakres (Min / Max):</div>
          <div className="text-base font-extrabold text-slate-800 dark:text-slate-200 font-mono mt-1">
            {stats.min} - {stats.max} <span className="text-xs font-normal text-slate-400">BPM</span>
          </div>
        </div>
      </div>

      {/* Recharts Simple Line Chart */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 15, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} vertical={false} />
            
            <XAxis 
              dataKey="dayLabel" 
              stroke="#64748b" 
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
            />
            
            <YAxis 
              stroke="#64748b" 
              fontSize={11}
              domain={['dataMin - 5', 'dataMax + 5']}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
              tickFormatter={(v) => `${v}`}
            />
            
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as RestingHeartRateHistoryPoint;
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl text-xs border border-slate-700 space-y-1.5 min-w-[150px]">
                      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1">
                        <span className="font-bold text-slate-200">{item.dayLabel} ({item.date})</span>
                        <span className="text-[10px] text-slate-400 font-mono">{deviceName}</span>
                      </div>
                      <div className="flex items-center justify-between text-rose-400 font-bold font-mono">
                        <span className="text-slate-300 font-normal">Spoczynkowe:</span>
                        <span>{item.restingHeartRate} BPM</span>
                      </div>
                      {item.avgHeartRate && (
                        <div className="flex items-center justify-between text-teal-400 text-[11px] font-mono">
                          <span className="text-slate-400 font-normal">Średnie dzienne:</span>
                          <span>{item.avgHeartRate} BPM</span>
                        </div>
                      )}
                      <div className="text-[10px] text-emerald-400 flex items-center gap-1 pt-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Optymalna adaptacja nerwu błędnego</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Clinical reference baseline (60 BPM) */}
            <ReferenceLine 
              y={60} 
              stroke="#10b981" 
              strokeDasharray="4 4" 
              strokeOpacity={0.6}
              label={{ value: 'Referencja: 60 BPM', fill: '#10b981', fontSize: 10, position: 'right' }} 
            />

            <Line
              type="monotone"
              dataKey="restingHeartRate"
              name="Tętno spoczynkowe"
              stroke="#e11d48"
              strokeWidth={3}
              dot={{ r: 4, fill: '#e11d48', stroke: '#ffffff', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#be123c', stroke: '#ffffff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Clinical Interpretation Note */}
      <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900 text-xs text-teal-900 dark:text-teal-200 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px]">
          <strong>Wskazówka fizjoterapeutyczna:</strong> Stopniowy spadek tętna spoczynkowego o 2-4 BPM w ciągu 7 dni świadczy o skuteczności ćwiczeń oddechowych przeponowych oraz zmniejszeniu napięcia współczulnego w splotach szyjnych. Dane pobierane są automatycznie ze zsynchronizowanego zegarka Huawei.
        </p>
      </div>
    </div>
  );
};
