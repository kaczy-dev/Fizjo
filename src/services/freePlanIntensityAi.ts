import { TrainingPlan, PainReport, UserHealthProfile, Exercise } from '../types';
import { EXERCISES } from '../data/exercises';

export interface PlanIntensityAiResult {
  calculatedLevel: 'delicate' | 'standard' | 'strengthening';
  levelNamePl: string;
  badgeColor: string;
  avgVas: number;
  minVas: number;
  maxVas: number;
  trend: 'improving' | 'worsening' | 'stable';
  trendDescriptionPl: string;
  reportsAnalyzedCount: number;
  recentReports: Array<{
    date: string;
    vas: number;
    region: string;
    regionPl: string;
    character: string;
    characterPl: string;
    triggers: string[];
    stressLevel?: number;
  }>;
  aiRationale: string;
  biomechanicalGoals: string[];
  recommendedHoldSecondsAdjustment: string;
  recommendedBreakIntervalMin: number;
  safeExercises: Exercise[];
  cautionNotice?: string;
}

const REGION_PL: Record<string, string> = {
  neck: 'Szyja (odcinek szyjny)',
  nape: 'Kark i potylica',
  shoulder_blade: 'Obszar międzyłopatkowy',
  radiating_arm: 'Promieniowanie do barku / ręki',
  lower_back: 'Przejście szyjno-piersiowe',
  headache: 'Napięciowy ból głowy'
};

const CHAR_PL: Record<string, string> = {
  sharp: 'Ostry / kłujący',
  dull: 'Tępy / rozlany',
  burning: 'Pieczący',
  stiff: 'Sztywność poranna / blokada',
  throbbing: 'Pulsujący'
};

/**
 * Darmowa AI Kinezjologiczna (On-Device AI Engine)
 * Bez zewnętrznych płatnych API, działa 100% lokalnie w przeglądarce pacjenta.
 * Analizuje ostatnie 3 raporty bólu i przelicza bezpieczną intensywność planu.
 */
