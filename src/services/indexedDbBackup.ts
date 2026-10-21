import { AppState, PrivacyStorageService } from './privacyStorage';

export interface StateBackupRecord {
  id: string;
  timestamp: number;
  createdAtIso: string;
  triggerType: 'cyclic_auto' | 'manual' | 'session_completed' | 'pre_restore';
  label?: string;
  state: AppState;
  metadata: {
    patientName: string;
    completedSessionsCount: number;
    painHistoryCount: number;
    streakDays: number;
    dataSizeBytes: number;
    appVersion: string;
  };
}

export interface BackupFileEnvelope {
  app: 'FizjoSzyja';
  version: string;
  exportedAt: string;
  deviceInfo: string;
  metadata: {
    patientName: string;
    streakDays: number;
    totalCompletedSessions: number;
    painHistoryCount: number;
    primaryGoal?: string;
  };
  state: AppState;
}

const DB_NAME = 'FizjoSzyja_OfflineDatabase';
const DB_VERSION = 1;
const STORE_NAME = 'app_state_backups';
const MAX_CYCLIC_BACKUPS = 25; // Retain up to 25 rolling snapshots in browser memory

/**
 * Helper to safely open the IndexedDB database.
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB nie jest obsługiwane w tym środowisku'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('triggerType', 'triggerType', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Nie udało się otworzyć bazy IndexedDB'));
  });
}

export class IndexedDbBackupService {
  /**
   * Generates metadata metrics for a given state snapshot.
   */
  private static computeMetadata(state: AppState) {
    const rawJson = JSON.stringify(state);
    const completedSessions = state.profile.totalCompletedSessions || 
      (state.profile.completedSessionDates?.length || 0);

    return {
      patientName: state.profile.name || 'Pacjent FizjoSzyja',
      completedSessionsCount: completedSessions,
      painHistoryCount: Array.isArray(state.painHistory) ? state.painHistory.length : 0,
      streakDays: state.profile.streakDays || 0,
      dataSizeBytes: new Blob([rawJson]).size,
      appVersion: '2.5.0'
    };
  }

  /**
   * Saves an AppState snapshot into IndexedDB.
   */
  public static async saveBackup(
    state: AppState,
    triggerType: 'cyclic_auto' | 'manual' | 'session_completed' | 'pre_restore' = 'cyclic_auto',
    label?: string
  ): Promise<StateBackupRecord> {
    const now = new Date();
    const id = `backup-${now.getTime()}-${Math.random().toString(36).substring(2, 7)}`;
    const metadata = this.computeMetadata(state);

    const record: StateBackupRecord = {
      id,
      timestamp: now.getTime(),
      createdAtIso: now.toISOString(),
      triggerType,
      label: label || (
        triggerType === 'cyclic_auto' ? 'Automatyczna kopia cykliczna' :
        triggerType === 'session_completed' ? 'Kopia po ukończeniu sesji' :
        triggerType === 'pre_restore' ? 'Kopia bezpieczeństwa przed przywróceniem' :
        'Ręczna kopia zapasowa'
      ),
      state: JSON.parse(JSON.stringify(state)),
      metadata
    };

    try {
      const db = await openDatabase();
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const req = store.put(record);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });

      // Maintain rolling retention limit for cyclic auto backups
      await this.pruneOldBackups(MAX_CYCLIC_BACKUPS);

      // Record last backup timestamp in localStorage for fast UI rendering
      try {
        localStorage.setItem('fizjo_last_indexeddb_backup_at', now.toISOString());
        localStorage.setItem('fizjo_last_indexeddb_backup_id', id);
      } catch {
        // Storage quota or permission
      }

      return record;
    } catch (error) {
      console.warn('Błąd podczas zapisu kopii w IndexedDB:', error);
      throw error;
    }
  }

  /**
   * Retrieves all backups sorted newest first.
   */
  public static async getBackupsList(): Promise<StateBackupRecord[]> {
    try {
      const db = await openDatabase();
      return await new Promise<StateBackupRecord[]>((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('timestamp');
        const req = index.openCursor(null, 'prev'); // Newest first

        const results: StateBackupRecord[] = [];
        req.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor) {
            results.push(cursor.value);
            cursor.continue();
          } else {
            resolve(results);
          }
        };
        req.onerror = () => reject(req.error);
      });
    } catch (error) {
      console.warn('Błąd odczytu listy kopii z IndexedDB:', error);
      return [];
    }
  }

  /**
   * Retrieves a single backup by ID.
   */
  public static async getBackupById(id: string): Promise<StateBackupRecord | null> {
    try {
      const db = await openDatabase();
      return await new Promise<StateBackupRecord | null>((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const req = store.get(id);

        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch (error) {
      console.warn(`Błąd odczytu kopii o ID ${id} z IndexedDB:`, error);
      return null;
    }
  }

  /**
   * Restores an AppState from a specific backup ID.
   * Automatically creates a pre_restore backup of current active state first!
   */
  public static async restoreBackup(
    id: string,
    currentState?: AppState
  ): Promise<AppState | null> {
    try {
      const backup = await this.getBackupById(id);
      if (!backup || !backup.state) {
        throw new Error('Nie znaleziono wybranej kopii w bazie IndexedDB.');
      }

      // If currentState is provided, make a safety backup of current state
      if (currentState) {
        try {
          await this.saveBackup(currentState, 'pre_restore', 'Kopia bezpieczeństwa przed przywróceniem');
        } catch {
          // Continue restore even if safety backup fails
        }
      }

      // Persist restored state to primary storage (localStorage)
      PrivacyStorageService.saveState(backup.state);
      return backup.state;
    } catch (error) {
      console.error('Błąd przywracania kopii z IndexedDB:', error);
      throw error;
    }
  }

  /**
   * Deletes a single backup by ID.
   */
  public static async deleteBackup(id: string): Promise<boolean> {
    try {
      const db = await openDatabase();
      return await new Promise<boolean>((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const req = store.delete(id);

        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    } catch (error) {
      console.warn(`Błąd usuwania kopii ${id} z IndexedDB:`, error);
      return false;
    }
  }

  /**
   * Clears all backups stored in IndexedDB.
   */
  public static async clearAllBackups(): Promise<boolean> {
    try {
      const db = await openDatabase();
      return await new Promise<boolean>((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const req = store.clear();

        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    } catch (error) {
      console.warn('Błąd czyszczenia magazynu kopii w IndexedDB:', error);
      return false;
    }
  }

  /**
   * Prunes older cyclic backups keeping the most recent N records.
   */
  public static async pruneOldBackups(keepCount: number = MAX_CYCLIC_BACKUPS): Promise<number> {
    try {
      const all = await this.getBackupsList();
      // Keep manual and pre_restore if possible, or prune strictly beyond threshold
      if (all.length <= keepCount) return 0;

      const toDelete = all.slice(keepCount);
      const db = await openDatabase();
      let deletedCount = 0;

      for (const item of toDelete) {
        await new Promise<void>((resolve) => {
          const transaction = db.transaction([STORE_NAME], 'readwrite');
          const store = transaction.objectStore(STORE_NAME);
          const req = store.delete(item.id);
          req.onsuccess = () => {
            deletedCount++;
            resolve();
          };
          req.onerror = () => resolve();
        });
      }

      return deletedCount;
    } catch {
      return 0;
    }
  }

  /**
   * Downloads a complete JSON backup file to the user's local disk,
   * enabling seamless offline migration across devices without cloud.
   */
  public static downloadBackupFile(state: AppState, customFilename?: string): void {
    if (typeof window === 'undefined') return;

    const now = new Date();
    const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = customFilename || `fizjoszyja_backup_${dateStr}.json`;

    const envelope: BackupFileEnvelope = {
      app: 'FizjoSzyja',
      version: '2.5.0',
      exportedAt: now.toISOString(),
      deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent : 'Browser Client',
      metadata: {
        patientName: state.profile?.name || 'Pacjent FizjoSzyja',
        streakDays: state.profile?.streakDays || 0,
        totalCompletedSessions: state.profile?.totalCompletedSessions || 0,
        painHistoryCount: state.painHistory?.length || 0,
        primaryGoal: state.profile?.primaryGoal
      },
      state: state
    };

    const jsonString = JSON.stringify(envelope, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Reads, parses, and validates a JSON backup file uploaded by the user.
   */
  public static async parseBackupFile(file: File): Promise<{
    success: boolean;
    state?: AppState;
    metadata?: BackupFileEnvelope['metadata'];
    exportedAt?: string;
    error?: string;
  }> {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      // Support either the envelope format ({ state: ... }) or direct AppState
      let stateToValidate: AppState | null = null;
      let envelopeMeta: BackupFileEnvelope['metadata'] | undefined;
      let exportedAt: string | undefined;

      if (parsed.app === 'FizjoSzyja' && parsed.state) {
        stateToValidate = parsed.state;
        envelopeMeta = parsed.metadata;
        exportedAt = parsed.exportedAt;
      } else if (parsed.profile && parsed.activePlan) {
        stateToValidate = parsed as AppState;
      }

      if (!stateToValidate || !stateToValidate.profile || !stateToValidate.activePlan) {
        return {
          success: false,
          error: 'Nieprawidłowa struktura pliku kopii zapasowej FizjoSzyja. Brak wymaganych węzłów profilu lub planu treningowego.'
        };
      }

      return {
        success: true,
        state: stateToValidate,
        metadata: envelopeMeta,
        exportedAt
      };
    } catch (err: any) {
      return {
        success: false,
        error: `Błąd przetwarzania pliku JSON: ${err?.message || 'Uszkodzony format pliku'}`
      };
    }
  }

  /**
   * Gets the last known backup time from localStorage or null.
   */
  public static getLastBackupTime(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem('fizjo_last_indexeddb_backup_at');
    } catch {
      return null;
    }
  }
}
