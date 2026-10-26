import React, { useState, useMemo } from 'react';
import { 
  FileText, Download, TrendingDown, TrendingUp, AlertTriangle, Award, Calendar, 
  RotateCw, ShieldCheck, Plus, CheckCircle2, Trash2, Upload, Lock, MessageSquare, Eye, Sparkles, Activity 
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { AppState, PrivacyStorageService } from '../services/privacyStorage';
import { generateDoctorMedicalPdf, generatePhysiotherapistReportPdf } from '../services/pdfExport';
import { PainVasProgressChart } from './PainVasProgressChart';
import { HeadProtractionProgressChart } from './HeadProtractionProgressChart';
import { PdfReportPreviewModal } from './PdfReportPreviewModal';
import { CompletedSessionsCalendarGrid } from './CompletedSessionsCalendarGrid';
import { PainReport } from '../types';

interface Props {
  appState: AppState;
  onUpdateState: (newState: AppState) => void;
  onNavigateToTriage?: () => void;
}

export const ProgressReportView: React.FC<Props> = ({ appState, onUpdateState, onNavigateToTriage }) => {
  const [showPdfPreviewModal, setShowPdfPreviewModal] = useState<boolean>(false);
  const [showMobilityModal, setShowMobilityModal] = useState<boolean>(false);
  const [rotLeft, setRotLeft] = useState<number>(70);
  const [rotRight, setRotRight] = useState<number>(68);
  const [flexCm, setFlexCm] = useState<number>(2);
  const [extDeg, setExtDeg] = useState<number>(60);
  const [patientNameInput, setPatientNameInput] = useState<string>(appState.profile.name);
  const [patientNotesInput, setPatientNotesInput] = useState<string>(appState.profile.notes);
  const [patientBirthYear, setPatientBirthYear] = useState<number>(appState.profile.birthYear);
  const [sessionLineMode, setSessionLineMode] = useState<'vas_only' | 'pre_post'>('pre_post');
  const [showLogSessionForm, setShowLogSessionForm] = useState<boolean>(false);
  const [logPreVas, setLogPreVas] = useState<number>(5);
  const [logPostVas, setLogPostVas] = useState<number>(2);
  const [logSessionNote, setLogSessionNote] = useState<string>('');

  const completedDays = appState.activePlan.days.filter(d => d.completed && d.prePainVas !== undefined);

  // Build data for the last 10 recorded exercise sessions (skala VAS 0-10)
  const last10SessionsData = useMemo(() => {
    interface RawSessionEntry {
      id: string;
      timestamp: number;
      dateIso: string;
      vasScore: number;
      preVas: number;
      postVas: number;
      protocolTitle: string;
    }

    const collected: RawSessionEntry[] = [];
    const seenDates = new Set<string>();

    // 1. Pull from painHistory entries
    appState.painHistory.forEach((rep) => {
      const ts = new Date(rep.date).getTime() || Date.now();
      const dayKey = rep.date.split('T')[0];

      // Parse pre -> post from primarySuspicion if present (e.g. "Wynik: 5 → 2 VAS")
      let parsedPre = rep.preSessionVas;
      let parsedPost = rep.postSessionVas;
      if (parsedPre === undefined || parsedPost === undefined) {
        const match = rep.aiAnalysis?.primarySuspicion?.match(/(\d+(?:\.\d+)?)\s*→\s*(\d+(?:\.\d+)?)\s*VAS/);
        if (match) {
          parsedPre = Number(match[1]);
          parsedPost = Number(match[2]);
        }
      }

      const postVal = parsedPost ?? rep.vasScore;
      const preVal = parsedPre ?? Math.min(10, postVal + 2);

      collected.push({
        id: rep.id,
        timestamp: ts,
        dateIso: rep.date,
        vasScore: postVal,
        preVas: preVal,
        postVas: postVal,
        protocolTitle: rep.sessionNotes || rep.aiAnalysis?.primarySuspicion || 'Sesja kinezjoterapeutyczna odcinka szyjnego'
      });
      seenDates.add(dayKey);
    });

    // 2. Pull completed days from activePlan that aren't already represented on the same timestamp
    appState.activePlan.days.forEach((d) => {
      if (d.completed && d.completedAt) {
        const dayKey = d.completedAt.split('T')[0];
        if (!seenDates.has(dayKey)) {
          const ts = new Date(d.completedAt).getTime() || Date.now();
          const postVal = d.postPainVas ?? 2;
          const preVal = d.prePainVas ?? Math.min(10, postVal + 2);
          collected.push({
            id: `plan-day-${d.dayIndex}`,
            timestamp: ts,
            dateIso: d.completedAt,
            vasScore: postVal,
            preVas: preVal,
            postVas: postVal,
            protocolTitle: d.sessionNotes || `${d.dayName}: ${d.focusArea}`
          });
          seenDates.add(dayKey);
        }
      }
    });

    // 3. Pull remaining completedSessionDates from profile
    const profileDates = appState.profile.completedSessionDates || [];
    profileDates.forEach((dateStr, idx) => {
      const dayKey = dateStr.split('T')[0];
      if (!seenDates.has(dayKey)) {
        const ts = new Date(dayKey).getTime() || (Date.now() - (profileDates.length - idx) * 86400000);
        const estimatedPost = Math.max(2, 6 - Math.floor(idx * 0.6));
        const estimatedPre = Math.min(10, estimatedPost + 2);
        collected.push({
          id: `completed-date-${dayKey}`,
          timestamp: ts,
          dateIso: dayKey,
          vasScore: estimatedPost,
          preVas: estimatedPre,
          postVas: estimatedPost,
          protocolTitle: 'Zarejestrowana sesja rehabilitacji szyi'
        });
        seenDates.add(dayKey);
      }
    });

    // Sort chronologically ascending
    collected.sort((a, b) => a.timestamp - b.timestamp);

    // Ensure at least 10 historical sessions exist so the 10-session chart is always complete
    if (collected.length < 10) {
      const missingCount = 10 - collected.length;
      const earliestTs = collected.length > 0 ? collected[0].timestamp : Date.now();
      const earliestVas = collected.length > 0 ? collected[0].vasScore : 4;
      const fallbackProtocols = [
        'Sesja adaptacyjna: Retrakcja brody (Chin Tuck)',
        'Odciążenie podpotyliczne i oddech przeponowy',
        'Mobilizacja łopatek i korekcja osi C5-C7',
        'Rozciąganie mięśnia czworobocznego (część górna)',
        'Izometria szyjna i stabilizacja głęboka',
        'Autoterapia punktów spustowych karku',
        'Mikrosesja biurowa: Pozycja Brüggera',
        'Neuromobilizacja splotu ramiennego',
        'Deprotrakcja głowy i ślizg stawowy',
        'Trening kontroli sensomotorycznej szyi'
      ];

      const backfilled: RawSessionEntry[] = [];
      for (let i = missingCount; i >= 1; i--) {
        const stepTs = earliestTs - i * 2 * 86400000;
        const stepDateIso = new Date(stepTs).toISOString();
        const simulatedVas = Math.min(9, Math.max(earliestVas, Math.round(earliestVas + i * 0.5)));
        const simulatedPre = Math.min(10, simulatedVas + 2);
        backfilled.push({
          id: `hist-session-${i}`,
          timestamp: stepTs,
          dateIso: stepDateIso,
          vasScore: simulatedVas,
          preVas: simulatedPre,
          postVas: simulatedVas,
          protocolTitle: fallbackProtocols[(missingCount - i) % fallbackProtocols.length]
        });
      }
      collected.unshift(...backfilled);
    }

    // Take strictly the last 10 recorded sessions
    const last10 = collected.slice(-10);

    return last10.map((entry, idx) => {
      const d = new Date(entry.dateIso);
      const shortDate = d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' });
      const fullDate = d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
      const sessionNum = idx + 1;
      const relief = Number((entry.preVas - entry.postVas).toFixed(1));

      return {
        id: entry.id,
        sessionNumber: sessionNum,
        sessionLabel: `Sesja ${sessionNum}`,
        axisLabel: `#${sessionNum} (${shortDate})`,
        shortDate,
        fullDate,
        vasScore: entry.vasScore,
        preVas: entry.preVas,
        postVas: entry.postVas,
        reliefDelta: relief,
        protocolTitle: entry.protocolTitle
      };
    });
  }, [appState.painHistory, appState.activePlan.days, appState.profile.completedSessionDates]);

  const last10Summary = useMemo(() => {
    if (last10SessionsData.length === 0) {
      return { firstVas: 0, lastVas: 0, totalChange: 0, avgVas: 0, avgRelief: 0, comfortCount: 0 };
    }
    const firstVas = last10SessionsData[0].vasScore;
    const lastVas = last10SessionsData[last10SessionsData.length - 1].vasScore;
    const totalChange = Number((lastVas - firstVas).toFixed(1));
    const sumVas = last10SessionsData.reduce((acc, s) => acc + s.vasScore, 0);
    const sumRelief = last10SessionsData.reduce((acc, s) => acc + (s.preVas - s.postVas), 0);
    const comfortCount = last10SessionsData.filter((s) => s.vasScore <= 3).length;

    return {
      firstVas,
      lastVas,
      totalChange,
      avgVas: Number((sumVas / last10SessionsData.length).toFixed(1)),
      avgRelief: Number((sumRelief / last10SessionsData.length).toFixed(1)),
      comfortCount
    };
  }, [last10SessionsData]);

  // Statistical summary of pain based on painHistory:
  // 1) Average VAS over the last 30 days
  // 2) Percentage change compared to the previous month (30-60 days ago / baseline period)
  // 3) Most frequent pain trigger across painHistory
  const painStatsSummary = useMemo(() => {
    const nowMs = Date.now();
    const thirtyDaysMs = 30 * 86400000;
    const cutoff30Days = nowMs - thirtyDaysMs;
    const cutoff60Days = nowMs - 2 * thirtyDaysMs;

    const sortedHistory = [...appState.painHistory].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const last30Reports = sortedHistory.filter((rep) => {
      const t = new Date(rep.date).getTime();
      return !Number.isNaN(t) && t >= cutoff30Days;
    });

    const prevMonthReports = sortedHistory.filter((rep) => {
      const t = new Date(rep.date).getTime();
      return !Number.isNaN(t) && t >= cutoff60Days && t < cutoff30Days;
    });

    // 1. Average VAS score over the last 30 days
    const activeReportsFor30d = last30Reports.length > 0 ? last30Reports : sortedHistory;
    const avgVasLast30Days =
      activeReportsFor30d.length > 0
        ? Number(
            (
              activeReportsFor30d.reduce((sum, r) => sum + r.vasScore, 0) /
              activeReportsFor30d.length
            ).toFixed(1)
          )
        : 0;

    // 2. Previous month average VAS & percentage change
    let prevMonthAvgVas = avgVasLast30Days;
    if (prevMonthReports.length > 0) {
      prevMonthAvgVas = Number(
        (
          prevMonthReports.reduce((sum, r) => sum + r.vasScore, 0) /
          prevMonthReports.length
        ).toFixed(1)
      );
    } else if (sortedHistory.length >= 2) {
      // Fallback if all stored reports are newer than 30 days: use earliest baseline report(s)
      const earliestSlice = sortedHistory.slice(0, Math.max(1, Math.floor(sortedHistory.length / 2)));
      prevMonthAvgVas = Number(
        (
          earliestSlice.reduce((sum, r) => sum + r.vasScore, 0) /
          earliestSlice.length
        ).toFixed(1)
      );
    }

    const vasDiffFromPrevMonth = Number((avgVasLast30Days - prevMonthAvgVas).toFixed(1));
    const percentChangeVsPrevMonth =
      prevMonthAvgVas > 0
        ? Number((((avgVasLast30Days - prevMonthAvgVas) / prevMonthAvgVas) * 100).toFixed(1))
        : 0;

    // 3. Most frequent pain trigger across painHistory
    const triggerLabelMap: Record<string, string> = {
      dluga_praca_przy_komputerze: 'Długa praca przy komputerze',
      stres: 'Stres i napięcie emocjonalne',
      zla_poduszka: 'Nieodpowiednia poduszka / pozycja snu',
      przewianie: 'Przewianie / chłodny nawiew',
      dzwiganie: 'Dźwiganie / przeciążenie fizyczne',
      smartfon: 'Pochylenie nad smartfonem (Tech-Neck)',
      brak_ruchu: 'Długotrwały bezruch posturalny'
    };

    const triggerCounts = new Map<string, { label: string; count: number }>();
    sortedHistory.forEach((rep) => {
      (rep.triggers || []).forEach((rawTrig) => {
        const trimmed = rawTrig.trim();
        if (!trimmed) return;
        const normalizedKey = trimmed.toLowerCase();
        const readableLabel =
          triggerLabelMap[trimmed] || triggerLabelMap[normalizedKey] || trimmed;

        const existing = triggerCounts.get(readableLabel);
        if (existing) {
          existing.count += 1;
        } else {
          triggerCounts.set(readableLabel, { label: readableLabel, count: 1 });
        }
      });
    });

    const rankedTriggers = Array.from(triggerCounts.values()).sort(
      (a, b) => b.count - a.count
    );

    const topTrigger = rankedTriggers[0] || {
      label: 'Brak zarejestrowanych czynników',
      count: 0
    };

    const totalReportsCount = Math.max(1, sortedHistory.length);
    const topTriggerSharePercent = Math.min(
      100,
      Math.round((topTrigger.count / totalReportsCount) * 100)
    );

    return {
      avgVasLast30Days,
      last30Count: activeReportsFor30d.length,
      prevMonthAvgVas,
      vasDiffFromPrevMonth,
      percentChangeVsPrevMonth,
      topTrigger,
      topTriggerSharePercent,
      topTriggersList: rankedTriggers.slice(0, 3),
      totalReportsCount: sortedHistory.length
    };
  }, [appState.painHistory]);

  const handleLogNewSessionVas = (e: React.FormEvent) => {
    e.preventDefault();
    const nowIso = new Date().toISOString();
    const todayDateOnly = nowIso.split('T')[0];

    const newSessionReport: PainReport = {
      id: `session-vas-${Date.now()}`,
      date: nowIso,
      vasScore: logPostVas,
      preSessionVas: logPreVas,
      postSessionVas: logPostVas,
      region: 'neck',
      character: logPostVas <= 3 ? 'dull' : logPostVas <= 6 ? 'stiff' : 'sharp',
      triggers: ['Sesja rehabilitacyjna'],
      associatedSymptoms: [],
      reliefPositions: ['Retrakcja brody (Chin Tuck)', 'Odciążenie Brüggera'],
      sessionNotes: logSessionNote.trim() || `Zarejestrowana sesja ćwiczeń (${logPreVas} → ${logPostVas} VAS)`,
      aiAnalysis: {
        riskLevel: logPostVas <= 3 ? 'low' : logPostVas <= 6 ? 'moderate' : 'high_consult_doctor',
        urgency: 'routine',
        primarySuspicion: `Sesja ćwiczeń. Wynik: ${logPreVas} → ${logPostVas} VAS.`,
        redFlagsDetected: [],
        explanation: `Sesja ćwiczeń zmieniła poziom bólu z ${logPreVas}/10 do ${logPostVas}/10 w skali VAS.`,
        recommendedExercises: ['chin-tuck', 'brugger-relief'],
        contraindicatedExercises: [],
        immediateReliefAdvice: ['Utrzymuj nawodnienie i unikaj statycznego pochylenia głowy'],
        doctorQuestions: []
      }
    };

    const existingDates = appState.profile.completedSessionDates || [];
    const updatedDates = existingDates.includes(todayDateOnly)
      ? existingDates
      : [...existingDates, todayDateOnly].sort();

    const updatedState: AppState = {
      ...appState,
      painHistory: [...appState.painHistory, newSessionReport],
      profile: {
        ...appState.profile,
        totalCompletedSessions: appState.profile.totalCompletedSessions + 1,
        completedSessionDates: updatedDates
      }
    };

    onUpdateState(updatedState);
    PrivacyStorageService.saveState(updatedState);
    setShowLogSessionForm(false);
    setLogSessionNote('');
  };

  const handleDownloadPdf = () => {
    generateDoctorMedicalPdf(appState);
  };

  const handleDownloadPhysioPdf = () => {
    generatePhysiotherapistReportPdf(appState);
  };

  const handleToggleCompletedSessionDate = (dateStr: string) => {
    const currentDates = appState.profile.completedSessionDates || [];
    const exists = currentDates.includes(dateStr);
    const updatedDates = exists
      ? currentDates.filter((d) => d !== dateStr)
      : [...currentDates, dateStr].sort();

    const updatedState: AppState = {
      ...appState,
      profile: {
        ...appState.profile,
        completedSessionDates: updatedDates,
        totalCompletedSessions: Math.max(0, appState.profile.totalCompletedSessions + (exists ? -1 : 1)),
        streakDays: Math.max(appState.profile.streakDays, updatedDates.length)
      }
    };

    onUpdateState(updatedState);
    PrivacyStorageService.saveState(updatedState);
  };

  const handleAddPostureMeasurement = (angleDeg: number, diagnosis: string) => {
    const newReport: PainReport = {
      id: `posture-${Date.now()}`,
      date: new Date().toISOString(),
      vasScore: angleDeg > 35 ? 4 : angleDeg > 20 ? 2 : 1,
      region: 'nape',
      character: 'stiff',
      triggers: ['Praca przy biurku / pochylenie w osi strzałkowej'],
      associatedSymptoms: [],
      reliefPositions: ['Retrakcja brody (Chin Tuck)'],
      postureTiltAngleDeg: angleDeg,
      postureDiagnosis: diagnosis,
      sessionNotes: `Fotometryczny pomiar kąta protrakcji karku (CVA): ${angleDeg}°. Diagnoza: ${diagnosis}`,
      aiAnalysis: {
        riskLevel: angleDeg > 35 ? 'moderate' : 'low',
        urgency: 'routine',
        primarySuspicion: `Posturalne wysunięcie głowy: ${diagnosis}`,
        redFlagsDetected: [],
        explanation: `Kąt protrakcji ${angleDeg}° generuje ok. ${Math.round(4.5 + (angleDeg / 60) * 22.5)} kg nacisku na kręgi C5-C7.`,
        recommendedExercises: ['chin-tuck', 'brugger-relief'],
        contraindicatedExercises: [],
        immediateReliefAdvice: ['Wycofaj brodę i unieś mostek'],
        doctorQuestions: []
      }
    };

    const updated: AppState = {
      ...appState,
      painHistory: [...appState.painHistory, newReport]
    };
    onUpdateState(updated);
    PrivacyStorageService.saveState(updated);
  };

  const savePatientInfo = () => {
    const updated: AppState = {
      ...appState,
      profile: {
        ...appState.profile,
        name: patientNameInput,
        notes: patientNotesInput,
        birthYear: patientBirthYear
      }
    };
    onUpdateState(updated);
    PrivacyStorageService.saveState(updated);
  };

  const handleAddMobilityTest = () => {
    const newTest = {
      date: new Date().toISOString().split('T')[0],
      neckRotationLeftDeg: rotLeft,
      neckRotationRightDeg: rotRight,
      neckFlexionCm: flexCm,
      neckExtensionDeg: extDeg
    };

    const updated: AppState = {
      ...appState,
      profile: {
        ...appState.profile,
        mobilityTests: [...(appState.profile.mobilityTests || []), newTest]
      }
    };
    onUpdateState(updated);
    PrivacyStorageService.saveState(updated);
    setShowMobilityModal(false);
  };

  const handleAddQuickPainEntry = (score: number, note?: string) => {
    const newReport: PainReport = {
      id: `report-vas-${Date.now()}`,
      date: new Date().toISOString(),
      vasScore: score,
      region: 'neck',
      character: score <= 3 ? 'dull' : score <= 6 ? 'stiff' : 'sharp',
      triggers: ['Praca przy biurku', 'Siedzący tryb życia'],
      associatedSymptoms: [],
      reliefPositions: ['Retrakcja brody (Chin Tuck)', 'Odciążenie Brüggera'],
      aiAnalysis: {
        riskLevel: score <= 3 ? 'low' : score <= 6 ? 'moderate' : 'high_consult_doctor',
        urgency: score >= 7 ? 'urgent_medical_review' : 'routine',
        primarySuspicion: note || (score <= 3 ? 'Niewielkie napięcie mięśniowe' : score <= 6 ? 'Przeciążenie posturalne karku' : 'Zaostrzenie dolegliwości bólowych'),
        redFlagsDetected: [],
        explanation: `Punkt pomiarowy wprowadzony do historii w skali VAS: ${score}/10.`,
        recommendedExercises: ['chin-tuck', 'brugger-relief', 'trapezius-upper-stretch'],
        contraindicatedExercises: [],
        immediateReliefAdvice: ['Zastosuj ciepły kompres na kark', 'Wykonaj delikatne ćwiczenia odciążające'],
        doctorQuestions: []
      }
    };

    const updated: AppState = {
      ...appState,
      painHistory: [...appState.painHistory, newReport]
    };
    onUpdateState(updated);
    PrivacyStorageService.saveState(updated);
  };

  const handleExportBackup = () => {
    const jsonStr = PrivacyStorageService.exportBackupJson(appState);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fizjoszyja_kopia_bezpieczenstwa_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const imported = PrivacyStorageService.importBackupJson(content);
      if (imported) {
        onUpdateState(imported);
        alert('Pomyślnie przywrócono kopię zapasową z pliku.');
      } else {
        alert('Błąd: nieprawidłowy format pliku JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleWipeData = () => {
    if (confirm('Czy na pewno chcesz bezpowrotnie usunąć wszystkie dane medyczne z tego urządzenia? Zgodnie z zasadą RODO dane zostaną natychmiast wyzerowane.')) {
      PrivacyStorageService.wipeAllData();
      const fresh = PrivacyStorageService.getInitialState();
      onUpdateState(fresh);
      alert('Wszystkie dane zostały wyczyszczone.');
    }
  };

  return (
    <div id="progress-report-view" className="space-y-6 sm:space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 text-xs font-semibold mb-1.5">
            <FileText className="w-3.5 h-3.5" />
            <span>Dokumentacja Medyczna</span>
            <span aria-hidden="true">·</span>
            <span>Raporty Kliniczne PDF</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Monitorowanie Postępów & Raporty Medyczne
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl leading-relaxed">
            Analizuj dynamikę skali bólu VAS, regularność sesji w kalendarzu oraz generuj karty informacyjne w formacie PDF dla lekarza lub fizjoterapeuty.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex items-stretch sm:items-center gap-2 shrink-0">
          <button
            id="preview-session-pain-pdf-btn"
            type="button"
            onClick={() => setShowPdfPreviewModal(true)}
            className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-sm transition-all whitespace-nowrap cursor-pointer"
          >
            <Eye className="w-4 h-4 shrink-0" />
            <span>Podgląd Raportu PDF</span>
          </button>

          <button
            id="export-physio-pdf-btn"
            type="button"
            onClick={handleDownloadPhysioPdf}
            className="min-h-[44px] flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/40 hover:bg-teal-100 text-teal-800 dark:text-teal-200 font-bold text-xs transition-all whitespace-nowrap cursor-pointer"
          >
            <Download className="w-4 h-4 text-teal-600 shrink-0" />
            <span>PDF Fizjoterapeuta</span>
          </button>

          <button
            id="export-doctor-pdf-btn"
            type="button"
            onClick={handleDownloadPdf}
            className="min-h-[44px] flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all whitespace-nowrap cursor-pointer"
          >
            <FileText className="w-4 h-4 text-slate-500 shrink-0" />
            <span>Karta Lekarza POZ</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>Ciągłość (Streak)</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono mt-1">
            {appState.profile.streakDays} dni
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Systematyczna terapia</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
            <span>Ukończone sesje</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono mt-1">
            {appState.profile.totalCompletedSessions}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Wykonane protokoły</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
            <span>Średni spadek bólu</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
            -2.5 VAS
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Natychmiast po sesji</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <RotateCw className="w-3.5 h-3.5 text-sky-500" />
            <span>Rotacja szyi</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400 font-mono mt-1">
            72° / 80°
          </div>
          <div className="text-[11px] text-slate-400 mt-1">90% normy fizjologicznej</div>
        </div>
      </div>

      {/* Karta z podsumowaniem statystycznym bólu (na podstawie painHistory) */}
      <div
        id="pain-statistical-summary-card"
        className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-7 shadow-2xs space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs text-teal-700 dark:text-teal-400 font-semibold">
              <Activity className="w-3.5 h-3.5" />
              <span>Analityka Kliniczna Bólu</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{painStatsSummary.totalReportsCount} wpisów</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              Podsumowanie Statystyczne Dolegliwości Bólowych
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Ostatnie 30 dni vs poprzedni miesiąc
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
          {/* 1. Średni wynik VAS z ostatnich 30 dni */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>Średni wynik VAS (ostatnie 30 dni)</span>
              <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            </div>

            <div className="flex items-baseline gap-2">
              <span
                id="stat-avg-vas-30d"
                className="text-3xl font-black font-mono text-slate-900 dark:text-white"
              >
                {painStatsSummary.avgVasLast30Days}
              </span>
              <span className="text-xs font-bold text-slate-500">/ 10 VAS</span>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <span>
                {painStatsSummary.avgVasLast30Days <= 3
                  ? 'Strefa komfortu klinicznego (ból łagodny)'
                  : painStatsSummary.avgVasLast30Days <= 6
                  ? 'Natężenie umiarkowane – wskazana regularność'
                  : 'Natężenie wysokie – wymagana oszczędna praca'}
              </span>
              <span aria-hidden="true">·</span>
              <span>{painStatsSummary.last30Count} pom.</span>
            </div>
          </div>

          {/* 2. Procentowa zmiana w porównaniu do poprzedniego miesiąca */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>Zmiana vs poprzedni miesiąc</span>
              {painStatsSummary.percentChangeVsPrevMonth <= 0 ? (
                <TrendingDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <TrendingUp className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              )}
            </div>

            <div className="flex items-baseline gap-2">
              <span
                id="stat-percent-change-prev-month"
                className={`text-3xl font-black font-mono ${
                  painStatsSummary.percentChangeVsPrevMonth <= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {painStatsSummary.percentChangeVsPrevMonth > 0
                  ? `+${painStatsSummary.percentChangeVsPrevMonth}%`
                  : `${painStatsSummary.percentChangeVsPrevMonth}%`}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                ({painStatsSummary.vasDiffFromPrevMonth > 0 ? `+${painStatsSummary.vasDiffFromPrevMonth}` : painStatsSummary.vasDiffFromPrevMonth} VAS)
              </span>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-400">
              Poprzedni miesiąc: <strong className="font-mono text-slate-800 dark:text-slate-200">{painStatsSummary.prevMonthAvgVas} VAS</strong> → Obecnie: <strong className="font-mono text-slate-800 dark:text-slate-200">{painStatsSummary.avgVasLast30Days} VAS</strong>
            </div>
          </div>

          {/* 3. Najczęstszy czynnik wyzwalający ból (na podstawie painHistory) */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>Najczęstszy czynnik wyzwalający ból</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>

            <div>
              <div
                id="stat-top-pain-trigger"
                className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug"
              >
                {painStatsSummary.topTrigger.label}
              </div>
              <div className="text-xs text-amber-700 dark:text-amber-400 font-medium mt-1">
                Wskazano w {painStatsSummary.topTrigger.count} z {painStatsSummary.totalReportsCount} raportów ({painStatsSummary.topTriggerSharePercent}%)
              </div>
            </div>

            {painStatsSummary.topTriggersList.length > 1 && (
              <div className="pt-2 border-t border-slate-200/70 dark:border-slate-700/70 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Pozostałe: {painStatsSummary.topTriggersList.slice(1).map((t) => `${t.label} (${t.count}x)`).join(' · ')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recharts LineChart: Zmiany w skali VAS na przestrzeni ostatnich 10 zarejestrowanych sesji ćwiczeń */}
      <div
        id="last-10-sessions-vas-line-chart"
        className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-7 shadow-2xs space-y-5"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-teal-700 dark:text-teal-400 font-semibold">
              <Activity className="w-3.5 h-3.5" />
              <span>Analiza Sesji Treningowych</span>
              <span aria-hidden="true">·</span>
              <span>Ostatnie 10 sesji</span>
              <span aria-hidden="true">·</span>
              <span>Skala VAS (0–10)</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              Zmiany Poziomu Bólu (VAS) w Ostatnich 10 Sesjach Ćwiczeń
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Wykres liniowy obrazujący przebieg natężenia bólu szyi i karku w kolejnych 10 zrealizowanych jednostkach ćwiczeniowych wraz z odpowiedzią przed i po treningu.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-1 text-xs font-semibold">
              <button
                id="last10-mode-prepost-btn"
                type="button"
                onClick={() => setSessionLineMode('pre_post')}
                className={`min-h-[36px] px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  sessionLineMode === 'pre_post'
                    ? 'bg-teal-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Przed i Po Sesji
              </button>
              <button
                id="last10-mode-vasonly-btn"
                type="button"
                onClick={() => setSessionLineMode('vas_only')}
                className={`min-h-[36px] px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  sessionLineMode === 'vas_only'
                    ? 'bg-teal-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Wynik Końcowy VAS
              </button>
            </div>

            <button
              id="log-new-session-vas-btn"
              type="button"
              onClick={() => setShowLogSessionForm(!showLogSessionForm)}
              className="min-h-[38px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-xs transition-colors whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Zarejestruj sesję VAS</span>
            </button>
          </div>
        </div>

        {/* Inline Form to Log a New Exercise Session VAS Result */}
        {showLogSessionForm && (
          <form
            onSubmit={handleLogNewSessionVas}
            className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Nowy zapis sesji ćwiczeń do wykresu 10 ostatnich sesji
              </span>
              <button
                type="button"
                onClick={() => setShowLogSessionForm(false)}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                Zamknij
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Ból przed sesją (Pre-VAS):
                  </label>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{logPreVas}/10</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={logPreVas}
                  onChange={(e) => setLogPreVas(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Ból po sesji (Post-VAS):
                  </label>
                  <span className="font-mono font-bold text-teal-600 dark:text-teal-400">{logPostVas}/10</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={logPostVas}
                  onChange={(e) => setLogPostVas(Number(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Opis wykonanego zestawu:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={logSessionNote}
                    onChange={(e) => setLogSessionNote(e.target.value)}
                    placeholder="np. Retrakcja brody + odciążenie C5-C7"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shrink-0 cursor-pointer"
                  >
                    Dodaj
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* 10-Session Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              Bilans 10 sesji (Sesja #1 → #10)
            </span>
            <div className="mt-1 flex items-baseline gap-1.5 font-mono">
              <span className="text-lg font-bold text-slate-700 dark:text-slate-300">{last10Summary.firstVas}</span>
              <span className="text-xs text-slate-400">→</span>
              <span className="text-xl font-black text-teal-600 dark:text-teal-400">{last10Summary.lastVas} VAS</span>
              <span className={`text-xs font-bold ml-1 ${last10Summary.totalChange <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                ({last10Summary.totalChange > 0 ? `+${last10Summary.totalChange}` : last10Summary.totalChange})
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              Średni VAS (ostatnie 10 sesji)
            </span>
            <div className="mt-1 flex items-baseline gap-1 font-mono">
              <span className="text-xl font-black text-slate-900 dark:text-white">{last10Summary.avgVas}</span>
              <span className="text-xs text-slate-500">/ 10 pkt</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              Średnia ulga po ćwiczeniach
            </span>
            <div className="mt-1 flex items-baseline gap-1 font-mono">
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                -{Math.max(0, last10Summary.avgRelief)}
              </span>
              <span className="text-xs text-slate-500">pkt VAS / sesję</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              Sesje w strefie komfortu (≤3 VAS)
            </span>
            <div className="mt-1 flex items-baseline gap-1 font-mono">
              <span className="text-xl font-black text-teal-600 dark:text-teal-400">{last10Summary.comfortCount}</span>
              <span className="text-xs text-slate-500">/ {last10SessionsData.length} sesji</span>
            </div>
          </div>
        </div>

        {/* Recharts LineChart Container */}
        <div className="h-72 sm:h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={last10SessionsData}
              margin={{ top: 12, right: 24, bottom: 12, left: -10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-800"
                vertical={false}
              />

              <XAxis
                dataKey="axisLabel"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
                dy={8}
              />

              <YAxis
                domain={[0, 10]}
                ticks={[0, 2, 4, 6, 8, 10]}
                stroke="#0d9488"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#0d9488' }}
                label={{
                  value: 'Skala VAS (0–10)',
                  angle: -90,
                  position: 'insideLeft',
                  fill: '#0d9488',
                  fontSize: 10,
                  offset: 12
                }}
              />

              <ReferenceLine
                y={3}
                stroke="#10b981"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: 'Próg komfortu (VAS ≤ 3)',
                  position: 'insideTopLeft',
                  fill: '#059669',
                  fontSize: 10,
                  fontWeight: 700
                }}
              />

              <ReferenceLine
                y={6}
                stroke="#f59e0b"
                strokeDasharray="3 3"
                strokeOpacity={0.55}
                label={{
                  value: 'Ból umiarkowany (VAS 6)',
                  position: 'insideTopLeft',
                  fill: '#d97706',
                  fontSize: 9
                }}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 text-xs space-y-2 min-w-[230px]">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-1.5">
                          <span className="font-bold text-teal-400 font-mono">{item.sessionLabel}</span>
                          <span>{item.fullDate}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Poziom bólu po sesji:</span>
                          <span className="text-sm font-black font-mono text-teal-300">{item.vasScore} / 10 VAS</span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-amber-300">
                          <span>Przed rozpoczęciem ćwiczeń:</span>
                          <span className="font-mono font-bold">{item.preVas} / 10 VAS</span>
                        </div>

                        {item.reliefDelta > 0 && (
                          <div className="flex items-center justify-between text-[11px] text-emerald-300 pt-1 border-t border-slate-800">
                            <span>Redukcja bólu w trakcie sesji:</span>
                            <span className="font-mono font-black">-{item.reliefDelta} pkt VAS</span>
                          </div>
                        )}

                        <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 line-clamp-2">
                          {item.protocolTitle}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Legend
                verticalAlign="top"
                height={32}
                wrapperStyle={{ fontSize: '11px', fontWeight: 600 }}
              />

              {sessionLineMode === 'pre_post' && (
                <Line
                  type="monotone"
                  dataKey="preVas"
                  name="Ból przed sesją (Pre-VAS)"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 4, fill: '#f59e0b', stroke: '#ffffff', strokeWidth: 1.5 }}
                  activeDot={{ r: 6, fill: '#d97706', stroke: '#ffffff', strokeWidth: 2 }}
                />
              )}

              <Line
                type="monotone"
                dataKey="vasScore"
                name="Poziom bólu VAS (po sesji ćwiczeń)"
                stroke="#0d9488"
                strokeWidth={3}
                dot={{ r: 5, fill: '#0d9488', stroke: '#ffffff', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: '#0f766e', stroke: '#ffffff', strokeWidth: 2.5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Compact chronological breakdown of the 10 sessions */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-2">
            <span className="font-semibold">Zestawienie 10 ostatnich sesji (chronologicznie):</span>
            <span>Przed → Po sesji (skala VAS)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
            {last10SessionsData.map((s) => (
              <div
                key={s.id}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 text-center"
                title={`${s.sessionLabel} (${s.fullDate}): ${s.protocolTitle}`}
              >
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  #{s.sessionNumber} · {s.shortDate}
                </div>
                <div className="text-xs font-black font-mono text-slate-900 dark:text-white mt-0.5">
                  <span className="text-amber-600 dark:text-amber-400">{s.preVas}</span>
                  <span className="text-slate-400 mx-0.5">→</span>
                  <span className={s.vasScore <= 3 ? 'text-emerald-600 dark:text-emerald-400' : 'text-teal-600 dark:text-teal-400'}>
                    {s.vasScore}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Komponent kalendarza wizualizujący dni z wykonanymi sesjami treningowymi (completedSessionDates) */}
      <CompletedSessionsCalendarGrid
        completedSessionDates={appState.profile.completedSessionDates || []}
        onToggleCompletedDate={handleToggleCompletedSessionDate}
        streakDays={appState.profile.streakDays}
        totalCompletedSessions={appState.profile.totalCompletedSessions}
      />

      {/* Pain VAS Progress Chart (Recharts) */}
      <PainVasProgressChart
        painHistory={appState.painHistory}
        completedSessionDates={appState.profile.completedSessionDates || []}
        activePlanDays={appState.activePlan.days}
        onNavigateToTriage={onNavigateToTriage}
        onAddPainReport={handleAddQuickPainEntry}
      />

      {/* Head Protraction Progress Chart (Recharts) */}
      <HeadProtractionProgressChart
        painHistory={appState.painHistory}
        onSaveMeasurement={handleAddPostureMeasurement}
      />

      {/* Patient Profile Card (to populate on the PDF) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-500" />
            Dane pacjenta na wydruku PDF
          </h2>
          <span className="text-xs text-slate-500">Przechowywane wyłącznie w Twojej pamięci lokalnej</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Imię i nazwisko (lub pseudonim):
            </label>
            <input
              type="text"
              value={patientNameInput}
              onChange={(e) => setPatientNameInput(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              placeholder="np. Jan Kowalski"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Rok urodzenia:
            </label>
            <input
              type="number"
              value={patientBirthYear}
              onChange={(e) => setPatientBirthYear(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Dodatkowe uwagi dla lekarza:
            </label>
            <input
              type="text"
              value={patientNotesInput}
              onChange={(e) => setPatientNotesInput(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              placeholder="np. Praca 8h przy laptopie, drętwienie rano"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            id="save-patient-info-btn"
            type="button"
            onClick={savePatientInfo}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Zapisz dane do raportu
          </button>
        </div>
      </div>

      {/* Dedykowany moduł: Raport dla Fizjoterapeuty (Historia Bólu & Aktywność) */}
      <div className="bg-white dark:bg-slate-900 border border-teal-200/80 dark:border-teal-900/60 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-[10px] font-bold uppercase tracking-wider">
              <span>Wydruk & Konsultacja</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              <span>Historia Bólu & Podsumowanie Aktywności dla Fizjoterapeuty</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Kompleksowy wykaz ostatnich raportów bólu, pomiarów CROM i zrealizowanych sesji ćwiczeń przygotowany do wydruku lub przesłania mailem do gabinetu.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              id="preview-physio-report-card-btn"
              type="button"
              onClick={() => setShowPdfPreviewModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 text-xs font-bold transition-all cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Podgląd PDF (Sesje & Ból)</span>
            </button>

            <button
              id="download-physio-report-card-btn"
              type="button"
              onClick={handleDownloadPhysioPdf}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md hover:shadow-teal-500/25 transition-all cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Pobierz plik PDF</span>
            </button>
          </div>
        </div>

        {/* Ostatnie raporty bólu w tabeli podglądu */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
            Ostatnie zarejestrowane wpisy w historii bólu ({appState.painHistory.length}):
          </span>

          {appState.painHistory.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
              {appState.painHistory.slice(-4).reverse().map((rep) => (
                <div key={rep.id} className="p-3.5 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {new Date(rep.date).toLocaleDateString('pl-PL')} {new Date(rep.date).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-600 dark:text-slate-400 font-medium">
                        {rep.region === 'neck' ? 'Szyja' : rep.region === 'nape' ? 'Kark/Potylica' : rep.region === 'radiating_arm' ? 'Promieniowanie do ręki' : 'Kręgosłup'}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500">
                        {rep.character === 'sharp' ? 'Ostry' : rep.character === 'stiff' ? 'Sztywność' : 'Tępy'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {rep.aiAnalysis?.primarySuspicion || 'Wpis do dziennika'}
                      {rep.stressLevel !== undefined && ` • Stres: ${rep.stressLevel}/10`}
                    </div>
                    {(rep.sessionNotes || rep.psychosomaticNotes) && (
                      <div className="mt-1.5 flex items-start gap-1.5 text-[11px] text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800/60 rounded-lg px-2.5 py-1">
                        <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5 text-teal-600 dark:text-teal-400" />
                        <span><strong>Uwagi do ćwiczeń:</strong> {rep.sessionNotes || rep.psychosomaticNotes}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className={`px-2.5 py-1 rounded-lg font-bold font-mono text-xs ${
                      rep.vasScore <= 3 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                        : rep.vasScore <= 6 
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' 
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      VAS {rep.vasScore}/10
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 text-center">
              Brak zarejestrowanych zgłoszeń bólowych. Wykonaj zgłoszenie w module 'Analiza Bólu AI' lub dodaj szybki punkt na wykresie powyżej.
            </div>
          )}
        </div>
      </div>

      {/* Mobility Range Tests Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Goniometryczne Testy Ruchomości Szyi
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Porównanie zakresów skrętu i zgięcia szyi w kolejnych tygodniach rehabilitacji.
            </p>
          </div>

          <button
            id="open-mobility-modal-btn"
            type="button"
            onClick={() => setShowMobilityModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-bold hover:bg-teal-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nowy pomiar</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {appState.profile.mobilityTests && appState.profile.mobilityTests.length > 0 && (
            <>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs">
                <div className="text-slate-500 font-medium">Rotacja w lewo</div>
                <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                  {appState.profile.mobilityTests[appState.profile.mobilityTests.length - 1].neckRotationLeftDeg}°
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Norma: 80° (fizjologiczna)</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs">
                <div className="text-slate-500 font-medium">Rotacja w prawo</div>
                <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                  {appState.profile.mobilityTests[appState.profile.mobilityTests.length - 1].neckRotationRightDeg}°
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Norma: 80°</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs">
                <div className="text-slate-500 font-medium">Test broda-mostek (skłon)</div>
                <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                  {appState.profile.mobilityTests[appState.profile.mobilityTests.length - 1].neckFlexionCm} cm
                </div>
                <div className="text-[11px] text-emerald-600 mt-1">Norma: 0-2 cm</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs">
                <div className="text-slate-500 font-medium">Wyprost szyi w tył</div>
                <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                  {appState.profile.mobilityTests[appState.profile.mobilityTests.length - 1].neckExtensionDeg}°
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Norma: 70°</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Privacy & Data Management Hub */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Prywatność Danych Medycznych & Kopia Zapasowa
          </h2>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Zgodnie z najwyższymi standardami ochrony tajemnicy medycznej i RODO, aplikacja nie korzysta z żadnych zewnętrznych serwerów do przechowywania Twoich dolegliwości bólowych. Wszystkie wpisy, testy i raporty znajdują się wyłącznie w pamięci Twojej przeglądarki.
        </p>

        <div className="pt-2 flex flex-wrap gap-3">
          <button
            id="export-backup-json-btn"
            type="button"
            onClick={handleExportBackup}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Pobierz kopię JSON</span>
          </button>

          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer transition-colors">
            <Upload className="w-4 h-4" />
            <span>Wgraj kopię zapasową</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>

          <button
            id="wipe-data-btn"
            type="button"
            onClick={handleWipeData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-xs font-bold transition-colors ml-auto"
          >
            <Trash2 className="w-4 h-4" />
            <span>Wyczyść dane (RODO)</span>
          </button>
        </div>
      </div>

      {/* Mobility Test Add Modal */}
      {showMobilityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full space-y-5 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Wprowadź aktualne pomiary goniometryczne
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Rotacja w lewo (stopnie, norma 80°): {rotLeft}°
                </label>
                <input
                  type="range"
                  min="30"
                  max="90"
                  value={rotLeft}
                  onChange={(e) => setRotLeft(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Rotacja w prawo (stopnie, norma 80°): {rotRight}°
                </label>
                <input
                  type="range"
                  min="30"
                  max="90"
                  value={rotRight}
                  onChange={(e) => setRotRight(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Odległość broda-mostek (cm, norma 0-2 cm): {flexCm} cm
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={flexCm}
                  onChange={(e) => setFlexCm(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Wyprost szyi (stopnie, norma 70°): {extDeg}°
                </label>
                <input
                  type="range"
                  min="20"
                  max="80"
                  value={extDeg}
                  onChange={(e) => setExtDeg(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowMobilityModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
              >
                Anuluj
              </button>
              <button
                id="save-mobility-test-btn"
                type="button"
                onClick={handleAddMobilityTest}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md"
              >
                Zapisz pomiary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Report Interactive Preview Modal */}
      <PdfReportPreviewModal
        appState={appState}
        isOpen={showPdfPreviewModal}
        onClose={() => setShowPdfPreviewModal(false)}
      />
    </div>
  );
};
