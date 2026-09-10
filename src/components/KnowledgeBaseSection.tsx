import React, { useState } from 'react';
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
  Play
} from 'lucide-react';
import { KnowledgeArticle, Exercise } from '../types';
import { KNOWLEDGE_ARTICLES } from '../data/knowledgeBase';

interface Props {
  readArticleIds?: string[];
  onMarkAsRead: (articleId: string) => void;
  allExercises: Exercise[];
  onSelectExercise: (exercise: Exercise) => void;
}

export const KnowledgeBaseSection: React.FC<Props> = ({
  readArticleIds = [],
  onMarkAsRead,
  allExercises,
  onSelectExercise
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeArticle, setActiveArticle] = useState<KnowledgeArticle | null>(null);

  const categories = [
    { id: 'all', label: 'Wszystkie Artykuły' },
    { id: 'ergonomia', label: 'Ergonomia Biurka' },
    { id: 'higiena_pracy', label: 'Higiena Pracy & Przerwy' },
    { id: 'tech_neck', label: 'Syndrom Tech-Neck' },
    { id: 'autoterapia', label: 'Punkty Spustowe' },
    { id: 'sen', label: 'Zdrowy Sen & Poduszka' },
    { id: 'bezpieczenstwo', label: 'Czerwone Flagi (Bezpieczeństwo)' }
  ];

  const filteredArticles = KNOWLEDGE_ARTICLES.filter((art) => {
    const matchesCategory = selectedCategory === 'all' || art.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.keyTakeaways.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
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

  return (
    <div id="knowledge-base-section" className="space-y-6">
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

          <div className="mt-4 flex items-center gap-4 text-xs text-teal-200">
            <span>📚 {KNOWLEDGE_ARTICLES.length} artykułów klinicznych</span>
            <span>•</span>
            <span>
              ✅ Przeczytano: {readArticleIds.length} z {KNOWLEDGE_ARTICLES.length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="knowledge-search-input"
            type="text"
            placeholder="Szukaj (np. monitor, poduszka, tech-neck)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
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

      {/* Article Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredArticles.map((art) => {
          const isRead = readArticleIds.includes(art.id);
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
                  <div className="flex items-center gap-1.5">
                    {getCategoryIcon(art.category)}
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {art.readTimeMinutes} min czytania
                    </span>
                  </div>

                  {isRead ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      Przeczytany
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-400">Nowy</span>
                  )}
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
                  onClick={() => setActiveArticle(art)}
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

      {/* Article Reader Modal */}
      {activeArticle && (
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
                  <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                    Edukacja Fizjoterapeutyczna • {activeArticle.readTimeMinutes} min czytania
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
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
      )}
    </div>
  );
};
