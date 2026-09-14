import React, { useState } from 'react';
import { 
  Heart, Moon, AlertTriangle, CheckCircle2, X, 
  Sparkles, Coffee, Droplets, Monitor, Smile, Frown, Save
} from 'lucide-react';
import { BiopsychosocialLog } from '../types';

interface Props {
  onClose: () => void;
  onSaveLog: (log: BiopsychosocialLog) => void;
  currentVasScore?: number;
}

export const BiopsychosocialDiaryModal: React.FC<Props> = ({
  onClose,
  onSaveLog,
  currentVasScore = 3
}) => {
  const [stressLevel, setStressLevel] = useState<number>(4);
  const [bruxismTension, setBruxismTension] = useState<boolean>(false);
  const [sleepQuality, setSleepQuality] = useState<'excellent' | 'good' | 'average' | 'poor'>('good');
  const [pillowType, setPillowType] = useState<'orthopedic_memory_foam' | 'neck_roll' | 'regular_feather' | 'flat' | 'none'>('orthopedic_memory_foam');
  const [sleepingPosition, setSleepingPosition] = useState<'back' | 'side' | 'stomach'>('back');
  const [screenHours, setScreenHours] = useState<number>(7);
  const [hydrationGlasses, setHydrationGlasses] = useState<number>(6);
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: BiopsychosocialLog = {
      id: `bps-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      stressLevel,
      bruxismTension,
      sleepQuality,
      pillowType,
      sleepingPosition,
      screenHours,
      hydrationGlasses,
      notes: notes.trim() ? notes.trim() : undefined,
      painVasScoreAtLog: currentVasScore
    };

    onSaveLog(newLog);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-600/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Dziennik Bio-Psycho-Społeczny (BPS)</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Wpływ stresu, snu, bruksizmu i nawodnienia na dolegliwości szyi
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

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Stress Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Smile className="w-4 h-4 text-teal-600" />
                <span>Poziom Stresu & Napięcia Psychosomatycznego</span>
              </label>
              <span className={`font-mono font-black text-sm px-2 py-0.5 rounded-lg ${
                stressLevel <= 3 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : stressLevel <= 6
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              }`}>
                {stressLevel} / 10
              </span>
            </div>

            <input
              type="range"
              min="1"
              max="10"
              value={stressLevel}
              onChange={(e) => setStressLevel(Number(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>1 - Pełen spokój</span>
              <span>5 - Umiarkowany pośpiech</span>
              <span>10 - Silny stres / skurcz karku</span>
            </div>
          </div>

          {/* Bruxism Checkbox */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Zaciskanie zębów / Szczękościsk (Bruksizm)
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Zaciskanie szczęki przenosi przeciążenia na mięśnie podpotyliczne i C1-C2
              </p>
            </div>
            <input
              type="checkbox"
              checked={bruxismTension}
              onChange={(e) => setBruxismTension(e.target.checked)}
              className="w-5 h-5 rounded text-teal-600 focus:ring-teal-500 border-slate-300 dark:border-slate-600 accent-teal-600 cursor-pointer"
            />
          </div>

          {/* Sleep Quality */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Jakość Snu w Nocy
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'excellent', label: 'Świetny', desc: 'Regenerujący' },
                { id: 'good', label: 'Dobry', desc: 'Wypoczęty' },
                { id: 'average', label: 'Średni', desc: 'Wybudzenia' },
                { id: 'poor', label: 'Słaby', desc: 'Ból rano' }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSleepQuality(item.id as any)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    sleepQuality === item.id
                      ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="text-xs">{item.label}</div>
                  <div className="text-[10px] opacity-75">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Sleeping Position with Warning */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Główna Pozycja Snu
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSleepingPosition('back')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  sleepingPosition === 'back'
                    ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="text-xs">Na plecach</div>
                <div className="text-[10px] text-emerald-600 font-semibold">Optymalna</div>
              </button>

              <button
                type="button"
                onClick={() => setSleepingPosition('side')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  sleepingPosition === 'side'
                    ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="text-xs">Na boku</div>
                <div className="text-[10px] text-teal-600 font-semibold">Z podparciem</div>
              </button>

              <button
                type="button"
                onClick={() => setSleepingPosition('stomach')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  sleepingPosition === 'stomach'
                    ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="text-xs">Na brzuchu</div>
                <div className="text-[10px] text-rose-600 font-semibold">Przeciwwskazana</div>
              </button>
            </div>

            {sleepingPosition === 'stomach' && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  <strong>Ostrzeżenie kliniczne:</strong> Spanie na brzuchu wymusza skrajną rotację szyi (70°-85°) przez wiele godzin, powodując kompresję tętnic kręgowych i blokady stawów C1-C2.
                </span>
              </div>
            )}
          </div>

          {/* Pillow Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Rodzaj Poduszki
            </label>
            <select
              value={pillowType}
              onChange={(e) => setPillowType(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="orthopedic_memory_foam">Profilowana poduszka ortopedyczna (Pianka z pamięcią kształtu)</option>
              <option value="neck_roll">Wałek kinezjologiczny pod szyję</option>
              <option value="regular_feather">Klasyczna poduszka z pierza / syntetyczna</option>
              <option value="flat">Bardzo płaska poduszka</option>
              <option value="none">Brak poduszki (płasko na materacu)</option>
            </select>
          </div>

          {/* Screen Time & Hydration in a Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <Monitor className="w-3.5 h-3.5 text-teal-600" />
                <span>Godziny przed ekranem</span>
              </label>
              <input
                type="number"
                min="0"
                max="18"
                value={screenHours}
                onChange={(e) => setScreenHours(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-teal-600" />
                <span>Nawodnienie (szklanki)</span>
              </label>
              <input
                type="number"
                min="0"
                max="20"
                value={hydrationGlasses}
                onChange={(e) => setHydrationGlasses(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
              />
            </div>
          </div>

          {/* Optional Notes */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Dodatkowe Uwagi (np. trudny dzień w pracy, ból głowy)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="np. Po 4h spotkań online poczułem silny ucisk w potylicy..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Zapisz w Dzienniku</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
