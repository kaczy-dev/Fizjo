import React from 'react';
import { 
  Sun, Moon, Laptop, Flame, Home, 
  Dumbbell, Calendar, Stethoscope, FileText, Watch, BookOpen, Trophy, Monitor
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PWAInstallButton } from './PWAInstallButton';

export type NavTab = 'dashboard' | 'exercises' | 'knowledge' | 'plan' | 'triage' | 'ergonomics' | 'reports' | 'wearables' | 'profile';

interface Props {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  streakDays: number;
  unlockedMedalsCount?: number;
  onOpenAchievements?: () => void;
  themeMode?: 'system' | 'light' | 'dark';
}

const TAB_TITLES: Record<NavTab, string> = {
  dashboard: 'Pulpit Rehabilitacji',
  plan: 'Mój Plan Treningowy',
  reports: 'Postępy & Raporty',
  triage: 'Analiza Bólu AI',
  exercises: 'Katalog Ćwiczeń',
  ergonomics: 'Ergonomia Biurka',
  knowledge: 'Baza Wiedzy',
  wearables: 'Zegarki & Leki',
  profile: 'Profil Pacjenta'
};

export const Header: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  isDarkMode,
  onToggleDarkMode,
  streakDays,
  unlockedMedalsCount = 0,
  onOpenAchievements,
  themeMode = 'system'
}) => {
  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Pulpit', icon: Home },
    { id: 'plan', label: 'Mój Plan', icon: Calendar },
    { id: 'reports', label: 'Raporty', icon: FileText },
    { id: 'triage', label: 'Analiza AI', icon: Stethoscope },
    { id: 'exercises', label: 'Ćwiczenia', icon: Dumbbell },
    { id: 'ergonomics', label: 'Ergonomia', icon: Monitor },
    { id: 'knowledge', label: 'Wiedza', icon: BookOpen },
    { id: 'wearables', label: 'Zegarki & Leki', icon: Watch },
    { id: 'profile', label: 'Profil', icon: Trophy }
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      {/* Main Bar: Compact 54px on mobile (respecting 15% sticky cap), 64px on desktop */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-13.5 sm:h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark + Active Mobile View Title */}
        <button
          type="button"
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-2.5 text-left cursor-pointer group shrink-0 min-w-0"
        >
          <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs group-hover:bg-teal-500 transition-colors shrink-0">
            <Stethoscope className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight whitespace-nowrap">
                Fizjo<span className="text-teal-600 dark:text-teal-400">Szyja</span>
              </span>
              <span className="lg:hidden text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
              <span className="lg:hidden text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">
                {TAB_TITLES[activeTab]}
              </span>
            </div>
          </div>
        </button>

        {/* Zone 2: Desktop Navigation Links */}
        <nav
          aria-label="Nawigacja główna"
          className="hidden lg:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/60 p-1 rounded-2xl border border-slate-200/70 dark:border-slate-700/60"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'text-teal-700 dark:text-teal-300'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="active-nav-indicator"
                    className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200/70 dark:border-slate-700/70"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Quick Status & Actions (44x44px ergonomic touch targets on mobile) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="hidden sm:block">
            <PWAInstallButton />
          </div>

          {onOpenAchievements && (
            <button
              id="header-achievements-btn"
              type="button"
              onClick={onOpenAchievements}
              className="min-h-[40px] px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 text-xs font-bold hover:border-teal-500/40 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              title="Zobacz wirtualne medale i odznaki"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden md:inline">Medale</span>
              <span className="font-mono tabular-nums">{unlockedMedalsCount}</span>
            </button>
          )}

          {/* Streak Counter */}
          <button
            type="button"
            onClick={() => onSelectTab('plan')}
            className="min-h-[40px] px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/70 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            title="Dni ciągłości ćwiczeń"
          >
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="font-mono tabular-nums">{streakDays}d</span>
          </button>

          {/* Theme Mode Toggle */}
          <button
            id="theme-toggle-btn"
            type="button"
            onClick={onToggleDarkMode}
            className="min-h-[40px] min-w-[40px] px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            title={
              themeMode === 'system'
                ? `Motyw: Automatyczny wg systemu urządzenia (${isDarkMode ? 'Ciemny' : 'Jasny'})`
                : themeMode === 'dark'
                ? 'Motyw: Wymuszony Ciemny'
                : 'Motyw: Wymuszony Jasny'
            }
          >
            {themeMode === 'system' ? (
              <Laptop className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            ) : isDarkMode ? (
              <Moon className="w-4 h-4 text-indigo-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
