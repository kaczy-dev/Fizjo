import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, Watch, Activity, Zap, CheckCircle2, AlertTriangle, 
  Battery, Bluetooth, RefreshCw, ChevronDown, ChevronUp, ShieldCheck, Sparkles, Sliders
} from 'lucide-react';
import { soundService } from '../services/soundService';

export interface WearableTelemetry {
  heartRate: number;
  physiologicalLoadPercent: number;
  zone: 'recovery' | 'therapeutic' | 'elevated' | 'overload';
  zoneLabel: string;
  hrvMs: number;
  caloriesBurned: number;
  connected: boolean;
  deviceName: string;
  batteryLevel: number;
}

interface Props {
  onTelemetryUpdate?: (data: WearableTelemetry) => void;
  difficultyLevel?: number; // 1-5
  isBreathingActive?: boolean;
  isPaused?: boolean;
  className?: string;
}

const WEARABLE_DEVICES = [
  { id: 'garmin', name: 'Garmin Forerunner 965', sensor: 'Elevate 5 PPG', battery: 89 },
  { id: 'apple', name: 'Apple Watch Ultra 2', sensor: 'EKG + Podwójny PPG', battery: 94 },
  { id: 'polar', name: 'Polar H10 (Pas Piersiowy)', sensor: 'Medyczny EKG RR', battery: 78 },
  { id: 'xiaomi', name: 'Xiaomi Smart Band 8', sensor: 'Optyczny PPG', battery: 82 }
];