export function calculatePlanIntensityWithFreeAI(
  painHistory: PainReport[],
  profile?: UserHealthProfile
): PlanIntensityAiResult {
  // Sort from newest to oldest
  const sorted = [...painHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const last3 = sorted.slice(0, 3);

  // If user has fewer than 3 reports, create sensible fallback entries based on available data or default baseline
  let reportsToAnalyze = last3;
  if (reportsToAnalyze.length === 0) {
    reportsToAnalyze = [
      {
        id: 'mock-1',
        date: new Date().toISOString(),
        vasScore: 4,
        region: 'neck',
        character: 'stiff',
        triggers: ['Praca przy biurku'],
        associatedSymptoms: [],
        reliefPositions: ['Retrakcja brody'],
        aiAnalysis: {
          riskLevel: 'low',
          urgency: 'routine',
          primarySuspicion: 'Napięcie posturalne',
          redFlagsDetected: [],
          explanation: 'Wstępny profil adaptacyjny',
          recommendedExercises: ['chin-tuck'],
          contraindicatedExercises: [],
          immediateReliefAdvice: [],
          doctorQuestions: []
        }
      }
    ];
  }

  const vasValues = reportsToAnalyze.map(r => r.vasScore);
  const avgVas = Number((vasValues.reduce((sum, v) => sum + v, 0) / vasValues.length).toFixed(1));
  const minVas = Math.min(...vasValues);
  const maxVas = Math.max(...vasValues);

  // Determine trend
  let trend: 'improving' | 'worsening' | 'stable' = 'stable';
  let trendDescriptionPl = 'Ból utrzymuje się na stałym, stabilnym poziomie.';

  if (reportsToAnalyze.length >= 2) {
    const newest = reportsToAnalyze[0].vasScore;
    const older = reportsToAnalyze[reportsToAnalyze.length - 1].vasScore;
    const diff = newest - older;

    if (diff <= -1.5) {
      trend = 'improving';
      trendDescriptionPl = `Dolegliwości wykazują tendencję spadkową (spadek o ${Math.abs(diff)} pkt VAS). Tkanki dobrze adaptują się do kinezjoterapii.`;
    } else if (diff >= 1.5) {
      trend = 'worsening';
      trendDescriptionPl = `Wykryto wzrost intensywności bólu w ostatnich zgłoszeniach (wzrost o ${diff} pkt VAS). Wymagane natychmiastowe odciążenie.`;
    }
  }

  // Check for neurological or acute symptoms
  const hasRadiating = reportsToAnalyze.some(r => r.region === 'radiating_arm' || r.associatedSymptoms.some(s => s.toLowerCase().includes('drętw') || s.toLowerCase().includes('mrowi')));
  const hasSevereSpike = maxVas >= 7;
  const isHighAverage = avgVas >= 5.5;

  let calculatedLevel: 'delicate' | 'standard' | 'strengthening' = 'standard';
  let levelNamePl = 'Umiarkowana / Funkcjonalna (Standard)';
  let badgeColor = 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300';
  let aiRationale = '';
  const biomechanicalGoals: string[] = [];
  let recommendedHoldSecondsAdjustment = 'Standardowy czas izometrii: 5-6 sekund';
  let recommendedBreakIntervalMin = 45;
  let cautionNotice: string | undefined;

  // AI Decision Logic
  if (hasRadiating || hasSevereSpike || isHighAverage || trend === 'worsening') {
    calculatedLevel = 'delicate';
    levelNamePl = 'Łagodna / Dekompresyjna (Faza Ochronna)';
    badgeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300';
    recommendedHoldSecondsAdjustment = 'Skrócone czasy napięć (2-3 sekundy) i redukcja powtórzeń o 35%';
    recommendedBreakIntervalMin = 30;

    aiRationale = `Darmowy algorytm AI zakwalifikował stan do fazy ochronnej na podstawie średniego bólu (${avgVas}/10 VAS)${hasRadiating ? ' oraz zgłoszonego promieniowania/drętwienia' : ''}${trend === 'worsening' ? ' i niekorzystnego trendu wzrostowego' : ''}. Priorytetem kinezjologicznym jest otwarcie otworów międzykręgowych, dekompresja korzeni nerwowych C5-C7 i zniesienie obronnego napięcia mięśniowego.`;

    biomechanicalGoals.push(
      'Dekompresja osiowa segmentów szyjnych bez oporów zewnętrznych',
      'Łagodne rozluźnienie dźwigaczy łopatek i mięśni podpotylicznych',
      'Zapobieganie kompresji dyskowej i ochrona przed podrażnieniem nerwów',
      'Wprowadzenie mikroprzerw biurkowych co 30 minut'
    );

    if (hasRadiating || hasSevereSpike) {
      cautionNotice = 'Uwaga: Przy utrzymującym się promieniowaniu do dłoni lub bólu >7/10 VAS bezwzględnie skonsultuj się z lekarzem lub fizjoterapeutą.';
    }
  } else if (avgVas <= 3.0 && !hasRadiating) {
    calculatedLevel = 'strengthening';
    levelNamePl = 'Wzmacniająca / Progresywna (Faza Stabilizacji)';
    badgeColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300';
    recommendedHoldSecondsAdjustment = 'Wydłużone czasy izometrii (8-10 sekund) i praca przeciwko oporowi ręki';
    recommendedBreakIntervalMin = 60;

    aiRationale = `Niski średni poziom bólu (${avgVas}/10 VAS) i stabilna/spadkowa dynamika pozwalają na bezpieczną progresję siłową. AI rekomenduje aktywację głębokich zginaczy szyi (m. longus colli & capitis) oraz mięśni stabilizujących łopatkę (m. serratus anterior, rhomboidei) w celu długoterminowej prewencji nawrotów tech-neck.`;

    biomechanicalGoals.push(
      'Budowanie wytrzymałości posturalnej głębokich zginaczy szyi',
      'Wzmocnienie retrakcji łopatek i korekta protrakcji barków',
      'Zwiększenie gęstości izometrycznej w 4 kierunkach',
      'Utrwalenie prawidłowej biomechaniki podczas pracy biurowej'
    );
  } else {
    // Standard functional
    calculatedLevel = 'standard';
    levelNamePl = 'Umiarkowana / Funkcjonalna (Faza Mobilizacji)';
    badgeColor = 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300';
    recommendedHoldSecondsAdjustment = 'Zrównoważony czas izometrii: 5-6 sekund, tempo 3-2-3';
    recommendedBreakIntervalMin = 45;

    aiRationale = `Umiarkowane dolegliwości (${avgVas}/10 VAS) kwalifikują plan do standardowej fazy funkcjonalnej. Połączenie ćwiczeń mobilizujących odcinek piersiowy z łagodną retrakcją brody (chin-tuck) zapewnia optymalne odżywienie chrząstek stawowych i stopniowe wygaszanie bolesnych punktów spustowych.`;

    biomechanicalGoals.push(
      'Przywrócenie fizjologicznej lordozy szyjnej i zniesienie protrakcji',
      'Mobilizacja rotacyjna w bezbólowym zakresie goniometrycznym',
      'Wzmocnienie mięśni prostowników grzbietu piersiowego',
      'Wdrożenie higieny pozycji siedzącej i ergonomii biurka'
    );
  }

  // Safe exercise curation based on calculated level
  let safeExercises = EXERCISES;
  if (calculatedLevel === 'delicate') {
    safeExercises = EXERCISES.filter(e => 
      e.id === 'brugger-relief' ||
      e.id === 'chin-tuck' ||
      e.id === 'suboccipital-release' ||
      e.id === 'trapezius-upper-stretch' ||
      e.id === 'cat-cow-gentle'
    );
  } else if (calculatedLevel === 'strengthening') {
    safeExercises = EXERCISES;
  } else {
    safeExercises = EXERCISES.filter(e => !e.contraindications.includes('Ostry ból'));
  }

  return {
    calculatedLevel,
    levelNamePl,
    badgeColor,
    avgVas,
    minVas,
    maxVas,
    trend,
    trendDescriptionPl,
    reportsAnalyzedCount: reportsToAnalyze.length,
    recentReports: reportsToAnalyze.map(r => ({
      date: new Date(r.date).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      vas: r.vasScore,
      region: r.region,
      regionPl: REGION_PL[r.region] || r.region,
      character: r.character,
      characterPl: CHAR_PL[r.character] || r.character,
      triggers: r.triggers || [],
      stressLevel: r.stressLevel
    })),
    aiRationale,
    biomechanicalGoals,
    recommendedHoldSecondsAdjustment,
    recommendedBreakIntervalMin,
    safeExercises,
    cautionNotice
  };
}

/**
 * Aplikuje przeliczoną przez darmową AI intensywność do aktywnego planu treningowego.
 */
export function applyIntensityToPlan(
  currentPlan: TrainingPlan,
  aiResult: PlanIntensityAiResult
): TrainingPlan {
  const isDelicate = aiResult.calculatedLevel === 'delicate';
  const isStrengthening = aiResult.calculatedLevel === 'strengthening';

  // Exercise ID mappings for delicate / standard / strengthening
  const delicatePool = ['brugger-relief', 'chin-tuck', 'suboccipital-release', 'trapezius-upper-stretch'];
  const standardPool = ['chin-tuck', 'brugger-relief', 'scapular-squeezes', 'neck-rotation-gentle', 'trapezius-upper-stretch'];
  const strengthPool = ['chin-tuck', 'isometric-cervical', 'scapular-squeezes', 'brugger-relief', 'rhomboid-activation', 'thoracic-extension'];

  const selectedPool = isDelicate ? delicatePool : isStrengthening ? strengthPool : standardPool;

  const updatedDays = currentPlan.days.map((day, idx) => {
    // Pick 2-3 exercises matching the new intensity
    const ex1 = selectedPool[idx % selectedPool.length];
    const ex2 = selectedPool[(idx + 1) % selectedPool.length];
    const ex3 = isStrengthening ? selectedPool[(idx + 2) % selectedPool.length] : undefined;

    const newExerciseIds = [ex1, ex2, ex3].filter(Boolean) as string[];

    return {
      ...day,
      exerciseIds: newExerciseIds.length > 0 ? newExerciseIds : day.exerciseIds,
      estimatedMinutes: isDelicate ? Math.max(6, Math.min(10, currentPlan.dailyMinutes - 3)) : isStrengthening ? Math.min(25, currentPlan.dailyMinutes + 3) : currentPlan.dailyMinutes,
      focusArea: isDelicate 
        ? 'Dekompresja & ulga w bólu (AI)' 
        : isStrengthening 
        ? 'Stabilizacja głęboka & progresja (AI)' 
        : 'Mobilność & biomechanika (AI)'
    };
  });

  const levelTag = isDelicate ? 'Tryb Dekompresyjny' : isStrengthening ? 'Tryb Wzmacniający' : 'Tryb Funkcjonalny';

  return {
    ...currentPlan,
    adaptedLevel: aiResult.calculatedLevel,
    title: `${currentPlan.primaryProblem ? currentPlan.title.replace(/\[AI: .*?\]/, '').trim() : 'Protokół Rehabilitacji'} [AI: ${levelTag}]`,
    description: `Intensywność przeliczona na podstawie ostatnich 3 raportów bólu (śr. VAS: ${aiResult.avgVas}/10). ${aiResult.recommendedHoldSecondsAdjustment}.`,
    aiRationale: aiResult.aiRationale,
    recommendedBreakIntervalMinutes: aiResult.recommendedBreakIntervalMin,
    days: updatedDays
  };
}
