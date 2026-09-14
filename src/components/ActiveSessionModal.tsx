import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, Play, Pause, SkipForward, RotateCcw, Volume2, VolumeX, 
  Heart, Sparkles, CheckCircle2, ChevronRight, AlertCircle, Wind, Video, ExternalLink, Target,
  Gauge, Smile, Meh, Frown, Activity, Sliders, AlertTriangle, ShieldAlert, MessageSquare
} from 'lucide-react';
import { Exercise, TrainingDay, PatientMood } from '../types';
import { soundService } from '../services/soundService';
import { speechService } from '../services/speechService';
import { BiomechanicalAnimator } from './BiomechanicalAnimator';
import { BreathingGuide } from './BreathingGuide';
import { EmergencyRedFlagsModal } from './EmergencyRedFlagsModal';
import { ClinicalFeedbackModal } from './ClinicalFeedbackModal';
import { WearableLiveSyncPanel, WearableTelemetry } from './WearableLiveSyncPanel';

export const DIFFICULTY_CONFIG = [
  { level: 1, label: 'Łagodny', desc: 'Dłuższy cykl (9.0s), powolne tempo, niska intensywność', cycleDurationMs: 9000 },
  { level: 2, label: 'Lekki', desc: 'Cykl 7.5s, spokojne tempo rehabilitacyjne', cycleDurationMs: 7500 },
  { level: 3, label: 'Standardowy', desc: 'Rekomendowany klinicznie cykl 6.0s na powtórzenie', cycleDurationMs: 6000 },
  { level: 4, label: 'Umiarkowany', desc: 'Cykl 5.0s, szybsze przejścia i wyższa aktywacja', cycleDurationMs: 5000 },
  { level: 5, label: 'Intensywny', desc: 'Cykl 4.0s, dynamiczny trening głębokich mięśni', cycleDurationMs: 4000 }
];

interface Props {
  exercises: Exercise[];
  dayIndex?: number;
  onComplete: (stats: { 
    preVas: number; 
    postVas: number; 
    durationMinutes: number; 
    completedCount: number; 
    usedBreathingGuide: boolean;
    difficultyLevel?: number;
    stressLevel?: number;
    mood?: PatientMood;
    notes?: string;
  }) => void;
  onClose: () => void;
  wearableHeartRate?: number;
}

