import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, Camera, Stethoscope, FileText, X, ChevronRight, 
  ChevronLeft, Sparkles, CheckCircle2, HelpCircle, Compass 
} from 'lucide-react';
import { soundService } from '../services/soundService';

export interface TourStep {
  targetId: string;
  title: string;
  subtitle: string;
  description: string;
  clinicalTip: string;
  icon: React.ReactNode;
  positionPreference?: 'top' | 'bottom' | 'center';
  tabRequired?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: string) => void;
  currentTab?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: 'welcome-dialog',
    title: 'Witaj w FizjoSzyja!',
    subtitle: 'Twój Osobisty Kinezjolog i Strażnik Kręgosłupa Szyjnego',
    description: 'Aplikacja łączy kliniczne protokoły fizjoterapeutyczne, analizę postawy i biofeedback w jednym bezpiecznym narzędziu offline (RODO/GDPR). Poświęć 45 sekund, aby poznać kluczowe funkcje!',
    clinicalTip: 'Systematyczne ćwiczenia odciążają stawy kręgów C5-C7 i zapobiegają bolesnej protrakcji głowy.',
    icon: <Sparkles className="w-6 h-6 text-amber-500" />,
    positionPreference: 'center'
  },
  {
    targetId: 'dashboard-start-session-btn',
    title: 'Główny Przycisk: Rozpocznij Sesję',
    subtitle: 'Codzienny 8-12 minutowy zestaw ćwiczeń',
    description: 'Kliknij ten przycisk codziennie, aby uruchomić dzisiejszy zestaw ćwiczeń kinezjologicznych z interaktywnym zegarem, wskazówkami biomechanicznymi i lektorem głosowym.',
    clinicalTip: 'Wykonywanie ćwiczeń o stałej porze (np. przed pracą) buduje nawyk i utrwala serię (Streak).',
    icon: <Play className="w-6 h-6 text-teal-500 fill-teal-500" />,
    positionPreference: 'bottom',
    tabRequired: 'dashboard'
  },
  {
    targetId: 'posture-camera-analyzer',
    title: 'Narzędzie Pomiaru Postawy (CVA & Strażnik)',
    subtitle: 'Fotograficzna analiza kąta i monitoring na żywo',
    description: 'Wykonaj zdjęcie profilowe, aby zmierzyć kąt wysunięcia głowy (CVA), lub włącz "Strażnika Biurka", który ostrzega dźwiękiem, gdy podczas pracy przy biurku zaczynasz się garbić.',
    clinicalTip: 'Pochylenie głowy o 45° wywiera nacisk aż 22 kg na odcinek szyjny. Regularny pomiar pozwala śledzić postępy.',
    icon: <Camera className="w-6 h-6 text-sky-500" />,
    positionPreference: 'top',
    tabRequired: 'dashboard'
  },
  {
    targetId: 'quick-card-triage',
    title: 'Wywiad i Analiza Bólu AI',
    subtitle: 'Ocena w skali VAS (0-10) i czerwone flagi',
    description: 'Jeśli odczuwasz sztywność karku, ból głowy lub drętwienie dłoni – wykonaj szybki wywiad. Lokalny silnik AI zasugeruje dopasowanie intensywności ćwiczeń.',
    clinicalTip: 'Nigdy nie ignoruj objawów promieniujących do barku lub ręki – aplikacja natychmiast zweryfikuje bezpieczeństwo.',
    icon: <Stethoscope className="w-6 h-6 text-emerald-500" />,
    positionPreference: 'bottom',
    tabRequired: 'dashboard'
  },
  {
    targetId: 'quick-card-reports',
    title: 'Wykresy Bólu & Karta dla Lekarza (PDF)',
    subtitle: '30-dniowy trend rekonwalescencji i eksport A4',
    description: 'W tym module znajdziesz 30-dniowy liniowy wykres dynamiki bólu VAS oraz wygenerujesz gotowy dokument PDF dla lekarza POZ lub fizjoterapeuty.',
    clinicalTip: 'Obiektywny raport medyczny skraca diagnozę lekarską i pozwala udowodnić skuteczność rehabilitacji.',
    icon: <FileText className="w-6 h-6 text-indigo-500" />,
    positionPreference: 'bottom',
    tabRequired: 'dashboard'
  }
];

