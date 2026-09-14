import { FAQItem } from '../types';

export const FAQ_ITEMS: FAQItem[] = [
  // -------------------------------------------------------------
  // KATEGORIA: FUNKCJONOWANIE APLIKACJI (app_functionality)
  // -------------------------------------------------------------
  {
    id: 'faq-free-ai-engine',
    question: 'Jak działa darmowy silnik AI i dlaczego aplikacja nie wymaga płatnych kluczy?',
    answer: 'Aplikacja korzysta z wbudowanego, klinicznego silnika biomechanicznego opartego na algorytmach reguł kinezjologicznych oraz wytycznych EULAR/APTA. Analizuje Twój wywiad bólowy, poziom VAS, charakterystykę pracy i natychmiast generuje spersonalizowany 7-dniowy protokół rehabilitacyjny.',
    detailedPoints: [
      'Zero kosztów ukrytych: Brak abonamentów, kart kredytowych czy konieczności zakupu tokenów zewnętrznych API.',
      'Brak opóźnień sieciowych: Obliczenia wykonywane są natychmiast na Twoim urządzeniu lub przez lekki mikrokod serwera.',
      'Deterministyczna precyzja: Algorytm ściśle przestrzega reguł bezpieczeństwa ortopedycznego, automatycznie wykluczając ćwiczenia przeciwwskazane.'
    ],
    category: 'app_functionality',
    categoryLabel: 'Funkcjonowanie Aplikacji',
    clinicalTips: [
      'W dowolnym momencie możesz przekonfigurować wywiad w module "Mój Plan" lub skorzystać z konsultacji w module "Ekspert AI".'
    ],
    relatedAction: {
      label: 'Skonfiguruj Plan z Darmową AI',
      tabTarget: 'plan'
    },
    tags: ['darmowa ai', 'algorytm', 'koszty', 'klucze api', 'personalizacja']
  },
  {
    id: 'faq-offline-pwa',
    question: 'Czy mogę korzystać z aplikacji bez dostępu do Internetu (offline)?',
    answer: 'Tak! Aplikacja została zbudowana w architekturze Progressive Web App (PWA). Po pierwszym uruchomieniu wszystkie pliki, bazy wiedzy, ćwiczenia i algorytmy zostają zachowane w pamięci podręcznej Twojego urządzenia.',
    detailedPoints: [
      'Pełna instalacja na ekranie głównym: Na telefonie (Android/iOS) lub komputerze kliknij "Zainstaluj aplikację" w nagłówku.',
      'Dostęp w samolocie lub w podróży: Możesz uruchomić sesję treningową, odtworzyć animacje techniki i rejestrować ból bez połączenia z siecią.',
      'Automatyczna synchronizacja: Po ponownym połączeniu z internetem aplikacja w tle sprawdzi ewentualne aktualizacje.'
    ],
    category: 'app_functionality',
    categoryLabel: 'Funkcjonowanie Aplikacji',
    clinicalTips: [
      'Zainstaluj aplikację na telefonie, aby otrzymywać wibracyjne powiadomienia o mikropauzach ergonomicznych podczas pracy.'
    ],
    relatedAction: {
      label: 'Przejdź do Pulpitu',
      tabTarget: 'dashboard'
    },
    tags: ['offline', 'pwa', 'instalacja', 'brak internetu', 'aplikacja mobilna']
  },
  {
    id: 'faq-privacy-security',
    question: 'Gdzie trafiają moje dane medyczne i czy są bezpieczne (RODO / HIPAA)?',
    answer: 'Twoja prywatność jest bezwzględnym priorytetem medycznym. Wszystkie wpisy o bólu, notatki psychosomatyczne, historia VAS oraz wyniki testów ruchomości są przechowywane wyłącznie lokalnie w pamięci Twojej przeglądarki (IndexedDB / LocalStorage).',
    detailedPoints: [
      'Brak śledzenia i sprzedaży danych: Twoje dane zdrowotne nigdy nie są profilowane ani sprzedawane podmiotom reklamowym.',
      'Prywatna AI: Pytania zadawane w module kinezjologii nie są używane do trenowania publicznych modeli językowych.',
      'Opcjonalna blokada PIN: W zakładce "Profil" możesz ustawić 4-cyfrowy kod PIN, uniemożliwiający otwarcie historii osobom postronnym korzystającym z Twojego urządzenia.'
    ],
    category: 'app_functionality',
    categoryLabel: 'Funkcjonowanie Aplikacji',
    clinicalTips: [
      'Pamiętaj, że czyszczenie pamięci podręcznej przeglądarki może usunąć lokalne dane – dlatego warto regularnie pobierać raport PDF jako kopię zapasową.'
    ],
    relatedAction: {
      label: 'Zabezpiecz Profil Kodem PIN',
      tabTarget: 'profile'
    },
    tags: ['prywatność', 'rodo', 'hipaa', 'bezpieczeństwo', 'lokalne dane', 'pin']
  },
  {
    id: 'faq-wearables-sync',
    question: 'Jak połączyć pulsometr, zegarek lub opaskę (Garmin, Apple Watch, Polar)?',
    answer: 'W zakładce "Zegarki & Leki" możesz aktywować integrację z urządzeniami telemetrycznymi poprzez Bluetooth Low Energy (BLE) lub wbudowany kliniczny symulator biometryczny.',
    detailedPoints: [
      'Monitorowanie tętna na żywo (HR): Podczas sesji rehabilitacyjnej aplikacja weryfikuje strefę tętna, dbając o unikanie pobudzenia współczulnego.',
      'Wskaźnik obciążenia autonomicznego: Spokojne ćwiczenia oddechowe i pozycje odciążające powinny obniżać tętno spoczynkowe o 4-8 uderzeń na minutę.',
      'Alert bezruchu: Aplikacja pobiera dane o czasie spędzonym w bezruchu i sugeruje natychmiastowe wykonanie 30-sekundowego resetu Brüggera.'
    ],
    category: 'app_functionality',
    categoryLabel: 'Funkcjonowanie Aplikacji',
    clinicalTips: [
      'Podczas ćwiczeń szyi unikaj napinania całego ciała – jeśli Twoje tętno gwałtownie rośnie, oznacza to zbyt silną kompensację mięśniową.'
    ],
    relatedAction: {
      label: 'Otwórz Moduł Zegarków i Leków',
      tabTarget: 'wearables'
    },
    tags: ['zegarek', 'smartwatch', 'garmin', 'apple watch', 'polar', 'bluetooth', 'tętno']
  },
  {
    id: 'faq-streak-goals',
    question: 'Jak działa Ogień Serii (Streak), Dzienny Cel Ruchu i zdobywanie odznak?',
    answer: 'System motywacyjny oparty jest na neurobiologii nawyku: codzienne, krótkie bodźce ruchowe przynoszą znacznie trwalszy efekt w regeneracji powięzi niż jeden długi trening w tygodniu.',
    detailedPoints: [
      'Dzienny Cel Ruchu: Pierścień postępu zamyka się po zrealizowaniu zaplanowanej sesji dziennej oraz przynajmniej jednej mikropauzy biurowej.',
      'Ogień Serii (Streak): Każdy kolejny dzień wykonanych ćwiczeń zwiększa Twój licznik dni. Po 3 dniach pojawia się płomień nawyku.',
      'Odznaki kinezjologiczne: Za regularność, czytanie bazy wiedzy, opanowanie techniki oddechu oraz redukcję bólu VAS otrzymujesz kliniczne trofea widoczne w Profilu.'
    ],
    category: 'app_functionality',
    categoryLabel: 'Funkcjonowanie Aplikacji',
    clinicalTips: [
      'Nawet jeśli masz bardzo intensywny dzień, wystarczy 3-minutowa mikrosesja Chin Tuck, aby utrzymać serię i nie dopuścić do zesztywnienia krążków.'
    ],
    relatedAction: {
      label: 'Sprawdź Osiągnięcia w Profilu',
      tabTarget: 'profile'
    },
    tags: ['seria', 'streak', 'motywacja', 'cel dnia', 'odznaki', 'trofea']
  },
  {
    id: 'faq-pdf-export',
    question: 'W jaki sposób wygenerować raport PDF dla mojego lekarza lub fizjoterapeuty?',
    answer: 'Przejdź do zakładki "Postępy & Raport", gdzie znajdziesz przycisk "Pobierz Raport Kliniczny PDF". Dokument zawiera pełne zestawienie medyczne gotowe do wydruku lub wysłania mailem do specjalisty.',
    detailedPoints: [
      'Wykres dynamiki bólu VAS: Pokazuje, jak dolegliwości zmieniały się w czasie pod wpływem wdrożonego planu.',
      'Wyniki pomiarów goniometrycznych: Kąty rotacji w lewo/prawo, zgięcie podbródkowo-mostkowe i wyprost odcinka szyjnego.',
      'Zgłoszone objawy i czerwone flagi: Ułatwia lekarzowi podjęcie decyzji o ewentualnym skierowaniu na rezonans magnetyczny (MRI).'
    ],
    category: 'app_functionality',
    categoryLabel: 'Funkcjonowanie Aplikacji',
    clinicalTips: [
      'Zabierz wydrukowany raport na wizytę kontrolną – fizjoterapeuta natychmiast zobaczy, które pozycje przynosiły Ci największą ulgę.'
    ],
    relatedAction: {
      label: 'Przejdź do Postępów & Raportu',
      tabTarget: 'reports'
    },
    tags: ['raport pdf', 'lekarz', 'fizjoterapeuta', 'wydruk', 'dokumentacja']
  },

  // -------------------------------------------------------------
  // KATEGORIA: TECHNIKA ĆWICZEŃ (exercise_technique)
  // -------------------------------------------------------------
  {
    id: 'faq-exercise-frequency',
    question: 'Jak często w ciągu dnia i tygodnia powinienem wykonywać ćwiczenia?',
    answer: 'Kluczem do trwałej przebudowy tkanek i zniesienia bólu jest częstotliwość o małej objętości, a nie wyczerpujący jednorazowy trening.',
    detailedPoints: [
      'Główna sesja terapeutyczna: 1 raz dziennie przez 8-15 minut (najlepiej rano lub po powrocie z pracy).',
      'Mikropauzy przy komputerze: Co 45-60 minut wykonaj 1-2 powtórzenia pozycji Brüggera lub 5 retrakcji Chin Tuck (zajmuje to tylko 30 sekund).',
      'Dni regeneracji powięziowej: W weekendy program automatycznie redukuje intensywność na rzecz łagodnego rozciągania i mobilizacji oddechowej.'
    ],
    category: 'exercise_technique',
    categoryLabel: 'Technika Ćwiczeń',
    clinicalTips: [
      'Lepiej wykonać 3 minuty ćwiczeń codziennie niż 45 minut raz na dwa tygodnie – układ nerwowy potrzebuje stałego sygnału korekcyjnego.'
    ],
    relatedExerciseIds: ['chin-tuck', 'brugger-relief'],
    tags: ['częstotliwość', 'ile razy dziennie', 'plan tygodniowy', 'czas trwania']
  },
  {
    id: 'faq-chin-tuck-mistake',
    question: 'Jaki jest najczęstszy błąd przy retrakcji szyi (Chin Tuck) i jak go uniknąć?',
    answer: 'Najczęstszym i najbardziej szkodliwym błędem jest przyciąganie brody w dół do klatki piersiowej (zgięcie głowy) zamiast czystego ruchu poziomego (translacji) prosto w tył.',
    detailedPoints: [
      'Dlaczego to błąd: Zgięcie głowy w dół aktywuje powierzchowny mięsień mostkowo-obojczykowo-sutkowy (MOS), zamiast wyizolować głębokie zginacze szyi (Longus colli).',
      'Wizualizacja "szuflady": Wyobraź sobie, że Twoja głowa to szuflada w biurku, którą wsuwasz idealnie poziomo, równolegle do podłogi.',
      'Wzrok na horyzoncie: Przez cały czas trwania ruchu patrz prosto przed siebie na stały punkt – nie patrz w podłogę ani w sufit.',
      'Siła nacisku palcami: Palce na brodzie służą jedynie jako sensor czucia głębokiego (propriocepcji), a nie narzędzie do siłowego wpychania głowy!'
    ],
    category: 'exercise_technique',
    categoryLabel: 'Technika Ćwiczeń',
    clinicalTips: [
      'Aby opanować wzorzec, wykonaj ćwiczenie opierając potylicę i łopatki o płaską ścianę – ślizgaj tył czaszki pionowo ku górze.'
    ],
    relatedExerciseIds: ['chin-tuck'],
    tags: ['chin tuck', 'błędy techniczne', 'zgięcie szyi', 'retrakcja', 'kompensacje']
  },
  {
    id: 'faq-head-circles-danger',
    question: 'Dlaczego pełne krążenia głową (360°) są w nowoczesnej fizjoterapii zakazane?',
    answer: 'Obszerne młynki i krążenia głową to przestarzały, potencjalnie niebezpieczny nawyk gimnastyczny. Współczesna biomechanika kliniczna bezwzględnie odradza ten ruch u osób z bólami karku.',
    detailedPoints: [
      'Zwężenie otworów międzykręgowych: Połączenie skrajnego wyprostu z rotacją (tzw. test Spurlinga) powoduje gwałtowny ucisk korzeni nerwowych C5-C7.',
      'Kompresja tętnic kręgowych: W rejonie przejścia czaszkowo-szyjnego tętnice kręgowe biegną przez wąskie kanały kostne. Krążenia mogą wywołać zawroty głowy, niedokrwienie i mroczki przed oczami.',
      'Zwyrodnienia stawów międzywyrostkowych: Stawy szyjne nie są stworzone do ruchów obrotowych w pełnym wyproście – tarcie powierzchni chrzęstnych przyspiesza zmiany zwyrodnieniowe.',
      'Bezpieczna alternatywa: Zastąp krążenia kontrolowanymi obrotami w osi pionowej (w lewo/prawo) z zatrzymaniem na 3 sekundy.'
    ],
    category: 'exercise_technique',
    categoryLabel: 'Technika Ćwiczeń',
    clinicalTips: [
      'W naszej aplikacji znajdziesz bezpieczne ćwiczenie "Kontrolowana rotacja szyi z zatrzymaniem", które eliminuje ryzyko kompresji naczyniowej.'
    ],
    relatedExerciseIds: ['neck-rotations', 'chin-tuck'],
    tags: ['krążenia głową', 'niebezpieczne ćwiczenia', 'przeciwwskazania', 'tętnica kręgowa']
  },
  {
    id: 'faq-breathing-mechanics',
    question: 'Jak prawidłowo oddychać podczas ćwiczeń kręgosłupa szyjnego?',
    answer: 'Oddychanie i napięcie karku są nierozerwalnie połączone neurologicznie. Płytki, szczytowy oddech klatkowy zmusza pomocnicze mięśnie oddechowe szyi (mięśnie pochyłe i MOS) do wykonania ponad 20 000 skurczów na dobę!',
    detailedPoints: [
      'Tor dolnożebrowy / przeponowy: Podczas wdechu rozszerzaj boki żeber i dolny brzuch, trzymając barki całkowicie nieruchomo w dole.',
      'Wydech przy wysiłku: W fazie ruchu (np. cofanie brody, otwieranie ramion) wykonuj powolny, uspokajający wydech przez lekko rozchylone usta.',
      'Zabaz wstrzymywania oddechu (zjawisko Valsalvy): Zatrzymanie powietrza drastycznie podnosi ciśnienie śródpiersiowe i napina oponę twardą rdzenia kręgowego.'
    ],
    category: 'exercise_technique',
    categoryLabel: 'Technika Ćwiczeń',
    clinicalTips: [
      'Jeśli po kilku minutach pracy czujesz ból karku, połóż dłoń na obojczykach – jeśli unosi się przy każdym oddechu, natychmiast przekieruj oddech w dół brzucha.'
    ],
    relatedExerciseIds: ['brugger-relief', 'suboccipital-release'],
    tags: ['oddech', 'przepona', 'mięśnie pochyłe', 'tor dolnożebrowy', 'wydech']
  },
  {
    id: 'faq-office-exercises',
    question: 'Czy mogę wykonywać te ćwiczenia bezpośrednio przy biurku w pracy?',
    answer: 'Zdecydowana większość ćwiczeń w naszym katalogu (kategoria "Biurowe & Mikropauzy") została zaprojektowana specjalnie do wykonywania w ubraniu codziennym, bez konieczności kładzenia się na podłodze ani posiadania sprzętu.',
    detailedPoints: [
      'Dyskrecja i prostota: Ćwiczenia takie jak Chin Tuck, izometria 4 kierunków czy pozycja Brüggera można wykonać siedząc na fotelu biurowym.',
      'Brak potliwości: Ćwiczenia skupiają się na aktywacji nerwowo-mięśniowej i dekompresji powięzi, a nie na tętnie kardio, więc nie powodują zmęczenia ani potu.',
      'Ekspresowy czas: Wystarczy 60 sekund w przerwie między spotkaniami lub w trakcie kompilacji kodu.'
    ],
    category: 'exercise_technique',
    categoryLabel: 'Technika Ćwiczeń',
    clinicalTips: [
      'Ustaw w aplikacji automatyczne przypomnienie o mikropauzie co 60 minut, aby nie dopuścić do zesztywnienia tkanek.'
    ],
    relatedExerciseIds: ['brugger-relief', 'chin-tuck', 'isometric-neck'],
    tags: ['biuro', 'praca siedząca', 'dyskretne ćwiczenia', 'fotel', 'ubranie codzienne']
  },
  {
    id: 'faq-deep-flexors-vs-mos',
    question: 'Skąd mam wiedzieć, czy pracują właściwe mięśnie głębokie, a nie mięsień MOS?',
    answer: 'Mięsień mostkowo-obojczykowo-sutkowy (MOS) to duży, widoczny powrózek biegnący skośnie od mostka do wyrostka sutkowatego za uchem. Przy przeciążeniach karku ma tendencję do nadaktywności, "kradnąc" pracę głębokim zginaczom szyi.',
    detailedPoints: [
      'Test dwóch palców: Przed rozpoczęciem cofania brody połóż opuszki palców delikatnie na przednio-bocznej powierzchni szyi (na mięśniu MOS).',
      'Prawidłowy stan: Podczas powolnej retrakcji mięsień MOS pod Twoimi palcami powinien pozostać MIĘKKI i rozluźniony.',
      'Głębokie uczucie: Prawidłowe napięcie odczujesz głęboko w gardle / za podniebieniem oraz w postaci delikatnego rozciągania pod potylicą.',
      'Jeśli MOS natychmiast twardnieje jak struna: Zmniejsz zakres cofania brody o połowę i skup się na całkowitym rozluźnieniu żuchwy (czubek języka oparty o podniebienie za górnymi zębami).'
    ],
    category: 'exercise_technique',
    categoryLabel: 'Technika Ćwiczeń',
    clinicalTips: [
      'Spokojne przełknięcie śliny przed ruchem pomaga ustabilizować kość gnykową i ułatwia izolację m. longus colli.'
    ],
    relatedExerciseIds: ['chin-tuck', 'isometric-neck'],
    tags: ['mięsień mos', 'zginacze głębokie', 'izolacja', 'longus colli', 'test dotyku']
  },

  // -------------------------------------------------------------
  // KATEGORIA: ZARZĄDZANIE BÓLEM I BEZPIECZEŃSTWO (pain_management)
  // -------------------------------------------------------------
  {
    id: 'faq-vas-scale-guide',
    question: 'Jak korzystać ze skali bólu VAS (0-10) i jak oceniać swoje samopoczucie?',
    answer: 'Skala VAS (Visual Analogue Scale) to międzynarodowy standard oceny natężenia bólu. Pozwala obiektywnie monitorować postępy terapii i dostosowywać intensywność ćwiczeń.',
    detailedPoints: [
      '0: Całkowity brak bólu i pełen komfort.',
      '1 - 3 (Ból łagodny): Lekki dyskomfort, napięcie karku lub uczucie "zmęczenia materiału", które nie zakłóca codziennych czynności.',
      '4 - 6 (Ból umiarkowany): Odczuwalny ból przeszkadzający w skupieniu przy komputerze, wymagający częstego zmieniania pozycji lub sięgania po tabletkę.',
      '7 - 8 (Ból silny): Znaczne ograniczenie ruchomości głowy, trudności w zasypianiu, ból dominujący myśli.',
      '9 - 10 (Ból ekstremalny): Ból nie do zniesienia, wymagający natychmiastowej interwencji lekarskiej lub medycyny ratunkowej.'
    ],
    category: 'pain_management',
    categoryLabel: 'Zarządzanie Bólem',
    clinicalTips: [
      'Oceniaj ból o stałej porze (np. rano po wstaniu lub wieczorem przed snem) – dzięki temu wykres w zakładce Raport będzie najbardziej wiarygodny.'
    ],
    relatedAction: {
      label: 'Wykonaj Analizę Bólu AI',
      tabTarget: 'triage'
    },
    tags: ['skala vas', 'ocena bólu', 'jak oceniać', 'poziom dyskomfortu']
  },
  {
    id: 'faq-24h-traffic-light-rule',
    question: 'Co zrobić, gdy ból nasili się po ćwiczeniach? (Zasada 24 godzin)',
    answer: 'Zasada 24 godzin (tzw. reguła sygnalizacji świetlnej) to fundamentalny kompas bezpieczeństwa w kinezjoterapii domowej.',
    detailedPoints: [
      'Zielone światło (Norma): Po ćwiczeniach pojawia się łagodne zmęczenie mięśni lub delikatny ból, który całkowicie ustępuje w ciągu maksymalnie 12-24 godzin. Oznacza to prawidłową adaptację tkanek.',
      'Żółte światło (Ostrzeżenie): Ból nasila się o więcej niż 2 punkty w skali VAS i utrzymuje się powyżej 24 godzin. Wskazanie: zmniejsz liczbę powtórzeń o 50% i skróć czas trzymania pozycji.',
      'Czerwone światło (Stop): Ostre zaostrzenie bólu, pojawienie się rwania do ręki lub objawów neurologicznych. Natychmiast przerwij dane ćwiczenie i skonsultuj się z lekarzem lub fizjoterapeutą.'
    ],
    category: 'pain_management',
    categoryLabel: 'Zarządzanie Bólem',
    clinicalTips: [
      'Rehabilitacja to maraton, nie sprint: zasada "no pain, no gain" w terapii kręgosłupa szyjnego jest szkodliwym mitem!'
    ],
    relatedExerciseIds: ['chin-tuck', 'suboccipital-release'],
    tags: ['nasilenie bólu', 'zasada 24h', 'bezpieczeństwo', 'sygnalizacja świetlna', 'zaostrzenie']
  },
  {
    id: 'faq-good-vs-bad-pain',
    question: 'Czym różni się „dobry ból rozciągania” od „bólu ostrzegawczego”?',
    answer: 'Umiejętność odróżnienia fizjologicznego rozciągania tkanek od sygnału alarmowego chroni przed mikrourazami i stanem zapalnym.',
    detailedPoints: [
      'Dobry ból terapeutyczny: Ma charakter "przyjemnego ciągnięcia", rozlanego ciepła lub uwalnianego napięcia. Występuje wyłącznie w trakcie trwania ćwiczenia i ustępuje natychmiast po powrocie do pozycji neutralnej.',
      'Zły ból ostrzegawczy: Jest ostry, kłujący, piekący lub pulsujący. Często przypomina "ukłucie nożem", prąd elektryczny strzelający wzdłuż ręki lub uczucie mechanicznego zakleszczenia kości.',
      'Działanie: Jeśli poczujesz ból kłujący lub elektryczny, natychmiast przerwij ruch – nie próbuj go "przełamywać" siłą!'
    ],
    category: 'pain_management',
    categoryLabel: 'Zarządzanie Bólem',
    clinicalTips: [
      'Zawsze wykonuj ćwiczenia w tzw. strefie bezbólowej lub strefie łagodnego dyskomfortu (maksymalnie 3-4/10 VAS).'
    ],
    relatedExerciseIds: ['trapezius-stretch', 'nerve-floss'],
    tags: ['dobry ból', 'zły ból', 'rozciąganie', 'ból kłujący', 'porażenie prądem']
  },
  {
    id: 'faq-centralization-mckenzie',
    question: 'Czym jest zjawisko centralizacji i peryferalizacji bólu (metoda McKenzie)?',
    answer: 'Zjawisko centralizacji to jedno z najważniejszych odkryć w ortopedii kręgosłupa, opisane przez nowozelandzkiego fizjoterapeutę Robina McKenziego.',
    detailedPoints: [
      'Centralizacja (Bardzo dobry znak!): Ból, który wcześniej promieniował do łopatki, ramienia czy palców dłoni, pod wpływem ćwiczeń dekompresyjnych wycofuje się i skupia bliżej środka szyi. Nawet jeśli ból w samej szyi wydaje się chwilowo silniejszy, jest to dowód na odbarczenie korzenia nerwowego!',
      'Peryferalizacja (Zły znak – natychmiast przerwij!): Ból z karku zaczyna przemieszczać się w dół kończyny: do barku, łokcia, przedramienia lub palców, połączony z mrowieniem. Oznacza to narastający ucisk mechaniczny na nerw.',
      'Reguła postępowania: Ćwiczenia wywołujące centralizację należy kontynuować; ćwiczenia wywołujące peryferalizację należy bezwzględnie wykluczyć z planu.'
    ],
    category: 'pain_management',
    categoryLabel: 'Zarządzanie Bólem',
    clinicalTips: [
      'W naszym generatorze planu ćwiczenia neurodynamiczne (Nerve Floss) są precyzyjnie dawkowane, by wspierać centralizację objawów.'
    ],
    relatedExerciseIds: ['nerve-floss', 'chin-tuck', 'lumbar-extension'],
    tags: ['centralizacja', 'peryferalizacja', 'mckenzie', 'promieniowanie', 'korzeń nerwowy']
  },
  {
    id: 'faq-red-flags-urgent',
    question: 'Jakie są „Czerwone Flagi” wymagające natychmiastowej wizyty u lekarza lub na SOR?',
    answer: 'Czerwone flagi (Red Flags) to objawy alarmowe wskazujące na możliwość poważnej patologii strukturalnej, ucisku rdzenia kręgowego lub zaburzeń naczyniowych, gdzie ćwiczenia domowe są bezwzględnie zakazane.',
    detailedPoints: [
      'Niedowład dłoni i palców: Wypadanie przedmiotów z rąk, niemożność zapięcia guzików, nagłe osłabienie siły uścisku dłoni.',
      'Objawy mielopatyczne (ucisk rdzenia): Zaburzenia chodu, uczucie "chodzenia po miękkiej gąbce", niestabilność równowagi, nagłe problemy z kontrolą pęcherza lub zwieraczy.',
      'Objawy naczyniowe (zasada 5D): Dizziness (zawroty głowy), Diplopia (podwójne widzenie), Dysphagia (trudności z połykaniem), Dysarthria (bełkotliwa mowa), Drop attacks (nagłe upadki bez utraty przytomności).',
      'Ból po urazie: Każdy ostry ból karku po wypadku samochodowym (whiplash) lub upadku z wysokości wymaga wykluczenia złamania w RTG/TK.',
      'Nocny ból spoczynkowy: Stały, palący ból nieustępujący w żadnej pozycji, nasilający się w spoczynku i połączony z gorączką lub nagłym spadkiem masy ciała.'
    ],
    category: 'pain_management',
    categoryLabel: 'Zarządzanie Bólem',
    clinicalTips: [
      'Jeśli zauważysz u siebie którykolwiek z powyższych objawów, nie ćwicz – natychmiast skonsultuj się z lekarzem lub zadzwoń pod numer 112.'
    ],
    relatedAction: {
      label: 'Sprawdź w Analizie Bólu AI',
      tabTarget: 'triage'
    },
    tags: ['czerwone flagi', 'red flags', 'sor', 'lekarz', 'niedowład', 'objawy alarmowe']
  },
  {
    id: 'faq-heat-vs-cold',
    question: 'Ciepłe kompresy czy zimne okłady – co wybrać przy spiętym karku?',
    answer: 'Wybór między ciepłem a zimnem zależy od fazy dolegliwości oraz ich biologicznego mechanizmu.',
    detailedPoints: [
      'Ciepło (Zalecane w 90% przypadków bólu biurowego): Ciepły prysznic, termofor lub poduszka rozgrzewająca doskonale sprawdzają się przy przewlekłym napięciu mięśniowym, punktach spustowych i sztywności porannej. Ciepło rozszerza naczynia krwionośne, poprawia dotlenienie powięzi i wycisza układ nerwowy.',
      'Zimno (Krioterapia): Zimne okłady żelowe (zawsze przez ściereczkę, maks. 10-15 minut) stosuj wyłącznie w stanie ostrego zapalenia – np. w pierwszych 48 godzinach po nagłym urazie mechanicznym ("postrzale" z obrzękiem i uczuciem palenia).',
      'Uwaga: Nigdy nie kładź się spać z włączoną poduszką elektryczną, aby nie doprowadzić do poparzenia lub przegrzania tkanek.'
    ],
    category: 'pain_management',
    categoryLabel: 'Zarządzanie Bólem',
    clinicalTips: [
      'Ciepły kompres zastosowany przez 10 minut przed sesją ćwiczeń znakomicie zwiększa elastyczność powięzi karku i ułatwia retrakcję.'
    ],
    relatedExerciseIds: ['suboccipital-release', 'trapezius-stretch'],
    tags: ['ciepło czy zimno', 'okłady', 'termofor', 'lód', 'stan zapalny', 'sztywność']
  }
];
