import { KnowledgeArticle } from '../types';

export const KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  // =============================================================
  // SEKCJA 1: ZDROWIE I BIOMECHANIKA KRĘGOSŁUPA (anatomia_zdrowie)
  // =============================================================
  {
    id: 'art-anatomia-cervical',
    title: 'Anatomia i biomechanika kręgosłupa szyjnego (C1-C7)',
    subtitle: 'Lordoza fizjologiczna, krążki międzykręgowe i korzenie nerwowe pod lupą kliniczną',
    category: 'anatomia_zdrowie',
    readTimeMinutes: 5,
    summary: 'Odcinek szyjny to najbardziej ruchoma, a zarazem najbardziej narażona na przeciążenia część kręgosłupa. Zrozumienie jego budowy to pierwszy krok do trwałego wyleczenia bólu.',
    content: [
      'Kręgosłup szyjny składa się z 7 kręgów oznaczanych symbolami C1–C7. Górny segment (C1–C2, czyli atlas i obrotnik) odpowiada aż za 50% całej rotacji głowy. Dolny segment (C4–C7) przenosi ogromne siły zgięciowe i dźwiga ciężar czaszki.',
      'Fizjologiczna lordoza szyjna to naturalne wygięcie kręgosłupa w łuk ku przodowi. Działa jak precyzyjny amortyzator hydrauliczny, pochłaniając mikrowstrząsy podczas chodzenia, biegania i skakania. Gdy z powodu pracy przy komputerze głowa wysuwa się w przód, lordoza ulega spłaszczeniu lub wręcz odwróceniu (kifoza szyjna), co dramatycznie przyspiesza zużycie krążków.',
      'Krążek międzykręgowy (dysk) składa się z galaretowatego jądra miażdżystego i mocnego pierścienia włóknistego. Nie posiada własnych naczyń krwionośnych u dorosłego człowieka – odżywia się wyłącznie poprzez zjawisko dyfuzji, zależne od naprzemiennego ściskania i rozprężania podczas ruchu.',
      'Między kręgami wychodzą korzenie nerwowe splotu ramiennego (C5, C6, C7, C8, Th1), które unerwiają mięśnie barku, ramienia, przedramienia oraz czucie w palcach dłoni. Z tego powodu podrażnienie dysku w szyi bardzo często objawia się bólem ramienia lub drętwieniem palców.'
    ],
    keyTakeaways: [
      'Kręgi C1-C2 zapewniają połowę skrętu głowy, a segmenty C5-C7 absorbują największe przeciążenia.',
      'Lordoza szyjna to naturalny amortyzator – jej zniesienie zwielokrotnia nacisk na dyski.',
      'Dyski odżywiają się jak gąbka: tylko ruch zapewnia im nawodnienie i substancje regenerujące.'
    ],
    practicalTips: [
      'Nie spędzaj w jednej pozycji dłużej niż 45 minut – bezruch dosłownie "odwadnia" Twoje dyski.',
      'Dbaj o nawodnienie: pij szklankę wody co 2 godziny, by wspomóc sprężystość jądra miażdżystego.',
      'Stosuj retrakcję szyjną (Chin Tuck), która przywraca osiowe ułożenie kręgów C1-C7.'
    ],
    relatedExerciseIds: ['chin-tuck', 'neck-rotations', 'isometric-neck'],
    icon: 'Activity'
  },
  {
    id: 'art-odcinek-piersiowy',
    title: 'Rola ruchomości odcinka piersiowego i żeber w zdrowiu karku',
    subtitle: 'Dlaczego zablokowana klatka piersiowa zmusza szyję do nadmiernej, niszczącej kompensacji',
    category: 'anatomia_zdrowie',
    readTimeMinutes: 4,
    summary: 'Jeśli odcinek piersiowy traci zdolność do wyprostu i rotacji, kark musi przejąć jego pracę. Terapia samej szyi bez mobilizacji klatki piersiowej rzadko przynosi trwały skutek.',
    content: [
      'W koncepcji biomechanicznej "Joint-by-Joint" Michaela Boyle’a stawy w ludzkim ciele naprzemiennie wymagają mobilności lub stabilności. Odcinek piersiowy (12 kręgów z połączonymi żebrami) został zaprojektowany jako strefa MOBILNA – ma rotować się i otwierać ku wyprostowi.',
      'Przewlekła praca siedząca zamienia odcinek piersiowy w zesztywniały pancerz. Kiedy klatka piersiowa zapada się w garb (hiperkifoza), człowiek chcąc patrzeć przed siebie na monitor musi nienaturalnie odgiąć głowę w stawie szczytowo-potylicznym (kompensacyjny przeprost górnej szyi).',
      'Prowadzi to do potwornego ucisku w rejonie C1-C3 i zaciśnięcia mięśni podpotylicznych. Żadne rozciąganie karku nie pomoże, dopóki nie wyprostujesz i nie zmobilizujesz odcinka piersiowego.',
      'Dodatkowo zesztywnienie stawów żebrowo-kręgowych blokuje swobodny ruch przepony i ogranicza objętość płuc, zmuszając do szczytowego oddechu obojczykowego.'
    ],
    keyTakeaways: [
      'Sztywny odcinek piersiowy wymusza kompensacyjny przeprost w górnym karku.',
      'Otwarcie klatki piersiowej natychmiastowo zdejmuje ponad 50% napięcia z mięśni szyi.',
      'Mobilizacja żeber przywraca naturalny, głęboki oddech przeponowy.'
    ],
    practicalTips: [
      'Wprowadź do codziennej rutyny ćwiczenie "Koci grzbiet" oraz pozycję odciążającą Brüggera.',
      'Podczas pracy co godzinę oprzyj dłonie za głową i delikatnie wygnij plecy przez oparcie fotela.',
      'Unikaj garbienia się ze smartfonem na kolanach.'
    ],
    relatedExerciseIds: ['cat-cow', 'brugger-relief', 'scapular-retraction'],
    icon: 'Layers'
  },
  {
    id: 'art-stres-nerw-bledny',
    title: 'Wpływ stresu, osi HPA i nerwu błędnego na przewlekłe napięcie karku',
    subtitle: 'Neurobiologia skurczu obronnego: dlaczego emocje i presja w pracy kumulują się w barkach',
    category: 'anatomia_zdrowie',
    readTimeMinutes: 5,
    summary: 'Ewolucyjny odruch walki i ucieczki powoduje automatyczne unoszenie barków do uszu i zaciśnięcie zębów. Poznaj techniki stymulacji nerwu błędnego uwalniające powięź karku.',
    content: [
      'Gdy mózg (ciało migdałowate) rejestruje stres – nagły deadline, trudną rozmowę czy nadmiar bodźców – aktywuje współczulną gałąź autonomicznego układu nerwowego oraz oś podwzgórze-przysadka-nadnercza (oś HPA), wyrzucając kortyzol i adrenalinę.',
      'Ewolucyjnie człowiek w zagrożeniu kuli się, by chronić tętnice szyjne i krtań: mięśnie czworoboczne unoszą barki, mięśnie podpotyliczne odginają głowę w tył, a mięśnie żwacze zaciskają szczękę (bruksizm). W epoce biurowej zagrożeniem jest e-mail od szefa, ale ciało reaguje dokładnie tym samym skurczem mięśniowym!',
      'Jeśli stres ma charakter przewlekły, mięśnie karku pozostają w permanentnym mikroskurczu. Dochodzi do zaburzenia mikrokrążenia, zakwaszenia tkanek kwasem mlekowym i tworzenia bolesnych punktów spustowych.',
      'Przełącznikiem uspokajającym jest nerw błędny (nerw czaszkowy X) – główny pień układu przywspółczulnego. Głęboki oddech torem dolnożebrowym z wydłużonym wydechem bezpośrednio stymuluje nerw błędny, obniżając tętno i wysyłając do mięśni karku sygnał do natychmiastowego rozluźnienia.'
    ],
    keyTakeaways: [
      'Napięcie barków to biologiczny odruch obronny osłaniający szyję przed atakiem.',
      'Zaciskanie szczęki (bruksizm) bezpośrednio napina tylną taśmę karku i mięśnie podpotyliczne.',
      'Wydłużony wydech (np. 4 sekundy wdech, 7 sekund wydech) pobudza nerw błędny i wygasza skurcz.'
    ],
    practicalTips: [
      'Zastosuj technikę "język na podniebieniu": opuść żuchwę i oprzyj czubek języka za górnymi siekaczami – natychmiast rozluźni to mięśnie szyi.',
      'Przed trudnym zadaniem wykonaj 5 głębokich oddechów przeponowych w pozycji Brüggera.',
      'Wieczorem wykonaj 3-minutowy automasaż dołków podpotylicznych.'
    ],
    relatedExerciseIds: ['suboccipital-release', 'brugger-relief', 'trapezius-stretch'],
    icon: 'HeartPulse'
  },

  // =============================================================
  // SEKCJA 2: NAJCZĘSTSZE SCHORZENIA I DOLEGLIWOŚCI (schorzenia)
  // =============================================================
  {
    id: 'art-dyskopatia-szyjna',
    title: 'Dyskopatia szyjna i przepuklina krążka C5-C7: Przyczyny i rwa ramienna',
    subtitle: 'Jak dochodzi do wypukliny, czym jest rwa barkowa i jak bezpiecznie cofnąć ucisk nerwu',
    category: 'schorzenia',
    readTimeMinutes: 5,
    summary: 'Przepuklina krążka międzykręgowego w odcinku szyjnym najczęściej dotyka segmentów C5-C6 i C6-C7. Odpowiednio dobrane ćwiczenia dekompresyjne pozwalają w 90% przypadków uniknąć operacji.',
    content: [
      'Dyskopatia to proces degeneracyjny krążka międzykręgowego, który rozpoczyna się od odwodnienia jądra miażdżystego i mikropęknięć w pierścieniu włóknistym. Pod wpływem stałego zgięcia szyi (np. patrzenie w dół na ekran) jądro miażdżyste jest wypychane ku tyłowi – w stronę kanału kręgowego i korzeni nerwowych.',
      'Wyróżniamy stadia: protruzja (uwypuklenie krążka z zachowanym pierścieniem), ekstruzja (przerwanie pierścienia i wylanie się jądra poza obrys) oraz sekwestracja (oderwanie fragmentu).',
      'Objawy dyskopatii szyjnej:',
      '• Poziom C5-C6: Ból promieniujący po bocznej stronie ramienia i przedramienia do kciuka i palca wskazującego, osłabienie zginania w łokciu (mięsień dwugłowy).',
      '• Poziom C6-C7: Najczęstsza lokalizacja. Ból promieniuje z tyłu ramienia przez łokieć do palca środkowego, osłabienie prostowania łokcia (mięsień trójgłowy).',
      '• Uczucie "prądu", mrowienia lub drętwienia w dłoni nasilające się przy pochyleniu głowy w stronę chorą (dodatni test Spurlinga).',
      'Dobra wiadomość: ludzki organizm ma zdolność do samoistnej resorpcji przepukliny. Odpowiednie ćwiczenia dekompresyjne (McKenzie, retrakcja) tworzą podciśnienie wewnątrz dysku i wspierają centralizację objawów.'
    ],
    keyTakeaways: [
      '90% przepuklin szyjnych leczy się z sukcesem zachowawczo (rehabilitacją i zmianą nawyków).',
      'Mrowienie kciuka sugeruje poziom C6, mrowienie palca środkowego – poziom C7.',
      'Zjawisko centralizacji (ból cofa się z ręki do szyi) to dowód skuteczności wdrożonych ćwiczeń.'
    ],
    practicalTips: [
      'Unikaj schylania głowy i czytania z laptopa na kolanach – unieś ekran na linię oczu.',
      'W fazie podostrej stosuj regularnie retrakcję szyjną (Chin Tuck) co 2 godziny po 8 powtórzeń.',
      'Przy mrowieniu palców wykonuj bardzo delikatną mobilizację nerwu (Nerve Flossing).'
    ],
    relatedExerciseIds: ['chin-tuck', 'nerve-floss', 'isometric-neck'],
    icon: 'AlertCircle'
  },
  {
    id: 'art-cervicogenic-headache',
    title: 'Napięciowe bóle głowy pochodzenia szyjnego (Cervicogenic Headache)',
    subtitle: 'Mechanizm rzutowania bólu z segmentów C0-C2 za oko i w skroń (Jądro trójdzielno-szyjne)',
    category: 'schorzenia',
    readTimeMinutes: 4,
    summary: 'Aż 70% przewlekłych bólów głowy nie ma źródła w mózgu, lecz w zaciśniętych strukturach górnego karku. Dowiedz się, jak odróżnić ból szyjny od migreny.',
    content: [
      'Ból głowy pochodzenia szyjnego (Cervicogenic Headache - CEH) to jednostka kliniczna, w której ból rzutowany jest z kręgosłupa szyjnego do czaszki.',
      'Kluczowym elementem anatomicznym jest tzw. jądro trójdzielno-szyjne (Trigeminocervical Complex) w pniu mózgu. Zbiegają się w nim włókna czuciowe z nerwu trójdzielnego (który unerwia czoło, oko i skroń) oraz z górnych korzeni szyjnych C1, C2 i C3.',
      'Gdy mięśnie podpotyliczne ulegają stałemu przeciążeniu przez wysuniętą głowę, dochodzi do ucisku na nerw potyliczny większy (nerw Arnolda). Sygnał bólowy z karku "przeskakuje" w pniu mózgu na tory nerwu trójdzielnego – mózg błędnie interpretuje ten impuls jako ból zlokalizowany za gałką oczną lub w skroni!',
      'Cechy bólu szyjnego: najczęściej jednostronny, rozpoczyna się od potylicy i wędruje ku przodowi (wzór "znaku zapytania"), nasila się przy ruchach głowy lub po wielu godzinach siedzenia przed monitorem.'
    ],
    keyTakeaways: [
      'Ból za okiem i w skroni bardzo często pochodzi z mięśni podpotylicznych C1-C2.',
      'Zwykłe leki przeciwbólowe dają tylko krótką ulgę, bo nie usuwają ucisku mechanicznego na nerw Arnolda.',
      'Dezaktywacja punktów spustowych podpotylicznych potrafi wygasić ból w kilka minut.'
    ],
    practicalTips: [
      'Wykonaj automasaż dołków podpotylicznych: uciśnij kciukami punkty tuż pod kością czaszki na 45 sekund.',
      'Sprawdź oświetlenie i odległość monitora – mrużenie oczu dodatkowo napina mięśnie karku.',
      'Połóż się na plecach z małym wałkiem pod karkiem (np. zwiniętym ręcznikiem) na 10 minut.'
    ],
    relatedExerciseIds: ['suboccipital-release', 'chin-tuck', 'trapezius-stretch'],
    icon: 'Zap'
  },
  {
    id: 'art-facet-syndrome',
    title: 'Zespół stawów międzywyrostkowych (Facet Joint Syndrome) i ostry "postrzał" karku',
    subtitle: 'Dlaczego rano budzisz się z zablokowaną głową i nie możesz spojrzeć przez ramię?',
    category: 'schorzenia',
    readTimeMinutes: 4,
    summary: 'Stawy międzywyrostkowe kierują ruchami kręgów szyjnych. Gdy dojdzie do ich zablokowania lub stanu zapalnego, mięśnie wokół natychmiastowo wpadają w skurcz obronny.',
    content: [
      'Każdy kręg szyjny łączy się z kręgiem powyżej i poniżej za pomocą pary stawów międzywyrostkowych (stawów fasetowych). Są one pokryte chrząstką szklistą, otoczone torebką stawową i bogato unerwione przez gałązki przyśrodkowe nerwów rdzeniowych.',
      'Gdy śpisz w złej pozycji (np. na brzuchu z głową skręconą w bok) lub wykonasz nagły, niekontrolowany ruch, może dojść do zakleszczenia fałdu łąkotkopodobnego torebki stawowej między powierzchniami stawowymi.',
      'Organizm reaguje błyskawicznie: sąsiadujące mięśnie (dźwigacz łopatki, mięśnie wielodzielne) wpadają w ostry, bolesny skurcz obronny (tzw. "postrzał karku" lub kręcz szyi). Każda próba skrętu lub odchylenia głowy wywołuje ostry ból kłujący.',
      'W leczeniu ostrego zablokowania stawowego najważniejsze jest uspokojenie skurczu mięśniowego za pomocą ciepła i łagodnych ruchów osiowych – próby siłowego "przełamywania" blokady tylko nasilają stan zapalny.'
    ],
    keyTakeaways: [
      'Ostry postrzał karku to w większości przypadków zablokowanie stawu fasetowego i odruchowy skurcz obronny mięśni.',
      'Nigdy nie "strzelaj" karkiem na siłę – gwałtowna manipulacja w stanie ostrym uszkadza torebkę stawową.',
      'Ciepły okład i łagodne mikrorotacje w bezpiecznym zakresie przynoszą najszybszą ulgę.'
    ],
    practicalTips: [
      'W pierwszych godzinach zastosuj ciepły prysznic skierowany na kark przez 10 minut.',
      'Wykonuj mikroobroty głowy (amplituda tylko 10-15 stopni) w strefie całkowicie bezbólowej.',
      'Sprawdź swoją poduszkę: jeśli jest zbyt wysoka lub śpisz na brzuchu, zmień nawyk na spanie na plecach.'
    ],
    relatedExerciseIds: ['neck-rotations', 'isometric-neck', 'trapezius-stretch'],
    icon: 'ShieldCheck'
  },
  {
    id: 'art-tech-neck-biomechanika',
    title: 'Syndrom Tech-Neck: Biomechanika przeciążeń głowy i karku',
    subtitle: 'Dlaczego pochylenie głowy nad smartfonem generuje obciążenie równe 27 kilogramom?',
    category: 'tech_neck',
    readTimeMinutes: 4,
    summary: 'Prawidłowa biomechanika głowy a siły grawitacji: jak milimetry pochylenia zmieniają nacisk na krążki C5-C7 i niszczą naturalną lordozę.',
    content: [
      'Głowa dorosłego człowieka waży przeciętnie 4.5 – 5.5 kg. W pozycji neutralnej kręgosłup szyjny doskonale radzi sobie z tym obciążeniem dzięki amortyzującej lordozie szyjnej (krzywiźnie ku przodowi).',
      'Wraz z pochylaniem głowy w przód (np. patrząc w dół na telefon w dłoniach), dźwignia biomechaniczna rośnie w sposób dramatyczny:',
      '• Przy pochyleniu 15° odczuwalny ciężar głowy dla karku wynosi 12 kg.',
      '• Przy kącie 30° obciążenie osiąga 18 kg.',
      '• Przy kącie 45° kark dźwiga 22 kg.',
      '• Przy skrajnym pochyleniu 60° (typowym dla pisania SMS-ów) nacisk wynosi aż 27 kg!',
      'Wyobraź sobie noszenie 8-letniego dziecka na samej szyi przez 3-4 godziny każdego dnia. Nic dziwnego, że krążki ulegają odwodnieniu, a mięśnie wpadają w stan przewlekłego stanu zapalnego.'
    ],
    keyTakeaways: [
      'Kąt 60° = 27 kg obciążenia dla krążków C5-C7.',
      'Tech-neck powoduje spłaszczenie fizjologicznej lordozy szyjnej i zwyrodnienia.',
      'Rozwiązaniem nie jest rezygnacja z technologii, lecz uniesienie urządzenia do linii oczu.'
    ],
    practicalTips: [
      'Podnoś telefon na wysokość klatki piersiowej lub brody – zginaj ręce w łokciach, a nie szyję.',
      'Stosuj ćwiczenie Chin Tuck (cofanie brody) jako codzienną szczoteczkę do zębów dla kręgosłupa.',
      'Wykonuj rozciąganie mięśnia piersiowego, by przeciwdziałać zapadaniu się klatki piersiowej.'
    ],
    relatedExerciseIds: ['chin-tuck', 'suboccipital-release', 'scapular-retraction'],
    icon: 'Smartphone'
  },

  // =============================================================
  // SEKCJA 3: KORZYŚCI KONKRETNYCH ĆWICZEŃ (korzysci_cwiczen)
  // =============================================================
  {
    id: 'art-benefity-chin-tuck',
    title: 'Retrakcja szyjna (Chin Tuck): Biomechanika głębokich zginaczy i dekompresja C5-C7',
    subtitle: 'Dlaczego to absolutnie najważniejsze ćwiczenie rehabilitacyjne dla każdego człowieka XXI wieku?',
    category: 'korzysci_cwiczen',
    readTimeMinutes: 5,
    summary: 'Cofanie brody (Chin Tuck) to nie tylko prosta zmiana pozycji – to precyzyjny manewr biomechaniczny aktywujący wygaszone mięśnie głębokie i otwierający otwory międzykręgowe.',
    content: [
      'U 95% osób z bólami karku dochodzi do tzw. zespołu skrzyżowania górnego (Upper Crossed Syndrome wg Jandy): powierzchowne zginacze (MOS) i prostowniki karku są nadmiernie napięte i skrócone, podczas gdy głębokie zginacze szyi (Longus colli i Longus capitis) ulegają atrofii i wyłączeniu neurologicznemu.',
      'Ruch retrakcji szyi (poziome cofnięcie głowy) powoduje jednoczesne działanie w dwóch strefach:',
      '1. Aktywacja zginaczy głębokich: Te małe, ułożone tuż przed trzonami kręgów mięśnie stabilizują każdy segment szyjny od przodu, działając jak wewnętrzny gorset ortopedyczny.',
      '2. Dekompresja otworów międzykręgowych: Cofnięcie brody otwiera przestrzeń dla korzeni nerwowych C5, C6 i C7 o 15-20%, natychmiast odbarczając uciśnięte nerwy.',
      '3. Pasywne rozciąganie mięśni podpotylicznych: Czaszka przesuwa się ku tyłowi, co wydłuża spięte więzadła i powięź u podstawy czaszki, uwalniając od napięciowych bólów głowy.',
      'Wykonuj 8-10 powtórzeń retrakcji z 4-sekundowym zatrzymaniem co 2-3 godziny pracy przy komputerze.'
    ],
    keyTakeaways: [
      'Chin Tuck reaktywuje mięśnie m. longus colli, które u pracowników biurowych są w uśpieniu.',
      'Zwiększa światło otworów międzykręgowych i redukuje ucisk na korzenie nerwowe C5-C7.',
      'Ruch musi być idealnie poziomy – cofaj brodę jak szufladę, nie pochylaj głowy w dół.'
    ],
    practicalTips: [
      'Połóż dwa palce na brodzie, aby czuć wektor ruchu w płaszczyźnie horyzontalnej.',
      'Oddychaj spokojnie w trakcie 4-sekundowego zatrzymania – nie zaciskaj gardła.',
      'Wykonuj serię natychmiast po wstaniu z łóżka oraz przed każdym posiłkiem.'
    ],
    relatedExerciseIds: ['chin-tuck', 'isometric-neck'],
    icon: 'CheckCircle'
  },
  {
    id: 'art-benefity-brugger',
    title: 'Pozycja odciążająca Brüggera: Globalny reset łańcuchów mięśniowych',
    subtitle: 'Jak 30 sekund w ciągu dnia całkowicie odwraca zgarbioną pozycję siedzącą',
    category: 'korzysci_cwiczen',
    readTimeMinutes: 4,
    summary: 'Szwajcarski neurolog dr Alois Brügger opracował pozycję, która wykorzystuje zjawisko hamowania zwrotnego (reciprocal inhibition), by natychmiast rozluźnić zaciśnięte mięśnie klatki i szyi.',
    content: [
      'Siedzenie przy komputerze zamyka ciało w tzw. łańcuchu zgięciowym: podwinięta miednica, zgarbione plecy, barki wysunięte ku przodowi (protrakcja łopatek), rotacja wewnętrzna ramion i wysunięta głowa.',
      'Pozycja odciążająca Brüggera to jej dokładne, lustrzane przeciwieństwo biomechaniczne:',
      '• Ustawienie miednicy: Siad na przedniej krawędzi krzesła i lekkie przodopochylenie miednicy automatycznie odbudowuje lordozę lędźwiową.',
      '• Retrakcja i depresja łopatek: Ściągnięcie łopatek ku dołowi aktywuje dolny czworoboczny i zębaty przedni, co na drodze neurologicznej zmusza mięśnie piersiowe do natychmiastowego odpuszczenia skurczu.',
      '• Rotacja zewnętrzna ramion: Otwarcie dłoni wnętrzami w przód i kciukami w tył otwiera przestrzeń podbarkową i odciąża splot ramienny.',
      '• Osiowe wydłużenie szyi: Wzrok skierowany przed siebie i delikatne cofnięcie brody przywraca optymalny przepływ krwi przez tętnice kręgowe.',
      'Wystarczy 30 sekund i 3 głębokie oddechy dolnożebrowe co 60 minut, by zapobiec utrwalaniu się wad postawy.'
    ],
    keyTakeaways: [
      'Brügger to złoty standard ergonomii biurowej – angażuje całe ciało od miednicy po czubek głowy.',
      'Rotacja zewnętrzna rąk odblokowuje klatkę piersiową i ułatwia dotlenienie mózgu.',
      'Idealne ćwiczenie do wykonania w trakcie spotkań online lub przerw w pracy.'
    ],
    practicalTips: [
      'Przesuń się na przednią krawędź fotela, stopy oprzyj płasko na podłożu szerzej niż biodra.',
      'Zwróć uwagę na dłonie: kciuki muszą celować w tył za Twoje plecy.',
      'Weź głęboki wdech rozszerzający dolne żebra, a z wydechem poczuj, jak barki opadają ku podłodze.'
    ],
    relatedExerciseIds: ['brugger-relief', 'scapular-retraction', 'chin-tuck'],
    icon: 'Sparkles'
  },
  {
    id: 'art-benefity-podpotyliczne',
    title: 'Automasaż podpotyliczny i odruch oczno-ruchowy: Neurologiczny klucz do ulgi',
    subtitle: 'Dlaczego rozluźnienie 4 małych mięśni pod czaszką wygasza ból głowy i odpręża wzrok',
    category: 'korzysci_cwiczen',
    readTimeMinutes: 4,
    summary: 'Mięśnie podpotyliczne posiadają największe zagęszczenie wrzecionek nerwowo-mięśniowych w całym ludzkim ciele. Poznaj ich ścisły związek z ruchem gałek ocznych.',
    content: [
      'Tuż pod kością potyliczną znajdują się 4 pary drobnych mięśni: m. prosty tylny większy i mniejszy głowy oraz m. skośny górny i dolny głowy. Choć są maleńkie, pełnią kluczową rolę w orientacji przestrzennej i koordynacji wzrokowo-ruchowej.',
      'Na 1 gram tkanki mięśni podpotylicznych przypada aż 36 wrzecionek czuciowych (dla porównania: w mięśniu pośladkowym jest to zaledwie 1 wrzecionko!). Oznacza to, że są one wprost naszpikowane sensorami propriocepcji.',
      'Odruch oczno-ruchowy (Oculo-cervical reflex): Za każdym razem, gdy Twoje oczy przesuwają się po ekranie z lewej do prawej, mięśnie podpotyliczne wykonują mikroskurcze, by ustabilizować głowę. Po 8 godzinach wpatrywania się w monitor są one w stanie skrajnego zmęczenia i tężcowego skurczu!',
      'Automasaż dołków podpotylicznych i jednoczesne powolne ruchy gałek ocznych wywołują zjawisko relaksacji poizometrycznej (PIR), uwalniając uwięziony nerw potyliczny większy i natychmiastowo likwidując tępy ból głowy.'
    ],
    keyTakeaways: [
      'Mięśnie podpotyliczne reagują na każdy ruch Twoich oczu – zmęczenie wzroku to zmęczenie karku.',
      'Ich rozluźnienie natychmiast poprawia krążenie mózgowe przez tętnice kręgowe.',
      'Regularny automasaż to najskuteczniejsza niefarmakologiczna metoda na napięciowe bóle głowy.'
    ],
    practicalTips: [
      'Oprzyj kciuki w zagłębieniach tuż pod kością czaszki po obu stronach kręgosłupa.',
      'Zamknij oczy, skieruj wzrok powoli w dół bez poruszania głową, a z wydechem delikatnie zwiększ nacisk w górę.',
      'Oddychaj powoli przez nos, pozwalając tkankom pod kciukami stopniowo mięknąć.'
    ],
    relatedExerciseIds: ['suboccipital-release', 'neck-rotations'],
    icon: 'Eye'
  },
  {
    id: 'art-benefity-nerve-floss',
    title: 'Neurodynamika i ślizg nerwu pośrodkowego (Nerve Floss): Ulga w mrowieniu palców',
    subtitle: 'Jak przywrócić elastyczność i swobodny ślizg pnia nerwowego bez szkodliwego naciągania',
    category: 'korzysci_cwiczen',
    readTimeMinutes: 5,
    summary: 'Nerwy obwodowe potrzebują swobodnego ślizgu w swoich osłonkach. Mobilizacja neurodynamiczna uwalnia nerw z mikroucisków i przywraca prawidłowe przewodzenie.',
    content: [
      'Nerwy obwodowe – takie jak nerw pośrodkowy, łokciowy czy promieniowy – nie są sztywnymi kablami. W trakcie ruchów kończyny górnej i szyi muszą przesuwać się wzdłuż swoich pochewek nawet o 15–20 milimetrów.',
      'Gdy w wyniku dyskopatii szyjnej lub obrzęku tkanek w rejonie mięśni pochyłych dochodzi do zwężenia przestrzeni, nerw traci zdolność do ślizgu. Przy każdym ruchu ręką dochodzi do jego mechanicznego drażnienia, co objawia się pieczeniem, "prądami" i mrowieniem palców.',
      'Różnica między rozciąganiem a ślizgiem (Flossing):',
      '• Rozciąganie nerwu (złe w stanie zapalnym!): Naciąganie nerwu z obu stron jednocześnie (np. wyprost ręki i skłon głowy w przeciwną stronę) zaciska naczynia krwionośne nerwu (vasa nervorum) i nasila objawy.',
      '• Ślizg nerwowy (Nerve Flossing): Kiedy prostujesz rękę w łokciu i nadgarstku, JEDNOCZEŚNIE przechylasz głowę W TĘ SAMĄ STRONĘ. Nerw wysuwa się z kanału szyjnego, nie będąc napiętym. Gdy zginasz rękę, odchylasz głowę – nerw płynnie powraca. Działa to dokładnie jak nitkowanie zębów!',
      'Prawidłowo wykonany ślizg nerwowy poprawia mikrokrążenie wewnątrznerwowe i redukuje obrzęk w zaledwie kilka dni.'
    ],
    keyTakeaways: [
      'Nerwów nie wolno silnie rozciągać – wolno je jedynie łagodnie "nitkować" (flossing).',
      'Głowa przechyla się ZAWSZE w stronę wyciąganej ręki, aby odciążyć korzeń nerwowy.',
      'Ćwiczenie nie może wywoływać ostrego prądu – pracuj wyłącznie w strefie komfortu.'
    ],
    practicalTips: [
      'Wykonuj ruch płynnie i powoli jak w tańcu – 8 do 10 powtórzeń na stronę w zupełności wystarczy.',
      'Jeśli w trakcie poczujesz silne mrowienie, zmniejsz kąt wyprostu nadgarstka.',
      'Wykonuj ćwiczenie 2 razy dziennie, najlepiej w pozycji stojącej z opuszczonymi barkami.'
    ],
    relatedExerciseIds: ['nerve-floss', 'chin-tuck'],
    icon: 'Activity'
  },
  {
    id: 'art-benefity-stabilizacja-lopatek',
    title: 'Stabilizacja łopatek i mięsień czworoboczny dolny: Tarcza obronna dla karku',
    subtitle: 'Dlaczego słabe mięśnie międzyłopatkowe zmuszają kark do dźwigania całego ciężaru rąk',
    category: 'korzysci_cwiczen',
    readTimeMinutes: 4,
    summary: 'Łopatka jest jedynym ruchomym połączeniem kończyny górnej z tułowiem. Gdy opada i rotuje w dół, mięśnie szyi są stale naciągane jak liny holownicze.',
    content: [
      'Ramię człowieka waży przeciętnie 4–5 kg. Obie ręce to blisko 10 kg masy wiszącej na klatce piersiowej. W prawidłowych warunkach ciężar ten jest stabilizowany przez dolne partie mięśnia czworobocznego (dolne łopatki) oraz mięsień zębaty przedni.',
      'U osób pracujących przy biurku dochodzi do utraty siły mięśni międzyłopatkowych. W efekcie łopatki "odstają" od klatki i rotują ku przodowi. W tej sytuacji cały ciężar ramion spada na mięsień dźwigacz łopatki oraz górną część czworobocznego – czyli mięśnie wczepiające się bezpośrednio w kręgi szyjne!',
      'Mięśnie szyi nie są stworzone do dźwigania rąk. Przemęczone, wpadają w przewlekły ból i pieczenie w strefie między karkiem a barkiem.',
      'Wzmacnianie dolnego czworobocznego za pomocą ćwiczeń w literę "W-to-Y" oraz retrakcji łopatek przywraca równowagę sił i trwale zdejmuje balast z Twojej szyi.'
    ],
    keyTakeaways: [
      'Pieczenie karku to w 80% wina słabych mięśni stabilizujących łopatkę w dole.',
      'Silny mięsień czworoboczny dolny zdejmuje 10 kg ciężaru rąk z kręgosłupa szyjnego.',
      'Wzmocnienie łopatek koryguje sylwetkę i likwiduje nawyk garbienia się.'
    ],
    practicalTips: [
      'Wykonuj ćwiczenie "W-to-Y" 3 razy w tygodniu po 10-12 powtórzeń.',
      'Podczas ćwiczenia pamiętaj o złotej zasadzie: trzymaj barki jak najdalej od uszu.',
      'Zadbaj o podłokietniki fotela – oparcie łokci natychmiast odciąża mięśnie łopatek.'
    ],
    relatedExerciseIds: ['scapular-retraction', 'brugger-relief'],
    icon: 'Layers'
  },

  // =============================================================
  // SEKCJA 4: ERGONOMIA, HIGIENA PRACY I SEN
  // =============================================================
  {
    id: 'art-ergonomia-biurka',
    title: 'Ergonomia stanowiska komputerowego – złote standardy biomechaniczne',
    subtitle: 'Jak ustawić fotel, monitor, klawiaturę i biurko, by odciążyć kręgosłup szyjny',
    category: 'ergonomia',
    readTimeMinutes: 4,
    summary: 'Prawidłowe ustawienie stanowiska pracy pozwala zredukować aż o 40-60% siły ściskające działające na dyski C5-C7 oraz znieść przewlekły skurcz mięśni karku.',
    content: [
      'Statystyczny pracownik biurowy spędza w pozycji siedzącej ponad 7-9 godzin dziennie. W tym czasie kręgosłup szyjny jest narażony na stałe, izometryczne przeciążenie, gdy głowa wysuwa się ku ekranowi (tzw. protrakcja).',
      'Kluczowym elementem jest ustawienie wysokości monitora: górna krawędź ekranu powinna znajdować się dokładnie na linii Twojego wzroku lub maksymalnie 2-3 cm poniżej. Jeśli pracujesz na laptopie, niezbędna jest podstawka unosząca ekran oraz zewnętrzna klawiatura i mysz.',
      'Fotel powinien podpierać odcinek lędźwiowy (lordoza lędźwiowa warunkuje prawidłowe ustawienie karku). Stopy muszą spoczywać płasko na podłodze, z zachowaniem kąta 90-100 stopni w stawach biodrowych i kolanowych.',
      'Podłokietniki są często lekceważone, tymczasem oparcie przedramion na wysokości blatu zdejmuje wagę kończyn górnych z mięśni czworobocznych i dźwigaczy łopatek.'
    ],
    keyTakeaways: [
      'Górna krawędź monitora na wysokości oczu – nigdy nie patrz stale w dół na płaski laptop.',
      'Podłokietniki na wysokości blatu odciążają kark o ponad 4 kg wagi rąk.',
      'Lędźwiowe podparcie wymusza automatyczne cofnięcie głowy do pionu.'
    ],
    practicalTips: [
      'Użyj książek lub dedykowanej podstawki pod laptop, aby unieść go o min. 15 cm.',
      'Zadbaj o odległość ekranu: wyciągnij ramię przed siebie – ekran powinien być na długość wyciągniętej dłoni (50-70 cm).',
      'Mysz pionowa (ergonomiczna) zapobiega rotacji przedramienia i napięciom barku.'
    ],
    relatedExerciseIds: ['chin-tuck', 'brugger-relief', 'scapular-retraction'],
    icon: 'Monitor'
  },
  {
    id: 'art-higiena-20-20-20',
    title: 'Zasada 20-20-20 i mikropauzy w pracy przed komputerem',
    subtitle: 'Naukowe podejście do resetowania napięć powięziowych w trakcie dnia pracy',
    category: 'higiena_pracy',
    readTimeMinutes: 3,
    summary: 'Mięśnie szyi nie męczą się ruchem, lecz długotrwałym bezruchem. Wdrożenie mikropauz co 20 minut przywraca mikrokrążenie w tkankach karku.',
    content: [
      'Tkanka powięziowa i krążki międzykręgowe odżywiają się na zasadzie dyfuzji – ruch działa jak gąbka, która wyciska metabolity i zasysa świeżą krew oraz składniki odżywcze. Gdy siedzisz nieruchomo przez 60 minut, w mięśniach podpotylicznych dochodzi do lokalnego niedotlenienia (ischemii).',
      'Zasada 20-20-20 to sprawdzona reguła: co 20 minut oderwij wzrok od monitora, spójrz na obiekt oddalony o minimum 20 stóp (ok. 6 metrów) przez 20 sekund, i wykonaj 3 spokojne wdechy z cofnięciem brody.',
      'Już 30-sekundowa mikroprzerwa wystarczy, by zresetować odruchowy skurcz mięśni i nawilżyć powierzchnie stawowe kręgów szyjnych.'
    ],
    keyTakeaways: [
      'Bezruch powyżej 45 minut powoduje twardnienie powięzi i ucisk na naczynia krwionośne.',
      'Mikropauza nie musi oznaczać odejścia od biurka – wystarczy 30 sekund zmiany pozycji i retrakcji.',
      'Oderwanie wzroku w dal rozluźnia mięśnie rzęskowe oka, które są połączone neurologicznie z karkiem!'
    ],
    practicalTips: [
      'Włącz powiadomienia w naszej aplikacji – aplikacja przypomni Ci o mikropauzie co 60 minut.',
      'Gdy rozmawiasz przez telefon, zawsze wstań i przejdź się po pokoju.',
      'Podczas każdej mikropauzy wykonaj 3 powtórzenia pozycji odciążającej Brüggera.'
    ],
    relatedExerciseIds: ['brugger-relief', 'chin-tuck'],
    icon: 'Clock'
  },
  {
    id: 'art-punkty-spustowe',
    title: 'Autoterapia punktów spustowych karku i mięśnia czworobocznego',
    subtitle: 'Samodzielne uwalnianie bolesnych zgrubień (Trigger Points) w warunkach domowych',
    category: 'autoterapia',
    readTimeMinutes: 5,
    summary: 'Punkty spustowe w mięśniu czworobocznym i dźwigaczu łopatki są najczęstszą przyczyną "ciągnięcia" do głowy i sztywności barków. Dowiedz się, jak je bezpiecznie dezaktywować.',
    content: [
      'Punkt spustowy (Trigger Point) to mikroskopijny obszar nadmiernej drażliwości w napiętym paśmie mięśniowo-powięziowym. W dotyku wyczuwalny jest jak twarde ziarno grochu lub bolesny sznurek.',
      'Najczęstsze punkty w rejonie karku:',
      '1. TrP1 w mięśniu czworobocznym (górna krawędź barku) – rzutuje ból w górę szyi, za ucho aż do skroni (tzw. znak znaku zapytania).',
      '2. TrP w mięśniu dźwigaczu łopatki (kąt górny łopatki) – uniemożliwia pełny skręt głowy w stronę barku.',
      '3. Punkty podpotyliczne – wywołują tępy, opasujący ból głowy i uczucie "ciężkich oczu".',
      'Zasada kompresji ischemicznej: uciśnij wyczuwalny punkt palcami lub piłeczką tenisową z siłą 6/10 w skali bólu. Utrzymaj jednostajny nacisk przez 60-90 sekund, oddychając głęboko i spokojnie, aż poczujesz, jak punkt zaczyna mięknąć i odpływać.'
    ],
    keyTakeaways: [
      'Jednostajny nacisk (nie szarpanie i nie silne ugniatanie) pozwala wygasić impuls nerwowy.',
      'Oddech torem brzusznym podczas ucisku przyspiesza rozluźnienie układu nerwowego.',
      'Po ucisku wykonaj delikatne rozciąganie opracowanego mięśnia.'
    ],
    practicalTips: [
      'Użyj piłeczki tenisowej lub do lacrosse: oprzyj się plecami o ścianę i dociśnij punkt w okolicy górnej łopatki.',
      'Nigdy nie uciskaj kości ani przedniej strony szyi (strefa tętnic szyjnych).',
      'Ciepły prysznic lub kompres przed masażem zwiększa plastyczność tkanek.'
    ],
    relatedExerciseIds: ['suboccipital-release', 'trapezius-stretch', 'neck-rotations'],
    icon: 'Sparkles'
  },
  {
    id: 'art-sen-i-poduszka',
    title: 'Zdrowy sen a kręgosłup szyjny – dobór poduszki ortopedycznej',
    subtitle: 'W jakiej pozycji spać i czym kierować się przy wyborze poduszki profilowanej',
    category: 'sen',
    readTimeMinutes: 4,
    summary: 'Jedna trzecia życia przypada na sen. Zła poduszka potrafi zniweczyć efekty nawet najlepszej rehabilitacji, utrzymując szyję w nienaturalnym zgięciu przez 8 godzin.',
    content: [
      'Głównym celem poduszki jest utrzymanie kręgosłupa szyjnego w linii prostej i neutralnej względem reszty ciała.',
      'Najlepsze pozycje do snu dla zdrowej szyi:',
      '1. Na plecach: poduszka powinna być umiarkowanie niska, z wyprofilowanym wałkiem pod kark, aby głowa nie była wypychana ku klatce piersiowej ani nie opadała w tył.',
      '2. Na boku: wysokość poduszki musi odpowiadać dokładnie odległości od krawędzi barku do podstawy szyi. Nos, broda i mostek powinny tworzyć jedną prostą linię równoległą do materaca.',
      'Dlaczego spanie na brzuchu jest ZAKAZANE przy bólach karku? Spanie na brzuchu zmusza głowę do ciągłego, 90-stopniowego skrętu przez wiele godzin, co wywołuje ogromną asymetryczną kompresję na stawy międzykręgowe i tętnice kręgowe.'
    ],
    keyTakeaways: [
      'Poduszka ma podpierać szyję, a nie barki – barki powinny spoczywać na materacu.',
      'Pianka termoelastyczna (memory foam) dopasowuje się pod wpływem ciepła i nie zbija się.',
      'Spanie na brzuchu to najczęstsza przyczyna nagłych porannych blokad karku (tzw. "postrzału").'
    ],
    practicalTips: [
      'Jeśli śpisz na boku, umieść małą poduszkę między kolanami – ustabilizuje to miednicę i odcinek lędźwiowy.',
      'Przetestuj poduszkę profilowaną przez minimum 7-10 nocy – kark potrzebuje czasu na adaptację.',
      'Unikaj spania na stosie miękkich poduszek z pierza, które nie zapewniają żadnego podparcia strukturalnego.'
    ],
    relatedExerciseIds: ['chin-tuck', 'suboccipital-release'],
    icon: 'Moon'
  },
  {
    id: 'art-czerwone-flagi',
    title: 'Czerwone flagi kręgosłupa – kiedy natychmiast udać się do lekarza',
    subtitle: 'Objawy alarmowe, przy których ćwiczenia domowe są bezwzględnie przeciwwskazane',
    category: 'bezpieczenstwo',
    readTimeMinutes: 3,
    summary: 'Choć 90% bólów karku ma tło mięśniowo-powięziowe, istnieją sytuacje wymagające pilnej diagnostyki obrazowej (MRI) lub interwencji neurochirurgicznej.',
    content: [
      'Rehabilitacja domowa jest bezpieczna i wysoce skuteczna przy bólach przeciążeniowych, posturalnych i dyskopatiach w fazie stabilnej. Istnieje jednak zestaw objawów zwanych w medycynie "czerwonymi flagami" (Red Flags):',
      '1. Nagłe opadanie dłoni lub niedowład siły chwytu (wypadanie kubka z dłoni, brak możliwości uniesienia ręki).',
      '2. Objawy mielopatii szyjnej: zaburzenia chodu (uczucie "chodzenia jak po gąbce", brak równowagi) i jednoczesne drętwienie obu rąk i nóg.',
      '3. Niewydolność krążenia kręgowo-podstawnego (5D: Dizziness/zawroty głowy, Diplopia/podwójne widzenie, Dysphagia/trudności w połykaniu, Dysarthria/bełkotliwa mowa, Drop attacks/nagłe upadki bez utraty przytomności).',
      '4. Ból szyi po wypadku komunikacyjnym lub upadku (podejrzenie złamania lub niestabilności więzadłowej).',
      '5. Stały, palący ból nasilający się w nocy, nieustępujący w żadnej pozycji, połączony z gorączką lub nagłą utratą wagi.',
      'W razie wystąpienia któregokolwiek z powyższych objawów, natychmiast skonsultuj się z lekarzem lub zadzwoń pod numer 112/999.'
    ],
    keyTakeaways: [
      'Osłabienie siły mięśniowej (niedowład) to wskazanie do pilnego rezonansu magnetycznego.',
      'Zawroty głowy połączone z nudnościami i zaburzeniami mowy wymagają natychmiastowego wykluczenia udaru i ucisku naczyniowego.',
      'Nasza aplikacja automatycznie analizuje objawy alarmowe w module Analizy Bólu AI.'
    ],
    practicalTips: [
      'Jeśli czujesz niepokojący objaw, przejdź do zakładki "Analiza Bólu AI" i zaznacz objawy towarzyszące.',
      'Nie wykonuj gwałtownych ćwiczeń ani manipulacji kręgosłupa ("nastawiania") u osób niewykwalifikowanych.',
      'Wizyta u fizjoterapeuty lub lekarza rodzinnego z wygenerowanym w naszej aplikacji raportem PDF pozwoli na szybką diagnozę.'
    ],
    relatedExerciseIds: ['nerve-floss', 'chin-tuck'],
    icon: 'ShieldAlert'
  }
];
