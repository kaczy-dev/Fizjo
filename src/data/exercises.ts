import { Exercise } from '../types';

export const EXERCISES: Exercise[] = [
  {
    id: 'chin-tuck',
    name: 'Chin Tuck (Retrakcja szyjna)',
    polishName: 'Cofanie brody (Retrakcja szyi)',
    region: 'cervical',
    difficulty: 'Łatwe',
    targetMuscles: ['m. długi szyi (Longus colli)', 'm. długi głowy', 'rozciąganie mm. podpotylicznych'],
    description: 'Fundamentalne ćwiczenie fizjoterapeutyczne zwalczające protrakcję głowy ("tech-neck") i odciążające dyski C5-C7.',
    steps: [
      'Usiądź prosto, opuść barki luźno i skieruj wzrok prosto przed siebie.',
      'Połóż dwa palce na brodzie, aby czuć wektor ruchu.',
      'Płynnym ruchem cofnij brodę w stronę potylicy, jakbyś chciał zrobić "podwójny podbródek".',
      'Nie pochylaj głowy w dół ani nie zadzieraj w górę – ruch odbywa się ściśle w płaszczyźnie poziomej.',
      'Utrzymaj pozycję przez 3-5 sekund, czując delikatne wydłużenie z tyłu karku.',
      'Spokojnym ruchem powróć do pozycji wyjściowej i powtórz.'
    ],
    safetyWarnings: [
      'Ruch nie może wywoływać zawrotów głowy ani bólu promieniującego do rąk.',
      'Nie wykonuj gwałtownego szarpnięcia – nacisk powinien być płynny i kontrolowany.'
    ],
    commonMistakes: [
      'Pochylanie głowy w dół w stronę mostka zamiast ruchu poziomego w tył.',
      'Unoszenie barków do uszu podczas cofania głowy.'
    ],
    defaultSets: 3,
    defaultReps: 10,
    defaultHoldSeconds: 4,
    tempo: '2-4-2',
    breathingCue: 'Wdech w pozycji wyjściowej, wydech w trakcie cofania brody, spokojny oddech w zatrzymaniu.',
    idealForSymptoms: ['tech-neck', 'ból karku przy komputerze', 'sztywność poranna', 'bóle głowy odkręgosłupowe'],
    contraindications: ['ostry stan po urazie typu whiplash (poniżej 72h)', 'silne zawroty głowy z nudnościami'],
    animationType: 'chin_tuck',
    videoUrl: 'https://www.youtube.com/watch?v=wQt_8mJmKQE',
    videoEmbedUrl: 'https://www.youtube-nocookie.com/embed/wQt_8mJmKQE',
    videoDuration: '2:40 min',
    videoInstructor: 'Fizjoterapeuta Kliniczny – Technika Retrakcji Szyi'
  },
  {
    id: 'isometric-neck',
    name: 'Izometryczne wzmacnianie szyi (4 kierunki)',
    polishName: 'Stabilizacja izometryczna szyi',
    region: 'cervical',
    difficulty: 'Łatwe',
    targetMuscles: ['Głębokie zginacze i prostowniki szyi', 'm. mostkowo-obojczykowo-sutkowy'],
    description: 'Wzmacnianie mięśni podtrzymujących odcinek szyjny bez zmiany długości mięśnia i bez ruchu w stawach kręgowych – bezpieczne nawet przy dyskopatii.',
    steps: [
      'Usiądź w pozycji neutralnej z wyprostowanym kręgosłupem.',
      'Przyłóż nasadę dłoni do czoła. Wywieraj delikatny nacisk głową w przód, stawiając dłonią równy opór (głowa nie porusza się).',
      'Utrzymaj napięcie przez 5 sekund (ok. 20-30% maksymalnej siły).',
      'Przyłóż splecione dłonie z tyłu potylicy i napieraj głową w tył przez 5 sekund.',
      'Przyłóż prawą dłoń nad prawym uchem i napieraj w bok, następnie powtórz na lewą stronę.'
    ],
    safetyWarnings: [
      'Nie wstrzymuj oddechu podczas napinania mięśni.',
      'Naciskaj z umiarkowaną siłą (20-30%) – to ćwiczenie na koordynację nerwowo-mięśniową, nie trójbój.'
    ],
    commonMistakes: [
      'Za mocny nacisk powodujący drżenie mięśni.',
      'Przemieszczanie głowy zamiast czystego napięcia izometrycznego.'
    ],
    defaultSets: 2,
    defaultReps: 5,
    defaultHoldSeconds: 5,
    tempo: '1-5-1',
    breathingCue: 'Płynny, jednostajny oddech torem przeponowym bez zaciskania gardła.',
    idealForSymptoms: ['osłabienie mięśni szyi', 'niestabilność odcinka szyjnego', 'nawracające napięcia'],
    contraindications: ['ostre zaostrzenie stanu zapalnego ze skurczem obronnym'],
    animationType: 'isometric_neck',
    videoUrl: 'https://www.youtube.com/watch?v=gS7P8u-lE6c',
    videoEmbedUrl: 'https://www.youtube-nocookie.com/embed/gS7P8u-lE6c',
    videoDuration: '3:10 min',
    videoInstructor: 'Instruktaż Stabilizacji Izometrycznej C1-C7'
  },
  {
    id: 'trapezius-stretch',
    name: 'Rozciąganie mięśnia czworobocznego',
    polishName: 'Rozluźnianie mięśnia czworobocznego (Trapezius)',
    region: 'cervical',
    difficulty: 'Łatwe',
    targetMuscles: ['m. czworoboczny część zstępująca', 'm. dźwigacz łopatki'],
    description: 'Usuwa nagromadzone napięcie w rejonie barku i podstawy szyi, typowe dla osób spędzających godziny w stresie przy biurku.',
    steps: [
      'Usiądź prosto. Prawą ręką chwyć krawędź krzesła od spodu, aby ustabilizować prawy bark w dole.',
      'Powoli skieruj lewe ucho w stronę lewego barku (skłon boczny głowy).',
      'Lewą dłoń delikatnie połóż na prawej stronie głowy – nie ciągnij, pozwól by sam ciężar ręki pogłębił rozciąganie.',
      'Poczuj przyjemne rozciąganie bocznej części szyi i prawego barku.',
      'Oddychaj głęboko przez 20-30 sekund, następnie powoli powróć i zmień stronę.'
    ],
    safetyWarnings: [
      'Nigdy nie szarp głowy! Ciężar ręki jest w zupełności wystarczający.',
      'Jeśli pojawi się mrowienie w palcach ręki, natychmiast zmniejsz zakres.'
    ],
    commonMistakes: [
      'Unoszenie barku rozciąganego boku do góry.',
      'Rotacja tułowia podczas skłonu bocznego.'
    ],
    defaultSets: 2,
    defaultReps: 3,
    defaultHoldSeconds: 20,
    tempo: '2-20-2',
    breathingCue: 'Z każdym wydechem wyobraź sobie opadanie napięcia z barku ku dołowi.',
    idealForSymptoms: ['napięcie barków', 'ból karku po całym dniu pracy', 'stresowe zaciskanie ramion'],
    contraindications: ['aktywny zespół korzeniowy szyjny z uciskiem na nerw w fazie ostrej'],
    animationType: 'trapezius_stretch',
    videoUrl: 'https://www.youtube.com/watch?v=kYJv_yP2m-w',
    videoEmbedUrl: 'https://www.youtube-nocookie.com/embed/kYJv_yP2m-w',
    videoDuration: '2:15 min',
    videoInstructor: 'Rozluźnianie Mięśni Karku i Obręczy Barkowej'
  },
  {
    id: 'suboccipital-release',
    name: 'Automasaż i rozluźnienie mm. podpotylicznych',
    polishName: 'Rozluźnienie mięśni podpotylicznych',
    region: 'cervical',
    difficulty: 'Łatwe',
    targetMuscles: ['mm. podpotyliczne (Suboccipitales)', 'm. prosty tylny głowy'],
    description: 'Kluczowe techniki walki z napięciowymi bólami głowy (promieniującymi od potylicy za oko) oraz sztywnością po długim patrzeniu w monitor.',
    steps: [
      'Połóż opuszki kciuków lub palców wskazujących tuż pod kością czaszki (na granicy potylicy i karku).',
      'Znajdź wrażliwe, napięte punkty w dołkach podpotylicznych po obu stronach kręgosłupa.',
      'Wywieraj delikatny, jednostajny nacisk ku górze i przodowi.',
      'Jednocześnie wykonaj powolny mikroruch cofnięcia brody (jak skinienie mówiące "tak" o amplitudzie 2-3 cm).',
      'Utrzymaj delikatny ucisk przez 30 sekund, pozwalając tkankom się rozluźnić.'
    ],
    safetyWarnings: [
      'Naciskaj z wyczuciem – to nie może być ból ostry ani pulsujący.',
      'Unikaj bezpośredniego uciskania tętnicy szyjnej (z boku szyi) – pracuj wyłącznie z tyłu pod kością potyliczną.'
    ],
    commonMistakes: [
      'Zbyt silne wbijanie paznokci lub zbyt szybkie ruchy masujące.',
      'Zadzieranie głowy do tyłu podczas masażu.'
    ],
    defaultSets: 1,
    defaultReps: 3,
    defaultHoldSeconds: 30,
    tempo: '1-30-1',
    breathingCue: 'Spokojne, wydłużone wydechy przez lekko rozchylone usta.',
    idealForSymptoms: ['bóle głowy typu napięciowego', 'uczucie obręczy na głowie', 'zmęczenie wzroku od karku'],
    contraindications: ['tętniak, świeży uraz czaszkowo-mózgowy'],
    animationType: 'suboccipital_release',
    videoUrl: 'https://www.youtube.com/watch?v=sY0F3JkHnB0',
    videoEmbedUrl: 'https://www.youtube-nocookie.com/embed/sY0F3JkHnB0',
    videoDuration: '3:45 min',
    videoInstructor: 'Autoterapia Punktów Spustowych Podpotylicznych'
  },
  {
    id: 'neck-rotations',
    name: 'Kontrolowane rotacje szyi z zatrzymaniem',
    polishName: 'Mobilizacja rotacyjna szyi z pauzą',
    region: 'cervical',
    difficulty: 'Łatwe',
    targetMuscles: ['mm. rotatory szyi', 'm. płatowaty głowy i szyi'],
    description: 'Przywracanie pełnego, bezbolesnego zakresu obrotu głowy (np. do sprawdzania martwego pola w samochodzie lub pracy na dwóch monitorach).',
    steps: [
      'Usiądź z kręgosłupem wydłużonym osiowo ku sufitowi.',
      'Wykonaj delikatne cofnięcie brody (chin tuck), aby ustabilizować odcinek szyjny.',
      'Powolnym, płynnym ruchem obróć głowę w prawo, aż poczujesz pierwszą bezpieczną barierę oporu.',
      'Zatrzymaj ruch na 3 sekundy, patrząc w prawo bez unoszenia barków.',
      'Powoli powróć do centrum, weź wdech i wykonaj obrót w lewo z 3-sekundową pauzą.'
    ],
    safetyWarnings: [
      'Nigdy nie przekraczaj granicy ostrego bólu – ruch powinien być łagodny i gładki.',
      'Nie rób pełnych obrotów głowy po kole (krążenia głową są odradzane w nowoczesnej fizjoterapii z uwagi na kompresję krążków i tętnic kręgowych!).'
    ],
    commonMistakes: [
      'Wykonywanie gwałtownych szarpnięć głową na boki.',
      'Ruch tułowia lub skręcanie barków wraz z głową.'
    ],
    defaultSets: 2,
    defaultReps: 8,
    defaultHoldSeconds: 3,
    tempo: '3-3-3',
    breathingCue: 'Wdech w pozycji środkowej, wydech w trakcie obrotu i pauzy w skrajnym punkcie.',
    idealForSymptoms: ['ograniczenie skrętu głowy', 'sztywność szyi po nocy', 'asymetria ruchomości'],
    contraindications: ['niestabilność szczytowo-obrotowa C1-C2', 'objawy ucisku tętnicy kręgowej (nystagmus, drop attacks)'],
    animationType: 'neck_rotation',
    videoUrl: 'https://www.youtube.com/watch?v=yYJ6gV4y1_0',
    videoEmbedUrl: 'https://www.youtube-nocookie.com/embed/yYJ6gV4y1_0',
    videoDuration: '2:30 min',
    videoInstructor: 'Mobilizacja Rotacyjna Szyi w Bezpiecznym Zakresie'
  },
  {
    id: 'brugger-relief',
    name: 'Pozycja odciążająca Brüggera',
    polishName: 'Otwieranie klatki i odciążenie wg Brüggera',
    region: 'thoracic',
    difficulty: 'Łatwe',
    targetMuscles: ['m. piersiowy większy i mniejszy (rozciąganie)', 'mm. międzyłopatkowe (aktywacja)'],
    description: 'Złoty standard ergonomii biurowej – natychmiastowe odwrócenie zgarbionej pozycji siedzącej, ułatwiające dotlenienie i krążenie w kręgosłupie.',
    steps: [
      'Przesuń się na przednią krawędź krzesła, stopy rozstaw pewnie na podłożu.',
      'Ustaw miednicę w lekkim przodopochyleniu, wyprostuj dolny i środkowy kręgosłup.',
      'Opuszczone wzdłuż tułowia ręce obróć na zewnątrz tak, by wnętrza dłoni były skierowane w przód/na zewnątrz, a kciuki w tył.',
      'Ściągnij łopatki w tył i w dół (w stronę kieszeni spodni), otwierając klatkę piersiową.',
      'Cofnij delikatnie brodę i weź 3 głębokie oddechy przeponowe.'
    ],
    safetyWarnings: [
      'Nie pogłębiaj nadmiernie lordozy lędźwiowej – brzuch powinien pozostać lekko aktywny.'
    ],
    commonMistakes: [
      'Wyginanie się w lędźwiach zamiast pracy w odcinku piersiowym i łopatkach.',
      'Zadzieranie głowy do góry.'
    ],
    defaultSets: 1,
    defaultReps: 5,
    defaultHoldSeconds: 15,
    tempo: '2-15-2',
    breathingCue: 'Głęboki wdech dolnożebrowy rozszerzający klatkę piersiową, powolny wydech ustami.',
    idealForSymptoms: ['garbienie się', 'płytki oddech przy biurku', 'zmęczenie pleców po godzinach pracy'],
    contraindications: ['brak istotnych przeciwwskazań'],
    animationType: 'brugger_relief',
    videoUrl: 'https://www.youtube.com/watch?v=Xz2gUoF9_X0',
    videoEmbedUrl: 'https://www.youtube-nocookie.com/embed/Xz2gUoF9_X0',
    videoDuration: '1:50 min',
    videoInstructor: 'Ergonomia Biurowa – Pozycja Brüggera w Pracy'
  },
  {
    id: 'scapular-retraction',
    name: 'Retrakcja i depresja łopatek (W-to-Y)',
    polishName: 'Wzmacnianie dolnego czworobocznego (W-to-Y)',
    region: 'thoracic',
    difficulty: 'Średnie',
    targetMuscles: ['m. czworoboczny część wstępująca (dolna)', 'm. zębaty przedni', 'mm. równoległoboczne'],
    description: 'Stabilizacja łopatek to fundament zdrowej szyi – gdy łopatka opada i rotuje ku przodowi, mięśnie szyi są stale przeciążane.',
    steps: [
      'Stań plecami do ściany lub usiądź prosto. Unieś ramiona, uginając łokcie w kształt litery "W".',
      'Ściągnij łopatki do siebie i w dół, trzymając łokcie blisko tułowia.',
      'Powolnym ruchem wyciągnij ramiona w górę i lekko w bok do kształtu litery "Y", pilnując by barki nie podjechały do uszu.',
      'Zatrzymaj na 2 sekundy w literze Y, po czym opuść z powrotem do W, mocno aktywując mięśnie między łopatkami.',
      'Powtórz 10-12 razy płynnym ruchem.'
    ],
    safetyWarnings: [
      'Barki muszą pozostać w dole – przestrzeń między szyją a ramionami powinna być szeroka.'
    ],
    commonMistakes: [
      'Napinanie mięśni karku zamiast mięśni dolnej części łopatek.',
      'Wypychanie brzucha w przód przy unoszeniu rąk.'
    ],
    defaultSets: 3,
    defaultReps: 10,
    defaultHoldSeconds: 2,
    tempo: '2-2-2',
    breathingCue: 'Wydech przy ruchu w górę do Y, wdech przy powrocie do W i ściągnięciu łopatek.',
    idealForSymptoms: ['odstające łopatki', 'pieczenie między łopatkami', 'osłabienie mięśni grzbietu'],
    contraindications: ['zespół cieśni podbarkowej w fazie ostrego bólu'],
    animationType: 'scapular_retraction',
    videoUrl: 'https://www.youtube.com/watch?v=9g0HwT9u7c0',
    videoEmbedUrl: 'https://www.youtube-nocookie.com/embed/9g0HwT9u7c0',
    videoDuration: '3:20 min',
    videoInstructor: 'Stabilizacja Łopatek i Wzmacnianie Grzbietu'
  },
  {
    id: 'nerve-floss',
    name: 'Neurodynamika: Ślizg nerwu pośrodkowego',
    polishName: 'Mobilizacja nerwu pośrodkowego (Nerve Flossing)',
    region: 'cervical',
    difficulty: 'Średnie',
    targetMuscles: ['splot ramienny', 'nerw pośrodkowy'],
    description: 'Delikatny drenaż i przywracanie ślizgu pnia nerwowego przy drętwieniu palców, uczuciu "ciagnięcia" wzdłuż ręki i rwie barkowej.',
    steps: [
      'Stań lub usiądź prosto. Wyciągnij prawe ramię w bok na wysokość barku, zgięte w łokciu pod kątem 90 stopni z dłonią uniesioną do góry (jak kelner niosący tacę).',
      'Powoli prostuj łokieć i zginaj nadgarstek w dół (palce skierowane w stronę podłogi).',
      'Gdy prostujesz ramię, JEDNOCZEŚNIE przechyl głowę W STRONĘ tego samego prawego barku (odciążenie nerwu u korzenia).',
      'Gdy zginasz rękę z powrotem, przechyl głowę w drugą stronę.',
      'Dzięki temu nerw "ślizga się" w swoim kanale bez nadmiernego rozciągania.',
      'Wykonaj 8-10 powtórzeń na jedną stronę.'
    ],
    safetyWarnings: [
      'NIE wywołuj bólu ani mrowienia! Jeśli poczujesz prąd w palcach, zmniejsz kąt wyprostu ręki.',
      'Ruch ma być powolny i płynny jak taniec.'
    ],
    commonMistakes: [
      'Pochylanie głowy w przeciwną stronę przy wyprostowanym ramieniu (powoduje to silne, szkodliwe naciągnięcie nerwu zamiast ślizgu!).',
      'Zbyt agresywne i szybkie tempo.'
    ],
    defaultSets: 2,
    defaultReps: 8,
    defaultHoldSeconds: 1,
    tempo: '2-1-2',
    breathingCue: 'Głęboki, uspokajający oddech.',
    idealForSymptoms: ['mrowienie w palcach I-III', 'drętwienie ręki rano', 'uczucie ciągnięcia wzdłuż ramienia'],
    contraindications: ['ostre zapalenie nerwu z niedowładem dłoni', 'ciężki deficyt neurologiczny'],
    animationType: 'nerve_floss',
    videoUrl: 'https://www.youtube.com/watch?v=H7e4j9Jq9n0',
    videoEmbedUrl: 'https://www.youtube-nocookie.com/embed/H7e4j9Jq9n0',
    videoDuration: '3:05 min',
    videoInstructor: 'Neurodynamika Kliniczna – Ślizg Nerwowy Szyi'
  },
  {
    id: 'cat-cow',
    name: 'Koci grzbiet i siodło (Wariant segmentarny)',
    polishName: 'Koci grzbiet – mobilizacja kręgosłupa segment po segmencie',
    region: 'full_spine',
    difficulty: 'Łatwe',
    targetMuscles: ['m. prostownik grzbietu', 'm. prosty brzucha', 'mm. wielodzielne'],
    description: 'Klasyk rehabilitacji przywracający ruchomość w każdym segmencie kręgosłupa od kości ogonowej aż po szczyt czaszki.',
    steps: [
      'Przejdź do klęku podpartego: dłonie pod barkami, kolana pod biodrami, kręgosłup w pozycji neutralnej.',
      'Z wdechem powoli opuszczaj brzuch ku macie, unoś klatkę piersiową i delikatnie wzrok przed siebie (pozycja "Krowa").',
      'Poczuj wyprost w całym kręgosłupie bez zalamania w lędźwiach.',
      'Z wydechem podwiń miednicę, wypchnij środek pleców ku sufitowi i na końcu swobodnie opuść głowę w dół między ramiona (pozycja "Kot").',
      'Powtarzaj płynnie, synchronizując każdy ruch z własnym tempem oddechu.'
    ],
    safetyWarnings: [
      'Nie forsuj wyprostu szyi – wzrok kieruj przed siebie na podłogę, nie zadzieraj głowy do sufitu.',
      'Jeśli masz ból kolan, podłóż pod nie zwinięty ręcznik.'
    ],
    commonMistakes: [
      'Wykonywanie ruchu tylko w lędźwiach z zablokowaną klatką piersiową.',
      'Zbyt szybkie, nieskoordynowane tempo.'
    ],
    defaultSets: 2,
    defaultReps: 10,
    defaultHoldSeconds: 3,
    tempo: '3-3-3',
    breathingCue: 'Wdech otwiera klatkę, wydech zaokrągla całe plecy i opróżnia płuca.',
    idealForSymptoms: ['sztywność całego kręgosłupa', 'poranny dyskomfort pleców', 'ogólna poprawa elastyczności'],
    contraindications: ['ostry kręgozmyk', 'ból przy jakimkolwiek zgięciu'],
    animationType: 'cat_cow',
    videoUrl: 'https://www.youtube.com/watch?v=vqvhB1bW7Qc',
    videoEmbedUrl: 'https://www.youtube-nocookie.com/embed/vqvhB1bW7Qc',
    videoDuration: '2:50 min',
    videoInstructor: 'Prawidłowa Technika Mobilizacji Segmentarnej'
  },
  {
    id: 'lumbar-extension',
    name: 'Przeprost lędźwiowy McKenzie w leżeniu przodem',
    polishName: 'Przeprosty wg McKenziego (Prone Press-Up)',
    region: 'lumbar',
    difficulty: 'Średnie',
    targetMuscles: ['odciążenie dysków L4-L5-S1', 'centralizacja bólu lędźwiowego'],
    description: 'Oparte na światowej sławy metodzie Robina McKenziego ćwiczenie pomagające "zepchnąć" przepuklinę dyskową z korzenia nerwowego.',
    steps: [
      'Połóż się na brzuchu na macie z rękami zgiętymi przy klatce piersiowej jak do pompek.',
      'Całkowicie rozluźnij pośladki, nogi i dolne plecy – brzuch ma zwisać swobodnie.',
      'Opierając się na dłoniach, powolnym ruchem prostuj ramiona, unosząc klatkę piersiową w górę.',
      'Miednica musi pozostać płasko przyklejona do podłogi!',
      'Utrzymaj pozycję w szczycie przez 2 sekundy, oddychając spokojnie, po czym opuść tułów.',
      'Powtórz 10 razy.'
    ],
    safetyWarnings: [
      'Zasada centralizacji: jeśli ból cofa się z pośladka/nogi w stronę środka lędźwi, to pożądany znak.',
      'Jeśli ból zaczyna promieniować dalej w dół nogi, NATYCHMIAST PRZERWIJ!'
    ],
    commonMistakes: [
      'Napinanie pośladków (pośladki muszą być zupełnie wiotkie).',
      'Oderwanie bioder od podłogi (to nie deska ani pompka).'
    ],
    defaultSets: 2,
    defaultReps: 10,
    defaultHoldSeconds: 2,
    tempo: '2-2-2',
    breathingCue: 'Wydech podczas unoszenia tułowia, wdech podczas opuszczania.',
    idealForSymptoms: ['rwa kulszowa', 'ból lędźwi nasilający się przy siedzeniu', 'wypadanie krążka międzykręgowego'],
    contraindications: ['stenoza kanału kręgowego z nietolerancją wyprostu', 'kręgozmyk niestabilny'],
    animationType: 'lumbar_extension',
    videoUrl: 'https://www.youtube.com/watch?v=Gk_F6NnLd98',
    videoEmbedUrl: 'https://www.youtube-nocookie.com/embed/Gk_F6NnLd98',
    videoDuration: '3:30 min',
    videoInstructor: 'Metoda McKenziego – Przeprosty Lędźwiowe'
  },
  {
    id: 'axial-towel-traction',
    name: 'Autotrakcja osiowa ręcznikiem (Dekompresja C3-C7)',
    polishName: 'Autotrakcja osiowa karku z ręcznikiem',
    region: 'cervical',
    difficulty: 'Łatwe',
    targetMuscles: ['dekompresja przestrzeni międzykręgowych C3-C7', 'rozluźnienie więzadła karkowego', 'odciążenie korzeni nerwowych'],
    description: 'Złoty standard autoterapii ostrego bólu szyi: delikatna trakcja osiowa ku górze z wykorzystaniem miękkiego ręcznika, rozszerzająca otwory międzykręgowe bez bolesnej rotacji czy zginania.',
    steps: [
      'Zwiń mały ręcznik w wałek i przyłóż go z tyłu karku, tuż pod potylicą.',
      'Chwyć końce ręcznika obiema dłońmi z przodu na wysokości żuchwy.',
      'Pociągnij delikatnie końce ręcznika w wektorze 45 stopni w przód i w górę (w stronę sufitu/czubka głowy).',
      'Głowa pozostaje w pozycji neutralnej – ręcznik przejmuje część ciężaru czaszki, wydłużając kark.',
      'Utrzymaj łagodne odciążenie przez 10-15 sekund, oddychając spokojnie torem brzusznym.',
      'Powoli zwolnij naciąg i powtórz 3-4 razy.'
    ],
    safetyWarnings: [
      'Siła uciągu powinna być minimalna i przyjemna – to nie ma być szarpanie.',
      'W przypadku wystąpienia zawrotów głowy natychmiast przerwij ćwiczenie.'
    ],
    commonMistakes: [
      'Zadzieranie głowy do tyłu podczas pociągania za ręcznik.',
      'Zbyt gwałtowne puszczanie naciągu.'
    ],
    defaultSets: 1,
    defaultReps: 4,
    defaultHoldSeconds: 12,
    tempo: '2-12-2',
    breathingCue: 'Płynny, spokojny oddech. Przy wydechu poczuj, jak przestrzenie między kręgami zyskują ulgę.',
    idealForSymptoms: ['ostry ból szyi', 'rwa ramienna w fazie wczesnej', 'ucisk korzeniowy C5-C7', 'kompresja krążka'],
    contraindications: ['niestabilność szczytowo-potyliczna', 'świeże złamanie lub uraz biczowy <72h'],
    animationType: 'chin_tuck',
    videoUrl: 'https://www.youtube.com/watch?v=wQt_8mJmKQE',
    videoEmbedUrl: 'https://www.youtube-nocookie.com/embed/wQt_8mJmKQE',
    videoDuration: '2:15 min',
    videoInstructor: 'Klinika Fizjoterapii – Trakcja Osiowa Karku'
  },
  {
    id: 'diaphragmatic-neck-relief',
    name: 'Odciążenie karku z oddechem dolnożebrowym',
    polishName: 'Dekompresja karku z oddechem dolnożebrowym',
    region: 'cervical',
    difficulty: 'Łatwe',
    targetMuscles: ['wyłączenie mm. pochyłych i mostkowo-obojczykowych', 'aktywacja przepony', 'wyciszenie układu współczulnego'],
    description: 'Gdy odczuwasz silny ból szyi, odruchowo napinasz mięśnie pomocnicze oddechu. Ćwiczenie to wygasza obronny skurcz karku poprzez ukierunkowanie wdechu w dolne żebra.',
    steps: [
      'Połóż się na plecach z ugiętymi kolanami lub usiądź wygodnie z podpartymi plecami.',
      'Połóż dłonie po bokach dolnych żeber (nie na klatce piersiowej ani na szyi).',
      'Weź powolny, łagodny wdech nosem, czując jak dłonie na żebrach rozsuwają się na boki.',
      'Zwróć uwagę, by barki i szyja pozostały całkowicie nieruchome i rozluźnione.',
      'Zrób długi, miękki wydech ustami, wyobrażając sobie jak napięcie spływa z karku.',
      'Powtórz 6-8 spokojnych cykli oddechowych.'
    ],
    safetyWarnings: [
      'Nie forsuj maksymalnego wdechu, aby nie wywołać hiperwentylacji.',
      'Oddychaj naturalnym, uspokajającym rytmem.'
    ],
    commonMistakes: [
      'Unoszenie obojczyków i napinanie mięśni szyi podczas wdechu.',
      'Wstrzymywanie powietrza w płucach.'
    ],
    defaultSets: 1,
    defaultReps: 6,
    defaultHoldSeconds: 6,
    tempo: '4-2-6',
    breathingCue: 'Wdech 4 sekundy dolnymi żebrami, pauza 2 sekundy, miękki wydech 6 sekund.',
    idealForSymptoms: ['ostry skurcz obronny szyi', 'ból powiązany ze stresem', 'sztywność karku VAS 7-10'],
    contraindications: ['brak istotnych przeciwwskazań'],
    animationType: 'brugger_relief',
    videoUrl: 'https://www.youtube.com/watch?v=Xz2gUoF9_X0',
    videoEmbedUrl: 'https://www.youtube-nocookie.com/embed/Xz2gUoF9_X0',
    videoDuration: '3:00 min',
    videoInstructor: 'Klinika Rehabilitacji – Oddech Dolnożebrowy w Bólu Szyi'
  }
];
