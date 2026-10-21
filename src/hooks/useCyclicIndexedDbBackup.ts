import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState } from '../services/privacyStorage';
import { IndexedDbBackupService, StateBackupRecord } from '../services/indexedDbBackup';

interface UseCyclicIndexedDbBackupOptions {
  appState: AppState;
  onUpdateState: (newState: AppState) => void;
  intervalMs?: number; // Default 5 minutes (300,000 ms)
  enableCyclicBackup?: boolean;
}

export function useCyclicIndexedDbBackup({
  appState,
  onUpdateState,
  intervalMs = 300000, // 5 minutes
  enableCyclicBackup = true
}: UseCyclicIndexedDbBackupOptions) {
  const [lastBackupTime, setLastBackupTime] = useState<string | null>(() => 
    IndexedDbBackupService.getLastBackupTime()
  );
  const [isBackingUp, setIsBackingUp] = useState<boolean>(false);
  const [backupsList, setBackupsList] = useState<StateBackupRecord[]>([]);
  const [feedbackToast, setFeedbackToast] = useState<{
    message: string;
    type: 'success' | 'info' | 'error';
  } | null>(null);

  const stateRef = useRef<AppState>(appState);
  stateRef.current = appState;

  // Clear toast after 4 seconds
  useEffect(() => {
    if (!feedbackToast) return;
    const timer = setTimeout(() => setFeedbackToast(null), 4000);
    return () => clearTimeout(timer);
  }, [feedbackToast]);

  // Load backups list
  const refreshBackupsList = useCallback(async () => {
    try {
      const list = await IndexedDbBackupService.getBackupsList();
      setBackupsList(list);
      return list;
    } catch {
      return [];
    }
  }, []);

  // Initial load of backups list
  useEffect(() => {
    refreshBackupsList();
  }, [refreshBackupsList]);

  // Perform a backup with specified trigger
  const performBackup = useCallback(async (
    trigger: 'cyclic_auto' | 'manual' | 'session_completed' | 'pre_restore' = 'cyclic_auto',
    label?: string,
    showToast: boolean = false
  ) => {
    setIsBackingUp(true);
    try {
      const record = await IndexedDbBackupService.saveBackup(stateRef.current, trigger, label);
      setLastBackupTime(record.createdAtIso);
      await refreshBackupsList();

      if (showToast) {
        setFeedbackToast({
          message: `Utworzono kopię zapasową w pamięci IndexedDB (${new Date(record.createdAtIso).toLocaleTimeString('pl-PL')})`,
          type: 'success'
        });
      }
      return record;
    } catch (err: any) {
      if (showToast) {
        setFeedbackToast({
          message: `Błąd zapisu w IndexedDB: ${err?.message || 'Nieznany błąd'}`,
          type: 'error'
        });
      }
      return null;
    } finally {
      setIsBackingUp(false);
    }
  }, [refreshBackupsList]);

  // Trigger manual backup
  const triggerManualBackup = useCallback(async (label?: string) => {
    return await performBackup('manual', label || 'Ręczna kopia zapasowa', true);
  }, [performBackup]);

  // Download complete JSON backup file (User request: 'Pobierz backup danych')
  const downloadBackupData = useCallback(() => {
    IndexedDbBackupService.downloadBackupFile(stateRef.current);
    setFeedbackToast({
      message: 'Plik kopii zapasowej .json został pomyślnie pobrany.',
      type: 'success'
    });
  }, []);

  // Restore from an IndexedDB backup ID
  const restoreFromBackupId = useCallback(async (id: string) => {
    setIsBackingUp(true);
    try {
      const restored = await IndexedDbBackupService.restoreBackup(id, stateRef.current);
      if (restored) {
        onUpdateState(restored);
        await refreshBackupsList();
        setFeedbackToast({
          message: 'Pomyślnie przywrócono stan aplikacji z kopii IndexedDB.',
          type: 'success'
        });
        return true;
      }
      return false;
    } catch (err: any) {
      setFeedbackToast({
        message: `Nie udało się przywrócić kopii: ${err?.message || 'Błąd odczytu'}`,
        type: 'error'
      });
      return false;
    } finally {
      setIsBackingUp(false);
    }
  }, [onUpdateState, refreshBackupsList]);

  // Delete a backup from IndexedDB
  const deleteBackupRecord = useCallback(async (id: string) => {
    const success = await IndexedDbBackupService.deleteBackup(id);
    if (success) {
      await refreshBackupsList();
      setFeedbackToast({
        message: 'Kopia została usunięta z pamięci IndexedDB.',
        type: 'info'
      });
    }
    return success;
  }, [refreshBackupsList]);

  // Clear all backups from IndexedDB
  const clearAllBackups = useCallback(async () => {
    const success = await IndexedDbBackupService.clearAllBackups();
    if (success) {
      await refreshBackupsList();
      setFeedbackToast({
        message: 'Wyczyszczono historię kopii zapasowych w IndexedDB.',
        type: 'info'
      });
    }
    return success;
  }, [refreshBackupsList]);

  // Import from JSON file
  const restoreFromFile = useCallback(async (file: File) => {
    const result = await IndexedDbBackupService.parseBackupFile(file);
    if (!result.success || !result.state) {
      setFeedbackToast({
        message: result.error || 'Nieprawidłowy plik kopii zapasowej.',
        type: 'error'
      });
      return false;
    }

    try {
      // First save safety backup of current state
      await performBackup('pre_restore', 'Kopia bezpieczeństwa przed importem z pliku', false);

      // Restore
      onUpdateState(result.state);
      await performBackup('manual', `Zaimportowano z pliku: ${file.name}`, false);
      await refreshBackupsList();

      setFeedbackToast({
        message: `Pomyślnie wczytano postępy z pliku "${file.name}"!`,
        type: 'success'
      });
      return true;
    } catch (err: any) {
      setFeedbackToast({
        message: `Błąd podczas przywracania danych: ${err?.message || 'Nieznany błąd'}`,
        type: 'error'
      });
      return false;
    }
  }, [onUpdateState, performBackup, refreshBackupsList]);

  // Cyclic auto-backup loop (every intervalMs)
  useEffect(() => {
    if (!enableCyclicBackup || typeof window === 'undefined') return;

    // Run initial auto-backup after 8 seconds of launch if no backup exists or older than 15 mins
    const initialDelayTimer = setTimeout(() => {
      const last = IndexedDbBackupService.getLastBackupTime();
      const needsInitial = !last || (Date.now() - new Date(last).getTime() > 15 * 60 * 1000);
      if (needsInitial) {
        performBackup('cyclic_auto', 'Początkowa autokopia sesji');
      }
    }, 8000);

    // Cyclic interval
    const cyclicInterval = setInterval(() => {
      performBackup('cyclic_auto');
    }, intervalMs);

    return () => {
      clearTimeout(initialDelayTimer);
      clearInterval(cyclicInterval);
    };
  }, [enableCyclicBackup, intervalMs, performBackup]);

  return {
    lastBackupTime,
    isBackingUp,
    backupsList,
    feedbackToast,
    triggerManualBackup,
    downloadBackupData,
    restoreFromBackupId,
    deleteBackupRecord,
    clearAllBackups,
    restoreFromFile,
    refreshBackupsList,
    performBackup
  };
}
