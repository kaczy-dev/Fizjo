export type SpineRegion = 'cervical' | 'thoracic' | 'lumbar' | 'full_spine';

export type PainIntensity = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface Exercise {
  id: string;
  name: string;
  polishName: string;
  region: SpineRegion;
  difficulty: 'Łatwe' | 'Średnie' | 'Zaawansowane';
  targetMuscles: string[];
  description: string;
  steps: string[];
  safetyWarnings: string[];
  commonMistakes: string[];
  defaultSets: number;
  defaultReps: number;
  defaultHoldSeconds: number;
  tempo: string; // e.g. "3-2-3"
  breathingCue: string;
  idealForSymptoms: string[];
  contraindications: string[];
  animationType: 'chin_tuck' | 'neck_rotation' | 'trapezius_stretch' | 'suboccipital_release' | 'scapular_retraction' | 'cat_cow' | 'isometric_neck' | 'nerve_floss' | 'brugger_relief' | 'lumbar_extension';
  videoUrl: string; // direct YouTube / instructional physiotherapy link
  videoEmbedUrl?: string; // embeddable player url
  videoDuration?: string; // e.g. "2:45 min"
  videoInstructor?: string; // e.g. "Klinika Fizjoterapii"
}

export interface DayScheduleItem {
  time: string; // e.g. "08:00"
  type: 'rehab' | 'med' | 'break' | 'ergonomics';
  category?: 'medication' | 'exercise' | 'break' | 'med' | 'ergonomics' | 'rehab';
  title: string;
  description: string;
  badge?: string;
}

export interface TrainingDay {
  dayIndex: number; // 0-6
  dayName: string; // "Poniedziałek", etc.
  focusArea: string;
  exerciseIds: string[];
  estimatedMinutes: number;
  completed: boolean;
  completedAt?: string;
  prePainVas?: number;
  postPainVas?: number;
  dailySchedule?: DayScheduleItem[];
}

export interface TrainingPlan {
  id: string;
  title: string;
  description: string;
  goal: string;
  primaryProblem: string;
  dailyMinutes: number;
  workType: 'desk' | 'physical' | 'mixed';
  startDate: string;
  days: TrainingDay[];
  adaptedLevel: 'delicate' | 'standard' | 'strengthening';
  aiRationale?: string;
  contraindicatedExerciseIds?: string[];
  recommendedBreakIntervalMinutes?: number;
  integratedMedicationsSummary?: string;
  dailySchedule?: DayScheduleItem[];
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  subtitle: string;
  category: 'ergonomia' | 'higiena_pracy' | 'tech_neck' | 'autoterapia' | 'sen' | 'bezpieczenstwo';
  readTimeMinutes: number;
  summary: string;
  content: string[];
  keyTakeaways: string[];
  practicalTips: string[];
  relatedExerciseIds: string[];
  icon: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'streak' | 'breathing' | 'knowledge' | 'rehab' | 'pain_tracking' | 'medication';
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

export interface PainReport {
  id: string;
  date: string;
  vasScore: number;
  region: 'neck' | 'nape' | 'shoulder_blade' | 'radiating_arm' | 'lower_back' | 'headache';
  character: 'sharp' | 'dull' | 'burning' | 'stiff' | 'throbbing';
  triggers: string[];
  associatedSymptoms: string[]; // e.g. numbness, dizziness, headache
  reliefPositions: string[];
  aiAnalysis: TriageResult;
  postureTiltAngleDeg?: number;
  postureDiagnosis?: string;
}

export interface TriageResult {
  riskLevel: 'low' | 'moderate' | 'high_consult_doctor';
  urgency: 'routine' | 'observation' | 'urgent_medical_review';
  primarySuspicion: string;
  dermatomeAffected?: string;
  redFlagsDetected: string[];
  explanation: string;
  recommendedExercises: string[];
  contraindicatedExercises: string[];
  immediateReliefAdvice: string[];
  doctorQuestions: string[];
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  scheduleTimes: string[]; // e.g. ["08:00", "20:00"]
  instructions: string;
  takenToday: Record<string, boolean>; // time: boolean
}

export interface ReminderConfig {
  rehabSessionTime: string;
  rehabEnabled: boolean;
  officeBreakIntervalMinutes: number;
  officeBreakEnabled: boolean;
  medicationRemindersEnabled: boolean;
  motivationalTone: 'clinical' | 'friendly' | 'gentle';
}

export interface WearableDevice {
  connected: boolean;
  deviceName?: string;
  batteryLevel?: number;
  currentHeartRate?: number;
  todaySteps?: number;
  activeMinutes?: number;
  sedentaryAlertsCount?: number;
  lastSync?: string;
  source: 'bluetooth_ble' | 'apple_health' | 'google_fit' | 'garmin' | 'simulated';
}

export interface UserHealthProfile {
  name: string;
  birthYear: number;
  gender: 'female' | 'male' | 'other';
  pinLockEnabled: boolean;
  pinHash?: string;
  isUnlocked: boolean;
  theme: 'light' | 'dark' | 'system';
  diagnoses: string[];
  notes: string;
  streakDays: number;
  lastActiveDate: string;
  totalCompletedSessions: number;
  mobilityTests: {
    date: string;
    neckRotationLeftDeg: number;
    neckRotationRightDeg: number;
    neckFlexionCm: number;
    neckExtensionDeg: number;
  }[];
  unlockedAchievementIds?: string[];
  readArticleIds?: string[];
}

export type UserProfile = UserHealthProfile;
export type MedicationReminder = ReminderConfig;
