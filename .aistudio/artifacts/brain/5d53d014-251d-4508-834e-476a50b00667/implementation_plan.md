# Moduł Wideo Instruktażowych HD z Synchronizacją Faz Ruchu (HUD)

Rozbudowa platformy rehabilitacji kręgosłupa i szyi o zaawansowany moduł wideo instruktażowych HD dla każdego ćwiczenia w planie treningowym i katalogu. Moduł łączy płynne odtwarzanie wideo z natywną kontrolą prędkości (spowalnianie do analizy techniki), odtwarzaniem w pętli oraz dynamicznymi nakładkami HUD (Heads-Up Display) zsynchronizowanymi z aktualną fazą ruchu, które prowadzą pacjenta przez prawidłową postawę, zakres ruchu (ROM), rytm oddechu i ostrzegają przed typowymi błędami kompensacyjnymi.

---

### Przegląd Decyzji i Potwierdzone Wybory

> [!IMPORTANT]
> Poniższe założenia architektoniczne i UX zostały ustalone na podstawie Twoich odpowiedzi i stanowią fundament wdrożenia.

- **Silnik odtwarzacza**: **Natywny odtwarzacz HD z pełną kontrolą prędkości i pętli** – wykorzystujący niskopoziomowe sterowanie czasem odtwarzania (`playbackRate` `0.25x`, `0.5x`, `0.75x`, `1.0x`), płynne zapętlanie całego ćwiczenia lub wybranej fazy ruchu (pętla fazowa A–B) oraz hybrydowy bufor wideo HD ze zintegrowanym silnikiem kinematycznym 60 FPS gwarantującym natychmiastowe działanie także w trybie offline.
- **Prezentacja wskazówek klinicznych**: **Nakładki HUD na wideo zsynchronizowane z fazą ruchu** – nieinwazyjne warstwy informacyjne wyświetlane bezpośrednio na kadrze wideo (z mierzoną aperturą kontrastu), automatycznie przełączające wskazówki w zależności od fazy cyklu (*Przygotowanie i Postawa* → *Faza Koncentryczna / Zakres Ruchu* → *Izometria i Oddech* → *Powrót i Kontrola Błędów*).
- **Punkty integracji w aplikacji**:
  1. **Karty planu treningowego („Mój Plan”)** – rozwijany szybki podgląd wideo instruktażowego bezpośrednio w karcie ćwiczenia na dany dzień, pozwalający sprawdzić technikę jednym dotknięciem przed sesją.
  2. **Pełnoekranowy odtwarzacz aktywnej sesji ćwiczeń** – zintegrowany tryb wideo HD z nakładkami HUD, kontrolą tempa (`0.5x` / `0.75x` / `1.0x`) i pętlą w trakcie wykonywania powtórzeń.
  3. **Okno szczegółów ćwiczenia w katalogu** – pełny warsztat techniki ruchu z interaktywną osią faz, filtrami 4 kategorii wskazówek (Postawa, Zakres ruchu, Oddech, Typowe błędy) oraz precyzyjnym podglądem klatka po klatce.

---

### 1. Koncepcja Kliniczna i Wartość dla Pacjenta

- **Co realizuje moduł**: Każde z ćwiczeń rehabilitacyjnych odcinka szyjnego, piersiowego i lędźwiowego otrzymuje dedykowany strumień instruktażowy HD podzielony na precyzyjne fazy biomechaniczne. Pacjent nie tylko widzi ruch, ale otrzymuje w czasie rzeczywistym na ekranie wideo zwięzłe wskazówki dotyczące ustawienia osi kręgosłupa, bezpiecznego zakresu ruchu (ROM), właściwej fazy wdechu/wydechu oraz ostrzeżenia przed kompensacjami (np. unoszeniem barków czy przeprostem karku).
- **Grupa docelowa i kontekst użycia**: Pacjenci z bólem szyi i kręgosłupa (m.in. *tech-neck*, dyskopatia, napięciowe bóle głowy) ćwiczący samodzielnie w domu lub przy biurku na smartfonie i komputerze, którzy potrzebują pewności, że wykonują ruch bezpiecznie i bez pogłębiania dolegliwości.
- **Kluczowa wartość terapeutyczna**: Możliwość zwolnienia wideo do `0.5x` lub `0.75x` oraz zapętlenia pojedynczej fazy ruchu (np. samej fazy cofnięcia brody lub stabilizacji łopatek) eliminuje najczęstszy problem domowej rehabilitacji – zbyt szybkie, powierzchowne wykonywanie powtórzeń z błędami kompensacyjnymi.

