import React, { useState, useEffect, useRef } from 'react';
import { 
  Wind, X, Play, Pause, RotateCw, Volume2, VolumeX, 
  CheckCircle2, Sparkles, HeartPulse, ShieldAlert, ArrowDown, Info
} from 'lucide-react';
import { soundService } from '../services/soundService';
import { speechService } from '../services/speechService';

interface Props {
  onClose: () => void;
  onCompleteSession?: (stats: { cyclesCompleted: number; durationSeconds: number }) => void;
}

type BreathingProtocol = '4-7-8' | 'box';

interface PhaseConfig {
  name: string;
  polishName: string;
  duration: number;
  instruction: string;
  soundPitch: number;
}

export const DiaphragmaticBreathingModal: React.FC<Props> = ({ onClose, onCompleteSession }) => {
  const [protocol, setProtocol] = useState<BreathingProtocol>('4-7-8');
  const [isActive, setIsActive] = useState<boolean>(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState<number>(0);
  const [secondsInPhase, setSecondsInPhase] = useState<number>(0);
  const [completedCycles, setCompletedCycles] = useState<number>(0);
  const [targetCycles, setTargetCycles] = useState<number>(4);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [totalSecondsElapsed, setTotalSecondsElapsed] = useState<number>(0);
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);

  const phases478: PhaseConfig[] = [
    {
      name: 'inhale',
      polishName: 'WDECH (Nos)',
      duration: 4,
      instruction: 'Wdychaj powoli przez nos. Rozszerzaj dolne żebra, nie unoś barków!',
      soundPitch: 520
    },
    {
      name: 'hold',
      polishName: 'ZATRZYMANIE',
      duration: 7,
      instruction: 'Zatrzymaj powietrze. Całkowicie rozluźnij kark, żuchwę i ramiona.',
      soundPitch: 440
    },
    {
      name: 'exhale',
      polishName: 'DŁUGI WYDECH (Usta)',
      duration: 8,
      instruction: 'Wydychaj powoli przez usta z cichym szumem. Poczuj opadanie żeber i dekompresję szyi.',
      soundPitch: 330
    }
  ];

  const phasesBox: PhaseConfig[] = [
    {
      name: 'inhale',
      polishName: 'WDECH',
      duration: 4,
      instruction: 'Wdech nosem do dolnych partii płuc. Rozszerz brzuch i żebra.',
      soundPitch: 480
    },
    {
      name: 'hold_in',
      polishName: 'ZATRZYMANIE',
      duration: 4,
      instruction: 'Zatrzymaj oddech w bezruchu. Barki opuszczone i miękkie.',
      soundPitch: 440
    },
    {
      name: 'exhale',
      polishName: 'WYDECH',
      duration: 4,
      instruction: 'Płynny, kontrolowany wydech nosem lub ustami.',
      soundPitch: 360
    },
    {
      name: 'hold_out',
      polishName: 'PAUZA',
      duration: 4,
      instruction: 'Zatrzymaj pustkę w płucach przed kolejnym wdechem.',
      soundPitch: 300
    }
  ];

  const activePhases = protocol === '4-7-8' ? phases478 : phasesBox;
  const currentPhase = activePhases[currentPhaseIndex];

  // Timer loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && !sessionCompleted) {
      interval = setInterval(() => {
        setTotalSecondsElapsed((prev) => prev + 1);
        setSecondsInPhase((prev) => {
          const nextVal = prev + 1;
          if (nextVal >= currentPhase.duration) {
            // Phase transition
            const nextPhaseIndex = (currentPhaseIndex + 1) % activePhases.length;
            if (nextPhaseIndex === 0) {
              // Full cycle completed
              const newCycleCount = completedCycles + 1;
              setCompletedCycles(newCycleCount);
              if (newCycleCount >= targetCycles) {
                setIsActive(false);
                setSessionCompleted(true);
                if (soundEnabled) soundService.playChime(660);
                if (voiceEnabled) speechService.speak('Trening oddechowy zakończony. Twoje mięśnie szyi są rozluźnione.');
                if (onCompleteSession) {
                  onCompleteSession({
                    cyclesCompleted: newCycleCount,
                    durationSeconds: totalSecondsElapsed + 1
                  });
                }
                return 0;
              }
            }

            const nextPhase = activePhases[nextPhaseIndex];
            setCurrentPhaseIndex(nextPhaseIndex);

            if (soundEnabled) {
              soundService.playChime(nextPhase.soundPitch);
            }
            if (voiceEnabled) {
              speechService.speak(nextPhase.polishName);
            }

            return 0;
          }
          return nextVal;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, currentPhaseIndex, secondsInPhase, activePhases, completedCycles, targetCycles, soundEnabled, voiceEnabled, sessionCompleted]);

  const handleStart = () => {
    setIsActive(true);
    setSessionCompleted(false);
    if (soundEnabled) soundService.playChime(currentPhase.soundPitch);
    if (voiceEnabled) speechService.speak(`${currentPhase.polishName}. ${currentPhase.instruction}`);
  };

  const handleReset = () => {
    setIsActive(false);
    setCurrentPhaseIndex(0);
    setSecondsInPhase(0);
    setCompletedCycles(0);
    setSessionCompleted(false);
  };

  // Calculate visual breath animation progress (0 to 1)
  const phaseProgress = secondsInPhase / currentPhase.duration;
  let scale = 1;
  if (currentPhase.name === 'inhale') {
    scale = 1 + phaseProgress * 0.45;
  } else if (currentPhase.name.startsWith('hold')) {
    scale = 1.45;
  } else if (currentPhase.name === 'exhale') {
    scale = 1.45 - phaseProgress * 0.45;
  } else {
    scale = 1;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-600/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Trening Oddechu Przeponowego</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold">
                  Nerw Błędny (C3-C5)
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Dekompresja mięśni pochyłych i górnego czworobocznego
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Protocol Selector */}
        {!isActive && !sessionCompleted && (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setProtocol('4-7-8');
                handleReset();
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                protocol === '4-7-8'
                  ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="text-xs font-bold flex items-center gap-1.5">
                <span>Protokół 4-7-8</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-200 dark:bg-teal-900 text-teal-800 dark:text-teal-200 font-bold">
                  Głęboki Relaks
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Wdech 4s • Pauza 7s • Wydech 8s (Reset układu nerwowego)
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setProtocol('box');
                handleReset();
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                protocol === 'box'
                  ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="text-xs font-bold flex items-center gap-1.5">
                <span>Box Breathing</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-200 dark:bg-teal-900 text-teal-800 dark:text-teal-200 font-bold">
                  Balans Biurowy
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Wdech 4s • Pauza 4s • Wydech 4s • Pauza 4s
              </p>
            </button>
          </div>
        )}

        {/* Central Visual Breathing Ring */}
        <div className="relative flex flex-col items-center justify-center py-8">
          {/* Animated pulsing orb */}
          <div 
            className="w-48 h-48 sm:w-56 sm:h-56 rounded-full border-4 border-teal-500/30 dark:border-teal-400/20 flex items-center justify-center transition-transform duration-1000 ease-in-out relative shadow-inner"
            style={{
              transform: `scale(${scale})`,
              background: `radial-gradient(circle, rgba(13,148,136,0.18) 0%, rgba(13,148,136,0.02) 70%)`
            }}
          >
            {/* Core glowing indicator */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex flex-col items-center justify-center shadow-lg shadow-teal-500/30">
              <span className="text-xs uppercase font-bold tracking-wider opacity-90">
                {currentPhase.name === 'inhale' ? 'Wdech' : currentPhase.name.startsWith('hold') ? 'Trzymaj' : 'Wydech'}
              </span>
              <span className="text-3xl font-black font-mono">
                {currentPhase.duration - secondsInPhase}s
              </span>
            </div>
          </div>

          {/* Clinical Instruction below orb */}
          <div className="mt-6 text-center max-w-sm">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {currentPhase.polishName}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              {currentPhase.instruction}
            </p>
          </div>
        </div>

        {/* Progress & Stats Bar */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-rose-500" />
            <span className="text-slate-600 dark:text-slate-400 font-medium">
              Cykle: <strong className="text-slate-900 dark:text-white font-mono">{completedCycles} / {targetCycles}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              title={soundEnabled ? 'Wycisz dźwięki faz' : 'Włącz dźwięki faz'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-teal-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>
            <span className="font-mono text-slate-500">
              {Math.floor(totalSecondsElapsed / 60)}:{(totalSecondsElapsed % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 pt-2">
          {sessionCompleted ? (
            <div className="w-full space-y-3">
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Sesja oddechowa ukończona! Napięcie w karku i mięśniach pochyłych zostało zredukowane.</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Wróć do Aplikacji
              </button>
            </div>
          ) : isActive ? (
            <>
              <button
                type="button"
                onClick={() => setIsActive(false)}
                className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Pause className="w-4 h-4" />
                <span>Zatrzymaj Sesję</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCw className="w-4 h-4" />
                <span>Od nowa</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleStart}
              className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>Rozpocznij Trening Oddechowy</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
