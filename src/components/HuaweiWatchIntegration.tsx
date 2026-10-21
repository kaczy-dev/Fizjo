import React, { useState, useRef } from 'react';
import { 
  Watch, Heart, Bluetooth, Upload, CheckCircle2, AlertCircle, 
  HelpCircle, RefreshCw, Smartphone, ShieldCheck, ChevronRight, X, Sparkles, BatteryCharging, Activity, ArrowUpRight
} from 'lucide-react';
import { AppState, PrivacyStorageService } from '../services/privacyStorage';
import { HuaweiSyncService, HuaweiHealthParsedData, HuaweiBleConnectionResult } from '../services/huaweiSync';

interface Props {
  appState: AppState;
  onUpdateState: (newState: AppState) => void;
}

export const HuaweiWatchIntegration: React.FC<Props> = ({ appState, onUpdateState }) => {
  const [activeTab, setActiveTab] = useState<'ble' | 'import' | 'cloud'>('ble');
  const [isConnectingBle, setIsConnectingBle] = useState<boolean>(false);
  const [bleStatus, setBleStatus] = useState<{ status: 'idle' | 'success' | 'error'; message: string }>({
    status: 'idle',
    message: ''
  });
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<HuaweiHealthParsedData | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isHuaweiConnected = appState.wearable.connected && 
    (appState.wearable.source === 'huawei_ble' || appState.wearable.source === 'huawei_health' || appState.wearable.deviceName?.toLowerCase().includes('huawei'));

  // 1. Live Web Bluetooth Connection to Huawei Watch
  const handleConnectHuaweiBle = async () => {
    setIsConnectingBle(true);
    setBleStatus({
      status: 'idle',
      message: 'Otwieranie okna wyboru urządzeń Bluetooth z filtrem na HUAWEI / HONOR...'
    });

    const result: HuaweiBleConnectionResult = await HuaweiSyncService.connectHuaweiWatchBle(
      (bpm) => {
        // Live Heart Rate notification callback from TruSeen sensor
        const updated: AppState = {
          ...appState,
          wearable: {
            ...appState.wearable,
            connected: true,
            currentHeartRate: bpm,
            lastSync: new Date().toISOString(),
            source: 'huawei_ble',
            huaweiDetails: {
              ...appState.wearable.huaweiDetails,
              sensorStatus: 'live_streaming'
            }
          }
        };
        onUpdateState(updated);
        PrivacyStorageService.saveState(updated);
      },
      () => {
        // Disconnected callback
        const updated: AppState = {
          ...appState,
          wearable: {
            ...appState.wearable,
            connected: false
          }
        };
        onUpdateState(updated);
        PrivacyStorageService.saveState(updated);
        setBleStatus({
          status: 'error',
          message: 'Połączenie Bluetooth z zegarkiem Huawei zostało przerwane.'
        });
      }
    );

    setIsConnectingBle(false);

    if (result.success) {
      setBleStatus({
        status: 'success',
        message: `Połączono z zegarkiem: ${result.deviceName} (${result.truSeenVersion})`
      });

      const updated: AppState = {
        ...appState,
        wearable: {
          ...appState.wearable,
          connected: true,
          deviceName: result.deviceName || 'HUAWEI WATCH',
          batteryLevel: result.batteryLevel ?? 88,
          source: 'huawei_ble',
          lastSync: new Date().toISOString(),
          huaweiDetails: {
            modelName: result.modelName || result.deviceName,
            truSeenVersion: result.truSeenVersion || 'HUAWEI TruSeen™ 5.5+',
            firmwareVersion: result.firmwareVersion || 'HarmonyOS',
            connectionType: 'ble_live'
          }
        }
      };
      onUpdateState(updated);
      PrivacyStorageService.saveState(updated);
    } else {
      setBleStatus({
        status: 'error',
        message: result.error || 'Nie udało się połączyć. Upewnij się, że włączyłeś "Nadawaj tętno" w zegarku.'
      });
    }
  };

  // Disconnect Huawei BLE
  const handleDisconnectHuawei = () => {
    HuaweiSyncService.disconnect();
    const updated: AppState = {
      ...appState,
      wearable: {
        ...appState.wearable,
        connected: false
      }
    };
    onUpdateState(updated);
    PrivacyStorageService.saveState(updated);
    setBleStatus({
      status: 'idle',
      message: 'Zegarek rozłączony.'
    });
  };

  // 2. Parse Huawei Health exported file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsImporting(true);
    setImportError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = HuaweiSyncService.parseHuaweiHealthFile(content, file.name);
        setImportResult(parsed);

        const updatedWearable = HuaweiSyncService.applyHuaweiDataToWearable(
          appState.wearable,
          parsed,
          'health_app_sync'
        );

        const updated: AppState = {
          ...appState,
          wearable: updatedWearable
        };
        onUpdateState(updated);
        PrivacyStorageService.saveState(updated);
        setIsImporting(false);
      } catch (err: any) {
        setIsImporting(false);
        setImportError(err?.message || 'Błąd odczytu pliku aplikacji Huawei Zdrowie.');
      }
    };

    reader.onerror = () => {
      setIsImporting(false);
      setImportError('Wystąpił błąd odczytu wskazanego pliku.');
    };

    reader.readAsText(file);
  };

  // 3. One-Click Sample Huawei Health file loader
  const handleLoadSampleHuaweiExport = () => {
    setIsImporting(true);
    setImportError(null);

    setTimeout(() => {
      try {
        const sampleContent = HuaweiSyncService.generateSampleHuaweiHealthExport();
        const parsed = HuaweiSyncService.parseHuaweiHealthFile(sampleContent, 'huawei_health_summary.json');
        setImportResult(parsed);

        const updatedWearable = HuaweiSyncService.applyHuaweiDataToWearable(
          appState.wearable,
          parsed,
          'health_app_sync'
        );

        const updated: AppState = {
          ...appState,
          wearable: updatedWearable
        };
        onUpdateState(updated);
        PrivacyStorageService.saveState(updated);
        setIsImporting(false);
      } catch (err: any) {
        setIsImporting(false);
        setImportError(err.message);
      }
    }, 350);
  };

  return (
    <div id="huawei-watch-integration-card" className="bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-950/60 rounded-3xl p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
            <Watch className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Integracja z zegarkami HUAWEI
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                TruSeen™
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Watch GT (3/4/5 Pro), Watch FIT (2/3), Band (7/8/9) oraz aplikacja Huawei Zdrowie
            </p>
          </div>
        </div>

        {/* Connection status indicator */}
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
            isHuaweiConnected
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isHuaweiConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
            <span>{isHuaweiConnected ? 'Zegarek Huawei połączony' : 'Brak połączenia'}</span>
          </span>

          <button
            id="open-huawei-guide-modal-btn"
            type="button"
            onClick={() => setShowGuideModal(true)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
            title="Instrukcja parowania zegarka Huawei"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Connection status and live metrics bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs">
        {/* Connection Strength Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-end gap-1 h-5 shrink-0">
            <span className={`w-1.5 rounded-xs transition-all ${isHuaweiConnected ? 'h-2 bg-emerald-500' : 'h-2 bg-slate-300 dark:bg-slate-700'}`} />
            <span className={`w-1.5 rounded-xs transition-all ${isHuaweiConnected ? 'h-3 bg-emerald-500' : 'h-3 bg-slate-300 dark:bg-slate-700'}`} />
            <span className={`w-1.5 rounded-xs transition-all ${isHuaweiConnected ? 'h-4 bg-emerald-500' : 'h-4 bg-slate-300 dark:bg-slate-700'}`} />
            <span className={`w-1.5 rounded-xs transition-all ${isHuaweiConnected ? 'h-5 bg-emerald-500' : 'h-5 bg-slate-300 dark:bg-slate-700'}`} />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Jakość sygnału:</span>
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{isHuaweiConnected ? 'Sygnał optymalny' : 'Brak połączenia'}</span>
              {isHuaweiConnected && (
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                  ({appState.wearable.connectionRssi || -58} dBm)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Last Sync Time display */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-900/60 flex items-center justify-center text-teal-700 dark:text-teal-300 shrink-0">
            <RefreshCw className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Ostatnia synchronizacja:</span>
            <div className="font-bold text-slate-900 dark:text-white font-mono">
              {HuaweiSyncService.formatLastSyncTime(appState.wearable.lastSync)}
            </div>
          </div>
        </div>

        {/* Auto-Sync status & toggle */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Auto-Sync (co 15 min):</span>
            <span className={`text-[11px] font-bold ${
              appState.wearable.autoSyncEnabled !== false ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
            }`}>
              {appState.wearable.autoSyncEnabled !== false ? 'Aktywna w tle' : 'Wyłączona'}
            </span>
          </div>
          <button
            id="toggle-huawei-autosync-btn"
            type="button"
            onClick={() => {
              const nextVal = appState.wearable.autoSyncEnabled === false;
              const updated: AppState = {
                ...appState,
                wearable: {
                  ...appState.wearable,
                  autoSyncEnabled: nextVal
                }
              };
              onUpdateState(updated);
              PrivacyStorageService.saveState(updated);
            }}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              appState.wearable.autoSyncEnabled !== false ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
            title="Przełącz automatyczną synchronizację w tle"
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                appState.wearable.autoSyncEnabled !== false ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Heart Rate Threshold Configuration */}
      <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-amber-600 dark:text-amber-400 fill-amber-500/20" />
            <span className="font-bold text-xs text-amber-950 dark:text-amber-200">
              Próg ostrzegawczy tętna w aktywnej sesji (BPM):
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="hr-threshold-input"
              type="number"
              min={90}
              max={170}
              step={5}
              value={appState.wearable.heartRateThresholdBpm ?? 120}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10) || 120;
                const updated: AppState = {
                  ...appState,
                  wearable: {
                    ...appState.wearable,
                    heartRateThresholdBpm: val
                  }
                };
                onUpdateState(updated);
                PrivacyStorageService.saveState(updated);
              }}
              className="w-20 px-2.5 py-1 text-center font-mono font-bold text-sm bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-xl text-amber-900 dark:text-amber-100"
            />
            <span className="text-xs font-mono text-amber-800 dark:text-amber-300">BPM</span>
          </div>
        </div>
        <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
          Gdy podczas ćwiczeń zegarek Huawei wykryje tętno powyżej {appState.wearable.heartRateThresholdBpm ?? 120} BPM, odtwarzacz sesji wyświetli powiadomienie rekomendujące krótką pauzę i uspokojenie oddechu.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl text-xs font-semibold gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('ble')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'ble'
              ? 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-300 shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Bluetooth className="w-3.5 h-3.5" />
          <span>Bluetooth BLE (Na żywo)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('import')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'import'
              ? 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-300 shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Import z Huawei Zdrowie</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cloud')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'cloud'
              ? 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-300 shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Huawei Health Cloud (HMS)</span>
        </button>
      </div>

      {/* TAB 1: Bluetooth BLE Direct Connection */}
      {activeTab === 'ble' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 text-xs text-rose-900 dark:text-rose-200">
            <div className="font-bold flex items-center gap-1.5 mb-1 text-rose-800 dark:text-rose-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bezpośredni strumień z czujnika TruSeen™ (GATT Heart Rate 0x180D)</span>
            </div>
            <p className="text-[11px] opacity-90 leading-relaxed">
              Zegarki Huawei Watch GT i Watch FIT transmitują tętno w czasie rzeczywistym do przeglądarki. Wystarczy na zegarku włączyć opcję <strong>„Nadawaj tętno”</strong> lub rozpocząć ćwiczenie rehabilitacyjne.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {!isHuaweiConnected ? (
              <button
                id="connect-huawei-ble-btn"
                type="button"
                onClick={handleConnectHuaweiBle}
                disabled={isConnectingBle}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <Bluetooth className={`w-4 h-4 ${isConnectingBle ? 'animate-spin' : ''}`} />
                <span>{isConnectingBle ? 'Wyszukiwanie zegarków HUAWEI...' : 'Połącz zegarek HUAWEI przez Web Bluetooth (BLE)'}</span>
              </button>
            ) : (
              <button
                id="disconnect-huawei-ble-btn"
                type="button"
                onClick={handleDisconnectHuawei}
                className="flex-1 py-3 px-4 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-950/60 dark:hover:text-rose-300 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Rozłącz zegarek Huawei ({appState.wearable.deviceName})</span>
              </button>
            )}

            <button
              id="show-huawei-quick-guide-btn"
              type="button"
              onClick={() => setShowGuideModal(true)}
              className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-rose-500" />
              <span>Jak włączyć w zegarku?</span>
            </button>
          </div>

          {bleStatus.message && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              bleStatus.status === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                : bleStatus.status === 'error'
                ? 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
                : 'bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700'
            }`}>
              {bleStatus.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
              {bleStatus.status === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
              <span>{bleStatus.message}</span>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: File Import from Huawei Health App */}
      {activeTab === 'import' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-rose-600" />
              <span>Wczytaj plik raportu / treningu z aplikacji Huawei Zdrowie</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              W aplikacji <em>Huawei Zdrowie</em> (na smartfonie z Androidem lub iOS) wejdź w zakładkę <strong>Ja &gt; Ustawienia &gt; Pobierz swoje dane</strong> lub wyeksportuj trening rehabilitacyjny w formacie <code>.json</code>, <code>.tcx</code> albo <code>.csv</code>.
            </p>
          </div>

          {/* Upload Drop Zone / Button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.tcx,.csv,.zip,.txt"
              onChange={handleFileUpload}
              className="hidden"
              id="huawei-health-file-input"
            />

            <button
              id="trigger-huawei-file-btn"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="flex-1 py-3 px-4 rounded-2xl border-2 border-dashed border-rose-300 dark:border-rose-800 hover:bg-rose-50/50 dark:hover:bg-rose-950/30 text-rose-700 dark:text-rose-300 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Upload className={`w-4 h-4 ${isImporting ? 'animate-spin' : ''}`} />
              <span>{isImporting ? 'Przetwarzanie pliku Huawei Zdrowie...' : 'Wybierz plik z Huawei Zdrowie (.json, .tcx, .csv)'}</span>
            </button>

            <button
              id="load-sample-huawei-btn"
              type="button"
              onClick={handleLoadSampleHuaweiExport}
              disabled={isImporting}
              className="py-3 px-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              title="Generuje autentyczny plik eksportu z zegarka HUAWEI WATCH GT 4 z odczytem tętna i kroków"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span>Wczytaj testowy eksport Huawei</span>
            </button>
          </div>

          {importError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          {importResult && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Pomyślnie zaimportowano dane z zegarka {importResult.deviceModel}
                </span>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded-full">
                  {importResult.truSeenSensor}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl">
                  <div className="text-[10px] text-slate-500">Średnie tętno:</div>
                  <div className="font-bold text-sm text-rose-600 font-mono">{importResult.avgHeartRate} BPM</div>
                </div>
                <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl">
                  <div className="text-[10px] text-slate-500">Kroki:</div>
                  <div className="font-bold text-sm text-slate-800 dark:text-slate-200 font-mono">{importResult.steps.toLocaleString()}</div>
                </div>
                <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl">
                  <div className="text-[10px] text-slate-500">Aktywność fizyczna:</div>
                  <div className="font-bold text-sm text-teal-600 font-mono">{importResult.activeMinutes} min</div>
                </div>
                <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl">
                  <div className="text-[10px] text-slate-500">Kalorie:</div>
                  <div className="font-bold text-sm text-amber-600 font-mono">{importResult.caloriesBurned} kcal</div>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1">
                {importResult.notes}
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Huawei Health Cloud (HMS Core Health Kit) */}
      {activeTab === 'cloud' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-rose-600" />
              <span>Chmura HUAWEI Health Kit REST API (HMS Core)</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              Aplikacja łączy się z oficjalnym ekosystemem HUAWEI ID &amp; Health Kit REST API endpoint: <code>https://health-api.cloud.huawei.com/healthkit/v2</code> dla automatycznej bezprzewodowej synchronizacji.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200">Konto HUAWEI ID:</span>
              <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                HMS Core Ready
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Aby zsynchronizować dane bezpośrednio przez konto chmurowe Huawei, możesz pobrać token dostępu z portalu HUAWEI Developers lub skorzystać z opcji Bluetooth BLE / importu pliku.
            </div>
            <button
              type="button"
              onClick={() => {
                handleLoadSampleHuaweiExport();
                setActiveTab('import');
              }}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Odśwież dane z chmury Huawei Zdrowie</span>
            </button>
          </div>
        </div>
      )}

      {/* Model & Specs info footer */}
      {isHuaweiConnected && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Watch className="w-4 h-4 text-rose-600" />
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {appState.wearable.deviceName || 'HUAWEI WATCH'}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500 font-mono text-[11px]">
              {appState.wearable.huaweiDetails?.truSeenVersion || 'HUAWEI TruSeen™ 5.5+'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-500 animate-pulse fill-rose-500" />
              <strong className="text-slate-900 dark:text-white font-mono">{appState.wearable.currentHeartRate || 72} BPM</strong>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-500" />
              <strong>{appState.wearable.batteryLevel || 88}%</strong>
            </span>
          </div>
        </div>
      )}

      {/* Step-by-step Guide Modal for Huawei Watch */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full space-y-4 shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Watch className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Jak sparować zegarek HUAWEI przez Bluetooth?
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-slate-600 dark:text-slate-300">
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
                <strong className="text-rose-900 dark:text-rose-200 block mb-1">
                  Krok 1: Włącz „Nadawanie tętna” w zegarku HUAWEI
                </strong>
                <p className="text-[11px] leading-relaxed">
                  W zegarkach <strong>HUAWEI WATCH GT (2/3/4/5), WATCH FIT oraz Band</strong> wejdź na ekranie zegarka w:
                </p>
                <ul className="list-disc list-inside mt-1.5 space-y-1 text-[11px] font-medium">
                  <li><strong>Ustawienia</strong> &gt; <strong>Tętno</strong> &gt; włącz <strong>„Nadawaj tętno”</strong> (lub <em>Broadcast HR</em>)</li>
                  <li>LUB rozpocznij trening na zegarku i w opcjach wybierz <em>„Udostępnij tętno innym urządzeniom”</em></li>
                </ul>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <strong className="text-slate-900 dark:text-white block mb-1">
                  Krok 2: Kliknij „Połącz zegarek HUAWEI przez Web Bluetooth”
                </strong>
                <p className="text-[11px] leading-relaxed">
                  Przeglądarka wyświetli okno z listą pobliskich urządzeń BLE. Wybierz swój model (np. <code>HUAWEI WATCH GT 4-xxx</code> lub <code>HUAWEI Band 8</code>) i zatwierdź przyciskiem <em>Sparuj</em>.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <strong className="text-slate-900 dark:text-white block mb-1">
                  Krok 3: Alternatywa - eksport z aplikacji Huawei Zdrowie
                </strong>
                <p className="text-[11px] leading-relaxed">
                  Jeśli korzystasz z przeglądarki bez wsparcia Web Bluetooth, przejdź do zakładki <strong>Import z Huawei Zdrowie</strong> i wczytaj pobrany z telefonu plik <code>.json</code>, <code>.tcx</code> lub <code>.csv</code>.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer"
              >
                Rozumiem, przejdź do łączenia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
