import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Repeat,
  Gauge,
  Compass,
  Wind,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  Camera,
  ExternalLink,
  SkipBack,
  SkipForward,
  Maximize2,
  Minimize2,
  ShieldCheck,
  Video
} from 'lucide-react';
import { Exercise, VideoHudCategory, VideoPhaseCue } from '../types';
import { getExerciseVideoInstruction } from '../data/videoInstructions';
import { soundService } from '../services/soundService';

export type PlaybackSpeedOption = 0.25 | 0.5 | 0.75 | 1.0;
export type LoopMode = 'full_loop' | 'phase_ab' | 'once';
export type CameraAngle = 'sagittal' | 'coronal' | 'split';

interface Props {
  exercise: Exercise;
  autoPlay?: boolean;
  compact?: boolean;
  customCycleDurationMs?: number;
  initialSpeed?: PlaybackSpeedOption;
  onPhaseChange?: (phaseId: VideoPhaseCue['id']) => void;
  onOpenFullDetails?: (exercise: Exercise) => void;
}

export const InstructionalVideoPlayer: React.FC<Props> = ({
  exercise,
  autoPlay = true,
  compact = false,
  customCycleDurationMs,
  initialSpeed = 1.0,
  onPhaseChange,
  onOpenFullDetails
}) => {
  const instruction = useMemo(() => getExerciseVideoInstruction(exercise), [exercise]);

  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeedOption>(initialSpeed);
  const [loopMode, setLoopMode] = useState<LoopMode>('full_loop');
  const [lockedPhaseIndex, setLockedPhaseIndex] = useState<number>(0);
  const [cameraAngle, setCameraAngle] = useState<CameraAngle>(
    instruction.cameraAngles[0] || 'sagittal'
  );
  const [hudCategory, setHudCategory] = useState<VideoHudCategory>('auto');
  const [showHudOverlay, setShowHudOverlay] = useState<boolean>(true);
  const [showExternalEmbed, setShowExternalEmbed] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0); // 0.0 to 1.0

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const progressRef = useRef<number>(0);
  const lastPhaseIdRef = useRef<string>('');

  // Sync external autoPlay prop (e.g. when ActiveSessionModal pauses/resumes)
  useEffect(() => {
    setIsPlaying(autoPlay);
  }, [autoPlay]);

  // Reset camera angle & progress when switching exercises
  useEffect(() => {
    setCameraAngle(instruction.cameraAngles[0] || 'sagittal');
    progressRef.current = 0;
    setProgress(0);
    setLockedPhaseIndex(0);
  }, [exercise.id, instruction]);

  const baseCycleMs = customCycleDurationMs || instruction.cycleSeconds * 1000;

  // Determine active phase from progress
  const activePhaseIndex = useMemo(() => {
    const idx = instruction.phases.findIndex(
      (p) => progress >= p.startProgress && progress <= p.endProgress
    );
    return idx === -1 ? 0 : idx;
  }, [instruction.phases, progress]);

  const activePhase: VideoPhaseCue = instruction.phases[activePhaseIndex] || instruction.phases[0];

  // Sync HTML5 <video> element playbackRate & MediaStream from HD Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    try {
      const anyCanvas = canvas as HTMLCanvasElement & {
        captureStream?: (frameRate?: number) => MediaStream;
      };
      if (typeof anyCanvas.captureStream === 'function' && !video.srcObject) {
        const stream = anyCanvas.captureStream(60);
        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;
        video.play().catch(() => {
          // Canvas fallback remains directly visible
        });
      }
    } catch {
      // Safe fallback to direct HD canvas viewport
    }
  }, [exercise.id]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
      videoRef.current.loop = loopMode !== 'once';
    }
  }, [playbackSpeed, loopMode]);

  // Main 60 FPS animation & HD video synthesis loop
  useEffect(() => {
    let rafId: number;

    const renderFrame = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }
      const deltaMs = timestamp - lastTimestampRef.current;
      lastTimestampRef.current = timestamp;

      if (isPlaying && !showExternalEmbed) {
        const effectiveCycleMs = baseCycleMs / playbackSpeed;
        const deltaProgress = deltaMs / effectiveCycleMs;
        let nextProgress = progressRef.current + deltaProgress;

        if (loopMode === 'phase_ab') {
          const targetPhase = instruction.phases[lockedPhaseIndex] || activePhase;
          if (
            nextProgress > targetPhase.endProgress ||
            nextProgress < targetPhase.startProgress
          ) {
            nextProgress = targetPhase.startProgress;
          }
        } else if (loopMode === 'full_loop') {
          if (nextProgress >= 1.0) {
            nextProgress = nextProgress % 1.0;
          }
        } else {
          // 'once'
          if (nextProgress >= 1.0) {
            nextProgress = 1.0;
            setIsPlaying(false);
          }
        }

        progressRef.current = nextProgress;
        setProgress(nextProgress);

        const currentPhaseObj =
          instruction.phases.find(
            (p) => nextProgress >= p.startProgress && nextProgress <= p.endProgress
          ) || instruction.phases[0];

        if (currentPhaseObj.id !== lastPhaseIdRef.current) {
          lastPhaseIdRef.current = currentPhaseObj.id;
          onPhaseChange?.(currentPhaseObj.id);
        }
      }

      // Draw HD Clinical Video Frame on Canvas (960x540 internal HD 16:9 buffer)
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawClinicalHdFrame(
            ctx,
            canvas.width,
            canvas.height,
            exercise,
            progressRef.current,
            cameraAngle,
            hudCategory,
            activePhase
          );
        }
      }

      rafId = requestAnimationFrame(renderFrame);
    };

    rafId = requestAnimationFrame(renderFrame);
    return () => {
      cancelAnimationFrame(rafId);
      lastTimestampRef.current = null;
    };
  }, [
    isPlaying,
    playbackSpeed,
    loopMode,
    lockedPhaseIndex,
    baseCycleMs,
    exercise,
    cameraAngle,
    hudCategory,
    activePhase,
    instruction.phases,
    onPhaseChange,
    showExternalEmbed
  ]);

  const handleSelectPhase = (idx: number, enableAbLoop = false) => {
    const phase = instruction.phases[idx];
    if (!phase) return;
    setLockedPhaseIndex(idx);
    progressRef.current = phase.startProgress + 0.01;
    setProgress(progressRef.current);
    if (enableAbLoop) {
      setLoopMode('phase_ab');
      setIsPlaying(true);
    }
    soundService.playTick();
  };

  const handleStepFrame = (direction: -1 | 1) => {
    setIsPlaying(false);
    const next = Math.max(0, Math.min(0.99, progressRef.current + direction * 0.06));
    progressRef.current = next;
    setProgress(next);
    soundService.playTick();
  };

  const handleCycleLoopMode = () => {
    if (loopMode === 'full_loop') {
      setLockedPhaseIndex(activePhaseIndex);
      setLoopMode('phase_ab');
    } else if (loopMode === 'phase_ab') {
      setLoopMode('once');
    } else {
      setLoopMode('full_loop');
    }
    soundService.playTick();
  };

  // Compute active HUD content based on selected filter or current movement phase
  const activeHudData = useMemo(() => {
    const effectiveCategory =
      hudCategory === 'auto' ? activePhase.primaryCategory : hudCategory;

    if (effectiveCategory === 'posture') {
      return {
        badge: 'Prawidłowa postawa',
        colorClass: 'text-teal-300 border-teal-500/40 bg-teal-950/80',
        accentDot: 'bg-teal-400',
        headline:
          hudCategory === 'auto'
            ? activePhase.hudHeadline
            : instruction.clinicalCues.posture.title,
        detail:
          hudCategory === 'auto'
            ? activePhase.hudDetail
            : instruction.clinicalCues.posture.checkpoints[0],
        secondaryNote: `Oś: ${instruction.clinicalCues.posture.alignmentVector}`
      };
    }

    if (effectiveCategory === 'rom') {
      return {
        badge: 'Zakres ruchu (ROM)',
        colorClass: 'text-sky-300 border-sky-500/40 bg-sky-950/80',
        accentDot: 'bg-sky-400',
        headline:
          hudCategory === 'auto'
            ? activePhase.hudHeadline
            : `${instruction.clinicalCues.rangeOfMotion.targetAngleOrShift}`,
        detail:
          hudCategory === 'auto'
            ? activePhase.hudDetail
            : instruction.clinicalCues.rangeOfMotion.safeRangeLabel,
        secondaryNote: instruction.clinicalCues.rangeOfMotion.biomechanicalNote
      };
    }

    if (effectiveCategory === 'breathing') {
      return {
        badge: `Oddech: ${activePhase.breathAction}`,
        colorClass: 'text-emerald-300 border-emerald-500/40 bg-emerald-950/80',
        accentDot: 'bg-emerald-400',
        headline:
          hudCategory === 'auto'
            ? activePhase.hudHeadline
            : instruction.clinicalCues.breathing.patternLabel,
        detail:
          hudCategory === 'auto'
            ? activePhase.hudDetail
            : `${instruction.clinicalCues.breathing.inhalePhase} ${instruction.clinicalCues.breathing.exhalePhase}`,
        secondaryNote: instruction.clinicalCues.breathing.clinicalTip
      };
    }

    // mistakes
    const primaryMistake = instruction.clinicalCues.commonMistakes[0];
    return {
      badge: 'Unikaj błędu kompensacji',
      colorClass: 'text-amber-300 border-amber-500/50 bg-amber-950/85',
      accentDot: 'bg-amber-400',
      headline:
        activePhase.mistakeAlert ||
        (primaryMistake ? `BŁĄD: ${primaryMistake.mistake}` : activePhase.hudHeadline),
      detail: primaryMistake
        ? `KOREKTA: ${primaryMistake.correction}`
        : activePhase.hudDetail,
      secondaryNote: primaryMistake?.consequence || ''
    };
  }, [hudCategory, activePhase, instruction]);

  const currentSeconds = ((progress * baseCycleMs) / 1000).toFixed(1);
  const totalSeconds = (baseCycleMs / 1000).toFixed(1);

  return (
    <div
      id={`instructional-video-player-${exercise.id}`}
      className={`bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden text-white shadow-xl transition-all ${
        isExpanded ? 'fixed inset-3 sm:inset-6 z-50 flex flex-col' : ''
      }`}
    >
      {/* Top Studio Bar: Title, Resolution, Camera Switcher & Speed Badge */}
      <div className="px-3.5 py-2.5 bg-slate-900/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <Video className="w-4 h-4 text-teal-400 shrink-0" />
          <span className="font-bold text-slate-100 truncate">
            {exercise.polishName}
          </span>
          <span className="text-slate-500 hidden sm:inline">·</span>
          <span className="text-[11px] font-mono text-teal-400 hidden sm:inline whitespace-nowrap">
            {instruction.hdResolutionLabel}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Camera Angle Selector */}
          {!showExternalEmbed && (
            <div className="flex items-center bg-slate-800/90 p-0.5 rounded-lg border border-slate-700/80">
              {[
                { id: 'sagittal', label: 'Bok' },
                { id: 'coronal', label: 'Przód' },
                { id: 'split', label: '2x Kadr' }
              ].map((cam) => (
                <button
                  key={cam.id}
                  type="button"
                  onClick={() => setCameraAngle(cam.id as CameraAngle)}
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    cameraAngle === cam.id
                      ? 'bg-teal-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Zmień kąt kamery instruktażowej"
                >
                  {cam.label}
                </button>
              ))}
            </div>
          )}

          {/* Toggle HUD visibility */}
          {!showExternalEmbed && (
            <button
              type="button"
              onClick={() => setShowHudOverlay(!showHudOverlay)}
              className={`min-h-[32px] px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                showHudOverlay
                  ? 'bg-teal-950/80 border-teal-700/70 text-teal-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
              title="Pokaż lub ukryj nakładki HUD na wideo"
            >
              {showHudOverlay ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>HUD</span>
            </button>
          )}

          {/* Expand / Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="min-h-[32px] p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            title={isExpanded ? 'Pomniejsz odtwarzacz' : 'Powiększ odtwarzacz na pełny ekran'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main 16:9 HD Video Viewport with Synchronized HUD Overlays */}
      <div
        className={`relative w-full aspect-video bg-slate-950 overflow-hidden select-none ${
          isExpanded ? 'flex-1 max-h-[68vh]' : compact ? 'max-h-[250px] sm:max-h-[290px]' : ''
        }`}
      >
        {showExternalEmbed && exercise.videoEmbedUrl ? (
          <iframe
            src={`${exercise.videoEmbedUrl}?rel=0&modestbranding=1`}
            title={`Wideo instruktażowe: ${exercise.polishName}`}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <>
            {/* Native HTML5 Video Stream Mirror + High-DPI Interactive Canvas */}
            <video
              ref={videoRef}
              muted
              playsInline
              loop={loopMode !== 'once'}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-0"
              aria-label={`Strumień wideo HD dla ćwiczenia ${exercise.polishName}`}
            />
            <canvas
              ref={canvasRef}
              width={960}
              height={540}
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-full h-full object-contain cursor-pointer"
            />

            {/* Measured Top & Bottom Contrast Scrims for WCAG AA Legibility */}
            {showHudOverlay && (
              <>
                <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/80 via-black/35 to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
              </>
            )}

            {/* TOP SYNCHRONIZED HUD BAR: Movement Phase + ROM Metric + Breathing Rhythm */}
            {showHudOverlay && (
              <div className="absolute top-2.5 inset-x-3 flex items-center justify-between gap-2 pointer-events-none text-xs">
                <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 px-2.5 py-1 rounded-lg">
                  <span className="font-mono font-bold text-teal-400 tabular-nums">
                    {activePhase.label}
                  </span>
                  <span className="text-slate-500 hidden sm:inline">·</span>
                  <span className="font-mono text-[11px] text-sky-300 hidden sm:inline tabular-nums">
                    {activePhase.romMetricLabel}
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md border border-emerald-500/40 px-2.5 py-1 rounded-lg text-emerald-300 font-semibold">
                  <Wind className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="whitespace-nowrap text-[11px]">{activePhase.breathAction}</span>
                </div>
              </div>
            )}

            {/* LOOP A-B STATUS INDICATOR */}
            {loopMode === 'phase_ab' && showHudOverlay && (
              <div className="absolute top-12 left-3 bg-amber-500/20 border border-amber-400/50 backdrop-blur-md px-2.5 py-0.5 rounded-md text-[11px] font-mono text-amber-300 pointer-events-none">
                Pętla A–B: {instruction.phases[lockedPhaseIndex]?.shortLabel} ({playbackSpeed}x)
              </div>
            )}

            {/* BOTTOM SYNCHRONIZED HUD OVERLAY CARD */}
            {showHudOverlay && (
              <div className="absolute bottom-2.5 inset-x-3 pointer-events-none">
                <div
                  className={`rounded-xl border backdrop-blur-md px-3.5 py-2.5 transition-colors duration-200 ${activeHudData.colorClass}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase">
                      <span className={`w-2 h-2 rounded-full ${activeHudData.accentDot}`} />
                      <span>{activeHudData.badge}</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-300 tabular-nums">
                      {currentSeconds}s / {totalSeconds}s · {playbackSpeed.toFixed(2).replace(/\.00$/, '.0')}x
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-white leading-snug">
                    {activeHudData.headline}
                  </p>
                  {!compact && (
                    <p className="text-[11px] text-slate-200/90 mt-0.5 leading-relaxed line-clamp-2">
                      {activeHudData.detail}
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Interactive 4-Phase Scrubber & A-B Loop Timeline */}
      {!showExternalEmbed && (
        <div className="px-3.5 pt-2.5 pb-2 bg-slate-900 border-t border-slate-800 space-y-2">
          {/* Segmented Phase Buttons */}
          <div className="grid grid-cols-4 gap-1.5">
            {instruction.phases.map((phase, idx) => {
              const isCurrent = activePhaseIndex === idx;
              const isAbLocked = loopMode === 'phase_ab' && lockedPhaseIndex === idx;
              const phaseFill =
                progress <= phase.startProgress
                  ? 0
                  : progress >= phase.endProgress
                  ? 100
                  : ((progress - phase.startProgress) /
                      (phase.endProgress - phase.startProgress)) *
                    100;

              return (
                <button
                  key={phase.id}
                  type="button"
                  onClick={() => handleSelectPhase(idx, loopMode === 'phase_ab')}
                  className={`relative overflow-hidden rounded-lg p-1.5 text-left border transition-all cursor-pointer ${
                    isAbLocked
                      ? 'border-amber-400 bg-amber-950/40'
                      : isCurrent
                      ? 'border-teal-500/80 bg-slate-800'
                      : 'border-slate-800 bg-slate-900/80 hover:bg-slate-800/60'
                  }`}
                  title={`Przejdź do fazy: ${phase.label}`}
                >
                  <div
                    className={`absolute bottom-0 left-0 h-1 transition-all ${
                      isAbLocked ? 'bg-amber-400' : 'bg-teal-400'
                    }`}
                    style={{ width: `${phaseFill}%` }}
                  />
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="truncate font-semibold text-slate-200">
                      {idx + 1}. {phase.shortLabel}
                    </span>
                    {isAbLocked && <span className="text-amber-400 font-bold">A-B</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Primary Transport, Speed (Slow-Motion) & Loop Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            {/* Left: Play/Pause + Frame Step */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setIsPlaying(!isPlaying);
                  soundService.playTick();
                }}
                className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Pauza</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Odtwarzaj</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleStepFrame(-1)}
                className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                title="Cofnij o klatkę / fazę (-0.5s)"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleStepFrame(1)}
                className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                title="Naprzód o klatkę / fazę (+0.5s)"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Center: Playback Speed Selector (Slow-Motion 0.25x, 0.5x, 0.75x, 1.0x) */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <Gauge className="w-3.5 h-3.5 text-slate-400 ml-1.5 hidden sm:inline" />
              {([0.25, 0.5, 0.75, 1.0] as PlaybackSpeedOption[]).map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => {
                    setPlaybackSpeed(spd);
                    soundService.playTick();
                  }}
                  className={`min-h-[30px] px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
                    playbackSpeed === spd
                      ? 'bg-teal-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title={
                    spd < 1
                      ? `Zwolnione tempo ${spd}x do dokładnej analizy techniki`
                      : 'Standardowe tempo 1.0x'
                  }
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Right: Loop Mode Switcher (Full Loop / Phase A-B Loop / Single) */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCycleLoopMode}
                className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  loopMode === 'phase_ab'
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                    : loopMode === 'full_loop'
                    ? 'bg-slate-800 border-teal-500/50 text-teal-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
                title="Przełącz tryb zapętlania: Pętla całości / Pętla wybranej fazy A-B / Pojedyncze powtórzenie"
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>
                  {loopMode === 'full_loop'
                    ? 'Pętla: Całość'
                    : loopMode === 'phase_ab'
                    ? `Pętla Fazy ${lockedPhaseIndex + 1} (A–B)`
                    : 'Bez pętli'}
                </span>
              </button>
            </div>
          </div>

          {/* Synchronized HUD Category Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-800/80">
            <span className="text-[11px] text-slate-400 shrink-0 mr-1">Warstwa HUD:</span>
            {[
              { id: 'auto', label: 'Auto (Z fazą)' },
              { id: 'posture', label: '1. Postawa' },
              { id: 'rom', label: '2. Zakres ruchu' },
              { id: 'breathing', label: '3. Oddech' },
              { id: 'mistakes', label: '4. Typowe błędy' }
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setHudCategory(item.id as VideoHudCategory);
                  setShowHudOverlay(true);
                  soundService.playTick();
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  hudCategory === item.id
                    ? 'bg-slate-100 text-slate-900'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}

            {exercise.videoEmbedUrl && (
              <button
                type="button"
                onClick={() => setShowExternalEmbed(!showExternalEmbed)}
                className="ml-auto px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-800/90 hover:bg-slate-700 text-slate-300 flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
              >
                <ExternalLink className="w-3 h-3" />
                <span>{showExternalEmbed ? 'Wróć do HUD HD' : 'Nagranie YT'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Full 4-Pillar Clinical Breakdown (shown when not compact) */}
      {!compact && (
        <div className="p-4 bg-slate-900/60 border-t border-slate-800/90 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* 1. Prawidłowa postawa */}
          <div
            onClick={() => setHudCategory('posture')}
            className={`p-3 rounded-xl border transition-colors cursor-pointer ${
              hudCategory === 'posture'
                ? 'border-teal-500/70 bg-teal-950/30'
                : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-teal-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>1. Prawidłowa postawa</span>
              </span>
              <span className="text-[10px] text-slate-400">Kliknij, by przypiąć na HUD</span>
            </div>
            <ul className="space-y-1 text-slate-300 text-[11px] leading-relaxed">
              {instruction.clinicalCues.posture.checkpoints.map((cp, idx) => (
                <li key={idx}>· {cp}</li>
              ))}
            </ul>
          </div>

          {/* 2. Zakres ruchu (ROM) */}
          <div
            onClick={() => setHudCategory('rom')}
            className={`p-3 rounded-xl border transition-colors cursor-pointer ${
              hudCategory === 'rom'
                ? 'border-sky-500/70 bg-sky-950/30'
                : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-sky-400 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                <span>2. Zakres ruchu (ROM)</span>
              </span>
              <span className="font-mono text-[10px] text-sky-300 tabular-nums">
                {instruction.clinicalCues.rangeOfMotion.targetAngleOrShift}
              </span>
            </div>
            <p className="text-slate-200 font-medium text-[11px]">
              {instruction.clinicalCues.rangeOfMotion.safeRangeLabel}
            </p>
            <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
              {instruction.clinicalCues.rangeOfMotion.biomechanicalNote}
            </p>
          </div>

          {/* 3. Technika oddechu */}
          <div
            onClick={() => setHudCategory('breathing')}
            className={`p-3 rounded-xl border transition-colors cursor-pointer ${
              hudCategory === 'breathing'
                ? 'border-emerald-500/70 bg-emerald-950/30'
                : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5" />
                <span>3. Oddech i rytm</span>
              </span>
              <span className="font-mono text-[10px] text-emerald-300">
                Tempo {exercise.tempo}
              </span>
            </div>
            <p className="text-slate-200 font-medium text-[11px]">
              {instruction.clinicalCues.breathing.patternLabel}
            </p>
            <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
              {instruction.clinicalCues.breathing.clinicalTip}
            </p>
          </div>

          {/* 4. Typowe błędy do unikania */}
          <div
            onClick={() => setHudCategory('mistakes')}
            className={`p-3 rounded-xl border transition-colors cursor-pointer ${
              hudCategory === 'mistakes'
                ? 'border-amber-500/70 bg-amber-950/30'
                : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>4. Typowe błędy i korekta</span>
              </span>
              <span className="text-[10px] text-amber-300/80">Wektor błędu na wideo</span>
            </div>
            <div className="space-y-1.5 text-[11px]">
              {instruction.clinicalCues.commonMistakes.map((m, idx) => (
                <div key={idx} className="leading-snug">
                  <span className="text-rose-300 font-semibold">Unikaj: {m.mistake}</span>
                  <span className="block text-emerald-300/90 mt-0.5">
                    ✓ Korekta: {m.correction}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Optional Footer Link for Compact Preview in "Mój Plan" */}
      {compact && onOpenFullDetails && (
        <div className="px-3.5 py-2 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400">
            Postawa · Zakres ROM · Oddech · Błędy
          </span>
          <button
            type="button"
            onClick={() => onOpenFullDetails(exercise)}
            className="text-teal-400 hover:text-teal-300 font-bold text-xs cursor-pointer"
          >
            Pełny warsztat wideo →
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Renders a high-definition 60 FPS clinical physiotherapy video frame onto the HTML5 canvas.
 */
function drawClinicalHdFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  exercise: Exercise,
  progress: number,
  cameraAngle: CameraAngle,
  hudCategory: VideoHudCategory,
  activePhase: VideoPhaseCue
) {
  ctx.save();
  ctx.clearRect(0, 0, width, height);

  // 1. Studio Lighting Backdrop
  const bgGrad = ctx.createRadialGradient(
    width * 0.5,
    height * 0.42,
    40,
    width * 0.5,
    height * 0.5,
    width * 0.7
  );
  bgGrad.addColorStop(0, '#0f172a');
  bgGrad.addColorStop(0.65, '#090f1d');
  bgGrad.addColorStop(1, '#020617');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Clinical Calibration Grid (1cm / 5cm orthopaedic reference grid)
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.07)';
  ctx.lineWidth = 1;
  const gridStep = 32;
  for (let x = 0; x < width; x += gridStep) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridStep) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Smooth kinematic envelope (0 -> 1 -> 1 -> 0 across the 4 phases)
  const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
  let motionFactor = 0;
  if (progress >= 0.2 && progress < 0.5) {
    motionFactor = easeInOut((progress - 0.2) / 0.3);
  } else if (progress >= 0.5 && progress < 0.8) {
    motionFactor = 1.0;
  } else if (progress >= 0.8) {
    motionFactor = 1.0 - easeInOut((progress - 0.8) / 0.2);
  }

  // Breathing wave factor (0 = exhale, 1 = inhale expansion)
  const breathExpansion =
    activePhase.breathAction === 'Wdech nosem'
      ? 0.65 + 0.35 * Math.sin(progress * Math.PI * 2)
      : activePhase.breathAction === 'Wydech ustami' || activePhase.breathAction === 'Długi wydech'
      ? 0.3 - 0.2 * motionFactor
      : 0.45;

  const showMistakeGhost =
    hudCategory === 'mistakes' ||
    (hudCategory === 'auto' && activePhase.primaryCategory === 'mistakes');

  if (cameraAngle === 'split') {
    // Draw left (Sagittal) and right (Coronal) split studio views
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, width / 2, height);
    ctx.clip();
    drawSingleSubjectView(
      ctx,
      width * 0.27,
      height * 0.54,
      exercise,
      motionFactor,
      breathExpansion,
      'sagittal',
      showMistakeGhost,
      hudCategory
    );
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.rect(width / 2, 0, width / 2, height);
    ctx.clip();
    drawSingleSubjectView(
      ctx,
      width * 0.73,
      height * 0.54,
      exercise,
      motionFactor,
      breathExpansion,
      'coronal',
      showMistakeGhost,
      hudCategory
    );
    ctx.restore();

    // Split divider line & labels
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(width / 2, 48);
    ctx.lineTo(width / 2, height - 90);
    ctx.stroke();

    ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
    ctx.font = '600 12px monospace';
    ctx.fillText('KAMERA A · PROFIL STRZAŁKOWY (BOK)', 24, 72);
    ctx.fillText('KAMERA B · PROJEKCJA CZOŁOWA (PRZÓD)', width / 2 + 24, 72);
  } else {
    drawSingleSubjectView(
      ctx,
      width * 0.5,
      height * 0.54,
      exercise,
      motionFactor,
      breathExpansion,
      cameraAngle,
      showMistakeGhost,
      hudCategory
    );
  }

  ctx.restore();
}

function drawSingleSubjectView(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  exercise: Exercise,
  motionFactor: number,
  breathExpansion: number,
  angle: 'sagittal' | 'coronal',
  showMistakeGhost: boolean,
  hudCategory: VideoHudCategory
) {
  ctx.save();
  ctx.translate(cx, cy);

  // Plumb-line (Oś pionu C0-S1)
  ctx.strokeStyle =
    hudCategory === 'posture' ? 'rgba(45, 212, 191, 0.55)' : 'rgba(100, 116, 139, 0.35)';
  ctx.setLineDash([6, 6]);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -210);
  ctx.lineTo(0, 175);
  ctx.stroke();
  ctx.setLineDash([]);

  // Compute exercise-specific kinematics
  let headShiftX = 0;
  let headShiftY = 0;
  let headTiltDeg = 0;
  let headRotDeg = 0;
  let shoulderLiftY = 0;
  let armRaiseDeg = 0;
  let spineArch = 0;
  let romDisplayLabel = '';

  switch (exercise.animationType) {
    case 'chin_tuck':
      headShiftX = -26 * motionFactor;
      headShiftY = -4 * motionFactor;
      romDisplayLabel = `${Math.round(-18 * motionFactor)} mm`;
      break;
    case 'isometric_neck':
      headShiftX = -4 * motionFactor;
      romDisplayLabel = `0° (${Math.round(25 * motionFactor)}% MVC)`;
      break;
    case 'trapezius_stretch':
      headTiltDeg = -34 * motionFactor;
      romDisplayLabel = `${Math.round(35 * motionFactor)}° ROM`;
      break;
    case 'suboccipital_release':
      headShiftX = -14 * motionFactor;
      headShiftY = -8 * motionFactor;
      headTiltDeg = 8 * motionFactor;
      romDisplayLabel = `C0-C2 -${Math.round(8 * motionFactor)}°`;
      break;
    case 'neck_rotation':
      headRotDeg = 60 * motionFactor;
      romDisplayLabel = `${Math.round(60 * motionFactor)}° rotacji`;
      break;
    case 'brugger_relief':
      shoulderLiftY = 8 * motionFactor;
      spineArch = -12 * motionFactor;
      headShiftX = -14 * motionFactor;
      armRaiseDeg = 25 * motionFactor;
      romDisplayLabel = `+${Math.round(45 * motionFactor)}° otwarcia`;
      break;
    case 'scapular_retraction':
      shoulderLiftY = 6 * motionFactor;
      armRaiseDeg = 45 + 65 * motionFactor;
      romDisplayLabel = `W→Y ${Math.round(90 + 45 * motionFactor)}°`;
      break;
    case 'nerve_floss':
      armRaiseDeg = 85;
      headTiltDeg = 24 * motionFactor;
      romDisplayLabel = `Ślizg +${Math.round(24 * motionFactor)}°`;
      break;
    case 'cat_cow':
      spineArch = 26 * Math.sin(motionFactor * Math.PI);
      headTiltDeg = 16 * motionFactor;
      romDisplayLabel = `Łuk C1-S1`;
      break;
    case 'lumbar_extension':
      spineArch = -24 * motionFactor;
      headShiftY = -18 * motionFactor;
      romDisplayLabel = `L4-S1 +${Math.round(30 * motionFactor)}°`;
      break;
    default:
      headShiftX = -16 * motionFactor;
      romDisplayLabel = `${Math.round(100 * motionFactor)}%`;
  }

  // Draw Mistake Ghost Vector (Red/Amber compensation warning) if active
  if (showMistakeGhost) {
    ctx.save();
    ctx.strokeStyle = 'rgba(251, 113, 133, 0.55)';
    ctx.fillStyle = 'rgba(251, 113, 133, 0.14)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([4, 4]);

    // Mistake ghost: forward head tilt + elevated shoulders
    const mistakeHeadX = angle === 'sagittal' ? 28 : 0;
    const mistakeHeadY = -115 + 14;
    ctx.beginPath();
    ctx.arc(mistakeHeadX, mistakeHeadY, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Elevated shoulder ghost line
    ctx.beginPath();
    ctx.moveTo(-68, -42);
    ctx.lineTo(68, -42);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.fillStyle = '#fda4af';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('✗ BŁĄD KOMPENSACJI', mistakeHeadX + 42, mistakeHeadY);
    ctx.restore();
  }

  // 3. Draw Torso & Ribcage with Diaphragm Breathing Expansion
  const ribWidth = (angle === 'coronal' ? 68 : 46) + breathExpansion * 10;
  const ribGrad = ctx.createLinearGradient(0, -45, 0, 115);
  ribGrad.addColorStop(0, 'rgba(30, 41, 59, 0.92)');
  ribGrad.addColorStop(1, 'rgba(15, 23, 42, 0.95)');

  ctx.fillStyle = ribGrad;
  ctx.strokeStyle = 'rgba(71, 85, 105, 0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(-ribWidth, -32 + shoulderLiftY, ribWidth * 2, 155, 28);
  ctx.fill();
  ctx.stroke();

  // Diaphragm & Lower Rib Breathing Wave Ring
  ctx.save();
  ctx.strokeStyle = `rgba(52, 211, 153, ${0.35 + breathExpansion * 0.45})`;
  ctx.fillStyle = `rgba(16, 185, 129, ${0.12 + breathExpansion * 0.18})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(
    0,
    42,
    ribWidth + 6 * breathExpansion,
    24 + 8 * breathExpansion,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 4. Draw Spine Column (C1-C7, Th1-Th12, L1-S1)
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  const neckTopX = angle === 'sagittal' ? headShiftX * 0.85 : Math.sin((headTiltDeg * Math.PI) / 180) * 28;
  const neckTopY = -105 + headShiftY;
  ctx.moveTo(neckTopX, neckTopY);
  ctx.quadraticCurveTo(
    angle === 'sagittal' ? 10 + headShiftX * 0.3 : neckTopX * 0.5,
    -68,
    0,
    -30 + shoulderLiftY
  );
  ctx.quadraticCurveTo(spineArch, 45, 0, 120);
  ctx.stroke();

  // Vertebral nodes (C1..C7 & Th1..Th8)
  for (let i = 0; i <= 9; i++) {
    const t = i / 9;
    const vx =
      t < 0.45
        ? neckTopX * (1 - t / 0.45)
        : Math.sin(t * Math.PI) * (spineArch * 0.5);
    const vy = neckTopY + t * (115 - neckTopY);
    ctx.fillStyle = i <= 4 ? '#2dd4bf' : '#94a3b8';
    ctx.beginPath();
    ctx.arc(vx, vy, i <= 4 ? 4.2 : 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Target Muscle Activation Glow around Neck / Scapula
  const glowRadius = 38 + 14 * motionFactor;
  const muscleGrad = ctx.createRadialGradient(
    neckTopX * 0.5,
    -65,
    4,
    neckTopX * 0.5,
    -65,
    glowRadius
  );
  muscleGrad.addColorStop(0, `rgba(20, 184, 166, ${0.35 + 0.45 * motionFactor})`);
  muscleGrad.addColorStop(1, 'rgba(20, 184, 166, 0)');
  ctx.fillStyle = muscleGrad;
  ctx.beginPath();
  ctx.arc(neckTopX * 0.5, -65, glowRadius, 0, Math.PI * 2);
  ctx.fill();

  // 5. Shoulders & Arms
  if (angle === 'coronal' || exercise.animationType === 'scapular_retraction' || exercise.animationType === 'nerve_floss') {
    const shY = -26 + shoulderLiftY;
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(-72, shY);
    ctx.lineTo(72, shY);
    ctx.stroke();

    // Left & Right Arms for W-to-Y or Nerve Floss
    if (armRaiseDeg > 0) {
      const rad = (armRaiseDeg * Math.PI) / 180;
      const armLen = 62;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 6;
      // Right arm
      ctx.beginPath();
      ctx.moveTo(72, shY);
      ctx.lineTo(72 + Math.cos(rad - 0.5) * armLen, shY - Math.sin(rad - 0.4) * armLen);
      ctx.stroke();
      // Left arm
      ctx.beginPath();
      ctx.moveTo(-72, shY);
      ctx.lineTo(-72 - Math.cos(rad - 0.5) * armLen, shY - Math.sin(rad - 0.4) * armLen);
      ctx.stroke();
    }
  }

  // 6. Head & Cranial Orientation with Sight Vector
  ctx.save();
  const finalHeadX =
    angle === 'sagittal'
      ? headShiftX
      : Math.sin((headTiltDeg * Math.PI) / 180) * 34 + Math.sin((headRotDeg * Math.PI) / 180) * 14;
  const finalHeadY = -124 + headShiftY;
  ctx.translate(finalHeadX, finalHeadY);
  ctx.rotate(((angle === 'sagittal' ? headTiltDeg * 0.4 : headTiltDeg) * Math.PI) / 180);

  // Head silhouette
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = '#2dd4bf';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, angle === 'sagittal' ? 35 : 31, 41, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Horizontal gaze vector (Linia wzroku)
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (angle === 'sagittal') {
    // Nose profile & gaze arrow pointing left
    ctx.moveTo(-34, -4);
    ctx.lineTo(-92, -4);
    // Arrowhead
    ctx.moveTo(-84, -9);
    ctx.lineTo(-92, -4);
    ctx.lineTo(-84, 1);
  } else {
    const rotOffset = (headRotDeg / 60) * 20;
    ctx.arc(rotOffset, -4, 4, 0, Math.PI * 2);
  }
  ctx.stroke();
  ctx.restore();

  // 7. Dynamic Range of Motion (ROM) Protractor & Vector Readout
  ctx.save();
  ctx.strokeStyle = '#38bdf8';
  ctx.fillStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -124, 58, -Math.PI * 0.75, -Math.PI * 0.25);
  ctx.stroke();

  ctx.font = 'bold 12px monospace';
  ctx.fillStyle = '#7dd3fc';
  ctx.fillText(`ROM: ${romDisplayLabel}`, 48, -128);
  ctx.restore();

  ctx.restore();
}
