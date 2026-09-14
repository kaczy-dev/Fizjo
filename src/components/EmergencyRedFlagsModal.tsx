import React, { useState } from 'react';
import { 
  AlertOctagon, PhoneCall, ShieldAlert, Check, Copy, 
  X, AlertTriangle, Stethoscope, ChevronRight, Info 
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  detectedSymptoms?: string[];
  initialReason?: string;
}

export const EmergencyRedFlagsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  detectedSymptoms = [],
  initialReason
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const redFlagsList = [
    {
      category: 'Objawy Neurologiczne & Naczyniowe (5D + 3N)',
      symptoms: [
        { name: 'Zawroty głowy & Utrata równowagi (Dizziness)', desc: 'Silne wirowanie otoczenia podczas ruchów głową' },
        { name: 'Podwójne widzenie (Diplopia)', desc: 'Rozmycie lub rozdwojenie obrazu' },
        { name: 'Zaburzenia mowy (Dysarthria)', desc: 'Bełkotliwa, niewyraźna mowa, trudność w wypowiadaniu słów' },
        { name: 'Zaburzenia połykania (Dysphagia)', desc: 'Nagłe krztuszenie się, trudność w przełknięciu śliny' },
        { name: 'Nagłe upadki bez utraty przytomności (Drop Attacks)', desc: 'Nagłe ugięcie się nóg i upadek' },
        { name: 'Oczopląs (Nystagmus) & Mdłości (Nausea)', desc: 'Mimowolne skakanie gałek ocznych połączone z wymiotami' }
      ]
    },
    {
      category: 'Mielopatia Szyjna & Ucisk Rdzenia Kręgowego',
      symptoms: [
        { name: 'Niedowład lub sztywność chodu', desc: 'Uczucie ciężkich, „spastycznych” nóg, potykanie się o własne stopy' },
        { name: 'Zaburzenia manualne dłoni', desc: 'Trudności z zapinaniem guzików, wypadanie przedmiotów z rąk' },
        { name: 'Zaburzenia zwieraczy', desc: 'Nagłe nietrzymanie lub zatrzymanie moczu / stolca' },
        { name: 'Objaw Lhermitte’a', desc: 'Uczucie prądu przebiegającego wzdłuż kręgosłupa przy przygięciu brody do klatki' }
      ]
    },
    {
      category: 'Urazy & Czerwone Flagi Ogólne',
      symptoms: [
        { name: 'Świeży uraz komunikacyjny lub upadek', desc: 'Podejrzenie niestabilności lub pęknięcia kręgu C1-C7' },
        { name: 'Gorączka z silną sztywnością karku', desc: 'Niemożność dotknięcia brodą do mostka (podejrzenie ZOMR)' },
        { name: 'Niewyjaśniony spadek masy ciała', desc: 'Wywiad onkologiczny, silne bóle nocne nieustępujące w spoczynku' }
      ]
    }
  ];

  const handleCopyDispatchText = () => {
    const text = `KARTA ZGŁOSZENIA RATUNKOWEGO - OBJAWY CZERWONYCH FLAG KRĘGOSŁUPA SZYJNEGO:\n` +
      `- Zgłaszane objawy alarmowe: ${detectedSymptoms.length > 0 ? detectedSymptoms.join(', ') : 'Podejrzenie ostrego ucisku neurologicznego / naczyniowego'}\n` +
      `- Powód zgłoszenia: ${initialReason || 'Zaostrzenie objawów odcinka szyjnego'}\n` +
      `- Zalecenie kliniczne: Pilna konsultacja lekarska / SOR (Szpitalny Oddział Ratunkowy).\n` +
      `Data generowania: ${new Date().toLocaleString('pl-PL')}`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-rose-500/80 overflow-hidden my-auto"
      >
        {/* Urgent Header */}
        <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-red-800 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Zamknij okno"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-200 mb-1">
            <ShieldAlert className="w-5 h-5 text-white animate-pulse" />
            <span>Kliniczny Protokół Bezpieczeństwa Pacjenta</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Czerwone Flagi: Kiedy natychmiast na SOR?</span>
          </h2>
          <p className="text-xs sm:text-sm text-rose-100 mt-1 max-w-xl">
            W przypadku wystąpienia któregokolwiek z poniższych objawów, <strong>bezwzględnie przerwij ćwiczenia</strong> i wezwij pomoc medyczną (112 / 999).
          </p>
        </div>

        {/* Emergency Fast Action Banner */}
        <div className="bg-rose-50 dark:bg-rose-950/40 p-4 border-b border-rose-200 dark:border-rose-900/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <PhoneCall className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <span className="text-xs font-bold text-rose-900 dark:text-rose-200 block">
                Pilny kontakt z dyspozytorem medycznym:
              </span>
              <span className="text-[11px] text-rose-700 dark:text-rose-300">
                Poinformuj o nagłych objawach neurologicznych lub po urazie karku.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href="tel:112"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-md shadow-rose-600/30 transition-all"
            >
              <span>Zadzwoń 112</span>
            </a>
            <a
              href="tel:999"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-800 hover:bg-red-700 text-white text-xs font-black shadow-md transition-all"
            >
              <span>Pogotowie 999</span>
            </a>
          </div>
        </div>

        {/* Symptoms List */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {redFlagsList.map((group, idx) => (
            <div key={idx} className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                <span>{group.category}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {group.symptoms.map((s, sIdx) => {
                  const isDetected = detectedSymptoms.some(d => d.toLowerCase().includes(s.name.toLowerCase()));
                  return (
                    <div
                      key={sIdx}
                      className={`p-3 rounded-2xl border text-xs space-y-1 ${
                        isDetected 
                          ? 'border-rose-500 bg-rose-100 dark:bg-rose-950/80 font-bold' 
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60'
                      }`}
                    >
                      <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                        <span>{s.name}</span>
                        {isDetected && (
                          <span className="px-1.5 py-0.2 bg-rose-600 text-white text-[9px] rounded uppercase font-black">
                            Wykryto!
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {s.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Guide on what to tell the dispatcher */}
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <Info className="w-4 h-4 text-teal-600" />
              <span>Co powiedzieć dyspozytorowi pogotowia (112/999)?</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
              <li>Podaj dokładny adres pobytu i swoje imię.</li>
              <li>Podkreśl, czy wystąpiły <strong>zaburzenia mowy, niedowład ręki/nogi lub utrata czucia</strong>.</li>
              <li>Poinformuj, czy zdarzenie poprzedził uraz (np. wypadek samochodowy, uderzenie w głowę).</li>
              <li>Pozostań w pozycji leżącej z podpartą głową do przyjazdu zespołu ratownictwa.</li>
            </ol>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/90 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopyDispatchText}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Skopiowano opis objawów' : 'Kopiuj kartę objawów'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-opacity"
          >
            Rozumiem zasady bezpieczeństwa
          </button>
        </div>
      </motion.div>
    </div>
  );
};
