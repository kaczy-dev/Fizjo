import React, { useState, useMemo } from 'react';
import { 
  Trophy, Flame, Crown, Award, Sparkles, ShieldCheck, 
  CheckCircle2, Lock, ChevronRight, ArrowRight, Zap, 
  Dumbbell, Star, ChevronDown, ChevronUp, Layers, Play
} from 'lucide-react';
import { Achievement, AchievementTier } from '../types';
import { ALL_ACHIEVEMENTS } from '../services/achievements';
import { soundService } from '../services/soundService';

export interface MilestoneLevelConfig {
  tier: AchievementTier;
  levelNumber: number;
  name: string;
  titlePl: string;
  subtitle: string;
  requiredSessions: number;
  requiredStreak: number;
  clinicalBenefit: string;
  theme: {
    bgGradient: string;
    borderColor: string;
    badgeBg: string;
    textColor: string;
    iconColor: string;
    progressBar: string;
    ringColor: string;
  };
}

export const MILESTONE_LEVELS: MilestoneLevelConfig[] = [
  {
    tier: 'bronze',
    levelNumber: 1,
    name: 'Brąz',
    titlePl: 'Poziom 1: Brązowy (Adaptacja i Redukcja Bólu)',
    subtitle: 'Przełamanie kinezjofobii, wstępna dekompresja kręgów C5-C7 i wygaszanie ostrego napięcia karku.',
    requiredSessions: 1,
    requiredStreak: 3,
    clinicalBenefit: 'Pierwsze dni ćwiczeń stymulują ukrwienie mięśni podpotylicznych i redukują napięcie spoczynkowe trapeziusa o ok. 18%.',
    theme: {
      bgGradient: 'from-amber-900/10 via-amber-950/5 to-slate-900/40',
      borderColor: 'border-amber-300 dark:border-amber-800/80',
      badgeBg: 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700',
      textColor: 'text-amber-700 dark:text-amber-300',
      iconColor: 'text-amber-600 dark:text-amber-400',
      progressBar: 'bg-gradient-to-r from-amber-500 to-amber-600',
      ringColor: 'ring-amber-500/30'
    }
  },
  {
    tier: 'silver',
    levelNumber: 2,
    name: 'Srebro',
    titlePl: 'Poziom 2: Srebrny (Pamięć Mięśniowa i Świadomość Postawy)',
    subtitle: '7 dni systematyczności, aktywacja zginaczy głębokich szyi (longus colli) oraz audyt stanowiska komputerowego.',
    requiredSessions: 7,
    requiredStreak: 7,
    clinicalBenefit: 'Po tygodniu następuje reorganizacja schematu ciała (body schema) w korze czuciowo-ruchowej, co ogranicza nawykowe wysuwanie brody w przód.',
    theme: {
      bgGradient: 'from-slate-200/40 via-slate-100/30 to-slate-900/40 dark:from-slate-800/40 dark:via-slate-900/50 dark:to-slate-950/60',
      borderColor: 'border-slate-300 dark:border-slate-700',
      badgeBg: 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600',
      textColor: 'text-slate-700 dark:text-slate-300',
      iconColor: 'text-slate-500 dark:text-slate-400',
      progressBar: 'bg-gradient-to-r from-slate-400 to-slate-600',
      ringColor: 'ring-slate-400/30'
    }
  },
  {
    tier: 'gold',
    levelNumber: 3,
    name: 'Złoto',
    titlePl: 'Poziom 3: Złoty (Stabilizacja Dynamiczna i Ochrona Krążków)',
    subtitle: 'Odporność na wielogodzinne przeciążenia biurowe, eliminacja protrakcji głowy i nawykowa autoterapia.',
    requiredSessions: 15,
    requiredStreak: 21,
    clinicalBenefit: '21 dni ciągłości wytwarza neuroplastyczny automatyzm prawidłowej postawy, odciążając krążki C5-C7 o 20 kg w skali całego dnia pracy.',
    theme: {
      bgGradient: 'from-yellow-900/10 via-amber-900/10 to-slate-900/40',
      borderColor: 'border-yellow-400/80 dark:border-yellow-700/80',
      badgeBg: 'bg-yellow-100 dark:bg-yellow-950/80 text-yellow-900 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700',
      textColor: 'text-yellow-700 dark:text-yellow-300',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      progressBar: 'bg-gradient-to-r from-yellow-400 to-amber-500',
      ringColor: 'ring-yellow-400/30'
    }
  },
  {
    tier: 'platinum',
    levelNumber: 4,
    name: 'Platyna',
    titlePl: 'Poziom 4: Platynowy (Mistrzowska Rezyliencja Kręgosłupa)',
    subtitle: 'Elitarna forma biomechaniczna, wzorcowa ruchomość CROM i trwała ochrona przed nawrotami zespołów przeciążeniowych.',
    requiredSessions: 30,
    requiredStreak: 45,
    clinicalBenefit: 'Maksymalna siła i wytrzymałość posturalna. Trwała przebudowa kolagenu więzadłowego i całkowita biomechaniczna autonomia pacjenta.',
    theme: {
      bgGradient: 'from-cyan-950/20 via-teal-950/15 to-slate-900/40',
      borderColor: 'border-cyan-400/80 dark:border-cyan-700/80',
      badgeBg: 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-900 dark:text-cyan-200 border-cyan-300 dark:border-cyan-700',
      textColor: 'text-cyan-700 dark:text-cyan-300',
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      progressBar: 'bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400',
      ringColor: 'ring-cyan-400/40'
    }
  }
];