---

### 2. Doświadczenie Użytkownika (UX) i Projekt Wizualny

#### Kluczowe Przepływy Użytkownika (User Flows)

1. **Szybki podgląd w widoku „Mój Plan”**:
   - Na karcie każdego zaplanowanego ćwiczenia pacjent widzi przycisk szybkiego podglądu wideo z czasem trwania i oznaczeniem jakości HD.
   - Jedno dotknięcie rozwija wbudowany mini-odtwarzacz wideo bezpośrednio w karcie (bez opuszczania planu dnia) z aktywną pętlą, przełącznikiem prędkości (`0.5x` / `1.0x`) i nakładkami HUD pokazującymi 4 filary techniki.
2. **Analiza techniki w oknie szczegółów ćwiczenia (Katalog)**:
   - Po otwarciu szczegółów ćwiczenia pacjent może przełączyć widok na **Wideo Instruktażowe HD z HUD**.
   - Pod kadrem wideo znajduje się interaktywny pasek faz ruchu (*Postawa wyjściowa*, *Zakres ruchu*, *Szczyt napięcia i Oddech*, *Unikanie błędów*). Dotknięcie dowolnej fazy przewija wideo do odpowiedniego momentu i opcjonalnie zapętla tę fazę (Loop A–B), wyświetlając na ekranie powiązane wektory i wskazówki kliniczne.
3. **Trening na żywo w Pełnoekranowym Odtwarzaczu Sesji**:
   - Podczas aktywnej sesji pacjent może w każdej chwili przełączyć lub ustawić domyślnie widok wideo HD.
   - Odtwarzacz działa w ciągłej pętli dopasowanej do rytmu powtórzeń, a nakładki HUD w górnej i dolnej strefie wideo podpowiadają w aktualnej sekundzie: kiedy wykonać wdech/wydech, jak utrzymać postawę i jakiego błędu unikać przy narastającym zmęczeniu.

#### Tożsamość Wizualna i Estetyka (Nowoczesny Kliniczny Minimalizm)

- **Kierunek estetyczny**: Czysty, medyczny interfejs o wysokiej czytelności z kontrolowanym kontrastem na warstwach wideo. Zero zbędnych ozdobników – wszystkie elementy sterujące na wideo mają ergonomiczne pola dotyku ($\ge 44 \times 44\text{px}$ na ekranach mobilnych).
- **Paleta barw i semantyka nakładek HUD**:
  - **Tło odtwarzacza**: Głęboki grafit medyczny (`slate-950`) z delikatnym gradientowym przyciemnieniem krawędzi (`bg-gradient-to-t from-black/80 via-black/35 to-transparent`), gwarantującym kontrast tekstu min. 4.5:1 na każdej klatce wideo.
  - **Semantyczne akcenty kategorii wskazówek**:
    - *Prawidłowa postawa*: Medyczny turkus (`teal-400` / `teal-500`) – stabilność i oś ciała.
    - *Zakres ruchu (ROM)*: Błękit kliniczny (`sky-400` / `sky-500`) – wektor i bezpieczne granice kątowe ruchu.
    - *Technika oddechu*: Szmaragdowy (`emerald-400` / `emerald-500`) – rytm wdechu i wydechu przeponowego.
    - *Typowe błędy do unikania*: Ostrzegawczy bursztyn/koral (`amber-400` / `rose-400`) – wyraźne ostrzeżenie przed kompensacją (zawsze z czytelną ikoną i etykietą tekstową, nigdy wyłącznie kolorem).
