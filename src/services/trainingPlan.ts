import {
  TrainingPlan,
  TrainingDay,
  PainReport,
  UserHealthProfile,
  ReminderConfig,
  Medication,
  DayScheduleItem
} from '../types';

export interface PlanGenerationInput {
  painHistory: PainReport[];
  profile: UserHealthProfile;
  reminders: ReminderConfig;
  medications: Medication[];
  primaryProblem?: string;
  workType?: 'desk' | 'physical' | 'mixed';
  dailyMinutes?: number;
  baselineVas?: number;
}

export function generateAIPersonalizedPlan(input: PlanGenerationInput): TrainingPlan {
  const { painHistory, profile, reminders, medications } = input;
  const dayNames = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];

  // 1. Analyze Pain Trends and Symptoms
  const hasHistory = painHistory && painHistory.length > 0;
  const latestReport = hasHistory ? painHistory[0] : null;

  // Calculate average VAS
  const avgVas = hasHistory
    ? painHistory.reduce((acc, r) => acc + r.vasScore, 0) / painHistory.length
    : 4;
  const currentVas = latestReport ? latestReport.vasScore : avgVas;

  // Detect dominant symptoms & neurological red/yellow flags
  const regions = painHistory.map((r) => r.region);
  const isRadiating =
    regions.includes('radiating_arm') ||
    (latestReport?.associatedSymptoms &&
      latestReport.associatedSymptoms.some(
        (s) => s.toLowerCase().includes('drętwienie') || s.toLowerCase().includes('mrowienie') || s.toLowerCase().includes('barku')
      ));

  const isHeadache =
    regions.includes('headache') ||
    latestReport?.region === 'headache' ||
    (latestReport?.associatedSymptoms &&
      latestReport.associatedSymptoms.some((s) => s.toLowerCase().includes('głow')));

  const isLumbarCombo =
    regions.includes('lower_back') ||
    input.primaryProblem === 'lumbar_combo' ||
    profile.diagnoses?.some((d) => d.toLowerCase().includes('lędźw') || d.toLowerCase().includes('rwa'));

  const isHighPain = currentVas >= 7;
  const isModeratePain = currentVas >= 4 && currentVas < 7;
  const isLowPain = currentVas < 4;

  const workType = input.workType || 'desk';
  const dailyMinutes = input.dailyMinutes || (isHighPain ? 10 : 15);

  // 2. Select Adaptation Level and Safety Protocol
  let adaptedLevel: 'delicate' | 'standard' | 'strengthening' = 'standard';
  if (isHighPain) {
    adaptedLevel = 'delicate';
  } else if (isLowPain && profile.totalCompletedSessions >= 3) {
    adaptedLevel = 'strengthening';
  }

  // 3. Clinical AI Rationale and Contraindications
  let title = 'Spersonalizowany Plan Fizjoterapii Szyi i Kręgosłupa';
  let description = 'Wygenerowany przez lokalny algorytm biomechaniczny na podstawie zgłoszonego wywiadu bólowego.';
  let goal = 'Redukcja kompresji krążków międzykręgowych, przywrócenie lordozy i zniesienie bólu.';
  let aiRationale = '';
  const contraindicatedExerciseIds: string[] = [];

  let dayExerciseMap: string[][] = [];

  if (isRadiating) {
    title = 'AI Protokół: Dekompresja Korzeniowa & Neurodynamika Szyi';
    description = 'Plan dedykowany przy objawach rzutowania bólu do barku i drętwienia palców.';
    goal = 'Zmniejszenie ucisku na pęczki splotu ramiennego, poprawa ślizgu nerwu pośrodkowego i centralizacja objawów.';
    aiRationale =
      'Algorytm wykrył zgłoszone objawy promieniowania i drętwienia. Wykluczono agresywne skrajne rozciąganie mięśni czworobocznych, które mogłoby podrażnić oponę twardą nerwów. Wprowadzono bezpieczny ślizg nerwu pośrodkowego (Nerve Floss) oraz łagodną retrakcję (Chin Tuck).';
    contraindicatedExerciseIds.push('trapezius-stretch'); // Avoid aggressive tension on irritated brachial plexus

    dayExerciseMap = [
      ['nerve-floss', 'chin-tuck', 'brugger-relief'],
      ['nerve-floss', 'suboccipital-release', 'chin-tuck'],
      ['brugger-relief', 'nerve-floss', 'suboccipital-release'],
      ['chin-tuck', 'nerve-floss', 'scapular-retraction'],
      ['brugger-relief', 'suboccipital-release', 'cat-cow'],
      ['nerve-floss', 'chin-tuck', 'brugger-relief'],
      ['suboccipital-release', 'chin-tuck', 'nerve-floss']
    ];
  } else if (isHeadache) {
    title = 'AI Protokół: Terapia Napięciowych Bólów Głowy (Cervicogenic)';
    description = 'Rozluźnianie mięśni podpotylicznych i odciążenie przejścia szyjno-czaszkowego C0-C2.';
    goal = 'Zmniejszenie napięcia w gałęziach nerwu potylicznego większego i likwidacja uczucia obręczy na skroniach.';
    aiRationale =
      'Algorytm zidentyfikował dolegliwości o charakterze odkręgosłupowych bólów głowy. Główny nacisk położono na automasaż mięśni podpotylicznych, delikatną trakcję oraz pozycję odciążającą Brüggera połączoną z torem oddechowym.';

    dayExerciseMap = [
      ['suboccipital-release', 'chin-tuck', 'brugger-relief'],
      ['suboccipital-release', 'trapezius-stretch', 'cat-cow'],
      ['chin-tuck', 'suboccipital-release', 'neck-rotations'],
      ['suboccipital-release', 'brugger-relief', 'isometric-neck'],
      ['trapezius-stretch', 'suboccipital-release', 'chin-tuck'],
      ['suboccipital-release', 'neck-rotations', 'brugger-relief'],
      ['chin-tuck', 'suboccipital-release', 'cat-cow']
    ];
  } else if (isHighPain) {
    title = 'AI Protokół: Ostry Ból Karku – Protokół Odciążający i Antalgiczny';
    description = 'Maksymalnie bezpieczne ćwiczenia w pozycjach odciążających stawy międzykręgowe.';
    goal = 'Wyciszenie ostrego stanu zapalnego, likwidacja obronnego skurczu mięśni i bezpieczna mobilizacja.';
    aiRationale =
      'Zgłoszono podwyższony poziom bólu (VAS ≥ 7). Program został dostosowany do pracy w bezbolesnym zakresie ruchu. Wykluczono intensywne ćwiczenia oporowe i skrajne rotacje głowy. Zalecany jest stały monitoring skali VAS przed i po każdej sesji.';
    contraindicatedExerciseIds.push('isometric-neck', 'neck-rotations');

    dayExerciseMap = [
      ['brugger-relief', 'chin-tuck', 'suboccipital-release'],
      ['chin-tuck', 'brugger-relief', 'trapezius-stretch'],
      ['suboccipital-release', 'brugger-relief', 'chin-tuck'],
      ['chin-tuck', 'brugger-relief', 'cat-cow'],
      ['suboccipital-release', 'chin-tuck', 'brugger-relief'],
      ['chin-tuck', 'trapezius-stretch', 'brugger-relief'],
      ['brugger-relief', 'suboccipital-release', 'cat-cow']
    ];
  } else if (isLumbarCombo) {
    title = 'AI Protokół: Pełna Oś Kręgosłupa (Szyja + Lędźwie)';
    description = 'Zrównoważony plan biomechaniczny integrujący odcinek szyjny i lędźwiowy (McKenzie).';
    goal = 'Przywrócenie lordozy szyjnej i lędźwiowej oraz stabilizacja łańcucha posturalnego.';
    aiRationale =
      'Algorytm uwzględnił współistniejące dolegliwości lędźwiowe. Włączono sprawdzoną metodę McKenziego (przeprosty prone press-up) wraz z mobilizacją segmentarną (koci grzbiet) i korekcją retrakcji szyi.';

    dayExerciseMap = [
      ['chin-tuck', 'lumbar-extension', 'cat-cow'],
      ['brugger-relief', 'scapular-retraction', 'trapezius-stretch'],
      ['chin-tuck', 'lumbar-extension', 'suboccipital-release'],
      ['cat-cow', 'isometric-neck', 'lumbar-extension'],
      ['chin-tuck', 'scapular-retraction', 'brugger-relief'],
      ['lumbar-extension', 'neck-rotations', 'cat-cow'],
      ['brugger-relief', 'suboccipital-release', 'lumbar-extension']
    ];
  } else {
    // Standard / Tech-Neck Desk Worker
    title = 'AI Protokół: Korekcja Tech-Neck & Biurowy Reset Karku';
    description = 'Ukierunkowany na zniesienie protrakcji głowy, wzmocnienie stabilizatorów i elastyczność.';
    goal = 'Odbudowa naturalnego łuku lordozy szyjnej, wzmocnienie mięśni łopatek i odciążenie krążków C5-C7.';
    aiRationale =
      'Algorytm przeanalizował charakterystykę pracy przy biurku. Zestaw skupia się na cofaniu wysuniętej ku monitorowi głowy (Chin Tuck) oraz wzmacnianiu dolnego czworobocznego (W-to-Y) stabilizującego łopatki.';

    dayExerciseMap = [
      ['chin-tuck', 'suboccipital-release', 'brugger-relief'],
      ['chin-tuck', 'trapezius-stretch', 'scapular-retraction'],
      ['neck-rotations', 'suboccipital-release', 'brugger-relief'],
      ['chin-tuck', 'isometric-neck', 'scapular-retraction'],
      ['trapezius-stretch', 'brugger-relief', 'cat-cow'],
      ['chin-tuck', 'suboccipital-release', 'neck-rotations'],
      ['brugger-relief', 'scapular-retraction', 'cat-cow']
    ];
  }

  // 4. Integrated Daily Schedule with Medications and Reminders
  const morningMeds = medications.filter((m) =>
    m.scheduleTimes && m.scheduleTimes.some((t) => parseInt(t.split(':')[0], 10) < 12)
  );
  const eveningMeds = medications.filter((m) =>
    m.scheduleTimes && m.scheduleTimes.some((t) => parseInt(t.split(':')[0], 10) >= 18)
  );

  const rehabTime = reminders.rehabSessionTime || '17:30';

  const days: TrainingDay[] = dayNames.map((name, index) => {
    const exList = dayExerciseMap[index] || ['chin-tuck', 'brugger-relief'];
    const focusLabels = [
      'Dekompresja początkowa i oddech',
      'Wzmacnianie i stabilizacja łopatek',
      'Uwalnianie napięć podpotylicznych',
      'Stabilizacja izometryczna kręgów',
      'Otwieranie klatki i reset powięzi',
      'Płynność zakresu rotacji',
      'Regeneracja i utrwalenie postawy'
    ];

    // Build timeline for each day
    const schedule: DayScheduleItem[] = [];

    // Morning block
    if (morningMeds.length > 0) {
      schedule.push({
        time: '08:00',
        type: 'med',
        title: 'Poranne leki / suplementy',
        description: morningMeds.map((m) => `${m.name} (${m.dosage})`).join(', '),
        badge: 'Farmakologia'
      });
    }

    schedule.push({
      time: '08:30',
      type: 'ergonomics',
      title: 'Poranny rozruch karku',
      description: '2 minuty delikatnego cofania brody (Chin Tuck) przed rozpoczęciem pracy',
      badge: 'Profilaktyka'
    });

    // Mid-day office break
    if (workType === 'desk' || workType === 'mixed') {
      schedule.push({
        time: '12:30',
        type: 'break',
        title: 'Mikropauza ergonomiczna (Zasada 20-20-20)',
        description: '1 minuta w pozycji odciążającej Brüggera i spojrzenie w dal na 6 metrów',
        badge: 'Ergonomia'
      });
    }

    // Main rehabilitation workout
    schedule.push({
      time: rehabTime,
      type: 'rehab',
      title: `Główna Sesja Rehabilitacyjna (${dailyMinutes} min)`,
      description: `Sekwencja ${exList.length} ćwiczeń z wizualnym przewodnikiem oddechowym i wideo instruktażem`,
      badge: 'Sesja Główna'
    });

    // Evening block
    if (eveningMeds.length > 0) {
      schedule.push({
        time: '21:00',
        type: 'med',
        title: 'Wieczorne leki / maści karku',
        description: eveningMeds.map((m) => `${m.name} (${m.dosage})`).join(', '),
        badge: 'Farmakologia'
      });
    }

    schedule.push({
      time: '21:30',
      type: 'ergonomics',
      title: 'Przygotowanie karku do snu',
      description: 'Ułożenie głowy na profilowanej poduszce ortopedycznej w pozycji na plecach lub boku',
      badge: 'Zdrowy Sen'
    });

    return {
      dayIndex: index,
      dayName: name,
      focusArea: focusLabels[index],
      exerciseIds: exList,
      estimatedMinutes: dailyMinutes,
      completed: false,
      dailySchedule: schedule
    };
  });

  const medsSummary =
    medications.length > 0
      ? `Zsynchronizowano z ${medications.length} zarejestrowanymi lekami/suplementami (${medications
          .map((m) => m.name)
          .join(', ')}).`
      : 'Brak zdefiniowanych leków – plan skupia się wyłącznie na kinezyterapii i ergonomii.';

  return {
    id: 'ai-plan-' + Date.now(),
    title,
    description,
    goal,
    primaryProblem: input.primaryProblem || (isRadiating ? 'shoulder_radiating' : isHeadache ? 'headache' : 'tech_neck'),
    dailyMinutes,
    workType,
    startDate: new Date().toISOString(),
    days,
    adaptedLevel,
    aiRationale,
    contraindicatedExerciseIds,
    recommendedBreakIntervalMinutes: reminders.officeBreakIntervalMinutes || 60,
    integratedMedicationsSummary: medsSummary
  };
}

