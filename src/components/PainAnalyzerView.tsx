import React, { useState } from 'react';
import { 
  Stethoscope, AlertTriangle, ShieldCheck, ShieldAlert, 
  Sparkles, CheckCircle2, ArrowRight, History, Info, Play, FileText, ChevronDown,
  Activity, Smile, Meh, Frown, MessageSquare, Brain, HeartPulse
} from 'lucide-react';
import { PainReport, TriageResult, Exercise, PatientMood } from '../types';
import { analyzePainSymptomsOffline } from '../services/aiPainAnalyzer';
import { EXERCISES } from '../data/exercises';

interface Props {
  painHistory: PainReport[];
  onSaveReport: (report: PainReport) => void;
  onOpenExercise: (exercise: Exercise) => void;
  onNavigateToPdf: () => void;
}

const MOOD_OPTIONS: { id: PatientMood; label: string; emoji: string; desc: string }[] = [
  { id: 'relaxed', label: 'Zrelaksowany', emoji: '😊', desc: 'Spokój, brak napięć' },
  { id: 'calm', label: 'Spokojny', emoji: '😌', desc: 'Równowaga psychiczna' },
  { id: 'neutral', label: 'Neutralny', emoji: '😐', desc: 'Zwykły stan codzienny' },
  { id: 'fatigued', label: 'Zmęczony', emoji: '🥱', desc: 'Spadek energii, senność' },
  { id: 'tense', label: 'Spięty', emoji: '😣', desc: 'Stres, obciążenie psychiczne' },
  { id: 'irritated', label: 'Zirytowany', emoji: '😤', desc: 'Frustracja, pośpiech' },
  { id: 'exhausted', label: 'Wyczerpany', emoji: '😫', desc: 'Duże przeciążenie, bezsenność' }
];

