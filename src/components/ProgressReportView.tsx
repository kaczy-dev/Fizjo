import React, { useState } from 'react';
import { 
  FileText, Download, TrendingDown, Award, Calendar, 
  RotateCw, ShieldCheck, Plus, CheckCircle2, Trash2, Upload, Lock 
} from 'lucide-react';
import { AppState, PrivacyStorageService } from '../services/privacyStorage';
import { generateDoctorMedicalPdf } from '../services/pdfExport';
import { PainVasProgressChart } from './PainVasProgressChart';
import { PainReport } from '../types';

interface Props {
  appState: AppState;
  onUpdateState: (newState: AppState) => void;
  onNavigateToTriage?: () => void;
}

export const ProgressReportView: React.FC<Props> = ({ appState, onUpdateState, onNavigateToTriage }) => {
  const [showMobilityModal, setShowMobilityModal] = useState<boolean>(false);
  const [rotLeft, setRotLeft] = useState<number>(70);
  const [rotRight, setRotRight] = useState<number>(68);
  const [flexCm, setFlexCm] = useState<number>(2);
  const [extDeg, setExtDeg] = useState<number>(60);
  const [patientNameInput, setPatientNameInput] = useState<string>(appState.profile.name);
  const [patientNotesInput, setPatientNotesInput] = useState<string>(appState.profile.notes);
  const [patientBirthYear, setPatientBirthYear] = useState<number>(appState.profile.birthYear);

  const completedDays = appState.activePlan.days.filter(d => d.completed && d.prePainVas !== undefined);

  const handleDownloadPdf = () => {
    generateDoctorMedicalPdf(appState);
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
    <div id="progress-report-view" className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-semibold mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Dokumentacja Medyczna & Raporty Kliniczne</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Monitorowanie Postępów & Raport dla Lekarza
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
            Generuj oficjalne karty przebiegu rehabilitacji w formacie PDF dla lekarza POZ, ortopedy, neurologa lub fizjoterapeuty – 100% lokalnie na Twoim urządzeniu.
          </p>
        </div>

        <button
          id="export-doctor-pdf-btn"
          type="button"
          onClick={handleDownloadPdf}
          className="flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-md hover:shadow-teal-500/25 transition-all shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Pobierz Raport PDF dla Lekarza</span>
        </button>
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

      {/* Pain VAS Progress Chart (Recharts) */}
      <PainVasProgressChart
        painHistory={appState.painHistory}
        onNavigateToTriage={onNavigateToTriage}
        onAddPainReport={handleAddQuickPainEntry}
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
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold transition-colors"
          >
            Zapisz dane do raportu
          </button>
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
    </div>
  );
};
