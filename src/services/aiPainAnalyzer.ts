import { PainReport, TriageResult, PatientMood } from '../types';

export function analyzePainSymptomsOffline(input: {
  vasScore: number;
  region: PainReport['region'];
  character: PainReport['character'];
  triggers: string[];
  associatedSymptoms: string[];
  durationDays?: number;
  stressLevel?: number;
  mood?: PatientMood;
  psychosomaticNotes?: string;
}): TriageResult {
  const redFlags: string[] = [];
  const associated = input.associatedSymptoms;
  const triggers = input.triggers;
  const vas = input.vasScore;
  const stress = input.stressLevel;
  const mood = input.mood;

  // 1. Red flags evaluation (Czerwone Flagi - Wytyczne Kliniczne Fizjoterapii Kręgosłupa)
  if (associated.includes('zawroty_glowy') && (associated.includes('nudnosci') || associated.includes('zaburzenia_widzenia'))) {
    redFlags.push('Możliwe zaburzenia przepływu w tętnicach kręgowo-podstawnych (VBI) lub problem błędnikowy.');
  }

  if (associated.includes('opadajaca_dlon') || associated.includes('utrata_sily_chwytu')) {
    redFlags.push('Poważny ubytek neurologiczny: osłabienie siły mięśniowej kończyny (niedowład motoryczny).');
  }

  if (associated.includes('dretwienie_obu_rak') || associated.includes('zaburzenia_chodu')) {
    redFlags.push('Podejrzenie ucisku na rdzeń kręgowy w odcinku szyjnym (cechy mielopatii szyjnej).');
  }

  if (associated.includes('zaburzenia_zwieraczy') || associated.includes('dretwienie_krocza')) {
    redFlags.push('ALARM: Podejrzenie zespołu ogona końskiego lub ciężkiego ucisku rdzeniowego. Wskazany pilny SOR.');
  }

  if (vas >= 9 && associated.includes('goraczka')) {
    redFlags.push('Ostry ból połączony z objawami ogólnoustrojowymi (możliwy stan zapalny/infekcyjny).');
  }

  if (triggers.includes('niedawny_wypadek') || triggers.includes('upadek_uraz')) {
    redFlags.push('Ostry uraz mechaniczny kręgosłupa szyjnego (wymaga wykluczenia pęknięcia/złamania RTG/TK).');
  }

  // 2. Risk level determination
  let riskLevel: TriageResult['riskLevel'] = 'low';
  let urgency: TriageResult['urgency'] = 'routine';

  if (redFlags.length > 0 || vas >= 9) {
    riskLevel = 'high_consult_doctor';
    urgency = 'urgent_medical_review';
  } else if (vas >= 6 || associated.includes('mrowienie_palcow') || associated.includes('promieniowanie_do_reki')) {
    riskLevel = 'moderate';
    urgency = 'observation';
  }

  // 3. Dermatome & Segmental Mapping
  let dermatomeAffected: string | undefined = undefined;
  if (input.region === 'radiating_arm' || associated.includes('mrowienie_palcow')) {
    if (associated.includes('mrowienie_kciuka')) {
      dermatomeAffected = 'Korzeń C6 (kciuk i strona promieniowa przedramienia – segment C5/C6)';
    } else if (associated.includes('mrowienie_palca_srodkowego')) {
      dermatomeAffected = 'Korzeń C7 (palec środkowy, triceps – segment C6/C7, najczęstszy poziom dyskopatii)';
    } else if (associated.includes('mrowienie_malego_palca')) {
      dermatomeAffected = 'Korzeń C8 (palec mały i serdeczny, strona łokciowa – segment C7/Th1)';
    } else {
      dermatomeAffected = 'Odcinek C5-C7 (splot ramienny / korzenie szyjne)';
    }
  }

  // 4. Primary Suspicion & Clinical Explanation
  let primarySuspicion = '';
  let explanation = '';
  const immediateReliefAdvice: string[] = [];
  const recommendedExercises: string[] = [];
  const contraindicatedExercises: string[] = [];
  const doctorQuestions: string[] = [];

  if (riskLevel === 'high_consult_doctor') {
    primarySuspicion = 'Wymagana pilna weryfikacja lekarska (Czerwone Flagi)';
    explanation = `Wykryto objawy alarmowe (${redFlags.join(', ')}). W takim stanie bezwzględnie zaleca się konsultację z lekarzem (neurologiem lub ortopedą) przed podjęciem ćwiczeń ruchowych.`;
    immediateReliefAdvice.push('Przerwij wykonywanie forsownych ćwiczeń i skrajnych ruchów głowy.');
    immediateReliefAdvice.push('Zastosuj pozycję bezpieczną w leżeniu na plecach z małą anatomiczną poduszką lub zwiniętym ręcznikiem pod karkiem.');
    immediateReliefAdvice.push('Unikaj nagłych obrotów głowy oraz podnoszenia ciężarów powyżej 2 kg.');
    contraindicatedExercises.push('Skrajne rotacje szyi', 'Skłony głowy w dół z siłą', 'Dźwiganie i intensywne ćwiczenia izometryczne');
    doctorQuestions.push('Czy konieczne jest pilne wykonanie rezonansu magnetycznego (MRI) odcinka szyjnego?');
    doctorQuestions.push('Czy występują deficyty odruchów ścięgnistych lub osłabienie siły mięśniowej?');
  } else if (input.region === 'neck' || input.region === 'nape') {
    if (input.character === 'stiff' || triggers.includes('dluga_praca_przy_komputerze')) {
      primarySuspicion = 'Zespół posturalny ("Tech-Neck") i przeciążenie mm. podpotylicznych';
      explanation = 'Wysunięcie głowy do przodu (protrakcja) generuje przeciążenie rzędu 20-27 kg na odcinek C5-C7. Dochodzi do przykurczu mięśni czworobocznych i osłabienia głębokich zginaczy szyi.';
      recommendedExercises.push('chin-tuck', 'suboccipital-release', 'brugger-relief', 'trapezius-stretch');
      contraindicatedExercises.push('Krążenia głową', 'Gwałtowne naciąganie karku w dół');
      immediateReliefAdvice.push('Pozycja odciążenia Brüggera co 45 minut pracy przy biurku.');
      immediateReliefAdvice.push('Ciepły, łagodny kompres na kark (15 minut) w celu zmniejszenia napięcia mięśniowego.');
      immediateReliefAdvice.push('Uniesienie monitora tak, aby górna krawędź ekranu była dokładnie na linii wzroku.');
      doctorQuestions.push('Czy wskazana jest manualna terapia punktów spustowych mięśni czworobocznych?');
    } else {
      primarySuspicion = 'Podostre napięcie mięśniowo-powięziowe odcinka szyjnego';
      explanation = 'Napięcie o charakterze adaptacyjnym, często związane ze stresem, wymuszoną pozycją snu lub mikrourazem statycznym.';
      recommendedExercises.push('chin-tuck', 'isometric-neck', 'neck-rotations', 'trapezius-stretch');
      immediateReliefAdvice.push('Wydłużanie osiowe kręgosłupa z delikatnym cofnięciem brody.');
      immediateReliefAdvice.push('Sprawdzenie poduszki do spania (zalecana poduszka ortopedyczna z pianki z pamięcią).');
    }
  } else if (input.region === 'radiating_arm') {
    primarySuspicion = 'Podrażnienie korzenia nerwowego szyjnego / Zespół korzeniowy';
    explanation = `Objawy promieniowania i mrowienia wskazują na ucisk mechaniczny lub obrzęk zapalny w otoczeniu otworów międzykręgowych (${dermatomeAffected || 'C5-C7'}). Wskazana jest neurodynamika i ostrożność.`;
    recommendedExercises.push('nerve-floss', 'chin-tuck', 'brugger-relief');
    contraindicatedExercises.push('Gwałtowne przeprosty szyi do tyłu', 'Mocne skręty głowy w stronę bolącej ręki');
    immediateReliefAdvice.push('Odciążenie kończyny: podeprzyj łokieć poduszką podczas siedzenia, aby zdjąć ciężar ręki ze splotu szyjnego.');
    immediateReliefAdvice.push('Zastosuj zasadę centralizacji: jeśli ruch zmniejsza ból w ręce, jest korzystny.');
    doctorQuestions.push('Czy stopień ucisku korzenia kwalifikuje się do leczenia zachowawczego z fizjoterapią celowaną?');
    doctorQuestions.push('Czy warto włączyć okresowo leki neuroprotekcyjne (np. witaminy z grupy B) lub przeciwzapalne?');
  } else if (input.region === 'shoulder_blade') {
    primarySuspicion = 'Blokada funkcjonalna stawów żebrowo-kręgowych lub punkt spustowy m. dźwigacza łopatki';
    explanation = 'Kłujący lub piekący ból w okolicy przyśrodkowego brzegu łopatki najczęściej wynika z rzutowania bólu z dolnego odcinka szyjnego (C6-C7) lub osłabienia dolnego stabilizatora łopatki.';
    recommendedExercises.push('scapular-retraction', 'trapezius-stretch', 'cat-cow', 'brugger-relief');
    immediateReliefAdvice.push('Ściągnięcie łopatek w dół (w stronę kieszeni) z wydłużeniem szyi.');
    immediateReliefAdvice.push('Rolowanie delikatną piłeczką miękkotkankową rejonu między łopatką a kręgosłupem.');
  } else if (input.region === 'headache') {
    primarySuspicion = 'Szyjnopochodny ból głowy (Cervicogenic Headache)';
    explanation = 'Ból rzutowany z górnych segmentów szyjnych C1-C3 i mięśni podpotylicznych do potylicy, skroni lub za gałkę oczną.';
    recommendedExercises.push('suboccipital-release', 'chin-tuck', 'neck-rotations');
    immediateReliefAdvice.push('Delikatny ucisk opuszkami kciuków w dołkach podpotylicznych przez 30-60 sekund.');
    immediateReliefAdvice.push('Zaciemnienie pokoju, nawodnienie i unikanie ekranów przez minimum 20 minut.');
  } else {
    primarySuspicion = 'Przeciążenie statyczne kręgosłupa lędźwiowo-miednicznego';
    explanation = 'Długotrwałe siedzenie spłaszcza lordozę lędźwiową i zwiększa ciśnienie śróddyskowe o ponad 140% w stosunku do stania.';
    recommendedExercises.push('lumbar-extension', 'cat-cow', 'brugger-relief');
    immediateReliefAdvice.push('Pozycja leżenia przodem (na brzuchu) przez 3-5 minut dla odciążenia dysków.');
    immediateReliefAdvice.push('Wstanie i 2-minutowy spacer co 50 minut siedzenia.');
  }

  // 5. Psychosomatic correlation & autonomic stress modulation
  if (stress !== undefined && stress >= 6) {
    explanation += ` Zaobserwowano istotny komponent psychosomatyczny: podwyższony poziom stresu (${stress}/10) bezpośrednio stymuluje układ współczulny, powodując obronny przykurcz mm. czworobocznych i dźwigaczy łopatek.`;
    immediateReliefAdvice.push('Włącz 3-minutowy trening oddechowy 4-7-8 z asystentem biofeedbacku przed rozpoczęciem ćwiczeń.');
    if (!recommendedExercises.includes('brugger-relief')) {
      recommendedExercises.unshift('brugger-relief');
    }
  }

  if (mood === 'tense' || mood === 'exhausted' || mood === 'irritated') {
    doctorQuestions.push('W jaki sposób techniki relaksacji somatycznej (np. relaksacja Jacobsona, oddech przeponowy) mogą wspomóc leczenie dolegliwości karku?');
  }

  return {
    riskLevel,
    urgency,
    primarySuspicion,
    dermatomeAffected,
    redFlagsDetected: redFlags,
    explanation,
    recommendedExercises,
    contraindicatedExercises,
    immediateReliefAdvice,
    doctorQuestions
  };
}
