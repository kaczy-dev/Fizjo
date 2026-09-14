import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Activity, ShieldCheck, Gauge } from 'lucide-react';
import { Exercise } from '../types';
import { soundService } from '../services/soundService';

interface Props {
  exercise: Exercise;
  autoPlay?: boolean;
  onPhaseChange?: (phase: 'prepare' | 'move' | 'hold' | 'return') => void;
  customCycleDurationMs?: number;
}

export const BiomechanicalAnimator: React.FC<Props> = ({ 
  exercise, 
  autoPlay = true, 
  onPhaseChange,
  customCycleDurationMs = 6000
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [progress, setProgress] = useState<number>(0); // 0 to 1
  const [currentPhase, setCurrentPhase] = useState<'prepare' | 'move' | 'hold' | 'return'>('prepare');
  const [breathState, setBreathState] = useState<'Wdech' | 'Wydech' | 'Utrzymaj'>('Wdech');

  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const cycleDuration = (customCycleDurationMs / playbackSpeed); // dynamic cycle per rep adjusted by difficulty

  useEffect(() => {
    let lastPhase = currentPhase;

    const animate = () => {
      if (!isPlaying) return;

      const elapsed = (Date.now() - startTimeRef.current) % cycleDuration;
      const prog = elapsed / cycleDuration;
      setProgress(prog);

      // Phase breakdown:
      // 0.0 - 0.20 : Prepare / Setup (Wdech)
      // 0.20 - 0.50 : Active Movement (Wydech)
      // 0.50 - 0.80 : Isometric Hold (Utrzymaj oddech / spokojny oddech)
      // 0.80 - 1.00 : Return to neutral (Wdech)
      let phase: 'prepare' | 'move' | 'hold' | 'return' = 'prepare';
      let breath: 'Wdech' | 'Wydech' | 'Utrzymaj' = 'Wdech';

      if (prog < 0.2) {
        phase = 'prepare';
        breath = 'Wdech';
      } else if (prog < 0.5) {
        phase = 'move';
        breath = 'Wydech';
      } else if (prog < 0.8) {
        phase = 'hold';
        breath = 'Utrzymaj';
      } else {
        phase = 'return';
        breath = 'Wdech';
      }

      if (phase !== lastPhase) {
        lastPhase = phase;
        setCurrentPhase(phase);
        setBreathState(breath);
        onPhaseChange?.(phase);
        if (phase === 'hold') {
          soundService.playTick();
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    if (isPlaying) {
      startTimeRef.current = Date.now() - progress * cycleDuration;
      animationFrameRef.current = requestAnimationFrame(animate);
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, playbackSpeed, cycleDuration, onPhaseChange, progress, currentPhase]);

  const togglePlay = () => {
    if (!isPlaying) {
      startTimeRef.current = Date.now() - progress * cycleDuration;
    }
    setIsPlaying(!isPlaying);
  };

  const resetAnim = () => {
    setProgress(0);
    startTimeRef.current = Date.now();
    setCurrentPhase('prepare');
  };

  // Dynamic values calculated for SVG render based on progress
  // Chin tuck: Head shifts backwards in X by -18px, chin moves back, cervical spine flattens
  let headX = 0;
  let headY = 0;
  let headAngle = 0;
  let shoulderY = 0;
  let spineCurvature = 0;
  let muscleGlowOpacity = 0.2;

  const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

  if (exercise.animationType === 'chin_tuck') {
    if (progress >= 0.2 && progress < 0.5) {
      const p = (progress - 0.2) / 0.3;
      headX = -18 * easeInOut(p);
      muscleGlowOpacity = 0.3 + p * 0.6;
    } else if (progress >= 0.5 && progress < 0.8) {
      headX = -18;
      muscleGlowOpacity = 0.9;
    } else if (progress >= 0.8) {
      const p = (progress - 0.8) / 0.2;
      headX = -18 * (1 - easeInOut(p));
      muscleGlowOpacity = 0.9 * (1 - p);
    }
  } else if (exercise.animationType === 'neck_rotation') {
    if (progress >= 0.2 && progress < 0.5) {
      const p = (progress - 0.2) / 0.3;
      headAngle = 55 * easeInOut(p);
      headX = Math.sin((headAngle * Math.PI) / 180) * 8;
      muscleGlowOpacity = 0.4 + p * 0.5;
    } else if (progress >= 0.5 && progress < 0.8) {
      headAngle = 55;
      headX = 6.5;
      muscleGlowOpacity = 0.9;
    } else if (progress >= 0.8) {
      const p = (progress - 0.8) / 0.2;
      headAngle = 55 * (1 - easeInOut(p));
      headX = 6.5 * (1 - p);
      muscleGlowOpacity = 0.9 * (1 - p);
    }
  } else if (exercise.animationType === 'trapezius_stretch') {
    if (progress >= 0.2 && progress < 0.5) {
      const p = (progress - 0.2) / 0.3;
      headAngle = -35 * easeInOut(p);
      muscleGlowOpacity = 0.4 + p * 0.5;
    } else if (progress >= 0.5 && progress < 0.8) {
      headAngle = -35;
      muscleGlowOpacity = 0.95;
    } else if (progress >= 0.8) {
      const p = (progress - 0.8) / 0.2;
      headAngle = -35 * (1 - easeInOut(p));
      muscleGlowOpacity = 0.95 * (1 - p);
    }
  } else if (exercise.animationType === 'brugger_relief') {
    if (progress >= 0.2 && progress < 0.5) {
      const p = (progress - 0.2) / 0.3;
      shoulderY = -6 * easeInOut(p);
      headX = -10 * easeInOut(p);
      spineCurvature = 8 * easeInOut(p);
      muscleGlowOpacity = 0.8 * p;
    } else if (progress >= 0.5 && progress < 0.8) {
      shoulderY = -6;
      headX = -10;
      spineCurvature = 8;
      muscleGlowOpacity = 0.85;
    } else if (progress >= 0.8) {
      const p = (progress - 0.8) / 0.2;
      shoulderY = -6 * (1 - easeInOut(p));
      headX = -10 * (1 - easeInOut(p));
      spineCurvature = 8 * (1 - p);
      muscleGlowOpacity = 0.85 * (1 - p);
    }
  } else {
    // Default gentle cycle
    if (progress >= 0.2 && progress < 0.5) {
      const p = (progress - 0.2) / 0.3;
      headX = -10 * easeInOut(p);
      muscleGlowOpacity = 0.7 * p;
    } else if (progress >= 0.5 && progress < 0.8) {
      headX = -10;
      muscleGlowOpacity = 0.8;
    } else if (progress >= 0.8) {
      const p = (progress - 0.8) / 0.2;
      headX = -10 * (1 - easeInOut(p));
      muscleGlowOpacity = 0.8 * (1 - p);
    }
  }

  return (
    <div id={`animator-${exercise.id}`} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white flex flex-col items-center select-none shadow-xl">
      {/* Top Status Badges */}
      <div className="w-full flex items-center justify-between text-xs mb-2">
        <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-full text-emerald-400 font-medium border border-slate-700">
          <Activity className="w-3.5 h-3.5" />
          <span>Faza: {currentPhase === 'prepare' ? 'Przygotowanie' : currentPhase === 'move' ? 'Płynny ruch' : currentPhase === 'hold' ? 'Utrzymaj pozycję' : 'Spokojny powrót'}</span>
        </div>

        <div className="flex items-center gap-1.5 bg-sky-950/80 px-2.5 py-1 rounded-full text-sky-300 font-medium border border-sky-800/50">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          <span>Oddech: {breathState}</span>
        </div>

        <div className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-full text-amber-400 font-mono text-[11px] border border-slate-700">
          <Gauge className="w-3 h-3" />
          <span>Tempo: {exercise.tempo}</span>
        </div>
      </div>

      {/* Interactive Biomechanical Canvas Container */}
      <div className="relative w-full aspect-[4/3] max-h-[280px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800/80">
        {/* Background Anatomical Grid Lines */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Biomechanical SVG Illustration */}
        <svg viewBox="0 0 320 240" className="w-full h-full max-w-[340px]">
          <defs>
            <linearGradient id="muscleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity={muscleGlowOpacity} />
              <stop offset="100%" stopColor="#fb7185" stopOpacity={muscleGlowOpacity * 0.4} />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Reference Axis Lines */}
          <line x1="160" y1="20" x2="160" y2="220" stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />
          <line x1="50" y1="180" x2="270" y2="180" stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />

          {/* Torso & Shoulder Base (Siedząca postawa ergonomiczna) */}
          <g transform={`translate(0, ${shoulderY})`}>
            {/* Thoracic and Lumbar spine column */}
            <path
              d={`M 160 140 Q ${162 + spineCurvature} 175, 160 215`}
              stroke="#64748b"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
            {/* Vertebral segments Th1-Th12 representation */}
            {[148, 162, 176, 190, 204].map((yVal, i) => (
              <circle key={i} cx={160 + (i === 2 ? spineCurvature * 0.5 : 0)} cy={yVal} r="3.5" fill="#94a3b8" />
            ))}

            {/* Shoulders / Clavicle line */}
            <path d="M 115 142 Q 160 136 205 142" stroke="#475569" strokeWidth="8" strokeLinecap="round" fill="none" />
            <circle cx="115" cy="142" r="6" fill="#3b82f6" />
            <circle cx="205" cy="142" r="6" fill="#3b82f6" />

            {/* Trapezius Muscle Tension Field (Target Muscle highlight) */}
            <polygon
              points={`160,110 120,${140 + shoulderY} 200,${140 + shoulderY}`}
              fill="url(#muscleGradient)"
              filter="url(#glow)"
            />
          </g>

          {/* Dynamic Head & Cervical Segment (C1-C7) */}
          <g
            transform={`translate(${160 + headX}, ${105 + headY}) rotate(${headAngle}) translate(-160, -105)`}
            className="transition-transform duration-75"
          >
            {/* Cervical Spine Curve (C1-C7) */}
            <path
              d="M 160 102 Q 157 120, 160 138"
              stroke="#38bdf8"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
              filter="url(#glow)"
            />

            {/* Vertebral disc nodes C1, C3, C5, C7 */}
            <circle cx="160" cy="108" r="3" fill="#38bdf8" />
            <circle cx="158" cy="118" r="3" fill="#38bdf8" />
            <circle cx="159" cy="128" r="3" fill="#38bdf8" />
            <circle cx="160" cy="136" r="3.5" fill="#0284c7" />

            {/* Deep Neck Flexors (m. longus colli) indicator */}
            {exercise.animationType === 'chin_tuck' && (
              <path d="M 152 110 L 153 130" stroke="#f43f5e" strokeWidth="3.5" strokeLinecap="round" opacity={muscleGlowOpacity} />
            )}

            {/* Suboccipital muscles (mm. podpotyliczne) indicator */}
            {exercise.animationType === 'suboccipital_release' && (
              <circle cx="166" cy="102" r="5" fill="#f43f5e" filter="url(#glow)" opacity={muscleGlowOpacity} />
            )}

            {/* Cranium / Head Silhouette */}
            {/* Head circle */}
            <circle cx="160" cy="72" r="28" fill="#1e293b" stroke="#38bdf8" strokeWidth="2.5" />
            
            {/* Face profile outline */}
            <path
              d="M 148 55 Q 138 72, 142 82 Q 148 94, 160 98"
              stroke="#38bdf8"
              strokeWidth="2"
              fill="none"
            />
            {/* Chin node */}
            <circle cx="146" cy="92" r="3" fill="#fb7185" />
            {/* Eye level marker */}
            <circle cx="144" cy="70" r="2" fill="#94a3b8" />
            {/* Ear reference point */}
            <ellipse cx="162" cy="75" rx="3" ry="5" fill="#475569" />

            {/* Biomechanical vector arrow on chin tuck */}
            {exercise.animationType === 'chin_tuck' && (
              <g transform="translate(138, 92)" opacity={currentPhase === 'move' || currentPhase === 'hold' ? 1 : 0.4}>
                <line x1="0" y1="0" x2="16" y2="0" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                <polygon points="18,0 12,-4 12,4" fill="#10b981" />
              </g>
            )}

            {/* Rotation arc guide */}
            {exercise.animationType === 'neck_rotation' && (
              <path
                d="M 130 50 A 35 35 0 0 1 190 50"
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            )}
          </g>

          {/* Goniometer Angle / Biomechanical metric overlay */}
          <g transform="translate(20, 30)">
            <rect width="90" height="38" rx="6" fill="#0f172a" fillOpacity="0.9" stroke="#334155" strokeWidth="1" />
            <text x="8" y="16" fill="#94a3b8" fontSize="9" fontFamily="monospace">KĄT / PRZESUNIĘCIE</text>
            <text x="8" y="31" fill="#38bdf8" fontSize="13" fontWeight="bold" fontFamily="monospace">
              {exercise.animationType === 'neck_rotation' || exercise.animationType === 'trapezius_stretch'
                ? `${Math.abs(Math.round(headAngle))}°`
                : `${Math.abs(Math.round(headX * 1.5))} mm`}
            </text>
          </g>

          {/* Safety posture verification mark */}
          <g transform="translate(225, 25)">
            <rect width="82" height="26" rx="6" fill="#064e3b" fillOpacity="0.75" stroke="#059669" strokeWidth="1" />
            <text x="8" y="17" fill="#6ee7b7" fontSize="10" fontWeight="bold">BEZPIECZNIE</text>
          </g>
        </svg>

        {/* Breath Bubble Metronome in Bottom Right */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
          <div
            className="w-3.5 h-3.5 rounded-full transition-all duration-700"
            style={{
              transform: `scale(${breathState === 'Wdech' ? 1.4 : breathState === 'Wydech' ? 0.7 : 1.1})`,
              backgroundColor: breathState === 'Wdech' ? '#38bdf8' : breathState === 'Wydech' ? '#34d399' : '#fbbf24'
            }}
          />
          <span className="font-medium text-slate-300">{breathState}</span>
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-75"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Playback Controls Bar */}
      <div className="w-full flex items-center justify-between mt-3 px-1">
        <div className="flex items-center gap-2">
          <button
            id={`play-pause-btn-${exercise.id}`}
            type="button"
            onClick={togglePlay}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pauza' : 'Odtwórz'}</span>
          </button>

          <button
            id={`reset-anim-btn-${exercise.id}`}
            type="button"
            onClick={resetAnim}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title="Resetuj animację"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700 text-[11px]">
          {[0.5, 1.0, 1.5].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setPlaybackSpeed(s)}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                playbackSpeed === s ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>NFZ Standard</span>
        </div>
      </div>
    </div>
  );
};
