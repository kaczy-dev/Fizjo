import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Send, Sparkles, AlertCircle, ShieldCheck, 
  Volume2, VolumeX, CheckCircle2, ChevronRight, HelpCircle, 
  RefreshCw, BookOpen, Dumbbell, Flame, Layers 
} from 'lucide-react';
import { Exercise } from '../types';
import { AIExpertAnswer, analyzeTechniqueOffline } from '../services/aiExpertBiomechanical';

// Web Speech API interface declarations
interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: { error: string }) => void;
  onend: () => void;
}

interface Props {
  allExercises: Exercise[];
  onSelectExercise: (exercise: Exercise) => void;
  onQuestionAsked?: () => void;
}

export const AIExpertSection: React.FC<Props> = ({
  allExercises,
  onSelectExercise,
  onQuestionAsked
}) => {
  const [query, setQuery] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentAnswer, setCurrentAnswer] = useState<AIExpertAnswer | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [recentQueries, setRecentQueries] = useState<string[]>([
    'Jak prawidłowo cofać brodę w Chin Tuck bez bólu?',
    'Czym zastąpić krążenia głową przy podejrzeniu dyskopatii?',
    'Czuję ból karku przy rozciąganiu czworobocznego – co robię źle?',
    'Jak ustawić łopatki i dłonie w pozycji Brüggera przy biurku?'
  ]);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognitionClass = 
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'pl-PL';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let transcript = '';
        for (let i = 0; i < Object.keys(event.results).length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setQuery(transcript);
        }
      };

      recognition.onerror = (e) => {
        console.warn('Speech recognition error:', e.error);
        if (e.error === 'not-allowed') {
          setSpeechError('Brak uprawnień do mikrofonu. Zezwól przeglądarce na dostęp do mikrofonu.');
        } else if (e.error === 'no-speech') {
          setSpeechError('Nie wykryto mowy. Mów wyraźnie do mikrofonu.');
        } else {
          setSpeechError('Wystąpił problem z rozpoznawaniem mowy.');
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!speechSupported) {
      setSpeechError('Twoja przeglądarka nie obsługuje dyktowania głosem. Wpisz pytanie w polu poniżej.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setSpeechError(null);
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.warn('Speech start error:', err);
        recognitionRef.current?.stop();
        setTimeout(() => recognitionRef.current?.start(), 150);
      }
    }
  };

  const handleSubmit = async (textToSubmit?: string) => {
    const q = (textToSubmit || query).trim();
    if (!q) return;

    setIsLoading(true);
    setSpeechError(null);
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }

    try {
      // 1. First attempt full-stack call to secure Express server endpoint
      const response = await fetch('/api/ai-expert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });

      if (response.ok) {
        const data = await response.json();
        if (!data.useClientFallback && data.biomechanicalModifications) {
          // Link recommended exercise if found
          let recEx = allExercises.find(e => e.id === data.recommendedExerciseId);
          if (!recEx) {
            recEx = allExercises.find(e => q.toLowerCase().includes(e.id.replace('-', ' '))) || allExercises[0];
          }

          setCurrentAnswer({
            ...data,
            recommendedExercise: recEx
          });
          onQuestionAsked?.();
          setIsLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Serwer offline lub brak połączenia – przełączanie na kliniczny silnik kinezjologii:', e);
    }

    // 2. Client-side resilient clinical biomechanics engine
    const offlineResult = analyzeTechniqueOffline(q);
    setCurrentAnswer(offlineResult);
    onQuestionAsked?.();
    setIsLoading(false);
  };

  const handleSpeakAnswer = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!currentAnswer) return;

    const textToRead = `${currentAnswer.summary}. Sugerowane modyfikacje biomechaniczne: ${currentAnswer.biomechanicalModifications.map(m => `${m.title}. ${m.correction}`).join('. ')}`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'pl-PL';
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div id="ai-expert-section" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 border border-teal-800/40 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Kliniczny Asystent Biomechaniki • Sterowanie Głosem</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Darmowa AI (0 zł) • Bez Płatnych Kluczy API</span>
            </div>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
            Ekspert AI: Korekta Techniki Ćwiczeń
          </h3>

          <p className="text-teal-100/90 text-xs sm:text-sm leading-relaxed">
            Zadaj pytanie głosowo przez mikrofon lub wpisz je w polu. Sztuczna inteligencja przeanalizuje wektory sił, wykryje nieprawidłowe kompensacje z barków lub karku i zaproponuje biomechaniczne modyfikacje ruchu.
          </p>
        </div>

        {/* Input Bar with Microphone */}
        <div className="relative z-10 mt-6 pt-4 border-t border-teal-800/50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-1">
              <input
                id="ai-expert-query-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isListening ? 'Mów teraz... Słucham Twojego pytania' : 'np. Boli mnie kark przy cofaniu brody, co robię źle?'}
                className={`w-full pl-4 pr-12 py-3.5 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-900 border transition-all shadow-inner focus:outline-hidden ${
                  isListening 
                    ? 'border-rose-500 ring-2 ring-rose-500/40 bg-rose-50/10' 
                    : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500'
                }`}
              />

              {/* Microphone Button Inside Input */}
              <button
                type="button"
                onClick={toggleListening}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                    : 'text-slate-400 hover:text-teal-600 dark:hover:text-teal-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title={isListening ? 'Zatrzymaj nagrywanie' : 'Zadaj pytanie głosem (Mikrofon)'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-6 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analizuję biomechanikę...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Zapytaj Eksperta</span>
                </>
              )}
            </button>
          </form>

          {/* Voice status feedback */}
          {isListening && (
            <div className="mt-2 flex items-center gap-2 text-xs text-rose-300 animate-pulse font-semibold">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Mikrofon aktywny: zadaj pytanie (np. &quot;Jak prawidłowo ustawić brodę w trakcie pracy?&quot;)</span>
            </div>
          )}

          {speechError && (
            <div className="mt-2 text-xs text-amber-300 flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              <span>{speechError}</span>
            </div>
          )}

          {/* Quick suggestion pills */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-teal-300/80">Szybkie pytania kliniczne:</span>
            {recentQueries.map((qText, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setQuery(qText);
                  handleSubmit(qText);
                }}
                className="px-3 py-1 rounded-xl bg-teal-900/50 hover:bg-teal-800 border border-teal-700/60 text-teal-200 text-[11px] font-medium transition-colors text-left"
              >
                {qText}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Answer Output Card */}
      {currentAnswer && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in duration-300">
          {/* Answer Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Odpowiedź Biomechaniczna Eksperta</span>
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                  <span>Darmowa AI • 0 zł</span>
                </div>
              </div>
              <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Analiza pytania: &quot;{currentAnswer.query}&quot;
              </h4>
            </div>

            {/* Read Aloud Button */}
            <button
              type="button"
              onClick={handleSpeakAnswer}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors self-start sm:self-auto cursor-pointer ${
                isSpeaking
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4 text-rose-600" /> : <Volume2 className="w-4 h-4 text-teal-600" />}
              <span>{isSpeaking ? 'Zatrzymaj lektora' : 'Odsłuchaj na głos (TTS)'}</span>
            </button>
          </div>

          {/* Clinical Summary */}
          <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/80 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
            <span className="font-bold text-teal-950 dark:text-teal-200 block mb-1">Diagnoza Biomechaniczna:</span>
            {currentAnswer.summary}
          </div>

          {/* Biomechanical Modifications Cards */}
          <div className="space-y-4">
            <h5 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Sugerowane Modyfikacje Biomechaniczne ({currentAnswer.biomechanicalModifications.length})
            </h5>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentAnswer.biomechanicalModifications.map((mod, idx) => (
                <div
                  key={idx}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <h6 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                      {mod.title}
                    </h6>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="text-slate-600 dark:text-slate-400">
                      <strong className="text-slate-900 dark:text-slate-200">Wykryty błąd / Kompensacja:</strong> {mod.issueDetected}
                    </div>

                    <div className="text-slate-600 dark:text-slate-400">
                      <strong className="text-slate-900 dark:text-slate-200">Podłoże anatomiczne:</strong> {mod.anatomicalCause}
                    </div>

                    <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 text-teal-950 dark:text-teal-200 font-medium">
                      <strong>Korekta techniki:</strong> {mod.correction}
                    </div>

                    <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-700 dark:text-slate-300">
                      <span className="text-teal-600 font-bold">Komenda (Cueing):</span> &quot;{mod.cuePrompt}&quot;
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Safety Warnings & Red Flags */}
          {currentAnswer.safetyWarnings && currentAnswer.safetyWarnings.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Środki Ostrożności & Bezpieczeństwo Kliniczne:</span>
              </div>
              <ul className="list-disc list-inside text-amber-800 dark:text-amber-300 space-y-1 pl-1">
                {currentAnswer.safetyWarnings.map((warn, wIdx) => (
                  <li key={wIdx}>{warn}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended Exercise Link */}
          {currentAnswer.recommendedExercise && (
            <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400 block tracking-wider">
                    Sugerowane Ćwiczenie Korygujące
                  </span>
                  <h6 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                    {currentAnswer.recommendedExercise.polishName}
                  </h6>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectExercise(currentAnswer.recommendedExercise!)}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer active:scale-95"
              >
                <span>Otwórz Instruktaż Wideo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
