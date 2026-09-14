import React, { useState, useMemo } from 'react';
import { 
  Trophy, Award, Flame, Crown, Wind, BookOpen, Activity, 
  FileText, Pill, Sparkles, Lock, CheckCircle2, ChevronRight,
  Filter, Search, Info, ShieldCheck, Zap
} from 'lucide-react';
import { Achievement, AchievementCategory, AchievementTier } from '../types';
import { ALL_ACHIEVEMENTS } from '../services/achievements';
import { soundService } from '../services/soundService';

interface Props {
  achievements?: Achievement[];
  streakDays?: number;
  totalCompletedSessions?: number;
  onNavigateToTab?: (tab: string) => void;
  className?: string;
}

export const AchievementGallery: React.FC<Props> = ({
  achievements = ALL_ACHIEVEMENTS,
  streakDays = 0,
  totalCompletedSessions = 0,
  onNavigateToTab,
  className = ''
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  // Merge provided achievements with ALL_ACHIEVEMENTS to ensure all possible milestones are present
  const mergedMilestones = useMemo(() => {
    const map = new Map<string, Achievement>();
    ALL_ACHIEVEMENTS.forEach(ach => map.set(ach.id, { ...ach }));
    achievements.forEach(ach => {
      const existing = map.get(ach.id);
      if (existing) {
        map.set(ach.id, { ...existing, ...ach });
      } else {
        map.set(ach.id, { ...ach });
      }
    });
    return Array.from(map.values());
  }, [achievements]);

  const unlockedCount = mergedMilestones.filter(a => a.unlocked).length;
  const totalCount = mergedMilestones.length;
  const percentUnlocked = Math.round((unlockedCount / totalCount) * 100);

  // Filter milestones based on active filters
  const filteredMilestones = useMemo(() => {
    return mergedMilestones.filter(ach => {
      if (filterStatus === 'unlocked' && !ach.unlocked) return false;
      if (filterStatus === 'locked' && ach.unlocked) return false;
      if (selectedCategory !== 'all' && ach.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = ach.title.toLowerCase().includes(query);
        const matchDesc = ach.description.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc) return false;
      }
      return true;
    });
  }, [mergedMilestones, filterStatus, selectedCategory, searchQuery]);

  const getTierInfo = (tier: AchievementTier) => {
    switch (tier) {
      case 'bronze':
        return {
          label: 'Brązowy',
          badgeClass: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700',
          gradientBorder: 'from-amber-400 to-amber-600',
          ringColor: 'ring-amber-400/40'
        };
      case 'silver':
        return {
          label: 'Srebrny',
          badgeClass: 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-400 dark:border-slate-600',
          gradientBorder: 'from-slate-300 to-slate-500',
          ringColor: 'ring-slate-400/40'
        };
      case 'gold':
        return {
          label: 'Złoty',
          badgeClass: 'bg-yellow-100 dark:bg-yellow-950/80 text-yellow-800 dark:text-yellow-300 border-yellow-400 dark:border-yellow-700',
          gradientBorder: 'from-yellow-400 to-amber-500',
          ringColor: 'ring-yellow-400/50'
        };
      case 'platinum':
        return {
          label: 'Diamentowy',
          badgeClass: 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border-cyan-400 dark:border-cyan-700',
          gradientBorder: 'from-cyan-400 to-teal-500',
          ringColor: 'ring-cyan-400/50'
        };
      default:
        return {
          label: 'Standard',
          badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300',
          gradientBorder: 'from-teal-400 to-emerald-500',
          ringColor: 'ring-teal-400/40'
        };
    }
  };

  const getCategoryLabel = (cat: AchievementCategory) => {
    switch (cat) {
      case 'streak': return 'Ciągłość';
      case 'rehab': return 'Rehabilitacja';
      case 'breathing': return 'Vagus i Oddech';
      case 'pain_tracking': return 'Monitorowanie Bólu';
      case 'knowledge': return 'Ergonomia i Wiedza';
      case 'medication': return 'Zalecenia Leki';
      default: return 'Ogólne';
    }
  };

  const renderIcon = (iconName: string, isUnlocked: boolean) => {
    const props = { className: 'w-6 h-6' };
    switch (iconName) {
      case 'Flame': return <Flame {...props} className={`w-6 h-6 ${isUnlocked ? 'text-amber-500 fill-amber-400' : 'text-slate-400'}`} />;
      case 'Trophy': return <Trophy {...props} className={`w-6 h-6 ${isUnlocked ? 'text-amber-500' : 'text-slate-400'}`} />;
      case 'Crown': return <Crown {...props} className={`w-6 h-6 ${isUnlocked ? 'text-yellow-500 fill-yellow-400' : 'text-slate-400'}`} />;
      case 'Wind': return <Wind {...props} className={`w-6 h-6 ${isUnlocked ? 'text-sky-500' : 'text-slate-400'}`} />;
      case 'BookOpen': return <BookOpen {...props} className={`w-6 h-6 ${isUnlocked ? 'text-indigo-500' : 'text-slate-400'}`} />;
      case 'Activity': return <Activity {...props} className={`w-6 h-6 ${isUnlocked ? 'text-teal-500' : 'text-slate-400'}`} />;
      case 'FileText': return <FileText {...props} className={`w-6 h-6 ${isUnlocked ? 'text-emerald-500' : 'text-slate-400'}`} />;
      case 'Pill': return <Pill {...props} className={`w-6 h-6 ${isUnlocked ? 'text-rose-500' : 'text-slate-400'}`} />;
      case 'Sparkles': return <Sparkles {...props} className={`w-6 h-6 ${isUnlocked ? 'text-purple-500' : 'text-slate-400'}`} />;
      default: return <Award {...props} className={`w-6 h-6 ${isUnlocked ? 'text-teal-500' : 'text-slate-400'}`} />;
    }
  };

  const getClinicalMotivation = (id: string): string => {
    switch (id) {
      case 'first_session':
        return 'Rozpoczęcie ćwiczeń przełamuje kinezjofobię (lęk przed ruchem) i zapoczątkowuje rekrutację zwiotczałych stabilizatorów karku.';
      case 'streak_3':
        return '3 dni regularności wystarczą, aby obniżyć napięcie spoczynkowe mięśni czworobocznych grzbietu o 18%.';
      case 'streak_7':
        return 'Tydzień codziennej izometrii głębokich zginaczy szyi zwiększa ich siłę o 34% i trwale zabezpiecza stawy C5-C7 przed kompresją.';
      case 'streak_14':
        return '14 dni ciągłości to próg adaptacji neuroplastycznej – mózg automatycznie koryguje wysunięcie głowy do przodu podczas pracy.';
      case 'streak_30':
        return 'Miesiąc systematycznej kinezjoterapii cofa objawy przewlekłego zespołu bólowego szyi i radykalnie zmniejsza nawroty rwy ramiennej.';
      case 'posture_master':
        return 'Świadomość własnego kąta CVA chroni przed bezwiednym przyjmowaniem pozycji zgięciowej z obciążeniem 27 kg na dyski szyjne.';
      case 'breathing_master':
        return 'Prawidłowy oddech torem brzusznym wygasza aktywność układu współczulnego, obniżając poziom kortyzolu i relaksując mięśnie podpotyliczne.';
      case 'micro_break_hero':
        return 'Częste, 30-sekundowe odciążenia w ciągu dnia resetują niedokrwienie powięzi i zapobiegają wieczornym napięciowym bólom głowy.';
      default:
        return 'Systematyczne realizowanie zaleceń terapeutycznych przywraca równowagę mięśniowo-powięziową i chroni przed nawrotami dolegliwości.';
    }
  };

  const handleCardClick = (ach: Achievement) => {
    setSelectedAchievement(ach);
    if (ach.unlocked) {
      soundService.playSuccess();
    }
  };

  return (
    <div id="achievement-gallery" className={`space-y-6 ${className}`}>
      {/* Header Banner: Progress & Adherence Statistics */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-teal-800/50 shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold backdrop-blur-md">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Galeria Kamieni Milowych • Neurobiologiczna Motywacja i Ciągłość</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Galeria Osiągnięć i Medali Rehabilitacji
            </h2>
            <p className="text-xs sm:text-sm text-teal-100/80 leading-relaxed">
              Każdy odblokowany medal reprezentuje trwałą adaptację biomechaniczną karku. Szare medale czekają na Twoje zaangażowanie – zamień je w tętniące kolorami symbole zdrowia!
            </p>
          </div>

          {/* Adherence Score Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 shrink-0 flex flex-col sm:min-w-[260px]">
            <div className="flex items-center justify-between text-xs text-teal-200">
              <span className="font-semibold">Postęp ogólny</span>
              <span className="font-mono font-bold text-white text-sm">{unlockedCount} / {totalCount} ({percentUnlocked}%)</span>
            </div>

            {/* Progress Track */}
            <div className="w-full h-2.5 bg-white/20 rounded-full mt-2.5 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-teal-400 via-emerald-400 to-amber-400 rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${percentUnlocked}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-white/10 text-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-teal-300 tracking-wider block">Seria dni</span>
                <span className="text-lg font-black text-amber-400 font-mono flex items-center justify-center gap-1 mt-0.5">
                  <Flame className="w-4 h-4 fill-amber-400" />
                  {streakDays} {streakDays === 1 ? 'dzień' : 'dni'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-teal-300 tracking-wider block">Sesje łącznie</span>
                <span className="text-lg font-black text-white font-mono mt-0.5 block">
                  {totalCompletedSessions}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Filter (All, Unlocked / Vibrant, Locked / Grayscale) */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Wszystkie ({mergedMilestones.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus('unlocked')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterStatus === 'unlocked'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Zdobyte ({unlockedCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus('locked')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterStatus === 'locked'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Do zdobycia ({totalCount - unlockedCount})</span>
          </button>
        </div>

        {/* Category & Search Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Szukaj medalu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium cursor-pointer"
          >
            <option value="all">Wszystkie kategorie</option>
            <option value="streak">Ciągłość (Streak)</option>
            <option value="rehab">Rehabilitacja</option>
            <option value="breathing">Vagus i Oddech</option>
            <option value="pain_tracking">Monitorowanie Bólu</option>
            <option value="knowledge">Ergonomia i Wiedza</option>
            <option value="medication">Zalecenia Lekarskie</option>
          </select>
        </div>
      </div>

      {/* Grid of Milestones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMilestones.map((ach) => {
          const isUnlocked = !!ach.unlocked;
          const tier = getTierInfo(ach.tier);
          const progressPercent = Math.min(100, Math.round(((ach.progress || 0) / (ach.maxProgress || 1)) * 100));

          return (
            <div
              key={ach.id}
              id={`milestone-card-${ach.id}`}
              onClick={() => handleCardClick(ach)}
              className={`relative rounded-3xl p-5 border transition-all duration-300 flex flex-col justify-between cursor-pointer group ${
                isUnlocked
                  ? 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 ring-1 ring-teal-500/20'
                  : 'grayscale contrast-75 opacity-75 dark:opacity-60 bg-slate-100/70 dark:bg-slate-900/60 border-slate-300 dark:border-slate-800 hover:opacity-90 hover:contrast-100 hover:grayscale-0'
              }`}
            >
              {/* Card Top: Icon, Tier & Lock Status */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3.5">
                  {/* Icon Badge */}
                  <div
                    className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-xs ${
                      isUnlocked
                        ? 'bg-gradient-to-br from-amber-50 to-teal-50 dark:from-amber-950/40 dark:to-teal-950/40 border-amber-200 dark:border-amber-800/80 shadow-inner'
                        : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {renderIcon(ach.icon, isUnlocked)}
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${tier.badgeClass}`}>
                      {tier.label}
                    </span>

                    {isUnlocked ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Zdobyte!</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-300 dark:border-slate-700">
                        <Lock className="w-3 h-3" />
                        <span>Zablokowane</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Title & Category */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    {getCategoryLabel(ach.category)}
                  </span>
                  <h3 className={`text-base font-black leading-snug ${isUnlocked ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                    {ach.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {ach.description}
                  </p>
                </div>
              </div>

              {/* Card Bottom: Progress Bar & Unlock Requirements */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">
                    {isUnlocked ? 'Ukończono w 100%' : 'Postęp do odblokowania:'}
                  </span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                    {ach.progress || 0} / {ach.maxProgress}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isUnlocked 
                        ? 'bg-gradient-to-r from-teal-500 to-emerald-500' 
                        : 'bg-slate-400 dark:bg-slate-600'
                    }`}
                    style={{ width: `${isUnlocked ? 100 : progressPercent}%` }}
                  />
                </div>

                {/* Footer hint */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                  <span>{isUnlocked ? (ach.unlockedAt ? `Data: ${new Date(ach.unlockedAt).toLocaleDateString('pl-PL')}` : 'Odznaka aktywna') : 'Wymaga kontynuacji'}</span>
                  <span className="font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    Szczegóły <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Motivational Clinical Footer Callout */}
      <div className="p-5 rounded-3xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs text-amber-900 dark:text-amber-200">
        <div className="p-2.5 rounded-2xl bg-amber-100 dark:bg-amber-900/60 border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <span className="font-bold uppercase tracking-wider text-[11px] text-amber-800 dark:text-amber-300">
            Kliniczne Znaczenie Adherencji (Wytrwałości w Terapii):
          </span>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            Według zaleceń Europejskiego Towarzystwa Kręgosłupa (EuroSpine), 80% sukcesu w leczeniu przewlekłego bólu karku wynika z regularnego wykonywania ćwiczeń przez minimum 30 dni. Każda szara odznaka to drogowskaz – odblokowuj je krok po kroku!
          </p>
        </div>
      </div>

      {/* Milestone Details Modal */}
      {selectedAchievement && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedAchievement(null)}
        >
          <div 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${
                  selectedAchievement.unlocked
                    ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 text-amber-500'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-300 text-slate-400'
                }`}>
                  {renderIcon(selectedAchievement.icon, !!selectedAchievement.unlocked)}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    {getCategoryLabel(selectedAchievement.category)} • Poziom {getTierInfo(selectedAchievement.tier).label}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {selectedAchievement.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAchievement(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 text-xs space-y-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                Zadanie do wykonania:
              </span>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedAchievement.description}
              </p>
            </div>

            {/* Medical Rationale */}
            <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/60 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-teal-900 dark:text-teal-200">
                <Info className="w-4 h-4 text-teal-600" />
                <span>Dlaczego to kluczowe dla Twojego karku?</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {getClinicalMotivation(selectedAchievement.id)}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-slate-500 font-medium">
                Stan: {selectedAchievement.unlocked ? '✅ Odblokowano!' : `⏳ W trakcie (${selectedAchievement.progress || 0}/${selectedAchievement.maxProgress})`}
              </div>

              <button
                type="button"
                onClick={() => setSelectedAchievement(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs shadow-xs cursor-pointer"
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