export const PainAnalyzerView: React.FC<Props> = ({
  painHistory,
  onSaveReport,
  onOpenExercise,
  onNavigateToPdf
}) => {
  const [selectedRegion, setSelectedRegion] = useState<PainReport['region']>('neck');
  const [vasScore, setVasScore] = useState<number>(5);
  const [character, setCharacter] = useState<PainReport['character']>('stiff');
  const [triggers, setTriggers] = useState<string[]>(['dluga_praca_przy_komputerze']);
  const [associatedSymptoms, setAssociatedSymptoms] = useState<string[]>([]);
  
  // Psychosomatic correlation inputs
  const [stressLevel, setStressLevel] = useState<number>(4);
  const [mood, setMood] = useState<PatientMood>('neutral');
  const [psychosomaticNotes, setPsychosomaticNotes] = useState<string>('');

  const [analysisResult, setAnalysisResult] = useState<TriageResult | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // Available triggers
  const triggerOptions = [
    { id: 'dluga_praca_przy_komputerze', label: 'Długa praca przy biurku/komputerze' },
    { id: 'stres', label: 'Stres i napięcie emocjonalne' },
    { id: 'niewygodna_poduszka', label: 'Zła pozycja snu / nieodpowiednia poduszka' },
    { id: 'nagly_ruch_glowy', label: 'Nagły obrót głowy lub schylenie' },
    { id: 'przewianie_klimatyzacja', label: 'Klimatyzacja / przewianie karku' },
    { id: 'niedawny_wypadek', label: 'Niedawny uraz lub uderzenie' }
  ];

  // Associated symptoms (including neurological red flag triggers)
  const symptomOptions = [
    { id: 'bol_glowy', label: 'Ból głowy promieniujący od potylicy' },
    { id: 'mrowienie_palcow', label: 'Mrowienie w palcach ręki' },
    { id: 'mrowienie_kciuka', label: 'Mrowienie kciuka (strefa korzenia C6)' },
    { id: 'mrowienie_palca_srodkowego', label: 'Mrowienie palca środkowego (strefa C7)' },
    { id: 'mrowienie_malego_palca', label: 'Mrowienie palca małego (strefa C8)' },
    { id: 'zawroty_glowy', label: 'Zawroty głowy przy zmianie pozycji' },
    { id: 'nudnosci', label: 'Nudności towarzyszące zawrotom' },
    { id: 'utrata_sily_chwytu', label: 'Osłabienie siły ręki (wypadanie przedmiotów)' },
    { id: 'dretwienie_obu_rak', label: 'Drętwienie jednoczesne obu rąk' },
    { id: 'sztywnosc_poranna', label: 'Silna sztywność poranna karku > 30 min' }
  ];

  const toggleTrigger = (id: string) => {
    setTriggers(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const toggleSymptom = (id: string) => {
    setAssociatedSymptoms(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const runAnalysis = () => {
    const result = analyzePainSymptomsOffline({
      vasScore,
      region: selectedRegion,
      character,
      triggers,
      associatedSymptoms,
      stressLevel,
      mood,
      psychosomaticNotes: psychosomaticNotes.trim() || undefined
    });
    setAnalysisResult(result);
    setIsSaved(false);
  };

  const saveToMedicalHistory = () => {
    if (!analysisResult) return;
    const newReport: PainReport = {
      id: 'report-' + Date.now(),
      date: new Date().toISOString(),
      vasScore,
      region: selectedRegion,
      character,
      triggers,
      associatedSymptoms,
      reliefPositions: analysisResult.immediateReliefAdvice,
      stressLevel,
      mood,
      psychosomaticNotes: psychosomaticNotes.trim() || undefined,
      aiAnalysis: analysisResult
    };
    onSaveReport(newReport);
    setIsSaved(true);
  };

  return (
    <div id="pain-analyzer-view" className="space-y-8 max-w-5xl mx-auto">
      {/* View Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Prywatności na Urządzeniu • Zero zewnętrznych API • 0 zł</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Kinezjologiczna Analiza Bólu Szyi & Kręgosłupa
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
              Zgłoś bieżące dolegliwości. Lokalny algorytm kinezjologiczny przeanalizuje dermatomy, zweryfikuje Czerwone Flagi (Red Flags) i wskaże natychmiastowe pozycje odciążające.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="view-history-btn"
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
            >
              <History className="w-4 h-4" />
              <span>Historia ({painHistory.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* History Drawer if toggled */}
      {showHistory && (
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-teal-500" />
              Zarejestrowane zgłoszenia bólowe
            </h3>
            <span className="text-xs text-slate-500">Zapisane lokalnie w pamięci przeglądarki</span>
          </div>

          {painHistory.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">Brak zapisanych zgłoszeń bólowych.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {painHistory.map((rep) => (
                <div key={rep.id} className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-900 dark:text-white">{new Date(rep.date).toLocaleDateString('pl-PL')}</span>
                    <div className="flex items-center gap-1.5">
                      {rep.mood && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                          {MOOD_OPTIONS.find(m => m.id === rep.mood)?.emoji || '😐'} {MOOD_OPTIONS.find(m => m.id === rep.mood)?.label || rep.mood}
                        </span>
                      )}
                      {rep.stressLevel !== undefined && (
                        <span className={`px-2 py-0.5 rounded-full font-mono font-bold ${
                          rep.stressLevel <= 3 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300' 
                            : rep.stressLevel <= 6
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                        }`}>
                          Stres: {rep.stressLevel}/10
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full font-mono ${rep.vasScore > 5 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {rep.vasScore}/10 VAS
                      </span>
                    </div>
                  </div>
                  <div className="text-teal-600 dark:text-teal-400 font-medium">{rep.aiAnalysis.primarySuspicion}</div>
                  <p className="text-slate-600 dark:text-slate-300 line-clamp-2">{rep.aiAnalysis.explanation}</p>
                  {rep.psychosomaticNotes && (
                    <div className="flex items-start gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 italic">
                      <MessageSquare className="w-3 h-3 text-teal-600 shrink-0 mt-0.5" />
                      <span>„{rep.psychosomaticNotes}”</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Interactive Questionnaire Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Input Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Body Map & Region Selector */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              1. Wskaż dominujące miejsce dolegliwości:
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'neck', label: 'Szyja / Kark', desc: 'Podstawa karku C4-C7' },
                { id: 'nape', label: 'Potylica & Kark', desc: 'Przejście szyjno-czaszkowe C1-C3' },
                { id: 'radiating_arm', label: 'Promieniowanie do ręki', desc: 'Barks, ramię, drętwienie dłoni' },
                { id: 'shoulder_blade', label: 'Między łopatkami', desc: 'Górny odcinek piersiowy' },
                { id: 'headache', label: 'Ból głowy od szyi', desc: 'Ból potyliczno-skroniowy' },
                { id: 'lower_back', label: 'Dolne plecy (Lędźwie)', desc: 'Rejon L4-S1 od siedzenia' }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedRegion(item.id as PainReport['region'])}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedRegion === item.id
                      ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/60 dark:border-teal-500 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className={`font-bold text-xs ${selectedRegion === item.id ? 'text-teal-700 dark:text-teal-300' : 'text-slate-800 dark:text-slate-200'}`}>
                    {item.label}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: VAS Pain Scale */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                2. Natężenie bólu w skali VAS (0 - 10):
              </h3>
              <span className={`text-2xl font-black font-mono ${
                vasScore <= 3 ? 'text-emerald-500' : vasScore <= 6 ? 'text-amber-500' : 'text-rose-500'
              }`}>
                {vasScore} / 10
              </span>
            </div>

            <input
              id="analyzer-vas-slider"
              type="range"
              min="0"
              max="10"
              step="1"
              value={vasScore}
              onChange={(e) => setVasScore(Number(e.target.value))}
              className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />

            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mt-2">
              <span>0 (Brak bólu)</span>
              <span>4-5 (Uciążliwy przy pracy)</span>
              <span>8-10 (Ostry, uniemożliwia ruch)</span>
            </div>
          </div>

          {/* Step 3: Character of pain */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              3. Charakter odczuwanego bólu:
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {[
                { id: 'stiff', label: 'Sztywność' },
                { id: 'dull', label: 'Tępy / Zmęczeniowy' },
                { id: 'sharp', label: 'Ostry / Kłujący' },
                { id: 'burning', label: 'Piekący' },
                { id: 'throbbing', label: 'Pulsujący' }
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCharacter(c.id as PainReport['character'])}
                  className={`py-2 px-2.5 rounded-xl text-xs font-semibold border text-center transition-colors ${
                    character === c.id
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 4: Triggers & Associated Symptoms */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                4. Czynniki zaostrzające:
              </h3>
              <div className="flex flex-wrap gap-2">
                {triggerOptions.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTrigger(t.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      triggers.includes(t.id)
                        ? 'border-teal-500 bg-teal-500 text-white'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 5: Psychosomatic Factors & Stress Level */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Brain className="w-4 h-4 text-teal-600" />
                  <span>5. Czynniki psychosomatyczne & nastrój:</span>
                </h3>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Korelacja ból-emocje</span>
              </div>

              {/* Stress Slider */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-amber-500" />
                    Poziom stresu i napięcia psychicznego (1 - 10):
                  </span>
                  <span className={`text-xs font-black font-mono px-2.5 py-0.5 rounded-full ${
                    stressLevel <= 3 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                      : stressLevel <= 6
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                  }`}>
                    {stressLevel} / 10 • {stressLevel <= 3 ? 'Niski' : stressLevel <= 6 ? 'Umiarkowany' : 'Wysoki'}
                  </span>
                </div>

                <input
                  id="pain-stress-slider"
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={stressLevel}
                  onChange={(e) => setStressLevel(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />

                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>1-3: Spokój / Relaks</span>
                  <span>4-6: Standardowy dzień</span>
                  <span>7-10: Silny stres / Presja</span>
                </div>
              </div>

              {/* Mood Selection */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                  Nastrój i stan psychiczny w tej chwili:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {MOOD_OPTIONS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMood(m.id)}
                      className={`p-2.5 rounded-2xl border text-left transition-all ${
                        mood === m.id
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/80 text-teal-900 dark:text-teal-200 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <span>{m.emoji}</span>
                        <span>{m.label}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Psychosomatic Note */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Notatka o nastroju i źródłach stresu (opcjonalna):
                </label>
                <textarea
                  id="pain-psychosomatic-notes"
                  rows={2}
                  value={psychosomaticNotes}
                  onChange={(e) => setPsychosomaticNotes(e.target.value)}
                  placeholder="np. trudny projekt z deadlinem, zła noc z powodu karku, presja w pracy, spięte barki po wideokonferencjach..."
                  className="w-full px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                6. Objawy towarzyszące i neurologiczne:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {symptomOptions.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSymptom(s.id)}
                    className={`p-2.5 rounded-xl border text-xs text-left transition-colors flex items-center justify-between ${
                      associatedSymptoms.includes(s.id)
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <span>{s.label}</span>
                    <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      associatedSymptoms.includes(s.id) ? 'bg-teal-600 border-teal-600 text-white text-[9px]' : 'border-slate-300'
                    }`}>
                      {associatedSymptoms.includes(s.id) ? '✓' : ''}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Run Analysis CTA */}
            <div className="pt-3">
              <button
                id="run-ai-pain-analysis-btn"
                type="button"
                onClick={runAnalysis}
                className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-md hover:shadow-teal-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Przeprowadź analizę kinezjologiczną (On-Device)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Output: Clinical Triage Results (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {analysisResult ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-md space-y-6 animate-fade-in sticky top-20">
              {/* Triage Urgency Header */}
              <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
                analysisResult.riskLevel === 'high_consult_doctor'
                  ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
                  : analysisResult.riskLevel === 'moderate'
                  ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200'
                  : 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200'
              }`}>
                {analysisResult.riskLevel === 'high_consult_doctor' ? (
                  <ShieldAlert className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
                ) : analysisResult.riskLevel === 'moderate' ? (
                  <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                ) : (
                  <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider">
                    {analysisResult.riskLevel === 'high_consult_doctor' ? 'WYMAGANA KONSULTACJA LEKARSKA' : analysisResult.riskLevel === 'moderate' ? 'STAN PODOSTRY / OBSERWACJA' : 'STAN BEZPIECZNY DO ĆWICZEŃ'}
                  </div>
                  <div className="text-sm font-black mt-0.5">
                    {analysisResult.primarySuspicion}
                  </div>
                </div>
              </div>

              {/* Psychosomatic Profile Summary */}
              <div className="p-3.5 rounded-2xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-900/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Czynniki psychosomatyczne:
                  </span>
                  <span className="font-bold text-teal-800 dark:text-teal-200">
                    {MOOD_OPTIONS.find(m => m.id === mood)?.emoji} {MOOD_OPTIONS.find(m => m.id === mood)?.label}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded-full font-mono font-bold text-[11px] ${
                  stressLevel <= 3 
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : stressLevel <= 6
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}>
                  Stres: {stressLevel}/10
                </span>
              </div>

              {/* Red Flags Alert if detected */}
              {analysisResult.redFlagsDetected.length > 0 && (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 text-xs text-rose-700 dark:text-rose-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-rose-600">
                    <AlertTriangle className="w-4 h-4" />
                    Czerwone Flagi (Alarmowe objawy neurologiczne):
                  </div>
                  <ul className="list-disc list-inside space-y-1 pt-1">
                    {analysisResult.redFlagsDetected.map((rf, i) => (
                      <li key={i}>{rf}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Dermatome Mapping */}
              {analysisResult.dermatomeAffected && (
                <div className="p-3.5 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-2xl text-xs text-sky-900 dark:text-sky-200">
                  <span className="font-bold">Segmentacja kinezjologiczna: </span>
                  {analysisResult.dermatomeAffected}
                </div>
              )}

              {/* Pathomechanism Explanation */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Wyjaśnienie biomechaniczne:
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {analysisResult.explanation}
                </p>
              </div>

              {/* Immediate Relief Advice */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Natychmiastowe pozycje odciążające (Ulga):
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {analysisResult.immediateReliefAdvice.map((adv, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-emerald-50/50 dark:bg-emerald-950/20 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{adv}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Exercises CTA */}
              {analysisResult.recommendedExercises.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Zalecane ćwiczenia łagodzące:
                  </h4>
                  <div className="space-y-1.5">
                    {analysisResult.recommendedExercises.map(exId => {
                      const exObj = EXERCISES.find(e => e.id === exId);
                      if (!exObj) return null;
                      return (
                        <button
                          key={exId}
                          type="button"
                          onClick={() => onOpenExercise(exObj)}
                          className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 text-left text-xs transition-colors group"
                        >
                          <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-teal-600">
                            {exObj.polishName}
                          </span>
                          <Play className="w-3.5 h-3.5 text-teal-600" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Save or PDF Export */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  id="save-report-history-btn"
                  type="button"
                  onClick={saveToMedicalHistory}
                  disabled={isSaved}
                  className={`w-full py-3 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 ${
                    isSaved
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSaved ? 'Zapisano w lokalnej historii medycznej ✓' : 'Zapisz wynik w karcie pacjenta'}</span>
                </button>

                <button
                  id="go-to-pdf-from-triage-btn"
                  type="button"
                  onClick={onNavigateToPdf}
                  className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-4 h-4 text-teal-600" />
                  <span>Przejdź do eksportu raportu PDF dla lekarza</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center flex flex-col items-center justify-center min-h-[380px]">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-3">
                <Stethoscope className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Gotowy do analizy kinezjologicznej
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                Wybierz miejsce bólu, natężenie w skali VAS i kliknij przycisk analizy, aby otrzymać bezpieczne rekomendacje fizjoterapeutyczne.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
