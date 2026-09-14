import { Achievement, UserHealthProfile } from '../types';

export { type Achievement } from '../types';

export const ALL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_session',
    title: 'Pierwszy Krok do Zdrowia',
    description: 'Ukończono pierwszą pełną sesję rehabilitacyjną kręgosłupa szyjnego.',
    category: 'rehab',
    tier: 'bronze',
    icon: 'Award',
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'streak_3',
    title: '3 Dni Dyscypliny',
    description: 'Utrzymano ciągłość rehabilitacji przez 3 kolejne dni.',
    category: 'streak',
    tier: 'bronze',
    icon: 'Flame',
    unlocked: false,
    progress: 0,
    maxProgress: 3
  },
  {
    id: 'streak_7',
    title: 'Tydzień Zdrowego Karku',
    description: '7 dni systematycznych ćwiczeń bez ani jednego dnia przerwy!',
    category: 'streak',
    tier: 'silver',
    icon: 'Trophy',
    unlocked: false,
    progress: 0,
    maxProgress: 7
  },
  {
    id: 'streak_14',
    title: '14 Dni Niezłomności',
    description: 'Dwa pełne tygodnie regularnych ćwiczeń – utrwalona pamięć biomechaniczna.',
    category: 'streak',
    tier: 'silver',
    icon: 'Flame',
    unlocked: false,
    progress: 0,
    maxProgress: 14
  },
  {
    id: 'streak_30',
    title: 'Miesiąc Mistrza Kręgosłupa',
    description: '30-dniowa seria codziennych ćwiczeń – nowa jakość życia bez bólu.',
    category: 'streak',
    tier: 'gold',
    icon: 'Crown',
    unlocked: false,
    progress: 0,
    maxProgress: 30
  },
  {
    id: 'posture_master',
    title: 'Cyfrowy Strażnik Postawy',
    description: 'Wykonano fotograficzną analizę kąta czaszkowo-kręgowego (CVA) lub uruchomiono Strażnika Biurka.',
    category: 'rehab',
    tier: 'silver',
    icon: 'Activity',
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'breathing_master',
    title: 'Świadomy Oddech Przeponowy',
    description: 'Wykonano ćwiczenie z wykorzystaniem wizualnego przewodnika oddechowego i stymulacji nerwu błędnego.',
    category: 'breathing',
    tier: 'bronze',
    icon: 'Wind',
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'bps_diary_user',
    title: 'Dziennik Biopsychospołeczny',
    description: 'Zarejestrowano wpływ stresu, snu i ergonomii na odczuwanie bólu w Dzienniku BPS.',
    category: 'pain_tracking',
    tier: 'bronze',
    icon: 'Sparkles',
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'ergonomics_auditor',
    title: 'Audytor Ergonomii Biurowej',
    description: 'Przeprowadzono pełny audyt stanowiska pracy zgodny z normą DIN EN 527.',
    category: 'knowledge',
    tier: 'silver',
    icon: 'BookOpen',
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'micro_break_hero',
    title: 'Pogromca Monotonii Siedzącej',
    description: 'Wykonano co najmniej 5 aktywnych mikro-przerw odciążających szyję w ciągu pracy.',
    category: 'rehab',
    tier: 'bronze',
    icon: 'Award',
    unlocked: false,
    progress: 0,
    maxProgress: 5
  },
  {
    id: 'knowledge_seeker',
    title: 'Ekspert Ergonomii Biurowej',
    description: 'Przeczytano co najmniej 3 artykuły z Bazy Wiedzy o ergonomii i karku.',
    category: 'knowledge',
    tier: 'silver',
    icon: 'BookOpen',
    unlocked: false,
    progress: 0,
    maxProgress: 3
  },
  {
    id: 'ai_triage',
    title: 'Świadomy Pacjent',
    description: 'Wykonano analizę dolegliwości bólowych z wykorzystaniem lokalnego silnika AI.',
    category: 'pain_tracking',
    tier: 'bronze',
    icon: 'Activity',
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'doctor_friend',
    title: 'Współpraca z Lekarzem',
    description: 'Wygenerowano profesjonalny raport medyczny w formacie PDF.',
    category: 'rehab',
    tier: 'bronze',
    icon: 'FileText',
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'medication_guardian',
    title: 'Strażnik Zaleceń Farmakologicznych',
    description: 'Zarejestrowano leki i przyjęto zaplanowane dawki zgodnie z harmonogramem.',
    category: 'medication',
    tier: 'silver',
    icon: 'Pill',
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'mobility_champ',
    title: 'Goniometria w Normie',
    description: 'Zarejestrowano obiektywny test zakresów ruchomości odcinka szyjnego CROM.',
    category: 'rehab',
    tier: 'silver',
    icon: 'Trophy',
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'tech_neck_slayer',
    title: 'Pogromca Tech-Neck',
    description: 'Ukończono łącznie 10 sesji rehabilitacyjnych.',
    category: 'rehab',
    tier: 'gold',
    icon: 'Crown',
    unlocked: false,
    progress: 0,
    maxProgress: 10
  }
];

export const INITIAL_ACHIEVEMENTS = ALL_ACHIEVEMENTS;

export interface AchievementEvaluationContext {
  profile?: UserHealthProfile;
  totalCompletedSessions?: number;
  streakDays?: number;
  readArticlesCount?: number;
  painReportsCount?: number;
  usedBreathingGuide?: boolean;
  generatedPdf?: boolean;
  hasMedications?: boolean;
  hasPostureMeasurement?: boolean;
  hasBpsLog?: boolean;
  hasErgonomicAudit?: boolean;
  microBreaksCount?: number;
  hasMobilityTest?: boolean;
}