interface Props {
  achievements: Achievement[];
  totalCompletedSessions: number;
  streakDays: number;
  onOpenAchievements?: () => void;
  onStartActiveSession?: () => void;
  className?: string;
}

export const RehabilitationMilestones: React.FC<Props> = ({
  achievements = ALL_ACHIEVEMENTS,
  totalCompletedSessions = 0,
  streakDays = 0,
  onOpenAchievements,
  onStartActiveSession,
  className = ''
}) => {
  const [activeTierTab, setActiveTierTab] = useState<AchievementTier | 'all'>('all');
  const [expandedTiers, setExpandedTiers] = useState<Record<string, boolean>>({
    bronze: true,
    silver: true,
    gold: false,
    platinum: false
  });

  // Calculate current user rehabilitation tier status
  const milestoneStatus = useMemo(() => {
    let currentTier: AchievementTier = 'bronze';
    let currentLevelNumber = 1;
    let nextTier: MilestoneLevelConfig | null = MILESTONE_LEVELS[1];

    const bronzePassed = totalCompletedSessions >= MILESTONE_LEVELS[0].requiredSessions || streakDays >= 1;
    const silverPassed = totalCompletedSessions >= MILESTONE_LEVELS[1].requiredSessions && streakDays >= MILESTONE_LEVELS[1].requiredStreak;
    const goldPassed = totalCompletedSessions >= MILESTONE_LEVELS[2].requiredSessions && streakDays >= MILESTONE_LEVELS[2].requiredStreak;
    const platinumPassed = totalCompletedSessions >= MILESTONE_LEVELS[3].requiredSessions && streakDays >= MILESTONE_LEVELS[3].requiredStreak;

    if (platinumPassed) {
      currentTier = 'platinum';
      currentLevelNumber = 4;
      nextTier = null;
    } else if (goldPassed) {
      currentTier = 'gold';
      currentLevelNumber = 3;
      nextTier = MILESTONE_LEVELS[3];
    } else if (silverPassed) {
      currentTier = 'silver';
      currentLevelNumber = 2;
      nextTier = MILESTONE_LEVELS[2];
    } else {
      currentTier = 'bronze';
      currentLevelNumber = 1;
      nextTier = MILESTONE_LEVELS[1];
    }

    // Calculate progress percentage to next tier
    let progressPercent = 100;
    let remainingSessions = 0;
    let remainingStreakDays = 0;

    if (nextTier) {
      const sessionProgress = Math.min(1, totalCompletedSessions / nextTier.requiredSessions);
      const streakProgress = Math.min(1, streakDays / nextTier.requiredStreak);
      progressPercent = Math.round(((sessionProgress + streakProgress) / 2) * 100);
      remainingSessions = Math.max(0, nextTier.requiredSessions - totalCompletedSessions);
      remainingStreakDays = Math.max(0, nextTier.requiredStreak - streakDays);
    }

    // Gamification XP
    const totalXP = totalCompletedSessions * 100 + streakDays * 50 + achievements.filter(a => a.unlocked).length * 150;

    return {
      currentTier,
      currentLevelNumber,
      nextTier,
      progressPercent,
      remainingSessions,
      remainingStreakDays,
      totalXP,
      isBronzeUnlocked: bronzePassed,
      isSilverUnlocked: silverPassed,
      isGoldUnlocked: goldPassed,
      isPlatinumUnlocked: platinumPassed
    };
  }, [totalCompletedSessions, streakDays, achievements]);

  // Group achievements by tier
  const achievementsByTier = useMemo(() => {
    // Merge full list to make sure all tiered achievements are counted
    const map = new Map<string, Achievement>();
    ALL_ACHIEVEMENTS.forEach(a => map.set(a.id, { ...a }));
    achievements.forEach(a => {
      const ex = map.get(a.id);
      if (ex) {
        map.set(a.id, { ...ex, ...a });
      } else {
        map.set(a.id, { ...a });
      }
    });

    const all = Array.from(map.values());

    const groups: Record<AchievementTier, Achievement[]> = {
      bronze: all.filter(a => a.tier === 'bronze'),
      silver: all.filter(a => a.tier === 'silver'),
      gold: all.filter(a => a.tier === 'gold'),
      platinum: all.filter(a => a.tier === 'platinum' || a.tier === 'diamond'),
      diamond: all.filter(a => a.tier === 'diamond')
    };

    return groups;
  }, [achievements]);

  const toggleTierExpand = (tier: string) => {
    soundService.playTick();
    setExpandedTiers(prev => ({ ...prev, [tier]: !prev[tier] }));
  };

  const currentLevelConfig = MILESTONE_LEVELS.find(l => l.tier === milestoneStatus.currentTier) || MILESTONE_LEVELS[0];

  const getTierIcon = (tier: AchievementTier) => {
    switch (tier) {
      case 'bronze': return <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'silver': return <Trophy className="w-5 h-5 text-slate-500 dark:text-slate-300" />;
      case 'gold': return <Crown className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />;
      case 'platinum': return <Sparkles className="w-5 h-5 text-cyan-500 dark:text-cyan-300" />;
      default: return <Award className="w-5 h-5 text-teal-600" />;
    }
  };

  return (
    <section 
      id="rehabilitation-milestones-system"
      aria-label="Kamienie Milowe Rehabilitacji"
      className={`bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6 ${className}`}
    >
      {/* SECTION HEADER & CURRENT LEVEL PROGRESS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Grywalizacja & Kamienie Milowe</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-mono font-bold">
              <Zap className="w-3 h-3 fill-amber-500" />
              {milestoneStatus.totalXP} XP
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span>Kamienie Milowe Rehabilitacji</span>
            <span className={`text-xs px-2.5 py-0.5 rounded-lg border font-bold uppercase tracking-wider ${currentLevelConfig.theme.badgeBg}`}>
              {currentLevelConfig.name} (Poziom {milestoneStatus.currentLevelNumber})
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Zdobywaj kolejne poziomy rehabilitacji (Brąz, Srebro, Złoto, Platyna) poprzez sumę ukończonych sesji oraz nieprzerwaną serię dni ćwiczeń.
          </p>
        </div>

        {/* Level Emblem & Next Level Card */}
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 shrink-0 flex flex-col sm:min-w-[280px]">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              {getTierIcon(milestoneStatus.currentTier)}
              <span>Aktualny status:</span>
            </span>
            <strong className="text-teal-700 dark:text-teal-300 font-bold uppercase">
              {currentLevelConfig.name}
            </strong>
          </div>

          {milestoneStatus.nextTier ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                <span>Postęp do: <strong className="text-slate-800 dark:text-slate-200">{milestoneStatus.nextTier.name}</strong></span>
                <span className="font-mono font-bold text-teal-600 dark:text-teal-400">{milestoneStatus.progressPercent}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${milestoneStatus.nextTier.theme.progressBar}`}
                  style={{ width: `${milestoneStatus.progressPercent}%` }}
                />
              </div>

              <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                Brakuje: <strong className="text-slate-800 dark:text-slate-200">{milestoneStatus.remainingSessions} sesji</strong> oraz <strong className="text-slate-800 dark:text-slate-200">{milestoneStatus.remainingStreakDays} dni serii</strong>
              </div>
            </div>
          ) : (
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 py-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Osiągnięto najwyższy poziom: Platynowy Mistrz!</span>
            </div>
          )}

          {onStartActiveSession && (
            <button
              id="milestone-train-now-btn"
              type="button"
              onClick={onStartActiveSession}
              className="mt-3 w-full py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Ćwicz teraz, by awansować</span>
            </button>
          )}
        </div>
      </div>

      {/* QUICK SUMMARY TILES ACROSS THE 4 LEVELS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {MILESTONE_LEVELS.map((lvl) => {
          const isCurrent = lvl.tier === milestoneStatus.currentTier;
          const isPassed = 
            (lvl.tier === 'bronze' && milestoneStatus.isBronzeUnlocked) ||
            (lvl.tier === 'silver' && milestoneStatus.isSilverUnlocked) ||
            (lvl.tier === 'gold' && milestoneStatus.isGoldUnlocked) ||
            (lvl.tier === 'platinum' && milestoneStatus.isPlatinumUnlocked);

          const tierAchievements = achievementsByTier[lvl.tier] || [];
          const unlockedInTier = tierAchievements.filter(a => a.unlocked).length;

          return (
            <button
              key={lvl.tier}
              type="button"
              onClick={() => {
                setActiveTierTab(lvl.tier);
                setExpandedTiers(prev => ({ ...prev, [lvl.tier]: true }));
                soundService.playTick();
              }}
              className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                activeTierTab === lvl.tier
                  ? `${lvl.theme.borderColor} ${lvl.theme.badgeBg} shadow-sm ring-2 ${lvl.theme.ringColor}`
                  : isPassed
                  ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/70 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                  : 'bg-slate-50/50 dark:bg-slate-800/20 border-slate-200/60 dark:border-slate-800/60 opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                  {getTierIcon(lvl.tier)}
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isPassed
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                    : isCurrent
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {isPassed ? 'Zdobyty ✓' : isCurrent ? 'Aktywny' : 'Zablokowany 🔒'}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  {lvl.name}
                </h3>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5 mt-1">
                  <div>Min. {lvl.requiredSessions} sesji • {lvl.requiredStreak} dni serii</div>
                  <div className="font-semibold text-teal-700 dark:text-teal-300">
                    Odznaki: {unlockedInTier}/{tierAchievements.length}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* FILTER TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => {
              setActiveTierTab('all');
              soundService.playTick();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTierTab === 'all'
                ? 'bg-white dark:bg-slate-900 text-teal-900 dark:text-teal-200 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Wszystkie Poziomy
          </button>

          {MILESTONE_LEVELS.map(lvl => (
            <button
              key={lvl.tier}
              type="button"
              onClick={() => {
                setActiveTierTab(lvl.tier);
                soundService.playTick();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeTierTab === lvl.tier
                  ? 'bg-white dark:bg-slate-900 text-teal-900 dark:text-teal-200 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{lvl.name}</span>
            </button>
          ))}
        </div>

        {onOpenAchievements && (
          <button
            id="open-full-achievements-from-milestones"
            type="button"
            onClick={onOpenAchievements}
            className="flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-300 hover:underline cursor-pointer"
          >
            <span>Otwórz Pełną Galerię Medali</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* LEVEL CARDS LIST */}
      <div className="space-y-5">
        {MILESTONE_LEVELS.filter(lvl => activeTierTab === 'all' || activeTierTab === lvl.tier).map((lvl) => {
          const isPassed = 
            (lvl.tier === 'bronze' && milestoneStatus.isBronzeUnlocked) ||
            (lvl.tier === 'silver' && milestoneStatus.isSilverUnlocked) ||
            (lvl.tier === 'gold' && milestoneStatus.isGoldUnlocked) ||
            (lvl.tier === 'platinum' && milestoneStatus.isPlatinumUnlocked);

          const isExpanded = expandedTiers[lvl.tier] ?? true;
          const tierAchievements = achievementsByTier[lvl.tier] || [];
          const unlockedCount = tierAchievements.filter(a => a.unlocked).length;

          // Sessions progress for this tier
          const sessionRatio = Math.min(1, totalCompletedSessions / lvl.requiredSessions);
          const streakRatio = Math.min(1, streakDays / lvl.requiredStreak);

          return (
            <div
              key={lvl.tier}
              id={`milestone-tier-${lvl.tier}`}
              className={`rounded-3xl border transition-all overflow-hidden bg-gradient-to-br ${lvl.theme.bgGradient} ${lvl.theme.borderColor}`}
            >
              {/* Card Header (Accordion toggle) */}
              <div 
                onClick={() => toggleTierExpand(lvl.tier)}
                className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 shadow-xs shrink-0">
                    {getTierIcon(lvl.tier)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                        {lvl.titlePl}
                      </h3>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${lvl.theme.badgeBg}`}>
                        {isPassed ? 'Poziom Osiągnięty ✓' : 'W trakcie realizacji'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                      {lvl.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end md:self-center shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Odznaki poziomu: {unlockedCount}/{tierAchievements.length}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Wymóg: {lvl.requiredSessions} sesji / {lvl.requiredStreak} dni
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Card Body (when expanded) */}
              {isExpanded && (
                <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 space-y-5">
                  {/* Criteria Trackers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {/* Session requirement bar */}
                    <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Dumbbell className="w-3.5 h-3.5 text-teal-600" />
                          <span>Ukończone sesje rehabilitacyjne:</span>
                        </span>
                        <strong className="font-mono text-slate-900 dark:text-white">
                          {Math.min(totalCompletedSessions, lvl.requiredSessions)} / {lvl.requiredSessions}
                        </strong>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-teal-600 dark:bg-teal-400 rounded-full transition-all duration-300"
                          style={{ width: `${Math.round(sessionRatio * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Streak requirement bar */}
                    <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span>Ciągłość serii (dni z rzędu):</span>
                        </span>
                        <strong className="font-mono text-slate-900 dark:text-white">
                          {Math.min(streakDays, lvl.requiredStreak)} / {lvl.requiredStreak} dni
                        </strong>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 rounded-full transition-all duration-300"
                          style={{ width: `${Math.round(streakRatio * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Clinical Benefit Note */}
                  <div className="p-3 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/70 dark:border-teal-800/60 flex items-start gap-2.5 text-xs text-teal-900 dark:text-teal-200">
                    <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">Kluczowy cel kliniczny: </strong>
                      <span>{lvl.clinicalBenefit}</span>
                    </div>
                  </div>

                  {/* Grouped Achievements in this Level */}
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5" />
                      <span>Odznaki przypisane do Poziomu {lvl.name} ({tierAchievements.length}):</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {tierAchievements.map((ach) => {
                        const isAchUnlocked = ach.unlocked;
                        const progress = ach.progress || 0;
                        const maxProg = ach.maxProgress || 1;
                        const progPercent = Math.round((progress / maxProg) * 100);

                        return (
                          <div
                            key={ach.id}
                            id={`achievement-card-${ach.id}`}
                            className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                              isAchUnlocked
                                ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-2xs'
                                : 'bg-slate-100/60 dark:bg-slate-800/40 border-dashed border-slate-300 dark:border-slate-700/80 opacity-80'
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <div className={`p-2 rounded-xl shrink-0 ${
                                isAchUnlocked
                                  ? 'bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800'
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                              }`}>
                                {isAchUnlocked ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                  <Lock className="w-4 h-4" />
                                )}
                              </div>

                              <div className="space-y-0.5 min-w-0">
                                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                  {ach.title}
                                </div>
                                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug line-clamp-2">
                                  {ach.description}
                                </p>
                              </div>
                            </div>

                            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
                              <span className="text-slate-500 font-medium">
                                Postęp: {progress}/{maxProg}
                              </span>
                              <span className={`font-bold ${isAchUnlocked ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                                {isAchUnlocked ? 'Odblokowano ✓' : `${progPercent}%`}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
