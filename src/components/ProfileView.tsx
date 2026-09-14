import React, { useState } from 'react';
import { 
  User, Award, Flame, ShieldCheck, Zap, Sun, BookOpen, 
  CheckCircle2, Clock, Lock, Download, Upload, Trash2, 
  ChevronRight, AlertTriangle, Edit3, HeartPulse, Trophy,
  Calendar, Dumbbell, Sparkles, Activity, Compass, ArrowRight,
  Monitor, Moon, Wind, Laptop
} from 'lucide-react';
import { AppState, PrivacyStorageService } from '../services/privacyStorage';
import { evaluateWeeklyChallenges } from '../services/weeklyChallenges';
import { WeeklyChallenge } from '../types';
import { CervicalMobilityTestModal } from './CervicalMobilityTestModal';

interface Props {
  appState: AppState;
  onUpdateState: (newState: AppState) => void;
  onNavigateToTab: (tab: any) => void;
  onOpenEmergencyModal: () => void;
  onOpenBreathingModal?: () => void;
  onOpenBpsModal?: () => void;
  isDarkMode?: boolean;
  themeMode?: 'system' | 'light' | 'dark';
  onForceSwitchTheme?: (target?: 'light' | 'dark') => void;
  onSetThemeMode?: (mode: 'system' | 'light' | 'dark') => void;
}