export const GuidedTour: React.FC<Props> = ({
  isOpen,
  onClose,
  onNavigateTab,
  currentTab = 'dashboard'
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isMeasuring, setIsMeasuring] = useState<boolean>(true);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const step = TOUR_STEPS[currentStepIdx];
  const isFirstStep = currentStepIdx === 0;
  const isLastStep = currentStepIdx === TOUR_STEPS.length - 1;

  // Measure target element coordinates
  const updateHighlight = useCallback(() => {
    if (!isOpen) return;

    if (step.targetId === 'welcome-dialog') {
      setTargetRect(null);
      setIsMeasuring(false);
      return;
    }

    const el = document.getElementById(step.targetId);
    if (el) {
      // Scroll into view smoothly
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      setTimeout(() => {
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);
        setIsMeasuring(false);
      }, 180);
    } else {
      setTargetRect(null);
      setIsMeasuring(false);
    }
  }, [isOpen, step]);

  // If step requires specific tab, ensure user is navigated there
  useEffect(() => {
    if (isOpen && step.tabRequired && onNavigateTab && currentTab !== step.tabRequired) {
      onNavigateTab(step.tabRequired);
    }
  }, [isOpen, step, onNavigateTab, currentTab]);

  // Update rect on step change or resize/scroll
  useEffect(() => {
    if (!isOpen) return;
    setIsMeasuring(true);
    updateHighlight();

    const handleResize = () => updateHighlight();
    const handleScroll = () => {
      const el = document.getElementById(step.targetId);
      if (el && step.targetId !== 'welcome-dialog') {
        setTargetRect(el.getBoundingClientRect());
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen, currentStepIdx, updateHighlight, step]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape') {
        handleComplete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIdx]);

  const handleNext = () => {
    soundService.playTick();
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStepIdx(prev => Math.min(TOUR_STEPS.length - 1, prev + 1));
    }
  };

  const handlePrev = () => {
    soundService.playTick();
    setCurrentStepIdx(prev => Math.max(0, prev - 1));
  };

  const handleComplete = () => {
    soundService.playSuccess();
    try {
      localStorage.setItem('fizjo_rehab_guided_tour_completed_v1', 'true');
    } catch {
      // ignore in iframe storage restrictions
    }
    onClose();
  };

  if (!isOpen) return null;

  // Calculate tooltip placement relative to target rect
  const getTooltipStyle = (): React.CSSProperties => {
    if (!targetRect || step.positionPreference === 'center') {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        position: 'fixed'
      };
    }

    const margin = 16;
    const tooltipWidth = 420;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
    // Clamp to viewport horizontal boundaries
    left = Math.max(16, Math.min(viewportWidth - tooltipWidth - 16, left));

    // Determine vertical position (below or above)
    const spaceBelow = viewportHeight - targetRect.bottom;
    const spaceAbove = targetRect.top;

    let top: number;
    if (step.positionPreference === 'top' && spaceAbove > 280) {
      top = targetRect.top - 240 - margin;
    } else if (spaceBelow > 260 || spaceBelow >= spaceAbove) {
      top = targetRect.bottom + margin;
    } else {
      top = Math.max(16, targetRect.top - 240 - margin);
    }

    return {
      top: `${Math.max(16, top)}px`,
      left: `${left}px`,
      position: 'fixed',
      width: `min(${tooltipWidth}px, calc(100vw - 32px))`
    };
  };

  return (
    <div id="guided-tour-overlay" className="fixed inset-0 z-[9999] overflow-hidden">
      {/* Target Element Spotlight Cutout Frame */}
      {targetRect ? (
        <div
          id="tour-spotlight-box"
          className="fixed transition-all duration-300 pointer-events-none rounded-2xl"
          style={{
            top: `${Math.max(0, targetRect.top - 8)}px`,
            left: `${Math.max(0, targetRect.left - 8)}px`,
            width: `${targetRect.width + 16}px`,
            height: `${targetRect.height + 16}px`,
            boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.78), 0 0 24px rgba(13, 148, 136, 0.65)',
            border: '2px solid rgba(45, 212, 191, 0.9)'
          }}
        />
      ) : (
        /* Dimmed backdrop when centered */
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity duration-300" />
      )}

      {/* Floating Guided Tour Tooltip Card */}
      <div
        ref={tooltipRef}
        id="tour-tooltip-card"
        style={getTooltipStyle()}
        className="z-[10000] bg-white dark:bg-slate-900 border border-teal-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 animate-in fade-in duration-200"
      >
        {/* Step Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-300 shrink-0 shadow-xs">
              {step.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/80 text-teal-800 dark:text-teal-200">
                  Krok {currentStepIdx + 1} z {TOUR_STEPS.length}
                </span>
                <span className="text-[10px] text-slate-400">Samouczek</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1 leading-snug">
                {step.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={handleComplete}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
            title="Pomiń przewodnik (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Subtitle & Description */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-teal-700 dark:text-teal-300">
            {step.subtitle}
          </h4>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Clinical Tip Box */}
        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
          <span className="font-bold">Wskazówka fizjoterapeuty: </span>
          {step.clinicalTip}
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-amber-500 transition-all duration-300"
            style={{ width: `${((currentStepIdx + 1) / TOUR_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={handleComplete}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold cursor-pointer"
          >
            Pomiń samouczek
          </button>

          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <button
                type="button"
                onClick={handlePrev}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Wstecz</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>{isLastStep ? 'Zakończ samouczek' : 'Dalej'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