- **Typografia i hierarchia**:
  - Nagłówki faz i licznik czasu: wyraźny krój bezszeryfowy z cyframi tabelarycznymi (`tabular-nums`) dla zegara czasu, prędkości (`0.50x`, `0.75x`, `1.00x`) i kątów zakresu ruchu.
  - Metadane pod wideo (czas trwania, docelowe pasmo mięśniowe, tempo): czysty, nieobramowany tekst rozdzielony subtelnymi separatorami typograficznymi (`·`).

---

### 3. Kluczowe Decyzje Produktowe i Kompromisy (Trade-Offs)

- **Decyzja 1: Hybrydowy silnik wideo HD (Syntetyzowany strumień Canvas/WebM HD + natywny `<video>` HTML5 z obsługą źródeł zewnętrznych)**
  - *Wybrane podejście*: Stworzenie natywnego komponentu odtwarzacza `<video>` wspierającego zarówno strumienie MP4/WebM, jak i generowany w czasie rzeczywistym, płynny strumień wideo HD (`captureStream` / renderowanie klatek 60 FPS na bazie modelu anatomicznego z siatką medyczną, wektorami sił i kamerą wielokątową) oraz opcjonalny dostęp do zewnętrznego nagrania fizjoterapeuty.
  - *Dlaczego*: Zewnętrzne ramki `iframe` (np. YouTube) w środowiskach mobilnych i sandboxowych często blokują precyzyjne API spowalniania (`0.25x`/`0.5x`), płynne zapętlanie odcinków A–B bez czarnych ekranów buforowania oraz nakładanie responsywnych warstw HUD zsynchronizowanych co do milisekundy z klatką ruchu. Natywny silnik HD zapewnia 100% niezawodności, natychmiastowy start (zero opóźnień sieciowych), płynne `0.5x` slow-motion i pełne działanie offline.
- **Decyzja 2: Synchronizacja nakładek HUD z fazami ruchu zamiast statycznych ścian tekstu**
  - *Wybrane podejście*: Podział każdego wideo na 4 powtarzalne fazy czasowe oraz możliwość przypięcia wybranej kategorii wskazówki (np. „Pokaż błędy” lub „Pokaż oddech”) bezpośrednio na ekranie wideo.
  - *Dlaczego*: Pacjent wykonujący ćwiczenie szyi nie może jednocześnie czytać długiego artykułu pod filmem. Krótkie, zsynchronizowane z ruchem komunikaty HUD (maksymalnie 1–2 zdania na fazę + wizualny wskaźnik oddechu i kąta ruchu) pozwalają korygować technikę bez odrywania wzroku od demonstracji.

---

### 4. Architektura Techniczna i Strategia Danych

#### Diagram Architektury i Przepływu Komponentów

