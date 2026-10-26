import { Exercise, VideoInstruction } from '../types';

export const VIDEO_INSTRUCTIONS_BY_ID: Record<string, VideoInstruction> = {
  'chin-tuck': {
    hdResolutionLabel: '1080p HD • 60 FPS',
    cycleSeconds: 8,
    recommendedSlowSpeed: 0.5,
    cameraAngles: ['sagittal', 'coronal', 'split'],
    phases: [
      {
        id: 'prepare',
        label: '1. Postawa wyjściowa',
        shortLabel: 'Postawa',
        startProgress: 0.0,
        endProgress: 0.22,
        breathAction: 'Wdech nosem',
        romMetricLabel: 'Oś C0-C7: 0 mm (Neutralna)',
        primaryCategory: 'posture',
        hudHeadline: 'Wydłuż czubek głowy ku sufitowi, opuść barki luźno',
        hudDetail: 'Wzrok skierowany horyzontalnie. Dwa palce delikatnie przyłożone do brody jako punkt odniesienia.',
        mistakeAlert: 'Unikaj garbienia odcinka piersiowego przed startem ruchu.'
      },
      {
        id: 'concentric',
        label: '2. Zakres ruchu (Retrakcja)',
        shortLabel: 'Zakres ROM',
        startProgress: 0.22,
        endProgress: 0.52,
        breathAction: 'Wydech ustami',
        romMetricLabel: 'Retrakcja pozioma: -18 mm',
        primaryCategory: 'rom',
        hudHeadline: 'Cofaj brodę ściśle poziomo w tył („szuflada”)',
        hudDetail: 'Głowa ślizga się w płaszczyźnie strzałkowej bez pochylania nosa w dół ani zadzierania podbródka.',
        mistakeAlert: 'BŁĄD: Skłon głowy do mostka zamiast poziomego cofnięcia.'
      },
      {
        id: 'isometric',
        label: '3. Izometria i Oddech',
        shortLabel: 'Oddech & Hold',
        startProgress: 0.52,
        endProgress: 0.80,
        breathAction: 'Spokojny oddech',
        romMetricLabel: 'Utrzymanie C1-C7: 4.0 s (-18 mm)',
        primaryCategory: 'breathing',
        hudHeadline: 'Utrzymaj napięcie głębokich zginaczy i oddychaj torem dolnożebrowym',
        hudDetail: 'Poczuj łagodne rozciąganie pod potylicą. Nie wstrzymuj oddechu i nie napinaj mięśni żuchwy.',
        mistakeAlert: 'BŁĄD: Wstrzymywanie powietrza i zaciskanie zębów w szczycie ruchu.'
      },
      {
        id: 'eccentric',
        label: '4. Kontrola błędów i powrót',
        shortLabel: 'Powrót',
        startProgress: 0.80,
        endProgress: 1.0,
        breathAction: 'Wdech nosem',
        romMetricLabel: 'Powrót do 0 mm (Bez protrakcji)',
        primaryCategory: 'mistakes',
        hudHeadline: 'Powróć płynnie do pozycji neutralnej bez wypychania głowy w przód',
        hudDetail: 'Barki pozostają nieruchome w dole. Zatrzymaj ruch w osi neutralnej kręgosłupa.',
        mistakeAlert: 'BŁĄD: Gwałtowne „wystrzelenie” brody w przód po zakończeniu powtórzenia.'
      }
    ],
    clinicalCues: {
      posture: {
        title: 'Prawidłowa postawa ciała',
        checkpoints: [
          'Usiądź lub stań z miednicą w pozycji neutralnej i podpartym odcinkiem lędźwiowym.',
          'Łopatki lekko ściągnięte w dół (depresja obręczy barkowej), uszy nad linią barków.',
          'Wzrok utkwiony w jednym punkcie na wysokości oczu – szyja wydłużona osiowo.'
        ],
        alignmentVector: 'Wektor osiowy przez szczyt czaszki (C0) prostopadle do podłoża'
      },
      rangeOfMotion: {
        title: 'Zakres ruchu (ROM) i biomechanika',
        safeRangeLabel: '15–20 mm czystej translacji tylnej bez bólu korzeniowego',
        targetAngleOrShift: 'Translacja pozioma -18 mm (Kąt pochylenia głowy 0°)',
        biomechanicalNote: 'Ruch zachodzi poprzez zgięcie w stawach górnego odcinka szyjnego (C0-C2) przy jednoczesnym wyproście dolnego odcinka (C4-C7).'
      },
      breathing: {
        title: 'Technika i synchronizacja oddechu',
        patternLabel: 'Cykl 2s Wdech – 4s Wydech/Oddech – 2s Powrót',
        inhalePhase: 'Swobodny wdech nosem do dolnych żeber w pozycji wyjściowej i podczas powrotu.',
        exhalePhase: 'Długi wydech przez lekko zasznurowane usta w trakcie cofania brody w tył.',
        clinicalTip: 'Wydech podczas fazy ruchu wyłącza nadmierne napięcie mięśni pochyłych i mostkowo-obojczykowo-sutkowych.'
      },
      commonMistakes: [
        {
          mistake: 'Pochylanie głowy w dół (przyciąganie brody do klatki piersiowej)',
          consequence: 'Zwiększa kompresję przedniej części krążków C5-C7 zamiast aktywować m. długi szyi.',
          correction: 'Wyobraź sobie, że broda przesuwa się po poziomej półce prosto w głąb karku.'
        },
        {
          mistake: 'Unoszenie barków i napinanie mięśni powierzchownych szyi',
          consequence: 'Przeciąża mięsień czworoboczny i nasila napięciowy ból karku.',
          correction: 'Opuść dłonie luźno na uda i skup się wyłącznie na głębokim, subtelnym ruchu pod potylicą.'
        }
      ]
    }
  },

  'isometric-neck': {
    hdResolutionLabel: '1080p HD • 60 FPS',
    cycleSeconds: 8,
    recommendedSlowSpeed: 0.5,
    cameraAngles: ['sagittal', 'coronal', 'split'],
    phases: [
      {
        id: 'prepare',
        label: '1. Ustawienie osi i dłoni',
        shortLabel: 'Postawa',
        startProgress: 0.0,
        endProgress: 0.20,
        breathAction: 'Wdech nosem',
        romMetricLabel: 'Przemieszczenie: 0° (Stabilizacja)',
        primaryCategory: 'posture',
        hudHeadline: 'Ustabilizuj kręgosłup szyjny w lekkiej retrakcji i przyłóż dłoń',
        hudDetail: 'Szyja pozostaje idealnie w osi. Dłoń tworzy miękką zaporę na czole, potylicy lub nad uchem.',
        mistakeAlert: 'Nie zaczynaj nacisku z głową wysuniętą w przód.'
      },
      {
        id: 'concentric',
        label: '2. Narastanie oporu (0° ruchu)',
        shortLabel: 'Zakres ROM',
        startProgress: 0.20,
        endProgress: 0.45,
        breathAction: 'Wydech ustami',
        romMetricLabel: 'Ruch stawowy: 0° (Siła 25%)',
        primaryCategory: 'rom',
        hudHeadline: 'Buduj płynny nacisk głową na dłoń – zero ruchu w stawach',
        hudDetail: 'Użyj wyłącznie 20–30% maksymalnej siły. Głowa i dłoń równoważą swój opór bez zmiany kąta.',
        mistakeAlert: 'BŁĄD: Przepychanie głowy w przód lub w bok zamiast czystej izometrii.'
      },
      {
        id: 'isometric',
        label: '3. Izometria z oddechem (5 s)',
        shortLabel: 'Oddech & Hold',
        startProgress: 0.45,
        endProgress: 0.80,
        breathAction: 'Spokojny oddech',
        romMetricLabel: 'Izometria: 5.0 s • 25% MVC',
        primaryCategory: 'breathing',
        hudHeadline: 'Utrzymuj stałe napięcie głębokiego gorsetu szyi, oddychając przeponą',
        hudDetail: 'Kontroluj brak drżenia mięśni. Powietrze wpływa i wypływa swobodnie bez zatrzymywania oddechu (efektu Valsalvy).',
        mistakeAlert: 'BŁĄD: Wstrzymywanie oddechu i czerwienienie twarzy z powodu zbyt dużej siły.'
      },
      {
        id: 'eccentric',
        label: '4. Stopniowe odpuszczenie',
        shortLabel: 'Powrót',
        startProgress: 0.80,
        endProgress: 1.0,
        breathAction: 'Długi wydech',
        romMetricLabel: 'Redukcja napięcia: 25% → 0%',
        primaryCategory: 'mistakes',
        hudHeadline: 'Powoli zmniejszaj nacisk przez 2 sekundy przed odjęciem dłoni',
        hudDetail: 'Unikaj nagłego oderwania dłoni, które powoduje odruchowe szarpnięcie kręgów szyjnych.',
        mistakeAlert: 'BŁĄD: Gwałtowne puszczenie oporu dłoni pod koniec serii.'
      }
    ],
    clinicalCues: {
      posture: {
        title: 'Prawidłowa postawa w izometrii',
        checkpoints: [
          'Kręgosłup wydłużony w osi pionowej, broda cofnięta o 5 mm do pozycji neutralnej.',
          'Łokieć ręki oporującej lekko odwiedziony, bark strony pracującej opuszczony.',
          'Brzuch delikatnie aktywny, stabilizujący klatkę piersiową.'
        ],
        alignmentVector: 'Równowaga wektorów siły (F_głowy = -F_dłoni) przy zerowym kącie ugięcia'
      },
      rangeOfMotion: {
        title: 'Zakres ruchu (ROM) – Kontrola 0°',
        safeRangeLabel: '0° ruchu kątowego w segmentach C1-C7 (czysta praca izometryczna)',
        targetAngleOrShift: '0° odchylenia osi • 20–30% siły maksymalnej (MVC)',
        biomechanicalNote: 'Brak ślizgu stawowego chroni uszkodzone krążki międzykręgowe, jednocześnie budując sztywność mięśniową chroniącą kręgosłup.'
      },
      breathing: {
        title: 'Technika oddechu przeciw próbie Valsalvy',
        patternLabel: 'Ciągły oddech przeponowy podczas 5-sekundowego napięcia',
        inhalePhase: 'Wdech nosem przed rozpoczęciem nacisku oraz spokojne doładowanie powietrza w trakcie.',
        exhalePhase: 'Powolny wydech przez usta w momencie budowania napięcia izometrycznego.',
        clinicalTip: 'Mówienie lub ciche liczenie na głos od 1 do 5 podczas oporu gwarantuje, że nie wstrzymujesz oddechu.'
      },
      commonMistakes: [
        {
          mistake: 'Siłowanie się z dłonią na 80–100% możliwości',
          consequence: 'Wywołuje obronny skurcz mięśni powierzchownych i wzrost ciśnienia wewnątrzdyskowego.',
          correction: 'Ogranicz nacisk do siły odpowiadającej delikatnemu wciśnięciu dojrzałego owocu bez jego zgniecenia (ok. 25%).'
        },
        {
          mistake: 'Nagłe puszczenie dłoni po 5 sekundach',
          consequence: 'Powoduje efekt sprężynowania szyi i podrażnienie torebek stawowych.',
          correction: 'Wyciszaj nacisk stopniowo: 25% → 15% → 5% → 0% zanim odejmiesz dłoń.'
        }
      ]
    }
  },

  'trapezius-stretch': {
    hdResolutionLabel: '1080p HD • 60 FPS',
    cycleSeconds: 9,
    recommendedSlowSpeed: 0.5,
    cameraAngles: ['coronal', 'sagittal', 'split'],
    phases: [
      {
        id: 'prepare',
        label: '1. Kotwiczenie barku',
        shortLabel: 'Postawa',
        startProgress: 0.0,
        endProgress: 0.20,
        breathAction: 'Wdech nosem',
        romMetricLabel: 'Depresja łopatki: Stabilna',
        primaryCategory: 'posture',
        hudHeadline: 'Chwyć dłonią dolną krawędź siedziska, kotwicząc bark w dole',
        hudDetail: 'Wyprostuj plecy i ustaw głowę w osi. Stabilizacja barku jest warunkiem skutecznego rozciągnięcia.',
        mistakeAlert: 'Nie zaczynaj skłonu, jeśli bark strony rozciąganej jest uniesiony.'
      },
      {
        id: 'concentric',
        label: '2. Skłon boczny (ROM)',
        shortLabel: 'Zakres ROM',
        startProgress: 0.20,
        endProgress: 0.48,
        breathAction: 'Wydech ustami',
        romMetricLabel: 'Skłon boczny C1-C7: 32°–38°',
        primaryCategory: 'rom',
        hudHeadline: 'Skieruj ucho do przeciwnego barku i oprzyj luźno dłoń na skroni',
        hudDetail: 'Sam ciężar przedramienia wystarcza do uzyskania bezpiecznej bariery tkankowej bez szarpania.',
        mistakeAlert: 'BŁĄD: Ciągnięcie głowy siłą mięśni ramienia.'
      },
      {
        id: 'isometric',
        label: '3. Rozluźnienie z wydechem',
        shortLabel: 'Oddech & Hold',
        startProgress: 0.48,
        endProgress: 0.82,
        breathAction: 'Długi wydech',
        romMetricLabel: 'Wydłużenie pasma: 20–30 s',
        primaryCategory: 'breathing',
        hudHeadline: 'Z każdym długim wydechem pozwól, by napięcie spływało z karku',
        hudDetail: 'Utrzymuj stały, przyjemny kąt rozciągania (3–4/10 w skali odczucia rozciągania, zero bólu).',
        mistakeAlert: 'BŁĄD: Unoszenie rozciąganego barku ku uchu w reakcji obronnej.'
      },
      {
        id: 'eccentric',
        label: '4. Bezpieczny powrót osiowy',
        shortLabel: 'Powrót',
        startProgress: 0.82,
        endProgress: 1.0,
        breathAction: 'Wdech nosem',
        romMetricLabel: 'Powrót z 35° → 0°',
        primaryCategory: 'mistakes',
        hudHeadline: 'Najpierw zdejmij dłoń z głowy, a następnie powoli wróć do pionu',
        hudDetail: 'Powrót powinien trwać pełne 2–3 sekundy, aby nie wywołać odruchu na rozciąganie.',
        mistakeAlert: 'BŁĄD: Szybkie poderwanie głowy po długim rozciąganiu.'
      }
    ],
    clinicalCues: {
      posture: {
        title: 'Postawa i zakotwiczenie obręczy barkowej',
        checkpoints: [
          'Ręka po stronie rozciąganej trzyma spód krzesła lub sięga aktywnie w stronę podłogi.',
          'Tułów pozostaje idealnie pionowy – brak bocznego wygięcia kręgosłupa piersiowego.',
          'Nos skierowany prosto przed siebie (lub pod kątem 45° do pachy dla m. dźwigacza łopatki).'
        ],
        alignmentVector: 'Płaszczyzna czołowa – oddalenie wyrostka sutkowatego od wyrostka barkowego'
      },
      rangeOfMotion: {
        title: 'Zakres ruchu (ROM) skłonu bocznego',
        safeRangeLabel: '30°–40° zgięcia bocznego do pierwszego przyjemnego oporu powięziowego',
        targetAngleOrShift: 'Kąt boczny 35° (bez rotacji tułowia)',
        biomechanicalNote: 'Przekroczenie fizjologicznej bariery z użyciem siły ręki podrażnia splot ramienny i wywołuje odruch obronny wrzecion mięśniowych.'
      },
      breathing: {
        title: 'Oddech torujący relaksację poizometryczną',
        patternLabel: 'Wdech 3s nosem – Wydech 6s ustami (Stymulacja nerwu błędnego)',
        inhalePhase: 'Spokojny wdech nosem kierowany w boki dolnych żeber.',
        exhalePhase: 'Wydłużony, miękki wydech ustami z mentalnym odpuszczeniem napięcia w barku.',
        clinicalTip: 'Podczas długiego wydechu układ przywspółczulny obniża tonus mięśnia czworobocznego o dodatkowe 15–20%.'
      },
      commonMistakes: [
        {
          mistake: 'Agresywne dociskanie głowy ręką w dół',
          consequence: 'Ryzyko naciągnięcia korzeni nerwowych C5-C6 i wtórnego skurczu obronnego.',
          correction: 'Połóż dłoń na głowie tylko jako bierny odważnik (ok. 300–400 g nacisku).'
        },
        {
          mistake: 'Pochylanie całego tułowia razem z głową',
          consequence: 'Ruch ucieka do odcinka lędźwiowego, a mięsień czworoboczny nie ulega wydłużeniu.',
          correction: 'Dociśnij oba guzy kulszowe równo do krzesła przed rozpoczęciem skłonu głowy.'
        }
      ]
    }
  },

  'suboccipital-release': {
    hdResolutionLabel: '1080p HD • 60 FPS',
    cycleSeconds: 8,
    recommendedSlowSpeed: 0.5,
    cameraAngles: ['sagittal', 'coronal', 'split'],
    phases: [
      {
        id: 'prepare',
        label: '1. Lokalizacja potylicy',
        shortLabel: 'Postawa',
        startProgress: 0.0,
        endProgress: 0.22,
        breathAction: 'Wdech nosem',
        romMetricLabel: 'Strefa C0-C2: Pod potylicą',
        primaryCategory: 'posture',
        hudHeadline: 'Oprzyj opuszki palców w zagłębieniach tuż pod kością potyliczną',
        hudDetail: 'Łokcie szeroko, barki rozluźnione. Znajdź miękkie zagłębienia po obu stronach kręgosłupa górnego.',
        mistakeAlert: 'Nie uciskaj bocznych stron szyi (tętnica szyjna) ani samych wyrostków kolczystych.'
      },
      {
        id: 'concentric',
        label: '2. Wektor ucisku i mikro-skinienie',
        shortLabel: 'Zakres ROM',
        startProgress: 0.22,
        endProgress: 0.50,
        breathAction: 'Wydech ustami',
        romMetricLabel: 'Mikro-zgięcie C0-C1: 8° (2–3 cm)',
        primaryCategory: 'rom',
        hudHeadline: 'Skieruj łagodny nacisk ku górze i wykonaj minimalne skinienie „tak”',
        hudDetail: 'Amplituda ruchu brody wynosi zaledwie 2–3 cm. Ruch otwiera przestrzeń podpotyliczną.',
        mistakeAlert: 'BŁĄD: Zadzieranie brody w górę i napinanie tylnej części karku.'
      },
      {
        id: 'isometric',
        label: '3. Topnienie napięcia i Oddech',
        shortLabel: 'Oddech & Hold',
        startProgress: 0.50,
        endProgress: 0.82,
        breathAction: 'Długi wydech',
        romMetricLabel: 'Kompresja niedokrwienna: 30 s',
        primaryCategory: 'breathing',
        hudHeadline: 'Utrzymuj stały, miękki kontakt opuszków i oddychaj głęboko',
        hudDetail: 'Pozwól ciężarowi czaszki opaść na opuszki palców. Zwróć uwagę na rozluźnienie gałek ocznych.',
        mistakeAlert: 'BŁĄD: Szybkie, nerwowe pocieranie lub wbijanie paznokci w tkanki.'
      },
      {
        id: 'eccentric',
        label: '4. Powolna dekompresja',
        shortLabel: 'Powrót',
        startProgress: 0.82,
        endProgress: 1.0,
        breathAction: 'Wdech nosem',
        romMetricLabel: 'Zwolnienie ucisku: Płynne',
        primaryCategory: 'mistakes',
        hudHeadline: 'Powoli zmniejsz ucisk palców i pozostaw głowę w osi przez chwilę',
        hudDetail: 'Po zwolnieniu punktów spustowych krew napływa do tkanek – unikaj gwałtownego wstawania.',
        mistakeAlert: 'BŁĄD: Szybkie zerwanie kontaktu i gwałtowny obrót głowy.'
      }
    ],
    clinicalCues: {
      posture: {
        title: 'Pozycja odciążająca kark i obręcz barkową',
        checkpoints: [
          'Najlepiej wykonywać w leżeniu tyłem lub siedząc z podpartymi łokciami.',
          'Opuszki kciuków lub palców II-III ułożone symetrycznie pod kresą karkową dolną.',
          'Żuchwa rozluźniona, język spoczywa luźno na podniebieniu.'
        ],
        alignmentVector: 'Wektor nacisku palców pod kątem 45° ku górze i przodowi (w stronę oczodołów)'
      },
      rangeOfMotion: {
        title: 'Zakres ruchu (ROM) w stawach szczytowo-potylicznych',
        safeRangeLabel: 'Mikro-ruch 5°–10° zgięcia górnoszyjnego (amplituda 2 cm)',
        targetAngleOrShift: '8° ślizgu kłykci potylicznych bez ruchu dolnej szyi',
        biomechanicalNote: 'Mięśnie podpotyliczne są sprzężone z ruchem gałek ocznych (odruch okulocefaliczny) – skierowanie wzroku w dół ułatwia ich rozluźnienie.'
      },
      breathing: {
        title: 'Oddech wyciszający ból napięciowy głowy',
        patternLabel: 'Spokojny wdech nosem (4s) – Długi wydech przez usta (6s)',
        inhalePhase: 'Łagodny wdech bez unoszenia górnych żeber.',
        exhalePhase: 'Długi wydech, podczas którego głowa „zatapia się” nieco głębiej w opuszki palców.',
        clinicalTip: 'Rozluźnienie mm. podpotylicznych z wydechem zmniejsza ucisk na nerw potyliczny większy.'
      },
      commonMistakes: [
        {
          mistake: 'Zbyt mocny ucisk wywołujący ostry, promieniujący ból',
          consequence: 'Powoduje obronne napięcie mięśni i nasilenie bólu głowy.',
          correction: 'Utrzymuj intensywność ucisku na poziomie przyjemnego rozpierania (maks. 4/10).'
        },
        {
          mistake: 'Zadzieranie głowy w tył podczas uciskania potylicy',
          consequence: 'Skraca mięśnie podpotyliczne zamiast je wydłużać.',
          correction: 'Połącz ucisk z minimalnym cofnięciem i skinięciem brody w dół.'
        }
      ]
    }
  },

  'neck-rotations': {
    hdResolutionLabel: '1080p HD • 60 FPS',
    cycleSeconds: 8,
    recommendedSlowSpeed: 0.5,
    cameraAngles: ['coronal', 'sagittal', 'split'],
    phases: [
      {
        id: 'prepare',
        label: '1. Osiowe wydłużenie (C0-C2)',
        shortLabel: 'Postawa',
        startProgress: 0.0,
        endProgress: 0.20,
        breathAction: 'Wdech nosem',
        romMetricLabel: 'Rotacja wyjściowa: 0°',
        primaryCategory: 'posture',
        hudHeadline: 'Wydłuż kręgosłup ku górze i wykonaj lekkie cofnięcie brody (20%)',
        hudDetail: 'Rotacja szyi jest bezpieczna tylko wtedy, gdy kręgi są ustawione w osi bez protrakcji.',
        mistakeAlert: 'Nie rozpoczynaj skrętu z wysuniętą w przód brodą.'
      },
      {
        id: 'concentric',
        label: '2. Płynny obrót poziomy (ROM)',
        shortLabel: 'Zakres ROM',
        startProgress: 0.20,
        endProgress: 0.50,
        breathAction: 'Wydech ustami',
        romMetricLabel: 'Rotacja osiowa: 55°–65°',
        primaryCategory: 'rom',
        hudHeadline: 'Obracaj głowę wokół osi pionowej jak na dobrze naoliwionym zawiasie',
        hudDetail: 'Podbródek porusza się równolegle do podłogi aż do pierwszej miękkiej bariery oporu.',
        mistakeAlert: 'BŁĄD: Skręcanie barków i tułowia razem z głową.'
      },
      {
        id: 'isometric',
        label: '3. Pauza w skrajnym punkcie (3 s)',
        shortLabel: 'Oddech & Hold',
        startProgress: 0.50,
        endProgress: 0.78,
        breathAction: 'Spokojny oddech',
        romMetricLabel: 'Pauza kontrolna: 3.0 s (60°)',
        primaryCategory: 'breathing',
        hudHeadline: 'Zatrzymaj ruch na 3 sekundy w bezbolesnym zakresie i rozluźnij barki',
        hudDetail: 'Spokojny wydech w punkcie zatrzymania pozwala torebkom stawowym C1-C2 zaadaptować się do ruchu.',
        mistakeAlert: 'BŁĄD: Pulsowanie i siłowe pogłębianie skrętu na końcu zakresu.'
      },
      {
        id: 'eccentric',
        label: '4. Kontrolowany powrót do centrum',
        shortLabel: 'Powrót',
        startProgress: 0.78,
        endProgress: 1.0,
        breathAction: 'Wdech nosem',
        romMetricLabel: 'Powrót: 60° → 0° (Centrum)',
        primaryCategory: 'mistakes',
        hudHeadline: 'Wracaj do centrum z taką samą płynnością przez pełne 3 sekundy',
        hudDetail: 'Zatrzymaj głowę na ułamek sekundy w linii środkowej przed zmianą strony.',
        mistakeAlert: 'BŁĄD: Zataczanie kół głową (krążenia szyją obciążają stawy międzywyrostkowe).'
      }
    ],
    clinicalCues: {
      posture: {
        title: 'Stabilizacja obręczy barkowej i osi C1-C7',
        checkpoints: [
          'Oba barki pozostają nieruchome w płaszczyźnie czołowej (jak przyklejone do oparcia).',
          'Czubek głowy ciągnie ku sufitowi, odciążając krążki międzykręgowe przed obrotem.',
          'Wzrok podąża poziomo po linii horyzontu.'
        ],
        alignmentVector: 'Pionowa oś obrotu przechodząca przez ząb kręgu obrotowego (C2)'
      },
      rangeOfMotion: {
        title: 'Bezpieczny zakres rotacji (ROM)',
        safeRangeLabel: '50°–70° czystej rotacji bezbólowej (50% ruchu pochodzi z segmentu C1-C2)',
        targetAngleOrShift: 'Kąt docelowy 55°–65° w płaszczyźnie poprzecznej',
        biomechanicalNote: 'Wykonywanie wyłącznie czystej rotacji poziomej (zamiast krążeń po okręgu) chroni tętnice kręgowe i otwory międzykręgowe przed kompresją.'
      },
      breathing: {
        title: 'Koordynacja oddechu z rotacją',
        patternLabel: 'Wdech w centrum (2s) – Wydech podczas obrotu i pauzy (4s)',
        inhalePhase: 'Wdech nosem w pozycji centralnej przed rozpoczęciem skrętu.',
        exhalePhase: 'Płynny wydech ustami podczas obracania głowy i 3-sekundowej pauzy.',
        clinicalTip: 'Wydech w trakcie skrętu zapobiega odruchowemu napinaniu mięśnia mostkowo-obojczykowo-sutkowego.'
      },
      commonMistakes: [
        {
          mistake: 'Łączenie obrotu ze skłonem bocznym lub zadzieraniem brody',
          consequence: 'Powoduje zamykanie otworów międzykręgowych i ryzyko konfliktu korzeniowego.',
          correction: 'Pilnuj, aby nos i podbródek rysowały w powietrzu idealnie poziomą linię.'
        },
        {
          mistake: 'Kompensacyjny obrót barkiem za ruchem głowy',
          consequence: 'Fałszuje rzeczywisty zakres ruchomości szyi i przenosi napięcie na odcinek piersiowy.',
          correction: 'Połóż dłonie na obojczykach lub udach, aby czuć, że klatka piersiowa jest nieruchoma.'
        }
      ]
    }
  },

  'brugger-relief': {
    hdResolutionLabel: '1080p HD • 60 FPS',
    cycleSeconds: 9,
    recommendedSlowSpeed: 0.5,
    cameraAngles: ['coronal', 'sagittal', 'split'],
    phases: [
      {
        id: 'prepare',
        label: '1. Miednica i podparcie stóp',
        shortLabel: 'Postawa',
        startProgress: 0.0,
        endProgress: 0.22,
        breathAction: 'Wdech nosem',
        romMetricLabel: 'Miednica: Neutralne przodopochylenie',
        primaryCategory: 'posture',
        hudHeadline: 'Usiądź na przedniej krawędzi krzesła, stopy szeroko i stabilnie',
        hudDetail: 'Przetocz miednicę lekko w przód, unosząc mostek bez napięcia w lędźwiach.',
        mistakeAlert: 'Nie opieraj się biernie w zgarbionej pozycji na tyle fotela.'
      },
      {
        id: 'concentric',
        label: '2. Rotacja zewnętrzna ramion',
        shortLabel: 'Zakres ROM',
        startProgress: 0.22,
        endProgress: 0.50,
        breathAction: 'Wdech nosem',
        romMetricLabel: 'Rotacja ramion: +45° • Łopatki w dół',
        primaryCategory: 'rom',
        hudHeadline: 'Odkręć dłonie kciukami na zewnątrz i ściągnij łopatki w dół',
        hudDetail: 'Otwórz klatkę piersiową i delikatnie cofnij brodę, czując pracę między łopatkami.',
        mistakeAlert: 'BŁĄD: Wypychanie brzucha i przeprost w odcinku lędźwiowym.'
      },
      {
        id: 'isometric',
        label: '3. Oddech dolnożebrowy w otwarciu',
        shortLabel: 'Oddech & Hold',
        startProgress: 0.50,
        endProgress: 0.82,
        breathAction: 'Długi wydech',
        romMetricLabel: 'Otwarcie klatki: 15 s (3 oddechy)',
        primaryCategory: 'breathing',
        hudHeadline: 'Weź głęboki wdech rozszerzający żebra i powolny, rozluźniający wydech',
        hudDetail: 'Utrzymuj szerokie obojczyki i aktywne dolne stabilizatory łopatek.',
        mistakeAlert: 'BŁĄD: Unoszenie barków do uszu podczas głębokiego wdechu.'
      },
      {
        id: 'eccentric',
        label: '4. Powrót z zachowaniem osi',
        shortLabel: 'Powrót',
        startProgress: 0.82,
        endProgress: 1.0,
        breathAction: 'Spokojny oddech',
        romMetricLabel: 'Powrót ramion z zachowaniem pionu',
        primaryCategory: 'mistakes',
        hudHeadline: 'Rozluźnij dłonie, ale pozostaw wyprostowany mostek i cofniętą głowę',
        hudDetail: 'Nie zapadaj się z powrotem w pozycję zamkniętą po zakończeniu powtórzenia.',
        mistakeAlert: 'BŁĄD: Natychmiastowe opadnięcie klatki piersiowej i wysunięcie brody.'
      }
    ],
    clinicalCues: {
      posture: {
        title: 'Złoty łańcuch kinematyczny wg Brüggera',
        checkpoints: [
          'Trzy koła zębate kręgosłupa: lekkie przodopochylenie miednicy → uniesienie mostka → retrakcja brody.',
          'Stopy rozstawione nieco szerzej niż biodra, lekko zrotowane na zewnątrz.',
          'Kciuki skierowane w tył, palce dłoni szeroko otwarte.'
        ],
        alignmentVector: 'Odwrócenie wzorca zgięciowego (antygrawitacyjne otwarcie taśmy przedniej)'
      },
      rangeOfMotion: {
        title: 'Zakres ruchu (ROM) obręczy barkowej i klatki',
        safeRangeLabel: '45°–60° rotacji zewnętrznej kości ramiennej + 10° wyprostu piersiowego',
        targetAngleOrShift: 'Rotacja zewnętrzna ramion 45° • Retrakcja łopatek 15 mm',
        biomechanicalNote: 'Rotacja zewnętrzna ramion automatycznie rozciąga przykurczone mięśnie piersiowe i toruje pracę dolnego czworobocznego.'
      },
      breathing: {
        title: 'Oddech w otwartej klatce piersiowej',
        patternLabel: '3 pełne cykle oddechu dolnożebrowego w szczycie pozycji',
        inhalePhase: 'Głęboki wdech nosem otwierający dolne łuki żebrowe w trzech wymiarach.',
        exhalePhase: 'Spokojny wydech ustami przy utrzymaniu ściągniętych w dół łopatek.',
        clinicalTip: 'Połączenie rotacji zewnętrznej ramion z wdechem zwiększa pojemność oddechową o ok. 20%.'
      },
      commonMistakes: [
        {
          mistake: 'Kompensacyjne wygięcie w odcinku lędźwiowym (hiperlordoza)',
          consequence: 'Przeciąża stawy międzywyrostkowe L4-S1 zamiast mobilizować odcinek piersiowy.',
          correction: 'Utrzymaj dolne żebra lekko domknięte i skup ruch na wysokości mostka i łopatek.'
        },
        {
          mistake: 'Zadzieranie głowy ku sufitowi przy otwieraniu klatki',
          consequence: 'Kompresuje górny odcinek szyjny.',
          correction: 'Trzymaj brodę delikatnie cofniętą, a wzrok skierowany poziomo.'
        }
      ]
    }
  },

  'scapular-retraction': {
    hdResolutionLabel: '1080p HD • 60 FPS',
    cycleSeconds: 8,
    recommendedSlowSpeed: 0.5,
    cameraAngles: ['coronal', 'sagittal', 'split'],
    phases: [
      {
        id: 'prepare',
        label: '1. Pozycja „W” (Łopatki w dół)',
        shortLabel: 'Postawa',
        startProgress: 0.0,
        endProgress: 0.22,
        breathAction: 'Wdech nosem',
        romMetricLabel: 'Kąt łokci: 90° (Litera W)',
        primaryCategory: 'posture',
        hudHeadline: 'Ustaw ramiona w kształt litery „W” i ściągnij łopatki w dół',
        hudDetail: 'Łokcie blisko żeber, przedramiona w płaszczyźnie tułowia, szyja długa i wolna od napięcia.',
        mistakeAlert: 'Upewnij się, że barki nie są podciągnięte do uszu już na starcie.'
      },
      {
        id: 'concentric',
        label: '2. Przejście z „W” do „Y” (ROM)',
        shortLabel: 'Zakres ROM',
        startProgress: 0.22,
        endProgress: 0.52,
        breathAction: 'Wydech ustami',
        romMetricLabel: 'Wznos ramion: 135° (Litera Y)',
        primaryCategory: 'rom',
        hudHeadline: 'Unieś ramiona skośnie w górę do litery „Y”, trzymając barki nisko',
        hudDetail: 'Ruch prowadzą dolne kąty łopatek ślizgające się po żebrach, nie górna część karku.',
        mistakeAlert: 'BŁĄD: Unoszenie barków do uszu podczas prostowania łokci.'
      },
      {
        id: 'isometric',
        label: '3. Aktywacja dolnego czworobocznego',
        shortLabel: 'Oddech & Hold',
        startProgress: 0.52,
        endProgress: 0.78,
        breathAction: 'Spokojny oddech',
        romMetricLabel: 'Zatrzymanie w Y: 2.0 s',
        primaryCategory: 'breathing',
        hudHeadline: 'Utrzymaj pozycję „Y” przez 2 sekundy, czując pracę między łopatkami',
        hudDetail: 'Kciuki skierowane w tył, żebra domknięte, oddech swobodny.',
        mistakeAlert: 'BŁĄD: Wypychanie dolnych żeber i brzucha w przód.'
      },
      {
        id: 'eccentric',
        label: '4. Powrót z „Y” do „W”',
        shortLabel: 'Powrót',
        startProgress: 0.78,
        endProgress: 1.0,
        breathAction: 'Wdech nosem',
        romMetricLabel: 'Ściągnięcie łopatek: Y → W',
        primaryCategory: 'mistakes',
        hudHeadline: 'Opuść łokcie powoli do pozycji „W”, domykając dolne kąty łopatek',
        hudDetail: 'Kontroluj fazę opuszczania – to w niej budujesz najlepszą stabilizację łopatki.',
        mistakeAlert: 'BŁĄD: Bezładne opuszczanie rąk z utratą napięcia międzyłopatkowe.'
      }
    ],
    clinicalCues: {
      posture: {
        title: 'Ustawienie osi tułowia i płaszczyzny łopatek',
        checkpoints: [
          'Głowa w lekkiej retrakcji – uszy w jednej linii z barkami i biodrami.',
          'Przedramiona i nadgarstki proste, kciuki skierowane ku tyłowi (rotacja zewnętrzna).',
          'Mięśnie brzucha delikatnie napięte, aby ustabilizować dolne żebra.'
        ],
        alignmentVector: 'Płaszczyzna łopatki (ok. 30° przed płaszczyzną czołową – scaption)'
      },
      rangeOfMotion: {
        title: 'Zakres ruchu (ROM) ślizgu łopatkowo-żebrowego',
        safeRangeLabel: 'Od 90° ugięcia w pozycji W do 135° odwiedzenia w pozycji Y',
        targetAngleOrShift: 'Kąt ramion 135° przy zachowaniu depresji obręczy barkowej',
        biomechanicalNote: 'Przejście W→Y przy obniżonych barkach selektywnie rekrutuje część wstępującą m. czworobocznego (dolny trapezius) i m. zębaty przedni.'
      },
      breathing: {
        title: 'Oddech stabilizujący klatkę piersiową',
        patternLabel: 'Wydech podczas wznosu do Y (2s) – Wdech przy powrocie do W (2s)',
        inhalePhase: 'Wdech nosem podczas powrotu łokci w dół do pozycji W.',
        exhalePhase: 'Aktywny wydech ustami podczas unoszenia ramion w górę (pomaga utrzymać żebra nisko).',
        clinicalTip: 'Wydech przy unoszeniu rąk zapobiega kompensacyjnemu przeprostowi w lędźwiach.'
      },
      commonMistakes: [
        {
          mistake: 'Dominacja górnego pasma m. czworobocznego (podciąganie barków)',
          consequence: 'Zwiększa kompresję karku zamiast go odciążać.',
          correction: 'Zatrzymaj ruch rąk w górę w momencie, w którym czujesz, że barki zaczynają unosić się ku uszom.'
        },
        {
          mistake: 'Wyginanie odcinka lędźwiowego, by unieść ręce wyżej',
          consequence: 'Przeciąża dolne plecy i wyłącza pracę mięśni grzbietu.',
          correction: 'Wykonuj ćwiczenie stojąc plecami przy ścianie i pilnuj, by dolne żebra nie odrywały się od oparcia.'
        }
      ]
    }
  },

  'nerve-floss': {
    hdResolutionLabel: '1080p HD • 60 FPS',
    cycleSeconds: 8,
    recommendedSlowSpeed: 0.5,
    cameraAngles: ['coronal', 'sagittal', 'split'],
    phases: [
      {
        id: 'prepare',
        label: '1. Pozycja startowa („Kelner”)',
        shortLabel: 'Postawa',
        startProgress: 0.0,
        endProgress: 0.22,
        breathAction: 'Wdech nosem',
        romMetricLabel: 'Łokieć 90° • Głowa neutralnie',
        primaryCategory: 'posture',
        hudHeadline: 'Unieś ramię w bok (90°), zegnij łokieć i skieruj dłoń ku sufitowi',
        hudDetail: 'Bark opuszczony nisko. Nerw pośrodkowy jest teraz rozluźniony zarówno przy szyi, jak i w łokciu.',
        mistakeAlert: 'Nie unoś ramienia powyżej linii barku.'
      },
      {
        id: 'concentric',
        label: '2. Ślizg obwodowy (Ręka + Głowa)',
        shortLabel: 'Zakres ROM',
        startProgress: 0.22,
        endProgress: 0.55,
        breathAction: 'Wydech ustami',
        romMetricLabel: 'Wyprost łokcia + Skłon głowy w TĘ SAMĄ stronę',
        primaryCategory: 'rom',
        hudHeadline: 'Prostuj łokieć i JEDNOCZEŚNIE przechyl głowę W STRONĘ ćwiczonej ręki',
        hudDetail: 'Gdy nadgarstek naciąga nerw przy dłoni, skłon głowy w tę samą stronę luzuje go przy kręgosłupie!',
        mistakeAlert: 'BŁĄD KRYTYCZNY: Odchylanie głowy w stronę przeciwną przy wyprostowanej ręce!'
      },
      {
        id: 'isometric',
        label: '3. Miękki punkt zwrotny (1 s)',
        shortLabel: 'Oddech & Hold',
        startProgress: 0.55,
        endProgress: 0.72,
        breathAction: 'Spokojny oddech',
        romMetricLabel: 'Ślizg bez napięcia (Slider): 0% mrowienia',
        primaryCategory: 'breathing',
        hudHeadline: 'Krótka, płynna zmiana kierunku bez zatrzymywania w napięciu',
        hudDetail: 'Ruch ma przypominać gładkie przesuwanie jedwabnej nici – zero prądu i mrowienia w palcach.',
        mistakeAlert: 'BŁĄD: Przetrzymywanie nerwu w pełnym rozciągnięciu wywołującym drętwienie.'
      },
      {
        id: 'eccentric',
        label: '4. Ślizg powrotny (Zgięcie łokcia)',
        shortLabel: 'Powrót',
        startProgress: 0.72,
        endProgress: 1.0,
        breathAction: 'Wdech nosem',
        romMetricLabel: 'Zgięcie łokcia + Skłon głowy w przeciwną',
        primaryCategory: 'mistakes',
        hudHeadline: 'Zginając łokieć z powrotem, delikatnie odchyl głowę w stronę przeciwną',
        hudDetail: 'Teraz luzujesz nerw w nadgarstku i łokciu, delikatnie przesuwając go w stronę splotu szyjnego.',
        mistakeAlert: 'BŁĄD: Szarpanie i zbyt szybkie tempo ruchu.'
      }
    ],
    clinicalCues: {
      posture: {
        title: 'Ustawienie kanału nerwowego (Splot ramienny C5-Th1)',
        checkpoints: [
          'Łopatka ćwiczonej ręki ustabilizowana w dole (otwarta przestrzeń obojczykowo-żebrowa).',
          'Ramię odwiedzione do ok. 80°–90° w płaszczyźnie łopatki.',
          'Ruch głowy i ręki odbywa się w idealnej synchronizacji czasowej.'
        ],
        alignmentVector: 'Technika typu SLIDER (ślizg jednokierunkowy bez wzrostu napięcia wewnątrznerwowego)'
      },
      rangeOfMotion: {
        title: 'Zakres ruchu (ROM) – Zasada 0% prowokacji objawów',
        safeRangeLabel: 'Wyprost łokcia do 150°–170° (zatrzymaj przed pojawieniem się mrowienia)',
        targetAngleOrShift: 'Równoległy przesuw: Głowa +25° w prawo ↔ Łokieć 165° w prawo',
        biomechanicalNote: 'Technika „Slider” przesuwa nerw względem otaczających powięzi, poprawiając jego ukrwienie i redukując obrzęk okołokorzeniowy.'
      },
      breathing: {
        title: 'Spokojny oddech neurodynamiczny',
        patternLabel: 'Płynny wydech podczas wyprostu ręki – Wdech podczas ugięcia',
        inhalePhase: 'Wdech nosem przy powrocie dłoni w stronę barku.',
        exhalePhase: 'Miękki wydech podczas prostowania łokcia i skłonu głowy w stronę ręki.',
        clinicalTip: 'Spokojny oddech obniża wrażliwość mechanoreceptorów układu nerwowego.'
      },
      commonMistakes: [
        {
          mistake: 'Odchylanie głowy w przeciwną stronę podczas prostowania ręki (Tensioner zamiast Slidera)',
          consequence: 'Naciąga nerw z obu końców jednocześnie, co w fazie ostrej może nasilić rwę barkową.',
          correction: 'Zapamiętaj regułę: „Patrz na dłoń, gdy oddala się od ciała; odwróć głowę, gdy dłoń wraca”.'
        },
        {
          mistake: 'Wykonywanie ruchu mimo uczucia prądu w kciuku i palcu wskazującym',
          consequence: 'Podrażnia osłonkę mielinową nerwu pośrodkowego.',
          correction: 'Zmniejsz kąt wyprostu łokcia lub nadgarstka o połowę – ruch musi być całkowicie bezbolesny.'
        }
      ]
    }
  },

  'cat-cow': {
    hdResolutionLabel: '1080p HD • 60 FPS',
    cycleSeconds: 9,
    recommendedSlowSpeed: 0.5,
    cameraAngles: ['sagittal', 'coronal', 'split'],
    phases: [
      {
        id: 'prepare',
        label: '1. Klęk podparty (Stół)',
        shortLabel: 'Postawa',
        startProgress: 0.0,
        endProgress: 0.20,
        breathAction: 'Spokojny oddech',
        romMetricLabel: 'Dłonie pod barkami • Kolana pod biodrami',
        primaryCategory: 'posture',
        hudHeadline: 'Ustaw dłonie pod barkami, kolana pod biodrami, wydłuż szyję',
        hudDetail: 'Odepchnij się aktywnie dłońmi od maty, aby nie zapadać się między łopatkami.',
        mistakeAlert: 'Nie blokuj stawów łokciowych w przeproście.'
      },
      {
        id: 'concentric',
        label: '2. Faza Wyprostu („Krowa”)',
        shortLabel: 'Zakres ROM',
        startProgress: 0.20,
        endProgress: 0.50,
        breathAction: 'Wdech nosem',
        romMetricLabel: 'Wyprost segmentarny: Miednica → Mostek',
        primaryCategory: 'rom',
        hudHeadline: 'Z wdechem unieś kość ogonową i otwórz mostek w przód między ramionami',
        hudDetail: 'Ruch płynie falą od miednicy przez odcinek piersiowy. Wzrok skieruj w podłogę przed matą.',
        mistakeAlert: 'BŁĄD: Gwałtowne zadzieranie głowy w górę i łamanie karku.'
      },
      {
        id: 'isometric',
        label: '3. Faza Zgięcia („Kot”)',
        shortLabel: 'Oddech & Hold',
        startProgress: 0.50,
        endProgress: 0.82,
        breathAction: 'Długi wydech',
        romMetricLabel: 'Kifoza globalna C1-S1: Pełny łuk',
        primaryCategory: 'breathing',
        hudHeadline: 'Z długim wydechem podwiń miednicę i wypchnij środek pleców ku sufitowi',
        hudDetail: 'Na samym końcu opuść swobodnie głowę między ramiona, rozluźniając kark.',
        mistakeAlert: 'BŁĄD: Ruch wyłącznie w lędźwiach przy sztywnej klatce piersiowej.'
      },
      {
        id: 'eccentric',
        label: '4. Powrót do neutralnego stołu',
        shortLabel: 'Powrót',
        startProgress: 0.82,
        endProgress: 1.0,
        breathAction: 'Wdech nosem',
        romMetricLabel: 'Wyrównanie osi: Neutralne',
        primaryCategory: 'mistakes',
        hudHeadline: 'Wróć kręg po kręgu do płaskich pleców i długiej szyi',
        hudDetail: 'Poczuj równomierne rozłożenie ciężaru na dłoniach i kolanach.',
        mistakeAlert: 'BŁĄD: Zbyt szybkie tempo bez synchronizacji z oddechem.'
      }
    ],
    clinicalCues: {
      posture: {
        title: 'Geometria czworoboku podparcia',
        checkpoints: [
          'Nadgarstki ustawione dokładnie pod stawami ramiennymi, palce dłoni szeroko rozłożone.',
          'Kolana pod stawami biodrowymi na szerokość miednicy.',
          'Kark stanowi przedłużenie linii grzbietu.'
        ],
        alignmentVector: 'Mobilizacja falowa (kręg po kręgu) od kości krzyżowej do potylicy'
      },
      rangeOfMotion: {
        title: 'Zakres ruchu (ROM) – Dyskinesis segmentarna',
        safeRangeLabel: 'Pełny bezbólowy łuk zgięcia i wyprostu z naciskiem na sztywny odcinek piersiowy',
        targetAngleOrShift: 'Równomierna dystrybucja ruchu na 24 segmenty kręgosłupa',
        biomechanicalNote: 'Naprzemienna zmiana ciśnienia w krążkach międzykręgowych działa jak pompa osmotyczna odżywiająca chrząstkę.'
      },
      breathing: {
        title: 'Oddech prowadzący falę kręgosłupa',
        patternLabel: 'Wdech otwiera mostek (3s) – Wydech zaokrągla grzbiet (4s)',
        inhalePhase: 'Wdech nosem inicjuje ruch miednicy i otwarcie klatki piersiowej.',
        exhalePhase: 'Długi wydech ustami unosi dolne żebra i zaokrągla plecy ku górze.',
        clinicalTip: 'Zawsze zaczynaj oddech ułamek sekundy przed ruchem kręgosłupa.'
      },
      commonMistakes: [
        {
          mistake: 'Zadzieranie podbródka mocno w górę w fazie wdechu',
          consequence: 'Kompresuje tylne elementy kręgów szyjnych C4-C7.',
          correction: 'Trzymaj tył szyi długi – unosząc mostek, patrz na krawędź maty przed sobą.'
        },
        {
          mistake: 'Praca wyłącznie dolnym odcinkiem lędźwiowym',
          consequence: 'Nadmiernie eksploatuje hipermobilne segmenty L4-L5, pomijając sztywny odcinek piersiowy.',
          correction: 'Skup uwagę na wypychaniu przestrzeni między łopatkami maksymalnie w stronę sufitu.'
        }
      ]
    }
  },

  'lumbar-extension': {
    hdResolutionLabel: '1080p HD • 60 FPS',
    cycleSeconds: 8,
    recommendedSlowSpeed: 0.5,
    cameraAngles: ['sagittal', 'coronal', 'split'],
    phases: [
      {
        id: 'prepare',
        label: '1. Leżenie przodem i rozluźnienie',
        shortLabel: 'Postawa',
        startProgress: 0.0,
        endProgress: 0.22,
        breathAction: 'Wdech nosem',
        romMetricLabel: 'Miednica na macie • Pośladki 0% napięcia',
        primaryCategory: 'posture',
        hudHeadline: 'Połóż dłonie pod barkami i całkowicie rozluźnij pośladki oraz nogi',
        hudDetail: 'Kolce biodrowe przednie spoczywają ciężko na macie. Dolne plecy są całkowicie bierne.',
        mistakeAlert: 'Nie napinaj mięśni pośladkowych ani prostowników grzbietu przed uniesieniem.'
      },
      {
        id: 'concentric',
        label: '2. Bierny wyprost pracą rąk (ROM)',
        shortLabel: 'Zakres ROM',
        startProgress: 0.22,
        endProgress: 0.52,
        breathAction: 'Wydech ustami',
        romMetricLabel: 'Wyprost L1-S1: 25°–35° (Centralizacja)',
        primaryCategory: 'rom',
        hudHeadline: 'Prostuj ramiona z wydechem, pozwalając brzuchowi i miednicy zwisać na macie',
        hudDetail: 'Całą pracę wykonują tricepsy i obręcz barkowa – kręgosłup lędźwiowy wygina się biernie.',
        mistakeAlert: 'BŁĄD: Odrywanie bioder i miednicy od podłogi.'
      },
      {
        id: 'isometric',
        label: '3. Szczyt wyprostu („Sag” 2 s)',
        shortLabel: 'Oddech & Hold',
        startProgress: 0.52,
        endProgress: 0.78,
        breathAction: 'Długi wydech',
        romMetricLabel: 'Dekompresja przednia L4-S1: 2.0 s',
        primaryCategory: 'breathing',
        hudHeadline: 'W szczycie ruchu wypuść powietrze i pozwól lędźwiom opaść ku podłodze',
        hudDetail: 'Obserwuj zjawisko centralizacji: ból z pośladka lub uda powinien cofać się ku środkowi pleców.',
        mistakeAlert: 'BŁĄD: Jeśli ból promieniuje dalej do łydki/stopy, natychmiast przerwij!'
      },
      {
        id: 'eccentric',
        label: '4. Płynne opuszczenie klatki',
        shortLabel: 'Powrót',
        startProgress: 0.78,
        endProgress: 1.0,
        breathAction: 'Wdech nosem',
        romMetricLabel: 'Powrót do poziomu maty: 0°',
        primaryCategory: 'mistakes',
        hudHeadline: 'Powoli ugnij łokcie i opuść klatkę piersiową z powrotem na matę',
        hudDetail: 'Odpocznij przez sekundę na macie przed kolejnym powtórzeniem.',
        mistakeAlert: 'BŁĄD: Unoszenie tułowia siłą mięśni pleców zamiast pchania rękami.'
      }
    ],
    clinicalCues: {
      posture: {
        title: 'Zasada biernego kręgosłupa wg McKenziego',
        checkpoints: [
          'Dłonie ułożone na wysokości barków (lub nieco wyżej przy mniejszej ruchomości).',
          'Miednica i uda przyklejone do podłoża przez cały czas trwania ruchu.',
          'Pośladki i mięśnie przykręgosłupowe w 100% rozluźnione.'
        ],
        alignmentVector: 'Domknięcie tylnego pierścienia włóknistego i przesunięcie jądra miażdżystego ku przodowi'
      },
      rangeOfMotion: {
        title: 'Zakres ruchu (ROM) i zjawisko Centralizacji',
        safeRangeLabel: 'Uniesienie klatki do kąta, w którym miednica nadal dotyka maty',
        targetAngleOrShift: '25°–35° biernej lordozy L4-L5-S1',
        biomechanicalNote: 'Kluczowy wskaźnik bezpieczeństwa: centralizacja (cofanie się bólu z nogi do centrum lędźwi) oznacza właściwy kierunek terapeutyczny.'
      },
      breathing: {
        title: 'Metoda „Exhale & Sag” (Wydech i opadnięcie)',
        patternLabel: 'Wdech na macie – Wydech podczas wyprostu i rozluźnienia w górze',
        inhalePhase: 'Wdech nosem w leżeniu przodem oraz podczas opuszczania tułowia.',
        exhalePhase: 'Pełny wydech ustami na szczycie wyprostu, pozwalający miednicy opaść niżej.',
        clinicalTip: 'Wydech w szczycie ruchu zmniejsza opór mięśni brzucha i pogłębia terapeutyczny wyprost o 5°.'
      },
      commonMistakes: [
        {
          mistake: 'Zaciskanie pośladków i unoszenie tułowia mięśniami grzbietu',
          consequence: 'Zwiększa kompresję osiową dysków zamiast tworzyć podciśnienie dla jądra miażdżystego.',
          correction: 'Przed każdym powtórzeniem poruszaj lekko biodrami na boki, aby upewnić się, że pośladki są luźne.'
        },
        {
          mistake: 'Odrywanie kolców biodrowych od maty (robienie „deski”)',
          consequence: 'Znosi kąt wyprostu w segmentach L4-S1.',
          correction: 'Ugnij łokcie nieco bardziej lub przesuń dłonie o 10 cm do przodu, tak by biodra leżały na podłodze.'
        }
      ]
    }
  },

  'axial-towel-traction': {
    hdResolutionLabel: '1080p HD • 60 FPS',
    cycleSeconds: 10,
    recommendedSlowSpeed: 0.5,
    cameraAngles: ['sagittal', 'coronal', 'split'],
    phases: [
      {
        id: 'prepare',
        label: '1. Osadzenie ręcznika pod potylicą',
        shortLabel: 'Postawa',
        startProgress: 0.0,
        endProgress: 0.20,
        breathAction: 'Wdech nosem',
        romMetricLabel: 'Wektor taśmy: 45° (Skos w górę)',
        primaryCategory: 'posture',
        hudHeadline: 'Umieść zrolowany ręcznik pod kością potyliczną, chwyć końce z przodu',
        hudDetail: 'Usiądź wygodnie z opartymi plecami. Ręcznik obejmuje podstawę czaszki, nie środek szyi.',
        mistakeAlert: 'Nie umieszczaj ręcznika nisko na kręgach C5-C7.'
      },
      {
        id: 'concentric',
        label: '2. Łagodna trakcja osiowa (ROM)',
        shortLabel: 'Zakres ROM',
        startProgress: 0.20,
        endProgress: 0.48,
        breathAction: 'Wydech ustami',
        romMetricLabel: 'Dekompresja C3-C7: Wektor 45°',
        primaryCategory: 'rom',
        hudHeadline: 'Pociągnij końce ręcznika delikatnie w przód i w górę (pod kątem 45°)',
        hudDetail: 'Ręcznik przejmuje ciężar głowy, rozszerzając przestrzenie międzykręgowe bez wyginania szyi.',
        mistakeAlert: 'BŁĄD: Ciągnięcie poziomo w przód lub zadzieranie głowy do tyłu.'
      },
      {
        id: 'isometric',
        label: '3. Odciążenie z oddechem (12 s)',
        shortLabel: 'Oddech & Hold',
        startProgress: 0.48,
        endProgress: 0.82,
        breathAction: 'Długi wydech',
        romMetricLabel: 'Trakcja statyczna: 10–15 s',
        primaryCategory: 'breathing',
        hudHeadline: 'Utrzymuj subtelny uciąg i oddychaj spokojnie torem brzusznym',
        hudDetail: 'Poczuj przyjemne odciążenie i wydłużenie karku. Siła rąk powinna być minimalna (ok. 15–20%).',
        mistakeAlert: 'BŁĄD: Napinanie mięśni szyi przeciwko sile ręcznika.'
      },
      {
        id: 'eccentric',
        label: '4. Stopniowe zwolnienie naciągu',
        shortLabel: 'Powrót',
        startProgress: 0.82,
        endProgress: 1.0,
        breathAction: 'Wdech nosem',
        romMetricLabel: 'Redukcja trakcji: Płynnie do 0%',
        primaryCategory: 'mistakes',
        hudHeadline: 'Bardzo powoli zmniejszaj naciąg ręcznika przez pełne 3 sekundy',
        hudDetail: 'Nigdy nie puszczaj ręcznika gwałtownie – krążki międzykręgowe muszą łagodnie przejąć obciążenie.',
        mistakeAlert: 'BŁĄD: Nagłe puszczenie końców ręcznika.'
      }
    ],
    clinicalCues: {
      posture: {
        title: 'Geometria wektora trakcji szyjnej',
        checkpoints: [
          'Wałek z ręcznika zaczepiony o guzowatość potyliczną zewnętrzną (pod czaszką).',
          'Przedramiona uniesione tak, by dłonie ciągnęły w linii kości jarzmowych/czubka głowy (kąt 45°).',
          'Głowa całkowicie bierna – mięśnie szyi oddają ciężar w ręcznik.'
        ],
        alignmentVector: 'Wektor trakcji osiowej 45° w płaszczyźnie strzałkowej'
      },
      rangeOfMotion: {
        title: 'Zakres ruchu (ROM) – Dekompresja liniowa',
        safeRangeLabel: '1–2 mm separacji stawowej bez zmiany kąta wyprostu szyi',
        targetAngleOrShift: 'Wektor 45° • Kąt wyprostu szyi 0° (pozycja neutralna)',
        biomechanicalNote: 'Trakcja osiowa obniża ciśnienie wewnątrzdyskowe i poszerza otwory międzykręgowe, przynosząc ulgę w ostrym bólu korzeniowym.'
      },
      breathing: {
        title: 'Oddech wspomagający relaksację więzadłową',
        patternLabel: '3 spokojne cykle oddechowe podczas utrzymywania trakcji',
        inhalePhase: 'Łagodny wdech nosem do dolnych żeber.',
        exhalePhase: 'Długi wydech ustami z mentalnym oddaniem ciężaru głowy w ręcznik.',
        clinicalTip: 'Z każdym wydechem staraj się rozluźnić kark jeszcze bardziej, nie zwiększając siły rąk.'
      },
      commonMistakes: [
        {
          mistake: 'Zadzieranie głowy w tył przez ciągnięcie ręcznika w dół/poziomo',
          consequence: 'Zamyka otwory międzykręgowe zamiast je otwierać.',
          correction: 'Skieruj dłonie z ręcznikiem wyraźnie w górę – w stronę narożnika między ścianą a sufitem przed Tobą.'
        },
        {
          mistake: 'Gwałtowne zwolnienie naciągu ręcznika po zakończeniu serii',
          consequence: 'Wywołuje wtórny skurcz obronny mięśni przykręgosłupowych.',
          correction: 'Odpuszczaj siłę uciągu milimetr po milimetrze przez minimum 3 sekundy.'
        }
      ]
    }
  },

  'diaphragmatic-neck-relief': {
    hdResolutionLabel: '1080p HD • 60 FPS',
    cycleSeconds: 10,
    recommendedSlowSpeed: 0.75,
    cameraAngles: ['coronal', 'sagittal', 'split'],
    phases: [
      {
        id: 'prepare',
        label: '1. Pozycja odciążająca i dłonie na żebrach',
        shortLabel: 'Postawa',
        startProgress: 0.0,
        endProgress: 0.18,
        breathAction: 'Spokojny oddech',
        romMetricLabel: 'Barki: 0% aktywności (Wyłączone)',
        primaryCategory: 'posture',
        hudHeadline: 'Połóż dłonie na bocznych łukach dolnych żeber i rozluźnij kark',
        hudDetail: 'Oprzyj głowę i plecy wygodnie. Obojczyki oraz mięśnie szyi mają pozostać całkowicie nieruchome.',
        mistakeAlert: 'Nie kładź dłoni wysoko na mostku.'
      },
      {
        id: 'concentric',
        label: '2. Wdech 360° w dolne żebra (4 s)',
        shortLabel: 'Zakres ROM',
        startProgress: 0.18,
        endProgress: 0.50,
        breathAction: 'Wdech nosem',
        romMetricLabel: 'Ekspansja żeber: +3–4 cm na boki',
        primaryCategory: 'rom',
        hudHeadline: 'Wciągaj powietrze nosem przez 4 s, rozpychając dolne żebra na boki',
        hudDetail: 'Twoje dłonie na dolnych żebrach oddalają się od siebie, podczas gdy szyja i barki nawet nie drgną.',
        mistakeAlert: 'BŁĄD: Unoszenie górnej klatki piersiowej i napinanie mięśni pochyłych szyi.'
      },
      {
        id: 'isometric',
        label: '3. Miękka pauza szczytowa (2 s)',
        shortLabel: 'Oddech & Hold',
        startProgress: 0.50,
        endProgress: 0.65,
        breathAction: 'Spokojny oddech',
        romMetricLabel: 'Pauza relaksacyjna: 2.0 s',
        primaryCategory: 'breathing',
        hudHeadline: 'Zatrzymaj delikatnie oddech na 2 sekundy bez zaciskania krtani',
        hudDetail: 'Poczuj przestrzeń w klatce piersiowej przy zupełnie miękkim, rozluźnionym karku.',
        mistakeAlert: 'BŁĄD: Zaciskanie gardła i szczęki w trakcie pauzy.'
      },
      {
        id: 'eccentric',
        label: '4. Wydłużony wydech wagotoniczny (6 s)',
        shortLabel: 'Powrót',
        startProgress: 0.65,
        endProgress: 1.0,
        breathAction: 'Długi wydech',
        romMetricLabel: 'Wydech 6.0 s • Tonus karku ↓',
        primaryCategory: 'mistakes',
        hudHeadline: 'Wypuszczaj powietrze powoli przez 6 sekund, opuszczając żebra do wewnątrz',
        hudDetail: 'Wydłużony wydech aktywuje nerw błędny i wygasza ostry skurcz obronny mięśni szyi.',
        mistakeAlert: 'BŁĄD: Zbyt szybki, forsowny wydech powodujący napięcie brzucha i karku.'
      }
    ],
    clinicalCues: {
      posture: {
        title: 'Wyłączenie pomocniczych mięśni oddechowych szyi',
        checkpoints: [
          'Głowa i odcinek szyjny w pełni podparte (na poduszce ortopedycznej lub oparciu fotela).',
          'Dłonie ułożone na żebrach VIII–X (dolno-boczna część klatki piersiowej).',
          'Szczęki rozdzielone, barki opadają luźno w dół pod własnym ciężarem.'
        ],
        alignmentVector: 'Ekspansja boczno-tylna dolnego otworu klatki piersiowej przy nieruchomej obręczy barkowej'
      },
      rangeOfMotion: {
        title: 'Zakres ruchu (ROM) kopuły przepony i łuków żebrowych',
        safeRangeLabel: '3–4 cm rozszerzenia wymiaru poprzecznego dolnych żeber przy 0 mm ruchu obojczyków',
        targetAngleOrShift: 'Ruchomość żeber dolnych 100% • Ruchomość barków 0%',
        biomechanicalNote: 'W ostrym bólu pacjent oddycha górnym torem piersiowym, wykonując 20 000 mikonapięć mięśni pochyłych szyi na dobę. Przekierowanie ruchu do przepony przerywa to błędne koło.'
      },
      breathing: {
        title: 'Protokół oddechowy 4–2–6 (Wyciszenie nocycepcji)',
        patternLabel: '4s Wdech nosem – 2s Pauza – 6s Wydech ustami',
        inhalePhase: 'Powolny, cichy wdech nosem kierowany w dłonie spoczywające na dolnych żebrach.',
        exhalePhase: 'Długi, bezgłośny wydech przez lekko rozchylone usta (1.5x dłuższy niż wdech).',
        clinicalTip: 'Stosunek wydechu do wdechu 3:2 natychmiast obniża tętno spoczynkowe i napięcie mięśni podpotylicznych.'
      },
      commonMistakes: [
        {
          mistake: 'Branie maksymalnie głębokich, siłowych wdechów',
          consequence: 'Uruchamia mięśnie szyi (mm. pochyłe i MOS) oraz prowadzi do zawrotów głowy z hiperwentylacji.',
          correction: 'Nabieraj tylko ok. 70% objętości płuc – oddech ma być cichy, powolny i bezwysiłkowy.'
        },
        {
          mistake: 'Wypychanie samego brzucha w przód przy sztywnych żebrach',
          consequence: 'Ogranicza trójwymiarową pracę przepony.',
          correction: 'Skup się na tym, by dłonie na bokach dolnych żeber rozsuwały się na boki jak skrzela.'
        }
      ]
    }
  }
};

export function getExerciseVideoInstruction(exercise: Exercise): VideoInstruction {
  if (exercise.videoInstruction) {
    return exercise.videoInstruction;
  }
  if (VIDEO_INSTRUCTIONS_BY_ID[exercise.id]) {
    return VIDEO_INSTRUCTIONS_BY_ID[exercise.id];
  }
  return VIDEO_INSTRUCTIONS_BY_ID['chin-tuck'];
}
