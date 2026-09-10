import React, { useState, useMemo } from 'react';
import { Search, Filter, Dumbbell, ShieldCheck, Sparkles, BookOpen, X, Target, Check } from 'lucide-react';
import { Exercise, SpineRegion } from '../types';
import { EXERCISES } from '../data/exercises';
import { ExerciseCard } from './ExerciseCard';
import { KnowledgeBaseSection } from './KnowledgeBaseSection';

interface Props {
  onOpenDetails: (exercise: Exercise) => void;
  onQuickStart: (exercise: Exercise) => void;
  readArticleIds?: string[];
  onMarkArticleAsRead?: (id: string) => void;
  initialSubTab?: 'exercises' | 'knowledge';
}

interface GoalChip {
  id: string;
  label: string;
  query: string;
}

const QUICK_GOAL_CHIPS: GoalChip[] = [
  { id: 'all', label: 'Wszystkie cele', query: '' },
  { id: 'neck', label: '🎯 Szyja i kark (C1-C7)', query: 'szyja' },
  { id: 'lumbar', label: '🎯 Odcinek lędźwiowy (L-S)', query: 'odcinek lędźwiowy' },
  { id: 'thoracic', label: '🎯 Odcinek piersiowy & łopatki', query: 'odcinek piersiowy' },
  { id: 'tech-neck', label: '📱 Tech-neck & ból karku', query: 'tech-neck' },
  { id: 'headache', label: '💆 Bóle głowy i potylicy', query: 'ból głowy' },
  { id: 'stretch', label: '🧘 Rozciąganie & mobilizacja', query: 'rozciąganie' },
  { id: 'strength', label: '💪 Wzmacnianie i stabilizacja', query: 'wzmocnienie' },
];

