import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Download, Printer, RotateCw, FileText, Eye, 
  CheckCircle2, Sparkles, Activity, ShieldCheck, AlertCircle, 
  Calendar, Award, ExternalLink
} from 'lucide-react';
import { AppState } from '../services/privacyStorage';
import { createSessionAndPainReportPdfBlob } from '../services/pdfExport';
import type jsPDF from 'jspdf';

interface Props {
  appState: AppState;
  isOpen: boolean;
  onClose: () => void;
}

export const PdfReportPreviewModal: React.FC<Props> = ({ appState, isOpen, onClose }) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [currentDoc, setCurrentDoc] = useState<jsPDF | null>(null);
  const [currentFilename, setCurrentFilename] = useState<string>('Raport_Kliniczny.pdf');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'pdf_preview' | 'data_summary'>('pdf_preview');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Generate PDF on open
  useEffect(() => {
    if (!isOpen) {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl(null);
      }
      setCurrentDoc(null);
      return;
    }

    generatePdf();

    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [isOpen]);

  const generatePdf = () => {
    setIsGenerating(true);
    try {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
      const { doc, blobUrl: newBlobUrl, filename } = createSessionAndPainReportPdfBlob(appState);
      setBlobUrl(newBlobUrl);
      setCurrentDoc(doc);
      setCurrentFilename(filename);
    } catch (err) {
      console.error('Błąd podczas generowania raportu PDF:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (currentDoc) {
      currentDoc.save(currentFilename);
    } else if (blobUrl) {
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = currentFilename;
      a.click();
    }
  };

  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.focus();
        iframeRef.current.contentWindow.print();
        return;
      } catch (err) {
        console.warn('Iframe print blocked, falling back to window.open print', err);
      }
    }
    if (blobUrl) {
      const printWin = window.open(blobUrl, '_blank');
      if (printWin) {
        printWin.focus();
      }
    }
  };

  if (!isOpen) return null;

  const completedDays = appState.activePlan.days.filter(d => d.completed);
  const completedWithVas = completedDays.filter(d => d.prePainVas !== undefined);
  const avgPre = completedWithVas.length > 0 
    ? (completedWithVas.reduce((acc, d) => acc + (d.prePainVas || 0), 0) / completedWithVas.length).toFixed(1)
    : '-';
  const avgPost = completedWithVas.length > 0
    ? (completedWithVas.reduce((acc, d) => acc + (d.postPainVas || 0), 0) / completedWithVas.length).toFixed(1)
    : '-';
  const reliefVas = completedWithVas.length > 0
    ? (Number(avgPre) - Number(avgPost)).toFixed(1)
    : '0';

  const postureReports = appState.painHistory.filter(r => r.postureTiltAngleDeg !== undefined);

  return (
    <div 
      id="pdf-report-preview-modal" 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-5xl h-[92vh] max-h-[920px] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="px-5 py-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 bg-slate-50/70 dark:bg-slate-900/90">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-[11px] font-bold">
                <FileText className="w-3.5 h-3.5" />
                <span>jsPDF Engine • Standaryzacja Kliniczna A4</span>
              </span>
              <span className="text-[11px] text-slate-500 font-medium hidden md:inline">
                • 100% On-Device Privacy
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              Podgląd Raportu Medycznego PDF
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ostatnie wyniki sesji ćwiczeń, historia bólu (VAS) oraz kąt protrakcji głowy (CVA)
            </p>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                id="pdf-tab-preview-btn"
                type="button"
                onClick={() => setActiveTab('pdf_preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'pdf_preview'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Podgląd A4</span>
              </button>
              <button
                id="pdf-tab-summary-btn"
                type="button"
                onClick={() => setActiveTab('data_summary')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'data_summary'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Spis Danych</span>
              </button>
            </div>

            {/* Refresh */}
            <button
              id="pdf-refresh-btn"
              type="button"
              onClick={generatePdf}
              disabled={isGenerating}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Przelicz i odśwież raport"
            >
              <RotateCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            </button>

            {/* Print */}
            <button
              id="pdf-print-btn"
              type="button"
              onClick={handlePrint}
              disabled={!blobUrl || isGenerating}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
              title="Drukuj raport"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Drukuj</span>
            </button>

            {/* Download */}
            <button
              id="pdf-download-btn"
              type="button"
              onClick={handleDownload}
              disabled={!blobUrl || isGenerating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md hover:shadow-teal-500/25 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Pobierz PDF</span>
            </button>

            {/* Close */}
            <button
              id="close-pdf-modal-btn"
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden relative bg-slate-100 dark:bg-slate-950 flex flex-col">
          {isGenerating ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-3">
              <RotateCw className="w-8 h-8 text-teal-600 animate-spin" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Formatowanie danych medycznych w bibliotece jsPDF...
              </p>
              <span className="text-xs text-slate-500">Zestawianie sesji i historii bólu...</span>
            </div>
          ) : activeTab === 'pdf_preview' ? (
            <div className="flex-1 w-full h-full relative p-2 sm:p-4">
              {blobUrl ? (
                <iframe
                  ref={iframeRef}
                  src={`${blobUrl}#view=FitH`}
                  title="Podgląd Raportu Medycznego PDF"
                  className="w-full h-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white shadow-inner"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <AlertCircle className="w-10 h-10 text-amber-500" />
                  <div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                      Podgląd PDF jest niedostępny
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      Twoja przeglądarka może blokować bezpośrednie osadzanie plików PDF. Użyj przycisku poniżej, aby pobrać wygenerowany plik na dysk.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="px-5 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Pobierz plik PDF</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Data Summary View */
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {/* Quick KPI stats included in this report */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[11px] font-semibold text-slate-500 block">Ukończone sesje</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
                    {appState.profile.totalCompletedSessions}
                  </span>
                  <span className="text-[10px] text-teal-600 font-medium">Ciągłość: {appState.profile.streakDays} dni</span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[11px] font-semibold text-slate-500 block">Średnia ulga po sesji</span>
                  <span className="text-2xl font-black text-emerald-600 font-mono mt-0.5 block">
                    -{reliefVas} VAS
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium">Pre: {avgPre} → Post: {avgPost}</span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[11px] font-semibold text-slate-500 block">Wpisy w historii bólu</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
                    {appState.painHistory.length}
                  </span>
                  <span className="text-[10px] text-slate-400">Dziennik kinezjologiczny</span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[11px] font-semibold text-slate-500 block">Pomiary kąta CVA</span>
                  <span className="text-2xl font-black text-sky-600 font-mono mt-0.5 block">
                    {postureReports.length}
                  </span>
                  <span className="text-[10px] text-sky-600 font-medium">
                    {postureReports.length > 0 ? `Ostatni: ${postureReports[postureReports.length - 1].postureTiltAngleDeg}°` : 'Brak pomiarów'}
                  </span>
                </div>
              </div>

              {/* Sessions Details Section */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Ostatnie sesje uwzględnione w dokumencie ({completedDays.length}):</span>
                </h3>
                {completedDays.length > 0 ? (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                    {completedDays.slice(-4).reverse().map((day) => (
                      <div key={`day-${day.dayIndex}`} className="p-3 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{day.dayName || `Dzień ${day.dayIndex + 1}`}: {day.focusArea}</span>
                            <span className="text-slate-400 font-normal">({day.estimatedMinutes} min)</span>
                          </div>
                          {day.sessionNotes && (
                            <div className="text-[11px] text-slate-500 italic mt-0.5">
                              "{day.sessionNotes}"
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs shrink-0">
                          <span className="text-slate-500">
                            Przed: <strong>{day.prePainVas ?? '-'}</strong>/10
                          </span>
                          <span className="text-slate-400">→</span>
                          <span className="text-emerald-600 font-semibold">
                            Po: <strong>{day.postPainVas ?? '-'}</strong>/10
                          </span>
                          {day.prePainVas !== undefined && day.postPainVas !== undefined && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[11px]">
                              -{(day.prePainVas - day.postPainVas).toFixed(0)} VAS
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Brak ukończonych sesji w aktywnym planie.</p>
                )}
              </div>

              {/* Pain Reports Section */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-rose-500" />
                  <span>Historia bólu uwzględniona w dokumencie ({appState.painHistory.length}):</span>
                </h3>
                {appState.painHistory.length > 0 ? (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                    {appState.painHistory.slice(-4).reverse().map((rep) => (
                      <div key={rep.id} className="p-3 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-3">
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {new Date(rep.date).toLocaleDateString('pl-PL')} • {rep.region === 'neck' ? 'Szyja' : rep.region === 'nape' ? 'Kark' : 'Kręgosłup'} ({rep.character})
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {rep.aiAnalysis?.primarySuspicion || 'Wpis do dziennika'}
                          </div>
                        </div>
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
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Brak zarejestrowanych wpisów bólowych.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 bg-white dark:bg-slate-900 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Format A4 • Gotowy do wydruku i konsultacji z lekarzem lub fizjoterapeutą</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
            >
              Zamknij
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition-colors cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Pobierz ({currentFilename.substring(0, 24)}...)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
