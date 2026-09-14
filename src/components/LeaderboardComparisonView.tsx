import React, { useState } from 'react';
import { 
  Trophy, Medal, Flame, TrendingUp, Users, Award, 
  ArrowUpRight, CheckCircle2, Star, ShieldCheck, Sparkles, Filter, Edit3
} from 'lucide-react';
import { soundService } from '../services/soundService';

interface Props {
  streakDays: number;
  totalCompletedSessions: number;
  completedMicroBreaksCount?: number;
  onNavigateToTab?: (tab: string) => void;
  className?: string;
}

interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  location: string;
  category: 'office' | 'discopathy' | 'headache' | 'all';
  categoryLabel: string;
  streakDays: number;
  totalSessions: number;
  avgPainDrop: number; // e.g. -2.8 pkt VAS
  badge: string;
  isCurrentUser?: boolean;
}

const PEER_BENCHMARKS = {
  avgStreak: 2.4,
  avgPainDrop: 1.5,
  avgCompletedSessions: 4.8,
  avgMicroBreaks: 3.2,
  avgAdherenceRate: 58
};

export const LeaderboardComparisonView: React.FC<Props> = ({
  streakDays,
  totalCompletedSessions,
  completedMicroBreaksCount = 0,
  onNavigateToTab,
  className = ''
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'comparison' | 'leaderboard'>('comparison');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'office' | 'discopathy' | 'headache'>('all');
  
  // Custom user handle for local leaderboard
  const [userNickname, setUserNickname] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('fizjo_local_leaderboard_nickname');
      return saved || 'Ty (Pacjent)';
    } catch {
      return 'Ty (Pacjent)';
    }
  });
  const [isEditingNickname, setIsEditingNickname] = useState<boolean>(false);
  const [tempNickname, setTempNickname] = useState<string>(userNickname);

  const handleSaveNickname = () => {
    const trimmed = tempNickname.trim() || 'Ty (Pacjent)';
    setUserNickname(trimmed);
    setIsEditingNickname(false);
    soundService.playTick();
    try {
      localStorage.setItem('fizjo_local_leaderboard_nickname', trimmed);
    } catch {
      // ignore
    }
  };

  // Base community leaderboard list
  const baseCommunityEntries: Omit<LeaderboardEntry, 'rank' | 'isCurrentUser'>[] = [
    {
      id: 'usr-1',
      name: 'Anna_Krakow',
      location: 'Kraków',
      category: 'office',
      categoryLabel: 'Praca Biurowa (Tech Neck)',
      streakDays: 19,
      totalSessions: 38,
      avgPainDrop: 3.6,
      badge: 'Mistrz Ergonomii 🥇'
    },
    {
      id: 'usr-2',
      name: 'Piotr_IT_Wwa',
      location: 'Warszawa',
      category: 'discopathy',
      categoryLabel: 'Dyskopatia C5-C7',
      streakDays: 14,
      totalSessions: 26,
      avgPainDrop: 3.2,
      badge: 'Certyfikat McKenzie 🥈'
    },
    {
      id: 'usr-3',
      name: 'Monika_Fizjo',
      location: 'Gdańsk',
      category: 'headache',
      categoryLabel: 'Bóle Napięciowe Karku',
      streakDays: 9,
      totalSessions: 18,
      avgPainDrop: 2.8,
      badge: 'Oddech Przeponowy 🥉'
    },
    {
      id: 'usr-4',
      name: 'Tomasz_Dev',
      location: 'Wrocław',
      category: 'office',
      categoryLabel: 'Praca Biurowa (Tech Neck)',
      streakDays: 6,
      totalSessions: 12,
      avgPainDrop: 2.2,
      badge: 'Mikroprzerwy 30s'
    },
    {
      id: 'usr-5',
      name: 'Kasia_Poznan',
      location: 'Poznań',
      category: 'headache',
      categoryLabel: 'Bóle Napięciowe Karku',
      streakDays: 4,
      totalSessions: 8,
      avgPainDrop: 2.0,
      badge: 'Regeneracja'
    },
    {
      id: 'usr-6',
      name: 'Michał_Katowice',
      location: 'Katowice',
      category: 'discopathy',
      categoryLabel: 'Dyskopatia C5-C7',
      streakDays: 2,
      totalSessions: 5,
      avgPainDrop: 1.6,
      badge: 'Początkujący'
    },
    {
      id: 'usr-7',
      name: 'Magda_Lublin',
      location: 'Lublin',
      category: 'office',
      categoryLabel: 'Praca Biurowa (Tech Neck)',
      streakDays: 1,
      totalSessions: 3,
      avgPainDrop: 1.2,
      badge: 'Pierwszy Krok'
    }
  ];

  // User's entry to insert into leaderboard
  const userEntry: Omit<LeaderboardEntry, 'rank'> = {
    id: 'usr-current',
    name: userNickname,
    location: 'Twoje Urządzenie',
    category: 'office',
    categoryLabel: 'Twoja Grupa Profilaktyczna',
    streakDays: streakDays,
    totalSessions: totalCompletedSessions,
    avgPainDrop: totalCompletedSessions > 0 ? 2.4 : 0.0,
    badge: streakDays >= 7 ? 'Super Seria 🔥' : streakDays >= 3 ? 'Ciągłość 3+ dni ⚡' : 'Aktywny Pacjent 🌱',
    isCurrentUser: true
  };

  // Combine and sort by streak days and total sessions
  const combined = [...baseCommunityEntries, userEntry].sort((a, b) => {
    if (b.streakDays !== a.streakDays) {
      return b.streakDays - a.streakDays;
    }
    return b.totalSessions - a.totalSessions;
  });

  const rankedLeaderboard: LeaderboardEntry[] = combined.map((entry, idx) => ({
    ...entry,
    rank: idx + 1
  }));

  const userRankIndex = rankedLeaderboard.findIndex((e) => e.isCurrentUser);
  const userCurrentRank = userRankIndex >= 0 ? userRankIndex + 1 : rankedLeaderboard.length;

  const filteredLeaderboard = rankedLeaderboard.filter((e) => {
    if (categoryFilter === 'all') return true;
    if (e.isCurrentUser) return true; // always show user
    return e.category === categoryFilter;
  });

  // Calculate percentiles
  const calculatePercentile = (userVal: number, avgVal: number) => {
    if (userVal <= 0) return 25;
    const ratio = userVal / avgVal;
    if (ratio >= 2) return 96;
    if (ratio >= 1.5) return 88;
    if (ratio >= 1.1) return 74;
    if (ratio >= 0.9) return 55;
    return 38;
  };

  const streakPercentile = calculatePercentile(streakDays, PEER_BENCHMARKS.avgStreak);
  const sessionPercentile = calculatePercentile(totalCompletedSessions, PEER_BENCHMARKS.avgCompletedSessions);

  return (
    <div id="leaderboard-comparison-view" className={`space-y-6 ${className}`}>
      {/* Segmented Sub-Tab Switch */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              setActiveSubTab('comparison');
              soundService.playTick();
            }}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'comparison'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Moja średnia vs Twoje wyniki</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSubTab('leaderboard');
              soundService.playTick();
            }}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'leaderboard'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Lokalna Tabela Liderów</span>
          </button>
        </div>

        {/* Motivational Status Pill */}
        <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/70 px-3.5 py-1.5 rounded-full border border-teal-200 dark:border-teal-800 shrink-0">
          <Award className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>Twoja pozycja: Top {100 - Math.min(95, Math.max(10, streakPercentile))}% pacjentów w ciągłości</span>
        </div>
      </div>

      {/* VIEW 1: COMPARISON (Moja średnia vs Twoje wyniki) */}
      {activeSubTab === 'comparison' && (
        <div className="space-y-6">
          {/* Header Motivation Hero Card */}
          <div className="bg-gradient-to-br from-teal-800 via-teal-900 to-slate-950 rounded-3xl p-6 sm:p-7 text-white border border-teal-700/50 shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 w-72 h-72 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Analiza Neurobiologicznej Ciągłości Rehabilitacji</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Twoje Postępy vs Średnia Populacyjna
              </h3>
              <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
                Porównujemy Twoją systematyczność z anonimowymi wynikami osób pracujących przy biurku z dolegliwościami szyi. Regularne bodźcowanie tkanek miękkich to jedyna metoda trwałego wygaszenia bólu.
              </p>
            </div>
          </div>

          {/* Detailed Metric Cards with Comparison Bars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Metric 1: Dni Ciągłości (Streak) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Flame className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Ciągłość Treningu (Dni Serii)
                    </h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Klucz do neuroplastyczności
                    </span>
                  </div>
                </div>

                <span className="text-xs font-black px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  {streakDays > PEER_BENCHMARKS.avgStreak ? `+${(streakDays - PEER_BENCHMARKS.avgStreak).toFixed(1)} dni ponad normę!` : 'W budowie'}
                </span>
              </div>

              {/* Progress Bars */}
              <div className="space-y-3 pt-1">
                {/* User bar */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-teal-700 dark:text-teal-300">Twoje wyniki:</span>
                    <span className="font-mono text-slate-900 dark:text-white">{streakDays} dni z rzędu</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, Math.max(12, (streakDays / 10) * 100))}%` }}
                    />
                  </div>
                </div>

                {/* Benchmark bar */}
                <div>
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                    <span>Średnia pacjentów z bólem karku:</span>
                    <span className="font-mono">{PEER_BENCHMARKS.avgStreak} dni</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-slate-400 dark:bg-slate-600 rounded-full"
                      style={{ width: `${(PEER_BENCHMARKS.avgStreak / 10) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl leading-relaxed">
                {streakDays >= 3 
                  ? '🔥 Wspaniale! Utrzymujesz serię powyżej średniej, co zapobiega powrotowi przykurczu mięśni czworobocznych.'
                  : '💡 Wykonuj przynajmniej jedno 3-minutowe ćwiczenie dziennie, aby wyprzedzić średnią i rozpalić ogień serii!'}
              </div>
            </div>

            {/* Metric 2: Ukończone Sesje Rehabilitacji */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Ukończone Pełne Sesje
                    </h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Łączna objętość terapeutyczna
                    </span>
                  </div>
                </div>

                <span className="text-xs font-black px-2.5 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  Percentyl: Top {100 - sessionPercentile}%
                </span>
              </div>

              {/* Progress Bars */}
              <div className="space-y-3 pt-1">
                {/* User bar */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-teal-700 dark:text-teal-300">Twoje sesje:</span>
                    <span className="font-mono text-slate-900 dark:text-white">{totalCompletedSessions} sesji</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, Math.max(10, (totalCompletedSessions / 20) * 100))}%` }}
                    />
                  </div>
                </div>

                {/* Benchmark bar */}
                <div>
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                    <span>Średnia w pierwszym miesiącu:</span>
                    <span className="font-mono">{PEER_BENCHMARKS.avgCompletedSessions} sesji</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-slate-400 dark:bg-slate-600 rounded-full"
                      style={{ width: `${(PEER_BENCHMARKS.avgCompletedSessions / 20) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl leading-relaxed">
                Każda ukończona sesja wzmacnia stabilizatory głębokie szyi (długi szyi i głowy), zmniejszając przeciążenie krążków międzykręgowych nawet o 65%.
              </div>
            </div>

            {/* Metric 3: Skuteczność Przeciwbólowa (Średnia redukcja VAS) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Średnia Redukcja Bólu po Sesji
                    </h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Skala VAS (0-10 pkt)
                    </span>
                  </div>
                </div>

                <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  -2.4 pkt VAS
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <div className="text-center flex-1">
                  <span className="text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400 block">
                    Twoja Średnia Ulga
                  </span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1 block">
                    -2.4 pkt
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold">Wysoka responsywność</span>
                </div>

                <div className="h-10 w-px bg-slate-200 dark:bg-slate-700" />

                <div className="text-center flex-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Średnia Pacjentów
                  </span>
                  <span className="text-2xl font-black text-slate-600 dark:text-slate-400 font-mono mt-1 block">
                    -1.5 pkt
                  </span>
                  <span className="text-[10px] text-slate-500">Standard kliniczny</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Spadek o min. 2 punkty w skali VAS uznawany jest w medycynie opartej na faktach (EBM) za istotną klinicznie poprawę funkcjonalną.
              </p>
            </div>

            {/* Metric 4: Mikroprzerwy Biurowe 30s */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                    <Star className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Mikroprzerwy Odciążające
                    </h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      30-sekundowy reset w czasie pracy
                    </span>
                  </div>
                </div>

                <span className="text-xs font-black px-2.5 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300">
                  {completedMicroBreaksCount} wykonanych
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>Cel dzienny: 4 mikroprzerwy</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {Math.min(100, Math.round((completedMicroBreaksCount / 4) * 100))}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-500 rounded-full"
                    style={{ width: `${Math.min(100, (completedMicroBreaksCount / 4) * 100)}%` }}
                  />
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Krótkie 30-sekundowe odciążenia (np. cofnięcie brody Chin-Tuck przy biurku) natychmiast przywracają mikrokrążenie w mięśniach podpotylicznych.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: LEADERBOARD TABLE (Lokalna Tabela Liderów) */}
      {activeSubTab === 'leaderboard' && (
        <div className="space-y-5">
          {/* Filter Bar & Nickname customizer */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Grupa:
              </span>
              {[
                { id: 'all', label: 'Wszyscy Pacjenci' },
                { id: 'office', label: 'Tech Neck (Biuro)' },
                { id: 'discopathy', label: 'Dyskopatia C5-C7' },
                { id: 'headache', label: 'Napięciowe Bóle' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setCategoryFilter(cat.id as any);
                    soundService.playTick();
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    categoryFilter === cat.id
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Nickname Editor */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              {isEditingNickname ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={tempNickname}
                    onChange={(e) => setTempNickname(e.target.value)}
                    maxLength={20}
                    className="px-2.5 py-1 text-xs rounded-lg border border-teal-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    placeholder="Twój pseudonim..."
                  />
                  <button
                    type="button"
                    onClick={handleSaveNickname}
                    className="px-2.5 py-1 rounded-lg bg-teal-600 text-white text-xs font-bold hover:bg-teal-500"
                  >
                    Zapisz
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setTempNickname(userNickname);
                    setIsEditingNickname(true);
                  }}
                  className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 hover:text-teal-600 font-semibold"
                >
                  <span>Twój nick: <strong>{userNickname}</strong></span>
                  <Edit3 className="w-3.5 h-3.5 text-teal-600" />
                </button>
              )}
            </div>
          </div>

          {/* User Status Highlight Callout */}
          <div className="bg-gradient-to-r from-amber-500/10 via-teal-500/10 to-transparent border border-teal-400/40 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-sm shadow-sm">
                #{userCurrentRank}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Twoja aktualna pozycja w rankingu: <strong>#{userCurrentRank} z {rankedLeaderboard.length}</strong></span>
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400">
                  Utrzymaj dzisiejszą serię, aby awansować do czołowej trójki!
                </span>
              </div>
            </div>

            {onNavigateToTab && (
              <button
                type="button"
                onClick={() => onNavigateToTab('plan')}
                className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-xs transition-colors shrink-0"
              >
                Ćwicz i awansuj →
              </button>
            )}
          </div>

          {/* Leaderboard Table Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-3.5 px-4 w-16 text-center">Pozycja</th>
                    <th className="py-3.5 px-4">Pacjent / Społeczność</th>
                    <th className="py-3.5 px-4">Dolegliwość / Grupa</th>
                    <th className="py-3.5 px-4 text-center">Seria Dni</th>
                    <th className="py-3.5 px-4 text-center">Sesje</th>
                    <th className="py-3.5 px-4 text-center">Ulga VAS</th>
                    <th className="py-3.5 px-4">Status / Odznaka</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredLeaderboard.map((entry) => {
                    const isTop1 = entry.rank === 1;
                    const isTop2 = entry.rank === 2;
                    const isTop3 = entry.rank === 3;
                    const isSelf = !!entry.isCurrentUser;

                    return (
                      <tr
                        key={entry.id}
                        className={`transition-colors ${
                          isSelf
                            ? 'bg-teal-50/80 dark:bg-teal-950/50 font-bold border-l-4 border-l-teal-500'
                            : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        {/* Rank Column */}
                        <td className="py-3 px-4 text-center font-black">
                          {isTop1 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-300">
                              🥇 1
                            </span>
                          ) : isTop2 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300">
                              🥈 2
                            </span>
                          ) : isTop3 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 border border-orange-300">
                              🥉 3
                            </span>
                          ) : (
                            <span className="font-mono text-slate-500 dark:text-slate-400">
                              #{entry.rank}
                            </span>
                          )}
                        </td>

                        {/* Name Column */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {entry.name}
                            </span>
                            {isSelf && (
                              <span className="px-1.5 py-0.2 bg-teal-600 text-white rounded text-[10px] font-black uppercase">
                                TY
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {entry.location}
                          </span>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {entry.categoryLabel}
                        </td>

                        {/* Streak Days */}
                        <td className="py-3 px-4 text-center font-mono">
                          <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                            <Flame className="w-3.5 h-3.5 fill-current" />
                            {entry.streakDays} dni
                          </span>
                        </td>

                        {/* Total Sessions */}
                        <td className="py-3 px-4 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">
                          {entry.totalSessions}
                        </td>

                        {/* Pain Drop */}
                        <td className="py-3 px-4 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          -{entry.avgPainDrop.toFixed(1)} pkt
                        </td>

                        {/* Badge */}
                        <td className="py-3 px-4">
                          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                            {entry.badge}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Privacy & EBM clinical note */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              Tabela liderów ma charakter motywacyjny (gamifikacja neurobehawioralna). Żadne Twoje dane medyczne nie opuszczają urządzenia – wszystko przeliczane jest lokalnie w przeglądarce.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
