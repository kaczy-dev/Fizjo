import React, { useState } from 'react';
import { 
  Play, Calendar, Stethoscope, FileText, CheckCircle2, 
  Watch, Bell, ShieldCheck, ChevronRight, Wind, Lightbulb, 
  RefreshCw, BookOpen, Sparkles, ExternalLink, ArrowRight,
  AlertOctagon, Lock, MessageSquare, ShieldAlert, Monitor,
  Moon, HeartPulse, Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppState } from '../services/privacyStorage';
import { Exercise } from '../types';
import { EXERCISES } from '../data/exercises';
import { NavTab } from './Header';
import { PostureCameraAnalyzer } from './PostureCameraAnalyzer';
import { WeeklySessionsMiniBarChart } from './WeeklySessionsMiniBarChart';
import { DailyFitnessGoalRing } from './DailyFitnessGoalRing';
import { RehabilitationMilestones } from './RehabilitationMilestones';

interface Props {
  appState: AppState;
  onNavigateTab: (tab: NavTab) => void;
  onStartActiveSession: (exercises: Exercise[]) => void;
  onOpenExerciseDetails: (exercise: Exercise) => void;
  onToggleMedication: (medId: string, time: string) => void;
  onSavePostureMeasurement?: (angle: number, diagnosis: string) => void;
  onOpenRedFlags?: () => void;
  onOpenConsentModal?: () => void;
  onOpenFeedbackModal?: () => void;
  onOpenBreathingModal?: () => void;
  onOpenBpsModal?: () => void;
  onOpenAchievements?: () => void;
}

interface ErgonomicTip {
  id: string;
  category: string;
  title: string;
  advice: string;
  actionLabel?: string;
  actionTab?: NavTab;
  quickExerciseId?: string;
}