```
┌────────────────────────────────────────────────────────────────────────────┐
│                   Baza Danych Ćwiczeń i Instrukcji Wideo                   │
│  • Struktury VideoInstruction (czas, tempo, 4 filary techniki, fazy A-B)   │
│  • Wskazówki: Postawa | Zakres Ruchu (ROM) | Oddech | Typowe Błędy         │
└─────────────────────────────────────┬──────────────────────────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│             InstructionalVideoPlayer (Natywny Odtwarzacz HD)               │
│  ┌──────────────────────────────────┐  ┌────────────────────────────────┐  │
│  │ Silnik Wideo HTML5 / HD Stream   │  │ Warstwa HUD (Synchronizacja)   │  │
│  │ • Prędkość: 0.25x, 0.5x, 0.75x,1x│  │ • Aktywna faza ruchu (1..4)    │  │
│  │ • Pętla pełna + Pętla fazy (A-B) │  │ • Wskaźniki: Postawa / ROM     │  │
│  │ • Klatka po klatce i oś czasu    │  │ • Rytm oddechu + Alerty błędów │  │
│  └──────────────────────────────────┘  └────────────────────────────────┘  │
└───────────┬─────────────────────────┬──────────────────────────┬───────────┘
            │                         │                          │
            ▼                         ▼                          ▼
┌───────────────────────┐ ┌────────────────────────┐ ┌───────────────────────┐
│   Widok "Mój Plan"    │ │  Aktywna Sesja Ćwiczeń │ │    Okno Szczegółów    │
│   (TrainingPlanView)  │ │  (ActiveSessionModal)  │ │    (ExerciseModal)    │
│ • Szybki podgląd HD   │ │ • Pełnoekranowe wideo  │ │ • Pełny warsztat HUD  │
│   rozwijany w karcie  │ │   z HUD i kontrolą     │ │ • Przełączanie faz i  │
│   każdego ćwiczenia   │ │   prędkości w treningu │ │   analiza błędów      │
└───────────────────────┘ └────────────────────────┘ └───────────────────────┘
```

#### Model Danych (`VideoInstruction` w modelu `Exercise`)

Każde z 10 ćwiczeń w bazie zostanie wzbogacone o ustrukturyzowany obiekt instruktażu wideo zawierający:
- **Fazy czasowe wideo (`phases`)**: Tablica odcinków czasowych (start/koniec w procentach i sekundach cyklu) z przypisaną nazwą fazy (np. *Ustawienie osi*, *Retrakcja pozioma*, *Izometria szczytowa*, *Kontrolowany powrót*), aktywną wskazówką HUD oraz fazą oddechu (`inhale` | `hold` | `exhale` | `relax`).
- **Cztery filary techniki klinicznej (`clinicalCues`)**:
  - `posture`: Szczegółowe punkty kontrolne ustawienia głowy, obręczy barkowej i miednicy.
  - `rangeOfMotion`: Opis bezpiecznego zakresu ruchu, kąta docelowego (np. `15°–20°` lub ruch bezbólowy do pierwszego oporu tkankowego) oraz wskaźnik wizualny.
  - `breathing`: Precyzyjna koordynacja oddechu z fazą napięcia i rozluźnienia mięśni.
  - `commonMistakes`: Lista najczęstszych błędów z opisem „Błąd vs. Korekta” wyświetlana jako ostrzeżenie HUD na wideo.
- **Parametry odtwarzacza**: Domyślny czas cyklu HD, kąty kamery (widok boczny / przedni /osiowy do przełączania na żywo w odtwarzaczu) oraz znaczniki pętli A–B.

#### Mapowanie Interakcji i Stanów Komponentów

- **Kontrola prędkości (`playbackSpeed`)**: Natychmiastowa zmiana współczynnika prędkości (`0.25x`, `0.5x`, `0.75x`, `1.0x`) zarówno dla strumienia wideo, jak i zsynchronizowanego zegara faz HUD oraz wizualizatora oddechu.
- **Tryby pętli (`loopMode`)**:
  - *Pętla ciągła (Całe ćwiczenie)* – płynne powtarzanie pełnego cyklu bez przerw.
  - *Pętla fazy (A–B Phase Loop)* – kliknięcie dowolnej fazy na pasku pod wideo pozwala zablokować odtwarzanie wyłącznie na wybranym fragmencie ruchu (np. moment szczytowego napięcia), aby dokładnie przeanalizować ustawienie ciała w zwolnionym tempie.
- **Interaktywne filtry HUD (`activeHudFilter`)**: Użytkownik może przełączać tryb nakładek na wideo pomiędzy *Auto (Zsynchronizowane z fazą)*, *Postawa*, *Zakres ruchu*, *Oddech* oraz *Typowe błędy*, a także jednym przyciskiem ukryć/pokazać HUD, aby obejrzeć czysty obraz wideo.
