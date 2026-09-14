import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  CheckCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Monitor,
  Sparkles,
  Moon,
  ShieldAlert,
  ArrowRight,
  X,
  Play,
  Mic,
  HelpCircle,
  Activity,
  AlertCircle,
  Zap,
  Layers,
  WifiOff
} from 'lucide-react';
import { KnowledgeArticle, Exercise, NavTab } from '../types';
import { KNOWLEDGE_ARTICLES } from '../data/knowledgeBase';
import { FAQ_ITEMS } from '../data/faqData';
import { AIExpertSection } from './AIExpertSection';
import { FAQSection } from './FAQSection';
import { calculateArticleReadingTime } from '../utils/readingTime';
import { cacheArticleOnOpen, getCachedArticleIds } from '../services/articleCache';

interface Props {
  readArticleIds?: string[];
  onMarkAsRead: (articleId: string) => void;
  allExercises: Exercise[];
  onSelectExercise: (exercise: Exercise) => void;
  onQuestionAsked?: () => void;
  onNavigateTab?: (tab: NavTab) => void;
}

export const KnowledgeBaseSection: React.FC<Props> = ({
  readArticleIds = [],
  onMarkAsRead,
  allExercises,
  onSelectExercise,
  onQuestionAsked,
  onNavigateTab
}) => {
  const [activeTab, setActiveTab] = useState<'articles' | 'faq' | 'ai_expert'>('articles');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeArticle, setActiveArticle] = useState<KnowledgeArticle | null>(null);
  const [cachedArticleIds, setCachedArticleIds] = useState<string[]>(() => getCachedArticleIds());

  // Handle article opening and caching for offline reading
  const handleOpenArticle = (art: KnowledgeArticle) => {
    setActiveArticle(art);
    // Cache article content on first open for offline access
    const isNew = cacheArticleOnOpen(art);
    if (isNew) {
      setCachedArticleIds((prev) => (prev.includes(art.id) ? prev : [...prev, art.id]));
    }
  };

  const categories = [
    { id: 'all', label: 'Wszystkie Artykuły' },
    { id: 'anatomia_zdrowie', label: 'Zdrowie i Biomechanika (C1-C7)' },
    { id: 'schorzenia', label: 'Schorzenia & Dolegliwości' },
    { id: 'korzysci_cwiczen', label: 'Korzyści Konkretnych Ćwiczeń' },
    { id: 'ergonomia', label: 'Ergonomia Biurka' },
    { id: 'higiena_pracy', label: 'Higiena Pracy & Mikropauzy' },
    { id: 'tech_neck', label: 'Syndrom Tech-Neck' },
    { id: 'autoterapia', label: 'Punkty Spustowe' },
    { id: 'sen', label: 'Zdrowy Sen & Poduszka' },
    { id: 'bezpieczenstwo', label: 'Czerwone Flagi (Bezpieczeństwo)' }
  ];

  const POPULAR_KEYWORDS = [
    { label: 'chin tuck', tag: 'chin tuck' },
    { label: 'brügger', tag: 'brügger' },
    { label: 'dyskopatia', tag: 'dyskopatia' },
    { label: 'lordoza', tag: 'lordoza' },
    { label: 'podpotyliczne', tag: 'podpotyliczne' },
    { label: 'nerw pośrodkowy', tag: 'nerw pośrodkowy' },
    { label: 'stres', tag: 'stres' },
    { label: 'krzesło', tag: 'krzesło' },
    { label: 'monitor', tag: 'monitor' },
    { label: 'poduszka', tag: 'poduszka' }
  ];

  const filteredArticles = KNOWLEDGE_ARTICLES.filter((art) => {
    const matchesCategory = selectedCategory === 'all' || art.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchesCategory;

    const inTitle = art.title.toLowerCase().includes(q);
    const inSubtitle = art.subtitle.toLowerCase().includes(q);
    const inSummary = art.summary.toLowerCase().includes(q);
    const inContent = art.content.some((c) => c.toLowerCase().includes(q));
    const inTakeaways = art.keyTakeaways.some((t) => t.toLowerCase().includes(q));
    const inTips = art.practicalTips ? art.practicalTips.some((p) => p.toLowerCase().includes(q)) : false;

    const matchesSearch = inTitle || inSubtitle || inSummary || inContent || inTakeaways || inTips;
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'anatomia_zdrowie':
        return <Activity className="w-4 h-4 text-teal-600 dark:text-teal-400" />;
      case 'schorzenia':
        return <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case 'korzysci_cwiczen':
        return <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400" />;
      case 'ergonomia':
        return <Monitor className="w-4 h-4 text-teal-600 dark:text-teal-400" />;
      case 'higiena_pracy':
        return <Clock className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
      case 'tech_neck':
        return <Smartphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'autoterapia':
        return <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'sen':
        return <Moon className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'bezpieczenstwo':
        return <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      default:
        return <BookOpen className="w-4 h-4 text-teal-600 dark:text-teal-400" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'anatomia_zdrowie':
        return 'Biomechanika C1-C7';
      case 'schorzenia':
        return 'Schorzenia';
      case 'korzysci_cwiczen':
        return 'Kinezjoterapia';
      case 'ergonomia':
        return 'Ergonomia';
      case 'higiena_pracy':
        return 'Higiena Pracy';
      case 'tech_neck':
        return 'Tech-Neck';
      case 'autoterapia':
        return 'Punkty Spustowe';
      case 'sen':
        return 'Zdrowy Sen';
      case 'bezpieczenstwo':
        return 'Bezpieczeństwo';
      default:
        return 'Wiedza';
    }
  };

  return (
    <div id="knowledge-base-section" className="space-y-6">
      {/* Top Module Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('articles')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'articles'
              ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Artykuły i Wiedza ({KNOWLEDGE_ARTICLES.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('faq')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'faq'
              ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-indigo-500" />
          <span>Często Zadawane Pytania (FAQ)</span>
          <span className="px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-extrabold">
            {FAQ_ITEMS.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ai_expert')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'ai_expert'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/40'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Ekspert AI (Biomechanika)</span>
          <span className="px-1.5 py-0.5 rounded-full bg-teal-500/30 text-[10px] uppercase font-black tracking-wider">
            Darmowy
          </span>
        </button>
      </div>

      {activeTab === 'ai_expert' && (
        <AIExpertSection
          allExercises={allExercises}
          onSelectExercise={onSelectExercise}
          onQuestionAsked={onQuestionAsked}
        />
      )}

      {activeTab === 'faq' && (
        <FAQSection
          allExercises={allExercises}
          onSelectExercise={onSelectExercise}
          onNavigateTab={onNavigateTab}
        />
      )}

      {activeTab === 'articles' && (
        <>
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Standardy Kliniczne Fizjoterapii & Ergonomii Gov.pl</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Baza Wiedzy: Zdrowy Kark i Higiena Pracy
              </h2>
              <p className="text-teal-100 text-sm sm:text-base mt-2 leading-relaxed">
                Krótkie, oparte na dowodach medycznych artykuły przygotowane przez fizjoterapeutów klinicznych. 
                Poznaj biomechanikę kręgosłupa szyjnego, zoptymalizuj stanowisko komputerowe i wyeliminuj nawyki powodujące ból.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-teal-200">
                <span>📚 {KNOWLEDGE_ARTICLES.length} artykułów klinicznych</span>
                <span>•</span>
                <span>
                  ✅ Przeczytano: {readArticleIds.length} z {KNOWLEDGE_ARTICLES.length}
                </span>
                <span>•</span>
                <span
                  id="knowledge-cache-status-badge"
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-teal-950/60 border border-teal-500/30 text-teal-300 font-medium"
                  title="Treść artykułów jest automatycznie zapisywana przy pierwszym otwarciu i dostępna w trybie offline"
                >
                  <WifiOff className="w-3 h-3 text-teal-300" />
                  <span>Dostępne offline: {cachedArticleIds.length}/{KNOWLEDGE_ARTICLES.length}</span>
                </span>
              </div>
            </div>
          </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Enhanced Search Input */}
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="knowledge-search-input"
              type="text"
              placeholder="Szukaj porad ergonomicznych (np. krzesło, monitor, wzrok)..."
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

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Keyword Suggestion Tags & Result Count */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-500 font-medium">Słowa kluczowe:</span>
            {POPULAR_KEYWORDS.map((kw) => (
              <button
                key={kw.tag}
                type="button"
                onClick={() => setSearchQuery(kw.tag)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  searchQuery.toLowerCase() === kw.tag
                    ? 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200 font-bold'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80'
                }`}
              >
                #{kw.label}
              </button>
            ))}
          </div>

          {searchQuery && (
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <span>
                Wyniki dla &bdquo;<strong className="text-teal-600 dark:text-teal-400">{searchQuery}</strong>&rdquo;: {filteredArticles.length}
              </span>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-teal-600 hover:underline font-bold text-[11px]"
              >
                Wyczyść
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Article Grid or Empty State */}
      {filteredArticles.length === 0 ? (
        <div className="p-10 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3 bg-white/50 dark:bg-slate-900/50">
          <Search className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Brak artykułów dla frazy &bdquo;{searchQuery}&rdquo;
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Spróbuj wyszukać ogólniejsze pojęcia, np. <em>krzesło</em>, <em>monitor</em>, <em>wzrok</em>, <em>poduszka</em> lub zresetuj filtr kategorii.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-500"
          >
            Pokaż wszystkie artykuły
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredArticles.map((art) => {
          const isRead = readArticleIds.includes(art.id);
          const isCached = cachedArticleIds.includes(art.id);
          const readingTime = calculateArticleReadingTime(art);
          return (
            <div
              key={art.id}
              id={`article-card-${art.id}`}
              className={`group bg-white dark:bg-slate-900 rounded-2xl border p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                isRead
                  ? 'border-emerald-200/80 dark:border-emerald-950 bg-emerald-50/10'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {getCategoryIcon(art.category)}
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                      {getCategoryLabel(art.category)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Estimated reading time indicator based on word count */}
                    <span
                      id={`article-reading-time-${art.id}`}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800 dark:text-teal-200 bg-teal-50 dark:bg-teal-950/70 border border-teal-200/80 dark:border-teal-800/80 px-2 py-0.5 rounded-md shadow-2xs"
                      title={`Szacowany czas czytania: ${readingTime.minutes} min na podstawie ${readingTime.wordCount} słów (treść: ${readingTime.contentWordCount} słów, ~200 słów/min)`}
                    >
                      <Clock className="w-3 h-3 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span>{readingTime.displayText}</span>
                    </span>

                    {/* Offline cached indicator */}
                    {isCached && (
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700"
                        title="Artykuł zachowany w pamięci podręcznej (dostępny offline)"
                      >
                        <WifiOff className="w-2.5 h-2.5 text-teal-600 dark:text-teal-400" />
                        <span className="hidden sm:inline">Offline</span>
                      </span>
                    )}

                    {isRead ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Przeczytany
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-400">Nowy</span>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors leading-snug">
                  {art.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  {art.subtitle}
                </p>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 line-clamp-3 leading-relaxed">
                  {art.summary}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold">
                  {art.relatedExerciseIds.length} powiązane ćwiczenia
                </span>

                <button
                  type="button"
                  onClick={() => handleOpenArticle(art)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 text-teal-700 dark:text-teal-300 text-xs font-bold transition-colors"
                >
                  <span>Czytaj</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Article Reader Modal */}
      {activeArticle && (() => {
        const activeReadingTime = calculateArticleReadingTime(activeArticle);
        return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div
            id="article-reader-modal"
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/80">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300">
                  {getCategoryIcon(activeArticle.category)}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                    <span>{getCategoryLabel(activeArticle.category)}</span>
                    <span>•</span>
                    <span
                      id="modal-article-reading-time"
                      className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 normal-case"
                      title={`Szacowany czas na podstawie ${activeReadingTime.wordCount} słów (~200 słów/min)`}
                    >
                      <Clock className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                      {activeReadingTime.displayText} ({activeReadingTime.wordCount} słów)
                    </span>
                    <span>•</span>
                    <span
                      id="modal-article-cached-status"
                      className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded-md border border-emerald-200/80 dark:border-emerald-800/80 normal-case"
                      title="Treść tego artykułu została automatycznie zachowana w pamięci podręcznej i jest dostępna w trybie offline"
                    >
                      <WifiOff className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      Zapisano offline
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight mt-1">
                    {activeArticle.title}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200">
              {/* Summary Callout */}
              <div className="bg-teal-50 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 rounded-2xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 mb-1">
                  Kluczowy wniosek biomechaniczny
                </h4>
                <p className="text-xs sm:text-sm text-teal-900 dark:text-teal-200 leading-relaxed">
                  {activeArticle.summary}
                </p>
              </div>

              {/* Full Article Paragraphs */}
              <div className="space-y-3.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {activeArticle.content.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>

              {/* Practical Tips */}
              <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 rounded-2xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-2.5 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Wskazówki praktyczne do wdrożenia od zaraz
                </h4>
                <ul className="space-y-1.5 text-xs text-amber-900 dark:text-amber-200">
                  {activeArticle.practicalTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Key Takeaways */}
              <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-800/60 rounded-2xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300 mb-2 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-sky-500" />
                  Podsumowanie dla pacjenta
                </h4>
                <ul className="space-y-1.5 text-xs text-sky-900 dark:text-sky-200">
                  {activeArticle.keyTakeaways.map((t, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-sky-500 font-bold">✓</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Related Exercises Links */}
              {activeArticle.relatedExerciseIds.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                    Zalecane ćwiczenia do tego artykułu
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeArticle.relatedExerciseIds.map((exId) => {
                      const matched = allExercises.find((e) => e.id === exId);
                      if (!matched) return null;
                      return (
                        <button
                          key={exId}
                          type="button"
                          onClick={() => {
                            setActiveArticle(null);
                            onSelectExercise(matched);
                          }}
                          className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:border-teal-500 text-left transition-all group"
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-teal-600">
                              {matched.polishName}
                            </p>
                            <span className="text-[10px] text-slate-400">
                              {matched.difficulty} • {matched.tempo}
                            </span>
                          </div>
                          <Play className="w-4 h-4 text-teal-600 fill-current opacity-75 group-hover:opacity-100" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  onMarkAsRead(activeArticle.id);
                  setActiveArticle(null);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-xs"
              >
                <CheckCircle className="w-4 h-4" />
                <span>
                  {readArticleIds.includes(activeArticle.id)
                    ? 'Przeczytano (Zapisano)'
                    : 'Zaznacz jako przeczytany (+Odznaka)'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
        );
      })()}
        </>
      )}
    </div>
  );
};
