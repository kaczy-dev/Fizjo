import jsPDF from 'jspdf';
import { AppState } from './privacyStorage';
import { EXERCISES } from '../data/exercises';

export function generateDoctorMedicalPdf(state: AppState): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header Banner
  doc.setFillColor(15, 23, 42); // Slate-900
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('KARTA PRZEBIEGU REHABILITACJI KRĘGOSŁUPA I SZYI', 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Dokumentacja pacjenta do wglądu Lekarza POZ / Ortopedy / Neurologa / Fizjoterapeuty', 14, 18);
  doc.text(`Data: ${new Date().toLocaleDateString('pl-PL')}`, pageWidth - 42, 18);

  y = 32;

  // Section 1: Patient Data
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('1. DANE PACJENTA I WYWIAD KLINICZNY', 14, y);
  y += 2;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(14, y, pageWidth - 14, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Pacjent: ${state.profile.name || 'Anonimowy pacjent'} (Rok ur.: ${state.profile.birthYear || 'Brak'})`, 14, y);
  doc.text(`Tryb pracy: ${state.activePlan.workType === 'desk' ? 'Biurowa / Praca przy komputerze' : 'Fizyczna / Mieszana'}`, 110, y);
  y += 5;

  doc.text(`Główny problem: ${state.activePlan.title}`, 14, y);
  doc.text(`Ukończone sesje rehabilitacyjne: ${state.profile.totalCompletedSessions} (Ciągłość: ${state.profile.streakDays} dni)`, 110, y);
  y += 5;

  if (state.profile.notes) {
    doc.text(`Uwagi pacjenta: ${state.profile.notes}`, 14, y);
    y += 5;
  }

  y += 3;

  // Section 2: Pain VAS Dynamic
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('2. DYNAMIKA BÓLU (SKALA ANALOGOWA VAS 0-10)', 14, y);
  y += 2;
  doc.line(14, y, pageWidth - 14, y);
  y += 6;

  // Calculate stats
  const completedDays = state.activePlan.days.filter(d => d.completed && d.prePainVas !== undefined);
  const avgPre = completedDays.length > 0 
    ? (completedDays.reduce((acc, d) => acc + (d.prePainVas || 0), 0) / completedDays.length).toFixed(1)
    : 'Brak';
  const avgPost = completedDays.length > 0
    ? (completedDays.reduce((acc, d) => acc + (d.postPainVas || 0), 0) / completedDays.length).toFixed(1)
    : 'Brak';

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Średni ból przed sesją: ${avgPre} / 10 VAS  |  Średni ból bezpośrednio po ćwiczeniach: ${avgPost} / 10 VAS`, 14, y);
  y += 5;

  if (state.painHistory.length > 0) {
    doc.text('Ostatnie zgłoszone epizody bólowe z analizą kinezjologiczną:', 14, y);
    y += 5;
    state.painHistory.slice(-3).forEach((rep) => {
      const dateStr = new Date(rep.date).toLocaleDateString('pl-PL');
      const regionPl = rep.region === 'neck' ? 'Szyja' : rep.region === 'nape' ? 'Kark/Potylica' : rep.region === 'radiating_arm' ? 'Promieniowanie do ręki' : 'Kręgosłup';
      doc.setFont('helvetica', 'bold');
      doc.text(`• ${dateStr} - Ból: ${rep.vasScore}/10 VAS (${regionPl})`, 18, y);
      y += 4;
      doc.setFont('helvetica', 'normal');
      doc.text(`  Ocena: ${rep.aiAnalysis.primarySuspicion}`, 22, y);
      y += 4;
      if (rep.aiAnalysis.dermatomeAffected) {
        doc.text(`  Segment: ${rep.aiAnalysis.dermatomeAffected}`, 22, y);
        y += 4;
      }
    });
  } else {
    doc.text('Brak zarejestrowanych ostrych incydentów bólowych w wybranym okresie.', 14, y);
    y += 5;
  }

  y += 3;

  // Section 3: Cervical Mobility Range
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('3. TESTY RUCHOMOŚCI ODCINKA SZYJNEGO (ZAKRESY STOPNIOWE)', 14, y);
  y += 2;
  doc.line(14, y, pageWidth - 14, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  const tests = state.profile.mobilityTests;
  if (tests && tests.length > 0) {
    const latest = tests[tests.length - 1];
    const initial = tests[0];

    doc.text(`Rotacja głowy w lewo: ${latest.neckRotationLeftDeg}° (Norma: 80°, Poprzednio: ${initial.neckRotationLeftDeg}°)`, 14, y);
    doc.text(`Rotacja głowy w prawo: ${latest.neckRotationRightDeg}° (Norma: 80°, Poprzednio: ${initial.neckRotationRightDeg}°)`, 110, y);
    y += 5;
    doc.text(`Odległość broda-mostek (skłon): ${latest.neckFlexionCm} cm (Norma: 0-2 cm, Poprzednio: ${initial.neckFlexionCm} cm)`, 14, y);
    doc.text(`Wyprost szyi: ${latest.neckExtensionDeg}° (Norma: 70°, Poprzednio: ${initial.neckExtensionDeg}°)`, 110, y);
    y += 5;
  } else {
    doc.text('Pomiary goniometryczne w toku oceny.', 14, y);
    y += 5;
  }

  y += 3;

  // Section 4: Realized Exercises Program
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('4. REALIZOWANY PROGRAM ĆWICZEŃ REHABILITACYJNYCH', 14, y);
  y += 2;
  doc.line(14, y, pageWidth - 14, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Wykaz bezpiecznych ćwiczeń celowanych wdrożonych w planie tygodniowym:', 14, y);
  y += 4.5;

  const currentPlanExIds = Array.from(new Set(state.activePlan.days.flatMap(d => d.exerciseIds)));
  const exercisesInPlan = EXERCISES.filter(e => currentPlanExIds.includes(e.id));

  exercisesInPlan.forEach((ex) => {
    doc.text(`• ${ex.polishName} (${ex.tempo} tempo, ${ex.defaultHoldSeconds}s izometrii) - ${ex.targetMuscles[0]}`, 18, y);
    y += 4;
  });

  y += 3;

  // Section 5: AI Clinical Screening & Red Flags
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('5. WNIOSKI ALGORYTMU KLINICZNEGO & CZERWONE FLAGI', 14, y);
  y += 2;
  doc.line(14, y, pageWidth - 14, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  const hasRedFlags = state.painHistory.some(r => r.aiAnalysis.redFlagsDetected.length > 0);
  if (hasRedFlags) {
    doc.setTextColor(185, 28, 28);
    doc.setFont('helvetica', 'bold');
    doc.text('UWAGA: W historii pacjenta odnotowano zgłoszenia z czerwonymi flagami.', 14, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
  } else {
    doc.setTextColor(22, 101, 52); // Green
    doc.text('Czerwone flagi: BRAK. Brak objawów mielopatycznych, niedowładu wiotkiego i zaburzeń zwieraczy.', 14, y);
    y += 4;
  }

  doc.setTextColor(30, 41, 59);
  doc.text('Rekomendacja kinezjologiczna: Kontynuacja ćwiczeń głębokich zginaczy szyi (chin tuck) oraz korekcja ergonomii stanowiska pracy.', 14, y);
  y += 7;

  // Section 6: Medications
  if (state.medications.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('6. PRZYJMOWANE LEKI I SUPLEMENTY:', 14, y);
    y += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    state.medications.forEach(m => {
      doc.text(`- ${m.name}: ${m.dosage} (${m.frequency})`, 18, y);
      y += 3.8;
    });
    y += 4;
  }

  // Section 7: Doctor Signature Block
  y = Math.max(y, 245);
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

  // Footer Privacy Note
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Raport wygenerowany lokalnie w aplikacji "FizjoSzyja & Kręgosłup - Moje Fizjo". Dane medyczne przechowywane wyłącznie na urządzeniu użytkownika.', 14, 290);

  // Trigger download
  doc.save(`Raport_Rehabilitacji_Kregoslupa_${new Date().toISOString().split('T')[0]}.pdf`);
}
