import React from 'react';
import { CheckCircle2, DownloadCloud, Loader2, WifiOff, HardDrive } from 'lucide-react';
import { Exercise } from '../types';

interface Props {
  exercise: Exercise;
  isCached: boolean;
  isDownloading: boolean;
  sizeKb?: number;
  onToggleCache?: () => void;
  compact?: boolean;
  interactive?: boolean;
}

export const ExerciseOfflineBadge: React.FC<Props> = ({
  exercise,
  isCached,
  isDownloading,
  sizeKb,
  onToggleCache,
  compact = false,
  interactive = true
}) => {
  if (isDownloading) {
    return (
      <div
        id={`offline-status-downloading-${exercise.id}`}
        className={`inline-flex items-center gap-1.5 rounded-full border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-200 font-semibold select-none animate-pulse ${
          compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        }`}
        title="Trwa pobieranie modelu animacji wektorowej i instruktażu do pamięci podręcznej PWA..."
      >
        <Loader2 className="w-3 h-3 animate-spin text-amber-600 dark:text-amber-400 shrink-0" />
        <span>Pobieranie do PWA...</span>
      </div>
    );
  }

  if (isCached) {
    return (
      <div
        id={`offline-status-cached-${exercise.id}`}
        className={`group relative inline-flex items-center gap-1.5 rounded-full border border-emerald-300/80 dark:border-emerald-800/80 bg-emerald-50/90 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-semibold select-none shadow-2xs transition-all ${
          compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        }`}
        title={`Ćwiczenie w 100% dostępne w trybie offline. Model animacji i instruktaż zapisany w pamięci PWA (${sizeKb ? `${sizeKb} KB` : 'Pobrane'}).`}
      >
        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span className="truncate">Offline PWA</span>
        {sizeKb && !compact && (
          <span className="text-[10px] font-mono text-emerald-600/80 dark:text-emerald-400/80 hidden sm:inline">
            {sizeKb}KB
          </span>
        )}

        {interactive && onToggleCache && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCache();
            }}
            className="ml-0.5 opacity-60 hover:opacity-100 text-[10px] text-emerald-700 dark:text-emerald-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
            title="Usuń z pamięci podręcznej PWA"
            aria-label="Usuń z pamięci offline"
          >
            ×
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center">
      {interactive && onToggleCache ? (
        <button
          id={`offline-status-uncached-btn-${exercise.id}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleCache();
          }}
          className={`group inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-400 hover:text-teal-700 dark:hover:text-teal-300 hover:border-teal-400 dark:hover:border-teal-700 hover:bg-teal-50 dark:hover:bg-teal-950/60 transition-all cursor-pointer font-medium ${
            compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
          }`}
          title="Kliknij, aby pobrać model animacji i instrukcję do pamięci podręcznej PWA (działa bez sieci)"
        >
          <DownloadCloud className="w-3 h-3 text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors shrink-0" />
          <span>Tylko online • Pobierz offline</span>
        </button>
      ) : (
        <span
          id={`offline-status-uncached-${exercise.id}`}
          className={`inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 ${
            compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
          }`}
        >
          <WifiOff className="w-3 h-3 shrink-0" />
          <span>Tylko online</span>
        </span>
      )}
    </div>
  );
};
