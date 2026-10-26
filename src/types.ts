export type SpineRegion = 'cervical' | 'thoracic' | 'lumbar' | 'full_spine';

export type NavTab = 'dashboard' | 'exercises' | 'knowledge' | 'plan' | 'triage' | 'ergonomics' | 'reports' | 'wearables' | 'profile';

export type PainIntensity = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type VideoHudCategory = 'auto' | 'posture' | 'rom' | 'breathing' | 'mistakes';

export interface VideoPhaseCue {
  id: 'prepare' | 'concentric' | 'isometric' | 'eccentric';
  label: string; // e.g. "1. Postawa wyjściowa"
  shortLabel: string; // e.g. "Postawa"
  startProgress: number; // 0.0 to 1.0
  endProgress: number; // 0.0 to 1.0
  breathAction: 'Wdech nosem' | 'Wydech ustami' | 'Spokojny oddech' | 'Długi wydech';
  romMetricLabel: string; // e.g. "Oś 0° (Neutralna)" or "Retrakcja -18 mm"
  primaryCategory: 'posture' | 'rom' | 'breathing' | 'mistakes';
  hudHeadline: string;
  hudDetail: string;
  mistakeAlert?: string;
}

export interface VideoClinicalCues {
  posture: {
    title: string;
    checkpoints: string[];
    alignmentVector: string;
  };
  rangeOfMotion: {
    title: string;
    safeRangeLabel: string;
    targetAngleOrShift: string;
    biomechanicalNote: string;
  };
  breathing: {
    title: string;
    patternLabel: string;
    inhalePhase: string;
    exhalePhase: string;
    clinicalTip: string;
  };
  commonMistakes: {
    mistake: string;
    consequence: string;
    correction: string;
  }[];
}

export interface VideoInstruction {
  hdResolutionLabel: string; // e.g. "1080p HD • 60 FPS"
  cycleSeconds: number;
  recommendedSlowSpeed: 0.5 | 0.75;
  cameraAngles: ('sagittal' | 'coronal' | 'split')[];
  phases: VideoPhaseCue[];
  clinicalCues: VideoClinicalCues;
}

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
  videoInstruction?: VideoInstruction;
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

export interface PersonalizedExercisePrescription {
  exerciseId: string;
  exerciseName: string;
  prescribedSets: number;
  prescribedReps: number;
  prescribedHoldSeconds: number;
  prescribedTempo: string;
  clinicalPriority: 'core_decompression' | 'neuro_mobility' | 'postural_stability' | 'myofascial_release';
  priorityLabelPl: string;
  selectionReason: string;
  safetyModification: string;
}

export interface ClinicalPersonalizationDiagnostic {
  computedAt: string;
  avgVasLast7Days: number;
  vasTrendDelta: number;
  dominantPainRegions: string[];
  dominantPainCharacter: string;
  detectedClinicalPhenotype:
    | 'cervical_radiculopathy'
    | 'cervicogenic_headache'
    | 'acute_protective_spasm'
    | 'upper_crossed_tech_neck'
    | 'axial_cervico_lumbar';
  phenotypeLabelPl: string;
  progressionPhase: 'phase_1_acute_relief' | 'phase_2_mobility_restoration' | 'phase_3_deep_stabilization';
  progressionPhaseLabelPl: string;
  healthRiskFactors: string[];
  excludedExercisesWithReasons: {
    exerciseId: string;
    exerciseName: string;
    reason: string;
  }[];
  prescribedExercises: PersonalizedExercisePrescription[];
}

export interface ExerciseExecutionRecord {
  exerciseId: string;
  exerciseName: string;
  targetRegion: SpineRegion;
  completedSets: number;
  completedReps: number;
  holdSecondsAchieved: number;
  tempoUsed: string;
  perceivedDifficultyRpe: number; // 1-10 Borg CR10
  painDuringExerciseVas: number; // 0-10 VAS
  usedSlowMotionVideo: boolean;
}

export interface ExerciseSessionHistoryEntry {
  id: string;
  timestamp: string;
  dateStr: string;
  planId: string;
  dayIndex: number;
  dayFocusArea: string;
  durationMinutes: number;
  preSessionVas: number;
  postSessionVas: number;
  vasDelta: number; // postSessionVas - preSessionVas (negative = pain relief)
  difficultyLevel: number; // 1-5
  usedBreathingGuide: boolean;
  avgHeartRateBpm?: number;
  patientMood?: PatientMood;
  stressLevel?: number;
  sessionNotes?: string;
  adherenceScorePercent: number;
  exercisesExecuted: ExerciseExecutionRecord[];
}

export interface ExerciseMasteryMetric {
  exerciseId: string;
  exerciseName: string;
  sessionsCount: number;
  totalSetsCompleted: number;
  totalRepsCompleted: number;
  totalIsometricHoldSeconds: number;
  avgVasDelta: number;
  masteryLevel: 'początkujący' | 'średniozaawansowany' | 'zaawansowany';
  lastPerformedAt: string;
}

export interface UserRehabProgressSummary {
  lastUpdatedAt: string;
  totalSessionsCompleted: number;
  totalRepsCompleted: number;
  totalIsometricMinutes: number;
  totalRehabMinutes: number;
  currentStreakDays: number;
  longestStreakDays: number;
  meanPreSessionVas: number;
  meanPostSessionVas: number;
  meanVasReductionPerSession: number;
  adherence30DayPercent: number;
  cromRotationImprovementDeg: number;
  exerciseMasteryById: Record<string, ExerciseMasteryMetric>;
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
  personalizationDiagnostic?: ClinicalPersonalizationDiagnostic;
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
  preSessionVas?: number;
  postSessionVas?: number;
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

export interface RestingHeartRateHistoryPoint {
  date: string; // e.g. "2026-09-15"
  dayLabel: string; // e.g. "Pn", "Wt", "Śr"
  restingHeartRate: number; // e.g. 62 BPM
  avgHeartRate?: number; // e.g. 72 BPM
  maxHeartRate?: number; // e.g. 118 BPM
  source?: string;
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
  source: 'bluetooth_ble' | 'apple_health' | 'google_fit' | 'garmin' | 'huawei_health' | 'huawei_ble' | 'simulated';
  heartRateHistory?: RestingHeartRateHistoryPoint[];
  autoSyncEnabled?: boolean;
  heartRateThresholdBpm?: number; // e.g. 120 BPM threshold
  connectionRssi?: number; // e.g. -62 dBm
  connectionSignal?: 'excellent' | 'good' | 'fair' | 'poor' | 'disconnected';
  huaweiDetails?: {
    modelName?: string;
    truSeenVersion?: string;
    firmwareVersion?: string;
    connectionType?: 'ble_live' | 'health_app_sync' | 'cloud_sync';
    lastImportedFileName?: string;
    signalStrength?: 'doskonała' | 'dobra' | 'średnia' | 'słaba';
    rssi?: number;
    sensorStatus?: string;
    autoSyncIntervalMinutes?: number;
  };
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
  heightCm?: number;
  exerciseHistory?: ExerciseSessionHistoryEntry[];
  progressSummary?: UserRehabProgressSummary;
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
