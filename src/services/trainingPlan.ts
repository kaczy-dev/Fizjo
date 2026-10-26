import {
  TrainingPlan,
  TrainingDay,
  PainReport,
  UserHealthProfile,
  ReminderConfig,
  Medication,
  DayScheduleItem,
  ClinicalPersonalizationDiagnostic,
  PersonalizedExercisePrescription,
  ExerciseSessionHistoryEntry,
  UserRehabProgressSummary,
  ExerciseMasteryMetric
} from '../types';
import { EXERCISES } from '../data/exercises';

export interface PlanGenerationInput {
  painHistory: PainReport[];
  profile: UserHealthProfile;
  reminders: ReminderConfig;
  medications: Medication[];
  primaryProblem?: string;
  workType?: 'desk' | 'physical' | 'mixed';
  dailyMinutes?: number;
  baselineVas?: number;
  customDiagnoses?: string[];
  customPainCharacter?: PainReport['character'];
  customPainRegion?: PainReport['region'];
}

export function generateAIPersonalizedPlan(input: PlanGenerationInput): TrainingPlan {
  const { painHistory, profile, reminders, medications } = input;
  const dayNames = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];

  // 1. Multi-Factor Pain Analysis (Analiza zgłaszanych dolegliwości bólowych)
  const hasHistory = painHistory && painHistory.length > 0;
  const latestReport = hasHistory ? painHistory[0] : null;
  const recentReports = hasHistory ? painHistory.slice(0, 7) : [];

  const avgVas =
    recentReports.length > 0
      ? Number(
          (
            recentReports.reduce((acc, r) => acc + r.vasScore, 0) / recentReports.length
          ).toFixed(1)
        )
      : input.baselineVas ?? 4;

  const currentVas = input.baselineVas ?? (latestReport ? latestReport.vasScore : avgVas);

  // Compute VAS trend delta (recent vs older)
  const olderVas =
    recentReports.length >= 2
      ? recentReports[recentReports.length - 1].vasScore
      : currentVas + 1.5;
  const vasTrendDelta = Number((currentVas - olderVas).toFixed(1));

  const dominantCharacter =
    input.customPainCharacter || latestReport?.character || (currentVas >= 7 ? 'sharp' : 'stiff');
  const regions = [
    ...(input.customPainRegion ? [input.customPainRegion] : []),
    ...painHistory.map((r) => r.region)
  ];
  const uniqueRegions = Array.from(new Set(regions.length > 0 ? regions : ['neck']));

  // 2. Analyze User Health State (Analiza stanu zdrowia użytkownika z UserHealthProfile)
  const activeDiagnoses = input.customDiagnoses || profile.diagnoses || [];
  const patientAge = Math.max(18, new Date().getFullYear() - (profile.birthYear || 1988));
  const latestCrom =
    profile.mobilityTests && profile.mobilityTests.length > 0
      ? profile.mobilityTests[0]
      : null;
  const rotationAsymmetryDeg = latestCrom
    ? Math.abs(latestCrom.neckRotationLeftDeg - latestCrom.neckRotationRightDeg)
    : 0;
  const hasRotationDeficit = latestCrom
    ? latestCrom.neckRotationLeftDeg < 60 || latestCrom.neckRotationRightDeg < 60
    : false;
  const latestBps =
    profile.bpsLogs && profile.bpsLogs.length > 0 ? profile.bpsLogs[0] : null;
  const hasBruxismOrHighStress =
    Boolean(latestBps?.bruxismTension) || (latestBps?.stressLevel ?? 4) >= 7;
  const sleepsOnStomach = latestBps?.sleepingPosition === 'stomach';
  const cervicalLoadKg = profile.ergonomicAudit?.estimatedCervicalLoadKg ?? 14;

  // Build health risk factors summary
  const healthRiskFactors: string[] = [];
  if (activeDiagnoses.length > 0) {
    healthRiskFactors.push(`Rozpoznania kliniczne: ${activeDiagnoses.join(', ')}`);
  }
  if (currentVas >= 7 || dominantCharacter === 'sharp' || dominantCharacter === 'burning') {
    healthRiskFactors.push(
      `Podwyższona drażliwość tkankowa (VAS ${currentVas}/10, charakter: ${translatePainCharacter(dominantCharacter)})`
    );
  }
  if (hasRotationDeficit || rotationAsymmetryDeg >= 8) {
    healthRiskFactors.push(
      `Deficyt / asymetria CROM: L=${latestCrom?.neckRotationLeftDeg}° / P=${latestCrom?.neckRotationRightDeg}° (Δ ${rotationAsymmetryDeg}°)`
    );
  }
  if (hasBruxismOrHighStress) {
    healthRiskFactors.push('Wzmożone napięcie psychosomatyczne / bruksizm (oś skroniowo-podpotyliczna)');
  }
  if (sleepsOnStomach) {
    healthRiskFactors.push('Spanie na brzuchu – przewlekła nocna hiperrotacja C1-C2');
  }
  if (cervicalLoadKg >= 15) {
    healthRiskFactors.push(`Przeciążenie statyczne przy biurku: ok. ${cervicalLoadKg} kg nacisku na C5-C7`);
  }
  if (patientAge >= 55) {
    healthRiskFactors.push(`Wiek ${patientAge} lat – wydłużony czas uwodnienia krążków i łagodniejsza progresja`);
  }

  // Detect dominant clinical phenotype
  const isRadiating =
    input.primaryProblem === 'shoulder_radiating' ||
    uniqueRegions.includes('radiating_arm') ||
    dominantCharacter === 'burning' ||
    activeDiagnoses.some((d) => d.toLowerCase().includes('dyskopat') || d.toLowerCase().includes('korzeni')) ||
    (latestReport?.associatedSymptoms &&
      latestReport.associatedSymptoms.some(
        (s) =>
          s.toLowerCase().includes('drętwienie') ||
          s.toLowerCase().includes('mrowienie') ||
          s.toLowerCase().includes('barku')
      ));

  const isHeadache =
    input.primaryProblem === 'headache' ||
    uniqueRegions.includes('headache') ||
    hasBruxismOrHighStress ||
    (latestReport?.associatedSymptoms &&
      latestReport.associatedSymptoms.some((s) => s.toLowerCase().includes('głow')));

  const isLumbarCombo =
    input.primaryProblem === 'lumbar_combo' ||
    uniqueRegions.includes('lower_back') ||
    activeDiagnoses.some((d) => d.toLowerCase().includes('lędźw') || d.toLowerCase().includes('rwa'));

  const isHighPain = currentVas >= 7;
  const isLowPain = currentVas < 4;

  const workType = input.workType || 'desk';
  const dailyMinutes = input.dailyMinutes || (isHighPain ? 10 : 15);

  // 3. Select Adaptation Level & Progression Phase
  let adaptedLevel: 'delicate' | 'standard' | 'strengthening' = 'standard';
  let progressionPhase: ClinicalPersonalizationDiagnostic['progressionPhase'] =
    'phase_2_mobility_restoration';
  let progressionPhaseLabelPl = 'Faza II: Odbudowa ruchomości i równowagi mięśniowej';

  if (isHighPain) {
    adaptedLevel = 'delicate';
    progressionPhase = 'phase_1_acute_relief';
    progressionPhaseLabelPl = 'Faza I: Ochrona antalgiczna i dekompresja osiowa';
  } else if (isLowPain && profile.totalCompletedSessions >= 3) {
    adaptedLevel = 'strengthening';
    progressionPhase = 'phase_3_deep_stabilization';
    progressionPhaseLabelPl = 'Faza III: Głęboka stabilizacja i wytrzymałość posturalna';
  }

  let detectedClinicalPhenotype: ClinicalPersonalizationDiagnostic['detectedClinicalPhenotype'] =
    'upper_crossed_tech_neck';
  let phenotypeLabelPl = 'Zespół skrzyżowania górnego (Tech-Neck / Przeciążenie biurowe)';
  let title = 'Spersonalizowany Plan Fizjoterapii Szyi i Kręgosłupa';
  let description =
    'Wygenerowany przez algorytm kliniczny na podstawie analizy bólu (VAS) oraz profilu zdrowotnego.';
  let goal = 'Redukcja kompresji krążków międzykręgowych, przywrócenie lordozy i zniesienie bólu.';
  let aiRationale = '';
  const contraindicatedExerciseIds: string[] = [];
  const excludedExercisesWithReasons: ClinicalPersonalizationDiagnostic['excludedExercisesWithReasons'] = [];
  let coreExerciseIds: string[] = [];
  let dayExerciseMap: string[][] = [];

  if (isHighPain) {
    detectedClinicalPhenotype = 'acute_protective_spasm';
    phenotypeLabelPl = 'Ostry Zespół Bólowy ze Skurczem Obronnym (Protokół Antalgiczny)';
    title = 'Protokół Kliniczny: Ochronna Dekompresja Ostrego Bólu Karku';
    description =
      'Maksymalnie bezpieczny zestaw odciążający stawy międzykręgowe C3-C7 i wyciszający układ współczulny.';
    goal = 'Wyciszenie nocycepcji, odciążenie korzeni nerwowych i wyłączenie mięśni pomocniczych oddechu.';
    aiRationale = `Wykryto wysoki poziom bólu (VAS ${currentVas}/10). Zastosowano protokół antalgiczny Fazy I: włączono autotrakcję osiową ręcznikiem, oddech dolnożebrowy oraz mikromobilizację podpotyliczną. Wykluczono ćwiczenia oporowe i rotacje, aby nie drażnić tkanek w stanie zapalnym.`;
    contraindicatedExerciseIds.push('isometric-neck', 'neck-rotations', 'scapular-retraction');
    excludedExercisesWithReasons.push(
      {
        exerciseId: 'isometric-neck',
        exerciseName: 'Stabilizacja izometryczna szyi',
        reason: `Przeciwwskazane przy VAS ${currentVas}/10 – napięcie oporowe może nasilić obronny skurcz mięśni karku.`
      },
      {
        exerciseId: 'neck-rotations',
        exerciseName: 'Mobilizacja rotacyjna szyi z pauzą',
        reason: 'Wykluczone w fazie ostrej z uwagi na kompresję otworów międzykręgowych podczas skrętu.'
      },
      {
        exerciseId: 'scapular-retraction',
        exerciseName: 'Wzmacnianie dolnego czworobocznego (W-to-Y)',
        reason: 'Odłożone do czasu spadku bólu poniżej 5/10 VAS (Faza II/III).'
      }
    );
    coreExerciseIds = ['axial-towel-traction', 'diaphragmatic-neck-relief', 'suboccipital-release', 'chin-tuck', 'brugger-relief'];
    dayExerciseMap = [
      ['axial-towel-traction', 'diaphragmatic-neck-relief', 'suboccipital-release'],
      ['diaphragmatic-neck-relief', 'chin-tuck', 'brugger-relief'],
      ['axial-towel-traction', 'suboccipital-release', 'diaphragmatic-neck-relief'],
      ['chin-tuck', 'brugger-relief', 'diaphragmatic-neck-relief'],
      ['axial-towel-traction', 'suboccipital-release', 'chin-tuck'],
      ['diaphragmatic-neck-relief', 'brugger-relief', 'suboccipital-release'],
      ['axial-towel-traction', 'diaphragmatic-neck-relief', 'brugger-relief']
    ];
  } else if (isRadiating) {
    detectedClinicalPhenotype = 'cervical_radiculopathy';
    phenotypeLabelPl = 'Podrażnienie Korzeniowe Splotu Ramiennego i Dyskopatia C5-C7';
    title = 'Protokół Kliniczny: Dekompresja Korzeniowa & Neurodynamika Szyi';
    description = 'Ukierunkowany na ślizg nerwu pośrodkowego, otwarcie otworów międzykręgowych i centralizację objawów.';
    goal = 'Redukcja parestezji (drętwienia/mrowienia), poprawa trofiki nerwu i odciążenie krążków C5-C7.';
    aiRationale = `Uwzględniono objawy promieniowania do kończyny górnej oraz stan zdrowia (${activeDiagnoses.join(', ') || 'profil korzeniowy'}). Wprowadzono technikę ślizgową Nerve Flossing (Slider), autotrakcję osiową ręcznikiem oraz retrakcję szyi. Wykluczono pasywne rozciąganie m. czworobocznego, które naciąga splot ramienny.`;
    contraindicatedExerciseIds.push('trapezius-stretch');
    excludedExercisesWithReasons.push({
      exerciseId: 'trapezius-stretch',
      exerciseName: 'Rozluźnianie mięśnia czworobocznego (Trapezius)',
      reason: 'Skłon boczny z dociążeniem powoduje niekorzystne napięcie (tensioning) podrażnionego splotu ramiennego.'
    });
    coreExerciseIds = ['nerve-floss', 'axial-towel-traction', 'chin-tuck', 'brugger-relief', 'suboccipital-release'];
    dayExerciseMap = [
      ['nerve-floss', 'axial-towel-traction', 'chin-tuck'],
      ['nerve-floss', 'suboccipital-release', 'brugger-relief'],
      ['axial-towel-traction', 'nerve-floss', 'chin-tuck'],
      ['chin-tuck', 'nerve-floss', 'scapular-retraction'],
      ['brugger-relief', 'axial-towel-traction', 'nerve-floss'],
      ['nerve-floss', 'chin-tuck', 'suboccipital-release'],
      ['axial-towel-traction', 'brugger-relief', 'diaphragmatic-neck-relief']
    ];
  } else if (isHeadache) {
    detectedClinicalPhenotype = 'cervicogenic_headache';
    phenotypeLabelPl = 'Szyjno-Pochodny i Napięciowy Ból Głowy (Blokada C0-C2)';
    title = 'Protokół Kliniczny: Terapia Przejścia Szyjno-Czaszkowego i Bólów Głowy';
    description = 'Uwalnianie mięśni podpotylicznych, regulacja tonusu nerwu błędnego i korekcja osi C0-C2.';
    goal = 'Odbarczenie nerwu potylicznego większego, rozluźnienie czepca ścięgnistego i przywrócenie symetrii CROM.';
    aiRationale = `Zintegrowano zgłoszone bóle głowy i czynniki psychosomatyczne (stres/bruksizm). Plan priorytetyzuje rozluźnienie mięśni podpotylicznych (Suboccipital Release), oddech dolnożebrowy 4-2-6 oraz kontrolę rotacji szyi.`;
    coreExerciseIds = ['suboccipital-release', 'diaphragmatic-neck-relief', 'chin-tuck', 'trapezius-stretch', 'brugger-relief'];
    dayExerciseMap = [
      ['suboccipital-release', 'diaphragmatic-neck-relief', 'chin-tuck'],
      ['suboccipital-release', 'trapezius-stretch', 'brugger-relief'],
      ['chin-tuck', 'suboccipital-release', 'neck-rotations'],
      ['suboccipital-release', 'diaphragmatic-neck-relief', 'isometric-neck'],
      ['trapezius-stretch', 'suboccipital-release', 'chin-tuck'],
      ['suboccipital-release', 'neck-rotations', 'brugger-relief'],
      ['diaphragmatic-neck-relief', 'suboccipital-release', 'cat-cow']
    ];
  } else if (isLumbarCombo) {
    detectedClinicalPhenotype = 'axial_cervico_lumbar';
    phenotypeLabelPl = 'Wielopoziomowa Dysfunkcja Osi Kręgosłupa (Szyja C1-C7 + Lędźwie L4-S1)';
    title = 'Protokół Kliniczny: Zintegrowana Oś Kręgosłupa (Szyja + Lędźwie McKenzie)';
    description = 'Kompleksowa terapia łącząca centralizację lędźwiową McKenziego z korekcją protrakcji głowy.';
    goal = 'Synchronizacja krzywizn fizjologicznych (lordoza szyjna i lędźwiowa) oraz mobilizacja piersiowa.';
    aiRationale = `Uwzględniono dolegliwości dolnego odcinka kręgosłupa oraz szyi. Zastosowano przeprosty McKenziego (Prone Press-Up), mobilizację segmentarną Koci Grzbiet oraz retrakcję szyjną i stabilizację łopatek.`;
    coreExerciseIds = ['lumbar-extension', 'cat-cow', 'chin-tuck', 'scapular-retraction', 'brugger-relief'];
    dayExerciseMap = [
      ['chin-tuck', 'lumbar-extension', 'cat-cow'],
      ['brugger-relief', 'scapular-retraction', 'lumbar-extension'],
      ['chin-tuck', 'lumbar-extension', 'suboccipital-release'],
      ['cat-cow', 'isometric-neck', 'lumbar-extension'],
      ['chin-tuck', 'scapular-retraction', 'brugger-relief'],
      ['lumbar-extension', 'neck-rotations', 'cat-cow'],
      ['brugger-relief', 'cat-cow', 'lumbar-extension']
    ];
  } else {
    detectedClinicalPhenotype = 'upper_crossed_tech_neck';
    phenotypeLabelPl = 'Zespół Skrzyżowania Górnego i Protrakcja Głowy (Tech-Neck)';
    title = 'Protokół Kliniczny: Korekcja Tech-Neck & Głęboka Stabilizacja Szyi';
    description = 'Odbudowa wyprostu piersiowego, retrakcji szyjnej C1-C7 i wytrzymałości dolnych stabilizatorów łopatek.';
    goal = 'Redukcja przeciążenia od monitora, otwarcie taśmy przedniej i wzmocnienie gorsetu głębokiego szyi.';
    aiRationale = `Na podstawie wywiadu pracy (${workType === 'desk' ? 'praca biurowa przed ekranem' : 'obciążenie mieszane'}), średniego bólu VAS ${avgVas}/10 oraz pomiarów CROM dobrano synergiczny zestaw: retrakcję brody (Chin Tuck), wzmacnianie łopatek W-to-Y, izometrię szyi i odciążenie wg Brüggera.`;
    coreExerciseIds = ['chin-tuck', 'scapular-retraction', 'isometric-neck', 'trapezius-stretch', 'brugger-relief', 'neck-rotations'];
    dayExerciseMap = [
      ['chin-tuck', 'suboccipital-release', 'brugger-relief'],
      ['chin-tuck', 'trapezius-stretch', 'scapular-retraction'],
      ['neck-rotations', 'suboccipital-release', 'brugger-relief'],
      ['chin-tuck', 'isometric-neck', 'scapular-retraction'],
      ['trapezius-stretch', 'brugger-relief', 'cat-cow'],
      ['chin-tuck', 'isometric-neck', 'neck-rotations'],
      ['brugger-relief', 'scapular-retraction', 'cat-cow']
    ];
  }

  // 4. Generate Tailored Exercise Prescriptions (Optymalny zestaw ćwiczeń z indywidualnym dawkowaniem)
  const doseScale = isHighPain ? 0.7 : adaptedLevel === 'strengthening' ? 1.2 : 1.0;
  const ageHoldFactor = patientAge >= 60 ? 0.85 : 1.0;

  const prescribedExercises: PersonalizedExercisePrescription[] = coreExerciseIds
    .map((exId) => {
      const ex = EXERCISES.find((e) => e.id === exId);
      if (!ex) return null;

      const prescribedSets = Math.max(1, Math.round(ex.defaultSets * (isHighPain ? 0.75 : 1)));
      const prescribedReps = Math.max(3, Math.round(ex.defaultReps * doseScale));
      const prescribedHoldSeconds = Math.max(
        2,
        Math.round(ex.defaultHoldSeconds * ageHoldFactor * (isHighPain ? 0.8 : 1))
      );

      let clinicalPriority: PersonalizedExercisePrescription['clinicalPriority'] = 'postural_stability';
      let priorityLabelPl = 'Stabilizacja posturalna';
      let selectionReason = `Kluczowe ćwiczenie dla profilu: ${phenotypeLabelPl}.`;

      if (ex.id === 'axial-towel-traction' || ex.id === 'chin-tuck' || ex.id === 'lumbar-extension') {
        clinicalPriority = 'core_decompression';
        priorityLabelPl = 'Dekompresja krążków';
        selectionReason = 'Zmniejsza ciśnienie wewnątrzdyskowe i przywraca fizjologiczną oś kręgów.';
      } else if (ex.id === 'nerve-floss' || ex.id === 'neck-rotations' || ex.id === 'cat-cow') {
        clinicalPriority = 'neuro_mobility';
        priorityLabelPl = 'Neurodynamika i ROM';
        selectionReason = hasRotationDeficit
          ? `Włączone celowo w celu wyrównania wykrytego deficytu CROM (asymetria ${rotationAsymmetryDeg}°).`
          : 'Poprawia ślizg tkankowy i bezbolesny zakres ruchu stawowego.';
      } else if (
        ex.id === 'suboccipital-release' ||
        ex.id === 'trapezius-stretch' ||
        ex.id === 'diaphragmatic-neck-relief'
      ) {
        clinicalPriority = 'myofascial_release';
        priorityLabelPl = 'Rozluźnianie mięśniowo-powięziowe';
        selectionReason = 'Obniża napięcie spoczynkowe pasm przeciążonych stresem i pracą statyczną.';
      }

      const safetyModification = isHighPain
        ? `Zredukowano objętość o 25% (VAS ${currentVas}/10) – wykonuj w 70% zakresu ruchu z wolnym wydechem.`
        : adaptedLevel === 'strengthening'
        ? 'Zwiększono liczbę powtórzeń o 20% w celu budowy wytrzymałości głębokich stabilizatorów.'
        : 'Dawkowanie standardowe dopasowane do aktualnej tolerancji tkankowej.';

      return {
        exerciseId: ex.id,
        exerciseName: ex.polishName,
        prescribedSets,
        prescribedReps,
        prescribedHoldSeconds,
        prescribedTempo: isHighPain ? '3-4-3' : ex.tempo,
        clinicalPriority,
        priorityLabelPl,
        selectionReason,
        safetyModification
      };
    })
    .filter((item): item is PersonalizedExercisePrescription => item !== null);

  const personalizationDiagnostic: ClinicalPersonalizationDiagnostic = {
    computedAt: new Date().toISOString(),
    avgVasLast7Days: avgVas,
    vasTrendDelta,
    dominantPainRegions: uniqueRegions,
    dominantPainCharacter: dominantCharacter,
    detectedClinicalPhenotype,
    phenotypeLabelPl,
    progressionPhase,
    progressionPhaseLabelPl,
    healthRiskFactors,
    excludedExercisesWithReasons,
    prescribedExercises
  };

  // 5. Integrated Daily Schedule with Medications and Reminders
  const morningMeds = medications.filter(
    (m) => m.scheduleTimes && m.scheduleTimes.some((t) => parseInt(t.split(':')[0], 10) < 12)
  );
  const eveningMeds = medications.filter(
    (m) => m.scheduleTimes && m.scheduleTimes.some((t) => parseInt(t.split(':')[0], 10) >= 18)
  );

  const rehabTime = reminders.rehabSessionTime || '17:30';
  const focusLabels = [
    'Dekompresja początkowa i oddech',
    'Wzmacnianie i stabilizacja łopatek',
    'Uwalnianie napięć podpotylicznych',
    'Stabilizacja izometryczna kręgów',
    'Otwieranie klatki i reset powięzi',
    'Płynność zakresu rotacji',
    'Regeneracja i utrwalenie postawy'
  ];

  const days: TrainingDay[] = dayNames.map((name, index) => {
    const exList = dayExerciseMap[index] || ['chin-tuck', 'brugger-relief'];
    const schedule: DayScheduleItem[] = [];

    if (morningMeds.length > 0) {
      schedule.push({
        time: '08:00',
        type: 'med',
        category: 'medication',
        title: 'Poranne leki / suplementy',
        description: morningMeds.map((m) => `${m.name} (${m.dosage})`).join(', '),
        badge: 'Farmakologia'
      });
    }

    schedule.push({
      time: '08:30',
      type: 'ergonomics',
      category: 'ergonomics',
      title: 'Poranny rozruch karku',
      description: '2 minuty delikatnego cofania brody (Chin Tuck) przed rozpoczęciem pracy',
      badge: 'Profilaktyka'
    });

    if (workType === 'desk' || workType === 'mixed') {
      schedule.push({
        time: '12:30',
        type: 'break',
        category: 'break',
        title: 'Mikropauza ergonomiczna (Zasada 20-20-20)',
        description: '1 minuta w pozycji odciążającej Brüggera i spojrzenie w dal na 6 metrów',
        badge: 'Ergonomia'
      });
    }

    schedule.push({
      time: rehabTime,
      type: 'rehab',
      category: 'exercise',
      title: `Główna Sesja Rehabilitacyjna (${dailyMinutes} min)`,
      description: `Sekwencja ${exList.length} ćwiczeń z wideo HD (HUD + pętla) i przewodnikiem oddechowym`,
      badge: 'Sesja Główna'
    });

    if (eveningMeds.length > 0) {
      schedule.push({
        time: '21:00',
        type: 'med',
        category: 'medication',
        title: 'Wieczorne leki / maści karku',
        description: eveningMeds.map((m) => `${m.name} (${m.dosage})`).join(', '),
        badge: 'Farmakologia'
      });
    }

    schedule.push({
      time: '21:30',
      type: 'ergonomics',
      category: 'ergonomics',
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
    primaryProblem:
      input.primaryProblem ||
      (isRadiating ? 'shoulder_radiating' : isHeadache ? 'headache' : isLumbarCombo ? 'lumbar_combo' : 'tech_neck'),
    dailyMinutes,
    workType,
    startDate: new Date().toISOString(),
    days,
    adaptedLevel,
    aiRationale,
    contraindicatedExerciseIds,
    recommendedBreakIntervalMinutes: reminders.officeBreakIntervalMinutes || 60,
    integratedMedicationsSummary: medsSummary,
    dailySchedule: days[0]?.dailySchedule || [],
    personalizationDiagnostic
  };
}

function translatePainCharacter(ch: PainReport['character']): string {
  switch (ch) {
    case 'sharp':
      return 'ostry / kłujący';
    case 'burning':
      return 'piekący / neurogenny';
    case 'throbbing':
      return 'pulsujący';
    case 'stiff':
      return 'sztywność poranna / napięciowy';
    default:
      return 'tępy / przeciążeniowy';
  }
}

/**
 * Generates initial longitudinal exercise session history records for UserHealthProfile.exerciseHistory
 */
export function createDefaultExerciseHistory(planId = 'plan-initial'): ExerciseSessionHistoryEntry[] {
  const now = Date.now();
  return [
    {
      id: 'session-hist-1',
      timestamp: new Date(now - 5 * 86400000).toISOString(),
      dateStr: new Date(now - 5 * 86400000).toISOString().split('T')[0],
      planId,
      dayIndex: 0,
      dayFocusArea: 'Dekompresja początkowa i oddech',
      durationMinutes: 12,
      preSessionVas: 6,
      postSessionVas: 3,
      vasDelta: -3,
      difficultyLevel: 2,
      usedBreathingGuide: true,
      avgHeartRateBpm: 68,
      patientMood: 'tense',
      stressLevel: 6,
      sessionNotes: 'Wyraźna ulga pod potylicą po zastosowaniu tempa 0.5x w Chin Tuck.',
      adherenceScorePercent: 100,
      exercisesExecuted: [
        {
          exerciseId: 'chin-tuck',
          exerciseName: 'Cofanie brody (Retrakcja szyi)',
          targetRegion: 'cervical',
          completedSets: 3,
          completedReps: 10,
          holdSecondsAchieved: 4,
          tempoUsed: '2-4-2',
          perceivedDifficultyRpe: 3,
          painDuringExerciseVas: 2,
          usedSlowMotionVideo: true
        },
        {
          exerciseId: 'suboccipital-release',
          exerciseName: 'Rozluźnienie mięśni podpotylicznych',
          targetRegion: 'cervical',
          completedSets: 1,
          completedReps: 3,
          holdSecondsAchieved: 30,
          tempoUsed: '1-30-1',
          perceivedDifficultyRpe: 2,
          painDuringExerciseVas: 1,
          usedSlowMotionVideo: false
        },
        {
          exerciseId: 'brugger-relief',
          exerciseName: 'Otwieranie klatki i odciążenie wg Brüggera',
          targetRegion: 'thoracic',
          completedSets: 1,
          completedReps: 5,
          holdSecondsAchieved: 15,
          tempoUsed: '2-15-2',
          perceivedDifficultyRpe: 2,
          painDuringExerciseVas: 1,
          usedSlowMotionVideo: false
        }
      ]
    },
    {
      id: 'session-hist-2',
      timestamp: new Date(now - 3 * 86400000).toISOString(),
      dateStr: new Date(now - 3 * 86400000).toISOString().split('T')[0],
      planId,
      dayIndex: 1,
      dayFocusArea: 'Wzmacnianie i stabilizacja łopatek',
      durationMinutes: 14,
      preSessionVas: 5,
      postSessionVas: 2,
      vasDelta: -3,
      difficultyLevel: 3,
      usedBreathingGuide: true,
      avgHeartRateBpm: 72,
      patientMood: 'calm',
      stressLevel: 4,
      sessionNotes: 'Stabilizacja W-to-Y aktywowała mięśnie między łopatkami bez unoszenia barków.',
      adherenceScorePercent: 100,
      exercisesExecuted: [
        {
          exerciseId: 'chin-tuck',
          exerciseName: 'Cofanie brody (Retrakcja szyi)',
          targetRegion: 'cervical',
          completedSets: 3,
          completedReps: 10,
          holdSecondsAchieved: 4,
          tempoUsed: '2-4-2',
          perceivedDifficultyRpe: 3,
          painDuringExerciseVas: 1,
          usedSlowMotionVideo: false
        },
        {
          exerciseId: 'trapezius-stretch',
          exerciseName: 'Rozluźnianie mięśnia czworobocznego (Trapezius)',
          targetRegion: 'cervical',
          completedSets: 2,
          completedReps: 3,
          holdSecondsAchieved: 20,
          tempoUsed: '2-20-2',
          perceivedDifficultyRpe: 2,
          painDuringExerciseVas: 1,
          usedSlowMotionVideo: true
        },
        {
          exerciseId: 'scapular-retraction',
          exerciseName: 'Wzmacnianie dolnego czworobocznego (W-to-Y)',
          targetRegion: 'thoracic',
          completedSets: 3,
          completedReps: 10,
          holdSecondsAchieved: 2,
          tempoUsed: '2-2-2',
          perceivedDifficultyRpe: 4,
          painDuringExerciseVas: 2,
          usedSlowMotionVideo: true
        }
      ]
    },
    {
      id: 'session-hist-3',
      timestamp: new Date(now - 1 * 86400000).toISOString(),
      dateStr: new Date(now - 1 * 86400000).toISOString().split('T')[0],
      planId,
      dayIndex: 3,
      dayFocusArea: 'Stabilizacja izometryczna kręgów',
      durationMinutes: 15,
      preSessionVas: 4,
      postSessionVas: 1,
      vasDelta: -3,
      difficultyLevel: 3,
      usedBreathingGuide: true,
      avgHeartRateBpm: 70,
      patientMood: 'relaxed',
      stressLevel: 3,
      sessionNotes: 'Pełna kontrola oddechu podczas 5-sekundowej izometrii szyi.',
      adherenceScorePercent: 100,
      exercisesExecuted: [
        {
          exerciseId: 'chin-tuck',
          exerciseName: 'Cofanie brody (Retrakcja szyi)',
          targetRegion: 'cervical',
          completedSets: 3,
          completedReps: 10,
          holdSecondsAchieved: 5,
          tempoUsed: '2-4-2',
          perceivedDifficultyRpe: 2,
          painDuringExerciseVas: 1,
          usedSlowMotionVideo: false
        },
        {
          exerciseId: 'isometric-neck',
          exerciseName: 'Stabilizacja izometryczna szyi',
          targetRegion: 'cervical',
          completedSets: 2,
          completedReps: 5,
          holdSecondsAchieved: 5,
          tempoUsed: '1-5-1',
          perceivedDifficultyRpe: 3,
          painDuringExerciseVas: 1,
          usedSlowMotionVideo: true
        },
        {
          exerciseId: 'scapular-retraction',
          exerciseName: 'Wzmacnianie dolnego czworobocznego (W-to-Y)',
          targetRegion: 'thoracic',
          completedSets: 3,
          completedReps: 10,
          holdSecondsAchieved: 2,
          tempoUsed: '2-2-2',
          perceivedDifficultyRpe: 3,
          painDuringExerciseVas: 1,
          usedSlowMotionVideo: false
        }
      ]
    }
  ];
}

/**
 * Aggregates longitudinal exercise history and patient metrics into UserRehabProgressSummary
 */
export function computeUserRehabProgressSummary(
  profile: UserHealthProfile,
  history: ExerciseSessionHistoryEntry[]
): UserRehabProgressSummary {
  const effectiveHistory =
    history && history.length > 0 ? history : createDefaultExerciseHistory();

  let totalRepsCompleted = 0;
  let totalIsometricSeconds = 0;
  let totalRehabMinutes = 0;
  let sumPreVas = 0;
  let sumPostVas = 0;

  const masteryMap: Record<string, ExerciseMasteryMetric> = {};

  effectiveHistory.forEach((session) => {
    totalRehabMinutes += session.durationMinutes;
    sumPreVas += session.preSessionVas;
    sumPostVas += session.postSessionVas;

    session.exercisesExecuted.forEach((rec) => {
      const exTotalReps = rec.completedSets * rec.completedReps;
      const exIsoSec = exTotalReps * rec.holdSecondsAchieved;
      totalRepsCompleted += exTotalReps;
      totalIsometricSeconds += exIsoSec;

      const existing = masteryMap[rec.exerciseId];
      if (!existing) {
        masteryMap[rec.exerciseId] = {
          exerciseId: rec.exerciseId,
          exerciseName: rec.exerciseName,
          sessionsCount: 1,
          totalSetsCompleted: rec.completedSets,
          totalRepsCompleted: exTotalReps,
          totalIsometricHoldSeconds: exIsoSec,
          avgVasDelta: session.vasDelta,
          masteryLevel: 'początkujący',
          lastPerformedAt: session.dateStr
        };
      } else {
        const nextSessions = existing.sessionsCount + 1;
        const nextSets = existing.totalSetsCompleted + rec.completedSets;
        const nextReps = existing.totalRepsCompleted + exTotalReps;
        const nextIso = existing.totalIsometricHoldSeconds + exIsoSec;
        const nextDelta = Number(
          ((existing.avgVasDelta * existing.sessionsCount + session.vasDelta) / nextSessions).toFixed(1)
        );
        masteryMap[rec.exerciseId] = {
          ...existing,
          sessionsCount: nextSessions,
          totalSetsCompleted: nextSets,
          totalRepsCompleted: nextReps,
          totalIsometricHoldSeconds: nextIso,
          avgVasDelta: nextDelta,
          masteryLevel:
            nextSessions >= 5
              ? 'zaawansowany'
              : nextSessions >= 2
              ? 'średniozaawansowany'
              : 'początkujący',
          lastPerformedAt:
            session.dateStr > existing.lastPerformedAt ? session.dateStr : existing.lastPerformedAt
        };
      }
    });
  });

  const count = effectiveHistory.length || 1;
  const meanPreSessionVas = Number((sumPreVas / count).toFixed(1));
  const meanPostSessionVas = Number((sumPostVas / count).toFixed(1));
  const meanVasReductionPerSession = Number((meanPreSessionVas - meanPostSessionVas).toFixed(1));

  // CROM improvement calculation
  let cromRotationImprovementDeg = 12;
  if (profile.mobilityTests && profile.mobilityTests.length >= 2) {
    const newest = profile.mobilityTests[0];
    const oldest = profile.mobilityTests[profile.mobilityTests.length - 1];
    const newestAvg = (newest.neckRotationLeftDeg + newest.neckRotationRightDeg) / 2;
    const oldestAvg = (oldest.neckRotationLeftDeg + oldest.neckRotationRightDeg) / 2;
    cromRotationImprovementDeg = Math.round(newestAvg - oldestAvg);
  }

  const completedDatesCount = profile.completedSessionDates?.length || effectiveHistory.length;
  const adherence30DayPercent = Math.min(100, Math.round((completedDatesCount / 20) * 100));

  return {
    lastUpdatedAt: new Date().toISOString(),
    totalSessionsCompleted: Math.max(profile.totalCompletedSessions || 0, effectiveHistory.length),
    totalRepsCompleted,
    totalIsometricMinutes: Number((totalIsometricSeconds / 60).toFixed(1)),
    totalRehabMinutes,
    currentStreakDays: profile.streakDays || 4,
    longestStreakDays: Math.max(profile.streakDays || 4, 7),
    meanPreSessionVas,
    meanPostSessionVas,
    meanVasReductionPerSession,
    adherence30DayPercent,
    cromRotationImprovementDeg,
    exerciseMasteryById: masteryMap
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
      birthYear: 1988,
      gender: 'other',
      pinLockEnabled: false,
      isUnlocked: true,
      theme: 'light',
      diagnoses: ['Przeciążenie posturalne odcinka szyjnego', 'Objawy tech-neck'],
      notes: '',
      streakDays: 4,
      lastActiveDate: '',
      totalCompletedSessions: 6,
      mobilityTests: [
        {
          date: new Date().toISOString().split('T')[0],
          neckRotationLeftDeg: 72,
          neckRotationRightDeg: 65,
          neckFlexionCm: 1.5,
          neckExtensionDeg: 60
        }
      ]
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
    dailyMinutes: params.dailyMinutes,
    baselineVas: params.baselineVas
  });
}
