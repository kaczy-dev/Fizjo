import { UserHealthProfile, TrainingPlan, PainReport, Medication, ReminderConfig, WearableDevice } from '../types';
import { generatePersonalizedPlan } from './trainingPlan';
import { Achievement, INITIAL_ACHIEVEMENTS } from './achievements';

const STORAGE_KEY = 'fizjo_rehab_medical_data_v1';

export interface AppState {
  profile: UserHealthProfile;
  activePlan: TrainingPlan;
  painHistory: PainReport[];
  medications: Medication[];
  reminders: ReminderConfig;
  wearable: WearableDevice;
  achievements: Achievement[];
}

const DEFAULT_PROFILE: UserHealthProfile = {
  name: 'Pacjent',
  birthYear: 1988,
  gender: 'other',
  pinLockEnabled: false,
  isUnlocked: true,
  theme: 'system',
  hasAcceptedConsent: false,
  consentAcceptedAt: undefined,
  onboardingCompleted: false,
  primaryGoal: 'tech_neck',
  emergencyContactNote: 'W nagłych wypadkach: 112 / 999 (SOR)',
  diagnoses: ['Przeciążenie posturalne odcinka szyjnego', 'Objawy tech-neck'],
  notes: 'Siedzący tryb pracy przy komputerze, okresowa sztywność karku rano.',
  streakDays: 4,
  lastActiveDate: new Date().toISOString().split('T')[0],
  totalCompletedSessions: 6,
  completedSessionDates: [
    new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
    new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    new Date().toISOString().split('T')[0]
  ],
  mobilityTests: [
    {
      date: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
      neckRotationLeftDeg: 60,
      neckRotationRightDeg: 55,
      neckFlexionCm: 3,
      neckExtensionDeg: 50
    },
    {
      date: new Date().toISOString().split('T')[0],
      neckRotationLeftDeg: 72,
      neckRotationRightDeg: 70,
      neckFlexionCm: 1.5,
      neckExtensionDeg: 65
    }
  ]
};

const DEFAULT_MEDICATIONS: Medication[] = [
  {
    id: 'med-1',
    name: 'Magnez B-Complex (skurcze i układ nerwowy)',
    dosage: '1 tabletka (375 mg)',
    frequency: 'Rano po posiłku',
    scheduleTimes: ['08:30'],
    instructions: 'Popić szklanką wody.',
    takenToday: {}
  },
  {
    id: 'med-2',
    name: 'Maść przeciwzapalna / rozgrzewająca kark',
    dosage: 'Aplikacja miejscowa',
    frequency: 'Wieczorem przed snem',
    scheduleTimes: ['21:00'],
    instructions: 'Wmasować delikatnie w boki karku i mięsień czworoboczny.',
    takenToday: {}
  }
];

const DEFAULT_REMINDERS: ReminderConfig = {
  rehabSessionTime: '17:30',
  rehabEnabled: true,
  officeBreakIntervalMinutes: 60,
  officeBreakEnabled: true,
  medicationRemindersEnabled: true,
  motivationalTone: 'friendly',
  morningActivationTime: '07:30',
  morningActivationEnabled: true,
  lunchReliefTime: '12:30',
  lunchReliefEnabled: true,
  eveningRelaxationTime: '21:15',
  eveningRelaxationEnabled: true,
  officeBreakStartTime: '08:30',
  officeBreakEndTime: '17:00',
  soundEnabled: true,
  vibrationEnabled: true,
  activeLifestylePreset: 'office_standard'
};

export const generateDefaultHeartRateHistory = () => {
  const dayNames = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb'];
  const history = [];
  const baseResting = [66, 64, 65, 63, 62, 64, 61];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = dayNames[d.getDay()];
    const rhr = baseResting[6 - i] || 63;
    history.push({
      date: dateStr,
      dayLabel,
      restingHeartRate: rhr,
      avgHeartRate: rhr + 10,
      maxHeartRate: rhr + 48,
      source: 'HUAWEI TruSeen™ 5.5+'
    });
  }
  return history;
};

