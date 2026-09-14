import React from 'react';
import { 
  Sparkles, TrendingDown, TrendingUp, Minus, ShieldCheck, 
  CheckCircle2, AlertTriangle, Clock, ArrowRight, X, Download, 
  FileText, Activity, HeartPulse 
} from 'lucide-react';
import { PlanIntensityAiResult } from '../services/freePlanIntensityAi';

interface Props {
  aiResult: PlanIntensityAiResult;
  onApplyIntensity: () => void;
  onClose: () => void;
  onDownloadPhysioPdf?: () => void;
}

export const PlanIntensityAiModal: React.FC<Props> = ({
  aiResult,
  onApplyIntensity,
  onClose,
  onDownloadPhysioPdf
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                <span>Darmowa AI Kinezjologiczna • On-Device</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Adaptacja Intensywności Planu
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Analiza ostatnich 3 raportów bólu */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-teal-600" />
              <span>Analiza ostatnich {aiResult.reportsAnalyzedCount} raportów bólu pacjenta:</span>
            </span>
            <span className="font-mono text-slate-500">
              Średnia: <strong className="text-slate-900 dark:text-white font-bold">{aiResult.avgVas}/10 VAS</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {aiResult.recentReports.map((rep, idx) => (
              <div 
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    Raport #{idx + 1}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md font-bold font-mono text-[11px] ${
                    rep.vas <= 3 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                      : rep.vas <= 6 
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' 
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}>
                    {rep.vas}/10 VAS
                  </span>
                </div>
                <div className="font-semibold text-slate-900 dark:text-white truncate" title={rep.regionPl}>
                  {rep.regionPl}
                </div>
                <div className="text-[11px] text-slate-500 truncate" title={rep.characterPl}>
                  {rep.characterPl}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {rep.date}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Wykryty trend i Rekomendacja AI */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/90 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Trend dolegliwości:</span>
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-slate-200/80 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                {aiResult.trend === 'improving' ? (
                  <>
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Poprawa (Ból maleje)</span>
                  </>
                ) : aiResult.trend === 'worsening' ? (
                  <>
                    <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
                    <span>Zaostrzenie (Ból rośnie)</span>
                  </>
                ) : (
                  <>
                    <Minus className="w-3.5 h-3.5 text-sky-500" />
                    <span>Stabilny</span>
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Przeliczona intensywność:</span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${aiResult.badgeColor}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{aiResult.levelNamePl}</span>
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {aiResult.aiRationale}
            </p>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 flex items-center gap-2 font-mono text-[11px]">
              <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>{aiResult.recommendedHoldSecondsAdjustment} • Przerwy w pracy co {aiResult.recommendedBreakIntervalMin} min</span>
            </div>
          </div>

          {/* Cele biomechaniczne */}
          <div className="space-y-1.5 pt-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Główne cele biomechaniczne dobrane przez AI:
            </span>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700 dark:text-slate-300">
              {aiResult.biomechanicalGoals.map((goal, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                  <span>{goal}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Ostrzeżenie przy ostrym bólu */}
          {aiResult.cautionNotice && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{aiResult.cautionNotice}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {onDownloadPhysioPdf ? (
            <button
              type="button"
              onClick={onDownloadPhysioPdf}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-teal-600" />
              <span>Raport PDF dla Fizjoterapeuty</span>
            </button>
          ) : <div />}

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
            >
              Anuluj
            </button>

            <button
              type="button"
              onClick={onApplyIntensity}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md hover:shadow-teal-500/25 transition-all cursor-pointer"
            >
              <span>Zastosuj przeliczoną intensywność</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
