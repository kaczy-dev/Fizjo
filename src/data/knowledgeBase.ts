import { KnowledgeArticle } from '../types';

export const KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
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
