import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Sparkles, ChevronDown, ChevronUp, Check, AlertTriangle, Activity, ArrowRight } from 'lucide-react';
import { AdaptiveVasResult } from '../services/adaptiveVasExerciseService';

interface Props {
  adaptiveResult: AdaptiveVasResult;
  useAdaptiveSelection: boolean;
  onToggleAdaptiveSelection: (enabled: boolean) => void;
  compact?: boolean;
}

export const AdaptiveVasExerciseCard: React.FC<Props> = ({
  adaptiveResult,
  useAdaptiveSelection,
  onToggleAdaptiveSelection,
  compact = false
}) => {
  const [showFullDetails, setShowFullDetails] = useState<boolean>(false);

  const isAcute = adaptiveResult.category === 'acute_protection';
  const isModerate = adaptiveResult.category === 'moderate_functional';

  return (
    <div
      id="adaptive-vas-exercise-card"
      className={`w-full rounded-2xl border transition-all text-left ${
        isAcute
          ? 'bg-rose-50/85 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900 shadow-xs'
          : isModerate
          ? 'bg-teal-50/85 dark:bg-teal-950/40 border-teal-300 dark:border-teal-900 shadow-xs'
          : 'bg-emerald-50/85 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-900 shadow-xs'
      } ${compact ? 'p-3' : 'p-4 sm:p-5'}`}
    >
      {/* Header with Icon, Title and Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-xl shrink-0 ${
              isAcute
                ? 'bg-rose-200/80 dark:bg-rose-900/80 text-rose-700 dark:text-rose-300'
                : isModerate
                ? 'bg-teal-200/80 dark:bg-teal-900/80 text-teal-700 dark:text-teal-300'
                : 'bg-emerald-200/80 dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300'
            }`}
          >
            {isAcute ? (
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            ) : isModerate ? (
              <ShieldCheck className="w-5 h-5" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${adaptiveResult.badgeColorClass}`}
              >
                {adaptiveResult.badgeLabel}
              </span>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                VAS {adaptiveResult.vasScore}/10
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {adaptiveResult.categoryTitle}
            </h4>
          </div>
        </div>

        {/* Toggle Switch */}
        <label className="flex items-center gap-2 cursor-pointer select-none shrink-0">
          <input
            id="toggle-adaptive-vas-input"
            type="checkbox"
            checked={useAdaptiveSelection}
            onChange={(e) => onToggleAdaptiveSelection(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-teal-600"></div>
          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 hidden sm:inline">
            {useAdaptiveSelection ? 'Aktywna adaptacja' : 'Wyłączona'}
          </span>
        </label>
      </div>

      {/* Clinical Rationale Text */}
      <p className="text-xs text-slate-700 dark:text-slate-300 mt-2.5 leading-relaxed">
        {adaptiveResult.clinicalRationale}
      </p>

      {/* If Acute Protection (VAS >= 7) and Adaptive is ON, highlight what was removed vs added */}
      {isAcute && useAdaptiveSelection && (
        <div className="mt-3 space-y-2 pt-2.5 border-t border-rose-200/80 dark:border-rose-900/60">
          {adaptiveResult.suppressedExerciseNames.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-rose-700 dark:text-rose-300 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                Wygaszono (ryzyko zaostrzenia):
              </span>
              {adaptiveResult.suppressedExerciseNames.map((name, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-rose-200/60 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200 line-through text-[11px]"
                >
                  {name}
                </span>
              ))}
            </div>
          )}

          {adaptiveResult.addedExerciseNames.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                Wdrożono odciążenie i trakcję:
              </span>
              {adaptiveResult.addedExerciseNames.map((name, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold text-[11px] border border-emerald-300 dark:border-emerald-800"
                >
                  {name}
                </span>
              ))}
            </div>
          )}

          {/* Quick Param badges */}
          <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-600 dark:text-slate-300">
            <span className="px-2 py-0.5 rounded-md bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 font-mono">
              Objętość: 1 seria na ćwiczenie
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 font-mono">
              Powtórzenia: 3-5 (redukcja o ~40%)
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 font-mono">
              Tempo: Poziom 1 (cykl 9.0s)
            </span>
          </div>
        </div>
      )}

      {/* List of Active Exercises Preview */}
      <div className="mt-3 pt-2.5 border-t border-slate-200/70 dark:border-slate-800/70 flex items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-[85%]">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
            Ćwiczenia w sesji ({adaptiveResult.adaptedExercises.length}):
          </span>
          {adaptiveResult.adaptedExercises.map((ex) => (
            <span
              key={ex.id}
              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 whitespace-nowrap shrink-0"
            >
              {ex.polishName}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowFullDetails(!showFullDetails)}
          className="text-[11px] font-bold text-teal-700 dark:text-teal-300 hover:underline flex items-center gap-0.5 shrink-0"
        >
          <span>{showFullDetails ? 'Zwiń' : 'Cele'}</span>
          {showFullDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Expandable Goals & Parameters */}
      {showFullDetails && (
        <div className="mt-2.5 p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
          <div className="font-bold text-slate-900 dark:text-white">
            Kliniczne cele biomechaniczne dla VAS {adaptiveResult.vasScore}/10:
          </div>
          <ul className="space-y-1 list-disc list-inside text-slate-700 dark:text-slate-300">
            {adaptiveResult.biomechanicalGoals.map((goal, i) => (
              <li key={i}>{goal}</li>
            ))}
          </ul>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/80 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Zasada bezpieczeństwa: </span>
            {adaptiveResult.parameterAdjustments.setsAdjustmentNotice} {adaptiveResult.parameterAdjustments.tempoAdjustmentNotice}
          </div>
        </div>
      )}
    </div>
  );
};