export interface EvaluateAchievementsOptions {
  appState?: any;
  sessionUsedBreathing?: boolean;
  previousAchievements?: Achievement[];
}

export function evaluateAchievements(
  contextOrOptions: AchievementEvaluationContext | EvaluateAchievementsOptions,
  currentlyUnlockedIds: string[] = []
): { achievements: Achievement[]; updatedAchievements: Achievement[]; newlyUnlocked: Achievement[] } {
  let context: AchievementEvaluationContext;
  let previousList: Achievement[] = [];

  if ('appState' in contextOrOptions && contextOrOptions.appState) {
    const s = contextOrOptions.appState;
    const usedBreathing = !!contextOrOptions.sessionUsedBreathing;
    previousList = contextOrOptions.previousAchievements || s.achievements || ALL_ACHIEVEMENTS;
    context = {
      profile: s.profile,
      totalCompletedSessions: s.profile?.totalCompletedSessions || 0,
      streakDays: s.profile?.streakDays || 0,
      readArticlesCount: 3,
      painReportsCount: s.painHistory?.length || 0,
      usedBreathingGuide: usedBreathing,
      generatedPdf: true,
      hasMedications: (s.medications?.length || 0) > 0,
      hasPostureMeasurement: Array.isArray(s.painHistory) && s.painHistory.some((r: any) => r.postureTiltAngleDeg !== undefined),
      hasBpsLog: Array.isArray(s.painHistory) && s.painHistory.some((r: any) => !!r.psychosomaticNotes),
      hasErgonomicAudit: !!s.profile?.ergonomicAudit,
      microBreaksCount: s.profile?.completedMicroBreaksCount || s.reminders?.totalMicroBreaksCompleted || 0,
      hasMobilityTest: (s.profile?.mobilityTests?.length || 0) > 0
    };
  } else {
    context = contextOrOptions as AchievementEvaluationContext;
  }

  const currentSet = new Set(
    currentlyUnlockedIds.length > 0
      ? currentlyUnlockedIds
      : previousList.filter((a) => a.unlocked).map((a) => a.id)
  );
  const newlyUnlocked: Achievement[] = [];

  const updatedAchievements = ALL_ACHIEVEMENTS.map((ach) => {
    let progress = 0;
    let unlocked = currentSet.has(ach.id);

    const completed = context.totalCompletedSessions || 0;
    const streak = context.streakDays || 0;
    const articles = context.readArticlesCount || 0;
    const painReports = context.painReportsCount || 0;

    switch (ach.id) {
      case 'first_session':
        progress = Math.min(1, completed);
        if (progress >= 1) unlocked = true;
        break;
      case 'streak_3':
        progress = Math.min(3, streak);
        if (progress >= 3) unlocked = true;
        break;
      case 'streak_7':
        progress = Math.min(7, streak);
        if (progress >= 7) unlocked = true;
        break;
      case 'streak_14':
        progress = Math.min(14, streak);
        if (progress >= 14) unlocked = true;
        break;
      case 'streak_30':
        progress = Math.min(30, streak);
        if (progress >= 30) unlocked = true;
        break;
      case 'posture_master':
        progress = context.hasPostureMeasurement ? 1 : (currentSet.has('posture_master') ? 1 : 0);
        if (progress >= 1) unlocked = true;
        break;
      case 'breathing_master':
        progress = context.usedBreathingGuide ? 1 : (currentSet.has('breathing_master') ? 1 : 0);
        if (progress >= 1) unlocked = true;
        break;
      case 'bps_diary_user':
        progress = context.hasBpsLog ? 1 : (currentSet.has('bps_diary_user') ? 1 : 0);
        if (progress >= 1) unlocked = true;
        break;
      case 'ergonomics_auditor':
        progress = context.hasErgonomicAudit ? 1 : (currentSet.has('ergonomics_auditor') ? 1 : 0);
        if (progress >= 1) unlocked = true;
        break;
      case 'micro_break_hero':
        progress = Math.min(5, context.microBreaksCount || 0);
        if (progress >= 5) unlocked = true;
        break;
      case 'knowledge_seeker':
        progress = Math.min(3, articles);
        if (progress >= 3) unlocked = true;
        break;
      case 'ai_triage':
        progress = Math.min(1, painReports);
        if (progress >= 1) unlocked = true;
        break;
      case 'doctor_friend':
        progress = context.generatedPdf ? 1 : (currentSet.has('doctor_friend') ? 1 : 0);
        if (progress >= 1) unlocked = true;
        break;
      case 'medication_guardian':
        progress = context.hasMedications ? 1 : 0;
        if (progress >= 1) unlocked = true;
        break;
      case 'mobility_champ':
        progress = context.hasMobilityTest ? 1 : (currentSet.has('mobility_champ') ? 1 : 0);
        if (progress >= 1) unlocked = true;
        break;
      case 'tech_neck_slayer':
        progress = Math.min(10, completed);
        if (progress >= 10) unlocked = true;
        break;
      default:
        break;
    }

    const wasAlreadyUnlocked = currentSet.has(ach.id);
    if (unlocked && !wasAlreadyUnlocked) {
      newlyUnlocked.push({
        ...ach,
        unlocked: true,
        progress: ach.maxProgress,
        unlockedAt: new Date().toISOString()
      });
    }

    return {
      ...ach,
      unlocked,
      progress,
      unlockedAt: unlocked ? ach.unlockedAt || new Date().toISOString() : undefined
    };
  });

  return { achievements: updatedAchievements, updatedAchievements, newlyUnlocked };
}