export const ActiveSessionModal: React.FC<Props> = ({
  exercises,
  onComplete,
  onClose,
  wearableHeartRate
}) => {
  // Session Stages: 'pre_vas' -> 'workout' -> 'post_vas' -> 'celebration'
  const [stage, setStage] = useState<'pre_vas' | 'workout' | 'post_vas' | 'celebration'>('pre_vas');
  const [preVas, setPreVas] = useState<number>(4);
  const [postVas, setPostVas] = useState<number>(2);

  // Psychosomatic pre-session tracking
  const [preStress, setPreStress] = useState<number>(4);
  const [preMood, setPreMood] = useState<PatientMood>('neutral');
  const [preNote, setPreNote] = useState<string>('');
  const [showHighPainWarning, setShowHighPainWarning] = useState<boolean>(false);
  const [showRedFlagsModal, setShowRedFlagsModal] = useState<boolean>(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [liveTelemetry, setLiveTelemetry] = useState<WearableTelemetry | null>(null);

  // Workout state
  const [difficultyLevel, setDifficultyLevel] = useState<number>(3); // 1-5 slider
  const [currentExIndex, setCurrentExIndex] = useState<number>(0);
  const [currentSet, setCurrentSet] = useState<number>(1);
  const [currentRep, setCurrentRep] = useState<number>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [showBreathingGuide, setShowBreathingGuide] = useState<boolean>(true);
  const [hasUsedBreathing, setHasUsedBreathing] = useState<boolean>(true);
  const [activeMediaTab, setActiveMediaTab] = useState<'animator' | 'video'>('animator');
  const [repTimerSeconds, setRepTimerSeconds] = useState<number>(0);

  const [sessionElapsedSeconds, setSessionElapsedSeconds] = useState<number>(0);
  const currentExercise = exercises[currentExIndex] || exercises[0];

  const currentDifficulty = DIFFICULTY_CONFIG.find(d => d.level === difficultyLevel) || DIFFICULTY_CONFIG[2];

  const timerRef = useRef<number | null>(null);

  // Overall session elapsed timer
  useEffect(() => {
    if (stage === 'workout' && !isPaused) {
      const interval = setInterval(() => {
        setSessionElapsedSeconds((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [stage, isPaused]);

  // Handle stage transitions
  const startWorkoutFromPreVas = () => {
    setStage('workout');
    soundService.playChime(520);
    if (voiceEnabled) {
      speechService.speak(`Rozpoczynamy sesję rehabilitacyjną. Pierwsze ćwiczenie: ${currentExercise.polishName}. Przyjmij wygodną pozycję.`);
    }
  };

  const handleNextExerciseOrFinish = () => {
    if (currentExIndex < exercises.length - 1) {
      const nextIndex = currentExIndex + 1;
      setCurrentExIndex(nextIndex);
      setCurrentSet(1);
      setCurrentRep(1);
      soundService.playChime(600);
      if (voiceEnabled) {
        speechService.speak(`Świetnie! Przechodzimy do kolejnego ćwiczenia: ${exercises[nextIndex].polishName}.`);
      }
    } else {
      // Finished all exercises
      setStage('post_vas');
      soundService.playCompletion();
      if (voiceEnabled) {
        speechService.speak('Wspaniale, ukończyłeś wszystkie zaplanowane ćwiczenia! Jak teraz oceniasz ból?');
      }
    }
  };

  const completeFullSession = () => {
    setStage('celebration');
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Confetti optional
    }

    setTimeout(() => {
      onComplete({
        preVas,
        postVas,
        durationMinutes: Math.max(1, Math.round(sessionElapsedSeconds / 60)),
        completedCount: exercises.length,
        usedBreathingGuide: hasUsedBreathing,
        difficultyLevel,
        stressLevel: preStress,
        mood: preMood,
        notes: preNote.trim() || undefined
      });
    }, 2400);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const toggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    soundService.setMuted(!nextVal);
  };

  const toggleVoice = () => {
    const nextVal = !voiceEnabled;
    setVoiceEnabled(nextVal);
    speechService.setEnabled(nextVal);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div
        id="active-session-modal-card"
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-4 max-h-[95vh] flex flex-col"
      >
        {/* Top Control Bar */}
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {stage === 'workout' ? `Ćwiczenie ${currentExIndex + 1} z ${exercises.length}` : 'Sesja Rehabilitacyjna'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Breathing Guide Toggle */}
            {stage === 'workout' && (
              <button
                id="toggle-breathing-guide-btn"
                type="button"
                onClick={() => {
                  setShowBreathingGuide(!showBreathingGuide);
                  setHasUsedBreathing(true);
                }}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                  showBreathingGuide
                    ? 'border-teal-300 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 shadow-xs'
                    : 'border-slate-200 bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
                title="Włącz/wyłącz animowany przewodnik oddechowy"
              >
                <Wind className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Przewodnik Oddechu</span>
              </button>
            )}

            {/* Audio Toggle */}
            <button
              id="toggle-sound-btn"
              type="button"
              onClick={toggleSound}
              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                soundEnabled
                  ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                  : 'border-slate-200 bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}
              title={soundEnabled ? 'Dźwięki aktywne' : 'Dźwięki wyciszone'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* In-Session Feedback Button */}
            <button
              id="in-session-feedback-btn"
              type="button"
              onClick={() => setShowFeedbackModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Zgłoś uwagę lub ból do tego ćwiczenia"
            >
              <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden sm:inline">Uwagi</span>
            </button>

            {/* Close */}
            <button
              id="close-active-session-btn"
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* STAGE 1: PRE-VAS ASSESSMENT */}
        {stage === 'pre_vas' && (
          <div className="p-6 sm:p-8 flex flex-col items-center text-center space-y-6 flex-1 justify-center">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="max-w-md">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Ocena wyjściowa przed ćwiczeniami
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                Jak odczuwasz ból lub sztywność szyi/kręgosłupa w tej chwili? Skala VAS pozwoli zmierzyć obiektywną skuteczność dzisiejszej terapii.
              </p>
            </div>

            {/* VAS Slider */}
            <div className="w-full max-w-md bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700/60 space-y-4 text-left">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Ból i sztywność (skala VAS 0-10):
                  </span>
                  <span className={`text-xl font-black font-mono ${
                    preVas <= 3 ? 'text-emerald-500' : preVas <= 6 ? 'text-amber-500' : 'text-rose-500'
                  }`}>
                    {preVas} / 10
                  </span>
                </div>

                <input
                  id="pre-vas-slider"
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={preVas}
                  onChange={(e) => setPreVas(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />

                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>0 - Brak bólu</span>
                  <span>5 - Umiarkowany</span>
                  <span>10 - Bardzo silny</span>
                </div>
              </div>

              {/* Pre-session Stress Level */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-amber-500" />
                    Poziom stresu / napięcia (1-10):
                  </span>
                  <span className={`text-xs font-black font-mono px-2 py-0.5 rounded-md ${
                    preStress <= 3 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                      : preStress <= 6
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                  }`}>
                    {preStress} / 10 • {preStress <= 3 ? 'Niski' : preStress <= 6 ? 'Umiarkowany' : 'Podwyższony'}
                  </span>
                </div>

                <input
                  id="pre-stress-slider"
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={preStress}
                  onChange={(e) => setPreStress(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Pre-session Mood selection */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                  Nastrój przed sesją:
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {[
                    { id: 'calm', label: 'Spokojny', emoji: '😌' },
                    { id: 'neutral', label: 'Neutralny', emoji: '😐' },
                    { id: 'fatigued', label: 'Zmęczony', emoji: '🥱' },
                    { id: 'tense', label: 'Spięty', emoji: '😣' },
                    { id: 'relaxed', label: 'Zrelaksowany', emoji: '😊' },
                    { id: 'exhausted', label: 'Wyczerpany', emoji: '😫' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPreMood(m.id as PatientMood)}
                      className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl border text-[11px] font-medium transition-all ${
                        preMood === m.id
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-200 font-bold shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <span>{m.emoji}</span>
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pre-session Psychosomatic Note */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Notatka psychosomatyczna (opcjonalna):
                </label>
                <input
                  type="text"
                  value={preNote}
                  onChange={(e) => setPreNote(e.target.value)}
                  placeholder="np. trudny dzień w biurze, spięte barki, pośpiech..."
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="w-full max-w-md">
              {showHighPainWarning && preVas >= 8 ? (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-left space-y-3">
                  <div className="flex items-start gap-2.5 text-rose-800 dark:text-rose-200">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-wide">
                        Ostrzeżenie kliniczne: Ból {preVas}/10 VAS
                      </h4>
                      <p className="text-xs text-rose-700 dark:text-rose-300 mt-1 leading-relaxed">
                        Wysoki poziom bólu wskazuje na ostry stan zapalny lub ucisk korzeniowy. Dynamiczny trening może być w tej chwili ryzykowny.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setDifficultyLevel(1);
                        setShowHighPainWarning(false);
                        startWorkoutFromPreVas();
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      Przełącz na najłagodniejsze tempo (Poziom 1 • cykl 9s)
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowRedFlagsModal(true)}
                      className="w-full py-2 px-3 rounded-xl border border-rose-300 dark:border-rose-700 bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-300 font-bold text-xs hover:bg-rose-100 dark:hover:bg-rose-950 transition-colors cursor-pointer"
                    >
                      Sprawdź Czerwone Flagi (Kiedy na SOR?)
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowHighPainWarning(false);
                        startWorkoutFromPreVas();
                      }}
                      className="text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-center underline pt-1 cursor-pointer"
                    >
                      Mimo to kontynuuj sesję standardowo na własną odpowiedzialność
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  id="start-workout-confirm-btn"
                  type="button"
                  onClick={() => {
                    if (preVas >= 8) {
                      setShowHighPainWarning(true);
                    } else {
                      startWorkoutFromPreVas();
                    }
                  }}
                  className="w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-md hover:shadow-teal-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Rozpocznij bezpieczną sesję ({exercises.length} ćwiczenia)</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* STAGE 2: ACTIVE WORKOUT PLAYER */}
        {stage === 'workout' && currentExercise && (
          <div className="p-5 sm:p-6 space-y-4 flex-1 overflow-y-auto">
            {/* Header info for current exercise */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                  {currentExercise.region === 'cervical' ? 'Odcinek Szyjny' : 'Kręgosłup'} • {currentExercise.difficulty}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {currentExercise.polishName}
                </h3>
              </div>

              {/* Heart rate badge if available or live telemetry */}
              {(liveTelemetry?.heartRate || wearableHeartRate) && (
                <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 px-3 py-1 rounded-full text-rose-600 dark:text-rose-400 text-xs font-semibold">
                  <Heart className="w-3.5 h-3.5 fill-current animate-pulse text-rose-500" />
                  <span className="font-mono font-bold">{liveTelemetry?.heartRate || wearableHeartRate} BPM</span>
                  {liveTelemetry && (
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-0.5">
                      ({liveTelemetry.physiologicalLoadPercent}% obciążenia)
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* REAL-TIME DIFFICULTY & INTENSITY SLIDER */}
            <div
              id="session-difficulty-control"
              className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 space-y-2 shadow-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300">
                    <Gauge className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Poziom trudności:
                  </span>
                  <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                    difficultyLevel === 1 ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800' :
                    difficultyLevel === 2 ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-200 dark:border-teal-800' :
                    difficultyLevel === 3 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' :
                    difficultyLevel === 4 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800' :
                    'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  }`}>
                    {currentDifficulty.label} ({difficultyLevel}/5)
                  </span>
                </div>

                <div className="text-[11px] font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-md border border-teal-200 dark:border-teal-900">
                  Cykl animacji: {(currentDifficulty.cycleDurationMs / 1000).toFixed(1)}s
                </div>
              </div>

              <div className="flex items-center gap-3 pt-0.5">
                <span className="text-[11px] text-slate-400 font-medium shrink-0">Łagodny (9s)</span>
                <input
                  id="session-difficulty-slider"
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={difficultyLevel}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setDifficultyLevel(val);
                    soundService.playTick();
                  }}
                  className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
                <span className="text-[11px] text-slate-400 font-medium shrink-0">Intensywny (4s)</span>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                <span className={difficultyLevel === 1 ? 'font-bold text-sky-600 dark:text-sky-400' : ''}>1. Relaksacyjny</span>
                <span className={difficultyLevel === 2 ? 'font-bold text-teal-600 dark:text-teal-400' : ''}>2. Łagodny</span>
                <span className={difficultyLevel === 3 ? 'font-bold text-emerald-600 dark:text-emerald-400' : ''}>3. Standard</span>
                <span className={difficultyLevel === 4 ? 'font-bold text-amber-600 dark:text-amber-400' : ''}>4. Umiarkowany</span>
                <span className={difficultyLevel === 5 ? 'font-bold text-rose-600 dark:text-rose-400' : ''}>5. Dynamiczny</span>
              </div>
            </div>

            {/* REAL-TIME 100% SIMULATED WEARABLE SYNC & BIOMETRIC LOAD PANEL */}
            <WearableLiveSyncPanel
              onTelemetryUpdate={(data) => setLiveTelemetry(data)}
              difficultyLevel={difficultyLevel}
              isBreathingActive={showBreathingGuide}
              isPaused={isPaused}
            />

            {/* Media Mode Tabs: Biomechanical Animation vs Video HD */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveMediaTab('animator')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeMediaTab === 'animator'
                      ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Wektor Ruchu</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMediaTab('video')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeMediaTab === 'video'
                      ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Video className="w-3.5 h-3.5 text-rose-500" />
                  <span>Wideo HD</span>
                </button>
              </div>

              <span className="text-[11px] text-slate-400">Tempo bazowe: {currentExercise.tempo}</span>
            </div>

            {/* Video & Vector Animator Display */}
            {activeMediaTab === 'animator' ? (
              <BiomechanicalAnimator
                exercise={currentExercise}
                autoPlay={!isPaused}
                customCycleDurationMs={currentDifficulty.cycleDurationMs}
              />
            ) : (
              <div className="space-y-2">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-950 aspect-video flex flex-col items-center justify-center relative">
                  {currentExercise.videoEmbedUrl ? (
                    <iframe
                      src={currentExercise.videoEmbedUrl}
                      title={`Wideo: ${currentExercise.polishName}`}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="p-6 text-center text-white">
                      <p className="text-sm font-semibold">{currentExercise.videoInstructor || 'Instruktaż Kliniczny'}</p>
                      <a
                        href={currentExercise.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Otwórz wideo instruktażowe</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Real-time Video Pacing & Hold Guide based on Difficulty */}
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs border border-slate-200 dark:border-slate-700/60">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Sliders className="w-3.5 h-3.5 text-teal-600" />
                    <span>Dopasowane tempo wideo ({currentDifficulty.label}):</span>
                  </div>
                  <span className="font-bold text-teal-600 dark:text-teal-400 font-mono">
                    {(currentDifficulty.cycleDurationMs / 1000).toFixed(1)}s na pełne powtórzenie
                  </span>
                </div>
              </div>
            )}

            {/* Visual Breathing Guide with Animated Circle */}
            {showBreathingGuide && (
              <BreathingGuide
                initialPattern="physio_neck"
                compact={false}
                onCycleComplete={() => {
                  setHasUsedBreathing(true);
                }}
              />
            )}

            {/* Sets & Reps Counter */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 text-center">
                <span className="text-[11px] text-slate-500 font-medium">Seria</span>
                <div className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5">
                  {currentSet} / {currentExercise.defaultSets}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 text-center">
                <span className="text-[11px] text-slate-500 font-medium">Powtórzenie</span>
                <div className="text-lg font-black text-teal-600 dark:text-teal-400 font-mono mt-0.5">
                  {currentRep} / {currentExercise.defaultReps}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 text-center">
                <span className="text-[11px] text-slate-500 font-medium">Czas sesji</span>
                <div className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5">
                  {formatTime(sessionElapsedSeconds)}
                </div>
              </div>
            </div>

            {/* Action Bar for workout controls */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                id="add-rep-btn"
                type="button"
                onClick={() => {
                  if (currentRep < currentExercise.defaultReps) {
                    setCurrentRep(currentRep + 1);
                    soundService.playTick();
                  } else if (currentSet < currentExercise.defaultSets) {
                    setCurrentSet(currentSet + 1);
                    setCurrentRep(1);
                    soundService.playChime(500);
                  } else {
                    handleNextExerciseOrFinish();
                  }
                }}
                className="flex-1 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Zalicz powtórzenie ({currentRep}/{currentExercise.defaultReps})</span>
              </button>

              <button
                id="next-exercise-btn"
                type="button"
                onClick={handleNextExerciseOrFinish}
                className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1.5"
              >
                <span>{currentExIndex < exercises.length - 1 ? 'Następne' : 'Zakończ'}</span>
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 3: POST-VAS ASSESSMENT */}
        {stage === 'post_vas' && (
          <div className="p-6 sm:p-8 flex flex-col items-center text-center space-y-6 flex-1 justify-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="max-w-md">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Ocena skuteczności po sesji
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                Jak odczuwasz ból karku i kręgosłupa bezpośrednio po wykonaniu ćwiczeń?
              </p>
            </div>

            {/* VAS Comparison */}
            <div className="w-full max-w-md bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500">Skala VAS po ćwiczeniach:</span>
                <span className={`text-2xl font-black font-mono ${
                  postVas <= 3 ? 'text-emerald-500' : postVas <= 6 ? 'text-amber-500' : 'text-rose-500'
                }`}>
                  {postVas} / 10
                </span>
              </div>

              <input
                id="post-vas-slider"
                type="range"
                min="0"
                max="10"
                step="1"
                value={postVas}
                onChange={(e) => setPostVas(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <span className="text-slate-500">Przed: {preVas} VAS</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {preVas - postVas > 0 ? `Spadek bólu o ${preVas - postVas} pkt! 🎉` : preVas === postVas ? 'Ból stabilny' : 'Lekkie zaostrzenie'}
                </span>
                <span className="text-slate-500">Po: {postVas} VAS</span>
              </div>
            </div>

            {/* Wearable Biometric Session Summary */}
            {liveTelemetry && (
              <div className="w-full max-w-md bg-slate-900 text-white rounded-2xl p-4 border border-teal-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    Telemetria Sesji Wearable
                  </span>
                  <span className="text-[11px] text-teal-200">
                    {liveTelemetry.deviceName}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="bg-white/5 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Tętno</span>
                    <span className="text-base font-black font-mono text-rose-400">{liveTelemetry.heartRate} BPM</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Energia</span>
                    <span className="text-base font-black font-mono text-amber-300">{liveTelemetry.caloriesBurned} kcal</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">HRV</span>
                    <span className="text-base font-black font-mono text-emerald-400">{liveTelemetry.hrvMs} ms</span>
                  </div>
                </div>
              </div>
            )}

            <button
              id="finish-session-submit-btn"
              type="button"
              onClick={completeFullSession}
              className="w-full max-w-md py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Zapisz wyniki w historii medycznej</span>
            </button>
          </div>
        )}

        {/* STAGE 4: CELEBRATION */}
        {stage === 'celebration' && (
          <div className="p-8 flex flex-col items-center text-center space-y-4 flex-1 justify-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Sesja pomyślnie ukończona!
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-sm">
              Twój kręgosłup szyjny zyskał niezbędne odciążenie i dotlenienie. Dane zostały bezpiecznie zapisane na urządzeniu.
            </p>
          </div>
        )}
      </div>

      {showRedFlagsModal && (
        <EmergencyRedFlagsModal
          isOpen={showRedFlagsModal}
          onClose={() => setShowRedFlagsModal(false)}
          initialReason={`Zaostrzenie bólu karku przed sesją (VAS: ${preVas}/10)`}
        />
      )}

      {showFeedbackModal && (
        <ClinicalFeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          preselectedExercise={currentExercise}
        />
      )}
    </div>
  );
};
