import jsPDF from 'jspdf';
import { AppState } from './privacyStorage';
import { EXERCISES } from '../data/exercises';

/**
 * Generuje oficjalny raport PDF z pełną historią raportów bólu oraz podsumowaniem aktywności,
 * zoptymalizowany pod kątem wydruku i analizy przez Fizjoterapeutę / Kinezjoterapeutę.
 */
export function generatePhysiotherapistReportPdf(state: AppState): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // ==================== STRONA 1 ====================
  // Nagłówek dla Fizjoterapeuty
  doc.setFillColor(13, 148, 136); // Teal-600
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.text('KARTA FIZJOTERAPEUTYCZNA • HISTORIA BÓLU & AKTYWNOŚĆ', 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Raport kliniczny do wglądu Fizjoterapeuty / Kinezjoterapeuty • Moje Fizjo & FizjoSzyja', 14, 18);
  doc.text(`Wygenerowano: ${new Date().toLocaleDateString('pl-PL')} ${new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}`, pageWidth - 65, 18);

  y = 30;

  // Sekcja 1: Dane Pacjenta i Wywiad
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('1. METRYKA PACJENTA & PARAMETRY TERAPII', 14, y);
  y += 2;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(14, y, pageWidth - 14, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Pacjent: ${state.profile.name || 'Anonimowy pacjent'} (Rok ur.: ${state.profile.birthYear || 'Brak'})`, 14, y);
  doc.text(`Tryb pracy: ${state.activePlan.workType === 'desk' ? 'Siedząca / Biurko (Ryzyko Tech-Neck)' : 'Fizyczna / Mieszana'}`, 110, y);
  y += 4.5;

  doc.text(`Główny problem terapeutyczny: ${state.activePlan.title}`, 14, y);
  doc.text(`Ukończone sesje ćwiczeń: ${state.profile.totalCompletedSessions} (Ciągłość: ${state.profile.streakDays} dni)`, 110, y);
  y += 4.5;

  if (state.profile.notes) {
    doc.text(`Wywiad pacjenta / uwagi: ${state.profile.notes}`, 14, y, { maxWidth: pageWidth - 28 });
    y += 5;
  }

  y += 2;

  // Sekcja 2: Podsumowanie Aktywności i Skuteczności Kinezjoterapii
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('2. PODSUMOWANIE AKTYWNOŚCI & SKUTECZNOŚCI ĆWICZEŃ', 14, y);
  y += 2;
  doc.line(14, y, pageWidth - 14, y);
  y += 5;

  const completedDays = state.activePlan.days.filter(d => d.completed);
  const completedWithVas = completedDays.filter(d => d.prePainVas !== undefined);

  const avgPre = completedWithVas.length > 0 
    ? (completedWithVas.reduce((acc, d) => acc + (d.prePainVas || 0), 0) / completedWithVas.length).toFixed(1)
    : '-';
  const avgPost = completedWithVas.length > 0
    ? (completedWithVas.reduce((acc, d) => acc + (d.postPainVas || 0), 0) / completedWithVas.length).toFixed(1)
    : '-';
  const diffVas = completedWithVas.length > 0
    ? (Number(avgPre) - Number(avgPost)).toFixed(1)
    : '0';

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Średni ból przed sesją: ${avgPre}/10 VAS   |   Średni ból po sesji: ${avgPost}/10 VAS   |   Doraźna ulga po ćwiczeniach: -${diffVas} VAS`, 14, y);
  y += 4.5;

  const microBreaksCount = state.profile.completedMicroBreaksCount || 0;
  doc.text(`Zrealizowane mikropauzy biurowe (Smart Micro-Breaks): ${microBreaksCount}   |   Adaptacja planu: ${state.activePlan.adaptedLevel || 'standard'}`, 14, y);
  y += 5;

  // Sekcja 3: Historia Zgłoszeń Bólowych (Tabela / Szczegółowe zestawienie)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('3. SZCZEGÓŁOWA HISTORIA ZGŁOSZEŃ BÓLOWYCH (DZIENNIK BÓLU)', 14, y);
  y += 2;
  doc.line(14, y, pageWidth - 14, y);
  y += 5;

  if (state.painHistory.length > 0) {
    const reports = state.painHistory.slice(-5).reverse(); // 5 najnowszych

    reports.forEach((rep, idx) => {
      const dateStr = new Date(rep.date).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      const regionPl = rep.region === 'neck' ? 'Szyja' : rep.region === 'nape' ? 'Kark/Potylica' : rep.region === 'radiating_arm' ? 'Promieniowanie do ręki' : rep.region === 'shoulder_blade' ? 'Międzyłopatkowy' : 'Głowa';
      const charPl = rep.character === 'sharp' ? 'Ostry' : rep.character === 'stiff' ? 'Sztywność' : rep.character === 'dull' ? 'Tępy' : rep.character === 'burning' ? 'Piekący' : rep.character;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text(`[${idx + 1}] ${dateStr} • Poziom bólu: ${rep.vasScore}/10 VAS (${regionPl}, charakter: ${charPl})`, 16, y);
      y += 4;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`Ocena: ${rep.aiAnalysis?.primarySuspicion || 'Wpis do dziennika bólu'}`, 20, y);
      y += 3.8;

      const triggerStr = rep.triggers && rep.triggers.length > 0 ? rep.triggers.join(', ') : 'Praca biurowa';
      doc.text(`Czynniki wyzwalające: ${triggerStr}`, 20, y);
      y += 3.8;

      if (rep.stressLevel !== undefined || rep.mood || rep.psychosomaticNotes || rep.sessionNotes) {
        const moodPl = rep.mood === 'calm' ? 'Spokojny' : rep.mood === 'tense' ? 'Napięty' : rep.mood === 'fatigued' ? 'Zmęczony' : (rep.mood || '-');
        const psNote = rep.sessionNotes ? ` (Uwagi do ćwiczeń: "${rep.sessionNotes}")` : rep.psychosomaticNotes ? ` ("${rep.psychosomaticNotes}")` : '';
        doc.text(`Czynniki psychosomatyczne: Stres: ${rep.stressLevel ?? '-'}/10, Nastrój: ${moodPl}${psNote}`, 20, y);
        y += 3.8;
      }

      y += 2;
    });
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text('Brak zarejestrowanych incydentów bólowych w wybranym okresie.', 14, y);
    y += 5;
  }

  y += 2;

  // Sekcja 4: Zrealizowane Treningi i Dni Planu
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('4. REJESTR ZREALIZOWANYCH SESJI W PLANIE TERAPEUTYCZNYM', 14, y);
  y += 2;
  doc.line(14, y, pageWidth - 14, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  const completedPlanDays = state.activePlan.days.filter(d => d.completed);
  if (completedPlanDays.length > 0) {
    completedPlanDays.slice(0, 4).forEach((d) => {
      const exNames = EXERCISES.filter(e => d.exerciseIds.includes(e.id)).map(e => e.polishName).join(', ');
      doc.text(`• ${d.dayName} (${d.focusArea}) - Czas: ~${d.estimatedMinutes} min | Ćwiczenia: ${exNames}`, 16, y, { maxWidth: pageWidth - 28 });
      y += 4;
      if (d.prePainVas !== undefined && d.postPainVas !== undefined) {
        doc.text(`  Ból przed: ${d.prePainVas}/10 VAS -> po sesji: ${d.postPainVas}/10 VAS (spadek o ${d.prePainVas - d.postPainVas} pkt)`, 20, y);
        y += 4;
      }
    });
  } else {
    doc.text('Plan w trakcie realizacji - brak ukończonych pełnych sesji w bieżącym cyklu.', 16, y);
    y += 5;
  }

  // Footer Strona 1
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Strona 1 z 2 • Raport Historii Bólu i Aktywności Pacjenta • Moje Fizjo', 14, 288);
  doc.text('Dokument gotowy do wydruku / konsultacji stacjonarnej', pageWidth - 80, 288);

  // ==================== STRONA 2 ====================
  doc.addPage();
  y = 18;

  // Header Banner Strona 2
  doc.setFillColor(13, 148, 136);
  doc.rect(0, 0, pageWidth, 16, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('KARTA FIZJOTERAPEUTYCZNA • DIAGNOSTYKA RUCHOMOŚCI I ZALECENIA', 14, 11);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Pacjent: ${state.profile.name || 'Anonimowy pacjent'}`, pageWidth - 60, 11);

  y = 26;

  // Sekcja 5: Zakresy Ruchomości Szyi (CROM) & Posturometria CVA
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('5. BADANIE ZAKRESÓW RUCHU (CROM) & POSTUROMETRIA PROTRAKCJI (CVA)', 14, y);
  y += 2;
  doc.line(14, y, pageWidth - 14, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  const tests = state.profile.mobilityTests;
  if (tests && tests.length > 0) {
    const latest = tests[0];
    const initial = tests[tests.length - 1];

    doc.text(`Rotacja głowy w lewo: ${latest.neckRotationLeftDeg}° (Norma: 70°-90°, Początkowo: ${initial.neckRotationLeftDeg}°)`, 14, y);
    doc.text(`Rotacja w prawo: ${latest.neckRotationRightDeg}° (Norma: 70°-90°, Początkowo: ${initial.neckRotationRightDeg}°)`, 110, y);
    y += 4.5;
    doc.text(`Odległość broda-mostek (skłon): ${latest.neckFlexionCm} cm (Norma: 0-2 cm, Początkowo: ${initial.neckFlexionCm} cm)`, 14, y);
    doc.text(`Wyprost szyjny w tył: ${latest.neckExtensionDeg}° (Norma: 50°-70°, Początkowo: ${initial.neckExtensionDeg}°)`, 110, y);
    y += 4.5;
    const asymmetry = Math.abs(latest.neckRotationLeftDeg - latest.neckRotationRightDeg);
    if (asymmetry > 10) {
      doc.setTextColor(185, 28, 28);
      doc.text(`Uwaga: Stwierdzono asymetrię rotacji osiowej C1-C2 wynoszącą ${asymmetry}° (możliwe zablokowanie stawów międzywyrostkowych).`, 14, y);
      doc.setTextColor(30, 41, 59);
      y += 4.5;
    }
  } else {
    doc.text('Brak wprowadzonych pomiarów goniometrycznych CROM.', 14, y);
    y += 4.5;
  }

  const postureReports = state.painHistory.filter(p => p.postureTiltAngleDeg !== undefined);
  if (postureReports.length > 0) {
    const pRep = postureReports[0];
    const angle = pRep.postureTiltAngleDeg!;
    const loadKg = Math.round(5 + (angle / 60) * 22);
    doc.text(`Analiza fotograficzna kąta CVA: ${angle}° (${pRep.postureDiagnosis || 'Protrakcja'}). Szacowany nacisk kompresyjny: ~${loadKg} kg (w osi: ~5 kg).`, 14, y);
    y += 5;
  }

  y += 2;

  // Sekcja 6: Ergonomia i Czynniki Bio-Psycho-Społeczne (BPS)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('6. ERGONOMIA STANOWISKA PRACY (DIN EN 527) & CZYNNIKI BPS', 14, y);
  y += 2;
  doc.line(14, y, pageWidth - 14, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  const audit = state.profile.ergonomicAudit;
  if (audit) {
    doc.text(`Wysokość blatu: ${audit.currentDeskHeightCm} cm (Zalecana wg DIN EN 527: ${audit.recommendedSittingDeskHeightCm} cm) | Monitor: ${audit.monitorSetup === 'laptop_flat' ? 'Laptop płasko (Wysokie ryzyko)' : 'Na wysokości oczu'}`, 14, y);
    y += 4.5;
  }

  const bpsLogs = state.profile.bpsLogs;
  if (bpsLogs && bpsLogs.length > 0) {
    const b = bpsLogs[bpsLogs.length - 1];
    doc.text(`Stres: ${b.stressLevel}/10 | Bruksizm (zaciskanie zębów): ${b.bruxismTension ? 'TAK' : 'NIE'} | Pozycja snu: ${b.sleepingPosition === 'back' ? 'Na plecach' : b.sleepingPosition === 'side' ? 'Na boku' : 'Na brzuchu'}`, 14, y);
    y += 5;
  } else {
    doc.text('Brak wpisów w dzienniku czynników psychosomatycznych BPS.', 14, y);
    y += 5;
  }

  y += 2;

  // Sekcja 7: Karta Zaleceń Fizjoterapeuty (Dedykowane miejsce do wydruku i wypełnienia)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('7. ZALECENIA FIZJOTERAPEUTY I PLAN DALSZEJ REHABILITACJI', 14, y);
  y += 2;
  doc.line(14, y, pageWidth - 14, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('1. Wnioski z badania manualnego i palpacji (punkty spustowe m. trapezius, scaleni, suboccipitales):', 14, y);
  y += 3.5;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, y + 4, pageWidth - 14, y + 4);
  doc.line(14, y + 9, pageWidth - 14, y + 9);
  y += 13;

  doc.text('2. Zalecane modyfikacje ćwiczeń domowych (dozwolone / zabronione):', 14, y);
  y += 3.5;
  doc.line(14, y + 4, pageWidth - 14, y + 4);
  doc.line(14, y + 9, pageWidth - 14, y + 9);
  y += 13;

  doc.text('3. Zalecany termin wizyty kontrolnej / terapii manualnej:', 14, y);
  y += 3.5;
  doc.line(14, y + 4, pageWidth - 14, y + 4);
  y += 12;

  // Podpis i pieczęć Fizjoterapeuty
  y = Math.max(y, 235);
  doc.setDrawColor(148, 163, 184);
  doc.setLineDashPattern([1, 1], 0);
  doc.line(14, y, 90, y);
  doc.line(120, y, pageWidth - 14, y);
  doc.setLineDashPattern([], 0);
  y += 4;

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Data, podpis i pieczęć Fizjoterapeuty', 14, y);
  doc.text('Podpis Pacjenta (zapoznałem się z zaleceniami)', 120, y);

  // Stopka Strona 2
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Strona 2 z 2 • Wygenerowano w aplikacji "FizjoSzyja & Kręgosłup". Zgodność z RODO / 100% On-Device Privacy.', 14, 288);

  // Trigger download
  doc.save(`Raport_Fizjoterapeuta_HistoriaBolu_i_Aktywnosc_${new Date().toISOString().split('T')[0]}.pdf`);
}

export function generateDoctorMedicalPdf(state: AppState): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // ==================== STRONA 1 ====================

  // Header Banner
  doc.setFillColor(15, 23, 42); // Slate-900
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('KARTA PRZEBIEGU REHABILITACJI KRĘGOSŁUPA I SZYI', 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Dokumentacja pacjenta do wglądu Lekarza POZ / Ortopedy / Neurologa / Fizjoterapeuty (Moje Fizjo)', 14, 18);
  doc.text(`Data: ${new Date().toLocaleDateString('pl-PL')}`, pageWidth - 45, 18);

  y = 30;

  // Section 1: Patient Data
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('1. DANE PACJENTA I WYWIAD KLINICZNY', 14, y);
  y += 2;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(14, y, pageWidth - 14, y);
  y += 5.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Pacjent: ${state.profile.name || 'Anonimowy pacjent'} (Rok ur.: ${state.profile.birthYear || 'Brak'})`, 14, y);
  doc.text(`Tryb pracy: ${state.activePlan.workType === 'desk' ? 'Biurowa / Praca przy komputerze' : 'Fizyczna / Mieszana'}`, 110, y);
  y += 4.5;

  doc.text(`Główny problem: ${state.activePlan.title}`, 14, y);
  doc.text(`Ukończone sesje rehabilitacyjne: ${state.profile.totalCompletedSessions} (Ciągłość: ${state.profile.streakDays} dni)`, 110, y);
  y += 4.5;

  if (state.profile.notes) {
    doc.text(`Uwagi pacjenta: ${state.profile.notes}`, 14, y);
    y += 4.5;
  }

  y += 3;

  // Section 2: Pain VAS Dynamic
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('2. DYNAMIKA BÓLU (SKALA ANALOGOWA VAS 0-10)', 14, y);
  y += 2;
  doc.line(14, y, pageWidth - 14, y);
  y += 5.5;

  const completedDays = state.activePlan.days.filter(d => d.completed && d.prePainVas !== undefined);
  const avgPre = completedDays.length > 0 
    ? (completedDays.reduce((acc, d) => acc + (d.prePainVas || 0), 0) / completedDays.length).toFixed(1)
    : 'Brak';
  const avgPost = completedDays.length > 0
    ? (completedDays.reduce((acc, d) => acc + (d.postPainVas || 0), 0) / completedDays.length).toFixed(1)
    : 'Brak';

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Średni ból przed sesją: ${avgPre} / 10 VAS   |   Średni ból bezpośrednio po ćwiczeniach: ${avgPost} / 10 VAS`, 14, y);
  y += 4.5;

  if (state.painHistory.length > 0) {
    doc.text('Ostatnie zgłoszone epizody bólowe z analizą kinezjologiczną:', 14, y);
    y += 4.5;
    state.painHistory.slice(-3).forEach((rep) => {
      const dateStr = new Date(rep.date).toLocaleDateString('pl-PL');
      const regionPl = rep.region === 'neck' ? 'Szyja' : rep.region === 'nape' ? 'Kark/Potylica' : rep.region === 'radiating_arm' ? 'Promieniowanie do ręki' : 'Kręgosłup';
      doc.setFont('helvetica', 'bold');
      doc.text(`• ${dateStr} - Ból: ${rep.vasScore}/10 VAS (${regionPl})`, 18, y);
      y += 3.8;
      doc.setFont('helvetica', 'normal');
      doc.text(`  Ocena: ${rep.aiAnalysis.primarySuspicion}`, 22, y);
      y += 3.8;
      if (rep.stressLevel !== undefined || rep.mood || rep.sessionNotes || rep.psychosomaticNotes) {
        const moodLabel = rep.mood === 'calm' ? 'Spokojny' : rep.mood === 'relaxed' ? 'Zrelaksowany' : rep.mood === 'tense' ? 'Spiety' : rep.mood === 'fatigued' ? 'Zmeczony' : rep.mood === 'exhausted' ? 'Wyczerpany' : (rep.mood || 'Neutralny');
        const noteStr = rep.sessionNotes ? ` - Uwagi do ćwiczeń: "${rep.sessionNotes}"` : rep.psychosomaticNotes ? ` - "${rep.psychosomaticNotes}"` : '';
        doc.text(`  Czynniki psychosomatyczne: Stres: ${rep.stressLevel ?? '-'}/10, Nastrój: ${moodLabel}${noteStr}`, 22, y);
        y += 3.8;
      }
    });
  } else {
    doc.text('Brak zarejestrowanych ostrych incydentów bólowych w wybranym okresie.', 14, y);
    y += 4.5;
  }

  y += 3;

  // Section 3: Cervical Range of Motion (CROM)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('3. TESTY RUCHOMOŚCI ODCINKA SZYJNEGO (ZAKRESY STOPNIOWE CROM)', 14, y);
  y += 2;
  doc.line(14, y, pageWidth - 14, y);
  y += 5.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  const tests = state.profile.mobilityTests;
  if (tests && tests.length > 0) {
    const latest = tests[0];
    const initial = tests[tests.length - 1];

    doc.text(`Rotacja głowy w lewo: ${latest.neckRotationLeftDeg}° (Norma kliniczna: 70°-90°, Początkowo: ${initial.neckRotationLeftDeg}°)`, 14, y);
    doc.text(`Rotacja w prawo: ${latest.neckRotationRightDeg}° (Norma: 70°-90°, Początkowo: ${initial.neckRotationRightDeg}°)`, 110, y);
    y += 4.5;
    doc.text(`Odległość broda-mostek (zgięcie): ${latest.neckFlexionCm} cm (Norma: 0-2 cm, Początkowo: ${initial.neckFlexionCm} cm)`, 14, y);
    doc.text(`Wyprost szyjny: ${latest.neckExtensionDeg}° (Norma: 50°-70°, Początkowo: ${initial.neckExtensionDeg}°)`, 110, y);
    y += 4.5;
    const asymmetry = Math.abs(latest.neckRotationLeftDeg - latest.neckRotationRightDeg);
    if (asymmetry > 10) {
      doc.setTextColor(185, 28, 28);
      doc.text(`Uwaga kinezjologiczna: Stwierdzono asymetrię rotacji osiowej C1-C2 wynoszącą ${asymmetry}° (podejrzenie jednostronnego bloku czynnościowego).`, 14, y);
      doc.setTextColor(30, 41, 59);
      y += 4.5;
    }
  } else {
    doc.text('Brak zarejestrowanych testów CROM w wybranym okresie.', 14, y);
    y += 4.5;
  }

  y += 3;

  // Section 4: Posture Camera & Desk Guardian Telemetry
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('4. POSTUROMETRIA WIZYJNA & MONITOROWANIE BIURKOWE (TECH-NECK)', 14, y);
  y += 2;
  doc.line(14, y, pageWidth - 14, y);
  y += 5.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  const postureReports = state.painHistory.filter(p => p.postureTiltAngleDeg !== undefined);
  if (postureReports.length > 0) {
    const latestPosture = postureReports[0];
    const angle = latestPosture.postureTiltAngleDeg!;
    const loadKg = Math.round(5 + (angle / 60) * 22);
    doc.text(`Zmierzony kąt protrakcji głowy (CVA): ${angle}° (${latestPosture.postureDiagnosis || 'Wychylenie w przód'})`, 14, y);
    doc.text(`Szacowany nacisk kompresyjny na C5-C7: ~${loadKg} kg (Fizjologicznie w osi: ~5 kg)`, 110, y);
    y += 4.5;
    doc.text(`Zarejestrowana data pomiaru: ${latestPosture.date} (Analiza oparta na detekcji linii ucho-bark ze zdjęcia).`, 14, y);
    y += 4.5;
  } else {
    doc.text('Ocena posturograficzna kamerowa: brak zapisanego pomiaru CVA w profilu.', 14, y);
    y += 4.5;
  }

  // Footer Page 1
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Strona 1 z 2 • Karta Wywiadu i Diagnostyki Narządu Ruchu • Moje Fizjo', 14, 288);
  doc.text('Dane lokalne pacjenta (Zero-Knowledge)', pageWidth - 70, 288);

  // ==================== STRONA 2 ====================
  doc.addPage();
  y = 18;

  // Header Banner Page 2
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 16, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('KARTA REHABILITACJI SZYI • STRONA 2 (AUDYT ERGONOMII & ZALECENIA)', 14, 11);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Pacjent: ${state.profile.name || 'Anonimowy pacjent'}`, pageWidth - 60, 11);

  y = 26;

  // Section 5: Workstation Ergonomics Audit
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('5. AUDYT ERGONOMICZNY STANOWISKA PRACY (PN-EN ISO 9241-5 & DIN EN 527)', 14, y);
  y += 2;
  doc.line(14, y, pageWidth - 14, y);
  y += 5.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  const audit = state.profile.ergonomicAudit;
  if (audit) {
    doc.text(`Wzrost pacjenta: ${audit.userHeightCm} cm  |  Tryb pracy: ${audit.workMode === 'sit_stand' ? 'Biurko regulowane Sit-Stand' : 'Praca siedząca'}`, 14, y);
    doc.text(`Wskaźnik bezpieczeństwa stanowiska: ${audit.calculatedRiskScore}%`, 130, y);
    y += 4.5;
    doc.text(`Wysokość blatu: ${audit.currentDeskHeightCm} cm (Zalecana DIN EN 527: ${audit.recommendedSittingDeskHeightCm} cm siedząc / ${audit.recommendedStandingDeskHeightCm} cm stojąc)`, 14, y);
    y += 4.5;
    doc.text(`Konfiguracja ekranu: ${audit.monitorSetup === 'laptop_flat' ? 'Laptop płasko na blacie (DUŻE RYZYKO)' : 'Monitor na wysokości oczu'}`, 14, y);
    doc.text(`Odległość ekranu: ${audit.screenDistanceCm} cm`, 130, y);
    y += 4.5;
    if (audit.recommendations.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Kluczowe zalecenia korekty stanowiska pracy:', 14, y);
      y += 4;
      doc.setFont('helvetica', 'normal');
      audit.recommendations.slice(0, 3).forEach((rec) => {
        doc.text(`• ${rec}`, 18, y, { maxWidth: pageWidth - 32 });
        y += 4.5;
      });
    }
  } else {
    doc.text('Audyt stanowiska pracy: Stanowisko nie zostało jeszcze zbadane w module kalkulatora ergonomii.', 14, y);
    y += 4.5;
  }

  y += 3;

  // Section 6: Biopsychosocial Factors (BPS)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('6. CZYNNIKI BIO-PSYCHO-SPOŁECZNE & HIGIENA SNU (BPS)', 14, y);
  y += 2;
  doc.line(14, y, pageWidth - 14, y);
  y += 5.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  const bpsLogs = state.profile.bpsLogs;
  if (bpsLogs && bpsLogs.length > 0) {
    const latestBps = bpsLogs[bpsLogs.length - 1];
    doc.text(`Średni poziom stresu: ${latestBps.stressLevel}/10   |   Zaciskanie zębów (bruksizm): ${latestBps.bruxismTension ? 'TAK (potencjalna przyczyna napięć podpotylicznych)' : 'NIE'}`, 14, y);
    y += 4.5;
    const posPl = latestBps.sleepingPosition === 'back' ? 'Na plecach (neutralna)' : latestBps.sleepingPosition === 'side' ? 'Na boku' : 'Na brzuchu (przeciwwskazana - rotacja C1-C2)';
    doc.text(`Pozycja snu: ${posPl}   |   Poduszka: ${latestBps.pillowType === 'orthopedic_memory_foam' ? 'Ortopedyczna z pianki z pamięcią' : latestBps.pillowType}`, 14, y);
    y += 4.5;
    doc.text(`Godziny przed ekranami: ${latestBps.screenHours}h/dzień   |   Nawodnienie: ${latestBps.hydrationGlasses} szklanek wody/dzień`, 14, y);
    y += 4.5;
  } else {
    doc.text('Brak wpisów w dzienniku BPS w wybranym okresie.', 14, y);
    y += 4.5;
  }

  y += 3;

  // Section 7: Implemented Exercises Program
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('7. REALIZOWANY PROGRAM ĆWICZEŃ REHABILITACYJNYCH', 14, y);
  y += 2;
  doc.line(14, y, pageWidth - 14, y);
  y += 5.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  const currentPlanExIds = Array.from(new Set(state.activePlan.days.flatMap(d => d.exerciseIds)));
  const exercisesInPlan = EXERCISES.filter(e => currentPlanExIds.includes(e.id));

  exercisesInPlan.slice(0, 6).forEach((ex) => {
    doc.text(`• ${ex.polishName} (tempo: ${ex.tempo}, czas izometrii: ${ex.defaultHoldSeconds}s) - Cel: ${ex.targetMuscles[0]}`, 18, y);
    y += 4;
  });

  y += 3;

  // Section 8: Clinical Screening & Red Flags
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('8. WNIOSKI ALGORYTMU KLINICZNEGO & CZERWONE FLAGI', 14, y);
  y += 2;
  doc.line(14, y, pageWidth - 14, y);
  y += 5.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  const hasRedFlags = state.painHistory.some(r => r.aiAnalysis.redFlagsDetected.length > 0);
  if (hasRedFlags) {
    doc.setTextColor(185, 28, 28);
    doc.setFont('helvetica', 'bold');
    doc.text('UWAGA: W historii pacjenta odnotowano zgłoszenia z czerwonymi flagami. Wskazana pilna konsultacja medyczna!', 14, y);
    y += 4.5;
    doc.setFont('helvetica', 'normal');
  } else {
    doc.setTextColor(22, 101, 52); // Green
    doc.text('Przesiew czerwonych flag: BRAK. Brak objawów ubytkowych, mielopatycznych i zaburzeń zwieraczy.', 14, y);
    y += 4.5;
  }

  doc.setTextColor(30, 41, 59);
  doc.text('Zalecenia kinezjoterapeutyczne: Kontynuacja ćwiczeń retrakcji brody (chin-tuck), trening oddechu przeponowego 4-7-8 oraz mikroprzerwy co 25-30 min.', 14, y, { maxWidth: pageWidth - 28 });
  y += 7;

  // Section 9: Medications
  if (state.medications.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('9. PRZYJMOWANE LEKI I SUPLEMENTY:', 14, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    state.medications.forEach(m => {
      doc.text(`- ${m.name}: ${m.dosage} (${m.frequency})`, 18, y);
      y += 3.5;
    });
    y += 4;
  }

  // Doctor Signature Block
  y = Math.max(y, 235);
  doc.setDrawColor(148, 163, 184);
  doc.setLineDashPattern([1, 1], 0);
  doc.line(14, y, 90, y);
  doc.line(120, y, pageWidth - 14, y);
  doc.setLineDashPattern([], 0);
  y += 4;

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Podpis i pieczęć Fizjoterapeuty / Lekarza', 14, y);
  doc.text('Zalecenia i dalsze postępowanie medyczne', 120, y);

  // Footer Page 2
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Strona 2 z 2 • Wygenerowano w aplikacji "FizjoSzyja & Kręgosłup - Moje Fizjo". 100% On-Device Zero-Knowledge Privacy.', 14, 288);

  // Trigger download
  doc.save(`Karta_Rehabilitacji_Kregoslupa_${new Date().toISOString().split('T')[0]}.pdf`);
}

