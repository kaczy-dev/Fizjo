import React, { useState } from 'react';
import { 
  MessageSquare, Send, CheckCircle2, AlertCircle, 
  X, HeartHandshake, Copy, Check, Sparkles 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { EXERCISES } from '../data/exercises';
import { ClinicalFeedback, Exercise } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  preselectedExercise?: Exercise | null;
  onSaveFeedback?: (feedback: ClinicalFeedback) => void;
}

export const ClinicalFeedbackModal: React.FC<Props> = ({
  isOpen,
  onClose,
  preselectedExercise,
  onSaveFeedback
}) => {
  const [category, setCategory] = useState<ClinicalFeedback['category']>(
    preselectedExercise ? 'exercise_pain' : 'general'
  );
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(
    preselectedExercise?.id || ''
  );
  const [message, setMessage] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [isSent, setIsSent] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const matchedEx = EXERCISES.find(e => e.id === selectedExerciseId);

    const feedbackObj: ClinicalFeedback = {
      id: `feedback-${Date.now()}`,
      date: new Date().toISOString(),
      category,
      exerciseId: selectedExerciseId || undefined,
      exerciseName: matchedEx ? matchedEx.polishName : undefined,
      message: message.trim(),
      userEmail: userEmail.trim() || undefined
    };

    if (onSaveFeedback) {
      onSaveFeedback(feedbackObj);
    }

    // Save to local feedback storage for persistence
    try {
      const stored = localStorage.getItem('fizjo_user_feedbacks');
      const list = stored ? JSON.parse(stored) : [];
      list.unshift(feedbackObj);
      localStorage.setItem('fizjo_user_feedbacks', JSON.stringify(list.slice(0, 50)));
    } catch {
      // fallback
    }

    setIsSent(true);
    setTimeout(() => {
      // auto reset or close after 2.5s
    }, 2500);
  };

  const handleSendViaMailClient = () => {
    const matchedEx = EXERCISES.find(e => e.id === selectedExerciseId);
    const categoryLabel = 
      category === 'exercise_pain' ? 'Ból / dyskomfort przy ćwiczeniu' :
      category === 'video_instruction' ? 'Niejasna instrukcja / wideo' :
      category === 'bug_issue' ? 'Błąd techniczny w aplikacji' :
      category === 'feature_request' ? 'Sugestia nowej funkcji' : 'Opinia ogólna';

    const subject = encodeURIComponent(`[FizjoSzyja Feedback] ${categoryLabel}${matchedEx ? ` - ${matchedEx.polishName}` : ''}`);
    const body = encodeURIComponent(
      `Kategoria: ${categoryLabel}\n` +
      `${matchedEx ? `Ćwiczenie: ${matchedEx.polishName} (ID: ${matchedEx.id})\n` : ''}` +
      `Wiadomość pacjenta:\n${message}\n\n` +
      `Adres e-mail do odpowiedzi: ${userEmail || 'Nie podano'}\n` +
      `Data wysłania: ${new Date().toLocaleString('pl-PL')}`
    );

    window.open(`mailto:kaczyx@gmail.com?subject=${subject}&body=${body}`, '_blank');
  };

  const handleCopyFeedback = () => {
    const matchedEx = EXERCISES.find(e => e.id === selectedExerciseId);
    const text = `FEEDBACK FIZJOSZYJA:\nKategoria: ${category}\nĆwiczenie: ${matchedEx ? matchedEx.polishName : 'Brak'}\nTreść: ${message}\nKontakt: ${userEmail || 'Brak'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Zamknij okno"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs font-semibold text-teal-200 uppercase tracking-wider mb-1">
            <HeartHandshake className="w-4 h-4 text-emerald-400" />
            <span>Głos Pacjenta & Zapewnienie Jakości</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Zgłoś uwagę lub błąd fizjoterapeutyczny
          </h2>
          <p className="text-xs sm:text-sm text-teal-100/90 mt-1">
            Twoje uwagi pomagają nam eliminować błędy i dbać o maksymalne bezpieczeństwo rehabilitacji karku.
          </p>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6">
          {isSent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 text-center space-y-4"
            >
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Dziękujemy za Twoją opinię!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                  Zgłoszenie zostało zapisane w rejestrze jakości. Możesz również bezpośrednio przesłać je e-mailem do twórcy.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={handleSendViaMailClient}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Wyślij e-mail do twórcy (kaczyx@gmail.com)</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Zamknij okno
                </button>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Czego dotyczy Twoja uwaga?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'exercise_pain', label: 'Ból przy ćwiczeniu' },
                    { id: 'video_instruction', label: 'Niejasna instrukcja' },
                    { id: 'bug_issue', label: 'Błąd techniczny' },
                    { id: 'feature_request', label: 'Nowy pomysł / funkcja' },
                    { id: 'general', label: 'Inna uwaga' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id as any)}
                      className={`p-2 rounded-xl border text-left font-medium transition-all text-[11px] ${
                        category === cat.id
                          ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-200 font-bold shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Related Exercise (if applicable) */}
              {(category === 'exercise_pain' || category === 'video_instruction') && (
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Wybierz ćwiczenie, którego dotyczy zgłoszenie:
                  </label>
                  <select
                    value={selectedExerciseId}
                    onChange={(e) => setSelectedExerciseId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="">-- Wybierz z bazy (lub zostaw puste) --</option>
                    {EXERCISES.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.polishName} ({ex.difficulty})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Message */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Opisz swoje spostrzeżenia lub dyskomfort: <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="np. W ćwiczeniu retrakcji brody nie jest jasne, czy głowa ma się unosić ku górze, czy cofać w linii poziomej..."
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* Optional Email */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Twój e-mail (opcjonalny, jeśli chcesz otrzymać odpowiedź):
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="np. twoj.email@domena.pl"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* Notice */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400">
                <AlertCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  Wszystkie zgłoszenia są anonimowe, chyba że zdecydujesz się podać e-mail do kontaktu. Nie gromadzimy danych sprzętowych ani lokalizacji.
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyFeedback}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Skopiowano' : 'Kopiuj'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSendViaMailClient}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-teal-200 dark:border-teal-800/80 text-teal-700 dark:text-teal-300 text-xs font-semibold hover:bg-teal-50 dark:hover:bg-teal-950/50 transition-colors"
                    title="Otwórz klienta poczty e-mail"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>E-mail</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!message.trim()}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all ${
                    message.trim()
                      ? 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-600/25 cursor-pointer'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>Zapisz zgłoszenie</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
