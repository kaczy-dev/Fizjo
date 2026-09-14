import { Exercise } from '../types';
import { EXERCISES } from '../data/exercises';

export type VasClinicalCategory = 'acute_protection' | 'moderate_functional' | 'mild_strengthening';

export interface AdaptiveVasResult {
  vasScore: number;
  category: VasClinicalCategory;
  categoryTitle: string;
  badgeLabel: string;
  badgeColorClass: string;
  bannerBgClass: string;
  bannerBorderClass: string;
  bannerTextClass: string;
  clinicalRationale: string;
  biomechanicalGoals: string[];
  recommendedDifficultyLevel: number; // 1 to 5 mapped to DIFFICULTY_CONFIG
  recommendedCycleDurationMs: number;
  isAdapted: boolean;
  adaptedExercises: Exercise[];
  suppressedExerciseIds: string[];
  suppressedExerciseNames: string[];
  addedExerciseIds: string[];
  addedExerciseNames: string[];
  parameterAdjustments: {
    setsAdjustmentNotice: string;
    repsAdjustmentNotice: string;
    tempoAdjustmentNotice: string;
  };
}

/**
 * Zwraca ćwiczenie z bazy EXERCISES po ID z parametrami rezerwowymi
 */
function findExerciseById(id: string): Exercise | undefined {
  return EXERCISES.find(e => e.id === id);
}

/**
 * Główny algorytm adaptacji kinezjologicznej do aktualnego poziomu bólu VAS
 * 
 * Zasady kliniczne:
 * 1. VAS >= 7 (Ból ostry):
 *    - Wygaszenie ćwiczeń z oporami izometrycznymi (nacisk ręką na czoło/potylicę)
 *    - Wygaszenie ćwiczeń ze skrajnymi rotacjami szyi i agresywnym rozciąganiem
 *    - Wprowadzenie delikatnej autotrakcji osiowej ręcznikiem (rozszerzenie przestrzeni C3-C7 bez rotacji)
 *    - Wprowadzenie dekompresji z oddechem dolnożebrowym (wygaszenie odruchowego skurczu mm. pochyłych)
 *    - Wprowadzenie pozycji odbarczającej Brüggera i rozluźnienia podpotylicznego
 *    - Redukcja serii do 1 i powtórzeń o 40%, cykl wydłużony (9.0s)
 * 
 * 2. VAS 4-6 (Ból umiarkowany):
 *    - Balans mobilizacji piersiowej i łagodnej retrakcji
 *    - Unikanie forsowania zakresu skrajnego
 * 
 * 3. VAS 0-3 (Ból łagodny / Faza wzmacniająca):
 *    - Pełny protokół stabilizacji głębokiej i izometrii 4 kierunków
 */
