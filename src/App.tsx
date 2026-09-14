import React, { useState, useEffect } from 'react';
import { Header, NavTab } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ExerciseCatalogView } from './components/ExerciseCatalogView';
import { TrainingPlanView } from './components/TrainingPlanView';
import { PainAnalyzerView } from './components/PainAnalyzerView';
import { ProgressReportView } from './components/ProgressReportView';
import { WearablesMedsView } from './components/WearablesMedsView';
import { KnowledgeBaseSection } from './components/KnowledgeBaseSection';
import { AchievementsModal } from './components/AchievementsModal';
import { ExerciseModal } from './components/ExerciseModal';
import { ActiveSessionModal } from './components/ActiveSessionModal';
import { MedicalOnboardingModal } from './components/MedicalOnboardingModal';
import { EmergencyRedFlagsModal } from './components/EmergencyRedFlagsModal';
import { ClinicalFeedbackModal } from './components/ClinicalFeedbackModal';
import { PrivacyStorageService, AppState } from './services/privacyStorage';
import { evaluateAchievements, INITIAL_ACHIEVEMENTS, Achievement } from './services/achievements';
import { EXERCISES } from './data/exercises';
import { Exercise, TrainingDay, PainReport, PatientMood } from './types';
import { ShieldCheck, Trophy, Sparkles, Bell, Clock, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ProfileView } from './components/ProfileView';
import { SmartMicroBreakModal } from './components/SmartMicroBreakModal';
import { useSmartMicroBreak } from './hooks/useSmartMicroBreak';
import { ErgonomicWorkstationAuditor } from './components/ErgonomicWorkstationAuditor';
import { DiaphragmaticBreathingModal } from './components/DiaphragmaticBreathingModal';
import { BiopsychosocialDiaryModal } from './components/BiopsychosocialDiaryModal';
import { BiopsychosocialLog } from './types';

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => PrivacyStorageService.loadState());
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Theme mode: 'system' (auto according to OS), 'light', or 'dark'
  const [themeMode, setThemeMode] = useState<'system' | 'light' | 'dark'>(() => {
    try {
      const stored = localStorage.getItem('fizjo_theme_mode');
      if (stored === 'system' || stored === 'light' || stored === 'dark') {
        return stored;
      }
    } catch {
      // fallback
    }
    return 'system';
  });

  // Determine dark mode based on system / mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  // Automatically sync theme with user's system preferences
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const systemPrefersDark = mediaQuery.matches;
      const effectiveDark = themeMode === 'system' ? systemPrefersDark : themeMode === 'dark';
      setIsDarkMode(effectiveDark);
      if (effectiveDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();

    // Listen to device system theme changes in real-time
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (themeMode === 'system') {
        const effectiveDark = e.matches;
        setIsDarkMode(effectiveDark);
        if (effectiveDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    try {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    } catch {
      // Fallback for older Safari
      mediaQuery.addListener(handleSystemThemeChange);
      return () => mediaQuery.removeListener(handleSystemThemeChange);
    }
  }, [themeMode]);

  const handleCycleThemeMode = () => {
    setThemeMode((prev) => {
      let next: 'system' | 'light' | 'dark';
      if (prev === 'system') next = 'dark';
      else if (prev === 'dark') next = 'light';
      else next = 'system';

      try {
        localStorage.setItem('fizjo_theme_mode', next);
      } catch {
        // storage fallback
      }
      return next;
    });
  };

  // Modals state
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [activeSessionExercises, setActiveSessionExercises] = useState<Exercise[] | null>(null);
  const [activeSessionDay, setActiveSessionDay] = useState<TrainingDay | null>(null);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState<boolean>(false);
  const [newlyUnlockedToast, setNewlyUnlockedToast] = useState<Achievement | null>(null);

  // Medical Onboarding & Safety Modals
  const [isConsentModalOpen, setIsConsentModalOpen] = useState<boolean>(() => {
    return !appState.profile.onboardingCompleted || !appState.profile.hasAcceptedConsent;
  });
  const [isRedFlagsModalOpen, setIsRedFlagsModalOpen] = useState<boolean>(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState<boolean>(false);
  const [isBreathingModalOpen, setIsBreathingModalOpen] = useState<boolean>(false);
  const [isBpsModalOpen, setIsBpsModalOpen] = useState<boolean>(false);

  const handleSaveBpsLog = (log: BiopsychosocialLog) => {
    const currentLogs = appState.profile.bpsLogs || [];
    const updatedProfile = {
      ...appState.profile,
      bpsLogs: [...currentLogs, log]
    };
    handleUpdateAppState({
      ...appState,
      profile: updatedProfile
    });
    setIsBpsModalOpen(false);
  };

  const handleCompleteBreathing = (stats: { cyclesCompleted: number; durationSeconds: number }) => {
    const currentCount = appState.profile.completedMicroBreaksCount || 0;
    const updatedProfile = {
      ...appState.profile,
      completedMicroBreaksCount: currentCount + 1
    };
    handleUpdateAppState({
      ...appState,
      profile: updatedProfile
    });
  };

  const handleAcceptConsent = (data: {
    userName: string;
    primaryGoal: 'tech_neck' | 'discopathy' | 'tension_headache' | 'posture_prevention' | 'shoulder_scapula';
  }) => {
    const updatedProfile = {
      ...appState.profile,
      name: data.userName,
      primaryGoal: data.primaryGoal,
      hasAcceptedConsent: true,
      consentAcceptedAt: new Date().toISOString(),
      onboardingCompleted: true
    };
    handleUpdateAppState({
      ...appState,
      profile: updatedProfile
    });
    setIsConsentModalOpen(false);
  };

  // Knowledge base read tracking (local-first)
  const [readArticles, setReadArticles] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('fizjo_read_articles');
      return stored ? JSON.parse(stored) : ['ergonomics-desk-setup'];
    } catch {
      return ['ergonomics-desk-setup'];
    }
  });

  const handleMarkArticleAsRead = (id: string) => {
    setReadArticles((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        localStorage.setItem('fizjo_read_articles', JSON.stringify(next));
      } catch {
        // Storage fallback
      }
      return next;
    });
  };

  // Persist app state updates
  const handleUpdateAppState = (newState: AppState) => {
    setAppState(newState);
    PrivacyStorageService.saveState(newState);
  };

  // Smart Micro-Break & Browser / PWA Notification System (30-second chin-tuck reminder)
  const {
    isMicroBreakModalOpen,
    openMicroBreakModal,
    closeMicroBreakModal,
    completeMicroBreak,
    notificationPermission,
    requestPermission,
    triggerManualMicroBreak
  } = useSmartMicroBreak({
    appState,
    onUpdateState: handleUpdateAppState,
    inactivityThresholdSeconds: 180, // 3 minutes of continuous app activity without training
    cooldownSeconds: 300 // 5 minutes cooldown between automated prompts
  });

  // Launch single exercise or custom session
  const handleStartSession = (exercises: Exercise[], day?: TrainingDay) => {
    setActiveSessionExercises(exercises);
    setActiveSessionDay(day || null);
  };

  // Handle completed session with achievements evaluation
  const handleCompleteSession = (stats: {
    preVas: number;
    postVas: number;
    durationMinutes: number;
    completedCount: number;
    usedBreathingGuide: boolean;
    difficultyLevel?: number;
    stressLevel?: number;
    mood?: PatientMood;
    notes?: string;
  }) => {
    const todayStr = new Date().toISOString();
    const todayDateOnly = todayStr.split('T')[0];
    let updatedDays = [...appState.activePlan.days];

    if (activeSessionDay) {
      updatedDays = updatedDays.map((d) => {
        if (d.dayIndex === activeSessionDay.dayIndex) {
          return {
            ...d,
            completed: true,
            completedAt: todayStr,
            prePainVas: stats.preVas,
            postPainVas: stats.postVas
          };
        }
        return d;
      });
    }

    const newCompletedCount = appState.profile.totalCompletedSessions + 1;
    const newStreak = appState.profile.streakDays + 1;
    const currentDates = appState.profile.completedSessionDates || [];
    const updatedDates = currentDates.includes(todayDateOnly) 
      ? currentDates 
      : [...currentDates, todayDateOnly].sort();

    // Record session into painHistory with psychosomatic data
    const sessionReport: PainReport = {
      id: `session-vas-${Date.now()}`,
      date: todayStr,
      vasScore: stats.preVas,
      region: 'neck',
      character: stats.preVas <= 3 ? 'dull' : stats.preVas <= 6 ? 'stiff' : 'sharp',
      triggers: ['Praca przy biurku', 'Trening karku'],
      associatedSymptoms: [],
      reliefPositions: ['Retrakcja szyi', 'Pozycja Brüggera'],
      stressLevel: stats.stressLevel ?? 4,
      mood: stats.mood ?? 'neutral',
      psychosomaticNotes: stats.notes,
      aiAnalysis: {
        riskLevel: stats.preVas <= 3 ? 'low' : stats.preVas <= 6 ? 'moderate' : 'high_consult_doctor',
        urgency: 'routine',
        primarySuspicion: `Sesja ćwiczeń (trudność: ${stats.difficultyLevel || 3}/5). Wynik: ${stats.preVas} → ${stats.postVas} VAS.`,
        redFlagsDetected: [],
        explanation: `Ćwiczenia zredukowały ból z ${stats.preVas} do ${stats.postVas} pkt VAS. Nastrój przed: ${stats.mood || 'neutralny'}, poziom stresu: ${stats.stressLevel ?? 4}/10.`,
        recommendedExercises: ['chin-tuck', 'brugger-relief'],
        contraindicatedExercises: [],
        immediateReliefAdvice: ['Nawodnienie', 'Płynny, spokojny oddech przeponowy'],
        doctorQuestions: []
      }
    };

    const interimState: AppState = {
      ...appState,
      painHistory: [sessionReport, ...appState.painHistory],
      activePlan: {
        ...appState.activePlan,
        days: updatedDays
      },
      profile: {
        ...appState.profile,
        completedSessionDates: updatedDates,
        totalCompletedSessions: newCompletedCount,
        streakDays: newStreak,
        lastActiveDate: todayDateOnly
      }
    };

    // Evaluate Achievements
    const evalResult = evaluateAchievements({
      appState: interimState,
      sessionUsedBreathing: stats.usedBreathingGuide,
      previousAchievements: appState.achievements || INITIAL_ACHIEVEMENTS
    });

    const finalState: AppState = {
      ...interimState,
      achievements: evalResult.achievements
    };

    handleUpdateAppState(finalState);

    // Show achievement celebration toast if new badge unlocked
    if (evalResult.newlyUnlocked.length > 0) {
      setNewlyUnlockedToast(evalResult.newlyUnlocked[0]);
      setTimeout(() => {
        setNewlyUnlockedToast(null);
      }, 5000);
    }
  };

  // Save new Pain Report from AI Triage
  const handleSavePainReport = (report: PainReport) => {
    const updatedState: AppState = {
      ...appState,
      painHistory: [report, ...appState.painHistory]
    };
    handleUpdateAppState(updatedState);
  };

  // Toggle medication taken state
  const handleToggleMedication = (medId: string, time: string) => {
    const updatedMeds = appState.medications.map((med) => {
      if (med.id === medId) {
        return {
          ...med,
          takenToday: {
            ...med.takenToday,
            [time]: !med.takenToday[time]
          }
        };
      }
      return med;
    });

    const updatedState: AppState = {
      ...appState,
      medications: updatedMeds
    };
    handleUpdateAppState(updatedState);
  };

  const unlockedMedalsCount = (appState.achievements || INITIAL_ACHIEVEMENTS).filter(a => a.unlocked).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 selection:bg-teal-500 selection:text-white">
      {/* Header with Gov-style branding, Navigation & Dark Mode Toggle */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isDarkMode={isDarkMode}
        themeMode={themeMode}
        onToggleDarkMode={handleCycleThemeMode}
        streakDays={appState.profile.streakDays}
        unlockedMedalsCount={unlockedMedalsCount}
        onOpenAchievements={() => setIsAchievementsOpen(true)}
      />

      {/* Achievement Unlocked Toast */}
      {newlyUnlockedToast && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-amber-500 to-teal-600 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20">
            <div className="p-2 bg-white/20 rounded-xl">
              <Trophy className="w-6 h-6 text-yellow-200" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-yellow-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Nowy Medal Odblokowany!
              </div>
              <div className="text-sm font-bold">{newlyUnlockedToast.title}</div>
              <div className="text-xs text-white/90">{newlyUnlockedToast.description}</div>
            </div>
            <button
              type="button"
              onClick={() => {
                setNewlyUnlockedToast(null);
                setIsAchievementsOpen(true);
              }}
              className="ml-2 px-3 py-1.5 rounded-xl bg-white text-teal-900 font-bold text-xs hover:bg-yellow-50"
            >
              Zobacz
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Smart Micro-Break Quick Status Bar */}
        <div className="mb-6 p-3 sm:p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 dark:border-teal-500/30 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>30-sekundowa mikro-przerwa (Retrakcja szyi)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-600/10 text-teal-700 dark:text-teal-300 font-bold">
                  Aktywna ochrona C5-C7
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Wykrywanie dłuższej pracy bez ruchu aktywuje inteligentne powiadomienie PWA/przeglądarki.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {notificationPermission === 'default' && (
              <button
                type="button"
                onClick={requestPermission}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950 text-xs font-semibold transition-all cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Włącz powiadomienia PWA</span>
              </button>
            )}

            <button
              type="button"
              onClick={triggerManualMicroBreak}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Zrób 30s Przerwę Teraz</span>
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            layout="position"
            initial={{ opacity: 0, y: 14, scale: 0.992 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.992 }}
            transition={{ 
              duration: 0.25, 
              ease: [0.22, 1, 0.36, 1],
              layout: { duration: 0.25, ease: [0.22, 1, 0.36, 1] }
            }}
          >
            {activeTab === 'dashboard' && (
              <DashboardView
                appState={appState}
                onNavigateTab={setActiveTab}
                onStartActiveSession={(exercises) => handleStartSession(exercises)}
                onOpenExerciseDetails={setSelectedExercise}
                onToggleMedication={handleToggleMedication}
                onOpenRedFlags={() => setIsRedFlagsModalOpen(true)}
                onOpenConsentModal={() => setIsConsentModalOpen(true)}
                onOpenFeedbackModal={() => setIsFeedbackModalOpen(true)}
                onOpenBreathingModal={() => setIsBreathingModalOpen(true)}
                onOpenBpsModal={() => setIsBpsModalOpen(true)}
                onOpenAchievements={() => setIsAchievementsOpen(true)}
                onSavePostureMeasurement={(angle, diagnosis) => {
                  const newReport: PainReport = {
                    id: `posture-${Date.now()}`,
                    date: new Date().toISOString().split('T')[0],
                    vasScore: Math.min(10, Math.max(1, Math.round(angle / 6))),
                    region: 'neck',
                    character: 'stiff',
                    triggers: ['Praca przy biurku', 'Pozycja siedząca', 'Smartfon'],
                    associatedSymptoms: ['Tech-neck', `Kąt protrakcji: ${angle}°`],
                    reliefPositions: ['Retrakcja brody (Chin Tuck)', 'Pozycja Brüggera'],
                    postureTiltAngleDeg: angle,
                    postureDiagnosis: diagnosis,
                    aiAnalysis: {
                      riskLevel: angle <= 15 ? 'low' : angle <= 30 ? 'moderate' : 'high_consult_doctor',
                      urgency: angle > 30 ? 'observation' : 'routine',
                      primarySuspicion: `Wychylenie posturalne głowy: ${diagnosis} (${angle}°)`,
                      redFlagsDetected: [],
                      explanation: `Pomiar ze zdjęcia wykazał kąt CVA = ${angle}°. Przybliżony nacisk na krążki C5-C7 wynosi ok. ${Math.round(5 + (angle / 60) * 22)} kg.`,
                      recommendedExercises: ['chin-tuck', 'brugger-relief', 'trapezius-upper-stretch'],
                      contraindicatedExercises: [],
                      immediateReliefAdvice: [
                        'Wykonaj 5-8 powtórzeń retrakcji brody (chin-tuck)',
                        'Ustaw górną krawędź monitora na wysokości oczu',
                        'Rób mikroprzerwy co 25 minut pracy biurowej'
                      ],
                      doctorQuestions: [
                        'Czy występują promieniujące bóle do kończyny górnej?',
                        'Czy zgięcie głowy w tył nasila dolegliwości?'
                      ]
                    }
                  };
                  const updatedState = {
                    ...appState,
                    painHistory: [newReport, ...appState.painHistory]
                  };
                  handleUpdateAppState(updatedState);
                }}
              />
            )}

            {activeTab === 'exercises' && (
              <ExerciseCatalogView
                onOpenDetails={setSelectedExercise}
                onQuickStart={(ex) => handleStartSession([ex])}
                readArticleIds={readArticles}
                onMarkArticleAsRead={handleMarkArticleAsRead}
              />
            )}

            {activeTab === 'knowledge' && (
              <KnowledgeBaseSection
                readArticleIds={readArticles}
                onMarkAsRead={handleMarkArticleAsRead}
                allExercises={EXERCISES}
                onSelectExercise={setSelectedExercise}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'plan' && (
              <TrainingPlanView
                plan={appState.activePlan}
                onUpdatePlan={(newPlan) => {
                  const updatedState = { ...appState, activePlan: newPlan };
                  handleUpdateAppState(updatedState);
                }}
                onStartDaySession={(day, exercises) => handleStartSession(exercises, day)}
                onOpenExerciseDetails={setSelectedExercise}
                painHistory={appState.painHistory}
                profile={appState.profile}
                medications={appState.medications}
                reminders={appState.reminders}
                onToggleCompletedDate={(dateStr) => {
                  const currentDates = appState.profile.completedSessionDates || [];
                  const exists = currentDates.includes(dateStr);
                  const updatedDates = exists
                    ? currentDates.filter(d => d !== dateStr)
                    : [...currentDates, dateStr].sort();
                  
                  // Recalculate streak if needed
                  const updatedProfile = {
                    ...appState.profile,
                    completedSessionDates: updatedDates,
                    streakDays: Math.max(appState.profile.streakDays, updatedDates.length)
                  };
                  handleUpdateAppState({ ...appState, profile: updatedProfile });
                }}
                onSaveMobilityTest={(testData) => {
                  const newTests = [
                    {
                      date: new Date().toISOString().split('T')[0],
                      ...testData
                    },
                    ...(appState.profile.mobilityTests || [])
                  ];
                  const updatedProfile = {
                    ...appState.profile,
                    mobilityTests: newTests
                  };
                  handleUpdateAppState({ ...appState, profile: updatedProfile });
                }}
              />
            )}

            {activeTab === 'triage' && (
              <PainAnalyzerView
                painHistory={appState.painHistory}
                onSaveReport={handleSavePainReport}
                onOpenExercise={setSelectedExercise}
                onNavigateToPdf={() => setActiveTab('reports')}
              />
            )}

            {activeTab === 'reports' && (
              <ProgressReportView
                appState={appState}
                onUpdateState={handleUpdateAppState}
                onNavigateToTriage={() => setActiveTab('triage')}
              />
            )}

            {activeTab === 'ergonomics' && (
              <ErgonomicWorkstationAuditor
                initialAudit={appState.profile.ergonomicAudit}
                userHeight={appState.profile.heightCm || 175}
                onSaveAudit={(audit) => {
                  const updatedProfile = {
                    ...appState.profile,
                    ergonomicAudit: audit,
                    heightCm: audit.userHeightCm
                  };
                  handleUpdateAppState({ ...appState, profile: updatedProfile });
                }}
                onNavigateToKnowledge={() => setActiveTab('knowledge')}
              />
            )}

            {activeTab === 'wearables' && (
              <WearablesMedsView
                appState={appState}
                onUpdateState={handleUpdateAppState}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileView
                appState={appState}
                onUpdateState={handleUpdateAppState}
                onNavigateToTab={setActiveTab}
                onOpenEmergencyModal={() => setIsRedFlagsModalOpen(true)}
                onOpenBreathingModal={() => setIsBreathingModalOpen(true)}
                onOpenBpsModal={() => setIsBpsModalOpen(true)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer with Medical Disclaimers & Privacy Notice */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-2 font-bold text-slate-800 dark:text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>FizjoSzyja & Kręgosłup • Zgodne ze standardem Moje Fizjo / gov.pl</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 max-w-2xl">
              Aplikacja ma charakter wspomagający, profilaktyczny i edukacyjny. W przypadku wystąpienia objawów alarmowych (tzw. czerwonych flag: silne zawroty głowy, niedowłady, omdlenia) należy niezwłocznie zgłosić się do lekarza lub na SOR (112/999).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 text-[11px]">
            <button
              type="button"
              onClick={() => setIsConsentModalOpen(true)}
              className="text-teal-600 dark:text-teal-400 hover:underline font-semibold cursor-pointer"
            >
              Świadoma Zgoda & RODO
            </button>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <button
              type="button"
              onClick={() => setIsRedFlagsModalOpen(true)}
              className="text-rose-600 dark:text-rose-400 hover:underline font-semibold cursor-pointer"
            >
              Czerwone Flagi (SOR 112)
            </button>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <button
              type="button"
              onClick={() => setIsFeedbackModalOpen(true)}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:underline cursor-pointer"
            >
              Zgłoś uwagę / Błąd
            </button>
            <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-semibold ml-1">
              🔒 100% On-Device Storage
            </span>
          </div>
        </div>
      </footer>

      {/* Medical Onboarding & Patient Consent Modal */}
      <MedicalOnboardingModal
        isOpen={isConsentModalOpen}
        isAlreadyAccepted={!!appState.profile.hasAcceptedConsent}
        onAcceptConsent={handleAcceptConsent}
        onClose={() => setIsConsentModalOpen(false)}
      />

      {/* Emergency Red Flags Modal */}
      <EmergencyRedFlagsModal
        isOpen={isRedFlagsModalOpen}
        onClose={() => setIsRedFlagsModalOpen(false)}
      />

      {/* Clinical Feedback & Error Reporting Modal */}
      <ClinicalFeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />

      {/* Exercise Details & Biomechanical Animation Modal */}
      {selectedExercise && (
        <ExerciseModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
          onStartExercise={(ex) => {
            setSelectedExercise(null);
            handleStartSession([ex]);
          }}
        />
      )}

      {/* Active Workout Session Modal Player */}
      {activeSessionExercises && (
        <ActiveSessionModal
          exercises={activeSessionExercises}
          onClose={() => setActiveSessionExercises(null)}
          onComplete={handleCompleteSession}
          wearableHeartRate={appState.wearable.connected ? appState.wearable.currentHeartRate : undefined}
        />
      )}

      {/* Achievements & Virtual Medals Modal */}
      {isAchievementsOpen && (
        <AchievementsModal
          isOpen={isAchievementsOpen}
          onClose={() => setIsAchievementsOpen(false)}
          achievements={appState.achievements || INITIAL_ACHIEVEMENTS}
          streakDays={appState.profile.streakDays}
          totalCompletedSessions={appState.profile.totalCompletedSessions}
          completedMicroBreaksCount={appState.profile.completedMicroBreaksCount || 0}
          onNavigateToTab={(tab) => {
            setIsAchievementsOpen(false);
            setActiveTab(tab as any);
          }}
        />
      )}

      {/* Smart Micro-Break 30s Interactive Modal */}
      <SmartMicroBreakModal
        isOpen={isMicroBreakModalOpen}
        onClose={closeMicroBreakModal}
        onComplete={completeMicroBreak}
      />

      {/* Diaphragmatic Breathing & Vagus Nerve Training Modal (Faza 3) */}
      {isBreathingModalOpen && (
        <DiaphragmaticBreathingModal
          onClose={() => setIsBreathingModalOpen(false)}
          onCompleteSession={handleCompleteBreathing}
        />
      )}

      {/* Biopsychosocial Diary Modal (Faza 3) */}
      {isBpsModalOpen && (
        <BiopsychosocialDiaryModal
          onClose={() => setIsBpsModalOpen(false)}
          onSaveLog={handleSaveBpsLog}
          currentVasScore={
            appState.painHistory.length > 0 
              ? appState.painHistory[0].vasScore 
              : 3
          }
        />
      )}

      {/* Offline Status Toast Indicator */}
      <OfflineIndicator />
    </div>
  );
}
