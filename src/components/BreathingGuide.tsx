import React, { useState, useEffect, useRef } from 'react';
import { Wind, Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Minimize2, Check } from 'lucide-react';
import { soundService } from '../services/soundService';

export type BreathingPattern = 'physio_neck' | 'box' | 'relax_478';

interface PatternConfig {
  name: string;
  description: string;
  inhaleSec: number;
  holdInSec: number;
  exhaleSec: number;
  holdOutSec: number;
}

const PATTERNS: Record<BreathingPattern, PatternConfig> = {
  physio_neck: {
    name: 'Fizjo-Szyja (4-2-4)',
    description: 'Dekompresja krążków C1-C7 i rozluźnienie mm. czworobocznych',
    inhaleSec: 4,
    holdInSec: 2,
    exhaleSec: 4,
    holdOutSec: 1
  },
  box: {
    name: 'Box Breathing (4-4-4-4)',
    description: 'Równoważenie układu nerwowego i obniżenie napięcia mięśniowego',
    inhaleSec: 4,
    holdInSec: 4,
    exhaleSec: 4,
    holdOutSec: 4
  },
  relax_478: {
    name: 'Głęboki Relaks (4-7-8)',
    description: 'Stymulacja nerwu błędnego i wyciszenie układu współczulnego',
    inhaleSec: 4,
    holdInSec: 7,
    exhaleSec: 8,
    holdOutSec: 1
  }
};

type BreathingPhase = 'inhale' | 'hold_in' | 'exhale' | 'hold_out';

interface Props {
  initialPattern?: BreathingPattern;
  onCycleComplete?: (cycleCount: number) => void;
  compact?: boolean;
}

