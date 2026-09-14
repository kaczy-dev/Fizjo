import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, Play, Pause, RotateCcw, CheckCircle2, X, 
  Sparkles, ShieldCheck, Volume2, VolumeX, ArrowRight, Zap 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCompleteMicroBreak: () => void;
  exerciseName?: string;
}

export const SmartMicroBreakModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onCompleteMicroBreak,
  exerciseName = 'Retrakcja Szyjna (Chin Tuck) & Pozycja Brüggera'
}) => {
  const TOTAL_SECONDS = 30;
  const [timeLeft, setTimeLeft] = useState<number>(TOTAL_SECONDS);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Play gentle web audio chime on start/finish
  const playTone = (freq: number, durationMs: number = 200) => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + durationMs / 1000);
    } catch {
      // Audio context fallback
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(TOTAL_SECONDS);
      setIsActive(true);
      setIsCompleted(false);
      playTone(587, 180); // D5 chime
    } else {
      setIsActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            setIsCompleted(true);
            playTone(880, 450); // A5 finish tone
            onCompleteMicroBreak();
            return 0;
          }
          if (prev % 6 === 0) {
            playTone(440, 100); // Metronome cue for chin tuck cycle
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  if (!isOpen) return null;

  const currentCycle = Math.ceil((TOTAL_SECONDS - timeLeft) / 6);
  const progressPercent = ((TOTAL_SECONDS - timeLeft) / TOTAL_SECONDS) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden"
      >
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 flex items-center justify-center shadow-xs">
              <Zap className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-[10px] font-black uppercase tracking-wider">
                <span>Inteligentna Mikro-Przerwa PWA</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                30-Sekundowy Reset Karku
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={soundEnabled ? 'Wycisz dźwięk' : 'Włącz dźwięk'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        {!isCompleted ? (
          <div className="py-6 space-y-6 text-center">
            {/* Countdown Circular Display */}
            <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
              {/* Outer track */}
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  className="stroke-slate-100 dark:stroke-slate-800 fill-none"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  className="stroke-teal-600 dark:stroke-teal-400 fill-none transition-all duration-300"
                  strokeWidth="8"
                  strokeDasharray="276.46"
                  strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
                  strokeLinecap="round"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black font-mono text-slate-900 dark:text-white">
                  {timeLeft}s
                </span>
                <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400">
                  Cykl {Math.min(currentCycle, 5)} / 5
                </span>
              </div>
            </div>

            {/* Instruction Banner */}
            <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-left space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-950 dark:text-teal-200">
                <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Instruktaż 30-sekundowego odciążenia kręgów C5-C7:</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                1. <strong>Wzrok w horyzont:</strong> Cofnij brodę w stronę szyi (ruch &quot;podwójnego podbródka&quot;) bez pochylania głowy.<br />
                2. <strong>Otwórz klatkę piersiową:</strong> Obróć dłonie kciukami na zewnątrz.<br />
                3. <strong>Oddech:</strong> Utrzymaj 3-4 sekundy, rozluźnij na 2 sekundy i powtórz w rytmie zegara.
              </p>
            </div>

            {/* Play/Pause controls */}
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isActive ? 'Zatrzymaj' : 'Wznów'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTimeLeft(TOTAL_SECONDS);
                  setIsActive(true);
                }}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
                title="Zresetuj czas"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Completion State */
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="text-xl font-black text-slate-900 dark:text-white">
                Świetna robota! Kark odciążony ✓
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                30 sekund retrakcji obniżyło kompresję krążków C5-C7 i zresetowało nawyk protrakcji. Zdobyto punkty do wyzwania &quot;Pogromca Tech-Neck&quot;!
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-4 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer inline-flex items-center gap-2"
            >
              <span>Wróć do aplikacji</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
