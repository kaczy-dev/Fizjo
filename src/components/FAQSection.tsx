import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldAlert,
  Activity,
  Smartphone,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Play,
  X,
  FileQuestion,
  Flame,
  Award
} from 'lucide-react';
import { FAQItem, FAQCategory, Exercise, NavTab } from '../types';
import { FAQ_ITEMS } from '../data/faqData';

interface FAQSectionProps {
  allExercises?: Exercise[];
  onSelectExercise?: (exercise: Exercise) => void;
  onNavigateTab?: (tab: NavTab) => void;
}

const POPULAR_FAQ_TAGS = [
  { label: 'Darmowa AI', tag: 'darmowa ai' },
  { label: 'Chin Tuck', tag: 'chin tuck' },
  { label: 'Zasada 24h', tag: 'zasada 24h' },
  { label: 'Czerwone flagi', tag: 'czerwone flagi' },
  { label: 'Tryb Offline', tag: 'offline' },
  { label: 'Zegarki i BLE', tag: 'zegarek' },
  { label: 'Krążenia głową', tag: 'krążenia głową' },
  { label: 'Raport PDF', tag: 'raport pdf' }
];

export const FAQSection: React.FC<FAQSectionProps> = ({
  allExercises = [],
  onSelectExercise,
  onNavigateTab
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(FAQ_ITEMS[0]?.id || null);
  const [feedbackState, setFeedbackState] = useState<Record<string, 'helpful' | 'not_helpful'>>({});

  const categories: { id: FAQCategory | 'all'; label: string; icon: React.ReactNode; count: number }[] = [
    {
      id: 'all',
      label: 'Wszystkie pytania',
      icon: <HelpCircle className="w-4 h-4" />,
      count: FAQ_ITEMS.length
    },
    {
      id: 'app_functionality',
      label: 'Funkcjonowanie aplikacji',
      icon: <Smartphone className="w-4 h-4" />,
      count: FAQ_ITEMS.filter((item) => item.category === 'app_functionality').length
    },
    {
      id: 'exercise_technique',
      label: 'Technika ćwiczeń',
      icon: <Activity className="w-4 h-4" />,
      count: FAQ_ITEMS.filter((item) => item.category === 'exercise_technique').length
    },
    {
      id: 'pain_management',
      label: 'Zarządzanie bólem & Bezpieczeństwo',
      icon: <ShieldAlert className="w-4 h-4" />,
      count: FAQ_ITEMS.filter((item) => item.category === 'pain_management').length
    }
  ];

  const filteredFaqs = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const inQuestion = item.question.toLowerCase().includes(q);
      const inAnswer = item.answer.toLowerCase().includes(q);
      const inCategory = item.categoryLabel.toLowerCase().includes(q);
      const inTags = item.tags.some((t) => t.toLowerCase().includes(q));
      const inPoints = item.detailedPoints?.some((p) => p.toLowerCase().includes(q));

      return inQuestion || inAnswer || inCategory || inTags || inPoints;
    });
  }, [selectedCategory, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleFeedback = (id: string, type: 'helpful' | 'not_helpful') => {
    setFeedbackState((prev) => ({
      ...prev,
      [id]: type
    }));
  };

  const getCategoryBadge = (category: FAQCategory) => {
    switch (category) {
      case 'app_functionality':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <Smartphone className="w-3 h-3" />
            Aplikacja & AI
          </span>
        );
      case 'exercise_technique':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            <Activity className="w-3 h-3" />
            Technika Ćwiczeń
          </span>
        );
      case 'pain_management':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <ShieldAlert className="w-3 h-3" />
            Ból & Bezpieczeństwo
          </span>
        );
    }
  };

  return (
    <div id="faq-section" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-teal-900/40">
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Centrum Pomocy & Konsultacje Kliniczne</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Często Zadawane Pytania (FAQ)
          </h2>

          <p className="text-teal-100/90 text-sm sm:text-base mt-2 leading-relaxed">
            Odpowiedzi na najczęstsze pytania pacjentów dotyczące funkcjonowania aplikacji,
            bezpiecznych technik kinezjoterapii oraz zasad radzenia sobie z bólem karku i kręgosłupa.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-teal-200/80">
            <span className="inline-flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-teal-400" />
              {FAQ_ITEMS.length} zweryfikowanych odpowiedzi
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-teal-400" />
              Standardy EULAR & APTA
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              100% Darmowa AI bez opłat
            </span>
          </div>
        </div>
      </div>

      {/* Search and Category Filter Bar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="faq-search-input"
              type="text"
              placeholder="Szukaj pytań (np. retrakcja, ból po ćwiczeniach, darmowa AI, offline)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500 shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Wyczyść wyszukiwanie"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    selectedCategory === cat.id
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Keyword Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-500 font-medium">Popularne tematy:</span>
            {POPULAR_FAQ_TAGS.map((kw) => (
              <button
                key={kw.tag}
                type="button"
                onClick={() => setSearchQuery(kw.tag)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  searchQuery.toLowerCase() === kw.tag
                    ? 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200 font-bold'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700'
                }`}
              >
                #{kw.label}
              </button>
            ))}
          </div>

          {searchQuery && (
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <span>
                Wyniki dla &bdquo;<strong className="text-teal-600 dark:text-teal-400">{searchQuery}</strong>&rdquo;: {filteredFaqs.length}
              </span>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-teal-600 dark:text-teal-400 hover:underline font-bold text-[11px]"
              >
                Wyczyść filtr
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Accordion List or Empty State */}
      {filteredFaqs.length === 0 ? (
        <div className="p-10 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3 bg-white/50 dark:bg-slate-900/50">
          <FileQuestion className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Nie znaleźliśmy odpowiedzi na frazę &bdquo;{searchQuery}&rdquo;
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Spróbuj zapytać w inny sposób lub przełącz kategorię. Możesz także skonsultować się bezpośrednio z darmowym Asystentem Biomechanicznym w zakładce &bdquo;Ekspert AI&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-500"
          >
            Pokaż wszystkie pytania
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFaqs.map((item) => {
            const isExpanded = expandedId === item.id;
            const feedback = feedbackState[item.id];

            return (
              <div
                key={item.id}
                id={`faq-item-${item.id}`}
                className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all overflow-hidden ${
                  isExpanded
                    ? 'border-teal-400/60 dark:border-teal-600 shadow-md ring-1 ring-teal-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
                }`}
              >
                {/* Accordion Header */}
                <button
                  type="button"
                  onClick={() => toggleExpand(item.id)}
                  className="w-full p-4 sm:p-5 flex items-start justify-between gap-4 text-left transition-colors cursor-pointer"
                  aria-expanded={isExpanded}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {getCategoryBadge(item.category)}
                      <span className="text-[11px] text-slate-400 font-medium">
                        ID: #{item.id.replace('faq-', '')}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {item.question}
                    </h3>
                  </div>

                  <div
                    className={`p-1.5 rounded-full shrink-0 transition-colors ${
                      isExpanded
                        ? 'bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </button>

                {/* Accordion Content */}
                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 space-y-4 border-t border-slate-100 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed animate-in fade-in-50 duration-200">
                    {/* Main Answer paragraph */}
                    <p className="font-normal text-slate-800 dark:text-slate-200 leading-relaxed pt-2">
                      {item.answer}
                    </p>

                    {/* Detailed Points */}
                    {item.detailedPoints && item.detailedPoints.length > 0 && (
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3.5 space-y-2 border border-slate-200/70 dark:border-slate-800">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Szczegółowe wyjaśnienie biomechaniczne:
                        </span>
                        <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                          {item.detailedPoints.map((point, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-teal-600 dark:text-teal-400 font-bold shrink-0">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Clinical Tips Callout */}
                    {item.clinicalTips && item.clinicalTips.length > 0 && (
                      <div className="bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-900/60 rounded-xl p-3.5 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800 dark:text-teal-300">
                          <Sparkles className="w-3.5 h-3.5 text-teal-500" />
                          <span>Wskazówka fizjoterapeuty klinicznego:</span>
                        </div>
                        {item.clinicalTips.map((tip, idx) => (
                          <p key={idx} className="text-xs text-teal-900 dark:text-teal-200 leading-relaxed">
                            {tip}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Related Exercises Links */}
                    {item.relatedExerciseIds && item.relatedExerciseIds.length > 0 && allExercises.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Ćwiczenia powiązane z tym pytaniem:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {item.relatedExerciseIds.map((exId) => {
                            const matched = allExercises.find((e) => e.id === exId);
                            if (!matched) return null;

                            return (
                              <button
                                key={exId}
                                type="button"
                                onClick={() => onSelectExercise && onSelectExercise(matched)}
                                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-500 text-left transition-all group"
                              >
                                <div>
                                  <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400">
                                    {matched.polishName}
                                  </p>
                                  <span className="text-[10px] text-slate-400">
                                    {matched.difficulty} • {matched.tempo}
                                  </span>
                                </div>
                                <Play className="w-3.5 h-3.5 text-teal-600 fill-current opacity-70 group-hover:opacity-100" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Actions and Feedback footer */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                      {/* Related Action button */}
                      {item.relatedAction && onNavigateTab ? (
                        <button
                          type="button"
                          onClick={() => onNavigateTab(item.relatedAction!.tabTarget as NavTab)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-2xs"
                        >
                          <span>{item.relatedAction.label}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <div />
                      )}

                      {/* Feedback Rating */}
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>Czy ta odpowiedź była pomocna?</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleFeedback(item.id, 'helpful')}
                            className={`p-1.5 rounded-lg transition-all ${
                              feedback === 'helpful'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600'
                            }`}
                            title="Tak, odpowiedź była pomocna"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFeedback(item.id, 'not_helpful')}
                            className={`p-1.5 rounded-lg transition-all ${
                              feedback === 'not_helpful'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600'
                            }`}
                            title="Nie, szukam innych informacji"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {feedback && (
                          <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold animate-in fade-in">
                            Dziękujemy za opinię!
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
