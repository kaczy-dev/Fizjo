import React, { useState } from 'react';
import { 
  Calendar, CheckCircle2, Clock, Play, RotateCcw, 
  Sparkles, Target, Settings, ChevronRight, Activity, Award, Pill, Video, ExternalLink, ShieldCheck, Brain, AlertCircle 
} from 'lucide-react';
import { TrainingPlan, Exercise, TrainingDay, PainReport, UserHealthProfile, ReminderConfig, Medication } from '../types';
import { EXERCISES } from '../data/exercises';
import { generateAIPersonalizedPlan } from '../services/trainingPlan';

interface Props {
  plan: TrainingPlan;
  onUpdatePlan: (newPlan: TrainingPlan) => void;
  onStartDaySession: (day: TrainingDay, exercises: Exercise[]) => void;
  onOpenExerciseDetails: (exercise: Exercise) => void;
  painHistory?: PainReport[];
  profile?: UserHealthProfile;
  medications?: Medication[];
  reminders?: ReminderConfig;
}

export const TrainingPlanView: React.FC<Props> = ({
  plan,
  onUpdatePlan,
  onStartDaySession,
  onOpenExerciseDetails,
  painHistory = [],
  profile,
  medications = [],
  reminders
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);

  // Questionnaire local state for regenerating plan
  const [problem, setProblem] = useState<string>(plan.primaryProblem || 'tech_neck');
  const [workType, setWorkType] = useState<'desk' | 'physical' | 'mixed'>(plan.workType || 'desk');
  const [dailyMinutes, setDailyMinutes] = useState<number>(plan.dailyMinutes || 10);

  const selectedDay = plan.days[selectedDayIndex] || plan.days[0];
  const selectedDayExercises = EXERCISES.filter(e => selectedDay.exerciseIds.includes(e.id));

  const completedCount = plan.days.filter(d => d.completed).length;
  const progressPercent = Math.round((completedCount / plan.days.length) * 100);

  const defaultProfile: UserHealthProfile = profile || {
    name: 'Pacjent',
    birthYear: 1990,
    gender: 'other',
    pinLockEnabled: false,
    isUnlocked: true,
    theme: 'light',
    diagnoses: [],
    notes: '',
    streakDays: 0,
    lastActiveDate: '',
    totalCompletedSessions: 0,
    mobilityTests: []
  };

  const defaultReminders: ReminderConfig = reminders || {
    rehabSessionTime: '17:30',
    rehabEnabled: true,
    officeBreakIntervalMinutes: 60,
    officeBreakEnabled: true,
    medicationRemindersEnabled: true,
    motivationalTone: 'clinical'
  };

  const handleRegeneratePlan = () => {
    const newPlan = generateAIPersonalizedPlan({
      primaryProblem: problem,
      workType,
      dailyMinutes,
      baselineVas: painHistory.length > 0 ? painHistory[0].vasScore : 4,
      painHistory,
      profile: defaultProfile,
      medications,
      reminders: defaultReminders
    });
    onUpdatePlan(newPlan);
    setShowConfigModal(false);
  };

  return (
    <div id="training-plan-view" className="space-y-8 max-w-5xl mx-auto">
      {/* Plan Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-semibold mb-2">
              <Target className="w-3.5 h-3.5" />
              <span>Personalizowany Protokół Kinezjologiczny</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {plan.title}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
              {plan.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="reconfigure-plan-btn"
              type="button"
              onClick={() => setShowConfigModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Dostosuj wywiad</span>
            </button>
          </div>
        </div>

        {/* Weekly Completion Progress */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div className="sm:col-span-2 space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">
                Postęp cyklu tygodniowego: {completedCount} z {plan.days.length} sesji
              </span>
              <span className="text-teal-600 font-mono">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex justify-start sm:justify-end gap-3 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{plan.dailyMinutes} min/dzień</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Standard Gov/NFZ</span>
            </div>
          </div>
        </div>

        {/* AI Kinesiological Rationale Card */}
        {plan.aiRationale && (
          <div className="mt-6 p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 shrink-0">
              <Brain className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-900 dark:text-teal-200">
                  Uzasadnienie personalizacji AI (Analiza deterministyczna on-device)
                </span>
                <span className="text-[10px] bg-teal-200/60 dark:bg-teal-800 text-teal-800 dark:text-teal-200 font-bold px-2 py-0.5 rounded-full">
                  100% Prywatne
                </span>
              </div>
              <p className="text-xs sm:text-sm text-teal-950 dark:text-teal-200 leading-relaxed">
                {plan.aiRationale}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Daily Routine Schedule with Reminders & Medications */}
      {plan.dailySchedule && plan.dailySchedule.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Plan dnia: Przypomnienia o lekach, ćwiczeniach i przerwach
              </h3>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Synchronizacja z harmonogramem
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {plan.dailySchedule.map((item, i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-800">
                    {item.time}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    {item.category === 'medication' ? 'Leki' : item.category === 'exercise' ? 'Rehabilitacja' : 'Profilaktyka'}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  {item.category === 'medication' ? (
                    <Pill className="w-3.5 h-3.5 text-amber-500" />
                  ) : item.category === 'exercise' ? (
                    <Activity className="w-3.5 h-3.5 text-teal-500" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-sky-500" />
                  )}
                  <span>{item.title}</span>
                </h4>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7-Day Interactive Horizontal Timeline */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
        {plan.days.map((day, idx) => {
          const isSelected = selectedDayIndex === idx;
          return (
            <button
              key={day.dayIndex}
              id={`plan-day-btn-${idx}`}
              type="button"
              onClick={() => setSelectedDayIndex(idx)}
              className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between min-h-[96px] ${
                isSelected
                  ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/70 dark:border-teal-500 shadow-md ring-2 ring-teal-500/20'
                  : day.completed
                  ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Dzień {idx + 1}
                </span>
                {day.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                )}
              </div>

              <div>
                <div className={`text-xs font-bold truncate mt-1 ${isSelected ? 'text-teal-900 dark:text-teal-200' : 'text-slate-800 dark:text-slate-200'}`}>
                  {day.dayName}
                </div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400 truncate">
                  {day.exerciseIds.length} ćwiczenia
                </div>
              </div>

              {day.completed && day.prePainVas !== undefined && (
                <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  VAS: {day.prePainVas} → {day.postPainVas}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Detailed Breakdown */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
              {selectedDay.dayName} • Dzień {selectedDayIndex + 1}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {selectedDay.focusArea}
            </h2>
          </div>

          <button
            id="start-selected-day-session-btn"
            type="button"
            onClick={() => onStartDaySession(selectedDay, selectedDayExercises)}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-md hover:shadow-teal-500/25 transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{selectedDay.completed ? 'Powtórz dzisiejszą sesję' : 'Rozpocznij tę sesję'}</span>
          </button>
        </div>

        {/* Exercises List for this Day */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Zestaw ćwiczeń w dzisiejszym bloku:
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selectedDayExercises.map((exercise, index) => (
              <div
                key={exercise.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-teal-600 dark:text-teal-400 font-bold">Krok {index + 1}</span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400">{exercise.difficulty}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {exercise.polishName}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                    {exercise.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-600 dark:text-slate-400 hidden sm:inline">
                      {exercise.defaultSets}×{exercise.defaultReps}
                    </span>
                    <a
                      href={exercise.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 font-bold hover:underline"
                      title="Zobacz wideo instruktażowe na YouTube"
                    >
                      <Video className="w-3 h-3" />
                      <span>Wideo HD</span>
                    </a>
                  </div>

                  <button
                    id={`preview-plan-ex-btn-${exercise.id}`}
                    type="button"
                    onClick={() => onOpenExerciseDetails(exercise)}
                    className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    Technika →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reconfiguration Questionnaire Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Wywiad kinezjologiczny i dobór planu
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Wybierz swój profil dolegliwości, aby zregenerować plan terapeutyczny.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Dominujący problem karku/kręgosłupa:
                </label>
                <select
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                >
                  <option value="tech_neck">Wdowi garb / Tech-Neck (siedzenie przy komputerze)</option>
                  <option value="shoulder_radiating">Ból promieniujący do barku i ręki (mrowienie)</option>
                  <option value="headache">Napięciowy ból głowy od karku (potylica)</option>
                  <option value="lumbar_combo">Szyja + ból lędźwiowy (pełna oś kręgosłupa)</option>
                  <option value="prevention">Profilaktyka ogólna i wzmocnienie</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Charakter pracy dziennej:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'desk', label: 'Biurowa (PC)' },
                    { id: 'physical', label: 'Fizyczna' },
                    { id: 'mixed', label: 'Mieszana' }
                  ].map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setWorkType(w.id as 'desk' | 'physical' | 'mixed')}
                      className={`p-2 rounded-xl border text-center font-medium ${
                        workType === w.id
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Dostępny czas dzienny:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[5, 10, 20].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDailyMinutes(mins)}
                      className={`p-2 rounded-xl border text-center font-medium ${
                        dailyMinutes === mins
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {mins} minut
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Anuluj
              </button>
              <button
                id="apply-new-plan-btn"
                type="button"
                onClick={handleRegeneratePlan}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md"
              >
                Zastosuj i wygeneruj nowy plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
