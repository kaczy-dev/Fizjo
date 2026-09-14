import { Exercise } from '../types';
import { EXERCISES } from '../data/exercises';

export interface BiomechanicalModification {
  title: string;
  issueDetected: string;
  anatomicalCause: string;
  correction: string;
  cuePrompt: string; // e.g. "Cofaj brodę jak szufladę, zachowując wzrok na linii horyzontu"
}

export interface AIExpertAnswer {
  id: string;
  query: string;
  timestamp: string;
  summary: string;
  biomechanicalModifications: BiomechanicalModification[];
  safetyWarnings: string[];
  recommendedExercise?: Exercise;
  followUpTips: string[];
  source: 'free_ai' | 'clinical_engine' | 'gemini';
}

/**
 * Intelligent clinical biomechanics analysis engine.
 * Provides immediate expert kinesiology advice and modifications,
 * working seamlessly offline or as fallback when API key is not supplied.
 */
export function analyzeTechniqueOffline(query: string): AIExpertAnswer {
  const q = query.toLowerCase();

  // 1. Chin tuck / retrakcja brody
  if (q.includes('brod') || q.includes('chin') || q.includes('retrakcj') || q.includes('szuflad')) {
    const ex = EXERCISES.find(e => e.id === 'chin-tuck');
    return {
      id: `ai-expert-${Date.now()}`,
      query,
      timestamp: new Date().toISOString(),
      summary: 'Retrakcja szyjna (Chin Tuck) wymaga czystego ruchu ślizgowego w płaszczyźnie poziomej bez zgięcia głowy w dół ani przeprostu w tył.',
      biomechanicalModifications: [
        {
          title: 'Wektor ruchu ściśle horyzontalny (Translacjowy)',
          issueDetected: 'Częsty błąd: przyciąganie brody do mostka (zgięcie zamiast translacji).',
          anatomicalCause: 'Zgięcie w dół aktywuje powierzchowny mięsień mostkowo-obojczykowo-sutkowy (MOS), zamiast wyizolować głębokie zginacze szyi (Longus colli i Longus capitis).',
          correction: 'Utrzymuj wzrok stale na wysokości horyzontu. Wyobraź sobie, że głowa porusza się jak szuflada zamykana idealnie równolegle do podłogi.',
          cuePrompt: 'Wzrok na horyzont • Cofaj czubek brody prosto w głąb potylicy'
        },
        {
          title: 'Rozluźnienie obręczy barkowej',
          issueDetected: 'Unoszenie barków (elewacja łopatek) podczas cofania karku.',
          anatomicalCause: 'Nadaktywność mięśnia dźwigacza łopatki i części zstępującej mięśnia czworobocznego.',
          correction: 'Przed ruchem opuść barki w stronę kieszeni i rozluźnij szczękę (czubek języka na podniebieniu).',
          cuePrompt: 'Barki daleko od uszu • Luźna żuchwa'
        },
        {
          title: 'Subtelna siła nacisku (20-30% maksa)',
          issueDetected: 'Zbyt agresywne dopychanie palcami do granicy bólu.',
          anatomicalCause: 'Stawy międzywyrostkowe C1-C3 ulegają kompresji, co może wywołać ból podpotyliczny.',
          correction: 'Dwa palce na brodzie służą jedynie jako sensor propriocepcji, a nie siłownik. Ruch wykonują same mięśnie szyi.',
          cuePrompt: 'Delikatne wydłużenie tyłu głowy ku sufitowi'
        }
      ],
      safetyWarnings: [
        'Jeśli podczas retrakcji czujesz zawroty głowy, mroczki lub drętwienie w palcach dłoni, natychmiast przerwij ćwiczenie.',
        'W ostrym stanie dyskopatii szyjnej ze świeżym uciskiem korzeniowym ruch wykonuj wyłącznie w bezbólowym zakresie.'
      ],
      recommendedExercise: ex,
      followUpTips: [
        'Wykonuj 5-8 powtórzeń co 45 minut pracy przy biurku.',
        'Możesz wykonać to ćwiczenie opierając potylicę o ścianę dla idealnej kontroli płaszczyzny.'
      ],
      source: 'clinical_engine'
    };
  }

  // 2. Pozycja Brüggera / mikroprzerwa biurowa
  if (q.includes('brügger') || q.includes('brugger') || q.includes('biurk') || q.includes('siedz') || q.includes('przerw')) {
    const ex = EXERCISES.find(e => e.id === 'brugger-relief');
    return {
      id: `ai-expert-${Date.now()}`,
      query,
      timestamp: new Date().toISOString(),
      summary: 'Pozycja odciążająca Brüggera to globalny reset posturalny odwracający zgięciowy wzorzec siedzenia przy biurku.',
      biomechanicalModifications: [
        {
          title: 'Rotacja zewnętrzna w stawach ramiennych',
          issueDetected: 'Tylko odchylanie rąk do tyłu bez rotacji przedramion.',
          anatomicalCause: 'Bez supinacji przedramion i rotacji zewnętrznej barku mięsień piersiowy większy pozostaje w przykurczu.',
          correction: 'Obróć dłonie kciukami maksymalnie na zewnątrz i do tyłu. To automatycznie otwiera klatkę piersiową i ściąga dolne kąty łopatek.',
          cuePrompt: 'Kciuki na zewnątrz • Pokaż wnętrza dłoni do przodu'
        },
        {
          title: 'Ustawienie miednicy i kąt w kolanach',
          issueDetected: 'Wyginanie kręgosłupa lędźwiowego w nadmierną lordozę (przeprost).',
          anatomicalCause: 'Kompensacja braku ruchomości w klatce piersiowej ruchem z odcinka lędźwiowego.',
          correction: 'Usiądź na guzach kulszowych na skraju krzesła, rozstaw kolana szerzej niż biodra (ok. 100°), lekko napnij dół brzucha.',
          cuePrompt: 'Stabilny brzuch • Otwórz tylko klatkę piersiową i kark'
        }
      ],
      safetyWarnings: [
        'Nie zadzieraj głowy do sufitu – wydłużaj czubek głowy pionowo w górę.',
        'Oddychaj torem przeponowym: 4 sekundy wdechu nosem, 6 sekund wydechu ustami.'
      ],
      recommendedExercise: ex,
      followUpTips: [
        'Stosuj 3 głębokie cykle oddechowe Brüggera co godzinę.',
        'Pozycja idealnie łączy się z retrakcją szyjną.'
      ],
      source: 'clinical_engine'
    };
  }

  // 3. Rozciąganie czworobocznego / karku / łopatki
  if (q.includes('czworoboczn') || q.includes('kark') || q.includes('łopatk') || q.includes('trapezius') || q.includes('dźwigacz') || q.includes('ramion')) {
    const ex = EXERCISES.find(e => e.id === 'trapezius-upper-stretch');
    return {
      id: `ai-expert-${Date.now()}`,
      query,
      timestamp: new Date().toISOString(),
      summary: 'Rozciąganie górnej części mięśnia czworobocznego i dźwigacza łopatki wymaga ustabilizowania barku po stronie rozciąganej.',
      biomechanicalModifications: [
        {
          title: 'Depresja łopatki (Kotwica barkowa)',
          issueDetected: 'Podążanie barku za pochyleniem głowy w bok (brak rozciągania).',
          anatomicalCause: 'Punkt przyczepu mięśnia (wyrostek barkowy i obojczyk) przemieszcza się razem z głową.',
          correction: 'Usiądź na dłoni rozciąganej strony lub chwyć spód siedziska krzesła. Utrzymuj bark stabilnie w dole.',
          cuePrompt: 'Usiądź na dłoni • Pochylaj ucho do przeciwległego barku bez skręcania głowy'
        },
        {
          title: 'Różnicowanie: czworoboczny vs dźwigacz łopatki',
          issueDetected: 'Mylenie czystego zgięcia bocznego ze skrętem głowy w dół.',
          anatomicalCause: 'm. czworoboczny rozciągamy uchem do barku, natomiast m. dźwigacz łopatki wymaga skrętu nosa w stronę pachy.',
          correction: 'Aby rozciągnąć dźwigacz łopatki, pochyl głowę i spójrz w kierunku przeciwległej pachy pod kątem 45°.',
          cuePrompt: 'Czworoboczny = ucho do ramienia • Dźwigacz = nos do pachy'
        }
      ],
      safetyWarnings: [
        'Dłoń na głowie pełni rolę delikatnego balastu, nie ciągnij głowy siłą ramienia!',
        'Przy uczuciu prądu lub mrowienia w ramieniu natychmiast zmniejsz kąt pochylenia.'
      ],
      recommendedExercise: ex,
      followUpTips: [
        'Utrzymuj rozciąganie statyczne przez minimum 25-30 sekund na stronę.',
        'Wykonuj ćwiczenie 2-3 razy dziennie przy napięciowych bólach głowy.'
      ],
      source: 'clinical_engine'
    };
  }

  // 4. Ból głowy / mięśnie podpotyliczne
  if (q.includes('głow') || q.includes('potylic') || q.includes('migren') || q.includes('skroń') || q.includes('napięciow')) {
    const ex = EXERCISES.find(e => e.id === 'suboccipital-release');
    return {
      id: `ai-expert-${Date.now()}`,
      query,
      timestamp: new Date().toISOString(),
      summary: 'Napięciowe bóle głowy typu szyjnopochodnego (Cervicogenic Headache) wynikają ze skurczu mięśni podpotylicznych i ucisku nerwu potylicznego większego.',
      biomechanicalModifications: [
        {
          title: 'Precyzyjna lokalizacja punktów podpotylicznych',
          issueDetected: 'Ucisk na środku kręgów szyjnych zamiast pod krawędzią czaszki.',
          anatomicalCause: 'Mięśnie skośne i proste głowy przyczepiają się tuż poniżej kości potylicznej.',
          correction: 'Przyłóż opuszki kciuków lub piłeczkę tuż pod grzebieniem kości potylicznej, ok. 2-3 cm od linii środkowej kręgosłupa.',
          cuePrompt: 'Znajdź dołeczki pod czaszką • Wywieraj delikatny, jednostajny nacisk'
        },
        {
          title: 'Odruch oczno-ruchowy (Oculomotor reflex)',
          issueDetected: 'Brak koordynacji gałek ocznych z rozluźnieniem podpotylicznym.',
          anatomicalCause: 'Mięśnie podpotyliczne odruchowo napinają się przy każdym mikroruchu oczu.',
          correction: 'Podczas ucisku zamknij oczy i skieruj wzrok powoli w dół bez poruszania głową. Poczujesz odruchowe rozluźnienie pod palcami.',
          cuePrompt: 'Zamknij oczy • Spójrz pod powiekami w stronę klatki piersiowej'
        }
      ],
      safetyWarnings: [
        'Unikaj bezpośredniego ucisku na tętnicę kręgową – nie uciskaj głęboko z boku szyi.',
        'W przypadku nagłego, "piorunującego" bólu głowy skonsultuj się niezwłocznie z lekarzem.'
      ],
      recommendedExercise: ex,
      followUpTips: [
        'Wykonaj automasaż przez 60-90 sekund w pozycji leżącej z podparciem karku.',
        'Pij odpowiednią ilość wody i sprawdź oświetlenie monitora.'
      ],
      source: 'clinical_engine'
    };
  }

  // 5. Dyskopatia / drętwienie / rwa ramienna / krążenia
  if (q.includes('dyskopati') || q.includes('drętw') || q.includes('mrów') || q.includes('przepuklin') || q.includes('krążeni') || q.includes('rwa')) {
    const ex = EXERCISES.find(e => e.id === 'nerve-floss') || EXERCISES[0];
    return {
      id: `ai-expert-${Date.now()}`,
      query,
      timestamp: new Date().toISOString(),
      summary: 'Przy podejrzeniu dyskopatii szyjnej lub podrażnienia nerwu (C5-C7) kluczowa jest zasada centralizacji bólu i unikanie krążeń głową.',
      biomechanicalModifications: [
        {
          title: 'Zakaz pełnych krążeń głową (Circumductio)',
          issueDetected: 'Wykonywanie obszernych krążeń głową w pełnym zakresie.',
          anatomicalCause: 'Połączenie rotacji z przeprostem powoduje gwałtowne zwężenie otworów międzykręgowych i ucisk korzeni nerwowych.',
          correction: 'Zastąp krążenia izolowanymi ruchami w jednej płaszczyźnie: czyste zgięcie, powolna rotacja w lewo/prawo bez odchylania w tył.',
          cuePrompt: 'Tylko ruchy liniowe • Zero pełnych młynków głową'
        },
        {
          title: 'Neurodynamika: Ślizg nerwu zamiast rozciągania',
          issueDetected: 'Mocne naciąganie drętwiejącej ręki.',
          anatomicalCause: 'Nerw jest strukturą wrażliwą na niedokrwienie przy rozciąganiu powyżej 8% długości.',
          correction: 'Stosuj technikę "flossingu" (ślizgu): gdy zginasz nadgarstek ku górze, pochylaj głowę W STRONĘ ręki, a nie przeciwną.',
          cuePrompt: 'Ruch naprzemienny • Płynny ślizg bez wywoływania mrowienia'
        }
      ],
      safetyWarnings: [
        'Jeżeli ból przemieszcza się z ramienia w dół do palców (peryferalizacja), natychmiast zaprzestań ćwiczenia.',
        'Pozytywny objaw to centralizacja: ból wycofuje się z ramienia i skupia w okolicach karku.'
      ],
      recommendedExercise: ex,
      followUpTips: [
        'Skonsultuj z fizjoterapeutą wykonanie rezonansu magnetycznego (MRI) odcinka C.',
        'W nocy stosuj poduszkę profilowaną z pianki termoelastycznej.'
      ],
      source: 'clinical_engine'
    };
  }

  // 6. Ogólna odpowiedź kinezjologiczna
  const defaultEx = EXERCISES.find(e => e.id === 'chin-tuck') || EXERCISES[0];
  return {
    id: `ai-expert-${Date.now()}`,
    query,
    timestamp: new Date().toISOString(),
    summary: `Analiza biomechaniczna zapytania: "${query}". Kluczową zasadą autoterapii karku jest osiowe wydłużenie kręgosłupa i eliminacja kompensacji z barków.`,
    biomechanicalModifications: [
      {
        title: 'Utrzymanie osiowości kręgosłupa (Elongacja)',
        issueDetected: 'Kompensacyjne wysuwanie głowy w przód (protrakcja) w trakcie wysiłku.',
        anatomicalCause: 'Osłabienie głębokich stabilizatorów szyi w połączeniu z przykurczem klatki piersiowej.',
        correction: 'Przed każdym powtórzeniem wyobraź sobie nić przymocowaną do czubka głowy, delikatnie pociągającą czaszkę w stronę sufitu.',
        cuePrompt: 'Wydłużaj kark ku górze • Ściągnij łopatki w dół'
      },
      {
        title: 'Prawidłowy tor oddechowy',
        issueDetected: 'Wstrzymywanie oddechu (manewr Valsalvy) lub płytki oddech szczytowy.',
        anatomicalCause: 'Oddech torem górnożebrowym aktywuje mięśnie pochyłe i mostkowo-obojczykowe, wzmagając ból karku.',
        correction: 'Wdech nosem kieruj w dolne żebra i przeponę. Ruch wykonuj zawsze na spokojnym, długim wydechu.',
        cuePrompt: 'Wydech w fazie największego napięcia • Luźny brzuch'
      }
    ],
    safetyWarnings: [
      'Nigdy nie wykonuj ćwiczeń przez ostry, kłujący ból.',
      'W przypadku wystąpienia zawrotów głowy lub nudności niezwłocznie odpocznij w pozycji leżącej.'
    ],
    recommendedExercise: defaultEx,
    followUpTips: [
      'Rób regularne 30-sekundowe mikro-przerwy na retrakcję szyi.',
      'Sprawdź ergonomię fotela i odległość monitora (ok. 50-70 cm od twarzy).'
    ],
    source: 'clinical_engine'
  };
}
