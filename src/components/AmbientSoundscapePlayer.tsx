import React, { useState, useEffect } from 'react';
import { 
  Headphones, Play, Pause, Volume2, VolumeX, 
  ChevronDown, ChevronUp, Sparkles, ShieldCheck, Waves 
} from 'lucide-react';
import { 
  ambientSoundscapeService, 
  SOUNDSCAPE_PRESETS, 
  SoundscapeType, 
  SoundscapeState 
} from '../services/ambientSoundscapeService';

interface Props {
  className?: string;
  compact?: boolean;
}

export const AmbientSoundscapePlayer: React.FC<Props> = ({ 
  className = '',
  compact = false 
}) => {
  const [state, setState] = useState<SoundscapeState>(ambientSoundscapeService.getState());
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showVolumeTooltip, setShowVolumeTooltip] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = ambientSoundscapeService.subscribe((newState) => {
      setState(newState);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const activePreset = SOUNDSCAPE_PRESETS.find(p => p.id === state.activePresetId) || SOUNDSCAPE_PRESETS[0];

  const handleTogglePlay = () => {
    ambientSoundscapeService.togglePlay();
  };

  const handleSelectPreset = (presetId: SoundscapeType) => {
    ambientSoundscapeService.setPreset(presetId);
    if (!state.isPlaying) {
      ambientSoundscapeService.play(presetId);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    ambientSoundscapeService.setVolume(val);
  };

  return (
    <div 
      id="ambient-soundscape-player"
      className={`rounded-2xl transition-all border ${
        state.isPlaying 
          ? 'bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-sky-500/10 dark:from-teal-950/40 dark:via-emerald-950/40 dark:to-sky-950/40 border-teal-500/30 dark:border-teal-700/50 shadow-xs' 
          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800'
      } ${className}`}
    >
      {/* Primary Bar */}
      <div className="p-2.5 sm:p-3 flex items-center justify-between gap-2.5">
        {/* Play/Pause & Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            id="ambient-play-toggle-btn"
            type="button"
            onClick={handleTogglePlay}
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-xs ${
              state.isPlaying 
                ? 'bg-teal-600 text-white hover:bg-teal-500 ring-2 ring-teal-400/40 animate-pulse' 
                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'
            }`}
            title={state.isPlaying ? 'Wstrzymaj tło dźwiękowe' : 'Włącz tło dźwiękowe dla skupienia'}
          >
            {state.isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm shrink-0">{activePreset.icon}</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {activePreset.name}
              </span>
              {state.isPlaying && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900/70 dark:text-teal-200 border border-teal-200 dark:border-teal-700">
                  <Waves className="w-2.5 h-2.5 animate-pulse text-teal-600" />
                  Gra w tle
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[200px] sm:max-w-xs">
              {activePreset.shortDesc}
            </p>
          </div>
        </div>

        {/* Right Controls: Volume + Expand Presets */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Volume Control */}
          <div className="flex items-center gap-1.5 bg-white/70 dark:bg-slate-900/60 px-2 py-1 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => {
                if (state.volume > 0) {
                  ambientSoundscapeService.setVolume(0);
                } else {
                  ambientSoundscapeService.setVolume(0.45);
                }
              }}
              className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              title={state.volume === 0 ? 'Wyłącz wyciszenie' : 'Wycisz tło'}
            >
              {state.volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              )}
            </button>

            <input
              id="ambient-volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={state.volume}
              onChange={handleVolumeChange}
              className="w-14 sm:w-20 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
              title={`Głośność tła: ${Math.round(state.volume * 100)}%`}
            />

            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 w-6 text-right">
              {Math.round(state.volume * 100)}%
            </span>
          </div>

          {/* Preset Selector Dropdown / Expander */}
          <button
            id="ambient-expand-presets-btn"
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs transition-colors flex items-center gap-1 cursor-pointer"
            title="Wybierz inne tło dźwiękowe lub fale binauralne"
          >
            <Headphones className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span className="hidden md:inline text-[11px] font-semibold">Tła</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Preset Selection Drawer */}
      {isExpanded && (
        <div className="p-3 sm:p-4 border-t border-slate-200/80 dark:border-slate-700/60 bg-white/60 dark:bg-slate-900/60 rounded-b-2xl space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              Wybierz krajobraz dźwiękowy do ćwiczeń
            </span>
            <span className="text-[10px] text-slate-400">
              Synteza Web Audio API • 100% offline
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {SOUNDSCAPE_PRESETS.map((preset) => {
              const isSelected = state.activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-teal-50 dark:bg-teal-950/70 border-teal-500 dark:border-teal-600 text-teal-950 dark:text-teal-100 shadow-xs'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-teal-400 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <span>{preset.icon}</span>
                      <span>{preset.name}</span>
                    </span>
                    {isSelected && state.isPlaying && (
                      <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                    {preset.shortDesc}
                  </p>
                  <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-700/60 text-[9px] text-teal-700 dark:text-teal-300 flex items-center gap-1">
                    <ShieldCheck className="w-2.5 h-2.5 shrink-0" />
                    <span className="line-clamp-1">{preset.clinicalBenefit}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-start gap-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-[10px] text-slate-600 dark:text-slate-400">
            <Headphones className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Wskazówka:</strong> W przypadku fali binauralnych (Alfa 10 Hz, Theta 6 Hz) najlepszy efekt neuromobilizacyjny uzyskuje się w słuchawkach stereo (niezależny ton dla prawego i lewego ucha stymuluje wygaszenie pobudzenia współczulnego).
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