export const WearableLiveSyncPanel: React.FC<Props> = ({
  onTelemetryUpdate,
  difficultyLevel = 3,
  isBreathingActive = false,
  isPaused = false,
  className = ''
}) => {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [selectedDeviceIndex, setSelectedDeviceIndex] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [manualSimulationOverride, setManualSimulationOverride] = useState<boolean>(false);
  const [manualHeartRate, setManualHeartRate] = useState<number>(78);

  // Dynamic live metric state
  const [heartRate, setHeartRate] = useState<number>(74);
  const [hrvMs, setHrvMs] = useState<number>(72);
  const [caloriesBurned, setCaloriesBurned] = useState<number>(4.2);
  const [heartRateHistory, setHeartRateHistory] = useState<number[]>([70, 72, 71, 73, 74, 73, 75, 74, 76, 74]);

  const activeDevice = WEARABLE_DEVICES[selectedDeviceIndex];

  // Physiological Load Zone Calculation
  const calculateZone = (hr: number): { zone: WearableTelemetry['zone']; label: string; percent: number; colorClass: string; badgeBg: string } => {
    if (hr < 85) {
      return {
        zone: 'recovery',
        label: 'Strefa 1: Regeneracja & Powięź',
        percent: Math.min(100, Math.max(10, Math.round(((hr - 50) / 35) * 30))),
        colorClass: 'text-emerald-700 dark:text-emerald-400',
        badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
      };
    } else if (hr <= 110) {
      return {
        zone: 'therapeutic',
        label: 'Strefa 2: Terapeutyczna Mobilizacja',
        percent: Math.min(100, Math.round(30 + ((hr - 85) / 25) * 40)),
        colorClass: 'text-teal-700 dark:text-teal-400',
        badgeBg: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300 dark:border-teal-800'
      };
    } else if (hr <= 125) {
      return {
        zone: 'elevated',
        label: 'Strefa 3: Wzmożone Napięcie',
        percent: Math.min(100, Math.round(70 + ((hr - 110) / 15) * 20)),
        colorClass: 'text-amber-700 dark:text-amber-400',
        badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800'
      };
    } else {
      return {
        zone: 'overload',
        label: 'Strefa 4: Przeciążenie Fizjologiczne',
        percent: Math.min(100, Math.round(90 + ((hr - 125) / 30) * 10)),
        colorClass: 'text-rose-700 dark:text-rose-400',
        badgeBg: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800'
      };
    }
  };

  const currentZoneData = calculateZone(heartRate);

  // Real-time telemetry ticker (1.5 second loop)
  useEffect(() => {
    if (!isConnected || isPaused) return;

    const interval = setInterval(() => {
      let nextHr = heartRate;

      if (manualSimulationOverride) {
        // slight jitter around manual setting
        nextHr = manualHeartRate + (Math.floor(Math.random() * 3) - 1);
      } else {
        // Base HR depends on difficulty (level 1 = ~68, level 5 = ~92)
        const base = 65 + (difficultyLevel * 4.5);
        // Breathing lowers heart rate
        const breathingOffset = isBreathingActive ? -6 : 0;
        // Random natural cardiac variation (-2 to +3 bpm)
        const jitter = (Math.random() * 5) - 2;
        nextHr = Math.round(base + breathingOffset + jitter);
      }

      setHeartRate(nextHr);

      // HRV inversely correlates with high stress/HR, higher during calm breathing
      const nextHrv = Math.round(
        isBreathingActive 
          ? 78 + Math.random() * 8 
          : Math.max(45, 85 - (nextHr * 0.3) + (Math.random() * 6 - 3))
      );
      setHrvMs(nextHrv);

      // Burn active calories slowly
      setCaloriesBurned((prev) => +(prev + 0.05 * (difficultyLevel * 0.4)).toFixed(1));

      // Append to sparkline history (keep last 18 readings)
      setHeartRateHistory((prev) => [...prev.slice(-17), nextHr]);

      // Broadcast to parent callback
      if (onTelemetryUpdate) {
        onTelemetryUpdate({
          heartRate: nextHr,
          physiologicalLoadPercent: currentZoneData.percent,
          zone: currentZoneData.zone,
          zoneLabel: currentZoneData.label,
          hrvMs: nextHrv,
          caloriesBurned,
          connected: isConnected,
          deviceName: activeDevice.name,
          batteryLevel: activeDevice.battery
        });
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [
    isConnected, 
    isPaused, 
    manualSimulationOverride, 
    manualHeartRate, 
    difficultyLevel, 
    isBreathingActive, 
    caloriesBurned,
    onTelemetryUpdate,
    activeDevice,
    currentZoneData.percent,
    currentZoneData.zone,
    currentZoneData.label
  ]);

  const toggleConnection = () => {
    soundService.playTick();
    setIsConnected((prev) => !prev);
  };

  const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDeviceIndex(Number(e.target.value));
    soundService.playTick();
  };

  // Sparkline coordinates for real-time cardiac rhythm
  const sparkWidth = 140;
  const sparkHeight = 36;
  const minHr = Math.min(...heartRateHistory, 55);
  const maxHr = Math.max(...heartRateHistory, 120);
  const points = heartRateHistory.map((val, idx) => {
    const x = (idx / (heartRateHistory.length - 1)) * sparkWidth;
    const y = sparkHeight - ((val - minHr) / Math.max(1, maxHr - minHr)) * (sparkHeight - 8) - 4;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div
      id="wearable-live-sync-panel"
      className={`rounded-2xl border transition-all ${
        isConnected
          ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/70 border-teal-500/40 text-white shadow-lg'
          : 'bg-slate-100 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
      } ${className}`}
    >
      {/* Top Header Bar */}
      <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3 border-b border-white/10">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            isConnected
              ? 'bg-teal-500 text-white shadow-xs'
              : 'bg-slate-300 dark:bg-slate-700 text-slate-500'
          }`}>
            <Watch className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase tracking-tight text-white dark:text-white">
                Telemetria Wearable na Żywo
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold ${
                isConnected
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`} />
                {isConnected ? 'BLE Połączono' : 'Rozłączony'}
              </span>
            </div>
            
            <div className="text-[11px] text-teal-200/80 truncate">
              {isConnected ? `${activeDevice.name} • ${activeDevice.sensor}` : 'Brak aktywnego strumienia Bluetooth'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={toggleConnection}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              isConnected
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-teal-600 hover:bg-teal-500 text-white'
            }`}
          >
            {isConnected ? 'Rozłącz' : 'Połącz smartwatch'}
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title={isExpanded ? 'Zwiń panel' : 'Rozwiń panel telemetrii'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Telemetry Body */}
      {isExpanded && isConnected && (
        <div className="p-4 space-y-4">
          {/* Main Grid: Live HR, Physiological Load Bar, Sparkline */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            
            {/* Heart Rate Metric (4 cols) */}
            <div className="sm:col-span-4 bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider block">
                  Tętno (BPM)
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-3xl font-black font-mono tracking-tight text-white">
                    {heartRate}
                  </span>
                  <span className="text-xs text-rose-400 font-bold">BPM</span>
                </div>
                <span className="text-[10px] text-slate-300 block mt-0.5">
                  HRV: {hrvMs} ms • {caloriesBurned} kcal
                </span>
              </div>

              <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5 fill-current animate-pulse text-rose-400" />
              </div>
            </div>

            {/* Physiological Load Gauge & Zone (5 cols) */}
            <div className="sm:col-span-5 bg-white/5 border border-white/10 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider">
                  Obciążenie Organizmu
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${currentZoneData.badgeBg}`}>
                  {currentZoneData.percent}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className={`h-full transition-all duration-700 ${
                    heartRate < 85 
                      ? 'bg-emerald-400' 
                      : heartRate <= 110 
                      ? 'bg-teal-400' 
                      : heartRate <= 125 
                      ? 'bg-amber-400' 
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${currentZoneData.percent}%` }}
                />
              </div>

              <div className="text-[11px] font-bold truncate text-teal-100">
                {currentZoneData.label}
              </div>
            </div>

            {/* Real-time Rhythm Sparkline (3 cols) */}
            <div className="sm:col-span-3 bg-white/5 border border-white/10 rounded-xl p-2.5 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between text-[10px] text-teal-300 font-bold uppercase">
                <span>Rytm EKG/PPG</span>
                <span className="text-emerald-400 font-mono">LIVE</span>
              </div>

              {/* SVG Sparkline */}
              <div className="my-1">
                <svg className="w-full h-9 overflow-visible" viewBox={`0 0 ${sparkWidth} ${sparkHeight}`}>
                  <polyline
                    fill="none"
                    stroke="#2dd4bf"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                  />
                  {/* Pulsing Dot at the end */}
                  {points.split(' ').pop() && (
                    <circle
                      cx={points.split(' ').pop()?.split(',')[0]}
                      cy={points.split(' ').pop()?.split(',')[1]}
                      r="3"
                      fill="#f43f5e"
                    />
                  )}
                </svg>
              </div>

              <div className="text-[10px] text-slate-300 text-right">
                Bateria: {activeDevice.battery}% <Battery className="w-3 h-3 inline ml-0.5 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Clinical Insights & Simulation Controls Strip */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1 border-t border-white/10 text-xs">
            {/* Clinical Feedback Banner */}
            <div className="flex items-center gap-2 text-[11px] text-teal-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                {heartRate <= 85 && 'Wzorcowe tętno spoczynkowe. Mięśnie szyi mogą się w pełni rozluźnić.'}
                {heartRate > 85 && heartRate <= 110 && 'Optymalny przepływ krwi i dotlenienie tkanek okołokręgowych.'}
                {heartRate > 110 && heartRate <= 125 && 'Lekkie napięcie. Wydłuż fazę wydechu, aby aktywować nerw błędny.'}
                {heartRate > 125 && 'Podwyższone tętno! Zmniejsz opór i wykonaj 3 spokojne oddechy.'}
              </span>
            </div>

            {/* Device Profile Selector & Test Override */}
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <select
                id="wearable-device-selector"
                value={selectedDeviceIndex}
                onChange={handleDeviceChange}
                className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2 py-1 text-[11px] font-semibold cursor-pointer"
              >
                {WEARABLE_DEVICES.map((dev, idx) => (
                  <option key={dev.id} value={idx}>
                    {dev.name}
                  </option>
                ))}
              </select>

              {/* Simulation slider button toggle */}
              <button
                type="button"
                onClick={() => setManualSimulationOverride(!manualSimulationOverride)}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-colors flex items-center gap-1 cursor-pointer ${
                  manualSimulationOverride
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-white/5 border-white/20 text-slate-300 hover:bg-white/10'
                }`}
                title="Włącz ręczną symulację tętna"
              >
                <Sliders className="w-3 h-3" />
                <span>{manualSimulationOverride ? 'Suwak aktywny' : 'Symuluj HR'}</span>
              </button>
            </div>
          </div>

          {/* Manual Slider if enabled */}
          {manualSimulationOverride && (
            <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-2.5 flex items-center gap-3">
              <span className="text-[11px] font-bold text-amber-300 shrink-0">
                Ręczny suwak tętna:
              </span>
              <input
                type="range"
                min="55"
                max="140"
                value={manualHeartRate}
                onChange={(e) => setManualHeartRate(Number(e.target.value))}
                className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <span className="text-xs font-mono font-black text-amber-200 shrink-0">
                {manualHeartRate} BPM
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
