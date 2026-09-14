import React, { useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, Lock, CheckCircle2, 
  ArrowRight, Stethoscope, HeartPulse, FileText, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onAcceptConsent: (data: {
    userName: string;
    primaryGoal: 'tech_neck' | 'discopathy' | 'tension_headache' | 'posture_prevention' | 'shoulder_scapula';
  }) => void;
  onClose?: () => void;
  isAlreadyAccepted?: boolean;
}

export const MedicalOnboardingModal: React.FC<Props> = ({
  isOpen,
  onAcceptConsent,
  onClose,
  isAlreadyAccepted = false
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [userName, setUserName] = useState<string>('Pacjent');
  const [primaryGoal, setPrimaryGoal] = useState<'tech_neck' | 'discopathy' | 'tension_headache' | 'posture_prevention' | 'shoulder_scapula'>('tech_neck');
  
  // Mandatory checkboxes
  const [agreeMedicalTerms, setAgreeMedicalTerms] = useState<boolean>(isAlreadyAccepted);
  const [agreeSafetyNoSharpPain, setAgreeSafetyNoSharpPain] = useState<boolean>(isAlreadyAccepted);
  const [agreeLocalDataPrivacy, setAgreeLocalDataPrivacy] = useState<boolean>(isAlreadyAccepted);

  if (!isOpen) return null;

  const canProceedStep3 = agreeMedicalTerms && agreeSafetyNoSharpPain && agreeLocalDataPrivacy;

  const handleComplete = () => {
    if (!canProceedStep3) return;
    onAcceptConsent({
      userName: userName.trim() || 'Pacjent',
      primaryGoal
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto"
      >
        {/* Header with Gov/Medical Polish Branding */}
        <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-slate-900 text-white p-5 sm:p-6 relative">
          {isAlreadyAccepted && onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Zamknij"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-2 text-xs font-semibold text-teal-200 uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Kliniczny Standard Bezpieczeństwa & RODO</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Świadoma Zgoda Pacjenta & Zasady Autoterapii
          </h2>
          <p className="text-xs sm:text-sm text-teal-100/90 mt-1 max-w-xl">
            Przed przystąpieniem do ćwiczeń rehabilitacyjnych karku i kręgosłupa zapoznaj się z zasadami bezpieczeństwa medycznego.
          </p>

          {/* Stepper indicator */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/15 text-xs">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold transition-all ${
                activeStep === 1 
                  ? 'bg-white text-teal-900 shadow-xs' 
                  : 'text-teal-200 hover:bg-white/10'
              }`}
            >
              <span>1. Medyczny Disclaimer</span>
            </button>
            <span className="text-white/40">/</span>
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold transition-all ${
                activeStep === 2 
                  ? 'bg-white text-teal-900 shadow-xs' 
                  : 'text-teal-200 hover:bg-white/10'
              }`}
            >
              <span>2. RODO & Prywatność</span>
            </button>
            <span className="text-white/40">/</span>
            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold transition-all ${
                activeStep === 3 
                  ? 'bg-white text-teal-900 shadow-xs' 
                  : 'text-teal-200 hover:bg-white/10'
              }`}
            >
              <span>3. Twój Profil & Zgoda</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 space-y-6 max-h-[68vh] overflow-y-auto">
          {/* STEP 1: Medical Disclaimer */}
          {activeStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300"
            >
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-xs uppercase tracking-wide">
                    Ważna informacja prawno-medyczna:
                  </p>
                  <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">
                    Aplikacja <strong>FizjoSzyja & Kręgosłup</strong> jest cyfrowym narzędziem wspierającym profilaktykę, korygowanie postawy biurowej oraz edukację kinezjologiczną. <strong>Nie stanowi porady lekarskiej, diagnozy medycznej ani nie zastępuje bezpośredniego badania fizjoterapeutycznego czy obrazowego (RTG, MRI).</strong>
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  <span>Kiedy NIE NALEŻY wykonywać ćwiczeń bez zgody lekarza?</span>
                </h3>
                <ul className="space-y-2 list-disc list-inside text-xs text-slate-600 dark:text-slate-400 pl-1">
                  <li>Świeży uraz komunikacyjny głowy lub szyi (whiplash) do 72 godzin od zdarzenia.</li>
                  <li>Podejrzenie złamania kręgu, niestabilności szkieletowej lub osteoporozy zaawansowanej.</li>
                  <li>Aktywna infekcja ogólnoustrojowa z gorączką lub podejrzenie zmian nowotworowych.</li>
                  <li>Nagłe, silne promieniowanie bólu do obu rąk z zaburzeniem czucia (tzw. objawy neurologiczne).</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                <span className="font-bold text-slate-900 dark:text-white block mb-1">Złota reguła autoterapii:</span>
                Ćwiczenia karku mogą powodować uczucie przyjemnego rozciągania lub łagodnego zmęczenia mięśniowego, ale <strong>nigdy nie mogą wywoływać ostrego, kłującego bólu</strong> ani zawrotów głowy.
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  <span>Dalej: Ochrona danych RODO</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: GDPR & Health Data Privacy */}
          {activeStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300"
            >
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 text-teal-900 dark:text-teal-200">
                <Lock className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-xs uppercase tracking-wide">
                    Art. 9 RODO – Dane o zdrowiu i 100% Suwerenność Pacjenta:
                  </p>
                  <p className="text-xs leading-relaxed text-teal-800 dark:text-teal-300">
                    Szanujemy Twoją prywatność. Twoje dane medyczne (skala bólu VAS, kąty nachylenia szyi, przyjmowane leki) <strong>są przetwarzane wyłącznie lokalnie w pamięci Twojej przeglądarki</strong>.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Zero śledzenia i reklam</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Aplikacja nie posiada skryptów śledzących Facebook Pixel czy Google Analytics. Twoje zdrowie nie jest towarem reklamowym.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Lokalne szyfrowanie AES-GCM</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Dane w schowku pamięci są chronione. W każdej chwili możesz pobrać pełny raport w PDF lub usunąć całą historię 1 kliknięciem.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium"
                >
                  Wstecz: Disclaimer
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  <span>Dalej: Twój profil & Zgoda</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Profile Goal & Mandatory Checkboxes */}
          {activeStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300"
            >
              {/* User Name & Goal selection */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Twoje imię lub pseudonim:
                    </label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="np. Anna, Piotr..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Główny cel rehabilitacji:
                    </label>
                    <select
                      value={primaryGoal}
                      onChange={(e) => setPrimaryGoal(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    >
                      <option value="tech_neck">Ból karku przy biurku (Tech-Neck)</option>
                      <option value="tension_headache">Napięciowe bóle głowy & podpotyliczne</option>
                      <option value="discopathy">Dyskopatia szyjna & zalecenia lekarskie</option>
                      <option value="shoulder_scapula">Bóle łopatek i pieczenie czworobocznych</option>
                      <option value="posture_prevention">Profilaktyka i zdrowy nawyk ruchowy</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Mandatory Acceptance Checkboxes */}
              <div className="space-y-3 pt-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Wymagane oświadczenia pacjenta (zaznacz wszystkie):
                </h4>

                <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeMedicalTerms}
                    onChange={(e) => setAgreeMedicalTerms(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded mt-0.5 focus:ring-teal-500 shrink-0"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                    Rozumiem, że aplikacja ma charakter profilaktyczno-edukacyjny i <strong>nie zastępuje konsultacji lekarskiej ani badania neurologicznego</strong>. W razie nagłego pogorszenia stanu lub objawów alarmowych skontaktuję się z lekarzem / SOR.
                  </span>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeSafetyNoSharpPain}
                    onChange={(e) => setAgreeSafetyNoSharpPain(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded mt-0.5 focus:ring-teal-500 shrink-0"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                    Zobowiązuję się do <strong>natychmiastowego przerwania ćwiczenia w razie pojawienia się ostrego kłującego bólu</strong>, zawrotów głowy, mdłości lub drętwienia kończyn.
                  </span>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeLocalDataPrivacy}
                    onChange={(e) => setAgreeLocalDataPrivacy(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded mt-0.5 focus:ring-teal-500 shrink-0"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                    Akceptuję lokalne przechowywanie moich danych o postępach w przeglądarce (RODO Art. 9) i rozumiem zasady ich eksportu do pliku PDF.
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium"
                >
                  Wstecz: RODO
                </button>

                <button
                  id="confirm-onboarding-consent-btn"
                  type="button"
                  disabled={!canProceedStep3}
                  onClick={handleComplete}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs shadow-md transition-all ${
                    canProceedStep3
                      ? 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-600/25 cursor-pointer scale-100'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Rozpocznij bezpieczną autoterapię</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
