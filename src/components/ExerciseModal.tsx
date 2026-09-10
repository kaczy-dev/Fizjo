import React, { useState } from 'react';
import { X, Play, ShieldAlert, CheckCircle2, AlertTriangle, Wind, Target, Stethoscope, Video, ExternalLink } from 'lucide-react';
import { Exercise } from '../types';
import { BiomechanicalAnimator } from './BiomechanicalAnimator';

interface Props {
  exercise: Exercise | null;
  onClose: () => void;
  onStartSession: (exercise: Exercise) => void;
}

export const ExerciseModal: React.FC<Props> = ({ exercise, onClose, onStartSession }) => {
  const [activeMediaTab, setActiveMediaTab] = useState<'animator' | 'video'>('animator');

  if (!exercise) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div
        id="exercise-details-modal"
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/80">
          <div>
            <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
              Instruktaż Bezpiecznej Techniki Ruchu
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
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
          {/* Media Switcher: Vector Animator vs Video Instruction */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveMediaTab('animator')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeMediaTab === 'animator'
                      ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Symulacja Biomechaniczna</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMediaTab('video')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeMediaTab === 'video'
                      ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Video className="w-3.5 h-3.5 text-rose-500" />
                  <span>Wideo Instruktażowe HD</span>
                </button>
              </div>

              <span className="text-[11px] text-slate-400 hidden sm:inline">Tempo: {exercise.tempo}</span>
            </div>

            {activeMediaTab === 'animator' ? (
              <BiomechanicalAnimator exercise={exercise} />
            ) : (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-950 aspect-video flex flex-col items-center justify-center relative">
                {exercise.videoEmbedUrl ? (
                  <iframe
                    src={exercise.videoEmbedUrl}
                    title={`Wideo instruktażowe: ${exercise.polishName}`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="p-6 text-center text-white">
                    <p className="text-sm font-semibold">{exercise.videoInstructor || 'Instruktaż Kliniczny Fizjoterapii'}</p>
                    <a
                      href={exercise.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Otwórz wideo instruktażowe (YouTube)</span>
                    </a>
                  </div>
                )}
                <div className="w-full bg-slate-900/95 px-4 py-2 flex items-center justify-between text-xs text-slate-300 border-t border-slate-800">
                  <span>Prowadzący: <strong>{exercise.videoInstructor || 'Klinika Fizjoterapii'}</strong></span>
                  <a
                    href={exercise.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-teal-400 hover:text-teal-300 transition-colors"
                  >
                    <span>Otwórz w nowej karcie</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
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

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            Standard: {exercise.defaultSets} serie × {exercise.defaultReps} powtórzeń ({exercise.defaultHoldSeconds}s izometrii)
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              id="cancel-modal-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Zamknij
            </button>
            <button
              id="start-session-from-modal-btn"
              type="button"
              onClick={() => {
                onClose();
                onStartSession(exercise);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md hover:shadow-teal-500/25 transition-all"
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
