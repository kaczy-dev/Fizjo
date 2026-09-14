import React, { useState } from 'react';
import { 
  Bell, 
  Clock, 
  Calendar, 
  Pill, 
  Activity, 
  Sun, 
  Moon, 
  Coffee, 
  Sparkles, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Volume2, 
  VolumeX, 
  Vibrate, 
  Send, 
  ShieldCheck, 
  HelpCircle,
  Briefcase,
  Smile,
  AlertCircle
} from 'lucide-react';
import { AppState, PrivacyStorageService } from '../services/privacyStorage';
import { ReminderService } from '../services/reminders';
import { ReminderConfig, Medication } from '../types';

interface Props {
  appState: AppState;
  onUpdateState: (newState: AppState) => void;
}

export const RemindersScheduleView: React.FC<Props> = ({ appState, onUpdateState }) => {
  const [config, setConfig] = useState<ReminderConfig>(appState.reminders);
  const [medications, setMedications] = useState<Medication[]>(appState.medications);
  const [savedFeedback, setSavedFeedback] = useState<boolean>(false);
  const [testStatusMsg, setTestStatusMsg] = useState<string>('');

  // New Medication inline modal
  const [showAddMed, setShowAddMed] = useState<boolean>(false);
  const [newMedName, setNewMedName] = useState<string>('');
  const [newMedDosage, setNewMedDosage] = useState<string>('1 dawka');
  const [newMedTime, setNewMedTime] = useState<string>('08:00');
  const [newMedInstructions, setNewMedInstructions] = useState<string>('Popić szklanką wody po posiłku.');

  // Lifestyle Presets
  const applyLifestylePreset = (preset: 'office_standard' | 'office_flexible' | 'early_bird' | 'night_owl') => {
    let updated: ReminderConfig = { ...config, activeLifestylePreset: preset };

    switch (preset) {
      case 'office_standard':
        updated = {
          ...updated,
          morningActivationTime: '07:45',
          morningActivationEnabled: true,
          lunchReliefTime: '12:30',
          lunchReliefEnabled: true,
          rehabSessionTime: '17:00',
          rehabEnabled: true,
          eveningRelaxationTime: '21:30',
          eveningRelaxationEnabled: true,
          officeBreakIntervalMinutes: 60,
          officeBreakEnabled: true,
          officeBreakStartTime: '08:30',
          officeBreakEndTime: '16:30'
        };
        break;
      case 'office_flexible':
        updated = {
          ...updated,
          morningActivationTime: '08:30',
          morningActivationEnabled: true,
          lunchReliefTime: '13:30',
          lunchReliefEnabled: true,
          rehabSessionTime: '18:30',
          rehabEnabled: true,
          eveningRelaxationTime: '22:15',
          eveningRelaxationEnabled: true,
          officeBreakIntervalMinutes: 45,
          officeBreakEnabled: true,
          officeBreakStartTime: '09:00',
          officeBreakEndTime: '18:00'
        };
        break;
      case 'early_bird':
        updated = {
          ...updated,
          morningActivationTime: '06:15',
          morningActivationEnabled: true,
          lunchReliefTime: '11:30',
          lunchReliefEnabled: true,
          rehabSessionTime: '15:30',
          rehabEnabled: true,
          eveningRelaxationTime: '20:45',
          eveningRelaxationEnabled: true,
          officeBreakIntervalMinutes: 60,
          officeBreakEnabled: true,
          officeBreakStartTime: '07:00',
          officeBreakEndTime: '15:00'
        };
        break;
      case 'night_owl':
        updated = {
          ...updated,
          morningActivationTime: '09:45',
          morningActivationEnabled: true,
          lunchReliefTime: '14:30',
          lunchReliefEnabled: true,
          rehabSessionTime: '20:00',
          rehabEnabled: true,
          eveningRelaxationTime: '23:15',
          eveningRelaxationEnabled: true,
          officeBreakIntervalMinutes: 45,
          officeBreakEnabled: true,
          officeBreakStartTime: '10:30',
          officeBreakEndTime: '19:30'
        };
        break;
    }

    setConfig(updated);
    saveChanges(updated, medications);
  };

  const saveChanges = (updatedConfig: ReminderConfig, updatedMeds: Medication[]) => {
    const newState: AppState = {
      ...appState,
      reminders: updatedConfig,
      medications: updatedMeds
    };
    onUpdateState(newState);
    PrivacyStorageService.saveState(newState);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  // Medication Time Management
  const handleAddTimeToMed = (medId: string) => {
    const updated = medications.map(m => {
      if (m.id === medId) {
        return {
          ...m,
          scheduleTimes: [...m.scheduleTimes, '12:00']
        };
      }
      return m;
    });
    setMedications(updated);
    saveChanges(config, updated);
  };

  const handleUpdateTimeForMed = (medId: string, index: number, newTime: string) => {
    const updated = medications.map(m => {
      if (m.id === medId) {
        const nextTimes = [...m.scheduleTimes];
        nextTimes[index] = newTime;
        return {
          ...m,
          scheduleTimes: nextTimes
        };
      }
      return m;
    });
    setMedications(updated);
    saveChanges(config, updated);
  };

  const handleRemoveTimeFromMed = (medId: string, index: number) => {
    const updated = medications.map(m => {
      if (m.id === medId && m.scheduleTimes.length > 1) {
        return {
          ...m,
          scheduleTimes: m.scheduleTimes.filter((_, i) => i !== index)
        };
      }
      return m;
    });
    setMedications(updated);
    saveChanges(config, updated);
  };

  const handleCreateMedication = () => {
    if (!newMedName.trim()) return;

    const newMed: Medication = {
      id: `med-${Date.now()}`,
      name: newMedName,
      dosage: newMedDosage,
      frequency: 'Według harmonogramu',
      scheduleTimes: [newMedTime],
      instructions: newMedInstructions,
      takenToday: {}
    };

    const updated = [...medications, newMed];
    setMedications(updated);
    saveChanges(config, updated);
    setNewMedName('');
    setShowAddMed(false);
  };

  const handleDeleteMedication = (id: string) => {
    const updated = medications.filter(m => m.id !== id);
    setMedications(updated);
    saveChanges(config, updated);
  };

  // Test notification helper
  const handleTestSpecificReminder = (
    type: 'rehab_session' | 'morning_activation' | 'lunch_relief' | 'evening_relaxation' | 'office_break' | 'medication',
    name?: string
  ) => {
    if (config.soundEnabled) {
      ReminderService.playReminderChime();
    }
    const msg = ReminderService.generatePersonalizedMessage(type, appState.profile, config, name);
    ReminderService.triggerNotification(msg.title, msg.body);
    setTestStatusMsg(`Wysłano powiadomienie testowe: "${msg.title}"`);
    setTimeout(() => setTestStatusMsg(''), 4000);
  };

  // Build Chronological 24-Hour Timeline
  const timelineItems = React.useMemo(() => {
    const items: {
      time: string;
      title: string;
      type: 'exercise' | 'medication' | 'break';
      desc: string;
    }[] = [];

    if (config.morningActivationEnabled && config.morningActivationTime) {
      items.push({
        time: config.morningActivationTime,
        title: 'Poranna aktywacja szyi',
        type: 'exercise',
        desc: 'Mobilizacja kręgów C1-C2 i rozciągnięcie po nocy'
      });
    }

    if (config.lunchReliefEnabled && config.lunchReliefTime) {
      items.push({
        time: config.lunchReliefTime,
        title: 'Przerwa obiadowa: Odciążenie Brüggera',
        type: 'exercise',
        desc: 'Otwarcie klatki piersiowej i dekompresja karku'
      });
    }

    if (config.rehabEnabled && config.rehabSessionTime) {
      items.push({
        time: config.rehabSessionTime,
        title: 'Główny trening rehabilitacyjny',
        type: 'exercise',
        desc: 'Pełen protokół ćwiczeń kinezjologicznych'
      });
    }

    if (config.eveningRelaxationEnabled && config.eveningRelaxationTime) {
      items.push({
        time: config.eveningRelaxationTime,
        title: 'Wieczorne wyciszenie podpotyliczne',
        type: 'exercise',
        desc: 'Relaksacja mięśni przed snem, zapobieganie sztywności'
      });
    }

    if (config.officeBreakEnabled) {
      items.push({
        time: `${config.officeBreakStartTime || '08:30'} - ${config.officeBreakEndTime || '17:00'}`,
        title: `Mikropauzy przy biurku (co ${config.officeBreakIntervalMinutes} min)`,
        type: 'break',
        desc: 'Krótki reset pozycji: retrakcja brody i spojrzenie w dal'
      });
    }

    medications.forEach(med => {
      med.scheduleTimes.forEach(t => {
        items.push({
          time: t,
          title: med.name,
          type: 'medication',
          desc: `${med.dosage} • ${med.instructions}`
        });
      });
    });

    // Sort items chronologically
    return items.sort((a, b) => a.time.localeCompare(b.time));
  }, [config, medications]);

  return (
    <div id="reminders-schedule-view" className="space-y-8">
      {/* Introduction Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold mb-3">
            <Clock className="w-3.5 h-3.5" />
            <span>Precyzyjne Godziny Przypomnień i Styl Życia</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Dopasuj Harmonogram do Swojego Dnia
          </h2>
          <p className="text-teal-100 text-sm sm:text-base mt-2 leading-relaxed">
            Skuteczna rehabilitacja to regularność dopasowana do Twojego rytmu pracy. 
            Wybierz gotowy profil dnia lub ustaw indywidualne godziny dla każdej sesji ćwiczeniowej, mikropauzy i leków.
          </p>

          {savedFeedback && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-bold animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Harmonogram został natychmiast zapisany na Twoim urządzeniu!</span>
            </div>
          )}

          {testStatusMsg && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-500/20 border border-sky-400 text-sky-200 text-xs font-bold animate-fade-in">
              <Bell className="w-4 h-4 text-sky-400" />
              <span>{testStatusMsg}</span>
            </div>
          )}
        </div>
      </div>

      {/* Preset Profiles Picker */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-teal-600" />
            Szybkie szablony stylu życia (1 kliknięciem)
          </h3>
          <span className="text-xs text-slate-500">Zmień i dostosuj</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              id: 'office_standard',
              name: 'Standard Biurowy',
              hours: '8:00 – 16:30',
              icon: <Briefcase className="w-4 h-4 text-teal-600" />,
              desc: 'Główny trening po pracy (17:00), pauzy co 60 min'
            },
            {
              id: 'office_flexible',
              name: 'Praca Elastyczna / Korpo',
              hours: '9:00 – 18:00',
              icon: <Sparkles className="w-4 h-4 text-indigo-600" />,
              desc: 'Pauzy co 45 min, trening o 18:30'
            },
            {
              id: 'early_bird',
              name: 'Ranny Ptaszek',
              hours: '6:30 – 15:00',
              icon: <Sun className="w-4 h-4 text-amber-500" />,
              desc: 'Aktywacja o 6:15, popołudniowy trening o 15:30'
            },
            {
              id: 'night_owl',
              name: 'Nocny Marek / Freelance',
              hours: '10:30 – 19:30',
              icon: <Moon className="w-4 h-4 text-purple-500" />,
              desc: 'Późniejszy start, wieczorna sesja o 20:00'
            }
          ].map(preset => {
            const isActive = config.activeLifestylePreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyLifestylePreset(preset.id as 'office_standard' | 'office_flexible' | 'early_bird' | 'night_owl')}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                  isActive
                    ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/70 ring-2 ring-teal-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {preset.icon}
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {preset.name}
                    </span>
                  </div>
                  {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />}
                </div>
                <div className="text-[11px] font-mono font-bold text-teal-700 dark:text-teal-400">
                  {preset.hours}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
                  {preset.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Section 1 (Exercise Schedule) & Section 2 (Medication Schedule) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Precise Exercise Schedule */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-600" />
                <span>Godziny Sesji Ćwiczeniowych</span>
              </h3>
              <span className="text-xs text-slate-500">Kinezjologia</span>
            </div>

            {/* Morning Activation */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Poranna aktywacja szyi
                    </h4>
                    <p className="text-[11px] text-slate-500">Mobilizacja po nocy (3 min)</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="time"
                    value={config.morningActivationTime || '07:45'}
                    onChange={(e) => {
                      const updated = { ...config, morningActivationTime: e.target.value, activeLifestylePreset: 'custom' as const };
                      setConfig(updated);
                      saveChanges(updated, medications);
                    }}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold text-xs"
                  />
                  <input
                    type="checkbox"
                    checked={config.morningActivationEnabled ?? true}
                    onChange={(e) => {
                      const updated = { ...config, morningActivationEnabled: e.target.checked };
                      setConfig(updated);
                      saveChanges(updated, medications);
                    }}
                    className="w-4 h-4 accent-teal-600 rounded"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                <span>Rozruszanie stawów szczytowych przed pracą</span>
                <button
                  type="button"
                  onClick={() => handleTestSpecificReminder('morning_activation')}
                  className="text-teal-600 hover:underline font-semibold flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Test</span>
                </button>
              </div>
            </div>

            {/* Midday / Lunch Relief (Brugger) */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600">
                    <Coffee className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Przerwa obiadowa: Pozycja Brüggera
                    </h4>
                    <p className="text-[11px] text-slate-500">Reset napięć powięziowych (2 min)</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="time"
                    value={config.lunchReliefTime || '12:30'}
                    onChange={(e) => {
                      const updated = { ...config, lunchReliefTime: e.target.value, activeLifestylePreset: 'custom' as const };
                      setConfig(updated);
                      saveChanges(updated, medications);
                    }}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold text-xs"
                  />
                  <input
                    type="checkbox"
                    checked={config.lunchReliefEnabled ?? true}
                    onChange={(e) => {
                      const updated = { ...config, lunchReliefEnabled: e.target.checked };
                      setConfig(updated);
                      saveChanges(updated, medications);
                    }}
                    className="w-4 h-4 accent-teal-600 rounded"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                <span>Otwarcie klatki i cofnięcie wysuniętej brody</span>
                <button
                  type="button"
                  onClick={() => handleTestSpecificReminder('lunch_relief')}
                  className="text-teal-600 hover:underline font-semibold flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Test</span>
                </button>
              </div>
            </div>

            {/* Main Daily Rehab Session */}
            <div className="p-4 rounded-2xl border-2 border-teal-500/40 bg-teal-50/40 dark:bg-teal-950/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-teal-600 text-white">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        Główny Trening Rehabilitacyjny
                      </h4>
                      <span className="text-[9px] bg-teal-600 text-white font-black px-1.5 py-0.5 rounded-full">
                        Priorytet
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      Pełny zestaw ćwiczeń protokołu (8–12 min)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="time"
                    value={config.rehabSessionTime || '17:30'}
                    onChange={(e) => {
                      const updated = { ...config, rehabSessionTime: e.target.value, activeLifestylePreset: 'custom' as const };
                      setConfig(updated);
                      saveChanges(updated, medications);
                    }}
                    className="px-2.5 py-1.5 rounded-xl border border-teal-400 dark:border-teal-700 bg-white dark:bg-slate-900 font-mono font-bold text-xs shadow-xs"
                  />
                  <input
                    type="checkbox"
                    checked={config.rehabEnabled}
                    onChange={(e) => {
                      const updated = { ...config, rehabEnabled: e.target.checked };
                      setConfig(updated);
                      saveChanges(updated, medications);
                    }}
                    className="w-4 h-4 accent-teal-600 rounded"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                <span>Buduje siłę mięśni głębokich i ciągłość serii (streak)</span>
                <button
                  type="button"
                  onClick={() => handleTestSpecificReminder('rehab_session')}
                  className="text-teal-600 hover:underline font-semibold flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Test</span>
                </button>
              </div>
            </div>

            {/* Evening Relaxation */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Wieczorne wyciszenie podpotyliczne
                    </h4>
                    <p className="text-[11px] text-slate-500">Rozluźnienie mięśni przed snem (3 min)</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="time"
                    value={config.eveningRelaxationTime || '21:30'}
                    onChange={(e) => {
                      const updated = { ...config, eveningRelaxationTime: e.target.value, activeLifestylePreset: 'custom' as const };
                      setConfig(updated);
                      saveChanges(updated, medications);
                    }}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold text-xs"
                  />
                  <input
                    type="checkbox"
                    checked={config.eveningRelaxationEnabled ?? true}
                    onChange={(e) => {
                      const updated = { ...config, eveningRelaxationEnabled: e.target.checked };
                      setConfig(updated);
                      saveChanges(updated, medications);
                    }}
                    className="w-4 h-4 accent-teal-600 rounded"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                <span>Zapobiega porannej sztywności karku i bólom głowy</span>
                <button
                  type="button"
                  onClick={() => handleTestSpecificReminder('evening_relaxation')}
                  className="text-teal-600 hover:underline font-semibold flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Test</span>
                </button>
              </div>
            </div>

            {/* Office Microbreaks Configuration */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Mikro-przerwy przy biurku (Ergonomia pracy)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Oderwanie wzroku (zasada 20-20-20) i retrakcja brody
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={config.officeBreakEnabled}
                  onChange={(e) => {
                    const updated = { ...config, officeBreakEnabled: e.target.checked };
                    setConfig(updated);
                    saveChanges(updated, medications);
                  }}
                  className="w-4 h-4 accent-teal-600 rounded"
                />
              </div>

              {config.officeBreakEnabled && (
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Częstotliwość przypomnień:</span>
                    <select
                      value={config.officeBreakIntervalMinutes}
                      onChange={(e) => {
                        const updated = { ...config, officeBreakIntervalMinutes: Number(e.target.value) };
                        setConfig(updated);
                        saveChanges(updated, medications);
                      }}
                      className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                    >
                      <option value={30}>Co 30 minut</option>
                      <option value={45}>Co 45 minut</option>
                      <option value={60}>Co 60 minut</option>
                      <option value={90}>Co 90 minut</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Aktywne w godzinach pracy:</span>
                    <div className="flex items-center gap-1.5 font-mono">
                      <input
                        type="time"
                        value={config.officeBreakStartTime || '08:30'}
                        onChange={(e) => {
                          const updated = { ...config, officeBreakStartTime: e.target.value };
                          setConfig(updated);
                          saveChanges(updated, medications);
                        }}
                        className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                      />
                      <span>–</span>
                      <input
                        type="time"
                        value={config.officeBreakEndTime || '17:00'}
                        onChange={(e) => {
                          const updated = { ...config, officeBreakEndTime: e.target.value };
                          setConfig(updated);
                          saveChanges(updated, medications);
                        }}
                        className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Precise Medication Schedule */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Godziny Leków i Suplementów
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddMed(true)}
                className="flex items-center gap-1 text-xs font-bold text-teal-600 hover:underline"
              >
                <Plus className="w-4 h-4" />
                <span>Dodaj lek</span>
              </button>
            </div>

            {/* List of medications with multi-hour precision */}
            <div className="space-y-3.5">
              {medications.map((med) => (
                <div
                  key={med.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {med.name}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {med.dosage} • {med.instructions}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteMedication(med.id)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                      title="Usuń preparat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Multiple schedule times */}
                  <div className="space-y-2 pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      <span>Dokładne godziny dawek:</span>
                      <button
                        type="button"
                        onClick={() => handleAddTimeToMed(med.id)}
                        className="text-teal-600 hover:underline flex items-center gap-1 text-[11px] font-bold"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Dodaj dawkę</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {med.scheduleTimes.map((time, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1 p-1 pl-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xs"
                        >
                          <Clock className="w-3 h-3 text-slate-400" />
                          <input
                            type="time"
                            value={time}
                            onChange={(e) => handleUpdateTimeForMed(med.id, idx, e.target.value)}
                            className="bg-transparent font-mono font-bold text-xs outline-hidden"
                          />
                          {med.scheduleTimes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveTimeFromMed(med.id, idx)}
                              className="p-1 hover:text-rose-500 text-slate-400"
                              title="Usuń tę godzinę"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => handleTestSpecificReminder('medication', med.name)}
                        className="px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1"
                      >
                        <Send className="w-2.5 h-2.5" />
                        <span>Test alertu</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Inline Add Medication Form */}
            {showAddMed && (
              <div className="p-4 rounded-2xl border-2 border-teal-500/50 bg-teal-50/30 dark:bg-teal-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Nowy lek lub suplement
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowAddMed(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    Anuluj
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      Nazwa leku / suplementu:
                    </label>
                    <input
                      type="text"
                      placeholder="np. Kolagen z witaminą C, Magnez, itp."
                      value={newMedName}
                      onChange={(e) => setNewMedName(e.target.value)}
                      className="w-full mt-1 p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        Dawkowanie:
                      </label>
                      <input
                        type="text"
                        placeholder="np. 1 tabletka"
                        value={newMedDosage}
                        onChange={(e) => setNewMedDosage(e.target.value)}
                        className="w-full mt-1 p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        Godzina:
                      </label>
                      <input
                        type="time"
                        value={newMedTime}
                        onChange={(e) => setNewMedTime(e.target.value)}
                        className="w-full mt-1 p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      Instrukcja przyjmowania:
                    </label>
                    <input
                      type="text"
                      placeholder="np. W trakcie posiłku, popić wodą"
                      value={newMedInstructions}
                      onChange={(e) => setNewMedInstructions(e.target.value)}
                      className="w-full mt-1 p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCreateMedication}
                  className="w-full py-2 rounded-xl bg-teal-600 text-white font-bold text-xs shadow-md hover:bg-teal-500 transition-colors"
                >
                  Dodaj do harmonogramu dnia
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 24-Hour Interactive Timeline */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Oś Czasu Twojego Dnia (Pełny Przegląd 24h)
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            {timelineItems.length} zaplanowanych zdarzeń
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400">
          Uporządkowany chronologicznie rozkład dnia ułatwia zintegrowanie ćwiczeń ze spotkaniami i nawykami:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
          {timelineItems.map((item, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border text-xs flex flex-col justify-between space-y-2 ${
                item.type === 'exercise'
                  ? 'border-teal-200 dark:border-teal-900 bg-teal-50/50 dark:bg-teal-950/30'
                  : item.type === 'medication'
                  ? 'border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/30'
                  : 'border-sky-200 dark:border-sky-900 bg-sky-50/50 dark:bg-sky-950/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-black text-xs px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  {item.time}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  {item.type === 'exercise' ? 'Ćwiczenie' : item.type === 'medication' ? 'Lek' : 'Ergonomia'}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Tone, Sound & Privacy Safeguards */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Smile className="w-4 h-4 text-teal-600" />
          Styl Komunikatów i Sygnały Powiadomień
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Tone */}
          <div className="space-y-1.5 text-xs">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Ton komunikatów powiadomień:
            </label>
            <select
              value={config.motivationalTone}
              onChange={(e) => {
                const updated = { ...config, motivationalTone: e.target.value as 'clinical' | 'friendly' | 'gentle' };
                setConfig(updated);
                saveChanges(updated, medications);
              }}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
            >
              <option value="clinical">🩺 Kliniczny & Rzeczowy</option>
              <option value="friendly">😊 Ciepły & Motywujący</option>
              <option value="gentle">🌱 Łagodny & Dyskretny</option>
            </select>
          </div>

          {/* Sound */}
          <div className="space-y-1.5 text-xs">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Dźwięk gongu przypomnienia:
            </label>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  const updated = { ...config, soundEnabled: !config.soundEnabled };
                  setConfig(updated);
                  saveChanges(updated, medications);
                }}
                className={`flex-1 py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold ${
                  config.soundEnabled
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300'
                    : 'border-slate-300 dark:border-slate-700 text-slate-400'
                }`}
              >
                {config.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span>{config.soundEnabled ? 'Włączony' : 'Wyciszony'}</span>
              </button>
              {config.soundEnabled && (
                <button
                  type="button"
                  onClick={() => ReminderService.playReminderChime()}
                  className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold"
                  title="Odsłuchaj dźwięk"
                >
                  Graj
                </button>
              )}
            </div>
          </div>

          {/* Vibration */}
          <div className="space-y-1.5 text-xs">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Wibracja opaski / telefonu:
            </label>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  const updated = { ...config, vibrationEnabled: !config.vibrationEnabled };
                  setConfig(updated);
                  saveChanges(updated, medications);
                }}
                className={`w-full py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold ${
                  config.vibrationEnabled
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300'
                    : 'border-slate-300 dark:border-slate-700 text-slate-400'
                }`}
              >
                <Vibrate className="w-4 h-4" />
                <span>{config.vibrationEnabled ? 'Wibracja aktywna' : 'Brak wibracji'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
