import React, { useState, useEffect } from 'react';
import { 
  Watch, Heart, Bell, Plus, CheckCircle2, 
  Smartphone, Bluetooth, Activity, ShieldCheck, Clock, Trash2, Send, BatteryCharging, Calendar,
  RefreshCw, Sparkles, TrendingUp, Sliders, Wifi
} from 'lucide-react';
import { AppState, PrivacyStorageService } from '../services/privacyStorage';
import { WearableSyncService } from '../services/wearableSync';
import { HuaweiSyncService } from '../services/huaweiSync';
import { ReminderService } from '../services/reminders';
import { Medication } from '../types';
import { RemindersScheduleView } from './RemindersScheduleView';
import { HuaweiWatchIntegration } from './HuaweiWatchIntegration';
import { RestingHeartRateTrendChart } from './RestingHeartRateTrendChart';

interface Props {
  appState: AppState;
  onUpdateState: (newState: AppState) => void;
}

export const WearablesMedsView: React.FC<Props> = ({ appState, onUpdateState }) => {
  const [subView, setSubView] = useState<'schedule' | 'devices'>('schedule');
  const [connectingBle, setConnectingBle] = useState<boolean>(false);
  const [bleStatusMsg, setBleStatusMsg] = useState<string>('');
  const [notificationPermission, setNotificationPermission] = useState<string>(
    ReminderService.getPermissionStatus()
  );

  // New Medication Modal
  const [showAddMedModal, setShowAddMedModal] = useState<boolean>(false);
  const [newMedName, setNewMedName] = useState<string>('');
  const [newMedDosage, setNewMedDosage] = useState<string>('');
  const [newMedFrequency, setNewMedFrequency] = useState<string>('Rano po posiłku');
  const [newMedTime, setNewMedTime] = useState<string>('08:30');
  const [newMedInstructions, setNewMedInstructions] = useState<string>('Popić szklanką wody.');

  // Handle Web Bluetooth Connection
  const handleConnectBle = async () => {
    setConnectingBle(true);
    setBleStatusMsg('Wyszukiwanie urządzeń Bluetooth (standard Heart Rate)...');

    const result = await WearableSyncService.connectBluetoothHeartRate(
      (bpm) => {
        const updated: AppState = {
          ...appState,
          wearable: {
            ...appState.wearable,
            connected: true,
            currentHeartRate: bpm,
            lastSync: new Date().toISOString(),
            source: 'bluetooth_ble'
          }
        };
        onUpdateState(updated);
        PrivacyStorageService.saveState(updated);
      },
      () => {
        const updated: AppState = {
          ...appState,
          wearable: {
            ...appState.wearable,
            connected: false
          }
        };
        onUpdateState(updated);
        PrivacyStorageService.saveState(updated);
        setBleStatusMsg('Urządzenie rozłączone.');
      }
    );

    setConnectingBle(false);
    if (result.success) {
      setBleStatusMsg(`Pomyślnie połączono z: ${result.deviceName}`);
      const updated: AppState = {
        ...appState,
        wearable: {
          ...appState.wearable,
          connected: true,
          deviceName: result.deviceName || 'Smartwatch BLE',
          source: 'bluetooth_ble',
          lastSync: new Date().toISOString()
        }
      };
      onUpdateState(updated);
      PrivacyStorageService.saveState(updated);
    } else {
      setBleStatusMsg(result.error || 'Nie udało się nawiązać połączenia.');
    }
  };

  // Notification Permissions
  const [isSimulatingSync, setIsSimulatingSync] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<{
    heartRate: number;
    activeMinutes: number;
    steps: number;
    sedentaryAlerts: number;
    batteryLevel: number;
    timestamp: string;
  } | null>(null);
  const [justSynced, setJustSynced] = useState<boolean>(false);

  // Auto-Sync and Last Sync Time relative display
  const [lastSyncDisplay, setLastSyncDisplay] = useState<string>(
    HuaweiSyncService.formatLastSyncTime(appState.wearable.lastSync)
  );
  const [secondsUntilNextSync, setSecondsUntilNextSync] = useState<number>(15 * 60);

  // Automatically update relative timestamp every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setLastSyncDisplay(HuaweiSyncService.formatLastSyncTime(appState.wearable.lastSync));
    }, 10000);
    return () => clearInterval(timer);
  }, [appState.wearable.lastSync]);

  // Keep countdown timer ticking down while app is active
  useEffect(() => {
    if (appState.wearable.autoSyncEnabled === false) return;

    const tick = setInterval(() => {
      setSecondsUntilNextSync((prev) => (prev > 1 ? prev - 1 : 15 * 60));
    }, 1000);
    return () => clearInterval(tick);
  }, [appState.wearable.autoSyncEnabled]);

  // Periodic background task using setInterval that attempts to sync heart rate data every 15 minutes while the app is active
  useEffect(() => {
    if (appState.wearable.autoSyncEnabled === false) {
      return;
    }

    const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
    const intervalId = setInterval(async () => {
      try {
        const { updatedDevice, fetchedBpm } = await HuaweiSyncService.performAutoSync(appState.wearable);
        const updatedState: AppState = {
          ...appState,
          wearable: updatedDevice
        };
        onUpdateState(updatedState);
        PrivacyStorageService.saveState(updatedState);
        setLastSyncDisplay('Przed chwilą');
        setSecondsUntilNextSync(15 * 60);
      } catch (err) {
        console.warn('Periodic Huawei auto-sync error:', err);
      }
    }, FIFTEEN_MINUTES_MS);

    return () => clearInterval(intervalId);
  }, [appState, onUpdateState]);

  // Toggle Auto-Sync
  const handleToggleAutoSync = (enabled: boolean) => {
    const updated: AppState = {
      ...appState,
      wearable: {
        ...appState.wearable,
        autoSyncEnabled: enabled
      }
    };
    onUpdateState(updated);
    PrivacyStorageService.saveState(updated);
  };

  // Change Heart Rate Threshold
  const handleThresholdChange = (threshold: number) => {
    const updated: AppState = {
      ...appState,
      wearable: {
        ...appState.wearable,
        heartRateThresholdBpm: threshold
      }
    };
    onUpdateState(updated);
    PrivacyStorageService.saveState(updated);
  };

  // Simulate Smartwatch sync for demo / manual trigger
  const handleSimulateSync = async () => {
    setIsSimulatingSync(true);

    try {
      // Simulate real Bluetooth/Huawei protocol telemetry fetch with delay
      await new Promise(resolve => setTimeout(resolve, 850));
      const { updatedDevice, fetchedBpm } = await HuaweiSyncService.performAutoSync(appState.wearable);
      const updated: AppState = {
        ...appState,
        wearable: updatedDevice
      };
      onUpdateState(updated);
      PrivacyStorageService.saveState(updated);
      setLastSyncDisplay('Przed chwilą');
      setSecondsUntilNextSync(15 * 60);

      setIsSimulatingSync(false);
      setSyncFeedback({
        heartRate: fetchedBpm,
        activeMinutes: updatedDevice.activeMinutes || 35,
        steps: updatedDevice.todaySteps || 6400,
        sedentaryAlerts: updatedDevice.sedentaryAlertsCount || 2,
        batteryLevel: updatedDevice.batteryLevel || 88,
        timestamp: new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
      setJustSynced(true);

      setTimeout(() => {
        setJustSynced(false);
      }, 4000);
    } catch {
      setIsSimulatingSync(false);
    }
  };

  // Export session data for Apple Health / Google Fit
  const handleExportHealthWorkout = () => {
    WearableSyncService.exportSessionToHealthKitJson({
      durationMinutes: 15,
      caloriesBurned: 58,
      avgHeartRate: appState.wearable.currentHeartRate || 74,
      date: new Date().toISOString(),
      exercisesCompleted: ['Chin Tuck', 'Retrakcja łopatek', 'Odciążenie Brüggera']
    });
  };

  // Notification Permissions
  const handleRequestNotification = async () => {
    const granted = await ReminderService.requestNotificationPermission();
    setNotificationPermission(granted ? 'granted' : 'denied');
    if (granted) {
      const msg = ReminderService.generatePersonalizedMessage('rehab_session', appState.profile, appState.reminders);
      ReminderService.triggerNotification(msg.title, msg.body);
    }
  };

  const handleTestNotification = () => {
    const msg = ReminderService.generatePersonalizedMessage('rehab_session', appState.profile, appState.reminders);
    ReminderService.triggerNotification(msg.title, msg.body);
    alert(`Wysłano personalizowane powiadomienie:\n\nTytuł: ${msg.title}\nTreść: ${msg.body}`);
  };

  // Toggle Medication Taken
  const handleToggleMedTaken = (medId: string, time: string) => {
    const updatedMeds = appState.medications.map(med => {
      if (med.id === medId) {
        const isCurrentlyTaken = !!med.takenToday[time];
        return {
          ...med,
          takenToday: {
            ...med.takenToday,
            [time]: !isCurrentlyTaken
          }
        };
      }
      return med;
    });

    const updated: AppState = {
      ...appState,
      medications: updatedMeds
    };
    onUpdateState(updated);
    PrivacyStorageService.saveState(updated);
  };

  // Add Medication
  const handleAddMedication = () => {
    if (!newMedName.trim()) return;

    const newMed: Medication = {
      id: 'med-' + Date.now(),
      name: newMedName,
      dosage: newMedDosage || '1 dawka',
      frequency: newMedFrequency,
      scheduleTimes: [newMedTime],
      instructions: newMedInstructions,
      takenToday: {}
    };

    const updated: AppState = {
      ...appState,
      medications: [...appState.medications, newMed]
    };
    onUpdateState(updated);
    PrivacyStorageService.saveState(updated);

    setNewMedName('');
    setNewMedDosage('');
    setShowAddMedModal(false);
  };

  const handleDeleteMedication = (id: string) => {
    const updated: AppState = {
      ...appState,
      medications: appState.medications.filter(m => m.id !== id)
    };
    onUpdateState(updated);
    PrivacyStorageService.saveState(updated);
  };

  return (
    <div id="wearables-meds-view" className="space-y-8 max-w-5xl mx-auto">
      {/* Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-semibold mb-2">
          <Watch className="w-3.5 h-3.5" />
          <span>Integracje ze Smartwatchem & Przypomnienia</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Synchronizacja Zegarków, Przypomnienia & Leki
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
          Połącz zegarek przez Web Bluetooth, monitoruj tętno podczas rehabilitacji, precyzyjnie planuj godziny ćwiczeń i dawek leków dopasowane do Twojego stylu życia.
        </p>
      </div>

      {/* Sub-view Navigation Bar: Nowy widok precyzyjnego harmonogramu vs Urządzenia */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            id="subview-schedule-btn"
            type="button"
            onClick={() => setSubView('schedule')}
            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              subView === 'schedule'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Harmonogram & Styl Życia (Nowy widok)</span>
          </button>

          <button
            id="subview-devices-btn"
            type="button"
            onClick={() => setSubView('devices')}
            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              subView === 'devices'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
            }`}
          >
            <Watch className="w-4 h-4" />
            <span>Smartwatch & Sensory BLE</span>
          </button>
        </div>

        {/* Global Quick Simulation Button */}
        <button
          id="quick-simulate-sync-btn"
          type="button"
          onClick={handleSimulateSync}
          disabled={isSimulatingSync}
          className={`w-full sm:w-auto px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-95 ${
            isSimulatingSync
              ? 'animate-pulse ring-4 ring-teal-400 dark:ring-teal-500 bg-teal-100 dark:bg-teal-900/90 text-teal-950 dark:text-teal-50 border-teal-500 shadow-md scale-[0.98]'
              : 'bg-white dark:bg-slate-900 border-teal-300 dark:border-teal-700 hover:bg-teal-50 dark:hover:bg-teal-950/60 text-teal-800 dark:text-teal-300'
          }`}
          title="Losuje dane o tętnie i poziomie aktywności oraz aktualizuje stan aplikacji"
        >
          {isSimulatingSync ? (
            <>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-600"></span>
              </span>
              <RefreshCw className="w-3.5 h-3.5 text-teal-700 dark:text-teal-300 animate-spin" />
              <span>Synchronizowanie danych...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Symuluj synchronizację danych z zegarka</span>
            </>
          )}
        </button>
      </div>

      {/* Visual Feedback Toast/Banner upon synchronization */}
      {syncFeedback && (
        <div 
          id="sync-feedback-banner"
          className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/70 dark:via-teal-950/70 dark:to-emerald-950/70 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100 text-xs shadow-xs space-y-2.5 animate-in fade-in slide-in-from-top-2"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Pomyślnie zsynchronizowano dane z zegarka!</span>
              <span className="text-[10px] font-mono font-normal opacity-75">({syncFeedback.timestamp})</span>
            </div>
            <button
              type="button"
              onClick={() => setSyncFeedback(null)}
              className="text-emerald-700 dark:text-emerald-400 hover:opacity-70 font-semibold text-xs px-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-emerald-200/70 dark:border-emerald-800/60">
              <div className="text-slate-500 dark:text-slate-400">Tętno zmierzone:</div>
              <div className="font-bold text-rose-600 dark:text-rose-400 font-mono text-sm flex items-center gap-1.5 mt-0.5">
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                <span>{syncFeedback.heartRate} BPM</span>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-emerald-200/70 dark:border-emerald-800/60">
              <div className="text-slate-500 dark:text-slate-400">Poziom aktywności:</div>
              <div className="font-bold text-teal-700 dark:text-teal-300 font-mono text-sm flex items-center gap-1.5 mt-0.5">
                <Activity className="w-3.5 h-3.5 text-teal-600" />
                <span>{syncFeedback.activeMinutes} min</span>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-emerald-200/70 dark:border-emerald-800/60">
              <div className="text-slate-500 dark:text-slate-400">Kroki dzisiaj:</div>
              <div className="font-bold text-slate-800 dark:text-slate-200 font-mono text-sm flex items-center gap-1.5 mt-0.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>{syncFeedback.steps.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-emerald-200/70 dark:border-emerald-800/60">
              <div className="text-slate-500 dark:text-slate-400">Bateria zegarka:</div>
              <div className="font-bold text-emerald-700 dark:text-emerald-300 font-mono text-sm flex items-center gap-1.5 mt-0.5">
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
                <span>{syncFeedback.batteryLevel}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Render selected view */}
      {subView === 'schedule' ? (
        <RemindersScheduleView appState={appState} onUpdateState={onUpdateState} />
      ) : (
        <div className="space-y-8">
          {/* Top Status & Huawei Automation Controls */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0 shadow-xs">
                  <Watch className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                    <span>Telemetria i Integracja Smartwatcha</span>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                      HUAWEI TruSeen™ &amp; BLE
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Ciągły monitoring tętna spoczynkowego, automatyczna synchronizacja w tle oraz bezpieczne limity wysiłkowe.
                  </p>
                </div>
              </div>

              {/* Live Indicators: Signal Strength & Last Sync Time */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Connection strength indicator */}
                <div 
                  id="connection-strength-indicator"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80"
                  title={`Poziom sygnału: ${appState.wearable.connectionRssi ?? -58} dBm`}
                >
                  <div className="flex items-end gap-1 h-4">
                    <span className={`w-1 rounded-xs transition-all ${appState.wearable.connected ? 'h-1.5 bg-emerald-500' : 'h-1.5 bg-slate-300 dark:bg-slate-700'}`} />
                    <span className={`w-1 rounded-xs transition-all ${appState.wearable.connected ? 'h-2.5 bg-emerald-500' : 'h-2.5 bg-slate-300 dark:bg-slate-700'}`} />
                    <span className={`w-1 rounded-xs transition-all ${appState.wearable.connected ? 'h-3.5 bg-emerald-500' : 'h-3.5 bg-slate-300 dark:bg-slate-700'}`} />
                    <span className={`w-1 rounded-xs transition-all ${appState.wearable.connected ? 'h-4 bg-emerald-500' : 'h-4 bg-slate-300 dark:bg-slate-700'}`} />
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Sygnał</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {appState.wearable.connected ? 'Optymalny' : 'Rozłączony'}
                    </span>
                    {appState.wearable.connected && (
                      <span className="text-[10px] text-slate-400 font-mono ml-1">
                        ({appState.wearable.connectionRssi ?? -58} dBm)
                      </span>
                    )}
                  </div>
                </div>

                {/* Last Sync Time timestamp display */}
                <div 
                  id="last-sync-time-display"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80"
                >
                  <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  <div className="text-xs">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Ostatnia synchronizacja</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                      {lastSyncDisplay}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls Row: Auto-Sync configuration toggle & HR Threshold monitoring */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Auto-Sync Configuration Toggle */}
              <div 
                id="auto-sync-config-card"
                className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/40 flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <RefreshCw className={`w-4 h-4 text-teal-600 dark:text-teal-400 ${appState.wearable.autoSyncEnabled !== false ? 'animate-spin-slow' : ''}`} />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Auto-Sync (co 15 minut)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    {appState.wearable.autoSyncEnabled !== false ? (
                      <span>
                        Cykliczne pobieranie w tle aktywne • Kolejna za{' '}
                        <strong className="font-mono text-teal-700 dark:text-teal-300 font-bold">
                          {Math.floor(secondsUntilNextSync / 60)}m {secondsUntilNextSync % 60}s
                        </strong>
                      </span>
                    ) : (
                      <span>Automatyczne pobieranie w tle wyłączone</span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    id="toggle-autosync-switch"
                    type="button"
                    role="switch"
                    aria-checked={appState.wearable.autoSyncEnabled !== false}
                    onClick={() => handleToggleAutoSync(appState.wearable.autoSyncEnabled === false)}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      appState.wearable.autoSyncEnabled !== false ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                    title="Przełącz automatyczną synchronizację w tle"
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        appState.wearable.autoSyncEnabled !== false ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Heart Rate Threshold Monitoring Config */}
              <div 
                id="hr-threshold-config-card"
                className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-amber-600 dark:text-amber-400 fill-amber-500/20" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Próg tętna w sesji treningowej
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    Alarm w sesji i zalecenie przerwy przy tętnie powyżej {appState.wearable.heartRateThresholdBpm || 120} BPM
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleThresholdChange(Math.max(90, (appState.wearable.heartRateThresholdBpm || 120) - 5))}
                    className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center cursor-pointer"
                    title="Zmniejsz próg o 5 BPM"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-xs text-amber-900 dark:text-amber-200 w-12 text-center">
                    {appState.wearable.heartRateThresholdBpm || 120} <span className="text-[10px] font-normal">BPM</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleThresholdChange(Math.min(160, (appState.wearable.heartRateThresholdBpm || 120) + 5))}
                    className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center cursor-pointer"
                    title="Zwiększ próg o 5 BPM"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 7-DAY RESTING HEART RATE TRENDS (RECHARTS) */}
          <RestingHeartRateTrendChart
            history={appState.wearable.heartRateHistory}
            currentRestingBpm={appState.wearable.currentHeartRate}
            deviceName={appState.wearable.deviceName}
          />

          {/* Grid: Left Smartwatches (6 cols), Right Notifications & Meds (6 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Smartwatch / Wearable Hub */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Watch className="w-5 h-5 text-teal-600" />
                Inteligentny Zegarek / Opaska
              </h2>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                appState.wearable.connected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                {appState.wearable.connected ? 'Połączono (Live)' : 'Rozłączony'}
              </span>
            </div>

            {/* Smartwatch metrics display */}
            <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 p-1 rounded-2xl transition-all duration-500 ${
              justSynced ? 'ring-2 ring-teal-500/80 ring-offset-2 dark:ring-offset-slate-900 bg-teal-50/40 dark:bg-teal-950/30' : ''
            }`}>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-center relative overflow-hidden">
                {justSynced && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                )}
                <Heart className="w-4 h-4 text-rose-500 mx-auto animate-pulse" />
                <div className="text-lg font-black font-mono text-slate-900 dark:text-white mt-1">
                  {appState.wearable.currentHeartRate || 72}
                </div>
                <div className="text-[10px] text-slate-400">Tętno (BPM)</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-center relative overflow-hidden">
                {justSynced && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                  </span>
                )}
                <Activity className="w-4 h-4 text-teal-500 mx-auto" />
                <div className="text-lg font-black font-mono text-slate-900 dark:text-white mt-1">
                  {appState.wearable.activeMinutes || 35} min
                </div>
                <div className="text-[10px] text-slate-400">Aktywność</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-center relative overflow-hidden">
                {justSynced && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
                <TrendingUp className="w-4 h-4 text-emerald-500 mx-auto" />
                <div className="text-lg font-black font-mono text-slate-900 dark:text-white mt-1">
                  {(appState.wearable.todaySteps || 6420).toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400">Kroki dzisiaj</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-center">
                <BatteryCharging className="w-4 h-4 text-emerald-500 mx-auto" />
                <div className="text-lg font-black font-mono text-slate-900 dark:text-white mt-1">
                  {appState.wearable.batteryLevel || 88}%
                </div>
                <div className="text-[10px] text-slate-400">Bateria</div>
              </div>
            </div>

            {/* Connection Actions */}
            <div className="space-y-3 pt-2">
              {/* Primary Requested Button: Symuluj synchronizację danych z zegarka */}
              <button
                id="simulate-sync-btn"
                type="button"
                onClick={handleSimulateSync}
                disabled={isSimulatingSync}
                className={`w-full py-3.5 px-4 rounded-2xl border font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-95 ${
                  isSimulatingSync
                    ? 'animate-pulse ring-4 ring-teal-400 dark:ring-teal-500 bg-teal-100 dark:bg-teal-900/90 text-teal-950 dark:text-teal-50 shadow-xl shadow-teal-500/40 scale-[0.98] border-teal-500'
                    : 'border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-800 dark:text-teal-200'
                }`}
              >
                {isSimulatingSync ? (
                  <>
                    <span className="relative flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-teal-600"></span>
                    </span>
                    <RefreshCw className="w-4 h-4 text-teal-700 dark:text-teal-300 animate-spin" />
                    <span>Synchronizowanie danych z zegarka...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>Symuluj synchronizację danych z zegarka</span>
                  </>
                )}
              </button>

              <button
                id="connect-bluetooth-ble-btn"
                type="button"
                onClick={handleConnectBle}
                disabled={connectingBle}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Bluetooth className="w-4 h-4" />
                <span>{connectingBle ? 'Wyszukiwanie urządzeń...' : 'Połącz zegarek przez Web Bluetooth (BLE)'}</span>
              </button>

              {bleStatusMsg && (
                <div className="text-[11px] text-slate-500 dark:text-slate-400 text-center italic">
                  {bleStatusMsg}
                </div>
              )}
            </div>

            {/* Ecosystem Sync Formats */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Zgodność z ekosystemami zdrowotnymi:
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Eksportuj zrealizowane treningi rehabilitacji do pierścieni aktywności:
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleExportHealthWorkout}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 font-medium"
                >
                  <Smartphone className="w-4 h-4 text-rose-500" />
                  <span>Apple Health</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportHealthWorkout}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 font-medium"
                >
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <span>Google Health Connect</span>
                </button>
              </div>
            </div>
          </div>

          {/* Dedicated Real Huawei Watch Integration Module */}
          <HuaweiWatchIntegration appState={appState} onUpdateState={onUpdateState} />
        </div>

        {/* Personalized Notifications & Daily Meds (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Notifications config */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-teal-600" />
                Personalizowane Powiadomienia
              </h2>
              <span className="text-xs text-slate-500">Web Push</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    Codzienna sesja rehabilitacyjna
                  </div>
                  <div className="text-slate-500">Godzina przypomnienia</div>
                </div>
                <input
                  type="time"
                  value={appState.reminders.rehabSessionTime}
                  onChange={(e) => {
                    const updated = {
                      ...appState,
                      reminders: { ...appState.reminders, rehabSessionTime: e.target.value }
                    };
                    onUpdateState(updated);
                    PrivacyStorageService.saveState(updated);
                  }}
                  className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    Mikro-przerwy przy biurku (Ergonomia)
                  </div>
                  <div className="text-slate-500">Alert o cofnięciu brody i wstaniu</div>
                </div>
                <span className="font-mono font-bold text-teal-600">Co 60 min</span>
              </div>
            </div>

            <div className="flex gap-2">
              {notificationPermission !== 'granted' ? (
                <button
                  id="enable-notifications-btn"
                  type="button"
                  onClick={handleRequestNotification}
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-colors"
                >
                  Włącz powiadomienia w przeglądarce
                </button>
              ) : (
                <button
                  id="test-notification-btn"
                  type="button"
                  onClick={handleTestNotification}
                  className="flex-1 py-2.5 rounded-xl border border-teal-500 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Przetestuj personalizowane powiadomienie</span>
                </button>
              )}
            </div>
          </div>

          {/* Daily Medications Tracker */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-600" />
                Codzienne Leki i Suplementy
              </h2>
              <button
                id="open-add-med-modal-btn"
                type="button"
                onClick={() => setShowAddMedModal(true)}
                className="flex items-center gap-1 text-xs font-bold text-teal-600 hover:underline"
              >
                <Plus className="w-4 h-4" />
                <span>Dodaj lek</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {appState.medications.map((med) => (
                <div
                  key={med.id}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {med.name}
                    </div>
                    <div className="text-slate-500 mt-0.5">
                      {med.dosage} • {med.frequency} (Godz. {med.scheduleTimes.join(', ')})
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {med.scheduleTimes.map(time => {
                      const isTaken = !!med.takenToday[time];
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => handleToggleMedTaken(med.id, time)}
                          className={`px-3 py-1.5 rounded-xl font-bold transition-colors flex items-center gap-1.5 ${
                            isTaken
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isTaken ? 'Zażyte ✓' : 'Oznacz zażyte'}</span>
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => handleDeleteMedication(med.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
                      title="Usuń lek"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>
      )}

      {/* Add Medication Modal */}
      {showAddMedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full space-y-4 shadow-2xl text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Dodaj lek lub suplement
            </h3>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Nazwa preparatu:
              </label>
              <input
                type="text"
                value={newMedName}
                onChange={(e) => setNewMedName(e.target.value)}
                placeholder="np. Witaminy B-Complex, Magnez, Lek przeciwzapalny"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Dawkowanie:
              </label>
              <input
                type="text"
                value={newMedDosage}
                onChange={(e) => setNewMedDosage(e.target.value)}
                placeholder="np. 1 tabletka (100 mg)"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Godzina:
                </label>
                <input
                  type="time"
                  value={newMedTime}
                  onChange={(e) => setNewMedTime(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Pora dnia:
                </label>
                <input
                  type="text"
                  value={newMedFrequency}
                  onChange={(e) => setNewMedFrequency(e.target.value)}
                  placeholder="np. Rano po jedzeniu"
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddMedModal(false)}
                className="px-4 py-2 rounded-xl font-semibold text-slate-600 dark:text-slate-400"
              >
                Anuluj
              </button>
              <button
                id="submit-new-med-btn"
                type="button"
                onClick={handleAddMedication}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-md"
              >
                Zapisz lek
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
