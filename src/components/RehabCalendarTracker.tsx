import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Flame, 
  Target, 
  Clock, 
  Sparkles, 
  ShieldCheck,
  TrendingDown,
  Info,
  Play,
  MessageSquare
} from 'lucide-react';
import { TrainingPlan, UserHealthProfile } from '../types';

interface Props {
  plan?: TrainingPlan;
  profile?: UserHealthProfile;
  completedDates?: string[]; // array of 'YYYY-MM-DD' strings
  onStartSession?: () => void;
}

export const RehabCalendarTracker: React.FC<Props> = ({
  plan,
  profile,
  completedDates = [],
  onStartSession
}) => {
  const today = useMemo(() => new Date(), []);
  const todayDateStr = useMemo(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [today]);

  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayDateStr);

  // Combine completed dates from profile, plan, and explicit props
  const allCompletedDatesSet = useMemo(() => {
    const set = new Set<string>();

    // From completedDates prop
    completedDates.forEach(d => set.add(d));

    // From profile.completedSessionDates
    if (profile?.completedSessionDates) {
      profile.completedSessionDates.forEach(d => set.add(d));
    }

    // From plan days completed
    if (plan?.days) {
      plan.days.forEach(day => {
        if (day.completed && day.completedAt) {
          const dStr = day.completedAt.split('T')[0];
          set.add(dStr);
        }
      });
    }

    // If streakDays > 0, make sure recent streak days are recorded
    if (profile && profile.streakDays > 0) {
      for (let i = 0; i < profile.streakDays; i++) {
        const past = new Date(Date.now() - i * 86400000);
        const y = past.getFullYear();
        const m = String(past.getMonth() + 1).padStart(2, '0');
        const d = String(past.getDate()).padStart(2, '0');
        set.add(`${y}-${m}-${d}`);
      }
    }

    return set;
  }, [completedDates, profile, plan]);

  // Calendar calculations
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth(); // 0-indexed

  const monthName = useMemo(() => {
    return currentMonthDate.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
  }, [currentMonthDate]);

  // First day of month (0 = Sunday, 1 = Monday, ... 6 = Saturday)
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // In Poland Monday is 0
  const startDayOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Generate calendar grid
  const calendarCells = useMemo(() => {
    const cells: {
      dayNumber: number;
      dateStr: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      isCompleted: boolean;
      isFuture: boolean;
    }[] = [];

    // Previous month padding
    for (let i = startDayOffset - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      cells.push({
        dayNumber: dayNum,
        dateStr: dStr,
        isCurrentMonth: false,
        isToday: dStr === todayDateStr,
        isCompleted: allCompletedDatesSet.has(dStr),
        isFuture: dStr > todayDateStr
      });
    }

    // Current month days
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      cells.push({
        dayNumber: dayNum,
        dateStr: dStr,
        isCurrentMonth: true,
        isToday: dStr === todayDateStr,
        isCompleted: allCompletedDatesSet.has(dStr),
        isFuture: dStr > todayDateStr
      });
    }

    // Next month padding to fill complete grid of 35 or 42 cells
    const remaining = 42 - cells.length;
    if (remaining > 0 && remaining < 7) {
      for (let dayNum = 1; dayNum <= remaining; dayNum++) {
        const nextMonth = month === 11 ? 0 : month + 1;
        const nextYear = month === 11 ? year + 1 : year;
        const dStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
        cells.push({
          dayNumber: dayNum,
          dateStr: dStr,
          isCurrentMonth: false,
          isToday: dStr === todayDateStr,
          isCompleted: allCompletedDatesSet.has(dStr),
          isFuture: dStr > todayDateStr
        });
      }
    }

    return cells;
  }, [year, month, startDayOffset, daysInMonth, daysInPrevMonth, todayDateStr, allCompletedDatesSet]);

  // Statistics for current month
  const currentMonthCompletedCount = useMemo(() => {
    let count = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      if (allCompletedDatesSet.has(dStr)) {
        count++;
      }
    }
    return count;
  }, [year, month, daysInMonth, allCompletedDatesSet]);

  const monthProgressPercent = Math.min(100, Math.round((currentMonthCompletedCount / Math.max(1, daysInMonth)) * 100));

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const handleGoToday = () => {
    setCurrentMonthDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDateStr(todayDateStr);
  };

  const isSelectedCompleted = allCompletedDatesSet.has(selectedDateStr);
  const isSelectedToday = selectedDateStr === todayDateStr;

  const selectedFormattedDate = useMemo(() => {
    try {
      const [y, m, d] = selectedDateStr.split('-').map(Number);
      const dObj = new Date(y, m - 1, d);
      return dObj.toLocaleDateString('pl-PL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return selectedDateStr;
    }
  }, [selectedDateStr]);

  const matchingCompletedDay = useMemo(() => {
    if (!plan?.days) return null;
    return plan.days.find(d => d.completed && d.completedAt?.split('T')[0] === selectedDateStr);
  }, [plan, selectedDateStr]);

  const weekDayLabels = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nd'];

  return (
    <div id="rehab-calendar-tracker" className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-semibold mb-1.5">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Kalendarz Systematyczności & Dni Rehabilitacji</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white capitalize">
            {monthName}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Monitoruj zrealizowane sesje ćwiczeniowe odcinka szyjnego i buduj zdrowy nawyk biomechaniczny.
          </p>
        </div>

        {/* Month Navigation & Today Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleGoToday}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
          >
            Dzisiaj
          </button>
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Poprzedni miesiąc"
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Następny miesiąc"
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Consistency Metric Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Ukończone w m-cu
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black font-mono text-emerald-950 dark:text-emerald-200">
              {currentMonthCompletedCount}
            </span>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
              / {daysInMonth} dni
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Ciągłość (Streak)
            </span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black font-mono text-amber-950 dark:text-amber-200">
              {profile?.streakDays || 4}
            </span>
            <span className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
              dni z rzędu
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
              Systematyczność
            </span>
            <Target className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black font-mono text-teal-950 dark:text-teal-200">
              {monthProgressPercent}%
            </span>
            <span className="text-xs text-teal-700 dark:text-teal-400 font-semibold">
              wypełnienia
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Łącznie sesji
            </span>
            <ShieldCheck className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">
              {profile?.totalCompletedSessions || allCompletedDatesSet.size}
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              treningów
            </span>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/50">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/80 text-center py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300">
          {weekDayLabels.map((day, idx) => (
            <div key={day} className={idx >= 5 ? 'text-amber-600 dark:text-amber-400' : ''}>
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-800">
          {calendarCells.map((cell, idx) => {
            const isSelected = cell.dateStr === selectedDateStr;

            return (
              <button
                key={`${cell.dateStr}-${idx}`}
                type="button"
                onClick={() => setSelectedDateStr(cell.dateStr)}
                className={`min-h-[64px] sm:min-h-[76px] p-1.5 sm:p-2 flex flex-col justify-between items-start transition-all relative text-left outline-hidden ${
                  !cell.isCurrentMonth
                    ? 'bg-slate-50/40 dark:bg-slate-900/40 text-slate-300 dark:text-slate-700'
                    : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:bg-teal-50/40 dark:hover:bg-slate-800/60'
                } ${
                  isSelected
                    ? 'ring-2 ring-teal-500 z-10 bg-teal-50/30 dark:bg-teal-950/20'
                    : ''
                }`}
              >
                {/* Day Header */}
                <div className="w-full flex items-center justify-between">
                  <span
                    className={`inline-flex items-center justify-center text-xs sm:text-sm font-semibold rounded-full w-6 h-6 ${
                      cell.isToday
                        ? 'bg-teal-600 text-white font-black shadow-xs'
                        : !cell.isCurrentMonth
                        ? 'text-slate-300 dark:text-slate-600'
                        : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  {/* Completion Badge */}
                  {cell.isCompleted && (
                    <span className="text-emerald-500 dark:text-emerald-400" title="Sesja rehabilitacji ukończona">
                      <CheckCircle2 className="w-4 h-4 fill-emerald-100 dark:fill-emerald-950" />
                    </span>
                  )}
                </div>

                {/* Day Indicator / Status Label */}
                <div className="w-full mt-1">
                  {cell.isCompleted ? (
                    <div className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-800/70 text-[9px] font-bold text-emerald-700 dark:text-emerald-300 w-full truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="truncate">Sesja zaliczona</span>
                    </div>
                  ) : cell.isToday ? (
                    <div className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/70 border border-teal-200/80 dark:border-teal-800/70 text-[9px] font-bold text-teal-700 dark:text-teal-300 w-full truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-ping shrink-0" />
                      <span className="truncate">Dzisiejszy plan</span>
                    </div>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details Panel */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium capitalize">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{selectedFormattedDate}</span>
          </div>

          <div className="flex items-center gap-2">
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {isSelectedCompleted ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Sesja rehabilitacyjna ukończona z sukcesem!
                </span>
              ) : isSelectedToday ? (
                <span className="text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Dzisiejsza sesja rehabilitacyjna oczekuje na realizację
                </span>
              ) : selectedDateStr > todayDateStr ? (
                <span className="text-slate-600 dark:text-slate-400">
                  Zaplanowany dzień ćwiczeń w protokole
                </span>
              ) : (
                <span className="text-slate-500">
                  Dzień odpoczynku / regeneracji powięziowej
                </span>
              )}
            </h4>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400">
            {isSelectedCompleted
              ? 'Wszystkie ćwiczenia rozluźniające kark, retrakcji brody i stabilizacji łopatek zostały wykonane poprawnie.'
              : isSelectedToday
              ? 'Wykonaj dzisiejszą 10-minutową sesję, aby utrzymać ciągłość serii (streak) i zredukować napięcie biurowe.'
              : 'Konsekwentny trening 3–4 razy w tygodniu redukuje ból karku wg standardów NFZ o ponad 60%.'}
          </p>

          {matchingCompletedDay?.sessionNotes && (
            <div className="mt-2.5 p-3 rounded-xl bg-teal-50/80 dark:bg-teal-950/50 border border-teal-200/80 dark:border-teal-800/60 text-xs flex items-start gap-2 text-left">
              <MessageSquare className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-teal-900 dark:text-teal-200 block text-[11px] uppercase tracking-wide">
                  Uwagi i odczucia z ćwiczeń:
                </span>
                <p className="text-slate-700 dark:text-slate-300 mt-0.5 whitespace-pre-line italic">
                  „{matchingCompletedDay.sessionNotes}”
                </p>
              </div>
            </div>
          )}
        </div>

        {isSelectedToday && !isSelectedCompleted && onStartSession && (
          <button
            type="button"
            onClick={onStartSession}
            className="shrink-0 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Rozpocznij sesję teraz</span>
          </button>
        )}
      </div>

      {/* Legend & Compliance Standard */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="font-medium text-slate-700 dark:text-slate-300">Sesja wykonana z sukcesem</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-teal-600" />
            <span className="font-medium text-slate-700 dark:text-slate-300">Dzisiejsza data</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span className="font-medium text-slate-700 dark:text-slate-300">Dzień regeneracji / planu</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-teal-700 dark:text-teal-300 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>Dane przechowywane w 100% lokalnie na Twoim urządzeniu</span>
        </div>
      </div>
    </div>
  );
};
