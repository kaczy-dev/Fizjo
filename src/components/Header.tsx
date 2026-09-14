import React from 'react';
import { 
  Sun, Moon, Laptop, ShieldCheck, Flame, Home, 
  Dumbbell, Calendar, Stethoscope, FileText, Watch, Menu, X, BookOpen, Trophy, User, Monitor
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState<boolean>(false);

  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Pulpit', icon: Home },
    { id: 'exercises', label: 'Ćwiczenia', icon: Dumbbell },
    { id: 'plan', label: 'Mój Plan', icon: Calendar },
    { id: 'ergonomics', label: 'Ergonomia Biurka', icon: Monitor },
    { id: 'triage', label: 'Analiza Bólu AI', icon: Stethoscope },
    { id: 'knowledge', label: 'Wiedza', icon: BookOpen },
    { id: 'reports', label: 'Postępy & Raport', icon: FileText },
    { id: 'wearables', label: 'Zegarki & Leki', icon: Watch },
    { id: 'profile', label: 'Profil', icon: Trophy }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Top Gov.pl style branding bar */}
      <div className="bg-slate-900 text-slate-200 text-[11px] px-4 py-1 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <span className="inline-block w-3.5 h-2.5 bg-gradient-to-b from-white to-red-600 rounded-[1px] shadow-xs" />
          <span className="font-semibold text-white tracking-wide">
            Moje Fizjo • Serwis Zdrowia & Rehabilitacji Kręgosłupa
          </span>
          <span className="hidden sm:inline-block text-slate-400">|</span>
          <span className="hidden sm:inline-flex items-center gap-1 text-emerald-400 font-medium">
            <ShieldCheck className="w-3 h-3" />
            Pełna prywatność danych medycznych (Lokalne na urządzeniu)
          </span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div 
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-md shadow-teal-600/20 group-hover:scale-105 transition-transform">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg text-slate-900 dark:text-white tracking-tight">
                Fizjo<span className="text-teal-600 dark:text-teal-400">Szyja</span>
              </span>
              <span className="text-[10px] uppercase font-bold bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                Moje Fizjo
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-none hidden sm:block">
              Rehabilitacja szyi i kręgosłupa
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/60 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
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

        {/* Right Tools: PWA Install + Achievements + Streak + Theme Toggle + Mobile Menu Trigger */}
        <div className="flex items-center gap-2">
          {/* PWA In-App Install Prompt */}
          <PWAInstallButton />

          {/* Achievements / Medals Button */}
          {onOpenAchievements && (
            <button
              id="header-achievements-btn"
              type="button"
              onClick={onOpenAchievements}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-bold hover:bg-teal-100 transition-colors"
              title="Zobacz wirtualne medale i odznaki"
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline">Medale:</span>
              <span className="font-mono">{unlockedMedalsCount}</span>
            </button>
          )}

          {/* Streak Badge */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs font-bold"
            title="Dni ciągłości ćwiczeń"
          >
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-bounce" />
            <span className="font-mono">{streakDays} dni</span>
          </div>

          {/* Theme Mode Toggle (System Auto / Dark / Light) */}
          <button
            id="theme-toggle-btn"
            type="button"
            onClick={onToggleDarkMode}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-semibold"
            title={
              themeMode === 'system'
                ? `Motyw: Automatyczny wg systemu urządzenia (${isDarkMode ? 'Ciemny' : 'Jasny'}) • Kliknij, aby zmienić`
                : themeMode === 'dark'
                ? 'Motyw: Wymuszony Ciemny • Kliknij, aby zmienić'
                : 'Motyw: Wymuszony Jasny • Kliknij, aby zmienić'
            }
          >
            {themeMode === 'system' ? (
              <>
                <Laptop className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span className="hidden sm:inline text-[11px] font-medium text-slate-500 dark:text-slate-400">Auto</span>
              </>
            ) : isDarkMode ? (
              <Moon className="w-4 h-4 text-indigo-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
          </button>

          {/* Mobile menu hamburger */}
          <button
            id="mobile-menu-btn"
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="lg:hidden px-4 pt-2 pb-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 space-y-1 overflow-hidden"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