export const ExerciseCatalogView: React.FC<Props> = ({
  onOpenDetails,
  onQuickStart,
  readArticleIds = [],
  onMarkArticleAsRead = () => {},
  initialSubTab = 'exercises'
}) => {
  const [catalogTab, setCatalogTab] = useState<'exercises' | 'knowledge'>(initialSubTab);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<SpineRegion | 'all'>('all');
  const [activeGoalChip, setActiveGoalChip] = useState<string>('all');

  const filteredExercises = useMemo(() => {
    const rawQuery = searchTerm.trim().toLowerCase();

    return EXERCISES.filter((ex) => {
      // Direct region filter check
      if (selectedRegion !== 'all' && ex.region !== selectedRegion) {
        return false;
      }

      if (!rawQuery) return true;

      // Smart semantic synonyms for spinal regions & goals
      const isCervicalQuery = ['szyja', 'szyjny', 'kark', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'cervical', 'potylic'].some(k => rawQuery.includes(k));
      const isLumbarQuery = ['lędźw', 'ledzw', 'l1', 'l2', 'l3', 'l4', 'l5', 'lumbar', 'dolne plecy', 'krzyż'].some(k => rawQuery.includes(k));
      const isThoracicQuery = ['piers', 'łopat', 'lopat', 'th', 'thoracic', 'międzyłopatk'].some(k => rawQuery.includes(k));
      
      const regionMatch =
        (isCervicalQuery && ex.region === 'cervical') ||
        (isLumbarQuery && ex.region === 'lumbar') ||
        (isThoracicQuery && ex.region === 'thoracic');

      // Difficulty / goal matching
      const diffMatch = ex.difficulty.toLowerCase().includes(rawQuery);

      // Name & Description matching
      const nameMatch = ex.polishName.toLowerCase().includes(rawQuery) || ex.name.toLowerCase().includes(rawQuery);
      const descMatch = ex.description.toLowerCase().includes(rawQuery) || ex.steps.some(s => s.toLowerCase().includes(rawQuery));

      // Target muscles & symptoms matching
      const muscleMatch = ex.targetMuscles.some((m) => m.toLowerCase().includes(rawQuery));
      const symptomMatch = ex.idealForSymptoms.some((s) => s.toLowerCase().includes(rawQuery));

      return regionMatch || diffMatch || nameMatch || descMatch || muscleMatch || symptomMatch;
    });
  }, [searchTerm, selectedRegion]);

  const handleSelectGoalChip = (chip: GoalChip) => {
    setActiveGoalChip(chip.id);
    if (chip.id === 'all') {
      setSearchTerm('');
      setSelectedRegion('all');
    } else if (chip.id === 'neck') {
      setSelectedRegion('cervical');
      setSearchTerm('');
    } else if (chip.id === 'lumbar') {
      setSelectedRegion('lumbar');
      setSearchTerm('');
    } else if (chip.id === 'thoracic') {
      setSelectedRegion('thoracic');
      setSearchTerm('');
    } else {
      setSelectedRegion('all');
      setSearchTerm(chip.query);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSelectedRegion('all');
    setActiveGoalChip('all');
  };

  return (
    <div id="exercise-catalog-view" className="space-y-8 max-w-5xl mx-auto">
      {/* Top Main Mode Switcher: Exercises vs Knowledge Base */}
      <div className="flex items-center justify-center">
        <div className="inline-flex p-1.5 rounded-2xl bg-slate-200/70 dark:bg-slate-800/70 border border-slate-300/60 dark:border-slate-700/60 shadow-inner">
          <button
            type="button"
            id="catalog-tab-exercises"
            onClick={() => setCatalogTab('exercises')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              catalogTab === 'exercises'
                ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>Katalog Ćwiczeń & Wideo HD ({EXERCISES.length})</span>
          </button>

          <button
            type="button"
            id="catalog-tab-knowledge"
            onClick={() => setCatalogTab('knowledge')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              catalogTab === 'knowledge'
                ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4 text-teal-500" />
            <span>Baza Wiedzy & Ergonomia Pracy</span>
          </button>
        </div>
      </div>

      {catalogTab === 'knowledge' ? (
        <KnowledgeBaseSection
          readArticleIds={readArticleIds}
          onMarkAsRead={onMarkArticleAsRead}
          allExercises={EXERCISES}
          onSelectExercise={onOpenDetails}
        />
      ) : (
        <>
          {/* Header Banner */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-semibold mb-2">
              <Dumbbell className="w-3.5 h-3.5" />
              <span>Kliniczna Baza Ćwiczeń Kinezjologicznych NFZ / Gov</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Katalog Ćwiczeń Rehabilitacyjnych & Wideo
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
              Poznaj bezpieczną technikę wykonywania każdego ruchu dzięki interaktywnym symulacjom biomechanicznym, wideo fizjoterapeutów, wskaźnikom oddechu i wytycznym fizjoterapii.
            </p>

            {/* Search & Filter Toolbar */}
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Enhanced Search bar with clear button */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-teal-600 dark:text-teal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="exercise-search-input"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setActiveGoalChip('custom');
                    }}
                    placeholder="Szukaj po nazwie lub celu (np. 'szyja', 'odcinek lędźwiowy', 'tech-neck')..."
                    className="w-full pl-10 pr-10 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 font-medium shadow-inner transition-all"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      id="clear-exercise-search-btn"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                      title="Wyczyść pole wyszukiwania"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Region Filter Buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {[
                    { id: 'all', label: 'Wszystkie odcinki' },
                    { id: 'cervical', label: 'Szyja (C1-C7)' },
                    { id: 'thoracic', label: 'Piersiowy (Th)' },
                    { id: 'lumbar', label: 'Lędźwie (L-S)' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setSelectedRegion(tab.id as SpineRegion | 'all');
                        if (tab.id === 'all') setActiveGoalChip('all');
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                        selectedRegion === tab.id
                          ? 'bg-teal-700 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Goal & Target Filter Chips */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <Target className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Szybkie filtrowanie według celu terapeutycznego:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_GOAL_CHIPS.map((chip) => {
                    const isActive = activeGoalChip === chip.id;
                    return (
                      <button
                        key={chip.id}
                        type="button"
                        onClick={() => handleSelectGoalChip(chip)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 border ${
                          isActive
                            ? 'bg-teal-50 dark:bg-teal-950/80 border-teal-500 text-teal-800 dark:text-teal-200 shadow-xs'
                            : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <span>{chip.label}</span>
                        {isActive && <Check className="w-3 h-3 text-teal-600 dark:text-teal-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status bar: Matches count & active query pill */}
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100/80 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">
                    Znaleziono: {filteredExercises.length} {filteredExercises.length === 1 ? 'ćwiczenie' : filteredExercises.length < 5 ? 'ćwiczenia' : 'ćwiczeń'}
                  </span>
                  {(searchTerm || selectedRegion !== 'all') && (
                    <span className="px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-[10px] font-bold">
                      Filtr: {searchTerm ? `„${searchTerm}”` : ''} {selectedRegion !== 'all' ? `[${selectedRegion}]` : ''}
                    </span>
                  )}
                </div>

                {(searchTerm || selectedRegion !== 'all' || activeGoalChip !== 'all') && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="text-teal-600 hover:text-teal-700 dark:text-teal-400 font-bold hover:underline cursor-pointer text-xs"
                  >
                    Wyczyść wszystkie filtry
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Exercises Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredExercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onOpenDetails={onOpenDetails}
                onQuickStart={onQuickStart}
              />
            ))}
          </div>

          {filteredExercises.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                Nie znaleziono ćwiczeń dla podanych kryteriów wyszukiwania.
              </p>
              <button
                type="button"
                onClick={handleClearSearch}
                className="mt-3 text-xs text-teal-600 font-bold hover:underline"
              >
                Zresetuj wszystkie filtry
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
