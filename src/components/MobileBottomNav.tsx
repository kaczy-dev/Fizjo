import React, { useState } from 'react';
import {
  Home,
  Calendar,
  FileText,
  Stethoscope,
  LayoutGrid,
  Dumbbell,
  Monitor,
  BookOpen,
  Watch,
  User,
  Trophy,
  Wind,
  Moon,
  Zap,
  ShieldAlert,
  Play,
  Activity,
  Plus,
  X,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavTab } from './Header';

interface MobileBottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onStartTodaySession: () => void;
  onTriggerMicroBreak: () => void;
  onOpenAchievements: () => void;
  onOpenBreathingModal: () => void;
  onOpenBpsModal: () => void;
  onOpenRedFlagsModal: () => void;
  onQuickSaveVas: (vasScore: number, trigger: string, note?: string) => void;
  todayExercisesCount: number;
  todayEstimatedMinutes: number;
  unlockedMedalsCount: number;
  streakDays: number;
  hideFab?: boolean;
}

const SECONDARY_TABS: {
  id: NavTab;
  label: string;
  subtitle: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  {
    id: 'exercises',
    label: 'Katalog Ćwiczeń',
    subtitle: 'Baza kinezyterapii szyi i obręczy barkowej z animacjami',
    icon: Dumbbell
  },
  {
    id: 'ergonomics',
    label: 'Audytor Ergonomii Biurka',
    subtitle: 'Kalkulator wysokości blatu i monitora wg normy DIN EN 527',
    icon: Monitor
  },
  {
    id: 'knowledge',
    label: 'Baza Wiedzy Klinicznej',
    subtitle: 'Artykuły o biomechanice krążków C1–C7 i higienie snu',
    icon: BookOpen
  },
  {
    id: 'wearables',
    label: 'Zegarki & Leki',
    subtitle: 'Synchronizacja tętna Bluetooth i harmonogram farmakoterapii',
    icon: Watch
  },
  {
    id: 'profile',
    label: 'Profil Pacjenta & Kopia Danych',
    subtitle: 'Personalizacja planu, motyw ekranu i eksport RODO',
    icon: User
  }
];

