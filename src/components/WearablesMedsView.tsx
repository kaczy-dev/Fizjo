import React, { useState } from 'react';
import { 
  Watch, Heart, Bell, Plus, CheckCircle2, 
  Smartphone, Bluetooth, Activity, ShieldCheck, Clock, Trash2, Send, BatteryCharging, Calendar 
} from 'lucide-react';
import { AppState, PrivacyStorageService } from '../services/privacyStorage';
import { WearableSyncService } from '../services/wearableSync';
import { ReminderService } from '../services/reminders';
import { Medication } from '../types';
import { RemindersScheduleView } from './RemindersScheduleView';

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

  // Simulate Smartwatch sync for demo
  const handleSimulateSync = () => {
    const updatedWearable = WearableSyncService.simulateLiveSync(appState.wearable);
    const updated: AppState = {
      ...appState,
      wearable: updatedWearable
    };
    onUpdateState(updated);
    PrivacyStorageService.saveState(updated);
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
            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
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
            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              subView === 'devices'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
            }`}
          >
            <Watch className="w-4 h-4" />
            <span>Smartwatch & Sensory BLE</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 px-3 hidden md:block font-medium">
          {subView === 'schedule' ? 'Precyzyjne godziny leków, ćwiczeń i przerw' : 'Tętno live, kroki & eksport treningów'}
        </div>
      </div>

      {/* Render selected view */}
      {subView === 'schedule' ? (
        <RemindersScheduleView appState={appState} onUpdateState={onUpdateState} />
      ) : (
        /* Grid: Left Smartwatches (6 cols), Right Notifications & Meds (6 cols) */
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
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-center">
                <Heart className="w-4 h-4 text-rose-500 mx-auto animate-pulse" />
                <div className="text-lg font-black font-mono text-slate-900 dark:text-white mt-1">
                  {appState.wearable.currentHeartRate || 72}
                </div>
                <div className="text-[10px] text-slate-400">Tętno (BPM)</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-center">
                <Activity className="w-4 h-4 text-teal-500 mx-auto" />
                <div className="text-lg font-black font-mono text-slate-900 dark:text-white mt-1">
                  {appState.wearable.todaySteps || 6420}
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
              <button
                id="connect-bluetooth-ble-btn"
                type="button"
                onClick={handleConnectBle}
                disabled={connectingBle}
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <Bluetooth className="w-4 h-4" />
                <span>{connectingBle ? 'Wyszukiwanie urządzeń...' : 'Połącz zegarek przez Web Bluetooth (BLE)'}</span>
              </button>

              <button
                id="simulate-sync-btn"
                type="button"
                onClick={handleSimulateSync}
                className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-1.5"
              >
                <Activity className="w-3.5 h-3.5 text-teal-600" />
                <span>Pobierz dane pomiarowe ze smartwatcha (Symulacja / Odśwież)</span>
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
