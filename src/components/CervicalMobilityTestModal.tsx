import React, { useState } from 'react';
import { 
  Compass, RotateCcw, ArrowRight, ArrowLeft, CheckCircle2, 
  AlertTriangle, ShieldCheck, Activity, Info, X, Sparkles, Trophy 
} from 'lucide-react';
import { UserHealthProfile } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: UserHealthProfile;
  onSaveMobilityTest: (testData: {
    neckRotationLeftDeg: number;
    neckRotationRightDeg: number;
    neckFlexionCm: number;
    neckExtensionDeg: number;
  }) => void;
}

export const CervicalMobilityTestModal: React.FC<Props> = ({
  isOpen,
  onClose,
  profile,
  onSaveMobilityTest
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [rotLeft, setRotLeft] = useState<number>(75);
  const [rotRight, setRotRight] = useState<number>(70);
  const [flexionCm, setFlexionCm] = useState<number>(2);
  const [extensionDeg, setExtensionDeg] = useState<number>(55);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  if (!isOpen) return null;

  // Norms:
  // Rotation: 80 deg (0-90 scale)
  // Flexion: 0-2 cm (0-6 cm scale, lower is better)
  // Extension: 60 deg (0-80 scale)

  const calculateMobilityIndex = () => {
    const rotLeftScore = Math.min(100, (rotLeft / 80) * 100);
    const rotRightScore = Math.min(100, (rotRight / 80) * 100);
    const flexionScore = Math.max(0, Math.min(100, ((6 - flexionCm) / 6) * 100));
    const extensionScore = Math.min(100, (extensionDeg / 60) * 100);

    const avg = Math.round((rotLeftScore + rotRightScore + flexionScore + extensionScore) / 4);
    return Math.min(100, Math.max(0, avg));
  };

  const mobilityIndex = calculateMobilityIndex();

  const handleSave = () => {
    onSaveMobilityTest({
      neckRotationLeftDeg: rotLeft,
      neckRotationRightDeg: rotRight,
      neckFlexionCm: flexionCm,
      neckExtensionDeg: extensionDeg
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  const steps = [
    {
      id: 'rot_left',
      title: '1. Rotacja szyi w lewą stronę',
      description: 'Usiądź prosto, opuść barki. Skręć głowę w lewo tak daleko, jak to możliwe bez bólu i bez unoszenia prawego barku.',
      normLabel: 'Kliniczna norma fizjologiczna: 80°',
      currentValue: `${rotLeft}°`,
      min: 20,
      max: 90,
      step: 5,
      value: rotLeft,
      onChange: (val: number) => setRotLeft(val),
      status: rotLeft >= 75 ? 'Prawidłowa norma' : rotLeft >= 60 ? 'Lekkie ograniczenie' : 'Znaczne ograniczenie',
      statusColor: rotLeft >= 75 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60' : rotLeft >= 60 ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/60' : 'text-rose-600 bg-rose-50 dark:bg-rose-950/60'
    },
    {
      id: 'rot_right',
      title: '2. Rotacja szyi w prawą stronę',
      description: 'Obróć powoli głowę w prawo, utrzymując brodę w pozycji poziomej (nie zadzieraj jej do góry).',
      normLabel: 'Kliniczna norma fizjologiczna: 80°',
      currentValue: `${rotRight}°`,
      min: 20,
      max: 90,
      step: 5,
      value: rotRight,
      onChange: (val: number) => setRotRight(val),
      status: rotRight >= 75 ? 'Prawidłowa norma' : rotRight >= 60 ? 'Lekkie ograniczenie' : 'Znaczne ograniczenie',
      statusColor: rotRight >= 75 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60' : rotRight >= 60 ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/60' : 'text-rose-600 bg-rose-50 dark:bg-rose-950/60'
    },
    {
      id: 'flexion',
      title: '3. Zgięcie w przód (odległość broda - mostek)',
      description: 'Powoli opuść głowę w dół, dążąc brodą do mostka. Zmierz lub oszacuj odległość (np. na grubość 1 palca ~1.5 cm).',
      normLabel: 'Kliniczna norma: 0 do 2 cm (dotknięcie mostka lub grubość 1 palca)',
      currentValue: `${flexionCm} cm`,
      min: 0,
      max: 6,
      step: 0.5,
      value: flexionCm,
      onChange: (val: number) => setFlexionCm(val),
      status: flexionCm <= 2 ? 'Prawidłowa norma (elastyczny kark)' : flexionCm <= 4 ? 'Wzmożone napięcie karku' : 'Sztywność podpotyliczna',
      statusColor: flexionCm <= 2 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60' : flexionCm <= 4 ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/60' : 'text-rose-600 bg-rose-50 dark:bg-rose-950/60'
    },
    {
      id: 'extension',
      title: '4. Wyprost w tył (spojrzenie w sufit)',
      description: 'Bez unoszenia barków odchyl głowę delikatnie w tył, patrząc w sufit. Płynny ruch bez zawrotów głowy.',
      normLabel: 'Kliniczna norma: 60° - 70° (linia czoła prawie równoległa do sufitu)',
      currentValue: `${extensionDeg}°`,
      min: 20,
      max: 75,
      step: 5,
      value: extensionDeg,
      onChange: (val: number) => setExtensionDeg(val),
      status: extensionDeg >= 55 ? 'Prawidłowa norma' : extensionDeg >= 40 ? 'Ograniczona ekstensja' : 'Znaczne ograniczenie / ból',
      statusColor: extensionDeg >= 55 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60' : extensionDeg >= 40 ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/60' : 'text-rose-600 bg-rose-50 dark:bg-rose-950/60'
    }
  ];

  const activeStep = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-semibold mb-2">
              <Compass className="w-3.5 h-3.5 text-teal-600" />
              <span>Protokół Kliniczny CROM • Ocena Zakresów Ruchu</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Funkcjonalny Test Ruchomości Szyi
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Sprawdź elastyczność i symetrię odcinka szyjnego w 4 kluczowych wektorach kinezjologicznych.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center gap-2">
          {steps.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setCurrentStep(idx)}
              className={`flex-1 h-2 rounded-full transition-all ${
                idx === currentStep
                  ? 'bg-teal-600'
                  : idx < currentStep
                  ? 'bg-teal-300 dark:bg-teal-800'
                  : 'bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Active Test Card */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              {activeStep.title}
            </h3>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${activeStep.statusColor}`}>
              {activeStep.status}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {activeStep.description}
          </p>

          <div className="text-[11px] text-teal-700 dark:text-teal-400 font-semibold flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>{activeStep.normLabel}</span>
          </div>

          {/* Interactive Slider */}
          <div className="pt-2 space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Osiągnięty wynik:
              </span>
              <span className="text-2xl font-black font-mono text-teal-600 dark:text-teal-400">
                {activeStep.currentValue}
              </span>
            </div>

            <input
              type="range"
              min={activeStep.min}
              max={activeStep.max}
              step={activeStep.step}
              value={activeStep.value}
              onChange={(e) => activeStep.onChange(parseFloat(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
            />

            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>{activeStep.min}{activeStep.id === 'flexion' ? ' cm' : '°'}</span>
              <span>Średnia norma</span>
              <span>{activeStep.max}{activeStep.id === 'flexion' ? ' cm' : '°'}</span>
            </div>
          </div>
        </div>

        {/* Global CROM Mobility Index Preview */}
        <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-teal-700 dark:text-teal-300 tracking-wider block">
              Indeks Ruchomości CROM
            </span>
            <div className="text-xs text-slate-600 dark:text-slate-300">
              {mobilityIndex >= 85 ? 'Optymalna biomechanika szyi' : mobilityIndex >= 70 ? 'Umiarkowane przykurcze tkanek' : 'Istotne ograniczenie ruchomości'}
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-black font-mono text-teal-700 dark:text-teal-300">
              {mobilityIndex}%
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">wskaźnika normy</span>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              currentStep === 0
                ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Wstecz</span>
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep + 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <span>Następny wektor</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaved}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSaved ? 'Zapisano pomyślnie ✓' : 'Zapisz wynik testu'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
