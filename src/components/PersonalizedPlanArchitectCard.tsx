import React, { useState, useMemo } from 'react';
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  TrendingDown,
  Database,
  History,
  Play,
  FileJson,
  Download,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  Compass,
  Clock,
  Eye
} from 'lucide-react';
import {
  TrainingPlan,
  PainReport,
  UserHealthProfile,
  ReminderConfig,
  Medication,
  Exercise,
  ExerciseSessionHistoryEntry
} from '../types';
import {
  generateAIPersonalizedPlan,
  computeUserRehabProgressSummary,
  createDefaultExerciseHistory
} from '../services/trainingPlan';
import { EXERCISES } from '../data/exercises';

interface Props {
  plan: TrainingPlan;
  painHistory: PainReport[];
  profile: UserHealthProfile;
  reminders: ReminderConfig;
  medications: Medication[];
  onUpdatePlan: (newPlan: TrainingPlan) => void;
  onOpenExerciseDetails: (exercise: Exercise) => void;
}

const DIAGNOSIS_PRESETS = [
  'Dyskopatia szyjna C5-C7',
  'Zespół skrzyżowania górnego (Tech-Neck)',
  'Rwa barkowa / Podrażnienie korzeniowe',
  'Szyjno-pochodne bóle głowy (C0-C2)',
  'Zniesienie lordozy szyjnej',
  'Przeciążenie lędźwiowo-krzyżowe L4-S1'
];