export const ProfileView: React.FC<Props> = ({
  appState,
  onUpdateState,
  onNavigateToTab,
  onOpenEmergencyModal,
  onOpenBreathingModal,
  onOpenBpsModal,
  isDarkMode = true,
  themeMode = 'system',
  onForceSwitchTheme,
  onSetThemeMode
}) => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'completed' | 'in_progress'>('all');
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [showMobilityModal, setShowMobilityModal] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>(appState.profile.name);
  const [birthYearInput, setBirthYearInput] = useState<number>(appState.profile.birthYear);
  const [notesInput, setNotesInput] = useState<string>(appState.profile.notes);
  const [primaryGoalInput, setPrimaryGoalInput] = useState<string>(appState.profile.primaryGoal || 'tech_neck');

  const challenges = evaluateWeeklyChallenges(appState);
  const completedCount = challenges.filter(c => c.isCompleted).length;
  const totalPoints = challenges
    .filter(c => c.isCompleted)
    .reduce((sum, c) => sum + c.rewardPoints, 0);

  const filteredChallenges = challenges.filter(c => {
    if (filterCategory === 'completed') return c.isCompleted;
    if (filterCategory === 'in_progress') return !c.isCompleted;
    return true;
  });

  const latestMobilityTest = appState.profile.mobilityTests && appState.profile.mobilityTests.length > 0
    ? appState.profile.mobilityTests[0]
    : null;

  const handleSaveMobilityTest = (testData: {
    neckRotationLeftDeg: number;
    neckRotationRightDeg: number;
    neckFlexionCm: number;
    neckExtensionDeg: number;
  }) => {
    const newTest = {
      date: new Date().toISOString().split('T')[0],
      ...testData
    };
    const updatedTests = [newTest, ...(appState.profile.mobilityTests || [])];
    const updatedProfile = {
      ...appState.profile,
      mobilityTests: updatedTests
    };
    onUpdateState({ ...appState, profile: updatedProfile });
    setShowMobilityModal(false);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AppState = {
      ...appState,
      profile: {
        ...appState.profile,
        name: nameInput.trim() || 'Pacjent FizjoSzyja',
        birthYear: Number(birthYearInput) || 1990,
        notes: notesInput.trim(),
        primaryGoal: primaryGoalInput as any
      }
    };
    onUpdateState(updated);
    PrivacyStorageService.saveState(updated);
    setIsEditingProfile(false);
  };

  const getBadgeIcon = (iconName: string, isCompleted: boolean) => {
    const className = `w-6 h-6 ${isCompleted ? 'text-amber-500' : 'text-slate-400'}`;
    switch (iconName) {
      case 'Flame': return <Flame className={className} />;
      case 'ShieldCheck': return <ShieldCheck className={className} />;
      case 'Zap': return <Zap className={className} />;
      case 'Sun': return <Sun className={className} />;
      case 'BookOpen': return <BookOpen className={className} />;
      default: return <Award className={className} />;
    }
  };

  return (
    <div id="profile-view" className="space-y-8 max-w-5xl mx-auto">
      {/* Profile Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-lg font-black text-2xl sm:text-3xl shrink-0">
            {appState.profile.name ? appState.profile.name.charAt(0).toUpperCase() : 'P'}
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Profil Medyczny Pacjenta • Suwerenność Danych</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {appState.profile.name || 'Pacjent FizjoSzyja'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cel terapeutyczny:{' '}
              <strong className="text-slate-700 dark:text-slate-300">
                {appState.profile.primaryGoal === 'discopathy' ? 'Profilaktyka i odciążenie dyskopatii szyjnej' :
                 appState.profile.primaryGoal === 'tension_headache' ? 'Redukcja napięciowych bólów głowy i karku' :
                 appState.profile.primaryGoal === 'posture_prevention' ? 'Korekta postawy i eliminacja protrakcji' :
                 'Zwalczanie syndromu Tech-Neck & praca biurowa'}
              </strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto">
          {onForceSwitchTheme && (
            <button
              id="profile-header-force-theme-btn"
              type="button"
              onClick={() => onForceSwitchTheme()}
              title={isDarkMode ? 'Wymuś motyw jasny (ignorując system)' : 'Wymuś motyw ciemny (ignorując system)'}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
              <span>{isDarkMode ? 'Wymuś Jasny Motyw' : 'Wymuś Ciemny Motyw'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>{isEditingProfile ? 'Anuluj edycję' : 'Edytuj dane'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenEmergencyModal}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 text-xs font-bold transition-all cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Czerwone Flagi (SOR/112)</span>
          </button>
        </div>
      </div>

      {/* Edit Profile Form (Collapsible) */}
      {isEditingProfile && (
        <form
          onSubmit={handleSaveProfile}
          className="bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800 rounded-3xl p-6 shadow-sm space-y-4 animate-in fade-in duration-200"
        >
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-teal-600" />
            Edycja danych profilu zdrowia
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Imię / Identyfikator:
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Rok urodzenia:
              </label>
              <input
                type="number"
                value={birthYearInput}
                onChange={(e) => setBirthYearInput(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Główny cel terapeutyczny:
              </label>
              <select
                value={primaryGoalInput}
                onChange={(e) => setPrimaryGoalInput(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="tech_neck">Zwalczanie syndromu Tech-Neck (biurko/ekrany)</option>
                <option value="discopathy">Dyskopatia szyjna & odciążenie korzeni nerwowych</option>
                <option value="tension_headache">Napięciowe bóle głowy & mięśnie podpotyliczne</option>
                <option value="posture_prevention">Ogólna profilaktyka posturalna</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 text-xs">
              Notatki medyczne (przechowywane wyłącznie w pamięci lokalnej przeglądarki):
            </label>
            <input
              type="text"
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder="np. Przebyta blokada sterydowa C6, zalecenie unikania rotacji w skrajnym zgięciu"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditingProfile(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-xs"
            >
              Zapisz zmiany
            </button>
          </div>
        </form>
      )}

      {/* KPI Overview Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Aktualna seria (Streak)</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono mt-1">
            {appState.profile.streakDays} dni
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Codzienna dyscyplina</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Dumbbell className="w-4 h-4 text-teal-500" />
            <span>Ukończone sesje</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono mt-1">
            {appState.profile.totalCompletedSessions}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Protokoły kinezjoterapii</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-indigo-500" />
            <span>Mikro-przerwy (30s)</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono mt-1">
            {appState.profile.completedMicroBreaksCount || appState.reminders.totalMicroBreaksCompleted || 0}
          </div>
          <div className="text-[11px] text-indigo-500 font-semibold mt-0.5">Odciążeń karku</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Odznaki Tygodniowe</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1">
            {completedCount} / {challenges.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">+{totalPoints} pkt kinezjologicznych</div>
        </div>
      </div>

      {/* Weekly Challenges Module */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold mb-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              <span>Grywalizacja Medyczna • Tydzień Bieżący</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              Wyzwania Tygodniowe & Specjalne Odznaki
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
              Zdobywaj unikalne odznaki fizjoterapeutyczne za systematyczność ćwiczeń, utrzymanie bezbólowych dni oraz regularne 30-sekundowe odciążanie odcinka szyjnego w trakcie pracy.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-1 text-xs font-semibold self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterCategory === 'all'
                  ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Wszystkie ({challenges.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('completed')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterCategory === 'completed'
                  ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Zdobyte ({completedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('in_progress')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterCategory === 'in_progress'
                  ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              W trakcie ({challenges.length - completedCount})
            </button>
          </div>
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredChallenges.map((challenge) => {
            const progressPercent = Math.min(100, Math.round((challenge.currentCount / challenge.targetCount) * 100));

            return (
              <div
                key={challenge.id}
                className={`p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between gap-4 ${
                  challenge.isCompleted
                    ? 'bg-gradient-to-br from-amber-50/70 via-white to-amber-50/30 dark:from-amber-950/30 dark:via-slate-900 dark:to-slate-900 border-amber-300/80 dark:border-amber-800/60 shadow-xs'
                    : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                }`}
              >
                {challenge.isCompleted && (
                  <div className="absolute -top-6 -right-6 w-24 h-24 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />
                )}

                <div className="flex items-start gap-4">
                  {/* Badge Icon Container */}
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-xs transition-transform ${
                      challenge.isCompleted
                        ? 'bg-amber-100 dark:bg-amber-950 border-amber-300 dark:border-amber-700 scale-105'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {getBadgeIcon(challenge.badgeIcon, challenge.isCompleted)}
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{challenge.title}</span>
                        {challenge.isCompleted && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        )}
                      </h4>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase font-mono tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                        +{challenge.rewardPoints} pkt
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {challenge.description}
                    </p>
                  </div>
                </div>

                {/* Progress Bar & Status */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-500 dark:text-slate-400">
                      Postęp: {challenge.currentCount} / {challenge.targetCount} {challenge.unit}
                    </span>
                    <span className={challenge.isCompleted ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-700 dark:text-slate-300'}>
                      {challenge.isCompleted ? 'Odznaka Odblokowana ✓' : `${progressPercent}%`}
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        challenge.isCompleted ? 'bg-amber-500' : 'bg-teal-600'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cervical Mobility Range of Motion (CROM) Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-bold mb-1.5">
              <Compass className="w-3.5 h-3.5 text-teal-600" />
              <span>Diagnostyka Funkcjonalna • Badanie Kinezjologiczne</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              Zakres Ruchomości Odcinka Szyjnego (CROM)
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
              Standardowe pomiary kliniczne: rotacja osiowa w lewo/prawo (C1-C2), odległość bródka-mostek (zgięcie) oraz bezpieczny kąt wyprostu szyi.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowMobilityModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
          >
            <Compass className="w-4 h-4" />
            <span>{latestMobilityTest ? 'Wykonaj Nowy Pomiar' : 'Rozpocznij Test CROM'}</span>
          </button>
        </div>

        {latestMobilityTest ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">
                Rotacja w Lewo
              </span>
              <div className="text-2xl font-black font-mono text-teal-600 dark:text-teal-400 mt-1">
                {latestMobilityTest.neckRotationLeftDeg}°
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Norma: 70° - 90°
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">
                Rotacja w Prawo
              </span>
              <div className="text-2xl font-black font-mono text-teal-600 dark:text-teal-400 mt-1">
                {latestMobilityTest.neckRotationRightDeg}°
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Norma: 70° - 90°
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">
                Bródka - Mostek (Zgięcie)
              </span>
              <div className="text-2xl font-black font-mono text-teal-600 dark:text-teal-400 mt-1">
                {latestMobilityTest.neckFlexionCm} cm
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Norma: 0 - 2 cm
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">
                Wyprost Szyjny
              </span>
              <div className="text-2xl font-black font-mono text-teal-600 dark:text-teal-400 mt-1">
                {latestMobilityTest.neckExtensionDeg}°
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Norma: 50° - 70°
              </span>
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2">
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Brak zarejestrowanych testów ruchomości szyi. Wykonaj 2-minutowy test CROM, aby monitorować postępy w znoszeniu blokad stawowych.
            </p>
          </div>
        )}
      </div>

      {/* Ergonomic Workstation & Biopsychosocial Health Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-bold mb-1.5">
              <Monitor className="w-3.5 h-3.5 text-teal-600" />
              <span>Ergonomia & Czynniki Bio-Psycho-Społeczne</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              Stanowisko Pracy (DIN EN 527) & Dziennik BPS
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
              Zapewnij optymalne warunki biomechaniczne w pracy oraz monitoruj wpływ stresu i regeneracji nocnej na stan kręgosłupa szyjnego.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => onNavigateToTab('ergonomics')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Monitor className="w-4 h-4" />
              <span>Kalkulator Ergonomii</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenBreathingModal?.()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-cyan-300 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 text-xs font-bold transition-all cursor-pointer"
            >
              <Wind className="w-4 h-4" />
              <span>Oddech 4-7-8</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenBpsModal?.()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs font-bold transition-all cursor-pointer"
            >
              <Moon className="w-4 h-4" />
              <span>Dziennik BPS</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Ergonomic Summary */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Monitor className="w-4 h-4 text-teal-600" />
                <span>Audyt Biurka i Monitora</span>
              </span>
              {appState.profile.ergonomicAudit && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  Ocena: {appState.profile.ergonomicAudit.calculatedRiskScore}%
                </span>
              )}
            </div>

            {appState.profile.ergonomicAudit ? (
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Wysokość blatu:</span>
                  <strong className="text-slate-900 dark:text-white font-mono">{appState.profile.ergonomicAudit.currentDeskHeightCm} cm (Zalecane: {appState.profile.ergonomicAudit.recommendedSittingDeskHeightCm} cm)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Ekran:</span>
                  <strong className="text-slate-900 dark:text-white">{appState.profile.ergonomicAudit.monitorSetup === 'laptop_flat' ? 'Laptop na blacie (ryzyko)' : 'Na wysokości oczu'}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Odległość wzroku:</span>
                  <strong className="text-slate-900 dark:text-white font-mono">{appState.profile.ergonomicAudit.screenDistanceCm} cm</strong>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Brak przeprowadzonego audytu biurka. Kliknij &quot;Kalkulator Ergonomii&quot;, aby sprawdzić dopasowanie stanowiska do Twojego wzrostu.
              </p>
            )}
          </div>

          {/* BPS Summary */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Moon className="w-4 h-4 text-indigo-600" />
                <span>Ostatni Zapis BPS (Stres & Sen)</span>
              </span>
              {appState.profile.bpsLogs && appState.profile.bpsLogs.length > 0 && (
                <span className="text-[10px] font-bold text-slate-400 font-mono">
                  {appState.profile.bpsLogs[appState.profile.bpsLogs.length - 1].date}
                </span>
              )}
            </div>

            {appState.profile.bpsLogs && appState.profile.bpsLogs.length > 0 ? (
              (() => {
                const latest = appState.profile.bpsLogs[appState.profile.bpsLogs.length - 1];
                return (
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex justify-between">
                      <span>Poziom stresu:</span>
                      <strong className="text-slate-900 dark:text-white font-mono">{latest.stressLevel} / 10</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Bruksizm (zaciskanie zębów):</span>
                      <strong className={latest.bruxismTension ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                        {latest.bruxismTension ? 'Wykryto napięcie' : 'Brak'}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Pozycja snu:</span>
                      <strong className="text-slate-900 dark:text-white">
                        {latest.sleepingPosition === 'back' ? 'Na plecach' : latest.sleepingPosition === 'side' ? 'Na boku' : 'Na brzuchu'}
                      </strong>
                    </div>
                  </div>
                );
              })()
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Brak wpisów w dzienniku BPS. Rejestruj codziennie poziom stresu i jakość snu, by identyfikować nawroty bólu karku.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Theme & Visual Appearance Setting Card */}
      <div 
        id="theme-switcher-profile-card"
        className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
              {isDarkMode ? <Moon className="w-6 h-6 text-indigo-400" /> : <Sun className="w-6 h-6 text-amber-500" />}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Motyw i Wygląd Aplikacji
                </h3>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  themeMode === 'system'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                    : 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-700'
                }`}>
                  {themeMode === 'system' ? 'Automatyczny (wg systemu)' : `Wymuszony: ${themeMode === 'dark' ? 'Ciemny' : 'Jasny'}`}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Możesz w każdej chwili wymusić tryb ciemny lub jasny, ignorując preferencje systemowe Twojego urządzenia.
              </p>
            </div>
          </div>

          {onForceSwitchTheme && (
            <button
              id="profile-force-toggle-quick-btn"
              type="button"
              onClick={() => onForceSwitchTheme()}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-200" />}
              <span>{isDarkMode ? 'Wymuś Jasny Motyw' : 'Wymuś Ciemny Motyw'}</span>
            </button>
          )}
        </div>

        {/* 3 Explicit Choice Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <button
            id="theme-force-dark-btn"
            type="button"
            onClick={() => onSetThemeMode ? onSetThemeMode('dark') : onForceSwitchTheme?.('dark')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3.5 ${
              themeMode === 'dark'
                ? 'bg-slate-900 text-white border-teal-500 ring-2 ring-teal-500/30 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-slate-800 text-indigo-400 shrink-0">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Wymuszony Ciemny</span>
                {themeMode === 'dark' && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Ciemny kontrast, oszczędność wzroku w nocy
              </p>
            </div>
          </button>

          <button
            id="theme-force-light-btn"
            type="button"
            onClick={() => onSetThemeMode ? onSetThemeMode('light') : onForceSwitchTheme?.('light')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3.5 ${
              themeMode === 'light'
                ? 'bg-amber-50/80 text-amber-950 border-amber-400 ring-2 ring-amber-400/30 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600 shrink-0">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Wymuszony Jasny</span>
                {themeMode === 'light' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Jasne tło, wysoka czytelność w świetle dziennym
              </p>
            </div>
          </button>

          <button
            id="theme-auto-system-btn"
            type="button"
            onClick={() => onSetThemeMode?.('system')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3.5 ${
              themeMode === 'system'
                ? 'bg-teal-50/80 dark:bg-teal-950/40 border-teal-500 ring-2 ring-teal-500/30 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 shrink-0">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Zgodny z systemem</span>
                {themeMode === 'system' && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Automatycznie wg motywu urządzenia
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Data Sovereignty & Privacy Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 text-teal-300 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black">Zero-Knowledge & Suwerenność Danych RODO</h3>
            <p className="text-xs text-slate-300">
              Wszystkie dane zdrowotne (pomiary VAS, notatki, kąty postawy) są zapisywane wyłącznie w pamięci Twojego urządzenia.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={() => onNavigateToTab('reports')}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-xs"
          >
            <Activity className="w-4 h-4" />
            <span>Zobacz Raport dla Lekarza i Wykresy</span>
          </button>
        </div>
      </div>

      {showMobilityModal && (
        <CervicalMobilityTestModal
          onClose={() => setShowMobilityModal(false)}
          onSaveTest={handleSaveMobilityTest}
        />
      )}
    </div>
  );
};
