import React, { useState, useRef } from 'react';
import { 
  Database, Download, Upload, RefreshCw, HardDrive, 
  CheckCircle2, Clock, Trash2, ArrowUpRight, ShieldCheck, 
  AlertCircle, ChevronDown, ChevronUp, FileCode, Smartphone,
  Info, Sparkles
} from 'lucide-react';
import { AppState } from '../services/privacyStorage';
import { StateBackupRecord } from '../services/indexedDbBackup';
import { useCyclicIndexedDbBackup } from '../hooks/useCyclicIndexedDbBackup';

interface Props {
  appState: AppState;
  onUpdateState: (newState: AppState) => void;
}

export const OfflineBackupManagerCard: React.FC<Props> = ({
  appState,
  onUpdateState
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showBackupsList, setShowBackupsList] = useState<boolean>(false);
  const [showHowItWorks, setShowHowItWorks] = useState<boolean>(false);
  const [confirmRestoreId, setConfirmRestoreId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const {
    lastBackupTime,
    isBackingUp,
    backupsList,
    feedbackToast,
    triggerManualBackup,
    downloadBackupData,
    restoreFromBackupId,
    deleteBackupRecord,
    clearAllBackups,
    restoreFromFile
  } = useCyclicIndexedDbBackup({
    appState,
    onUpdateState,
    intervalMs: 300000, // 5 minutes cyclic backup
    enableCyclicBackup: true
  });

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    
    setIsProcessing(true);
    try {
      await restoreFromFile(file);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleConfirmRestore = async (id: string) => {
    setIsProcessing(true);
    try {
      await restoreFromBackupId(id);
      setConfirmRestoreId(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTimeAgo = (isoString: string | null) => {
    if (!isoString) return 'Brak zapisanych kopii';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) return 'Przed chwilą';
    if (diffMinutes < 60) return `${diffMinutes} min temu`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} godz. temu`;
    return new Date(isoString).toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} kB`;
  };

  return (
    <div 
      id="offline-backup-manager-card"
      className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6"
    >
      {/* Toast Notification */}
      {feedbackToast && (
        <div 
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between gap-2 shadow-md transition-all ${
            feedbackToast.type === 'success' 
              ? 'bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200' 
              : feedbackToast.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
              : 'bg-teal-50 dark:bg-teal-950/80 border border-teal-300 dark:border-teal-800 text-teal-800 dark:text-teal-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackToast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
            {feedbackToast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />}
            {feedbackToast.type === 'info' && <Info className="w-4 h-4 text-teal-500 shrink-0" />}
            <span>{feedbackToast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 border border-teal-200/70 dark:border-teal-800/60 flex items-center justify-center shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Kopie Zapasowe & Przenoszenie Danych
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>IndexedDB • Auto-zapis co 5 min</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Stan aplikacji jest cyklicznie zabezpieczany w bezpiecznej pamięci Twojej przeglądarki (IndexedDB). Możesz też pobrać pełny plik backupu, by przenieść postępy na inne urządzenie bez chmury.
            </p>
          </div>
        </div>

        {/* Quick status pill */}
        <div className="flex items-center gap-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl px-3.5 py-2 self-start md:self-auto shrink-0">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 dark:text-slate-400">Ostatnia kopia:</span>
          <strong className="text-slate-800 dark:text-slate-200 font-mono">
            {formatTimeAgo(lastBackupTime)}
          </strong>
        </div>
      </div>

      {/* Main Action Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Primary requested button: Pobierz backup danych */}
        <button
          id="download-backup-data-btn"
          type="button"
          onClick={downloadBackupData}
          className="flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-teal-500/25 transition-all cursor-pointer group"
          title="Pobierz kompletny plik JSON z historią sesji, bólu i planem terapeutycznym"
        >
          <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
          <span>Pobierz backup danych</span>
        </button>

        {/* Secondary: Wczytaj z pliku */}
        <button
          id="upload-backup-file-btn"
          type="button"
          disabled={isProcessing}
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-50"
        >
          <Upload className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>Wczytaj backup z pliku</span>
        </button>

        {/* Hidden File Input */}
        <input 
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Manual Instant Backup */}
        <button
          id="create-manual-backup-btn"
          type="button"
          disabled={isBackingUp}
          onClick={() => triggerManualBackup()}
          className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-800 dark:text-teal-200 font-bold text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-teal-600 dark:text-teal-400 ${isBackingUp ? 'animate-spin' : ''}`} />
          <span>Utwórz kopię w IndexedDB</span>
        </button>
      </div>

      {/* How device transfer works toggle */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowHowItWorks(!showHowItWorks)}
          className="flex items-center gap-1.5 text-xs text-teal-700 dark:text-teal-400 font-semibold hover:underline cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Jak przenieść postępy na inne urządzenie bez chmury?</span>
          {showHowItWorks ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showHowItWorks && (
          <div className="mt-3 p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/80 space-y-2 text-xs text-slate-700 dark:text-slate-300">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Prosta migracja offline (100% prywatności):</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px] leading-relaxed">
              <li>Kliknij <strong>"Pobierz backup danych"</strong> – na dysk zostanie pobrany lekki plik <code className="bg-white/80 dark:bg-slate-900 px-1 py-0.5 rounded font-mono">fizjoszyja_backup_....json</code>.</li>
              <li>Prześlij ten plik na drugi telefon, tablet lub komputer (np. przez pendrive, Bluetooth, AirDrop, komunikator lub e-mail do samego siebie).</li>
              <li>Otwórz aplikację FizjoSzyja na nowym urządzeniu, wejdź w <em>Profil</em> i kliknij <strong>"Wczytaj backup z pliku"</strong>.</li>
              <li>Wszystkie Twoje serie, pomiary kąta protrakcji głowy, historia bólu i zaplanowane przypomnienia zostaną natychmiast przywrócone!</li>
            </ol>
          </div>
        )}
      </div>

      {/* Expandable Snapshots History in IndexedDB */}
      <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
        <button
          id="toggle-indexeddb-snapshots-btn"
          type="button"
          onClick={() => setShowBackupsList(!showBackupsList)}
          className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            <HardDrive className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Migawek w pamięci IndexedDB:</span>
            <span className="px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 text-[10px] font-mono">
              {backupsList.length} zapisów
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>{showBackupsList ? 'Zwiń listę' : 'Rozwiń historię kopii'}</span>
            {showBackupsList ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showBackupsList && (
          <div className="mt-4 space-y-3">
            {backupsList.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 p-4 text-center">
                Baza IndexedDB jest pusta. Kolejna autokopia zostanie utworzona w ciągu najbliższych kilku minut lub po kliknięciu "Utwórz kopię w IndexedDB".
              </p>
            ) : (
              <>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
                  <span>Ostatnie automatyczne i ręczne migawki stanu:</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Czy na pewno chcesz wyczyścić wszystkie lokalne kopie zapasowe z IndexedDB?')) {
                        clearAllBackups();
                      }
                    }}
                    className="text-rose-600 hover:text-rose-700 font-semibold hover:underline cursor-pointer"
                  >
                    Wyczyść historię kopii
                  </button>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden text-xs max-h-96 overflow-y-auto">
                  {backupsList.map((record) => {
                    const isConfirmingThis = confirmRestoreId === record.id;
                    const dateObj = new Date(record.createdAtIso);
                    const formattedDate = dateObj.toLocaleDateString('pl-PL', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    });
                    const formattedTime = dateObj.toLocaleTimeString('pl-PL', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    });

                    return (
                      <div 
                        key={record.id}
                        className="p-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 dark:text-white font-mono">
                              {formattedDate} {formattedTime}
                            </span>

                            {/* Badge Trigger Type */}
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              record.triggerType === 'cyclic_auto'
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                : record.triggerType === 'manual'
                                ? 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300'
                                : record.triggerType === 'session_completed'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            }`}>
                              {record.triggerType === 'cyclic_auto' ? 'Autokopia cykliczna' :
                               record.triggerType === 'manual' ? 'Ręczna' :
                               record.triggerType === 'session_completed' ? 'Po treningu' : 'Przed przywróceniem'}
                            </span>

                            <span className="text-[11px] text-slate-400 font-mono">
                              {formatBytes(record.metadata.dataSizeBytes)}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-wrap">
                            <span>Pacjent: <strong>{record.metadata.patientName}</strong></span>
                            <span>•</span>
                            <span>Ukończone sesje: <strong>{record.metadata.completedSessionsCount}</strong></span>
                            <span>•</span>
                            <span>Historia bólu: <strong>{record.metadata.painHistoryCount}</strong></span>
                            <span>•</span>
                            <span>Ciągłość: <strong>{record.metadata.streakDays} dni</strong></span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                          {isConfirmingThis ? (
                            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 p-1.5 rounded-xl">
                              <span className="text-[11px] text-amber-800 dark:text-amber-200 font-bold px-1">
                                Zastąpić obecny stan?
                              </span>
                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() => handleConfirmRestore(record.id)}
                                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                              >
                                Tak, przywróć
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmRestoreId(null)}
                                className="px-2 py-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 text-xs font-semibold cursor-pointer"
                              >
                                Anuluj
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => setConfirmRestoreId(record.id)}
                                className="px-3 py-1.5 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/40 hover:bg-teal-100 text-teal-800 dark:text-teal-300 text-xs font-bold transition-all cursor-pointer"
                                title="Przywróć stan aplikacji z tej migawki"
                              >
                                Przywróć
                              </button>

                              <button
                                type="button"
                                onClick={() => deleteBackupRecord(record.id)}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                title="Usuń tę migawkę z IndexedDB"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