export function adaptExercisesForVas(
  originalExercises: Exercise[],
  vasScore: number
): AdaptiveVasResult {
  const boundedVas = Math.max(0, Math.min(10, Math.round(vasScore)));

  // SCENARIO 1: ACUTE PROTECTION (VAS 7-10)
  if (boundedVas >= 7) {
    const contraindicatedIds = ['isometric-neck', 'neck-rotations', 'nerve-floss'];
    
    // Check which original exercises must be suppressed
    const suppressed = originalExercises.filter(ex => contraindicatedIds.includes(ex.id));
    const suppressedIds = suppressed.map(e => e.id);
    const suppressedNames = suppressed.map(e => e.polishName);

    // Filter out contraindicated exercises
    const safeOriginal = originalExercises.filter(ex => !contraindicatedIds.includes(ex.id));

    // Desired acute pool ordered by safety priority:
    // 1. axial-towel-traction (autotrakcja osiowa ręcznikiem)
    // 2. diaphragmatic-neck-relief (oddech dolnożebrowy wygaszający skurcz obronny)
    // 3. brugger-relief (pozycja odbarczająca)
    // 4. suboccipital-release (delikatny automasaż)
    // 5. chin-tuck (retrakcja brody)
    const acuteCandidateIds = [
      'axial-towel-traction',
      'diaphragmatic-neck-relief',
      'brugger-relief',
      'suboccipital-release',
      'chin-tuck'
    ];

    const finalExercises: Exercise[] = [];
    const addedIds: string[] = [];
    const addedNames: string[] = [];

    // Always ensure acute candidates take precedence
    for (const acuteId of acuteCandidateIds) {
      const ex = findExerciseById(acuteId);
      if (ex) {
        // Adjust exercise intensity parameters for acute protection
        const adaptedEx: Exercise = {
          ...ex,
          defaultSets: 1, // Safe single set to prevent tissue fatigue
          defaultReps: Math.max(3, Math.min(ex.defaultReps, 5)), // Reduced reps
          defaultHoldSeconds: ex.id === 'axial-towel-traction' ? 10 : Math.max(3, Math.min(ex.defaultHoldSeconds, 8)),
          tempo: '4-4-4',
          difficulty: 'Łatwe'
        };

        finalExercises.push(adaptedEx);

        // Check if this was newly added compared to original input
        if (!originalExercises.some(orig => orig.id === ex.id)) {
          addedIds.push(ex.id);
          addedNames.push(ex.polishName);
        }
      }
      if (finalExercises.length >= 4) break;
    }

    // If safeOriginal had items not already included, keep them up to total 4-5
    for (const safeEx of safeOriginal) {
      if (!finalExercises.some(f => f.id === safeEx.id) && finalExercises.length < 5) {
        finalExercises.push({
          ...safeEx,
          defaultSets: 1,
          defaultReps: Math.max(3, Math.round(safeEx.defaultReps * 0.6)),
          difficulty: 'Łatwe'
        });
      }
    }

    const isAdapted = suppressedIds.length > 0 || addedIds.length > 0 || boundedVas >= 7;

    return {
      vasScore: boundedVas,
      category: 'acute_protection',
      categoryTitle: 'Protokół Ochronno-Dekompresyjny (Ból ostry VAS 7-10)',
      badgeLabel: 'Tryb Ochronny (VAS ≥ 7)',
      badgeColorClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800',
      bannerBgClass: 'bg-rose-50/90 dark:bg-rose-950/40',
      bannerBorderClass: 'border-rose-200 dark:border-rose-900',
      bannerTextClass: 'text-rose-800 dark:text-rose-200',
      clinicalRationale: `Wykryto wysoki poziom bólu (${boundedVas}/10 VAS). W ostrym stanie zapalnym krążków międzykręgowych lub silnym skurczu obronnym mięśni karku ćwiczenia siłowe oraz skrajne rotacje grożą uciskiem na korzenie nerwowe. Algorytm wygasił ćwiczenia obciążeniowe i zastąpił je delikatną autotrakcją osiową ręcznikiem, oddechem dolnożebrowym oraz pozycją odbarczającą Brüggera.`,
      biomechanicalGoals: [
        'Dekompresja osiowa kręgów C3-C7 bez rotacji i zginania',
        'Wygaszenie odruchowego skurczu obronnego mm. pochyłych i czworobocznego',
        'Rozszerzenie otworów międzykręgowych i ochrona korzeni nerwowych',
        'Redukcja napięcia powięziowego torem oddechu dolnożebrowego'
      ],
      recommendedDifficultyLevel: 1, // 9.0s cycle
      recommendedCycleDurationMs: 9000,
      isAdapted,
      adaptedExercises: finalExercises,
      suppressedExerciseIds: suppressedIds,
      suppressedExerciseNames: suppressedNames,
      addedExerciseIds: addedIds,
      addedExerciseNames: addedNames,
      parameterAdjustments: {
        setsAdjustmentNotice: 'Zredukowano objętość do 1 serii na ćwiczenie, aby nie przeciążyć tkanek.',
        repsAdjustmentNotice: 'Liczba powtórzeń ograniczona o ~40% (3-5 spokojnych powtórzeń).',
        tempoAdjustmentNotice: 'Bardzo wolne tempo (cykl 9 sekund), brak szarpnięć.'
      }
    };
  }

  // SCENARIO 2: MODERATE FUNCTIONAL (VAS 4-6)
  if (boundedVas >= 4) {
    const adjusted = originalExercises.map(ex => {
      // Lightly scale back if heavy isometric
      if (ex.id === 'isometric-neck') {
        return {
          ...ex,
          defaultSets: 2,
          defaultReps: 4,
          defaultHoldSeconds: 4
        };
      }
      return {
        ...ex,
        defaultSets: Math.min(ex.defaultSets, 2)
      };
    });

    return {
      vasScore: boundedVas,
      category: 'moderate_functional',
      categoryTitle: 'Protokół Funkcjonalno-Mobilizacyjny (Ból umiarkowany VAS 4-6)',
      badgeLabel: 'Tryb Funkcjonalny (VAS 4-6)',
      badgeColorClass: 'bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border-teal-300 dark:border-teal-800',
      bannerBgClass: 'bg-teal-50/90 dark:bg-teal-950/40',
      bannerBorderClass: 'border-teal-200 dark:border-teal-900',
      bannerTextClass: 'text-teal-800 dark:text-teal-200',
      clinicalRationale: `Umiarkowany ból (${boundedVas}/10 VAS) to stan podostry lub przewlekłe napięcie biurkowe. Zestaw łączy bezpieczną mobilizację kręgosłupa piersiowego z łagodną aktywacją zginaczy szyi i retrakcją łopatek w bezbólowym zakresie goniometrycznym.`,
      biomechanicalGoals: [
        'Przywracanie ruchomości w bezbólowym zakresie goniometrycznym',
        'Korekcja protrakcji głowy (retrakcja brody)',
        'Wzmocnienie mięśni międzyłopatkowych (otwarcie klatki piersiowej)',
        'Umiarkowane rozluźnienie punktów spustowych karku'
      ],
      recommendedDifficultyLevel: 2, // 7.5s cycle
      recommendedCycleDurationMs: 7500,
      isAdapted: false,
      adaptedExercises: adjusted,
      suppressedExerciseIds: [],
      suppressedExerciseNames: [],
      addedExerciseIds: [],
      addedExerciseNames: [],
      parameterAdjustments: {
        setsAdjustmentNotice: 'Standardowe 2 serie dla optymalnej stymulacji krążków.',
        repsAdjustmentNotice: 'Zrównoważona liczba powtórzeń (6-8) z kontrolą oddechu.',
        tempoAdjustmentNotice: 'Rytmiczne tempo rehabilitacyjne (cykl 7.5 sekundy).'
      }
    };
  }

  // SCENARIO 3: MILD / PREVENTATIVE STRENGTHENING (VAS 0-3)
  const strengthOptimized = originalExercises.map(ex => {
    if (ex.id === 'chin-tuck') {
      return { ...ex, defaultHoldSeconds: 5, defaultReps: 10 };
    }
    if (ex.id === 'isometric-neck') {
      return { ...ex, defaultHoldSeconds: 6, defaultSets: 3 };
    }
    return ex;
  });

  return {
    vasScore: boundedVas,
    category: 'mild_strengthening',
    categoryTitle: 'Protokół Wzmacniająco-Stabilizacyjny (Ból łagodny VAS 0-3)',
    badgeLabel: 'Tryb Wzmacniający (VAS 0-3)',
    badgeColorClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    bannerBgClass: 'bg-emerald-50/90 dark:bg-emerald-950/40',
    bannerBorderClass: 'border-emerald-200 dark:border-emerald-900',
    bannerTextClass: 'text-emerald-800 dark:text-emerald-200',
    clinicalRationale: `Brak lub niski poziom dolegliwości (${boundedVas}/10 VAS) pozwala na pełną progresję kinezjologiczną. Cel to trwała przebudowa gęstości izometrycznej mięśni głębokich szyi i stabilizatorów łopatek, aby zapobiegać nawrotom dolegliwości podczas wielogodzinnej pracy biurowej.`,
    biomechanicalGoals: [
      'Maksymalizacja wytrzymałości posturalnej głębokich zginaczy szyi',
      'Izometria 4-kierunkowa budująca gorset mięśniowy kręgosłupa szyjnego',
      'Aktywna retrakcja i depresja łopatek przeciw oporowi',
      'Trwała ochrona segmentów C5-C7 przed kompresją grawitacyjną'
    ],
    recommendedDifficultyLevel: 3, // 6.0s cycle
    recommendedCycleDurationMs: 6000,
    isAdapted: false,
    adaptedExercises: strengthOptimized,
    suppressedExerciseIds: [],
    suppressedExerciseNames: [],
    addedExerciseIds: [],
    addedExerciseNames: [],
    parameterAdjustments: {
      setsAdjustmentNotice: 'Pełna objętość (2-3 serie) budująca rezerwę siłową.',
      repsAdjustmentNotice: 'Pełna liczba powtórzeń (8-12) z wydłużoną izometrią.',
      tempoAdjustmentNotice: 'Standardowe tempo funkcjonalne (cykl 6.0 sekund).'
    }
  };
}
