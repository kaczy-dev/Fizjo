import React, { useState } from 'react';
import { Trophy, X, Award, TrendingUp } from 'lucide-react';
import { Achievement } from '../types';
import { AchievementGallery } from './AchievementGallery';
import { LeaderboardComparisonView } from './LeaderboardComparisonView';
import { soundService } from '../services/soundService';

interface Props {
  isOpen?: boolean;
  achievements: Achievement[];
  streakDays: number;
  totalCompletedSessions?: number;
  completedMicroBreaksCount?: number;
  onClose: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const AchievementsModal: React.FC<Props> = ({ 
  isOpen = true, 
  achievements, 
  streakDays, 
  totalCompletedSessions = 0,
  completedMicroBreaksCount = 0,
  onClose,
  onNavigateToTab
}) => {
  const [activeTab, setActiveTab] = useState<'gallery' | 'leaderboard'>('gallery');

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="achievements-modal"
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/20 text-amber-300">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-teal-300 font-semibold">
                System Osiągnięć i Neurobiologicznej Motywacji
              </span>
              <h2 className="text-xl font-black tracking-tight">Galeria Medali & Tabela Liderów</h2>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            {/* Top segment tab buttons */}
            <div className="flex items-center bg-black/20 p-1 rounded-2xl border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('gallery');
                  soundService.playTick();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'gallery'
                    ? 'bg-white text-teal-950 shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Osiągnięcia</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('leaderboard');
                  soundService.playTick();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'leaderboard'
                    ? 'bg-white text-teal-950 shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                <span>Ranking & Średnia</span>
              </button>
            </div>

            <button
              id="close-achievements-btn"
              type="button"
              onClick={onClose}
              className="p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              title="Zamknij (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'gallery' ? (
            <AchievementGallery
              achievements={achievements}
              streakDays={streakDays}
              totalCompletedSessions={totalCompletedSessions}
              onNavigateToTab={(tab) => {
                onClose();
                if (onNavigateToTab) onNavigateToTab(tab);
              }}
            />
          ) : (
            <LeaderboardComparisonView
              streakDays={streakDays}
              totalCompletedSessions={totalCompletedSessions}
              completedMicroBreaksCount={completedMicroBreaksCount}
              onNavigateToTab={(tab) => {
                onClose();
                if (onNavigateToTab) onNavigateToTab(tab);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

