import React from 'react';
import { Play, Eye, ShieldAlert, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import { Exercise } from '../types';
import { ExerciseOfflineBadge } from './ExerciseOfflineBadge';

interface Props {
  exercise: Exercise;
  onOpenDetails: (exercise: Exercise) => void;
  onQuickStart: (exercise: Exercise) => void;
  isCached?: boolean;
  isDownloading?: boolean;
  sizeKb?: number;
  onToggleCache?: (exercise: Exercise) => void;
}

export const ExerciseCard: React.FC<Props> = ({
  exercise,
  onOpenDetails,
  onQuickStart,
  isCached = false,
  isDownloading = false,
  sizeKb,
  onToggleCache
}) => {
  const getRegionBadge = () => {
    switch (exercise.region) {
      case 'cervical':
        return { label: 'Odcinek Szyjny (C1-C7)', bg: 'bg-teal-100 text-teal-800 dark:bg-teal-950/70 dark:text-teal-300 border-teal-200 dark:border-teal-800' };
      case 'thoracic':
        return { label: 'Odcinek Piersiowy (Th1-Th12)', bg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' };
      case 'lumbar':
        return { label: 'Odcinek Lędźwiowy (L1-S1)', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800' };
      default:
        return { label: 'Cały Kręgosłup', bg: 'bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 border-sky-200 dark:border-sky-800' };
    }
  };

  const badge = getRegionBadge();

  return (
    <div
      id={`exercise-card-${exercise.id}`}
      className="group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
    >
      <div>
        {/* Top Badges: Region + Difficulty + Offline Availability */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
            {badge.label}
          </span>
          <div className="flex items-center gap-1.5">
            <ExerciseOfflineBadge
              exercise={exercise}
              isCached={isCached}
              isDownloading={isDownloading}
              sizeKb={sizeKb}
              onToggleCache={onToggleCache ? () => onToggleCache(exercise) : undefined}
              compact
            />
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              {exercise.difficulty}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
          {exercise.polishName}
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 font-mono mt-0.5">
          {exercise.name}
        </p>

        {/* Description snippet */}
        <p className="text-sm text-slate-700 dark:text-slate-300 mt-2.5 line-clamp-2 leading-relaxed">
          {exercise.description}
        </p>

        {/* Target Muscles */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {exercise.targetMuscles.slice(0, 2).map((m, idx) => (
            <span
              key={idx}
              className="text-[11px] bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700/60"
            >
              {m}
            </span>
          ))}
        </div>

        {/* Dosing parameters */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>{exercise.defaultSets} serie × {exercise.defaultReps} powt.</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Zatrzymanie: {exercise.defaultHoldSeconds}s</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 grid grid-cols-2 gap-2 pt-2">
        <button
          id={`view-technique-btn-${exercise.id}`}
          type="button"
          onClick={() => onOpenDetails(exercise)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Wideo & Technika</span>
        </button>

        <button
          id={`start-exercise-btn-${exercise.id}`}
          type="button"
          onClick={() => onQuickStart(exercise)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-teal-600 hover:bg-teal-500 text-white shadow-xs transition-colors"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Ćwicz teraz</span>
        </button>
      </div>
    </div>
  );
};