const ERGONOMIC_TIPS: ErgonomicTip[] = [
  {
    id: 'monitor-height',
    category: 'Ergonomia Monitora',
    title: 'Górna krawędź ekranu dokładnie na wysokości oczu',
    advice: 'Ustaw monitor tak, by górna linia obudowy znajdowała się na linii Twojego wzroku. Stałe patrzenie w dół na płasko leżący laptop generuje obciążenie krążków C5-C7 równe masie aż 20 kilogramów!',
    actionLabel: 'Baza Wiedzy o Ergonomii',
    actionTab: 'knowledge'
  },
  {
    id: 'rule-20-20-20',
    category: 'Higiena Pracy',
    title: 'Złota zasada 20-20-20 dla wzroku i karku',
    advice: 'Co 20 minut spójrz na obiekt oddalony o min. 6 metrów przez 20 sekund i wykonaj 3 spokojne retrakcje brody. Rozluźnia to mięśnie rzęskowe oka, które są neurologicznie połączone z mięśniami podpotylicznymi.',
    actionLabel: 'Szybka retrakcja brody (1 min)',
    quickExerciseId: 'chin-tuck'
  },
  {
    id: 'armrest-support',
    category: 'Odciążenie Karku',
    title: 'Podłokietniki na równi z wysokością blatu',
    advice: 'Oparcie przedramion na wysokości blatu biurka zdejmuje ponad 4 kg masy kończyn górnych z mięśni czworobocznych i dźwigaczy łopatek, redukując przewlekłe pieczenie karku.',
    actionLabel: 'Przejdź do artykułów',
    actionTab: 'knowledge'
  },
  {
    id: 'smartphone-angle',
    category: 'Syndrom Tech-Neck',
    title: 'Unoś smartfon do linii klatki piersiowej',
    advice: 'Pochylenie głowy pod kątem 60° nad telefonem wywiera nacisk 27 kg na stawy międzywyrostkowe kręgów szyjnych. Zawsze unoś smartfon wyżej i podpieraj łokcie o klatkę piersiową.',
    actionLabel: 'Ćwiczenia na Tech-Neck',
    quickExerciseId: 'chin-tuck'
  },
  {
    id: 'brugger-relief-daily',
    category: 'Mikropauza Biurowa',
    title: 'Pozycja odciążająca Brüggera co 60 minut',
    advice: 'Usiądź na skraju fotela, rozstaw kolana, wyprostuj tułów, dłonie skieruj kciukami na zewnątrz i weź 3 głębokie oddechy przeponowe. To natychmiastowo otwiera klatkę piersiową i resetuje zgięcie karku.',
    actionLabel: 'Wykonaj ćwiczenie Brüggera',
    quickExerciseId: 'brugger-relief'
  },
  {
    id: 'lumbar-lordosis',
    category: 'Postawa Siedząca',
    title: 'Podparcie lędźwiowe automatycznie cofa kark',
    advice: 'Utrzymanie fizjologicznego łuku lędźwiowego wymusza biomechaniczne cofnięcie karku do pionu. Wykorzystaj poduszkę lędźwiową lub ergonomiczny profil krzesła.',
    actionLabel: 'Zobacz zalecenia',
    actionTab: 'knowledge'
  },
  {
    id: 'pillow-ergonomics',
    category: 'Zdrowy Sen',
    title: 'Wysokość poduszki a neutralna oś kręgosłupa',
    advice: 'W pozycji na boku nos, mostek i pępek powinny tworzyć jedną prostą linię równoległą do materaca. Zbyt wysoka lub zbyt płaska poduszka powoduje ucisk korzeni nerwowych w nocy.',
    actionLabel: 'Poradnik o poduszkach',
    actionTab: 'knowledge'
  },
  {
    id: 'water-hydration',
    category: 'Biochemia Krążków',
    title: 'Nawodnienie krążków międzykręgowych',
    advice: 'Krążki międzykręgowe w 80% składają się z wody. Wypij szklankę wody podczas każdej mikroprzerwy – odwodnienie obniża zdolność amortyzacyjną dysków szyjnych.',
    actionLabel: 'Sprawdź przypomnienia',
    actionTab: 'wearables'
  },
  {
    id: 'wrist-keyboard',
    category: 'Nadgarstki i Barki',
    title: 'Neutralne ułożenie nadgarstków i łokci',
    advice: 'Nadgarstki powinny spoczywać w linii prostej z przedramionami. Zadzieranie dłoni ku górze na klawiaturze wywołuje kompensacyjne uniesienie barków i bolesne napięcie mięśni czworobocznych.',
    actionLabel: 'Artykuł o ergonomii',
    actionTab: 'knowledge'
  },
  {
    id: 'jaw-relaxation',
    category: 'Stawy Skroniowo-Żuchwowe',
    title: 'Rozluźnienie żuchwy i odruch połykania',
    advice: 'Stres biurowy powoduje mimowolne zaciskanie zębów. Oprzyj czubek języka na podniebieniu za górnymi siekaczami – to natychmiast neurologicznie wygasza napięcie mięśni podpotylicznych.',
    actionLabel: 'Rozpocznij mikroprzerwę',
    quickExerciseId: 'chin-tuck'
  },
  {
    id: 'feet-grounded',
    category: 'Baza Podparcia',
    title: 'Stopy płasko na ziemi i kąt 90° w kolanach',
    advice: 'Zakładanie nogi na nogę rotuje miednicę, skręcając cały kręgosłup aż do podstawy czaszki. Oprzyj obie stopy stabilnie na podłodze lub ergonomicznym podnóżku.',
    actionLabel: 'Baza Wiedzy',
    actionTab: 'knowledge'
  },
  {
    id: 'dynamic-sitting',
    category: 'Higiena Ruchu',
    title: 'Najlepsza pozycja to zawsze... następna pozycja!',
    advice: 'Nawet najbardziej ergonomiczny fotel staje się szkodliwy przy bezruchu powyżej 45 minut. Zmieniaj kąt oparcia, przeciągaj się i wstań po szklankę wody co godzinę.',
    actionLabel: 'Wykonaj ćwiczenie',
    quickExerciseId: 'brugger-relief'
  }
];

