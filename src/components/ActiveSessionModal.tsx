import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, Play, Pause, SkipForward, RotateCcw, Volume2, VolumeX, 
  Heart, Sparkles, CheckCircle2, ChevronRight, AlertCircle, Wind, Video, ExternalLink, Target
} from 'lucide-react';
import { Exercise, TrainingDay } from '../types';
import { soundService } from '../services/soundService';
import { speechService } from '../services/speechService';
import { BiomechanicalAnimator } from './BiomechanicalAnimator';
import { BreathingGuide } from './BreathingGuide';

interface Props {
  exercises: Exercise[];
  dayIndex?: number;
  onComplete: (stats: { preVas: number; postVas: number; durationMinutes: number; completedCount: number; usedBreathingGuide: boolean }) => void;
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

  // Workout state
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
        usedBreathingGuide: hasUsedBreathing
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
            <div className="w-full max-w-md bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500">Skala VAS (0-10):</span>
                <span className={`text-2xl font-black font-mono ${
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
                className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />

              <div className="flex justify-between text-[11px] text-slate-400 mt-2">
                <span>0 - Brak bólu</span>
                <span>5 - Umiarkowany</span>
                <span>10 - Bardzo silny</span>
              </div>
            </div>

            <div className="w-full max-w-md">
              <button
                id="start-workout-confirm-btn"
                type="button"
                onClick={startWorkoutFromPreVas}
                className="w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-md hover:shadow-teal-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Rozpocznij bezpieczną sesję ({exercises.length} ćwiczenia)</span>
              </button>
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

              {/* Heart rate badge if available */}
              {wearableHeartRate && (
                <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 px-3 py-1 rounded-full text-rose-600 dark:text-rose-400 text-xs font-semibold">
                  <Heart className="w-3.5 h-3.5 fill-current animate-pulse" />
                  <span>{wearableHeartRate} BPM</span>
                </div>
              )}
            </div>

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

              <span className="text-[11px] text-slate-400">Tempo: {currentExercise.tempo}</span>
            </div>

            {/* Video & Vector Animator Display */}
            {activeMediaTab === 'animator' ? (
              <BiomechanicalAnimator
                exercise={currentExercise}
                autoPlay={!isPaused}
              />
            ) : (
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
    </div>
  );
};