export const PersonalizedPlanArchitectCard: React.FC<Props> = ({
  plan,
  painHistory,
  profile,
  reminders,
  medications,
  onUpdatePlan,
  onOpenExerciseDetails
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'personalization' | 'history' | 'schema'>(
    'personalization'
  );

  // Interactive clinical inputs initialized from current patient state
  const latestReport = painHistory.length > 0 ? painHistory[0] : null;
  const [simulatedVas, setSimulatedVas] = useState<number>(latestReport?.vasScore ?? 4);
  const [selectedRegion, setSelectedRegion] = useState<PainReport['region']>(
    latestReport?.region ?? 'neck'
  );
  const [selectedCharacter, setSelectedCharacter] = useState<PainReport['character']>(
    latestReport?.character ?? 'stiff'
  );
  const [selectedDiagnoses, setSelectedDiagnoses] = useState<string[]>(
    profile.diagnoses && profile.diagnoses.length > 0
      ? profile.diagnoses
      : ['Zespół skrzyżowania górnego (Tech-Neck)']
  );
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>('session-hist-1');
  const [copiedSchema, setCopiedSchema] = useState<boolean>(false);

  // Ensure diagnostic is always available (compute on-the-fly if plan was loaded from older storage)
  const diagnostic = useMemo(() => {
    if (plan.personalizationDiagnostic) {
      return plan.personalizationDiagnostic;
    }
    const synthesized = generateAIPersonalizedPlan({
      painHistory,
      profile,
      reminders,
      medications,
      primaryProblem: plan.primaryProblem,
      workType: plan.workType,
      dailyMinutes: plan.dailyMinutes,
      baselineVas: simulatedVas
    });
    return synthesized.personalizationDiagnostic!;
  }, [plan, painHistory, profile, reminders, medications, simulatedVas]);

  // Exercise Session History & Longitudinal Progress Summary
  const exerciseHistory: ExerciseSessionHistoryEntry[] = useMemo(() => {
    if (profile.exerciseHistory && profile.exerciseHistory.length > 0) {
      return profile.exerciseHistory;
    }
    return createDefaultExerciseHistory(plan.id);
  }, [profile.exerciseHistory, plan.id]);

  const progressSummary = useMemo(() => {
    return computeUserRehabProgressSummary(profile, exerciseHistory);
  }, [profile, exerciseHistory]);

  const handleToggleDiagnosis = (diag: string) => {
    setSelectedDiagnoses((prev) =>
      prev.includes(diag) ? prev.filter((d) => d !== diag) : [...prev, diag]
    );
  };

  const handleApplyClinicalPersonalization = () => {
    const primaryProblem =
      selectedRegion === 'radiating_arm' || selectedCharacter === 'burning'
        ? 'shoulder_radiating'
        : selectedRegion === 'headache'
        ? 'headache'
        : selectedRegion === 'lower_back'
        ? 'lumbar_combo'
        : 'tech_neck';

    const newPlan = generateAIPersonalizedPlan({
      painHistory,
      profile: {
        ...profile,
        diagnoses: selectedDiagnoses
      },
      reminders,
      medications,
      primaryProblem,
      workType: plan.workType,
      dailyMinutes: plan.dailyMinutes,
      baselineVas: simulatedVas,
      customDiagnoses: selectedDiagnoses,
      customPainCharacter: selectedCharacter,
      customPainRegion: selectedRegion
    });

    onUpdatePlan(newPlan);
  };

  const handleExportHistoryJson = () => {
    const exportPayload = {
      schemaVersion: '2.0-clinical-rehab',
      exportedAt: new Date().toISOString(),
      patientHealthContext: {
        birthYear: profile.birthYear,
        diagnoses: selectedDiagnoses,
        latestMobilityTest: profile.mobilityTests?.[0] || null,
        ergonomicCervicalLoadKg: profile.ergonomicAudit?.estimatedCervicalLoadKg ?? 14
      },
      activePersonalizedPlan: {
        id: plan.id,
        title: plan.title,
        adaptedLevel: plan.adaptedLevel,
        personalizationDiagnostic: diagnostic
      },
      progressSummary,
      exerciseSessionHistory: exerciseHistory
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historia-rehabilitacji-i-plan-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySchemaJson = () => {
    const sample = {
      personalizationDiagnostic: diagnostic,
      progressSummary,
      recentSessionEntry: exerciseHistory[0]
    };
    navigator.clipboard?.writeText(JSON.stringify(sample, null, 2)).catch(() => {});
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 3000);
  };

  return (
    <section
      id="personalized-plan-architect-module"
      className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6"
    >
      {/* Top Section Header & 3-Zone Segmented Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
            Silnik Decyzyjny Kinezjoterapii · Analiza Bólu i Stanu Zdrowia
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
            Architektura Personalizacji i Historii Postępów
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
            Moduł łączy bieżące raporty bólowe (skala VAS, lokalizacja, charakter) z profilem klinicznym pacjenta (diagnozy, CROM, ergonomia), dobierając optymalny zestaw ćwiczeń i rejestrując historię wykonania.
          </p>
        </div>

        {/* Segmented Control Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/90 rounded-xl self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('personalization')}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              activeSubTab === 'personalization'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Dobór Ćwiczeń & Analiza</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('history')}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              activeSubTab === 'history'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Historia i Postępy ({exerciseHistory.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('schema')}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              activeSubTab === 'schema'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Struktura Danych</span>
          </button>
        </div>
      </div>

      {/* TAB 1: CLINICAL PERSONALIZATION & OPTIMAL EXERCISE SELECTION */}
      {activeSubTab === 'personalization' && (
        <div className="space-y-6">
          {/* Interactive Pain & Health Input Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            {/* Left Column: Pain Profile Parameters */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>1. Parametry dolegliwości bólowych</span>
                </h3>
                <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                  Bieżący VAS: {simulatedVas}/10 · Średnia 7d: {diagnostic.avgVasLast7Days}/10
                </span>
              </div>

              {/* VAS Slider */}
              <div>
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1.5">
                  <span>Nasilenie bólu przy doborze (0–10 VAS):</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {simulatedVas <= 3
                      ? 'Łagodny (Wzmacnianie)'
                      : simulatedVas <= 6
                      ? 'Umiarkowany (Mobilizacja)'
                      : 'Ostry ≥7 (Ochrona Antalgiczna)'}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={simulatedVas}
                  onChange={(e) => setSimulatedVas(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
              </div>

              {/* Pain Region & Character Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Dominująca lokalizacja bólu:
                  </label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value as PainReport['region'])}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="neck">Kark centralnie (C3–C7)</option>
                    <option value="radiating_arm">Promieniowanie do barku / ręki</option>
                    <option value="headache">Potylica i skronie (Ból głowy C0–C2)</option>
                    <option value="shoulder_blade">Między łopatkami (Th1–Th8)</option>
                    <option value="lower_back">Odcinek lędźwiowy + Szyja (L4–S1)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Charakter odczuwanego bólu:
                  </label>
                  <select
                    value={selectedCharacter}
                    onChange={(e) =>
                      setSelectedCharacter(e.target.value as PainReport['character'])
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="stiff">Sztywność poranna / Napięciowy</option>
                    <option value="dull">Tępy / Przeciążeniowy po pracy</option>
                    <option value="burning">Piekący / Mrowienie (Neurogenny)</option>
                    <option value="sharp">Ostry / Kłujący przy ruchu</option>
                    <option value="throbbing">Pulsujący (Naczyniowo-napięciowy)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right Column: Health Profile & Diagnoses */}
            <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                  <Stethoscope className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>2. Stan zdrowia, rozpoznania i czynniki biomechaniczne</span>
                </h3>

                <div className="flex flex-wrap gap-1.5">
                  {DIAGNOSIS_PRESETS.map((diag) => {
                    const active = selectedDiagnoses.includes(diag);
                    return (
                      <button
                        key={diag}
                        type="button"
                        onClick={() => handleToggleDiagnosis(diag)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                          active
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-500/50'
                        }`}
                      >
                        {active ? '✓ ' : '+ '}
                        {diag}
                      </button>
                    );
                  })}
                </div>

                {/* Detected Health Risk Factors from Profile */}
                <div className="mt-3 pt-3 border-t border-slate-200/70 dark:border-slate-700/70 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                  {diagnostic.healthRiskFactors.map((rf, i) => (
                    <div key={i}>· {rf}</div>
                  ))}
                </div>
              </div>

              <button
                id="generate-optimal-exercise-set-btn"
                type="button"
                onClick={handleApplyClinicalPersonalization}
                className="min-h-[44px] w-full px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Wygeneruj Optymalny Zestaw Ćwiczeń dla Tego Profilu</span>
              </button>
            </div>
          </div>

          {/* Clinical Phenotype Classification Summary Banner */}
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-teal-600 dark:text-teal-400">
                  Zidentyfikowany fenotyp kliniczny
                </span>
                <span aria-hidden="true">·</span>
                <span>{diagnostic.progressionPhaseLabelPl}</span>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {diagnostic.phenotypeLabelPl}
              </h4>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono tabular-nums shrink-0">
              <div>
                <span className="text-slate-400 block text-[10px]">Dobrane ćwiczenia</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {diagnostic.prescribedExercises.length} celowanych
                </span>
              </div>
              <div className="h-7 w-px bg-slate-200 dark:bg-slate-800" />
              <div>
                <span className="text-slate-400 block text-[10px]">Wykluczone (BHP)</span>
                <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                  {diagnostic.excludedExercisesWithReasons.length} przeciwwskazane
                </span>
              </div>
            </div>
          </div>

          {/* Optimal Prescribed Exercise Set with Custom Dosing & Rationale */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Wygenerowany optymalny zestaw ćwiczeń i dawkowanie indywidualne
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Kliknij ćwiczenie, aby otworzyć Wideo HD z HUD
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {diagnostic.prescribedExercises.map((rx, index) => {
                const fullExercise = EXERCISES.find((e) => e.id === rx.exerciseId);
                return (
                  <div
                    key={rx.exerciseId}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-teal-600 dark:text-teal-400">
                          0{index + 1}. {rx.priorityLabelPl}
                        </span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                          {rx.prescribedSets} serie × {rx.prescribedReps} powt. · {rx.prescribedHoldSeconds}s hold · Tempo {rx.prescribedTempo}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {rx.exerciseName}
                      </h4>

                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        <strong>Cel kliniczny:</strong> {rx.selectionReason}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        <strong>Adaptacja dawki:</strong> {rx.safetyModification}
                      </p>
                    </div>

                    {fullExercise && (
                      <div className="pt-2 border-t border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Poziom: {fullExercise.difficulty}
                        </span>
                        <button
                          type="button"
                          onClick={() => onOpenExerciseDetails(fullExercise)}
                          className="min-h-[36px] px-3 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-teal-500 text-xs font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Wideo HD & Technika</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Excluded Contraindicated Exercises */}
          {diagnostic.excludedExercisesWithReasons.length > 0 && (
            <div className="p-4 rounded-2xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Automatyczna blokada przeciwwskazań (Wykluczone z planu dla bezpieczeństwa):
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {diagnostic.excludedExercisesWithReasons.map((ex) => (
                  <div
                    key={ex.exerciseId}
                    className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-amber-200/60 dark:border-amber-900/40 text-xs"
                  >
                    <div className="font-bold text-rose-700 dark:text-rose-400">
                      ✗ {ex.exerciseName}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                      {ex.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LONGITUDINAL EXERCISE HISTORY & USER PROGRESS */}
      {activeSubTab === 'history' && (
        <div className="space-y-6">
          {/* Top Aggregated Progress KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Średnia redukcja bólu / sesję
              </span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tabular-nums mt-1">
                -{progressSummary.meanVasReductionPerSession} pkt VAS
              </div>
              <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                Śr. przed: {progressSummary.meanPreSessionVas} → po: {progressSummary.meanPostSessionVas}
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Łączna objętość ćwiczeń
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums mt-1">
                {progressSummary.totalRepsCompleted} powt.
              </div>
              <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                {progressSummary.totalIsometricMinutes} min czystej izometrii
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Poprawa zakresu CROM
              </span>
              <div className="text-2xl font-black text-teal-600 dark:text-teal-400 font-mono tabular-nums mt-1">
                +{progressSummary.cromRotationImprovementDeg}°
              </div>
              <span className="text-[11px] text-slate-500">
                Rotacja odcinka szyjnego C1–C7
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Adherencja (30 dni)
              </span>
              <div className="text-2xl font-black text-sky-600 dark:text-sky-400 font-mono tabular-nums mt-1">
                {progressSummary.adherence30DayPercent}%
              </div>
              <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                Passa: {progressSummary.currentStreakDays} dni (rekord {progressSummary.longestStreakDays}d)
              </span>
            </div>
          </div>

          {/* Per-Exercise Mastery Matrix */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Poziom opanowania i kumulacja objętości według ćwiczenia (`exerciseMasteryById`)
            </h3>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <th className="py-2.5 px-3.5 font-semibold">Ćwiczenie</th>
                    <th className="py-2.5 px-3 font-semibold">Sesje</th>
                    <th className="py-2.5 px-3 font-semibold">Wykonane serie / powt.</th>
                    <th className="py-2.5 px-3 font-semibold">Czas izometrii</th>
                    <th className="py-2.5 px-3 font-semibold">Śr. ulga VAS</th>
                    <th className="py-2.5 px-3.5 font-semibold">Stopień adaptacji</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono tabular-nums">
                  {Object.values(progressSummary.exerciseMasteryById).map((m) => (
                    <tr
                      key={m.exerciseId}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-2.5 px-3.5 font-sans font-bold text-slate-900 dark:text-white">
                        {m.exerciseName}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                        {m.sessionsCount}×
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                        {m.totalSetsCompleted} serii · {m.totalRepsCompleted} powt.
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                        {m.totalIsometricHoldSeconds} s
                      </td>
                      <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-bold">
                        {m.avgVasDelta} pkt
                      </td>
                      <td className="py-2.5 px-3.5 font-sans font-semibold text-teal-600 dark:text-teal-400 capitalize">
                        {m.masteryLevel}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chronological Exercise Session History Log */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Rejestr sesji treningowych (`ExerciseSessionHistoryEntry[]`)
              </h3>
              <button
                type="button"
                onClick={handleExportHistoryJson}
                className="min-h-[36px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Eksportuj historię (JSON)</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {exerciseHistory.map((session) => {
                const isExpanded = expandedSessionId === session.id;
                return (
                  <div
                    key={session.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedSessionId(isExpanded ? null : session.id)
                      }
                      className="w-full p-4 flex flex-wrap items-center justify-between gap-3 text-left hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                          <span>{session.dateStr}</span>
                          <span aria-hidden="true">·</span>
                          <span>{session.durationMinutes} min</span>
                          <span aria-hidden="true">·</span>
                          <span>Trudność {session.difficultyLevel}/5</span>
                          {session.avgHeartRateBpm && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>Śr. tętno {session.avgHeartRateBpm} BPM</span>
                            </>
                          )}
                        </div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          {session.dayFocusArea} ({session.exercisesExecuted.length} ćwiczenia)
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right font-mono tabular-nums">
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                            VAS: {session.preSessionVas} → {session.postSessionVas} ({session.vasDelta})
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Realizacja: {session.adherenceScorePercent}%
                          </span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 border-t border-slate-200/70 dark:border-slate-800 space-y-3 text-xs">
                        {session.sessionNotes && (
                          <p className="text-slate-600 dark:text-slate-300 italic">
                            Notatka kliniczna: „{session.sessionNotes}”
                          </p>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          {session.exercisesExecuted.map((rec, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1"
                            >
                              <div className="font-bold text-slate-900 dark:text-white">
                                {rec.exerciseName}
                              </div>
                              <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 tabular-nums">
                                {rec.completedSets}×{rec.completedReps} powt. · {rec.holdSecondsAchieved}s hold · Tempo {rec.tempoUsed}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                                Wysiłek RPE: {rec.perceivedDifficultyRpe}/10 · Ból w trakcie: {rec.painDuringExerciseVas}/10
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DATA ARCHITECTURE & TYPESCRIPT/JSON SCHEMA */}
      {activeSubTab === 'schema' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Model Danych Historii Ćwiczeń, Personalizacji i Postępów (TypeScript / JSON)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Relacyjny model lokalno-pierwszy (`localStorage` + kopia migawkowa `IndexedDB`) łączący wywiad bólowy z wykonaniem każdego ćwiczenia.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopySchemaJson}
                className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileJson className="w-3.5 h-3.5 text-teal-600" />
                <span>{copiedSchema ? 'Skopiowano JSON!' : 'Kopiuj żywy stan JSON'}</span>
              </button>
              <button
                type="button"
                onClick={handleExportHistoryJson}
                className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Pobierz plik .JSON</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Schema Definition Block */}
            <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 text-xs font-mono text-slate-200 overflow-x-auto">
              <div className="text-teal-400 font-bold mb-2">
                1. Struktura pojedynczej sesji i wykonania ćwiczenia
              </div>
              <pre className="text-[11px] leading-relaxed text-slate-300">{`interface ExerciseExecutionRecord {
  exerciseId: string;           // np. "chin-tuck"
  completedSets: number;        // np. 3
  completedReps: number;        // np. 10
  holdSecondsAchieved: number;  // np. 4 (czas izometrii)
  tempoUsed: string;            // np. "2-4-2"
  perceivedDifficultyRpe: number; // Skala Borga 1-10
  painDuringExerciseVas: number;  // Ból w trakcie 0-10
  usedSlowMotionVideo: boolean;   // Analiza 0.5x HUD
}

interface ExerciseSessionHistoryEntry {
  id: string;
  timestamp: string;            // ISO-8601
  planId: string;
  dayIndex: number;             // 0..6
  durationMinutes: number;
  preSessionVas: number;        // VAS przed sesją (0-10)
  postSessionVas: number;       // VAS po sesji (0-10)
  vasDelta: number;             // Redukcja bólu (np. -3)
  difficultyLevel: number;      // Poziom tempa 1-5
  patientMood?: PatientMood;
  stressLevel?: number;         // Stres psychosomatyczny 1-10
  adherenceScorePercent: number;// % wykonania planu
  exercisesExecuted: ExerciseExecutionRecord[];
}`}</pre>
            </div>

            {/* Live Aggregated Progress Snapshot */}
            <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 text-xs font-mono text-slate-200 overflow-x-auto">
              <div className="text-sky-400 font-bold mb-2">
                2. Żywa migawka agregacji postępów (`UserRehabProgressSummary`)
              </div>
              <pre className="text-[11px] leading-relaxed text-emerald-300 max-h-[290px] overflow-y-auto">
                {JSON.stringify(
                  {
                    detectedClinicalPhenotype: diagnostic.detectedClinicalPhenotype,
                    progressionPhase: diagnostic.progressionPhase,
                    progressSummary: {
                      totalSessionsCompleted: progressSummary.totalSessionsCompleted,
                      totalRepsCompleted: progressSummary.totalRepsCompleted,
                      totalIsometricMinutes: progressSummary.totalIsometricMinutes,
                      meanVasReductionPerSession: progressSummary.meanVasReductionPerSession,
                      adherence30DayPercent: progressSummary.adherence30DayPercent,
                      cromRotationImprovementDeg: progressSummary.cromRotationImprovementDeg,
                      exerciseMasteryById: progressSummary.exerciseMasteryById
                    }
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