const DEFAULT_WEARABLE: WearableDevice = {
  connected: true,
  deviceName: 'HUAWEI WATCH GT 4',
  batteryLevel: 92,
  currentHeartRate: 71,
  todaySteps: 6420,
  activeMinutes: 28,
  sedentaryAlertsCount: 2,
  lastSync: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
  source: 'huawei_health',
  autoSyncEnabled: true,
  heartRateThresholdBpm: 120,
  connectionRssi: -62,
  connectionSignal: 'excellent',
  heartRateHistory: generateDefaultHeartRateHistory(),
  huaweiDetails: {
    modelName: 'HUAWEI WATCH GT 4',
    truSeenVersion: 'HUAWEI TruSeen™ 5.5+ PPG Sensor',
    firmwareVersion: 'HarmonyOS 4.2.0.103',
    connectionType: 'health_app_sync',
    signalStrength: 'doskonała',
    rssi: -62,
    sensorStatus: 'live_streaming',
    autoSyncIntervalMinutes: 15
  }
};

export class PrivacyStorageService {
  public static loadState(): AppState {
    if (typeof window === 'undefined') {
      return this.getInitialState();
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AppState;
        // Verify structure integrity
        // Merge stored achievements with default definitions in case new ones were added
        const loadedAchievements = Array.isArray(parsed.achievements) && parsed.achievements.length > 0
          ? INITIAL_ACHIEVEMENTS.map(def => {
              const existing = parsed.achievements.find(a => a.id === def.id);
              return existing || def;
            })
          : INITIAL_ACHIEVEMENTS;

        let loadedPainHistory = Array.isArray(parsed.painHistory) ? parsed.painHistory : [];
        if (loadedPainHistory.length > 0 && !loadedPainHistory.some(r => r.postureTiltAngleDeg !== undefined)) {
          loadedPainHistory = loadedPainHistory.map((rep) => {
            if (rep.id === 'report-1') {
              return { ...rep, postureTiltAngleDeg: 27, postureDiagnosis: 'Łagodne wysunięcie (Tech-Neck I°)' };
            }
            if (rep.id === 'report-2') {
              return { ...rep, postureTiltAngleDeg: 16, postureDiagnosis: 'Fizjologiczna norma (Oś strzałkowa)' };
            }
            return rep;
          });
        }

        const loadedWearable: WearableDevice = {
          ...DEFAULT_WEARABLE,
          ...parsed.wearable,
          heartRateHistory: (parsed.wearable?.heartRateHistory && parsed.wearable.heartRateHistory.length > 0)
            ? parsed.wearable.heartRateHistory
            : generateDefaultHeartRateHistory()
        };

        return {
          profile: { ...DEFAULT_PROFILE, ...parsed.profile },
          activePlan: parsed.activePlan || generatePersonalizedPlan({ primaryProblem: 'tech_neck', workType: 'desk', dailyMinutes: 10, baselineVas: 4 }),
          painHistory: loadedPainHistory,
          medications: Array.isArray(parsed.medications) ? parsed.medications : DEFAULT_MEDICATIONS,
          reminders: { ...DEFAULT_REMINDERS, ...parsed.reminders },
          wearable: loadedWearable,
          achievements: loadedAchievements
        };
      }
    } catch (e) {
      console.error('Błąd odczytu danych lokalnych', e);
    }

