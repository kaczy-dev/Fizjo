import React from 'react';
import {
  Trophy,
  Award,
  Crown,
  Flame,
  Wind,
  BookOpen,
  Activity,
  FileText,
  Pill,
  Sparkles,
  CheckCircle2,
  Lock,
  X
} from 'lucide-react';
import { Achievement } from '../types';

interface Props {
  isOpen?: boolean;
  achievements: Achievement[];
  streakDays: number;
  onClose: () => void;
}

export const AchievementsModal: React.FC<Props> = ({ isOpen = true, achievements, streakDays, onClose }) => {
  // Handle escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const percentUnlocked = Math.round((unlockedCount / totalCount) * 100);

  const getIcon = (iconName: string, tier: string, unlocked: boolean) => {
    const sizeClass = 'w-6 h-6';
    const colorClass = !unlocked
      ? 'text-slate-400 dark:text-slate-600'
      : tier === 'gold' || tier === 'diamond'
      ? 'text-amber-500'
      : tier === 'silver'
      ? 'text-sky-500'
      : 'text-teal-500';

    switch (iconName) {
      case 'Flame':
        return <Flame className={`${sizeClass} ${colorClass}`} />;
      case 'Trophy':
        return <Trophy className={`${sizeClass} ${colorClass}`} />;
      case 'Crown':
        return <Crown className={`${sizeClass} ${colorClass}`} />;
      case 'Wind':
        return <Wind className={`${sizeClass} ${colorClass}`} />;
      case 'BookOpen':
        return <BookOpen className={`${sizeClass} ${colorClass}`} />;
      case 'Activity':
        return <Activity className={`${sizeClass} ${colorClass}`} />;
      case 'FileText':
        return <FileText className={`${sizeClass} ${colorClass}`} />;
      case 'Pill':
        return <Pill className={`${sizeClass} ${colorClass}`} />;
      case 'Sparkles':
        return <Sparkles className={`${sizeClass} ${colorClass}`} />;
      default:
        return <Award className={`${sizeClass} ${colorClass}`} />;
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'diamond':
        return { label: 'Diamentowy', bg: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-300' };
      case 'gold':
        return { label: 'Złoty Medal', bg: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300' };
      case 'silver':
        return { label: 'Srebrny Medal', bg: 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border-sky-300' };
      default:
        return { label: 'Brązowy Medal', bg: 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border-teal-300' };
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="achievements-modal"
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/20 text-amber-300">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-teal-300 font-semibold">
                System Osiągnięć i Medali Rehabilitacji
              </span>
              <h2 className="text-xl font-black tracking-tight">Twoje Odznaki & Sukcesy</h2>
            </div>
          </div>

          <button
            id="close-achievements-btn"
            type="button"
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            title="Zamknij (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress summary banner */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {unlockedCount} / {totalCount}
              </span>
              <span className="text-xs text-slate-500 font-semibold">odblokowanych medali</span>
            </div>
            {/* Progress bar */}
            <div className="w-full sm:w-64 h-2 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${percentUnlocked}%` }}
              />
            </div>
          </div>

          {/* Current streak indicator */}
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60">
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-300 tracking-wider">
                Seria ćwiczeń
              </span>
              <p className="text-sm font-black text-amber-900 dark:text-amber-200 font-mono">
                {streakDays} {streakDays === 1 ? 'dzień z rzędu' : 'dni z rzędu'}
              </p>
            </div>
          </div>
        </div>

        {/* Achievements list */}
        <div className="p-6 overflow-y-auto space-y-3.5 flex-1">
          {achievements.map((ach) => {
            const tierInfo = getTierBadge(ach.tier);
            return (
              <div
                key={ach.id}
                id={`achievement-card-${ach.id}`}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                  ach.unlocked
                    ? 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 shadow-xs'
                    : 'bg-slate-50/50 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-800/60 opacity-60'
                }`}
              >
                {/* Medal Icon Badge */}
                <div
                  className={`p-3 rounded-2xl border shrink-0 flex items-center justify-center ${
                    ach.unlocked
                      ? 'bg-slate-50 dark:bg-slate-700/60 border-slate-200 dark:border-slate-600 shadow-inner'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {getIcon(ach.icon, ach.tier, ach.unlocked)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                      {ach.title}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${tierInfo.bg}`}
                    >
                      {tierInfo.label}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    {ach.description}
                  </p>

                  {/* Progress bar inside card if not unlocked */}
                  {!ach.unlocked && ach.maxProgress > 1 && (
                    <div className="mt-2.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-500 rounded-full"
                          style={{
                            width: `${Math.round((ach.progress / ach.maxProgress) * 100)}%`
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 font-semibold shrink-0">
                        {ach.progress} / {ach.maxProgress}
                      </span>
                    </div>
                  )}

                  {ach.unlocked && (
                    <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Odblokowano</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 flex justify-end">
          <button
            id="close-achievements-bottom-btn"
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-xs"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};
