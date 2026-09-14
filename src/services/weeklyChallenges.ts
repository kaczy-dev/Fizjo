import { AppState } from './privacyStorage';
import { WeeklyChallenge } from '../types';

export const INITIAL_WEEKLY_CHALLENGES: Omit<WeeklyChallenge, 'currentCount' | 'isCompleted'>[] = [
  {
    id: 'consistency-master',
    title: 'Mistrz Regularności',
    description: 'Wykonaj co najmniej 5 pełnych sesji rehabilitacyjnych w bieżącym tygodniu.',
    category: 'consistency',
    badgeName: 'Mistrz Regularności',
    badgeIcon: 'Flame',
    targetCount: 5,
    unit: 'sesji',
    rewardPoints: 150
  },
  {
    id: 'pain-free-week',
    title: 'Tydzień Bez Bólu',
    description: 'Utrzymaj średni poziom bólu VAS ≤ 2 lub zarejestruj 7 dni z rzędu bezpiecznej autoterapii.',
    category: 'pain_relief',
    badgeName: 'Tydzień Bez Bólu',
    badgeIcon: 'ShieldCheck',
    targetCount: 7,
    unit: 'dni',
    rewardPoints: 200
  },
  {
    id: 'tech-neck-slayer',
    title: 'Pogromca Tech-Neck',
    description: 'Wykonaj 10 inteligentnych 30-sekundowych mikro-przerw na retrakcję szyi (Chin Tuck).',
    category: 'micro_breaks',
    badgeName: 'Pogromca Tech-Neck',
    badgeIcon: 'Zap',
    targetCount: 10,
    unit: 'mikro-przerw',
    rewardPoints: 120
  },
  {
    id: 'morning-warrior',
    title: 'Poranny Wojownik',
    description: 'Ukończ 3 sesje lub poranne aktywacje karku przed godziną 09:30.',
    category: 'morning',
    badgeName: 'Poranny Wojownik',
    badgeIcon: 'Sun',
    targetCount: 3,
    unit: 'poranków',
    rewardPoints: 100
  },
  {
    id: 'mindful-patient',
    title: 'Świadomy Pacjent',
    description: 'Zgłąb wiedzę kliniczną: przeczytaj 4 artykuły lub skonsultuj technikę z Ekspertem AI.',
    category: 'education',
    badgeName: 'Świadomy Pacjent',
    badgeIcon: 'BookOpen',
    targetCount: 4,
    unit: 'lekcji',
    rewardPoints: 80
  }
];

export function evaluateWeeklyChallenges(state: AppState): WeeklyChallenge[] {
  const profile = state.profile;
  const completedDates = profile.completedSessionDates || [];
  
  // Calculate sessions in the last 7 days
  const now = new Date();
  const oneWeekAgoMs = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  
  const recentSessionsCount = completedDates.filter(d => {
    const sessionTime = new Date(d).getTime();
    return sessionTime >= oneWeekAgoMs;
  }).length;

  // Streak or low pain days
  const streak = profile.streakDays || 0;
  const painReports = state.painHistory || [];
  const recentPain = painReports.filter(p => new Date(p.date).getTime() >= oneWeekAgoMs);
  const lowPainDays = recentPain.filter(p => p.vasScore <= 2).length;
  const painFreeProgress = Math.max(streak, lowPainDays);

  // Micro breaks completed
  const microBreaks = profile.completedMicroBreaksCount || state.reminders.totalMicroBreaksCompleted || 0;

  // Morning sessions (estimated from completed sessions and streak)
  const morningCount = Math.min(recentSessionsCount, 3);

  // Knowledge & AI expert reads
  const articlesRead = (profile.readArticleIds || []).length;

  const unlockedBadges = new Set(profile.weeklyChallengesCompleted || []);

  return INITIAL_WEEKLY_CHALLENGES.map(def => {
    let currentCount = 0;

    switch (def.id) {
      case 'consistency-master':
        currentCount = recentSessionsCount;
        break;
      case 'pain-free-week':
        currentCount = painFreeProgress;
        break;
      case 'tech-neck-slayer':
        currentCount = microBreaks;
        break;
      case 'morning-warrior':
        currentCount = morningCount;
        break;
      case 'mindful-patient':
        currentCount = articlesRead;
        break;
      default:
        currentCount = 0;
    }

    const isCompleted = unlockedBadges.has(def.id) || currentCount >= def.targetCount;

    return {
      ...def,
      currentCount: Math.min(currentCount, def.targetCount),
      isCompleted,
      unlockedAt: isCompleted ? (def.id in unlockedBadges ? new Date().toISOString() : undefined) : undefined
    };
  });
}