const QUICK_TRIGGERS = [
  'Praca przy biurku',
  'Smartfon (Tech-Neck)',
  'Stres i napięcie',
  'Zła pozycja snu',
  'Długa jazda autem'
];

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onStartTodaySession,
  onTriggerMicroBreak,
  onOpenAchievements,
  onOpenBreathingModal,
  onOpenBpsModal,
  onOpenRedFlagsModal,
  onQuickSaveVas,
  todayExercisesCount,
  todayEstimatedMinutes,
  unlockedMedalsCount,
  streakDays,
  hideFab = false
}) => {
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const [isQuickVasSheetOpen, setIsQuickVasSheetOpen] = useState(false);

  // Quick VAS state
  const [quickVas, setQuickVas] = useState<number>(3);
  const [quickTrigger, setQuickTrigger] = useState<string>('Praca przy biurku');
  const [quickNote, setQuickNote] = useState<string>('');
  const [quickSavedConfirmation, setQuickSavedConfirmation] = useState<boolean>(false);

  const isSecondaryActive = ['exercises', 'ergonomics', 'knowledge', 'wearables', 'profile'].includes(activeTab);

  const handleNavigate = (tab: NavTab) => {
    onSelectTab(tab);
    setIsMoreSheetOpen(false);
    setIsFabMenuOpen(false);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleQuickVasSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onQuickSaveVas(quickVas, quickTrigger, quickNote.trim() || undefined);
    setQuickSavedConfirmation(true);
    setTimeout(() => {
      setQuickSavedConfirmation(false);
      setIsQuickVasSheetOpen(false);
      setQuickNote('');
    }, 900);
  };

  const primaryTabs: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Pulpit', icon: Home },
    { id: 'plan', label: 'Mój Plan', icon: Calendar },
    { id: 'reports', label: 'Raporty', icon: FileText },
    { id: 'triage', label: 'Analiza AI', icon: Stethoscope }
  ];

  return (
    <>
      {/* FLOATING QUICK-ACTION FAB (Thumb-Zone Speed Dial) */}
      {!hideFab && (
        <div className="fixed right-4 bottom-20 lg:bottom-8 lg:right-8 z-30 flex flex-col items-end">
          <AnimatePresence>
            {isFabMenuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => setIsFabMenuOpen(false)}
                  className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] -z-10"
                />
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.95 }}
                  transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                  className="mb-3 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-3 shadow-2xl space-y-1.5"
                >
                  <div className="px-2.5 py-1 flex items-center justify-between text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                    <span>Szybkie akcje terapeutyczne</span>
                    <span className="font-mono tabular-nums">{streakDays} dni serii</span>
                  </div>

                  <button
                    id="fab-start-session-btn"
                    type="button"
                    onClick={() => {
                      setIsFabMenuOpen(false);
                      onStartTodaySession();
                    }}
                    className="w-full min-h-[48px] p-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white flex items-center gap-3 text-left transition-transform active:scale-[0.98] cursor-pointer shadow-xs"
                  >
                    <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                      <Play className="w-4 h-4 fill-current" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold leading-tight truncate">
                        Rozpocznij dzisiejszą sesję
                      </div>
                      <div className="text-[11px] text-teal-100 font-mono tabular-nums">
                        {todayExercisesCount} ćw. · {todayEstimatedMinutes} min
                      </div>
                    </div>
                  </button>

                  <button
                    id="fab-quick-vas-btn"
                    type="button"
                    onClick={() => {
                      setIsFabMenuOpen(false);
                      setIsQuickVasSheetOpen(true);
                    }}
                    className="w-full min-h-[48px] p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/70 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-900 dark:text-white flex items-center gap-3 text-left transition-transform active:scale-[0.98] cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold leading-tight truncate">
                        Zapisz pomiar bólu (VAS)
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        Szybki wpis 0–10 do wykresów
                      </div>
                    </div>
                  </button>

                  <button
                    id="fab-micro-break-btn"
                    type="button"
                    onClick={() => {
                      setIsFabMenuOpen(false);
                      onTriggerMicroBreak();
                    }}
                    className="w-full min-h-[48px] p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/70 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-900 dark:text-white flex items-center gap-3 text-left transition-transform active:scale-[0.98] cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold leading-tight truncate">
                        30s Mikro-przerwa (Retrakcja)
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        Odciążenie krążków C5–C7
                      </div>
                    </div>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <button
            id="quick-action-fab-trigger"
            type="button"
            onClick={() => setIsFabMenuOpen((prev) => !prev)}
            aria-label="Szybkie akcje rehabilitacyjne"
            className={`h-13 px-4 rounded-2xl font-bold text-xs shadow-lg flex items-center gap-2 transition-all active:scale-95 cursor-pointer ${
              isFabMenuOpen
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-slate-900/20'
                : 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-600/30'
            }`}
          >
            {isFabMenuOpen ? (
              <>
                <X className="w-5 h-5" />
                <span>Zamknij</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 stroke-[2.5]" />
                <span className="whitespace-nowrap">Szybka akcja</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* FIXED BOTTOM NAVIGATION BAR (Mobile & Tablet < lg) */}
      <nav
        id="mobile-bottom-nav"
        aria-label="Główna nawigacja mobilna"
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800/90 pb-safe"
      >
        <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-1">
          {primaryTabs.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id && !isMoreSheetOpen;
            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                type="button"
                onClick={() => handleNavigate(item.id)}
                className={`relative min-h-[48px] flex flex-col items-center justify-center rounded-xl transition-colors cursor-pointer ${
                  isActive
                    ? 'text-teal-600 dark:text-teal-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-105 stroke-[2.4]' : 'stroke-[1.9]'}`} />
                <span className={`text-[10px] mt-1 tracking-tight whitespace-nowrap ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.span
                    layoutId="mobile-bottom-nav-indicator"
                    className="absolute top-1 w-5 h-0.5 rounded-full bg-teal-600 dark:bg-teal-400"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            );
          })}

          {/* 5th Tab: "Więcej" Drawer Trigger */}
          <button
            id="mobile-nav-more-btn"
            type="button"
            onClick={() => {
              setIsFabMenuOpen(false);
              setIsMoreSheetOpen((prev) => !prev);
            }}
            className={`relative min-h-[48px] flex flex-col items-center justify-center rounded-xl transition-colors cursor-pointer ${
              isMoreSheetOpen || isSecondaryActive
                ? 'text-teal-600 dark:text-teal-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <LayoutGrid className={`w-5 h-5 transition-transform ${isMoreSheetOpen || isSecondaryActive ? 'scale-105 stroke-[2.4]' : 'stroke-[1.9]'}`} />
            <span className={`text-[10px] mt-1 tracking-tight whitespace-nowrap ${isMoreSheetOpen || isSecondaryActive ? 'font-bold' : 'font-medium'}`}>
              Więcej
            </span>
            {(isMoreSheetOpen || isSecondaryActive) && (
              <motion.span
                layoutId="mobile-bottom-nav-indicator"
                className="absolute top-1 w-5 h-0.5 rounded-full bg-teal-600 dark:bg-teal-400"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        </div>
      </nav>

      {/* BOTTOM-SHEET DRAWER: "WIĘCEJ" (Secondary Modules & Clinical Shortcuts) */}
      <AnimatePresence>
        {isMoreSheetOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex items-end justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setIsMoreSheetOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            <motion.div
              id="mobile-more-bottom-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 shadow-2xl max-h-[85dvh] flex flex-col overflow-hidden pb-safe"
            >
              {/* Drag Handle */}
              <div
                onClick={() => setIsMoreSheetOpen(false)}
                className="pt-3 pb-1 cursor-pointer"
              >
                <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto" />
              </div>

              <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Wszystkie moduły i narzędzia
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Wybierz sekcję lub uruchom szybki protokół wspomagający
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMoreSheetOpen(false)}
                  className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Zamknij menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto space-y-5">
                {/* Secondary Navigation List (Interactive Tap List Rows) */}
                <div className="space-y-1.5">
                  <div className="px-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                    Moduły specjalistyczne
                  </div>
                  <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden bg-slate-50/50 dark:bg-slate-800/30">
                    {SECONDARY_TABS.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          id={`sheet-nav-${item.id}`}
                          type="button"
                          onClick={() => handleNavigate(item.id)}
                          className={`w-full min-h-[60px] px-4 py-3 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-teal-50/90 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300'
                              : 'hover:bg-white dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                isActive
                                  ? 'bg-teal-600 text-white'
                                  : 'bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-teal-600 dark:text-teal-400'
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-bold truncate">
                                {item.label}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {item.subtitle}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Clinical Protocols Grid */}
                <div className="space-y-2">
                  <div className="px-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                    Szybkie narzędzia terapeutyczne
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreSheetOpen(false);
                        onOpenBreathingModal();
                      }}
                      className="min-h-[56px] p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/50 flex items-center gap-2.5 text-left active:scale-[0.98] transition-transform cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                        <Wind className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          Oddech 4-7-8
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          Nerw błędny
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreSheetOpen(false);
                        onOpenBpsModal();
                      }}
                      className="min-h-[56px] p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/50 flex items-center gap-2.5 text-left active:scale-[0.98] transition-transform cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        <Moon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          Dziennik BPS
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          Sen i bruksizm
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreSheetOpen(false);
                        onOpenAchievements();
                      }}
                      className="min-h-[56px] p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/50 flex items-center gap-2.5 text-left active:scale-[0.98] transition-transform cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <Trophy className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          Medale ({unlockedMedalsCount})
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          Osiągnięcia
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreSheetOpen(false);
                        onOpenRedFlagsModal();
                      }}
                      className="min-h-[56px] p-3 rounded-2xl border border-rose-200/80 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 flex items-center gap-2.5 text-left active:scale-[0.98] transition-transform cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-rose-950 dark:text-rose-200 truncate">
                          Czerwone Flagi
                        </div>
                        <div className="text-[11px] text-rose-700 dark:text-rose-300 truncate">
                          Alarmy SOR 112
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BOTTOM-SHEET: SZYBKI POMIAR BÓLU VAS (0-10) */}
      <AnimatePresence>
        {isQuickVasSheetOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setIsQuickVasSheetOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            <motion.div
              id="quick-vas-bottom-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border-t sm:border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 space-y-5 pb-safe"
            >
              <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto sm:hidden" />

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                    Błyskawiczny dziennik kliniczny
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Szybki zapis natężenia bólu (VAS)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsQuickVasSheetOpen(false)}
                  className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleQuickVasSubmit} className="space-y-4">
                {/* Touch-friendly 0-10 VAS Tiles */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      Wybierz poziom bólu (0–10):
                    </span>
                    <span
                      className={`text-lg font-extrabold font-mono tabular-nums ${
                        quickVas <= 3
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : quickVas <= 6
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {quickVas} / 10 VAS
                    </span>
                  </div>

                  <div className="grid grid-cols-11 gap-1">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => {
                      const selected = quickVas === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setQuickVas(val)}
                          className={`min-h-[44px] rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                            selected
                              ? val <= 3
                                ? 'bg-emerald-600 text-white shadow-xs scale-105'
                                : val <= 6
                                ? 'bg-amber-500 text-white shadow-xs scale-105'
                                : 'bg-rose-600 text-white shadow-xs scale-105'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>0 · Brak bólu</span>
                    <span>5 · Umiarkowany</span>
                    <span>10 · Maksymalny</span>
                  </div>
                </div>

                {/* Trigger selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">
                    Główny czynnik wyzwalający:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_TRIGGERS.map((trig) => (
                      <button
                        key={trig}
                        type="button"
                        onClick={() => setQuickTrigger(trig)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                          quickTrigger === trig
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {trig}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional short note */}
                <div>
                  <input
                    type="text"
                    value={quickNote}
                    onChange={(e) => setQuickNote(e.target.value)}
                    placeholder="Opcjonalna notatka (np. sztywność karku po pracy)..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full min-h-[48px] rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-transform active:scale-[0.98] cursor-pointer"
                >
                  {quickSavedConfirmation ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Zapisano w historii VAS!</span>
                    </>
                  ) : (
                    <>
                      <Activity className="w-4 h-4" />
                      <span>Zapisz pomiar w historii ({quickVas}/10 VAS)</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