export const BreathingGuide: React.FC<Props> = ({
  initialPattern = 'physio_neck',
  onCycleComplete,
  compact = false
}) => {
  const [patternKey, setPatternKey] = useState<BreathingPattern>(initialPattern);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [phase, setPhase] = useState<BreathingPhase>('inhale');
  const [phaseTimeLeft, setPhaseTimeLeft] = useState<number>(PATTERNS[initialPattern].inhaleSec);
  const [completedCycles, setCompletedCycles] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const pattern = PATTERNS[patternKey];
  const timerRef = useRef<number | null>(null);

  // Switch phase logic
  useEffect(() => {
    if (!isActive) return;

    timerRef.current = window.setInterval(() => {
      setPhaseTimeLeft((prev) => {
        if (prev <= 1) {
          // Advance to next phase
          let nextPhase: BreathingPhase = 'inhale';
          let nextDuration = pattern.inhaleSec;

          if (phase === 'inhale') {
            if (pattern.holdInSec > 0) {
              nextPhase = 'hold_in';
              nextDuration = pattern.holdInSec;
            } else {
              nextPhase = 'exhale';
              nextDuration = pattern.exhaleSec;
            }
          } else if (phase === 'hold_in') {
            nextPhase = 'exhale';
            nextDuration = pattern.exhaleSec;
          } else if (phase === 'exhale') {
            if (pattern.holdOutSec > 0) {
              nextPhase = 'hold_out';
              nextDuration = pattern.holdOutSec;
            } else {
              nextPhase = 'inhale';
              nextDuration = pattern.inhaleSec;
              setCompletedCycles((c) => {
                const count = c + 1;
                onCycleComplete?.(count);
                return count;
              });
            }
          } else if (phase === 'hold_out') {
            nextPhase = 'inhale';
            nextDuration = pattern.inhaleSec;
            setCompletedCycles((c) => {
              const count = c + 1;
              onCycleComplete?.(count);
              return count;
            });
          }

          setPhase(nextPhase);

          if (soundEnabled) {
            if (nextPhase === 'inhale') soundService.playChime(440);
            else if (nextPhase === 'hold_in' || nextPhase === 'hold_out') soundService.playTick();
            else if (nextPhase === 'exhale') soundService.playChime(360);
          }

          return nextDuration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, phase, patternKey, pattern, soundEnabled, onCycleComplete]);

  // Phase metadata
  const getPhaseDetails = () => {
    switch (phase) {
      case 'inhale':
        return {
          title: 'WDECH',
          subtitle: 'Powolny wdech przez nos • Rozszerz dolne żebra',
          color: 'text-teal-600 dark:text-teal-400',
          ringColor: 'stroke-teal-500',
          bgGradient: 'from-teal-500/20 to-emerald-500/10',
          scaleClass: 'scale-110 sm:scale-125'
        };
      case 'hold_in':
        return {
          title: 'ZATRZYMAJ',
          subtitle: 'Utrzymaj neutralną szyję • Barki luźno w dole',
          color: 'text-sky-600 dark:text-sky-400',
          ringColor: 'stroke-sky-500',
          bgGradient: 'from-sky-500/25 to-teal-500/15',
          scaleClass: 'scale-110 sm:scale-125'
        };
      case 'exhale':
        return {
          title: 'WYDECH',
          subtitle: 'Spokojny wydech ustami • Uwolnij napięcie z karku',
          color: 'text-indigo-600 dark:text-indigo-400',
          ringColor: 'stroke-indigo-500',
          bgGradient: 'from-indigo-500/20 to-purple-500/10',
          scaleClass: 'scale-75 sm:scale-80'
        };
      case 'hold_out':
        return {
          title: 'PAUZA',
          subtitle: 'Spokojna chwila odpoczynku przed kolejnym wdechem',
          color: 'text-slate-600 dark:text-slate-400',
          ringColor: 'stroke-slate-400',
          bgGradient: 'from-slate-400/15 to-slate-500/5',
          scaleClass: 'scale-75 sm:scale-80'
        };
    }
  };

  const details = getPhaseDetails();

  // Calculate phase total seconds for progress ring
  const totalPhaseSec =
    phase === 'inhale'
      ? pattern.inhaleSec
      : phase === 'hold_in'
      ? pattern.holdInSec
      : phase === 'exhale'
      ? pattern.exhaleSec
      : pattern.holdOutSec;

  const progressFraction = Math.max(0, Math.min(1, (totalPhaseSec - phaseTimeLeft + 1) / totalPhaseSec));
  const strokeDashoffset = 283 - 283 * progressFraction;

  return (
    <div
      id="visual-breathing-guide"
      className={`rounded-2xl border border-teal-200/80 dark:border-teal-900/60 bg-gradient-to-b from-teal-50/70 to-white dark:from-slate-900/90 dark:to-slate-950 p-4 transition-all duration-300 ${
        isExpanded ? 'p-6 shadow-xl ring-2 ring-teal-500/30' : ''
      }`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300">
            <Wind className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              Przewodnik Oddechowy Szyi
              <span className="text-[10px] font-normal text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-950/80 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                {completedCycles} {completedCycles === 1 ? 'cykl' : completedCycles < 5 ? 'cykle' : 'cykli'}
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Synchronizacja oddechu torem przeponowym odciąża stawy C5-C7
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Audio Chime Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              soundEnabled
                ? 'bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300'
                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={soundEnabled ? 'Dźwięki faz włączone' : 'Włącz dźwięki oddechu'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Play/Pause */}
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isActive ? 'Zatrzymaj przewodnik' : 'Uruchom oddech'}
          >
            {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>

          {/* Expand / Minimize */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isExpanded ? 'Zmniejsz' : 'Powiększ przewodnik'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Pattern Selector Pills */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        {(Object.keys(PATTERNS) as BreathingPattern[]).map((key) => {
          const isSelected = patternKey === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                setPatternKey(key);
                setPhase('inhale');
                setPhaseTimeLeft(PATTERNS[key].inhaleSec);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                isSelected
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {PATTERNS[key].name}
            </button>
          );
        })}
      </div>

      {/* Central Animated Breathing Circle */}
      <div className="flex flex-col items-center justify-center py-3 sm:py-4">
        <div className="relative flex items-center justify-center w-40 h-40 sm:w-48 sm:h-48">
          {/* Subtle Outer Pulsing Wave */}
          <div
            className={`absolute inset-2 rounded-full bg-gradient-to-tr ${details.bgGradient} blur-xl transition-all duration-1000 ${
              isActive ? details.scaleClass : 'scale-90 opacity-40'
            }`}
          />

          {/* SVG Progress Ring */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r="45"
              className="stroke-slate-200/80 dark:stroke-slate-800"
              strokeWidth="4"
              fill="transparent"
            />
            {/* Active Progress Circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              className={`${details.ringColor} transition-all duration-500`}
              strokeWidth="5"
              strokeDasharray="283"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Expanding / Contracting Inner Circle */}
          <div
            className={`absolute w-28 h-28 sm:w-32 sm:h-32 rounded-full border border-teal-300/50 dark:border-teal-700/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs flex flex-col items-center justify-center shadow-lg transition-transform ease-in-out duration-1000 ${
              isActive ? details.scaleClass : 'scale-90'
            }`}
          >
            <span className={`text-xs font-black tracking-widest uppercase ${details.color}`}>
              {details.title}
            </span>
            <span className="text-3xl sm:text-4xl font-black font-mono text-slate-900 dark:text-white mt-0.5">
              {phaseTimeLeft}s
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {phase === 'inhale' ? 'Wdech' : phase === 'exhale' ? 'Wydech' : 'Pauza'}
            </span>
          </div>
        </div>

        {/* Phase Action Instruction Text */}
        <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-3 text-center max-w-xs leading-relaxed">
          {details.subtitle}
        </p>
      </div>
    </div>
  );
};
