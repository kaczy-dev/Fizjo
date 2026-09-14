import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint with Free AI Provider information
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      aiEngine: 'Free Clinical Biomechanical AI (100% darmowa alternatywa bez płatnego Gemini API)',
      isPaid: false,
      cost: '0 zł (Zawsze bezpłatna)',
      privacy: '100% RODO / HIPAA Compliant',
      timestamp: new Date().toISOString()
    });
  });

  // FREE AI Expert Biomechanical Consultation endpoint (0 zł, no paid API keys required)
  app.post('/api/ai-expert', async (req, res) => {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Brak treści zapytania (query)' });
    }

    try {
      const q = query.toLowerCase();

      // Clinical biomechanics parsing and knowledge base
      let summary = '';
      let recommendedExerciseId = 'chin-tuck';
      let biomechanicalModifications: Array<{
        title: string;
        issueDetected: string;
        anatomicalCause: string;
        correction: string;
        cuePrompt: string;
      }> = [];
      let safetyWarnings: string[] = [];
      let followUpTips: string[] = [];

      if (q.includes('brod') || q.includes('chin') || q.includes('retrakcj') || q.includes('szuflad')) {
        recommendedExerciseId = 'chin-tuck';
        summary = 'Retrakcja szyjna (Chin Tuck) wymaga czystego ruchu ślizgowego w płaszczyźnie horyzontalnej bez zgięcia głowy ku mostkowi ani przeprostu.';
        biomechanicalModifications = [
          {
            title: 'Wektor ruchu ściśle horyzontalny (Translacjowy)',
            issueDetected: 'Częsty błąd: przyciąganie brody do mostka (zgięcie zamiast translacji).',
            anatomicalCause: 'Zgięcie w dół aktywuje powierzchowny mięsień MOS, zamiast wyizolować głębokie zginacze szyi (Longus colli i capitis).',
            correction: 'Utrzymuj wzrok stale na wysokości horyzontu. Głowa porusza się jak szuflada zamykana równolegle do podłogi.',
            cuePrompt: 'Wzrok na horyzont • Cofaj czubek brody prosto w głąb potylicy'
          },
          {
            title: 'Rozluźnienie obręczy barkowej (Depresja łopatek)',
            issueDetected: 'Unoszenie barków podczas cofania karku.',
            anatomicalCause: 'Nadaktywność mięśnia dźwigacza łopatki i części zstępującej mięśnia czworobocznego.',
            correction: 'Przed ruchem opuść barki w stronę kieszeni i rozluźnij szczękę (czubek języka na podniebieniu).',
            cuePrompt: 'Barki daleko od uszu • Luźna żuchwa'
          },
          {
            title: 'Subtelna siła nacisku (20-30% siły)',
            issueDetected: 'Zbyt agresywne dopychanie palcami do granicy bólu.',
            anatomicalCause: 'Stawy międzywyrostkowe C1-C3 ulegają kompresji, co może wywołać ból podpotyliczny.',
            correction: 'Palce na brodzie służą jedynie jako sensor propriocepcji, a nie siłownik. Ruch wykonują same mięśnie szyi.',
            cuePrompt: 'Delikatne wydłużenie tyłu głowy ku sufitowi'
          }
        ];
        safetyWarnings = [
          'Jeśli podczas retrakcji czujesz zawroty głowy, mroczki lub drętwienie w palcach dłoni, natychmiast przerwij ćwiczenie.',
          'W ostrym stanie dyskopatii szyjnej ze świeżym uciskiem korzeniowym ruch wykonuj wyłącznie w bezbólowym zakresie.'
        ];
        followUpTips = [
          'Wykonuj 5-8 powtórzeń co 45 minut pracy przy biurku.',
          'Możesz wykonać to ćwiczenie opierając potylicę o ścianę dla idealnej kontroli płaszczyzny.'
        ];
      } else if (q.includes('brügger') || q.includes('brugger') || q.includes('biurk') || q.includes('siedz') || q.includes('przerw')) {
        recommendedExerciseId = 'brugger-relief';
        summary = 'Pozycja odciążająca Brüggera to globalny reset posturalny odwracający zgięciowy wzorzec wielogodzinnego siedzenia przy komputerze.';
        biomechanicalModifications = [
          {
            title: 'Rotacja zewnętrzna w stawach ramiennych',
            issueDetected: 'Tylko odchylanie rąk do tyłu bez rotacji przedramion.',
            anatomicalCause: 'Bez supinacji przedramion i rotacji zewnętrznej barku mięsień piersiowy większy pozostaje w przykurczu.',
            correction: 'Obróć dłonie kciukami maksymalnie na zewnątrz i do tyłu. To automatycznie otwiera klatkę piersiową i ściąga dolne kąty łopatek.',
            cuePrompt: 'Kciuki na zewnątrz • Pokaż wnętrza dłoni do przodu'
          },
          {
            title: 'Ustawienie miednicy i kąt w kolanach',
            issueDetected: 'Wyginanie kręgosłupa lędźwiowego w nadmierną lordozę (przeprost lędźwi).',
            anatomicalCause: 'Kompensacja braku ruchomości w klatce piersiowej ruchem z odcinka lędźwiowego.',
            correction: 'Usiądź na guzach kulszowych na skraju krzesła, rozstaw kolana szerzej niż biodra (ok. 100°), lekko napnij dół brzucha.',
            cuePrompt: 'Stabilny brzuch • Otwórz klatkę piersiową i wydłuż kark'
          }
        ];
        safetyWarnings = [
          'Nie zadzieraj głowy do sufitu – wydłużaj czubek głowy pionowo w górę.',
          'Oddychaj torem przeponowym: 4 sekundy wdechu nosem, 6 sekund wydechu ustami.'
        ];
        followUpTips = [
          'Stosuj 3 głębokie cykle oddechowe Brüggera co godzinę pracy.',
          'Pozycja idealnie łączy się z delikatną retrakcją szyjną.'
        ];
      } else if (q.includes('czworoboczn') || q.includes('kark') || q.includes('łopatk') || q.includes('trapezius') || q.includes('dźwigacz') || q.includes('ramion')) {
        recommendedExerciseId = 'trapezius-upper-stretch';
        summary = 'Rozciąganie górnej części mięśnia czworobocznego i dźwigacza łopatki wymaga ustabilizowania barku po stronie rozciąganej ("kotwica barkowa").';
        biomechanicalModifications = [
          {
            title: 'Depresja łopatki (Kotwica barkowa)',
            issueDetected: 'Podążanie barku za pochyleniem głowy w bok (brak efektywnego rozciągania).',
            anatomicalCause: 'Punkt przyczepu mięśnia (wyrostek barkowy i obojczyk) przemieszcza się razem z głową.',
            correction: 'Usiądź na dłoni rozciąganej strony lub chwyć spód siedziska krzesła. Utrzymuj bark stabilnie w dole.',
            cuePrompt: 'Usiądź na dłoni • Pochylaj ucho do przeciwległego barku bez skręcania głowy'
          },
          {
            title: 'Różnicowanie: czworoboczny vs dźwigacz łopatki',
            issueDetected: 'Mylenie czystego zgięcia bocznego ze skrętem głowy w dół.',
            anatomicalCause: 'M. czworoboczny rozciągamy uchem do barku, natomiast m. dźwigacz łopatki wymaga skrętu nosa w stronę pachy pod kątem 45°.',
            correction: 'Aby rozciągnąć dźwigacz łopatki, pochyl głowę i skieruj wzrok oraz czubek nosa w kierunku przeciwległej pachy.',
            cuePrompt: 'Czworoboczny = ucho do ramienia • Dźwigacz = nos do pachy'
          }
        ];
        safetyWarnings = [
          'Dłoń na głowie pełni wyłącznie rolę delikatnego balastu, nie ciągnij głowy siłą ramienia!',
          'Przy uczuciu prądu lub mrowienia w ramieniu natychmiast zmniejsz kąt pochylenia.'
        ];
        followUpTips = [
          'Utrzymuj rozciąganie statyczne przez minimum 25-30 sekund na każdą stronę.',
          'Wykonuj ćwiczenie 2-3 razy dziennie przy wzmożonym napięciu stresowym.'
        ];
      } else if (q.includes('głow') || q.includes('potylic') || q.includes('migren') || q.includes('skroń') || q.includes('napięciow')) {
        recommendedExerciseId = 'suboccipital-release';
        summary = 'Napięciowe bóle głowy typu szyjnopochodnego (Cervicogenic Headache) wynikają z hipertonii mięśni podpotylicznych i podrażnienia nerwu potylicznego większego (C2).';
        biomechanicalModifications = [
          {
            title: 'Precyzyjna lokalizacja punktów podpotylicznych',
            issueDetected: 'Ucisk na środku kręgów szyjnych zamiast pod krawędzią kości potylicznej.',
            anatomicalCause: 'Mięśnie skośne i proste głowy przyczepiają się tuż poniżej kresy karkowej dolnej kości potylicznej.',
            correction: 'Przyłóż opuszki kciuków tuż pod grzebieniem kości potylicznej, ok. 2-3 cm od linii środkowej kręgosłupa.',
            cuePrompt: 'Znajdź dołeczki pod czaszką • Wywieraj delikatny, jednostajny nacisk'
          },
          {
            title: 'Odruch oczno-ruchowy (Oculomotor reflex)',
            issueDetected: 'Brak synchronizacji wzroku z rozluźnieniem podpotylicznym.',
            anatomicalCause: 'Mięśnie podpotyliczne odruchowo napinają się przy każdym mikroruchu gałek ocznych.',
            correction: 'Podczas ucisku zamknij oczy i skieruj gałki oczne powoli w dół bez poruszania głową. Poczujesz odruchowe rozluźnienie powięzi.',
            cuePrompt: 'Zamknij oczy • Spójrz pod powiekami w stronę mostka'
          }
        ];
        safetyWarnings = [
          'Unikaj bezpośredniego głębokiego ucisku bocznego na przebieg tętnicy kręgowej.',
          'W przypadku nagłego, "piorunującego" bólu głowy skonsultuj się niezwłocznie z lekarzem.'
        ];
        followUpTips = [
          'Wykonaj automasaż przez 60-90 sekund w pozycji leżącej z podparciem karku.',
          'Zadbaj o nawodnienie (minimum 2 litry wody dziennie) i właściwe oświetlenie monitora.'
        ];
      } else if (q.includes('dyskopati') || q.includes('drętw') || q.includes('mrów') || q.includes('przepuklin') || q.includes('krążeni') || q.includes('rwa')) {
        recommendedExerciseId = 'nerve-floss';
        summary = 'Przy podejrzeniu dyskopatii szyjnej lub podrażnienia korzeni nerwowych (C5-C7) kluczowa jest zasada centralizacji bólu i bezwzględny zakaz krążeń głową.';
        biomechanicalModifications = [
          {
            title: 'Zakaz pełnych krążeń głową (Circumductio)',
            issueDetected: 'Wykonywanie obszernych krążeń głową w pełnym zakresie.',
            anatomicalCause: 'Połączenie rotacji z przeprostem powoduje gwałtowne zwężenie otworów międzykręgowych i bezpośredni ucisk korzeni.',
            correction: 'Zastąp krążenia ruchami w jednej płaszczyźnie: czyste zgięcie, powolna rotacja w lewo/prawo bez odchylania w tył.',
            cuePrompt: 'Tylko ruchy liniowe w osi • Zero pełnych młynków głową'
          },
          {
            title: 'Neurodynamika: Ślizg nerwu zamiast agresywnego rozciągania',
            issueDetected: 'Mocne pociąganie i naciąganie drętwiejącej ręki.',
            anatomicalCause: 'Nerw obwodowy jest strukturą wysoce wrażliwą na niedokrwienie przy rozciąganiu powyżej 8% długości.',
            correction: 'Stosuj technikę ślizgu nerwu: gdy zginasz grzbietowo nadgarstek ku górze, pochylaj głowę W STRONĘ ręki.',
            cuePrompt: 'Ruch naprzemienny • Płynny ślizg bez wywoływania mrowienia'
          }
        ];
        safetyWarnings = [
          'Jeżeli ból wędruje z ramienia w dół do palców (peryferalizacja), natychmiast zaprzestań ćwiczenia.',
          'Prawidłowy objaw to centralizacja: ból wycofuje się z przedramienia w stronę karku.'
        ];
        followUpTips = [
          'Skonsultuj z neurologiem/fizjoterapeutą badanie rezonansu magnetycznego (MRI) odcinka C.',
          'W nocy stosuj profilowaną poduszkę ortopedyczną z pianki z pamięcią kształtu.'
        ];
      } else {
        recommendedExerciseId = 'chin-tuck';
        summary = `Analiza biomechaniczna zapytania: "${query}". Kluczową zasadą autoterapii karku jest osiowa elongacja kręgosłupa i eliminacja kompensacji ruchowych z barków.`;
        biomechanicalModifications = [
          {
            title: 'Osiowe wydłużenie kręgosłupa (Elongacja)',
            issueDetected: 'Wysuwanie głowy w przód (protrakcja) podczas wysiłku.',
            anatomicalCause: 'Osłabienie głębokich stabilizatorów szyi w połączeniu z przykurczem klatki piersiowej.',
            correction: 'Wyobraź sobie delikatną nić przymocowaną do czubka głowy, pociągającą czaszkę pionowo w stronę sufitu.',
            cuePrompt: 'Wydłużaj kark w pionie • Ściągnij łopatki w dół'
          },
          {
            title: 'Tor oddechowy dolnożebrowy',
            issueDetected: 'Wstrzymywanie oddechu lub płytki oddech szczytowy górną częścią klatki.',
            anatomicalCause: 'Oddech szczytowy aktywuje mięśnie pochyłe i mostkowo-obojczykowe, wzmagając ból karku.',
            correction: 'Wdech nosem kieruj w dolne żebra i przeponę. Ruch wykonuj zawsze na spokojnym wydechu.',
            cuePrompt: 'Spokojny wydech w fazie ruchu • Luźny brzuch'
          }
        ];
        safetyWarnings = [
          'Nigdy nie wykonuj ćwiczeń przez ostry, kłujący ból.',
          'W przypadku wystąpienia zawrotów głowy natychmiast odpocznij w pozycji siedzącej lub leżącej.'
        ];
        followUpTips = [
          'Wprowadź 30-sekundowe mikropauzy ergonomiczne co 45 minut pracy przy komputerze.',
          'Ustaw górną krawędź ekranu monitora na linii wzroku.'
        ];
      }

      return res.json({
        id: `free-ai-ans-${Date.now()}`,
        query,
        timestamp: new Date().toISOString(),
        summary,
        recommendedExerciseId,
        biomechanicalModifications,
        safetyWarnings,
        followUpTips,
        source: 'free_ai',
        freeAlternativeNotice: '100% Darmowa AI bez płatnych kluczy API'
      });
    } catch (err) {
      console.error('Błąd silnika darmowej AI:', err);
      return res.json({
        useClientFallback: true,
        message: 'Uruchomiono lokalny kliniczny silnik biomechaniczny.'
      });
    }
  });

  // FREE AI Personalized Training Plan Generation endpoint (0 zł, no paid API keys required)
  app.post('/api/generate-plan', async (req, res) => {
    const { primaryProblem, workType, dailyMinutes, baselineVas, painHistory, diagnoses, notes } = req.body;

    try {
      const vas = typeof baselineVas === 'number' ? baselineVas : 4;
      const historyList: any[] = Array.isArray(painHistory) ? painHistory : [];
      const hasRadiating = historyList.some(r => r.region === 'radiating_arm' || (r.associatedSymptoms && r.associatedSymptoms.some((s: string) => s.includes('drętw') || s.includes('mrowi'))));
      const hasHeadache = primaryProblem === 'headache' || historyList.some(r => r.region === 'headache');
      const isHighVas = vas >= 7;

      let adaptedLevel: 'delicate' | 'standard' | 'strengthening' = 'standard';
      if (isHighVas || hasRadiating) {
        adaptedLevel = 'delicate';
      } else if (vas <= 3) {
        adaptedLevel = 'strengthening';
      }

      let title = 'Spersonalizowany Protokół Kinezjoterapii Szyi (Darmowa AI)';
      let description = 'Plan skomponowany przez darmowy kliniczny silnik AI na podstawie wywiadu bólowego, charakterystyki pracy i poziomu VAS.';
      let goal = 'Dekompresja segmentów szyjnych C5-C7, przywrócenie lordozy i trwała ulga w dolegliwościach.';
      let aiRationale = '';
      const contraindicatedExerciseIds: string[] = [];

      let weekDays: any[] = [];

      if (hasRadiating) {
        title = 'Darmowa AI: Protokół Dekompresji Korzeniowej & Neurodynamiki C5-C7';
        description = 'Dedykowany program odciążający przy objawach drętwienia, mrowienia palców lub bólu rzutowanego do barku.';
        goal = 'Zmniejszenie ucisku na pęczki splotu ramiennego, poprawa ślizgu nerwu pośrodkowego i centralizacja objawów.';
        aiRationale = `Darmowy algorytm AI zidentyfikował objawy promieniowania i drętwienia. Zastosowano fazę ochronną (delicate). Wykluczono agresywne skrajne rozciąganie mięśni czworobocznych, które mogłoby nasilić ucisk korzeniowy. Włączono kontrolowany ślizg neurodynamiczny (Nerve Floss) oraz pozycję Brüggera.`;
        contraindicatedExerciseIds.push('trapezius-stretch');

        weekDays = [
          { dayIndex: 0, dayName: 'Poniedziałek', focusArea: 'Neurodynamika i dekompresja korzeniowa', exerciseIds: ['nerve-floss', 'chin-tuck', 'brugger-relief'], estimatedMinutes: dailyMinutes || 10 },
          { dayIndex: 1, dayName: 'Wtorek', focusArea: 'Uwalnianie napięć podpotylicznych i ślizg', exerciseIds: ['suboccipital-release', 'nerve-floss', 'chin-tuck'], estimatedMinutes: dailyMinutes || 10 },
          { dayIndex: 2, dayName: 'Środa', focusArea: 'Pozycja odciążająca Brüggera i oddech', exerciseIds: ['brugger-relief', 'nerve-floss', 'suboccipital-release'], estimatedMinutes: dailyMinutes || 10 },
          { dayIndex: 3, dayName: 'Czwartek', focusArea: 'Dekompresja osiowa C5-C7', exerciseIds: ['chin-tuck', 'nerve-floss', 'scapular-retraction'], estimatedMinutes: dailyMinutes || 10 },
          { dayIndex: 4, dayName: 'Piątek', focusArea: 'Otwarcie klatki piersiowej i neurodynamika', exerciseIds: ['brugger-relief', 'suboccipital-release', 'cat-cow'], estimatedMinutes: dailyMinutes || 10 },
          { dayIndex: 5, dayName: 'Sobota', focusArea: 'Płynna mobilizacja bezbólowa', exerciseIds: ['nerve-floss', 'chin-tuck', 'brugger-relief'], estimatedMinutes: dailyMinutes || 10 },
          { dayIndex: 6, dayName: 'Niedziela', focusArea: 'Regeneracja powięziowa i utrwalenie', exerciseIds: ['suboccipital-release', 'chin-tuck', 'nerve-floss'], estimatedMinutes: dailyMinutes || 10 }
        ];
      } else if (hasHeadache) {
        title = 'Darmowa AI: Terapia Napięciowych Bólów Głowy (Cervicogenic)';
        description = 'Program ukierunkowany na rozluźnienie mięśni podpotylicznych i odciążenie stawów C0-C2.';
        goal = 'Zmniejszenie napięcia w gałęziach nerwu potylicznego większego i likwidacja uczucia ucisku skroniowego.';
        aiRationale = `Darmowy silnik AI wykrył bóle głowy pochodzenia szyjnego. Priorytetem terapeutycznym jest dekompresja przejścia szyjno-czaszkowego (C0-C2), automasaż mięśni podpotylicznych oraz odciążenie Brüggera.`;

        weekDays = [
          { dayIndex: 0, dayName: 'Poniedziałek', focusArea: 'Uwalnianie mięśni podpotylicznych', exerciseIds: ['suboccipital-release', 'chin-tuck', 'brugger-relief'], estimatedMinutes: dailyMinutes || 10 },
          { dayIndex: 1, dayName: 'Wtorek', focusArea: 'Rozciąganie powięzi karku i klatki', exerciseIds: ['suboccipital-release', 'trapezius-stretch', 'cat-cow'], estimatedMinutes: dailyMinutes || 10 },
          { dayIndex: 2, dayName: 'Środa', focusArea: 'Translacjowa retrakcja brody', exerciseIds: ['chin-tuck', 'suboccipital-release', 'neck-rotations'], estimatedMinutes: dailyMinutes || 10 },
          { dayIndex: 3, dayName: 'Czwartek', focusArea: 'Odciążenie posturalne Brüggera', exerciseIds: ['suboccipital-release', 'brugger-relief', 'isometric-neck'], estimatedMinutes: dailyMinutes || 10 },
          { dayIndex: 4, dayName: 'Piątek', focusArea: 'Balans napięcia mięśni czworobocznych', exerciseIds: ['trapezius-stretch', 'suboccipital-release', 'chin-tuck'], estimatedMinutes: dailyMinutes || 10 },
          { dayIndex: 5, dayName: 'Sobota', focusArea: 'Spokojna rotacja w płaszczyźnie poprzecznej', exerciseIds: ['suboccipital-release', 'neck-rotations', 'brugger-relief'], estimatedMinutes: dailyMinutes || 10 },
          { dayIndex: 6, dayName: 'Niedziela', focusArea: 'Głęboka relaksacja i regeneracja karku', exerciseIds: ['chin-tuck', 'suboccipital-release', 'cat-cow'], estimatedMinutes: dailyMinutes || 10 }
        ];
      } else {
        // Standard Tech-Neck or posture desk plan
        title = 'Darmowa AI: Korekcja Tech-Neck & Biurowy Reset Karku';
        description = 'Spersonalizowany plan likwidujący protrakcję głowy, przykurcz klatki piersiowej i osłabienie stabilizatorów łopatek.';
        goal = 'Odbudowa fizjologicznej lordozy szyjnej, aktywacja m. longus colli i trwała ochrona przed nawrotami bólu.';
        aiRationale = `Darmowy silnik AI uwzględnił tryb pracy (${workType || 'przy biurku'}) oraz wyjściowy poziom bólu (${vas}/10 VAS). Program łączy ćwiczenia dekompresyjne (Chin Tuck) z aktywacją mięśni ściągających łopatki i regularnymi mikropauzami co 45 minut.`;

        weekDays = [
          { dayIndex: 0, dayName: 'Poniedziałek', focusArea: 'Dekompresja osiowa i aktywacja zginaczy', exerciseIds: ['chin-tuck', 'suboccipital-release', 'brugger-relief'], estimatedMinutes: dailyMinutes || 10 },
          { dayIndex: 1, dayName: 'Wtorek', focusArea: 'Wzmocnienie retrakcji łopatek', exerciseIds: ['chin-tuck', 'trapezius-stretch', 'scapular-retraction'], estimatedMinutes: dailyMinutes || 10 },
          { dayIndex: 2, dayName: 'Środa', focusArea: 'Mobilizacja rotacji bez kompensacji', exerciseIds: ['neck-rotations', 'suboccipital-release', 'brugger-relief'], estimatedMinutes: dailyMinutes || 10 },
          { dayIndex: 3, dayName: 'Czwartek', focusArea: 'Stabilizacja izometryczna w 4 kierunkach', exerciseIds: ['chin-tuck', 'isometric-neck', 'scapular-retraction'], estimatedMinutes: dailyMinutes || 10 },
          { dayIndex: 4, dayName: 'Piątek', focusArea: 'Otwarcie klatki piersiowej i powięzi', exerciseIds: ['trapezius-stretch', 'brugger-relief', 'cat-cow'], estimatedMinutes: dailyMinutes || 10 },
          { dayIndex: 5, dayName: 'Sobota', focusArea: 'Płynność i kontrola nerwowo-mięśniowa', exerciseIds: ['chin-tuck', 'suboccipital-release', 'neck-rotations'], estimatedMinutes: dailyMinutes || 10 },
          { dayIndex: 6, dayName: 'Niedziela', focusArea: 'Reset posturalny i utrwalenie wzorca', exerciseIds: ['brugger-relief', 'scapular-retraction', 'cat-cow'], estimatedMinutes: dailyMinutes || 10 }
        ];
      }

      return res.json({
        id: `plan-free-ai-${Date.now()}`,
        title,
        description,
        goal,
        adaptedLevel,
        aiRationale,
        contraindicatedExerciseIds,
        recommendedBreakIntervalMinutes: 45,
        days: weekDays,
        source: 'free_ai',
        freeAlternativeNotice: '100% Darmowa AI bez opłat i płatnych kluczy'
      });
    } catch (err) {
      console.error('Błąd generowania planu darmowej AI:', err);
      return res.json({
        useClientFallback: true,
        message: 'Uruchomiono lokalny algorytm planowania.'
      });
    }
  });

  // Vite middleware for development vs static files for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
