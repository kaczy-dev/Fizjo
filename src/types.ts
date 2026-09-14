export type SpineRegion = 'cervical' | 'thoracic' | 'lumbar' | 'full_spine';

export type NavTab = 'dashboard' | 'exercises' | 'knowledge' | 'plan' | 'triage' | 'ergonomics' | 'reports' | 'wearables' | 'profile';

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
  sessionNotes?: string; // Uwagi pacjenta po zakończeniu sesji dotyczące odczuć podczas konkretnych ćwiczeń
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

export type KnowledgeArticleCategory =
  | 'ergonomia'
  | 'higiena_pracy'
  | 'tech_neck'
  | 'autoterapia'
  | 'sen'
  | 'bezpieczenstwo'
  | 'anatomia_zdrowie'
  | 'schorzenia'
  | 'korzysci_cwiczen';

export interface KnowledgeArticle {
  id: string;
  title: string;
  subtitle: string;
  category: KnowledgeArticleCategory;
  readTimeMinutes: number;
  summary: string;
  content: string[];
  keyTakeaways: string[];
  practicalTips: string[];
  relatedExerciseIds: string[];
  icon: string;
}

export type FAQCategory = 'app_functionality' | 'exercise_technique' | 'pain_management';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  detailedPoints?: string[];
  category: FAQCategory;
  categoryLabel: string;
  clinicalTips?: string[];
  relatedExerciseIds?: string[];
  relatedAction?: {
    label: string;
    tabTarget: string;
  };
  tags: string[];
}

export type AchievementCategory = 'streak' | 'breathing' | 'knowledge' | 'rehab' | 'pain_tracking' | 'medication' | 'all';
export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'streak' | 'breathing' | 'knowledge' | 'rehab' | 'pain_tracking' | 'medication';
  tier: AchievementTier;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

export type PatientMood = 'relaxed' | 'calm' | 'neutral' | 'fatigued' | 'tense' | 'irritated' | 'exhausted';

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
  stressLevel?: number; // 1-10 (poziom stresu przed sesją)
  mood?: PatientMood; // nastrój przed sesją
  psychosomaticNotes?: string; // notatka o nastroju i czynnikach stresogennych
  sessionNotes?: string; // uwagi dotyczące odczuć podczas konkretnych ćwiczeń po sesji
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

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  category: 'consistency' | 'pain_relief' | 'micro_breaks' | 'morning' | 'education';
  badgeName: string;
  badgeIcon: string;
  targetCount: number;
  currentCount: number;
  unit: string;
  isCompleted: boolean;
  unlockedAt?: string;
  rewardPoints: number;
}

export interface ReminderConfig {
  rehabSessionTime: string;
  rehabEnabled: boolean;
  officeBreakIntervalMinutes: number;
  officeBreakEnabled: boolean;
  smartMicroBreaksEnabled?: boolean;
  inactivityThresholdMinutes?: number;
  lastMicroBreakCompletedAt?: string;
  totalMicroBreaksCompleted?: number;
  medicationRemindersEnabled: boolean;
  motivationalTone: 'clinical' | 'friendly' | 'gentle';
  morningActivationTime?: string;
  morningActivationEnabled?: boolean;
  lunchReliefTime?: string;
  lunchReliefEnabled?: boolean;
  eveningRelaxationTime?: string;
  eveningRelaxationEnabled?: boolean;
  officeBreakStartTime?: string;
  officeBreakEndTime?: string;
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
  activeLifestylePreset?: 'office_standard' | 'office_flexible' | 'early_bird' | 'night_owl' | 'custom';
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
  completedSessionDates?: string[];
  mobilityTests: {
    date: string;
    neckRotationLeftDeg: number;
    neckRotationRightDeg: number;
    neckFlexionCm: number;
    neckExtensionDeg: number;
  }[];
  unlockedAchievementIds?: string[];
  readArticleIds?: string[];
  hasAcceptedConsent?: boolean;
  consentAcceptedAt?: string;
  onboardingCompleted?: boolean;
  primaryGoal?: 'tech_neck' | 'discopathy' | 'tension_headache' | 'posture_prevention' | 'shoulder_scapula';
  emergencyContactNote?: string;
  weeklyChallengesCompleted?: string[];
  completedMicroBreaksCount?: number;
  ergonomicAudit?: ErgonomicWorkstationAudit;
  bpsLogs?: BiopsychosocialLog[];
}

export interface ErgonomicWorkstationAudit {
  date: string;
  userHeightCm: number;
  workMode: 'sitting' | 'sit_stand';
  deskType: 'fixed' | 'adjustable_sit_stand';
  chairType: 'ergonomic_adjustable' | 'basic_office' | 'kitchen_rigid' | 'exercise_ball';
  monitorSetup: 'single_monitor' | 'dual_monitor' | 'laptop_flat' | 'laptop_stand_external';
  hasArmrests: boolean;
  hasFootrest: boolean;
  hasLumbarSupport: boolean;
  screenDistanceCm: number;
  currentDeskHeightCm: number;
  currentChairSeatHeightCm: number;
  monitorHeightRelation: 'too_low' | 'eye_level' | 'too_high';
  // Computed clinical values based on DIN EN 527 / ISO 9241-5
  recommendedSeatHeightCm: number;
  recommendedSittingDeskHeightCm: number;
  recommendedStandingDeskHeightCm: number;
  recommendedEyeLevelOffsetCm: number;
  calculatedRiskScore: number; // 0-100 (100 = optimal, 0 = severe strain)
  estimatedCervicalLoadKg: number;
  recommendations: string[];
}

export interface BiopsychosocialLog {
  id: string;
  date: string;
  stressLevel: number; // 1-10
  bruxismTension: boolean; // zaciskanie szczęki / bruksizm
  sleepQuality: 'excellent' | 'good' | 'average' | 'poor'; // jakość snu
  pillowType: 'orthopedic_memory_foam' | 'neck_roll' | 'regular_feather' | 'flat' | 'none';
  sleepingPosition: 'back' | 'side' | 'stomach'; // na brzuchu wymusza ekstremalną rotację szyi
  screenHours: number; // godziny przed ekranem
  hydrationGlasses: number; // szklanki wody (uwodnienie dysków)
  notes?: string;
  painVasScoreAtLog?: number;
}

export interface ClinicalFeedback {
  id: string;
  date: string;
  category: 'exercise_pain' | 'video_instruction' | 'bug_issue' | 'feature_request' | 'general';
  exerciseId?: string;
  exerciseName?: string;
  message: string;
  userEmail?: string;
  vasScoreAtFeedback?: number;
}

export type UserProfile = UserHealthProfile;
export type MedicationReminder = ReminderConfig;
