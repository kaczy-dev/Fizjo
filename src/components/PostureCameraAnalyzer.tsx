import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, RefreshCw, CheckCircle2, AlertTriangle, Play, 
  ChevronRight, Upload, X, ShieldCheck, HelpCircle, Eye, Info, Sparkles,
  Activity, Volume2, VolumeX, Pause, Shield, Zap, Flame, Award
} from 'lucide-react';
import { Exercise } from '../types';
import { EXERCISES } from '../data/exercises';
import { soundService } from '../services/soundService';
import { speechService } from '../services/speechService';

interface Props {
  onStartExercise?: (exercise: Exercise) => void;
  onSaveMeasurement?: (angle: number, diagnosis: string) => void;
  onClose?: () => void;
}

interface Landmark {
  x: number;
  y: number;
}

export const PostureCameraAnalyzer: React.FC<Props> = ({
  onStartExercise,
  onSaveMeasurement,
  onClose
}) => {
  // Mode switcher: static photo snapshot vs live desk guardian
  const [activeMode, setActiveMode] = useState<'photo' | 'live_guardian'>('photo');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const liveCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Common Camera state
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  // Static Photo Landmarks (Ear tragus and Shoulder acromion/C7)
  const [earPoint, setEarPoint] = useState<Landmark | null>(null);
  const [shoulderPoint, setShoulderPoint] = useState<Landmark | null>(null);
  const [activeDragPoint, setActiveDragPoint] = useState<'ear' | 'shoulder' | null>(null);
  
  // Computed Posture Metrics (Static)
  const [calculatedAngle, setCalculatedAngle] = useState<number | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // --- Live Desk Guardian States ---
  const [isGuardianRunning, setIsGuardianRunning] = useState<boolean>(false);
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [baselineY, setBaselineY] = useState<number | null>(null);
  const [currentHeadY, setCurrentHeadY] = useState<number | null>(null);
  const [postureStatus, setPostureStatus] = useState<'optimal' | 'mild_slouch' | 'deep_slouch'>('optimal');
  
  // Metrics & Session Timer
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);
  const [goodPostureSeconds, setGoodPostureSeconds] = useState<number>(0);
  const [slouchCount, setSlouchCount] = useState<number>(0);
  const [consecutiveSlouchSeconds, setConsecutiveSlouchSeconds] = useState<number>(0);
  const [audioAlertsEnabled, setAudioAlertsEnabled] = useState<boolean>(true);
  const [lastAlertTime, setLastAlertTime] = useState<number>(0);

  const guardianLoopRef = useRef<number | null>(null);
  const guardianTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize camera
  const startCamera = async (isLive = false) => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'user', 
            width: { ideal: 640 }, 
            height: { ideal: 480 } 
          }
        });
        streamRef.current = stream;
        const targetVideo = isLive ? liveVideoRef.current : videoRef.current;
        if (targetVideo) {
          targetVideo.srcObject = stream;
          targetVideo.play();
        }
        setCameraActive(true);
      } else {
        setCameraError('Twoja przeglądarka nie obsługuje bezpośredniego dostępu do kamery. Użyj opcji wczytania zdjęcia z dysku.');
      }
    } catch (err: unknown) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError('Dostęp do kamery został zablokowany lub urządzenie nie posiada aktywnej kamery.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
      if (guardianLoopRef.current) cancelAnimationFrame(guardianLoopRef.current);
      if (guardianTimerRef.current) clearInterval(guardianTimerRef.current);
    };
  }, []);

  // Handle mode switch cleanly
  const handleSwitchMode = (mode: 'photo' | 'live_guardian') => {
    stopCamera();
    setIsGuardianRunning(false);
    if (guardianLoopRef.current) cancelAnimationFrame(guardianLoopRef.current);
    if (guardianTimerRef.current) clearInterval(guardianTimerRef.current);
    setActiveMode(mode);
    if (mode === 'live_guardian') {
      setTimeout(() => startCamera(true), 200);
    }
  };

  // ----------------------------------------------------
  // --- STATIC PHOTO MODE LOGIC ---
  // ----------------------------------------------------

  // Handle file upload fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        stopCamera();
        processCapturedImage(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Trigger snapshot with optional countdown
  const triggerCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          takeSnapshot();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const takeSnapshot = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    stopCamera();
    processCapturedImage(dataUrl);
  };

  // Run On-Device Line & Edge Recognition Algorithm
  const processCapturedImage = (dataUrl: string) => {
    setCapturedImage(dataUrl);
    setIsSaved(false);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const data = imageData.data;
      const w = img.width;
      const h = img.height;

      const edgePoints: Landmark[] = [];
      const step = Math.max(4, Math.floor(h / 80));

      for (let y = Math.floor(h * 0.25); y < Math.floor(h * 0.75); y += step) {
        let maxGrad = 0;
        let bestX = Math.floor(w * 0.5);

        for (let x = Math.floor(w * 0.3); x < Math.floor(w * 0.7); x += 2) {
          const idx = (y * w + x) * 4;
          const idxRight = (y * w + (x + 2)) * 4;

          const lum1 = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
          const lum2 = 0.299 * data[idxRight] + 0.587 * data[idxRight + 1] + 0.114 * data[idxRight + 2];
          const grad = Math.abs(lum1 - lum2);

          if (grad > maxGrad) {
            maxGrad = grad;
            bestX = x;
          }
        }

        if (maxGrad > 25) {
          edgePoints.push({ x: bestX, y });
        }
      }

      let initialEar: Landmark;
      let initialShoulder: Landmark;

      if (edgePoints.length > 5) {
        edgePoints.sort((a, b) => a.y - b.y);
        const topSlice = edgePoints.slice(0, Math.min(4, edgePoints.length));
        const bottomSlice = edgePoints.slice(-Math.min(4, edgePoints.length));

        const avgTopX = topSlice.reduce((sum, p) => sum + p.x, 0) / topSlice.length;
        const avgTopY = topSlice.reduce((sum, p) => sum + p.y, 0) / topSlice.length;
        const avgBottomX = bottomSlice.reduce((sum, p) => sum + p.x, 0) / bottomSlice.length;
        const avgBottomY = bottomSlice.reduce((sum, p) => sum + p.y, 0) / bottomSlice.length;

        initialEar = { x: Math.round(avgTopX + w * 0.04), y: Math.round(avgTopY) };
        initialShoulder = { x: Math.round(avgBottomX), y: Math.round(avgBottomY) };
      } else {
        initialEar = { x: Math.round(w * 0.55), y: Math.round(h * 0.35) };
        initialShoulder = { x: Math.round(w * 0.48), y: Math.round(h * 0.62) };
      }

      setEarPoint(initialEar);
      setShoulderPoint(initialShoulder);
      computeAngle(initialEar, initialShoulder, w, h);
    };
    img.src = dataUrl;
  };

  // Compute angle between vertical plumb line and ear-shoulder axis
  const computeAngle = (ear: Landmark, shoulder: Landmark, canvasWidth?: number, canvasHeight?: number) => {
    const dx = ear.x - shoulder.x;
    const dy = shoulder.y - ear.y;

    if (dy <= 0) {
      setCalculatedAngle(0);
      return;
    }

    const rad = Math.atan2(dx, dy);
    let deg = Math.round(rad * (180 / Math.PI));
    deg = Math.max(0, Math.min(75, Math.abs(deg)));
    setCalculatedAngle(deg);

    drawOverlay(ear, shoulder, deg);
  };

  // Redraw posture lines and landmarks on canvas
  const drawOverlay = (ear: Landmark, shoulder: Landmark, angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !capturedImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // 1. Vertical Plumb Line (Pion grawitacyjny) passing through shoulder
      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.moveTo(shoulder.x, shoulder.y + 40);
      ctx.lineTo(shoulder.x, ear.y - 40);
      ctx.stroke();
      ctx.restore();

      // 2. Craniovertebral Angle Axis (Linia ucho - bark)
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = angle <= 15 ? '#10b981' : angle <= 30 ? '#f59e0b' : '#ef4444';
      ctx.lineWidth = 4;
      ctx.moveTo(shoulder.x, shoulder.y);
      ctx.lineTo(ear.x, ear.y);
      ctx.stroke();
      ctx.restore();

      // 3. Draw Angle Arc
      const radius = Math.min(60, Math.abs(shoulder.y - ear.y) * 0.4);
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3;
      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + (ear.x > shoulder.x ? 1 : -1) * (angle * Math.PI / 180);
      ctx.arc(shoulder.x, shoulder.y, radius, Math.min(startAngle, endAngle), Math.max(startAngle, endAngle));
      ctx.stroke();
      ctx.restore();

      // 4. Angle Label Badge
      ctx.save();
      const midAngle = startAngle + (endAngle - startAngle) / 2;
      const labelX = shoulder.x + Math.cos(midAngle) * (radius + 24);
      const labelY = shoulder.y + Math.sin(midAngle) * (radius + 24);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.roundRect(labelX - 22, labelY - 14, 44, 28, 8);
      ctx.fill();
      ctx.strokeStyle = angle <= 15 ? '#10b981' : angle <= 30 ? '#f59e0b' : '#ef4444';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${angle}°`, labelX, labelY);
      ctx.restore();

      // 5. Landmark Pins (Draggable)
      ctx.save();
      ctx.beginPath();
      ctx.arc(shoulder.x, shoulder.y, 9, 0, Math.PI * 2);
      ctx.fillStyle = '#3b82f6';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('BARK (C7)', shoulder.x + 14, shoulder.y + 4);
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(ear.x, ear.y, 9, 0, Math.PI * 2);
      ctx.fillStyle = '#14b8a6';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('UCHO (Tragus)', ear.x + 14, ear.y - 4);
      ctx.restore();
    };
    img.src = capturedImage;
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!earPoint || !shoulderPoint || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const distEar = Math.hypot(mouseX - earPoint.x, mouseY - earPoint.y);
    const distShoulder = Math.hypot(mouseX - shoulderPoint.x, mouseY - shoulderPoint.y);

    if (distEar < 35) {
      setActiveDragPoint('ear');
    } else if (distShoulder < 35) {
      setActiveDragPoint('shoulder');
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!activeDragPoint || !canvasRef.current || !earPoint || !shoulderPoint) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    const mouseX = Math.round((e.clientX - rect.left) * scaleX);
    const mouseY = Math.round((e.clientY - rect.top) * scaleY);

    if (activeDragPoint === 'ear') {
      const newEar = { x: mouseX, y: mouseY };
      setEarPoint(newEar);
      computeAngle(newEar, shoulderPoint);
    } else if (activeDragPoint === 'shoulder') {
      const newShoulder = { x: mouseX, y: mouseY };
      setShoulderPoint(newShoulder);
      computeAngle(earPoint, newShoulder);
    }
  };

  const handleCanvasMouseUp = () => {
    setActiveDragPoint(null);
  };

  // ----------------------------------------------------
  // --- LIVE DESK GUARDIAN LOGIC ---
  // ----------------------------------------------------

  // Detect head Y centroid in current video frame
  const detectLiveHeadCentroid = (): number | null => {
    const video = liveVideoRef.current;
    const canvas = liveCanvasRef.current;
    if (!video || !canvas || video.readyState < 2) return null;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    canvas.width = 160;
    canvas.height = 120;
    ctx.drawImage(video, 0, 0, 160, 120);

    const imgData = ctx.getImageData(0, 0, 160, 120);
    const data = imgData.data;

    // We locate the vertical center of mass of the upper silhouette (top 15% to 75% height)
    let totalMass = 0;
    let weightedY = 0;

    for (let y = 15; y < 85; y += 2) {
      for (let x = 30; x < 130; x += 2) {
        const idx = (y * 160 + x) * 4;
        const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
        // Weight darker foreground features (head/hair/neck vs bright background)
        const mass = Math.max(0, 255 - lum);
        totalMass += mass;
        weightedY += y * mass;
      }
    }

    if (totalMass === 0) return null;
    return Math.round(weightedY / totalMass);
  };

  // Calibrate user's neutral, upright desk posture
  const calibrateNeutralPosture = () => {
    setIsCalibrating(true);
    soundService.playTick();

    setTimeout(() => {
      const detected = detectLiveHeadCentroid();
      if (detected !== null) {
        setBaselineY(detected);
        setCurrentHeadY(detected);
        setPostureStatus('optimal');
        soundService.playChime(660);
      }
      setIsCalibrating(false);
    }, 1500);
  };

  // Main Live Guardian Analysis Loop
  useEffect(() => {
    if (!isGuardianRunning || !cameraActive) return;

    // Timer interval (1 second ticks)
    guardianTimerRef.current = setInterval(() => {
      setSessionSeconds((prev) => prev + 1);

      const detected = detectLiveHeadCentroid();
      if (detected !== null && baselineY !== null) {
        setCurrentHeadY(detected);
        const deltaY = detected - baselineY; // Positive delta = head dropped down or slouched forward

        if (deltaY <= 4) {
          setPostureStatus('optimal');
          setGoodPostureSeconds((prev) => prev + 1);
          setConsecutiveSlouchSeconds(0);
        } else if (deltaY <= 10) {
          setPostureStatus('mild_slouch');
          setConsecutiveSlouchSeconds((prev) => prev + 1);
        } else {
          setPostureStatus('deep_slouch');
          setConsecutiveSlouchSeconds((prev) => {
            const nextVal = prev + 1;
            // Slouch alert after 6 consecutive seconds
            if (nextVal === 6) {
              setSlouchCount((c) => c + 1);
              const now = Date.now();
              if (audioAlertsEnabled && now - lastAlertTime > 10000) {
                setLastAlertTime(now);
                soundService.playChime(440);
                speechService.speak('Proszę cofnąć brodę i wyprostować plecy.');
              }
            }
            return nextVal;
          });
        }
      }
    }, 1000);

    return () => {
      if (guardianTimerRef.current) clearInterval(guardianTimerRef.current);
    };
  }, [isGuardianRunning, cameraActive, baselineY, audioAlertsEnabled, lastAlertTime]);

  const toggleGuardian = () => {
    if (isGuardianRunning) {
      setIsGuardianRunning(false);
    } else {
      if (!cameraActive) {
        startCamera(true);
      }
      setIsGuardianRunning(true);
      if (baselineY === null) {
        setTimeout(() => calibrateNeutralPosture(), 800);
      }
    }
  };

  const resetGuardianSession = () => {
    setSessionSeconds(0);
    setGoodPostureSeconds(0);
    setSlouchCount(0);
    setConsecutiveSlouchSeconds(0);
    setBaselineY(null);
    setCurrentHeadY(null);
    setPostureStatus('optimal');
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const ergonomicsScore = sessionSeconds > 0 
    ? Math.min(100, Math.round((goodPostureSeconds / sessionSeconds) * 100))
    : 100;

  // Diagnosis for static angle
  const getDiagnosis = (angle: number) => {
    if (angle <= 14) {
      return {
        level: 'Fizjologiczna norma',
        badgeBg: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300',
        weightPressure: '4.5 - 5 kg',
        description: 'Twoja głowa znajduje się w osi grawitacyjnej ciała. Mięśnie podpotyliczne i krążki międzykręgowe C5-C7 pracują w warunkach optymalnej amortyzacji.',
        exerciseId: 'chin-tuck'
      };
    }
    if (angle <= 29) {
      return {
        level: 'Łagodne wysunięcie (Tech-Neck I°)',
        badgeBg: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300',
        weightPressure: '12 - 16 kg',
        description: 'Lekka protrakcja głowy. Dźwigacze łopatki i mięśnie czworoboczne są stale napięte, co może wywoływać wieczorne pieczenie karku i sztywność.',
        exerciseId: 'chin-tuck'
      };
    }
    if (angle <= 44) {
      return {
        level: 'Umiarkowane wysunięcie (Tech-Neck II°)',
        badgeBg: 'bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 border-orange-300',
        weightPressure: '18 - 22 kg',
        description: 'Głowa wywiera nacisk ponad 18 kg na dolne kręgi szyjne! Ryzyko spłycenia lordozy szyjnej, przeciążenia stawów międzywyrostkowych i napięciowych bólów głowy.',
        exerciseId: 'brugger-relief'
      };
    }
    return {
      level: 'Zaawansowana protrakcja (Tech-Neck III°)',
      badgeBg: 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300',
      weightPressure: '25 - 27+ kg',
      description: 'Bardzo duże wychylenie głowy w przód. Krążki międzykręgowe C5-C7 pracują pod ekstremalnym obciążeniem 27 kg. Wymagana codzienna korekcja i retrakcja.',
      exerciseId: 'brugger-relief'
    };
  };

  const diagnosis = calculatedAngle !== null ? getDiagnosis(calculatedAngle) : null;
  const recommendedExercise = diagnosis 
    ? (EXERCISES.find(e => e.id === diagnosis.exerciseId) || EXERCISES[0]) 
    : EXERCISES[0];

  const handleSave = () => {
    if (calculatedAngle !== null && diagnosis) {
      setIsSaved(true);
      if (onSaveMeasurement) {
        onSaveMeasurement(calculatedAngle, diagnosis.level);
      }
    }
  };

  return (
    <div 
      id="posture-camera-analyzer"
      className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6"
    >
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-semibold">
            <Camera className="w-3.5 h-3.5" />
            <span>Kinezjologiczny Moduł Wizyjny • Analiza Ergonomii i Postawy</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {activeMode === 'photo' ? 'Fotograficzna Ocena Kąta CVA (Tech-Neck)' : 'Strażnik Biurka na Żywo (Desk Posture Guardian)'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {activeMode === 'photo' 
              ? 'Zrób zdjęcie profilu karku lub wczytaj plik. Algorytm wyliczy nacisk na krążki C5-C7 i kąt protrakcji.'
              : 'Włącz kamerę podczas pracy przy biurku. System w czasie rzeczywistym wykrywa opadanie głowy i przypomina o wyprostowaniu.'}
          </p>
        </div>

        {/* Mode Toggle Pills */}
        <div className="flex items-center gap-2">
          <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center">
            <button
              type="button"
              onClick={() => handleSwitchMode('photo')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'photo'
                  ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Foto Kąt CVA
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('live_guardian')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeMode === 'live_guardian'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Strażnik na Żywo</span>
            </button>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* MODE 1: STATIC PHOTO */}
      {activeMode === 'photo' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Viewport / Video / Canvas Column (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="relative aspect-4/3 w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner flex items-center justify-center">
              {!cameraActive && !capturedImage && (
                <div className="text-center p-6 space-y-4 max-w-sm">
                  <div className="w-16 h-16 rounded-2xl bg-teal-900/50 border border-teal-700/50 text-teal-400 flex items-center justify-center mx-auto shadow-lg">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">Uruchom test postawy</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Stań bokiem do obiektywu w naturalnej pozycji siedzącej lub stojącej.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <button
                      id="start-posture-camera-btn"
                      type="button"
                      onClick={() => startCamera(false)}
                      className="flex-1 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Włącz kamerę</span>
                    </button>

                    <label className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-all">
                      <Upload className="w-4 h-4 text-teal-400" />
                      <span>Wczytaj zdjęcie</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleFileUpload} 
                      />
                    </label>
                  </div>

                  {cameraError && (
                    <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-start gap-2 text-left mt-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{cameraError}</span>
                    </div>
                  )}
                </div>
              )}

              {cameraActive && !capturedImage && (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-px h-full border-l-2 border-dashed border-teal-400/70 relative">
                      <span className="absolute top-4 -left-16 bg-teal-900/80 text-teal-200 text-[10px] font-bold px-2 py-0.5 rounded border border-teal-600">
                        Pion grawitacyjny
                      </span>
                    </div>
                  </div>

                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-48 h-64 border-2 border-teal-300/40 rounded-full flex items-center justify-center text-teal-200/60 text-xs font-semibold">
                      <span className="bg-black/50 px-2 py-1 rounded">Profil głowy i karku</span>
                    </div>
                  </div>

                  {countdown !== null && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-7xl font-black text-white animate-ping">
                        {countdown}
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-4 inset-x-4 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-3 py-2 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs font-semibold hover:bg-black/80"
                    >
                      Anuluj
                    </button>

                    <button
                      id="capture-posture-btn"
                      type="button"
                      onClick={triggerCapture}
                      className="px-6 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs shadow-xl flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Zrób zdjęcie (3s)</span>
                    </button>

                    <label className="p-2.5 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs font-semibold hover:bg-black/80 cursor-pointer">
                      <Upload className="w-4 h-4" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleFileUpload} 
                      />
                    </label>
                  </div>
                </>
              )}

              <canvas
                ref={canvasRef}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
                className={`w-full h-full object-contain cursor-crosshair ${
                  capturedImage ? 'block' : 'hidden'
                }`}
              />
            </div>

            {capturedImage && (
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-[11px]">
                  <Info className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Możesz przeciągać punkty <strong>Ucho</strong> i <strong>Bark</strong> myszą/palcem, aby skorygować pozycję.</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCapturedImage(null);
                      setCalculatedAngle(null);
                      setEarPoint(null);
                      setShoulderPoint(null);
                      startCamera(false);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Nowe zdjęcie</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Results & Clinical Guidance Column (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {calculatedAngle !== null && diagnosis ? (
              <div className="space-y-4">
                <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Kąt Wychylenia Głowy (CVA)
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${diagnosis.badgeBg}`}>
                      {diagnosis.level}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                      {calculatedAngle}°
                    </span>
                    <div className="text-xs text-slate-500">
                      <div>Wychylenie od osi pionu</div>
                      <div className="font-semibold text-slate-700 dark:text-slate-300">Norma kliniczna: ≤ 15°</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-slate-500 uppercase font-bold">
                        Rzeczywisty nacisk na kręgi C5-C7
                      </div>
                      <div className="text-lg font-black font-mono text-teal-600 dark:text-teal-400">
                        {diagnosis.weightPressure}
                      </div>
                    </div>
                    <div className="text-right text-[11px] text-slate-500 max-w-[130px]">
                      (Masa głowy w pionie to ~5 kg)
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {diagnosis.description}
                  </p>
                </div>

                <div className="p-4 rounded-3xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Zalecane ćwiczenie
                    </span>
                    <span className="text-[11px] text-teal-700 dark:text-teal-400 font-bold">1 min</span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {recommendedExercise.polishName}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5">
                      {recommendedExercise.description}
                    </p>
                  </div>

                  {onStartExercise && (
                    <button
                      type="button"
                      onClick={() => onStartExercise(recommendedExercise)}
                      className="w-full py-2.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Wykonaj teraz ({recommendedExercise.polishName})</span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaved}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                    isSaved
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                      : 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 shadow-xs cursor-pointer'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSaved ? 'Pomiar zapisany ✓' : 'Zapisz wynik do historii'}</span>
                </button>
              </div>
            ) : (
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Instrukcja pomiaru kąta CVA:
                </h4>
                <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <span>Ustaw kamerę lub telefon na wysokości klatki piersiowej.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <span>Usiądź bokiem do obiektywu w naturalnej pozycji pracy przy biurku.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <span>Zrób zdjęcie (3s). Na urządzeniu zostanie wyliczony kąt wysunięcia głowy.</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-[11px] flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>100% Prywatności:</strong> Obliczenia wykonujemy w pamięci podręcznej przeglądarki. Żaden obraz nie opuszcza Twojego urządzenia.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODE 2: LIVE DESK GUARDIAN */}
      {activeMode === 'live_guardian' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Video feed + Live HUD (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className={`relative aspect-4/3 w-full bg-slate-950 rounded-2xl overflow-hidden border-2 transition-all shadow-inner flex items-center justify-center ${
              postureStatus === 'optimal'
                ? 'border-emerald-500/60'
                : postureStatus === 'mild_slouch'
                ? 'border-amber-500/80 animate-pulse'
                : 'border-rose-500 animate-pulse'
            }`}>
              <video
                ref={liveVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas ref={liveCanvasRef} className="hidden" />

              {/* HUD: Status Badge */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5 shadow-md ${
                  postureStatus === 'optimal'
                    ? 'bg-emerald-600/90 text-white'
                    : postureStatus === 'mild_slouch'
                    ? 'bg-amber-600/90 text-white'
                    : 'bg-rose-600/90 text-white'
                }`}>
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  {postureStatus === 'optimal'
                    ? 'Prawidłowa Postawa (Lordoza)'
                    : postureStatus === 'mild_slouch'
                    ? 'Lekkie Wysunięcie Głowy'
                    : 'Tech-Neck Slouch! Opuściłeś głowę'}
                </span>

                {isCalibrating && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-600 text-white animate-bounce">
                    Kalibruję oś...
                  </span>
                )}
              </div>

              {/* HUD: Consecutive slouch warning overlay */}
              {consecutiveSlouchSeconds >= 4 && (
                <div className="absolute inset-0 bg-rose-950/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-4">
                  <div className="w-14 h-14 rounded-full bg-rose-600 text-white flex items-center justify-center mb-2 shadow-xl animate-bounce">
                    <AlertTriangle className="w-7 h-7" />
                  </div>
                  <h3 className="text-white text-lg font-black">
                    Wyprostuj się i cofnij brodę!
                  </h3>
                  <p className="text-rose-200 text-xs mt-1 max-w-xs">
                    Wykryto zapadnięcie karku przez {consecutiveSlouchSeconds} sekund. Odciąż segmenty C5-C7.
                  </p>
                </div>
              )}

              {/* HUD Bottom Bar with Controls */}
              <div className="absolute bottom-4 inset-x-4 flex items-center justify-between gap-2 z-10">
                <button
                  type="button"
                  onClick={toggleGuardian}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer ${
                    isGuardianRunning
                      ? 'bg-rose-600 hover:bg-rose-500 text-white'
                      : 'bg-teal-600 hover:bg-teal-500 text-white'
                  }`}
                >
                  {isGuardianRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isGuardianRunning ? 'Wstrzymaj' : 'Uruchom monitor'}</span>
                </button>

                <button
                  type="button"
                  onClick={calibrateNeutralPosture}
                  disabled={isCalibrating}
                  className="px-3.5 py-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCalibrating ? 'animate-spin' : ''}`} />
                  <span>Skalibruj pozycję</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAudioAlertsEnabled(!audioAlertsEnabled)}
                  className="p-2.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs transition-all cursor-pointer"
                  title={audioAlertsEnabled ? 'Wycisz alerty głosowe' : 'Włącz alerty'}
                >
                  {audioAlertsEnabled ? <Volume2 className="w-4 h-4 text-teal-300" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>Ustaw kamerę pod kątem 45°-90° do monitora i pracuj swobodnie.</span>
              <button
                type="button"
                onClick={resetGuardianSession}
                className="font-bold text-teal-600 hover:underline"
              >
                Wyzeruj licznik sesji
              </button>
            </div>
          </div>

          {/* Right: Live Ergonomic Telemetry (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Statystyki Bieżącej Sesji Biurowej
                </span>
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                  {formatTime(sessionSeconds)}
                </span>
              </div>

              {/* Ergonomics Score Pill */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase">
                    Wskaźnik Ergonomii Postawy
                  </span>
                  <div className="text-3xl font-black font-mono text-teal-600 dark:text-teal-400">
                    {ergonomicsScore}%
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {goodPostureSeconds}s w prawidłowej osi
                  </span>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-600 flex items-center justify-center">
                  <Award className="w-7 h-7" />
                </div>
              </div>

              {/* Slouch Incidents */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Zapadnięcia (Slouch)
                  </span>
                  <span className="text-xl font-black font-mono text-rose-600 dark:text-rose-400">
                    {slouchCount}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">wykrytych epizodów</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Czas w pozycji Tech-Neck
                  </span>
                  <span className="text-xl font-black font-mono text-amber-600 dark:text-amber-400">
                    {formatTime(Math.max(0, sessionSeconds - goodPostureSeconds))}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">wymagało korekty</span>
                </div>
              </div>

              {/* Quick corrective action advice */}
              <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-teal-600" />
                  <span>Czym jest Strażnik Postawy?</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                  Kamera analizuje pozycję Twojej głowy względem skalibrowanego poziomu. Gdy pochylisz się nad laptopem na dłużej niż 6 sekund, system wyda dyskretny sygnał audio przypominający o cofnięciu brody (Chin Tuck).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