export const DashboardView: React.FC<Props> = ({
  appState,
  onNavigateTab,
  onStartActiveSession,
  onOpenExerciseDetails,
  onToggleMedication,
  onSavePostureMeasurement,
  onOpenRedFlags,
  onOpenConsentModal,
  onOpenFeedbackModal,
  onOpenBreathingModal,
  onOpenBpsModal,
  onOpenAchievements
}) => {
  // Find current day from active plan
  const todayDayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1; // 0 is Monday
  const todayPlanDay = appState.activePlan.days[todayDayIndex] || appState.activePlan.days[0];
  const todayExercises = EXERCISES.filter(e => todayPlanDay.exerciseIds.includes(e.id));

  // Quick 60-second relief exercises
  const chinTuckExercise = EXERCISES.find(e => e.id === 'chin-tuck') || EXERCISES[0];
  const bruggerExercise = EXERCISES.find(e => e.id === 'brugger-relief') || chinTuckExercise;

  // Calculate deterministic daily tip index based on calendar day
  const [tipIndex, setTipIndex] = useState<number>(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    return dayOfYear % ERGONOMIC_TIPS.length;
  });

  const [isRotatingTip, setIsRotatingTip] = useState(false);

  const currentTip = ERGONOMIC_TIPS[tipIndex];

  // Dedicated state for 'Szybkie wskazówki' card (random ergonomic tips on click)
  const [quickCardTipIndex, setQuickCardTipIndex] = useState<number>(() => 
    Math.floor(Math.random() * ERGONOMIC_TIPS.length)
  );
  const [isQuickCardSpinning, setIsQuickCardSpinning] = useState<boolean>(false);

  const handleShuffleQuickCardTip = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsQuickCardSpinning(true);
    setTimeout(() => {
      setQuickCardTipIndex((prev) => {
        let next = Math.floor(Math.random() * ERGONOMIC_TIPS.length);
        if (next === prev && ERGONOMIC_TIPS.length > 1) {
          next = (prev + 1) % ERGONOMIC_TIPS.length;
        }
        return next;
      });
      setIsQuickCardSpinning(false);
    }, 150);
  };

  const quickCardTip = ERGONOMIC_TIPS[quickCardTipIndex];

  const handleNextTip = () => {
    setIsRotatingTip(true);
    setTimeout(() => {
      setTipIndex((prev) => (prev + 1) % ERGONOMIC_TIPS.length);
      setIsRotatingTip(false);
    }, 150);
  };

  const handleTipAction = () => {
    if (currentTip.quickExerciseId) {
      const targetEx = EXERCISES.find(e => e.id === currentTip.quickExerciseId);
      if (targetEx) {
        onStartActiveSession([targetEx]);
        return;
      }
    }
    if (currentTip.actionTab) {
      onNavigateTab(currentTip.actionTab);
    } else {
      onNavigateTab('knowledge');
    }
  };

  // Stagger animation variants for entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.04
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: 'easeOut' }
    }
  };

  return (
    <motion.div
      id="dashboard-view"
      className="space-y-6 sm:space-y-8 max-w-5xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Patient Greeting & Status Banner */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl"
      >
        <div className="absolute right-0 top-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-600/60 border border-teal-400/30 text-teal-100 text-xs font-semibold backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
              <span>Program Bezpiecznej Rehabilitacji Szyi i Kręgosłupa</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Cześć, {appState.profile.name || 'Pacjencie'}!
            </h1>
            <p className="text-sm sm:text-base text-teal-100/90 leading-relaxed">
              Dzisiaj w Twoim planie: <strong className="text-white">{todayPlanDay.focusArea}</strong> ({todayPlanDay.estimatedMinutes} minut). Twój kark podziękuje Ci za regularne odciążenie!
            </p>
          </div>

          {/* Today session launch box */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 shrink-0 flex flex-col items-center text-center sm:min-w-[240px]">
            <div className="text-xs text-teal-200 font-medium">
              {todayPlanDay.completed ? 'Sesja dzisiejsza ukończona ✓' : 'Dzisiejsza sesja'}
            </div>
            <div className="text-lg font-bold font-mono text-white mt-1">
              {todayExercises.length} ćwiczenia • {todayPlanDay.estimatedMinutes} min
            </div>

            <button
              id="dashboard-start-session-btn"
              type="button"
              onClick={() => onStartActiveSession(todayExercises)}
              className="mt-4 w-full py-3 px-5 rounded-xl bg-white hover:bg-teal-50 text-teal-900 font-black text-xs shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current text-teal-700" />
              <span>{todayPlanDay.completed ? 'Powtórz sesję' : 'Rozpocznij sesję'}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* CLINICAL SAFETY & EMERGENCIES FAST-ACCESS STRIP */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        {/* Red Flags Trigger */}
        <button
          type="button"
          onClick={onOpenRedFlags}
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100/80 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900/60 text-left transition-all group cursor-pointer shadow-xs"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black text-rose-950 dark:text-rose-200 uppercase tracking-tight flex items-center gap-1">
              <span>Czerwone Flagi (SOR)</span>
            </div>
            <div className="text-[11px] text-rose-700 dark:text-rose-300 truncate">
              Kiedy natychmiast przerwać i zadzwonić 112/999
            </div>
          </div>
        </button>

        {/* GDPR & Informed Consent Trigger */}
        <button
          type="button"
          onClick={onOpenConsentModal}
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-teal-50 hover:bg-teal-100/80 dark:bg-teal-950/40 dark:hover:bg-teal-900/50 border border-teal-200 dark:border-teal-900/60 text-left transition-all group cursor-pointer shadow-xs"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black text-teal-950 dark:text-teal-200 uppercase tracking-tight">
              <span>RODO & Zgoda Medyczna</span>
            </div>
            <div className="text-[11px] text-teal-700 dark:text-teal-300 truncate">
              Art. 9 RODO • 100% Suwerenność lokalna
            </div>
          </div>
        </button>

        {/* Clinical Feedback Trigger */}
        <button
          type="button"
          onClick={onOpenFeedbackModal}
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left transition-all group cursor-pointer shadow-xs"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
            <MessageSquare className="w-5 h-5 text-teal-300" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">
              <span>Zgłoś uwagę / Błąd</span>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
              Głos pacjenta & rejestr jakości
            </div>
          </div>
        </button>
      </motion.div>

      {/* SECTION: Dzienny Cel Sprawnościowy (Okrągły wskaźnik postępu) & Animowany Ogień Serii */}
      <motion.div variants={itemVariants}>
        <DailyFitnessGoalRing
          streakDays={appState.profile.streakDays}
          completedTodaySession={todayPlanDay.completed}
          todayEstimatedMinutes={todayPlanDay.estimatedMinutes}
          completedMicroBreaksCount={appState.profile.completedMicroBreaksCount || 0}
          totalCompletedSessions={appState.profile.totalCompletedSessions || 0}
          onStartSession={() => onStartActiveSession(todayExercises)}
          onOpenAchievements={onOpenAchievements}
        />
      </motion.div>

      {/* SECTION: Miniaturowy Wykres Słupkowy Sesji w Bieżącym Tygodniu vs Cel */}
      <motion.div variants={itemVariants}>
        <WeeklySessionsMiniBarChart
          completedDates={appState.profile.completedSessionDates}
          planDays={appState.activePlan.days}
          targetGoal={5}
          onNavigateToPlan={() => onNavigateTab('plan')}
        />
      </motion.div>

      {/* SECTION: Rehabilitation Milestones System (Bronze, Silver, Gold, Platinum) */}
      <motion.div variants={itemVariants}>
        <RehabilitationMilestones
          achievements={appState.achievements}
          totalCompletedSessions={appState.profile.totalCompletedSessions || 0}
          streakDays={appState.profile.streakDays || 0}
          onOpenAchievements={onOpenAchievements}
          onStartActiveSession={() => onStartActiveSession(todayExercises)}
        />
      </motion.div>

      {/* SECTION: Wskazówka dnia (Daily Ergonomics Tip Notification) */}
      <motion.div
        variants={itemVariants}
        id="daily-ergonomics-tip"
        className="relative overflow-hidden bg-gradient-to-r from-amber-50 via-amber-50/70 to-teal-50/50 dark:from-amber-950/30 dark:via-slate-900 dark:to-teal-950/20 border border-amber-200/80 dark:border-amber-800/60 rounded-3xl p-5 sm:p-6 shadow-xs"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Glowing Lightbulb Icon Container */}
            <div className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-900/60 border border-amber-300 dark:border-amber-700/60 text-amber-600 dark:text-amber-400 shrink-0 shadow-xs">
              <Lightbulb className="w-6 h-6 fill-amber-400 dark:fill-amber-500 animate-pulse" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 border border-amber-300/80 dark:border-amber-700/60 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-300" />
                  Wskazówka Dnia • {currentTip.category}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Codzienna profilaktyka kręgosłupa
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTip.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    {currentTip.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mt-1">
                    {currentTip.advice}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0">
            <button
              id="next-daily-tip-btn"
              type="button"
              onClick={handleNextTip}
              title="Wylosuj kolejną poradę"
              className="p-2.5 rounded-xl border border-amber-200 dark:border-amber-800/80 hover:bg-amber-100/60 dark:hover:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRotatingTip ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Inna porada</span>
            </button>

            <button
              id="action-daily-tip-btn"
              type="button"
              onClick={handleTipAction}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
            >
              <span>{currentTip.actionLabel || 'Sprawdź'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Quick Action Cards Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: AI Pain Analyzer */}
        <div 
          id="quick-card-triage"
          onClick={() => onNavigateTab('triage')}
          className="group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Zgłoś i przeanalizuj ból (AI)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Odczuwasz sztywność karku, ból głowy lub drętwienie dłoni? Wykonaj bezpłatny wywiad kinezjologiczny offline.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-teal-600 dark:text-teal-400">
            <span>Rozpocznij analizę</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: 60-Second Office Break */}
        <div 
          id="quick-card-break"
          onClick={() => onStartActiveSession([chinTuckExercise])}
          className="group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Wind className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Mikro-przerwa biurowa (1 min)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Siedzisz przed monitorem? Szybka 60-sekundowa retrakcja brody zdejmuje natychmiast 20 kg nacisku z krążków C5-C7.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-sky-600 dark:text-sky-400">
            <span>Wykonaj retrakcję (1 min)</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Szybkie wskazówki (losowe porady ergonomiczne po kliknięciu) */}
        <div 
          id="quick-tips-card"
          onClick={handleShuffleQuickCardTip}
          className="group bg-white dark:bg-slate-900 border border-amber-200/90 dark:border-amber-800/70 hover:border-amber-400 dark:hover:border-amber-600 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden"
          title="Kliknij, aby wylosować inną poradę ergonomiczną"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Lightbulb className="w-6 h-6 fill-amber-400 dark:fill-amber-500" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 flex items-center gap-1">
                <RefreshCw className={`w-3 h-3 ${isQuickCardSpinning ? 'animate-spin' : ''}`} />
                <span>Losuj poradę 🎲</span>
              </span>
            </div>

            <div className="text-[11px] font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1 mb-1">
              <Sparkles className="w-3 h-3" />
              <span>Szybkie wskazówki • {quickCardTip.category}</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={quickCardTip.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
              >
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {quickCardTip.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {quickCardTip.advice}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
            <span>Kliknij, aby wylosować</span>
            <RefreshCw className={`w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-300 ${isQuickCardSpinning ? 'animate-spin' : ''}`} />
          </div>
        </div>

        {/* Card 4: Doctor Medical PDF */}
        <div 
          id="quick-card-reports"
          onClick={() => onNavigateTab('reports')}
          className="group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Karta dla Lekarza (PDF)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Eksportuj historię bólu VAS, wykresy dynamiki i realizowane ćwiczenia do profesjonalnego pliku PDF na wizytę.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
            <span>Zobacz raporty</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </motion.div>

      {/* SECTION: Posture Camera Analyzer (Client-Side Line Recognition for Head Protraction) */}
      <motion.div variants={itemVariants}>
        <PostureCameraAnalyzer
          onStartExercise={(ex) => onStartActiveSession([ex])}
          onSaveMeasurement={onSavePostureMeasurement}
        />
      </motion.div>

      {/* SECTION: Faza 3 - Ergonomia Stanowiska & Regulacja Autonomiczna (BPS & Oddech) */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Workstation Auditor ISO 9241-5 */}
        <div 
          onClick={() => onNavigateTab('ergonomics')}
          className="group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Monitor className="w-6 h-6" />
              </div>
              {appState.profile.ergonomicAudit ? (
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  Ocena: {appState.profile.ergonomicAudit.calculatedRiskScore}%
                </span>
              ) : (
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                  Audyt DIN EN 527
                </span>
              )}
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Audyt Ergonomii Biurka
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              {appState.profile.ergonomicAudit 
                ? `Wysokość blatu: ${appState.profile.ergonomicAudit.currentDeskHeightCm} cm. Zalecane: ${appState.profile.ergonomicAudit.recommendedSittingDeskHeightCm} cm. Kliknij, by zaktualizować.`
                : 'Sprawdź wysokość blatu, fotela i kąt monitora wg normy DIN EN 527 / ISO 9241-5. Oblicz nacisk na kręgi szyjne.'}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-teal-600 dark:text-teal-400">
            <span>{appState.profile.ergonomicAudit ? 'Zobacz pełen audyt' : 'Rozpocznij audyt biurka'}</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Diaphragmatic Breathing (Nerw Błędny) */}
        <div 
          onClick={() => onOpenBreathingModal?.()}
          className="group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Wind className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300">
                Nerw Błędny (C3-C5)
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Oddech Przeponowy 4-7-8
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Płytki oddech szczytowy zmusza mięśnie szyi do podnoszenia żeber 20 000 razy dziennie. Resetuj napięcie karku oddechem dolnożebrowym.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-cyan-600 dark:text-cyan-400">
            <span>Uruchom trening oddechu</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Biopsychosocial Diary (BPS) */}
        <div 
          onClick={() => onOpenBpsModal?.()}
          className="group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Moon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                Stres • Sen • Bruksizm
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Dziennik Bio-Psycho-Społeczny
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Zarejestruj poziom stresu, zaciskanie zębów oraz pozycję snu. Bruksizm i spanie na brzuchu są najczęstszą przyczyną porannego kręczu szyi.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
            <span>Dodaj wpis do dziennika</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </motion.div>

      {/* Two columns: Today exercises preview & Daily meds status */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Today's exercises breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-600" />
              Ćwiczenia na dziś ({todayPlanDay.dayName})
            </h3>
            <button
              onClick={() => onNavigateTab('plan')}
              className="text-xs font-bold text-teal-600 hover:underline"
            >
              Zobacz cały tydzień →
            </button>
          </div>

          <div className="space-y-3">
            {todayExercises.map((exercise, idx) => (
              <div
                key={exercise.id}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 font-bold flex items-center justify-center text-xs shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      {exercise.polishName}
                    </h4>
                    <span className="text-slate-600 dark:text-slate-400 text-[11px]">
                      {exercise.defaultSets} serie × {exercise.defaultReps} powtórzeń • {exercise.tempo} tempo
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenExerciseDetails(exercise)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-200/60 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Technika
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Daily Medications & Wearables Snapshot (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Medications checklist */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-teal-600" />
                Leki i suplementy na dziś
              </h3>
              <button
                onClick={() => onNavigateTab('wearables')}
                className="text-xs font-bold text-teal-600 hover:underline"
              >
                Zarządzaj →
              </button>
            </div>

            <div className="space-y-2">
              {appState.medications.slice(0, 3).map((med) => {
                const time = med.scheduleTimes[0] || '08:00';
                const isTaken = !!med.takenToday[time];
                return (
                  <div
                    key={med.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                        {med.name}
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400">
                        {med.dosage} • {time}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleMedication(med.id, time)}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer ${
                        isTaken
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{isTaken ? 'Zażyte' : 'Zaznacz'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Smartwatch summary card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Watch className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {appState.wearable.connected ? appState.wearable.deviceName : 'Smartwatch rozłączony'}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                  {appState.wearable.connected ? `Tętno: ${appState.wearable.currentHeartRate} BPM • ${appState.wearable.todaySteps} kroków` : 'Kliknij, aby połączyć przez Bluetooth'}
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('wearables')}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 text-xs font-semibold cursor-pointer"
            >
              Połącz
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