// Keep backward compatibility for standard call
export function generatePersonalizedPlan(params: {
  primaryProblem: string;
  workType: 'desk' | 'physical' | 'mixed';
  dailyMinutes: number;
  baselineVas: number;
}): TrainingPlan {
  return generateAIPersonalizedPlan({
    painHistory: [
      {
        id: 'init-vas',
        date: new Date().toISOString(),
        vasScore: params.baselineVas,
        region: 'neck',
        character: 'stiff',
        triggers: ['praca przy biurku'],
        associatedSymptoms: [],
        reliefPositions: ['odpoczynek'],
        aiAnalysis: {
          riskLevel: 'low',
          urgency: 'routine',
          primarySuspicion: 'Przeciążenie posturalne karku',
          redFlagsDetected: [],
          explanation: 'Typowe napięcie mięśniowe karku wynikające z siedzącego trybu pracy.',
          recommendedExercises: ['chin-tuck', 'brugger-relief'],
          contraindicatedExercises: [],
          immediateReliefAdvice: ['Częste przerwy od monitora co 45 minut'],
          doctorQuestions: []
        }
      }
    ],
    profile: {
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
    },
    reminders: {
      rehabSessionTime: '17:30',
      rehabEnabled: true,
      officeBreakIntervalMinutes: 60,
      officeBreakEnabled: true,
      medicationRemindersEnabled: true,
      motivationalTone: 'clinical'
    },
    medications: [],
    primaryProblem: params.primaryProblem,
    workType: params.workType,
    dailyMinutes: params.dailyMinutes
  });
}
