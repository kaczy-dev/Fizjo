import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Target, Trophy, Clock, CheckCircle2, Sparkles, ChevronRight, Zap, Play } from 'lucide-react';
import { soundService } from '../services/soundService';

interface Props {
  streakDays: number;
  completedTodaySession: boolean;
  todayEstimatedMinutes: number;
  completedMicroBreaksCount?: number;
  totalCompletedSessions?: number;
  onStartSession?: () => void;
  onOpenAchievements?: () => void;
  className?: string;
}

export const DailyFitnessGoalRing: React.FC<Props> = ({
  streakDays,
  completedTodaySession,
  todayEstimatedMinutes = 12,
  completedMicroBreaksCount = 0,
  totalCompletedSessions = 0,
  onStartSession,
  onOpenAchievements,
  className = ''
}) => {
  // Configurable daily goal minutes (default 15 minutes)
  const [targetGoalMinutes, setTargetGoalMinutes] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('fizjo_daily_goal_minutes');
      return saved ? Number(saved) : 15;
    } catch {
      return 15;
    }
  });

  // Preview / force test streak fire mode
  const [previewFireEffect, setPreviewFireEffect] = useState<boolean>(false);

  const handleSetGoal = (mins: number) => {
    setTargetGoalMinutes(mins);
    soundService.playTick();
    try {
      localStorage.setItem('fizjo_daily_goal_minutes', mins.toString());
    } catch {
      // ignore
    }
  };

  // Calculate actual movement minutes completed today
  // 1) completed today session minutes
  // 2) each completed micro-break contributes ~1.5 min of postural activity
  const sessionMinutes = completedTodaySession ? Math.max(8, todayEstimatedMinutes) : 0;
  const microBreakMinutes = Math.min(10, Math.round(completedMicroBreaksCount * 1.5));
  const currentMovementMinutes = sessionMinutes + microBreakMinutes;

  const progressRatio = Math.min(1, currentMovementMinutes / targetGoalMinutes);
  const progressPercent = Math.round(progressRatio * 100);
  const isGoalAchieved = currentMovementMinutes >= targetGoalMinutes;

  // Streak fire condition: streakDays > 3 (or user enabled demo preview)
  const isFireActive = streakDays > 3 || previewFireEffect;

  // Circular progress math (Radius 42, circumference ~263.89)
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div
      id="daily-fitness-goal-widget"
      className={`relative overflow-hidden rounded-3xl border transition-all ${
        isFireActive
          ? 'bg-gradient-to-br from-amber-950/40 via-slate-900 to-orange-950/40 border-amber-500/50 shadow-xl shadow-amber-500/10'
          : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-xs'
      } ${className}`}
    >
      {/* Dynamic Animated Ember/Fire Backdrop when streak > 3 */}
      {isFireActive && (
        <>
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute -bottom-10 -left-10 w-52 h-52 bg-gradient-to-tr from-rose-500/15 via-amber-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />
          
          {/* Subtle floating flame particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
            <span className="absolute bottom-2 left-1/4 w-2 h-2 rounded-full bg-amber-400 animate-ping duration-1000" />
            <span className="absolute bottom-6 left-1/3 w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse duration-700" />
            <span className="absolute bottom-4 right-1/4 w-2.5 h-2.5 rounded-full bg-yellow-300 animate-ping duration-1200" />
          </div>
        </>
      )}

      <div className="p-5 sm:p-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Left Column: Progress Ring & Daily Goal Status */}
          <div className="flex items-center gap-5 sm:gap-6">
            {/* SVG Circular Gauge */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                {/* Background track */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="text-slate-200 dark:text-slate-800"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                />
                {/* Animated active progress bar */}
                <motion.circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke={
                    isGoalAchieved
                      ? '#10b981' // emerald
                      : isFireActive
                      ? '#f59e0b' // amber
                      : '#0d9488' // teal
                  }
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  fill="transparent"
                />
              </svg>

              {/* Center Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                {isGoalAchieved ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 animate-bounce" />
                ) : (
                  <span className="text-xs font-black uppercase text-slate-400 dark:text-slate-400">
                    Cel
                  </span>
                )}
                <span className="text-lg sm:text-xl font-black font-mono tracking-tight text-slate-900 dark:text-white leading-none mt-0.5">
                  {progressPercent}%
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  {currentMovementMinutes}/{targetGoalMinutes}m
                </span>
              </div>
            </div>

            {/* Goal Text & Controls */}
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                  isGoalAchieved
                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                }`}>
                  <Target className="w-3 h-3" />
                  <span>Dzienny Cel Sprawnościowy</span>
                </span>

                {isGoalAchieved && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                    <Sparkles className="w-3 h-3" />
                    Osiągnięty na 100%!
                  </span>
                )}
              </div>

              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                {currentMovementMinutes} z {targetGoalMinutes} min ruchu rehabilitacyjnego
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-md">
                {isGoalAchieved
                  ? 'Znakomicie! Twój kręgosłup szyjny otrzymał optymalne nawodnienie krążków i reset napięcia mięśni podpotylicznych.'
                  : `Wykonaj sesję rehabilitacyjną lub mikroprzerwy biurowe, aby domknąć dzienny pierścień zdrowia karku (${targetGoalMinutes - currentMovementMinutes} min do celu).`}
              </p>

              {/* Goal preset pills */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider">
                  Ustaw cel:
                </span>
                {[10, 15, 20].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => handleSetGoal(mins)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all ${
                      targetGoalMinutes === mins
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {mins} min
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Streak Fire Banner & Motivation */}
          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center md:items-end lg:items-center gap-3 shrink-0">
            {/* Streak Fire Container */}
            <div
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                isFireActive
                  ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/25 to-rose-500/20 border-amber-500/60 shadow-lg shadow-orange-500/10'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Flame Icon with Pulsing Effect */}
                <div className={`relative w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                  isFireActive
                    ? 'bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500 text-white shadow-md shadow-orange-500/30'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}>
                  <Flame className={`w-6 h-6 ${isFireActive ? 'fill-current animate-bounce text-yellow-100' : ''}`} />
                  {isFireActive && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-black uppercase tracking-tight ${
                      isFireActive
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}>
                      {isFireActive ? 'Płonąca Seria Ćwiczeń 🔥' : 'Ciągłość Treningu'}
                    </span>
                    {isFireActive && (
                      <span className="text-[10px] font-black px-1.5 py-0.2 bg-amber-500 text-white rounded-md">
                        &gt; 3 DNI
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">
                      {streakDays} {streakDays === 1 ? 'dzień' : 'dni'}
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-300">
                      z rzędu
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                    {isFireActive ? (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">
                        Ogień serii aktywny! Neuroplastyczność wzmocniona.
                      </span>
                    ) : (
                      <span>
                        Rozpal ogień: jeszcze {Math.max(1, 4 - streakDays)} {Math.max(1, 4 - streakDays) === 1 ? 'dzień' : 'dni'} ciągłości!
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons inside streak box */}
              <div className="mt-3 pt-2.5 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-2 text-xs">
                {streakDays <= 3 && (
                  <button
                    type="button"
                    onClick={() => setPreviewFireEffect(!previewFireEffect)}
                    className="text-[10px] text-amber-800 dark:text-amber-300 hover:underline font-bold"
                  >
                    {previewFireEffect ? 'Wyłącz podgląd ognia' : 'Podgląd ognia serii 🔥'}
                  </button>
                )}

                {onOpenAchievements && (
                  <button
                    type="button"
                    onClick={onOpenAchievements}
                    className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 ml-auto"
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                    <span>Ranking i Medale</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Action button if session not completed today */}
            {!completedTodaySession && onStartSession && (
              <button
                type="button"
                onClick={onStartSession}
                className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Ukończ dzisiejszy cel</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