/**
 * Generates an official, comprehensive clinical PDF report detailing recent sessions and pain history.
 * Returns the jsPDF document instance.
 */
export function buildSessionAndPainReportPdfDoc(state: AppState): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // ==================== STRONA 1: RAPORT KLINICZNY ====================
  // Header Banner
  doc.setFillColor(13, 148, 136); // Teal-600
  doc.rect(0, 0, pageWidth, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('RAPORT KLINICZNY • WYNIKI SESJI & HISTORIA BOLU', 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Aplikacja FizjoSzyja & Moje Fizjo • Kinezjologia i Fizjoterapia Odcinka Szyjnego', 14, 18);
  doc.text(`Data generacji: ${new Date().toLocaleDateString('pl-PL')} ${new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}`, pageWidth - 70, 18);

  y = 33;

  // 1. Metryka Pacjenta & Status Terapii
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('1. METRYKA PACJENTA & PARAMETRY REHABILITACJI', 14, y);
  y += 2.5;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(14, y, pageWidth - 14, y);
  y += 5.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Pacjent: ${state.profile.name || 'Anonimowy pacjent'} (Rok urodzenia: ${state.profile.birthYear || 'Brak'})`, 14, y);
  doc.text(`Tryb pracy: ${state.activePlan.workType === 'desk' ? 'Biurowa / Praca przed monitorem' : 'Fizyczna / Zmienna'}`, 110, y);
  y += 4.5;

  const goalTitle = state.profile.primaryGoal === 'tech_neck'
    ? 'Korekta Tech-Neck i odciazenie karku'
    : state.profile.primaryGoal === 'discopathy'
    ? 'Dyskopedia i dekompresja korzeniowa'
    : state.profile.primaryGoal === 'tension_headache'
    ? 'Odciecie napiec podpotylicznych i glowy'
    : 'Profilaktyka posturalna i mobilnosc';

  doc.text(`Glowny cel terapeutyczny: ${goalTitle}`, 14, y);
  doc.text(`Ukonczone sesje: ${state.profile.totalCompletedSessions} (Ciaglosc: ${state.profile.streakDays} dni)`, 110, y);
  y += 4.5;

  if (state.profile.notes) {
    doc.text(`Wywiad / Uwagi pacjenta: ${state.profile.notes}`, 14, y, { maxWidth: pageWidth - 28 });
    y += 5;
  }
  y += 3;

  // 2. Ostatnie Wyniki Sesji Rehabilitacyjnych
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('2. OSTATNIE WYNIKI SESJI REHABILITACYJNYCH & OCENA SKUTECZNOSCI', 14, y);
  y += 2.5;
  doc.line(14, y, pageWidth - 14, y);
  y += 5.5;

  const completedDays = state.activePlan.days.filter(d => d.completed);
  const completedWithVas = completedDays.filter(d => d.prePainVas !== undefined);

  const avgPre = completedWithVas.length > 0 
    ? (completedWithVas.reduce((acc, d) => acc + (d.prePainVas || 0), 0) / completedWithVas.length).toFixed(1)
    : '-';
  const avgPost = completedWithVas.length > 0
    ? (completedWithVas.reduce((acc, d) => acc + (d.postPainVas || 0), 0) / completedWithVas.length).toFixed(1)
    : '-';
  const avgRelief = completedWithVas.length > 0
    ? (Number(avgPre) - Number(avgPost)).toFixed(1)
    : '0';

  // KPI Summary Card in PDF
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 14, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Sredni bol przed sesja: ${avgPre}/10 VAS`, 18, y + 6);
  doc.text(`Sredni bol po sesji: ${avgPost}/10 VAS`, 80, y + 6);
  doc.setTextColor(13, 148, 136);
  doc.text(`Dorazna ulga po cwiczeniach: -${avgRelief} VAS`, 140, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Zrealizowane mikropauzy biurowe: ${state.profile.completedMicroBreaksCount || 0}   |   Adaptacja planu: ${state.activePlan.adaptedLevel || 'standard'}`, 18, y + 11);
  y += 18;

  // Recent Sessions Listing
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text('Wykaz ostatnich zrealizowanych sesji treningowych:', 14, y);
  y += 4;

  if (completedDays.length > 0) {
    // Header for mini table
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, pageWidth - 28, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('Dzien / Data', 18, y + 4);
    doc.text('Protokol / Tytul', 46, y + 4);
    doc.text('Czas', 105, y + 4);
    doc.text('Pre-VAS', 122, y + 4);
    doc.text('Post-VAS', 142, y + 4);
    doc.text('Ulga', 165, y + 4);
    y += 7;

    const recentSessions = completedDays.slice(-4).reverse();
    recentSessions.forEach((session, idx) => {
      const dateStr = session.completedAt 
        ? new Date(session.completedAt).toLocaleDateString('pl-PL')
        : (session.dayName || `Dzien ${session.dayIndex + 1}`);
      
      const pre = session.prePainVas !== undefined ? `${session.prePainVas}/10` : '-';
      const post = session.postPainVas !== undefined ? `${session.postPainVas}/10` : '-';
      const reliefVal = session.prePainVas !== undefined && session.postPainVas !== undefined
        ? `-${session.prePainVas - session.postPainVas}`
        : '-';

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);

      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y - 2, pageWidth - 28, 6, 'F');
      }

      doc.text(dateStr, 18, y + 2);
      doc.text((session.focusArea || session.dayName).substring(0, 32), 46, y + 2);
      doc.text(`${session.estimatedMinutes} min`, 105, y + 2);
      doc.text(pre, 122, y + 2);
      doc.text(post, 142, y + 2);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(13, 148, 136);
      doc.text(reliefVal, 165, y + 2);
      y += 6;

      if (session.sessionNotes) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text(`   Uwagi pacjenta: "${session.sessionNotes.substring(0, 85)}"`, 18, y + 1);
        y += 4.5;
      }
    });
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Brak ukonczonych sesji w biezacym planie. Wykonaj pierwsza sesje w module Cwiczen.', 18, y + 2);
    y += 7;
  }

  y += 4;

  // 3. Szczegółowa Historia Zgłoszeń Bólu (Dziennik Bólu)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(30, 41, 59);
  doc.text('3. SZCZEGOLOWA HISTORIA ZGLOSZEN BOLOWYCH (DZIENNIK BOLU)', 14, y);
  y += 2.5;
  doc.line(14, y, pageWidth - 14, y);
  y += 5.5;

  if (state.painHistory.length > 0) {
    // Header for pain table
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, pageWidth - 28, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('Data i godzina', 18, y + 4);
    doc.text('VAS', 56, y + 4);
    doc.text('Lokalizacja / Charakter', 75, y + 4);
    doc.text('Czynniki wyzwalajace / Ulga', 130, y + 4);
    y += 7;

    const recentPain = state.painHistory.slice(-5).reverse();
    recentPain.forEach((rep, idx) => {
      const dateFormatted = new Date(rep.date).toLocaleDateString('pl-PL') + ' ' + 
        new Date(rep.date).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
      
      const regionPl = rep.region === 'neck' ? 'Szyja' : rep.region === 'nape' ? 'Kark/Potylica' : rep.region === 'radiating_arm' ? 'Promieniowanie do reki' : 'Kregoslup';
      const charPl = rep.character === 'sharp' ? 'Ostry' : rep.character === 'stiff' ? 'Sztywnosc' : rep.character === 'burning' ? 'Pieczenie' : 'Tepy';

      const triggersPl = rep.triggers.slice(0, 2).join(', ') || 'Brak specyficznych';
      const reliefPl = rep.reliefPositions.slice(0, 1).join('') || 'Cofanie brody';

      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y - 2, pageWidth - 28, 6.5, 'F');
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);
      doc.text(dateFormatted, 18, y + 2.5);

      // Color-coded VAS badge in text
      doc.setFont('helvetica', 'bold');
      if (rep.vasScore <= 3) {
        doc.setTextColor(22, 101, 52);
      } else if (rep.vasScore <= 6) {
        doc.setTextColor(180, 83, 9);
      } else {
        doc.setTextColor(185, 28, 28);
      }
      doc.text(`${rep.vasScore}/10 VAS`, 56, y + 2.5);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      doc.text(`${regionPl} (${charPl})`, 75, y + 2.5);
      doc.text(`${triggersPl.substring(0, 26)} | ${reliefPl.substring(0, 22)}`, 130, y + 2.5);
      y += 6.5;

      if (rep.psychosomaticNotes || rep.sessionNotes) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        const note = rep.psychosomaticNotes || rep.sessionNotes || '';
        doc.text(`   Komentarz: "${note.substring(0, 95)}"`, 18, y + 1.5);
        y += 4.5;
      }
    });
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Brak zarejestrowanych zgloszen bolowych.', 18, y + 2);
    y += 7;
  }

  // Footer Page 1
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Strona 1 z 2 • Wygenerowano w aplikacji "FizjoSzyja & Kregoslup". 100% On-Device Zero-Knowledge Privacy.', 14, 288);

  // ==================== STRONA 2 ====================
  doc.addPage();
  y = 18;

  // Header Banner Page 2
  doc.setFillColor(15, 23, 42); // Slate-900
  doc.rect(0, 0, pageWidth, 20, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.text('POSTEPY BIOMECHANICZNE, KAT PROTRAKCJI & ZALECENIA', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Analiza kata czaszkowo-kregowego (CVA) i nacisku na krazki C5-C7', pageWidth - 100, 12);

  y = 28;

  // 4. Historia Kąta Protrakcji Głowy i Analiza Postawy (CVA)
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('4. MONITOROWANIE KATA PROTRAKCJI GLOWY (TECH-NECK & CVA)', 14, y);
  y += 2.5;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(14, y, pageWidth - 14, y);
  y += 5.5;

  // Find all reports with posture angle
  const postureReports = state.painHistory
    .filter(r => r.postureTiltAngleDeg !== undefined)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (postureReports.length > 0) {
    const firstAngle = postureReports[0].postureTiltAngleDeg || 0;
    const latestAngle = postureReports[postureReports.length - 1].postureTiltAngleDeg || 0;
    const angleDiff = firstAngle - latestAngle;
    const firstLoad = Math.round(4.5 + (firstAngle / 60) * 22.5);
    const latestLoad = Math.round(4.5 + (latestAngle / 60) * 22.5);
    const loadRelief = firstLoad - latestLoad;

    // Mini KPI cards on PDF page 2
    doc.setFillColor(240, 253, 250); // Teal-50
    doc.setDrawColor(153, 246, 228);
    doc.roundedRect(14, y, pageWidth - 28, 15, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(13, 148, 136);
    doc.text(`Kat poczatkowy: ${firstAngle} deg (obciazenie ok. ${firstLoad} kg)`, 18, y + 6);
    doc.text(`Aktualny kat: ${latestAngle} deg (obciazenie ok. ${latestLoad} kg)`, 95, y + 6);
    doc.setTextColor(22, 101, 52);
    doc.text(`Korekta: ${angleDiff >= 0 ? `-${angleDiff} deg` : `+${Math.abs(angleDiff)} deg`} (Odciazenie: ${loadRelief >= 0 ? `-${loadRelief} kg` : `+${Math.abs(loadRelief)} kg`})`, 18, y + 11);

    y += 19;

    // Table of posture measurements
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, pageWidth - 28, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('Data pomiaru', 18, y + 4);
    doc.text('Kat protrakcji (CVA)', 65, y + 4);
    doc.text('Nacisk na kregi C5-C7', 110, y + 4);
    doc.text('Klasyfikacja kinezjologiczna', 150, y + 4);
    y += 7;

    postureReports.slice(-5).forEach((p, idx) => {
      const pDate = new Date(p.date).toLocaleDateString('pl-PL');
      const angle = p.postureTiltAngleDeg || 0;
      const loadKg = Math.round(4.5 + (angle / 60) * 22.5);
      const diag = p.postureDiagnosis || (angle <= 14 ? 'Norma fizjologiczna' : angle <= 29 ? 'Tech-Neck I st.' : angle <= 44 ? 'Tech-Neck II st.' : 'Tech-Neck III st.');

      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y - 2, pageWidth - 28, 6, 'F');
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);
      doc.text(pDate, 18, y + 2);
      doc.setFont('helvetica', 'bold');
      doc.text(`${angle} deg`, 65, y + 2);
      doc.setFont('helvetica', 'normal');
      doc.text(`ok. ${loadKg} kg`, 110, y + 2);
      doc.text(diag.substring(0, 24), 150, y + 2);
      y += 6;
    });
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Brak zarejestrowanych fotograficznych pomiarow kata CVA. Uzyj modulu Straznik Biurka / Kamera.', 18, y + 2);
    y += 7;
  }

  y += 4;

  // 5. Goniometryczne Testy Ruchomości (jeśli istnieją)
  if (state.profile.mobilityTests && state.profile.mobilityTests.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(30, 41, 59);
    doc.text('5. ZAKRESY RUCHOMOSCI SZYI (CROM - CERVICAL RANGE OF MOTION)', 14, y);
    y += 2.5;
    doc.line(14, y, pageWidth - 14, y);
    y += 5;

    const latestMob = state.profile.mobilityTests[state.profile.mobilityTests.length - 1];
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Rotacja w lewo: ${latestMob.neckRotationLeftDeg} deg (norma 80 deg)   |   Rotacja w prawo: ${latestMob.neckRotationRightDeg} deg (norma 80 deg)`, 18, y);
    y += 4.5;
    doc.text(`Zgiecie w przod (broda-mostek): ${latestMob.neckFlexionCm} cm (norma 0-2 cm)   |   Wyprost w tyl: ${latestMob.neckExtensionDeg} deg (norma 70 deg)`, 18, y);
    y += 6.5;
  }

  // 6. Wnioski Algorytmu Klinicznego, Czerwone Flagi & Zalecenia
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(30, 41, 59);
  doc.text('6. WNIOSKI ALGORYTMU KLINICZNEGO, PRZESIEW & ZALECENIA', 14, y);
  y += 2.5;
  doc.line(14, y, pageWidth - 14, y);
  y += 5.5;

  const hasRedFlags = state.painHistory.some(r => r.aiAnalysis && r.aiAnalysis.redFlagsDetected && r.aiAnalysis.redFlagsDetected.length > 0);
  if (hasRedFlags) {
    doc.setTextColor(185, 28, 28);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('UWAGA: W historii pacjenta odnotowano zgloszenia z czerwonymi flagami. Wskazana pilna konsultacja medyczna!', 14, y);
    y += 4.5;
  } else {
    doc.setTextColor(22, 101, 52);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('Screening czerwonych flag: PRAWIDLOWY. Brak objawow ubytkowych, zaburzen chodu i mielopatii.', 14, y);
    y += 4.5;
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text('Zalecenia kinezjoterapeutyczne: Regularna retrakcja brody (Chin-Tuck) w izometrii 5-10s, rozciaganie m. dzwigacza lopatki, odciazenie Brüggera co 45 min oraz utrzymanie podparcia ledzwiowego przy biurku.', 14, y, { maxWidth: pageWidth - 28 });
  y += 10;

  // 7. Leki i suplementy (opcjonalnie)
  if (state.medications && state.medications.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text('Przyjmowane leki i suplementy:', 14, y);
    y += 3.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    state.medications.forEach(m => {
      doc.text(`- ${m.name}: ${m.dosage} (${m.frequency})`, 18, y);
      y += 3.5;
    });
    y += 3;
  }

  // Doctor Signature Block
  y = Math.max(y, 238);
  doc.setDrawColor(148, 163, 184);
  doc.setLineDashPattern([1, 1], 0);
  doc.line(14, y, 90, y);
  doc.line(120, y, pageWidth - 14, y);
  doc.setLineDashPattern([], 0);
  y += 4.5;

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Podpis i pieczec Fizjoterapeuty / Lekarza', 14, y);
  doc.text('Zalecenia i dalsze postepowanie lecznicze', 120, y);

  // Footer Page 2
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Strona 2 z 2 • Wygenerowano w aplikacji "FizjoSzyja & Kregoslup - Moje Fizjo". 100% On-Device Zero-Knowledge Privacy.', 14, 288);

  return doc;
}

/**
 * Creates the PDF document and outputs a browser Blob URL ready for interactive modal preview or download.
 */
export function createSessionAndPainReportPdfBlob(state: AppState): { doc: jsPDF; blobUrl: string; filename: string } {
  const doc = buildSessionAndPainReportPdfDoc(state);
  const blob = doc.output('blob') as Blob;
  const blobUrl = URL.createObjectURL(blob);
  const filename = `Raport_Sesje_i_Historia_Bolu_${new Date().toISOString().split('T')[0]}.pdf`;
  return { doc, blobUrl, filename };
}

/**
 * Directly downloads the session and pain history PDF report.
 */
export function downloadSessionAndPainReportPdf(state: AppState): void {
  const { doc, filename } = createSessionAndPainReportPdfBlob(state);
  doc.save(filename);
}