    const initial = this.getInitialState();
    this.saveState(initial);
    return initial;
  }

  public static saveState(state: AppState): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Błąd zapisu danych lokalnych', e);
    }
  }

  public static getInitialState(): AppState {
    const initialPlan = generatePersonalizedPlan({
      primaryProblem: 'tech_neck',
      workType: 'desk',
      dailyMinutes: 10,
      baselineVas: 4
    });

    // Mark first day as completed for rich initial state
    initialPlan.days[0].completed = true;
    initialPlan.days[0].prePainVas = 5;
    initialPlan.days[0].postPainVas = 2;
    initialPlan.days[0].completedAt = new Date().toISOString();

    const samplePainReports: PainReport[] = [
      {
        id: 'report-baseline',
        date: new Date(Date.now() - 14 * 86400000).toISOString(),
        vasScore: 7,
        region: 'nape',
        character: 'stiff',
        triggers: ['dluga_praca_przy_komputerze', 'stres'],
        associatedSymptoms: ['bol_glowy', 'mrowienie_karku'],
        reliefPositions: ['Odciążenie Brüggera'],
        stressLevel: 8,
        mood: 'tense',
        postureTiltAngleDeg: 38,
        postureDiagnosis: 'Umiarkowane wysunięcie (Tech-Neck II°)',
        psychosomaticNotes: 'Pomiar wyjściowy przed terapią. Wyraźne wysunięcie głowy do przodu i silny ucisk podpotyliczny.',
        aiAnalysis: {
          riskLevel: 'moderate',
          urgency: 'routine',
          primarySuspicion: 'Zaawansowane przeciążenie posturalne karku (Tech-Neck II°)',
          redFlagsDetected: [],
          explanation: 'Kąt protrakcji 38° wywołuje stały nacisk ok. 19 kg na dyski C5-C7.',
          recommendedExercises: ['chin-tuck', 'suboccipital-release', 'brugger-relief'],
          contraindicatedExercises: ['Gwałtowne krążenia głową'],
          immediateReliefAdvice: ['Podparcie lędźwiowe i ergonomiczna wysokość monitora'],
          doctorQuestions: ['Wskazana regularna autoterapia retrakcji brody.']
        }
      },
      {
        id: 'report-1',
        date: new Date(Date.now() - 5 * 86400000).toISOString(),
        vasScore: 5,
        region: 'nape',
        character: 'stiff',
        triggers: ['dluga_praca_przy_komputerze', 'stres'],
        associatedSymptoms: ['mrowienie_karku'],
        reliefPositions: ['Odciążenie Brüggera'],
        stressLevel: 6,
        mood: 'tense',
        postureTiltAngleDeg: 27,
        postureDiagnosis: 'Łagodne wysunięcie (Tech-Neck I°)',
        psychosomaticNotes: 'Intensywny dzień przed monitorem, ale regularne mikropauzy przynoszą ulgę.',
        aiAnalysis: {
          riskLevel: 'low',
          urgency: 'routine',
          primarySuspicion: 'Napięcie posturalne odcinka szyjnego z tendencją do adaptacji',
          redFlagsDetected: [],
          explanation: 'Zmniejszenie kąta do 27° zredukowało obciążenie osiowe karku o ponad 4 kg.',
          recommendedExercises: ['chin-tuck', 'suboccipital-release', 'brugger-relief'],
          contraindicatedExercises: ['Krążenia głową'],
          immediateReliefAdvice: ['Ciepły kompres na kark', 'Uniesienie monitora na wysokość oczu'],
          doctorQuestions: ['Czy wskazana jest manualna terapia punktów spustowych?']
        }
      },
      {
        id: 'report-2',
        date: new Date(Date.now() - 1 * 86400000).toISOString(),
        vasScore: 2,
        region: 'neck',
        character: 'dull',
        triggers: ['dluga_praca_przy_komputerze'],
        associatedSymptoms: [],
        reliefPositions: ['Cofanie brody (Chin tuck)'],
        stressLevel: 3,
        mood: 'calm',
        postureTiltAngleDeg: 16,
        postureDiagnosis: 'Fizjologiczna norma (Oś strzałkowa)',
        psychosomaticNotes: 'Spokojniejszy poranek po dobrze przespanej nocy na ergonomicznej poduszce. Bardzo dobra postawa.',
        aiAnalysis: {
          riskLevel: 'low',
          urgency: 'routine',
          primarySuspicion: 'Bardzo dobra poprawa posturalna po wdrożeniu ćwiczeń retrakcji szyi',
          redFlagsDetected: [],
          explanation: 'Kąt protrakcji 16° zbliża się do fizjologicznego optimum, minimalizując przeciążenie C5-C7 do ok. 10 kg.',
          recommendedExercises: ['chin-tuck', 'isometric-neck', 'brugger-relief'],
          contraindicatedExercises: [],
          immediateReliefAdvice: ['Kontynuacja regularnych przerw co 60 minut.'],
          doctorQuestions: ['Zalecenie utrzymania programu profilaktycznego.']
        }
      }
    ];

    return {
      profile: DEFAULT_PROFILE,
      activePlan: initialPlan,
      painHistory: samplePainReports,
      medications: DEFAULT_MEDICATIONS,
      reminders: DEFAULT_REMINDERS,
      wearable: DEFAULT_WEARABLE,
      achievements: INITIAL_ACHIEVEMENTS
    };
  }

  // Safe wipe (RODO / Right to be forgotten)
  public static wipeAllData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  }

  // Export JSON backup
  public static exportBackupJson(state: AppState): string {
    return JSON.stringify(state, null, 2);
  }

  // Import JSON backup
  public static importBackupJson(jsonString: string): AppState | null {
    try {
      const parsed = JSON.parse(jsonString) as AppState;
      if (parsed.profile && parsed.activePlan) {
        this.saveState(parsed);
        return parsed;
      }
    } catch {
      return null;
    }
    return null;
  }
}
