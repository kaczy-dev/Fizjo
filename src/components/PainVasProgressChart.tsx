import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';
import { 
  Activity, TrendingDown, TrendingUp, ShieldCheck, 
  Calendar, Plus, Sliders, CheckCircle2, ChevronDown 
} from 'lucide-react';
import { PainReport } from '../types';

interface Props {
  painHistory: PainReport[];
  onNavigateToTriage?: () => void;
  onAddPainReport?: (score: number, note?: string) => void;
}

export const PainVasProgressChart: React.FC<Props> = ({ 
  painHistory, 
  onNavigateToTriage,
  onAddPainReport 
}) => {
  const [chartType, setChartType] = useState<'line' | 'area'>('line');
  const [showQuickAdd, setShowQuickAdd] = useState<boolean>(false);
  const [quickVasScore, setQuickVasScore] = useState<number>(4);
  const [quickNote, setQuickNote] = useState<string>('');

  // Sort pain reports chronologically
  const sortedReports = React.useMemo(() => {
    return [...painHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [painHistory]);

  const chartData = React.useMemo(() => {
    return sortedReports.map((report, idx) => {
      const d = new Date(report.date);
      const formattedDate = d.toLocaleDateString('pl-PL', {
        day: '2-digit',
        month: '2-digit'
      });
      const fullDate = d.toLocaleDateString('pl-PL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      return {
        id: report.id,
        index: idx + 1,
        dateStr: formattedDate,
        fullDate,
        vas: report.vasScore,
        character: report.character,
        region: report.region,
        suspicion: report.aiAnalysis?.primarySuspicion || 'Ocena bólu karku/kręgosłupa'
      };
    });
  }, [sortedReports]);

  // Compute stats
  const firstScore = chartData.length > 0 ? chartData[0].vas : 0;
  const latestScore = chartData.length > 0 ? chartData[chartData.length - 1].vas : 0;
  const scoreDiff = latestScore - firstScore;
  const isImproved = scoreDiff < 0;

  const averageVas = chartData.length > 0
    ? (chartData.reduce((acc, curr) => acc + curr.vas, 0) / chartData.length).toFixed(1)
    : '0';

  const getVasBadge = (vas: number) => {
    if (vas <= 3) return { label: 'Ból łagodny (0-3)', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800' };
    if (vas <= 6) return { label: 'Ból umiarkowany (4-6)', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800' };
    return { label: 'Ból ostry / alarmowy (7-10)', color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800' };
  };

  const handleSaveQuickEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddPainReport) {
      onAddPainReport(quickVasScore, quickNote.trim() || undefined);
      setShowQuickAdd(false);
      setQuickNote('');
    }
  };

  return (
    <div id="pain-vas-chart-container" className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-semibold mb-1.5">
            <Activity className="w-3.5 h-3.5 text-teal-600" />
            <span>Wykres Liniowy Recharts • Skala Bólu VAS (0–10)</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            Wizualizacja Zmian Punktacji VAS w Czasie
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
            Interaktywny wykres liniowy oparty na bibliotece Recharts, prezentujący dynamikę natężenia dolegliwości bólowych odcinka szyjnego i karku w trakcie terapii.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
          {/* Chart Style Toggle */}
          <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setChartType('line')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                chartType === 'line'
                  ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Linia
            </button>
            <button
              type="button"
              onClick={() => setChartType('area')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                chartType === 'area'
                  ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Linia ze wstęgą
            </button>
          </div>

          {/* Quick Add Score Button */}
          {onAddPainReport && (
            <button
              type="button"
              onClick={() => setShowQuickAdd(!showQuickAdd)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Dodaj pomiar VAS</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Add VAS Form (Collapsible) */}
      {showQuickAdd && (
        <form 
          onSubmit={handleSaveQuickEntry}
          className="p-4 sm:p-5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/70 space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-teal-950 dark:text-teal-200 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-teal-600" />
              Szybka rejestracja punktu na wykresie VAS
            </h4>
            <button
              type="button"
              onClick={() => setShowQuickAdd(false)}
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Anuluj
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            <div className="sm:col-span-6 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Poziom bólu:</span>
                <span className="font-black text-sm font-mono text-teal-700 dark:text-teal-300">
                  {quickVasScore} / 10 VAS ({getVasBadge(quickVasScore).label})
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={quickVasScore}
                onChange={(e) => setQuickVasScore(parseInt(e.target.value, 10))}
                className="w-full accent-teal-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0 (brak)</span>
                <span>5 (średni)</span>
                <span>10 (maksymalny)</span>
              </div>
            </div>

            <div className="sm:col-span-4">
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Komentarz (opcjonalnie):
              </label>
              <input
                type="text"
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                placeholder="np. Po 4 godzinach pracy przy laptopie"
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Zapisz</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Stats Summary Pills */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Ostatni pomiar
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">
                {latestScore}
              </span>
              <span className="text-xs font-semibold text-slate-400">/ 10 VAS</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Średnia bólu
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">
                {averageVas}
              </span>
              <span className="text-xs font-semibold text-slate-400">VAS</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Zmiana całkowita
            </span>
            <div className="flex items-center gap-1 mt-0.5 text-xs font-black font-mono">
              {scoreDiff === 0 ? (
                <span className="text-slate-600 dark:text-slate-300">Stabilna (0 pkt)</span>
              ) : isImproved ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                  <TrendingDown className="w-3.5 h-3.5" />
                  {scoreDiff} pkt
                </span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400 flex items-center gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +{scoreDiff} pkt
                </span>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Liczba pomiarów
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">
                {chartData.length}
              </span>
              <span className="text-xs font-semibold text-slate-400">wpisów</span>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {chartData.length === 0 ? (
        <div className="p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 mx-auto flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Brak zarejestrowanych wpisów w historii bólu
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Wykonaj bezpłatną analizę bólu w zakładce &quot;Analiza Bólu AI&quot; lub dodaj punkt pomiarowy powyższym przyciskiem, aby narysować wykres liniowy.
          </p>
          {onNavigateToTriage && (
            <button
              type="button"
              onClick={onNavigateToTriage}
              className="mt-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-xs"
            >
              Przeprowadź wywiad bólu teraz
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Recharts Canvas */}
          <div className="h-64 sm:h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart
                  data={chartData}
                  margin={{ top: 15, right: 20, bottom: 20, left: -20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="currentColor"
                    className="text-slate-200 dark:text-slate-800"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="dateStr"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                    dy={8}
                  />

                  <YAxis
                    domain={[0, 10]}
                    ticks={[0, 2, 4, 6, 8, 10]}
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />

                  {/* Reference Bands for VAS Severity */}
                  <ReferenceLine
                    y={3}
                    stroke="#10b981"
                    strokeDasharray="3 3"
                    strokeOpacity={0.7}
                    label={{
                      value: 'Łagodny (≤3)',
                      position: 'insideTopRight',
                      fill: '#10b981',
                      fontSize: 10
                    }}
                  />

                  <ReferenceLine
                    y={6}
                    stroke="#f59e0b"
                    strokeDasharray="3 3"
                    strokeOpacity={0.7}
                    label={{
                      value: 'Umiarkowany (4-6)',
                      position: 'insideTopRight',
                      fill: '#f59e0b',
                      fontSize: 10
                    }}
                  />

                  <ReferenceLine
                    y={7}
                    stroke="#f43f5e"
                    strokeDasharray="3 3"
                    strokeOpacity={0.7}
                    label={{
                      value: 'Silny (≥7)',
                      position: 'insideTopRight',
                      fill: '#f43f5e',
                      fontSize: 10
                    }}
                  />

                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const badge = getVasBadge(data.vas);
                        return (
                          <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 text-xs space-y-1.5 min-w-[200px]">
                            <div className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{data.fullDate}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3 pt-0.5">
                              <span className="font-bold text-sm">Wynik VAS:</span>
                              <span className="text-base font-black font-mono text-teal-300">
                                {data.vas} / 10
                              </span>
                            </div>
                            <div className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${badge.color}`}>
                              {badge.label}
                            </div>
                            <div className="text-[11px] text-slate-300 pt-1 border-t border-slate-800">
                              <strong>Podejrzenie / Opis:</strong> {data.suspicion}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="vas"
                    name="Skala Bólu VAS"
                    stroke="#0d9488"
                    strokeWidth={3}
                    dot={{
                      r: 5,
                      fill: '#0d9488',
                      stroke: '#ffffff',
                      strokeWidth: 2
                    }}
                    activeDot={{
                      r: 7,
                      fill: '#0f766e',
                      stroke: '#ffffff',
                      strokeWidth: 2
                    }}
                  />
                </LineChart>
              ) : (
                <ComposedChart
                  data={chartData}
                  margin={{ top: 15, right: 20, bottom: 20, left: -20 }}
                >
                  <defs>
                    <linearGradient id="painVasGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="currentColor"
                    className="text-slate-200 dark:text-slate-800"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="dateStr"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                    dy={8}
                  />

                  <YAxis
                    domain={[0, 10]}
                    ticks={[0, 2, 4, 6, 8, 10]}
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />

                  {/* Reference Bands for VAS Severity */}
                  <ReferenceLine
                    y={3}
                    stroke="#10b981"
                    strokeDasharray="3 3"
                    strokeOpacity={0.7}
                    label={{
                      value: 'Łagodny (≤3)',
                      position: 'insideTopRight',
                      fill: '#10b981',
                      fontSize: 10
                    }}
                  />

                  <ReferenceLine
                    y={6}
                    stroke="#f59e0b"
                    strokeDasharray="3 3"
                    strokeOpacity={0.7}
                    label={{
                      value: 'Umiarkowany (4-6)',
                      position: 'insideTopRight',
                      fill: '#f59e0b',
                      fontSize: 10
                    }}
                  />

                  <ReferenceLine
                    y={7}
                    stroke="#f43f5e"
                    strokeDasharray="3 3"
                    strokeOpacity={0.7}
                    label={{
                      value: 'Silny (≥7)',
                      position: 'insideTopRight',
                      fill: '#f43f5e',
                      fontSize: 10
                    }}
                  />

                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const badge = getVasBadge(data.vas);
                        return (
                          <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 text-xs space-y-1.5 min-w-[200px]">
                            <div className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{data.fullDate}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3 pt-0.5">
                              <span className="font-bold text-sm">Wynik VAS:</span>
                              <span className="text-base font-black font-mono text-teal-300">
                                {data.vas} / 10
                              </span>
                            </div>
                            <div className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${badge.color}`}>
                              {badge.label}
                            </div>
                            <div className="text-[11px] text-slate-300 pt-1 border-t border-slate-800">
                              <strong>Podejrzenie / Opis:</strong> {data.suspicion}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="vas"
                    stroke="#0d9488"
                    strokeWidth={0}
                    fillOpacity={1}
                    fill="url(#painVasGradient)"
                  />

                  <Line
                    type="monotone"
                    dataKey="vas"
                    name="Skala Bólu VAS"
                    stroke="#0d9488"
                    strokeWidth={3}
                    dot={{
                      r: 5,
                      fill: '#0d9488',
                      stroke: '#ffffff',
                      strokeWidth: 2
                    }}
                    activeDot={{
                      r: 7,
                      fill: '#0f766e',
                      stroke: '#ffffff',
                      strokeWidth: 2
                    }}
                  />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* VAS Legend & Clinical Interpretation */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40">
              <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
              <div>
                <span className="font-bold text-emerald-900 dark:text-emerald-200">0 – 3 pkt VAS</span>
                <p className="text-[10px] text-emerald-700 dark:text-emerald-400">Ból lekki / dyskomfort spoczynkowy</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40">
              <div className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
              <div>
                <span className="font-bold text-amber-900 dark:text-amber-200">4 – 6 pkt VAS</span>
                <p className="text-[10px] text-amber-700 dark:text-amber-400">Ból umiarkowany, ogranicza ruch</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40">
              <div className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
              <div>
                <span className="font-bold text-rose-900 dark:text-rose-200">7 – 10 pkt VAS</span>
                <p className="text-[10px] text-rose-700 dark:text-rose-400">Ból silny / ostry, wymaga ostrożności</p>
              </div>
            </div>
          </div>

          {/* Clinical summary notes */}
          <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-900/60 text-xs flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
            <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
              <span className="font-bold text-teal-900 dark:text-teal-200">Wnioski kinezjologiczne: </span>
              {isImproved ? (
                <span>
                  Odnotowano spadek natężenia dolegliwości o <strong className="text-emerald-600 dark:text-emerald-400">{Math.abs(scoreDiff)} pkt VAS</strong>. Wdrożone ćwiczenia odciążające przynoszą wymierny skutek terapeutyczny.
                </span>
              ) : (
                <span>
                  Poziom dolegliwości utrzymuje się na poziomie <strong className="text-slate-900 dark:text-white">{latestScore} VAS</strong>. Zalecana jest weryfikacja ergonomii stanowiska pracy oraz regularne mikropauzy odciążające co 45 minut.
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
