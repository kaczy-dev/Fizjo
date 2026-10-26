import React, { useState } from 'react';
import { X, Play, ShieldAlert, CheckCircle2, AlertTriangle, Wind, Target, Stethoscope, Video, ExternalLink, DownloadCloud, Loader2, HardDrive } from 'lucide-react';
import { Exercise } from '../types';
import { BiomechanicalAnimator } from './BiomechanicalAnimator';
import { InstructionalVideoPlayer } from './InstructionalVideoPlayer';
import { useExerciseCache } from '../hooks/useExerciseCache';
import { ExerciseOfflineBadge } from './ExerciseOfflineBadge';

interface Props {
  exercise: Exercise | null;
  onClose: () => void;
  onStartSession?: (exercise: Exercise) => void;
  onStartExercise?: (exercise: Exercise) => void;
}

export const ExerciseModal: React.FC<Props> = ({ exercise, onClose, onStartSession, onStartExercise }) => {
  const [activeMediaTab, setActiveMediaTab] = useState<'animator' | 'video'>('video');
  const { isCached, isDownloading, cacheExercise, removeExercise, entries } = useExerciseCache();

  if (!exercise) return null;

  const cached = isCached(exercise.id);
  const downloading = isDownloading(exercise.id);
  const sizeKb = entries[exercise.id]?.sizeKb;

  const handleToggleCache = () => {
    if (cached) {
      removeExercise(exercise.id);
    } else {
      cacheExercise(exercise);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="exercise-details-modal"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border-t sm:border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90dvh] sm:max-h-[92vh] flex flex-col"
      >
        {/* Mobile Drag Handle */}
        <div
          onClick={onClose}
          className="pt-2.5 pb-1 sm:hidden cursor-pointer shrink-0 bg-slate-50/70 dark:bg-slate-900/80"
        >
          <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto" />
        </div>

        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/80 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                Instruktaż Bezpiecznej Techniki Ruchu
              </span>
              <ExerciseOfflineBadge
                exercise={exercise}
                isCached={cached}
                isDownloading={downloading}
                sizeKb={sizeKb}
                onToggleCache={handleToggleCache}
                compact
              />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {exercise.polishName}
            </h2>
          </div>
          <button
            id="close-exercise-modal-btn"
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200">
          {/* Offline PWA Status Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs">
            <div className="flex items-center gap-2.5">
              <div className={`p-1.5 rounded-xl shrink-0 ${cached ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                <HardDrive className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Dostępność Offline PWA:</span>
                  {cached ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      Zapisano w pamięci podręcznej ({sizeKb ? `${sizeKb} KB` : 'Pobrane'})
                    </span>
                  ) : (
                    <span className="text-slate-500 dark:text-slate-400">
                      Wymaga połączenia z siecią lub pobrania
                    </span>
                  )}
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                  Animacja wektorowa oraz instrukcja krok po kroku działają w 100% offline po zapisaniu.
                </p>
              </div>
            </div>

            <button
              id={`modal-cache-toggle-btn-${exercise.id}`}
              type="button"
              disabled={downloading}
              onClick={handleToggleCache}
              className={`shrink-0 px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                cached
                  ? 'bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-950 dark:hover:text-rose-300'
                  : 'bg-teal-600 hover:bg-teal-500 text-white shadow-xs'
              }`}
            >
              {downloading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Zapisywanie...</span>
                </>
              ) : cached ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Pobrano • Usuń</span>
                </>
              ) : (
                <>
                  <DownloadCloud className="w-3.5 h-3.5" />
                  <span>Pobierz do PWA</span>
                </>
              )}
            </button>
          </div>
          {/* Media Switcher: HD Video with HUD vs Vector Animator */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveMediaTab('video')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    activeMediaTab === 'video'
                      ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Video className="w-3.5 h-3.5 text-teal-500" />
                  <span>Wideo Instruktażowe HD (HUD + Slow-Mo)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMediaTab('animator')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    activeMediaTab === 'animator'
                      ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Wektor 2D</span>
                </button>
              </div>

              <span className="text-[11px] font-mono text-slate-400 hidden sm:inline tabular-nums">
                Tempo: {exercise.tempo}
              </span>
            </div>

            {activeMediaTab === 'animator' ? (
              <BiomechanicalAnimator exercise={exercise} />
            ) : (
              <InstructionalVideoPlayer exercise={exercise} autoPlay={true} compact={false} />
            )}
          </div>

          {/* Breathing & Ergonomic Cues */}
          <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-800/60 rounded-2xl p-4 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-900/60 text-sky-600 dark:text-sky-300 shrink-0">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300">
                Wskazówka oddechowa & synchronizacja
              </h4>
              <p className="text-sm text-sky-900 dark:text-sky-200 mt-0.5">
                {exercise.breathingCue}
              </p>
            </div>
          </div>

          {/* Step by Step instructions */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-500" />
              Krok po kroku – technika wykonania
            </h3>
            <ol className="space-y-2.5">
              {exercise.steps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 text-xs font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 leading-relaxed pt-0.5">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* Common Mistakes & Safety Warnings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Common Mistakes */}
            <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 rounded-2xl p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Częste błędy
              </h4>
              <ul className="space-y-1.5 text-xs text-amber-900 dark:text-amber-200">
                {exercise.commonMistakes.map((mistake, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-500">•</span>
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Safety warnings / When to stop */}
            <div className="bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-900/50 rounded-2xl p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300 mb-2 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                Zasady bezpieczeństwa
              </h4>
              <ul className="space-y-1.5 text-xs text-rose-900 dark:text-rose-200">
                {exercise.safetyWarnings.map((warn, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-rose-500">•</span>
                    <span>{warn}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contraindications */}
          {exercise.contraindications.length > 0 && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-slate-400" />
              <span>
                <strong>Przeciwwskazania:</strong> {exercise.contraindications.join(', ')}
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer (Sticky Thumb Zone) */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 shrink-0 pb-safe">
          <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block font-mono tabular-nums">
            Standard: {exercise.defaultSets} serie × {exercise.defaultReps} powtórzeń ({exercise.defaultHoldSeconds}s izometrii)
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              id="cancel-modal-btn"
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Zamknij
            </button>
            <button
              id="start-session-from-modal-btn"
              type="button"
              onClick={() => {
                onClose();
                if (onStartSession) onStartSession(exercise);
                else if (onStartExercise) onStartExercise(exercise);
              }}
              className="flex-1 sm:flex-initial min-h-[44px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Rozpocznij to ćwiczenie</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
