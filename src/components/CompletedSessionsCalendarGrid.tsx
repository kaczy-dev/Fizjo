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
  Play,
  RotateCcw
} from 'lucide-react';

export interface CompletedSessionsCalendarGridProps {
  completedSessionDates?: string[];
  onToggleCompletedDate?: (dateStr: string) => void;
  onStartSession?: () => void;
  streakDays?: number;
  totalCompletedSessions?: number;
  className?: string;
}

export const CompletedSessionsCalendarGrid: React.FC<CompletedSessionsCalendarGridProps> = ({
  completedSessionDates = [],
  onToggleCompletedDate,
  onStartSession,
  streakDays = 0,
  totalCompletedSessions,
  className = ''
}) => {
  // Current real-world date
  const today = useMemo(() => new Date(), []);
  const todayDateStr = useMemo(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [today]);

  // Current month being viewed in the grid
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );

  // Selected date clicked by user (defaults to today)
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayDateStr);

  // Set of completed session dates for O(1) lookup
  const completedDatesSet = useMemo(() => {
    return new Set<string>(completedSessionDates);
  }, [completedSessionDates]);

  // Calendar calculations
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth(); // 0-indexed

  const monthName = useMemo(() => {
    return currentMonthDate.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
  }, [currentMonthDate]);

  // First day of month: in Poland Monday is day 0, Sunday is day 6
  // JS getDay(): 0 is Sunday, 1 is Monday, ..., 6 is Saturday
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startDayOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Generate 35 or 42 grid cells
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
        isCompleted: completedDatesSet.has(dStr),
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
        isCompleted: completedDatesSet.has(dStr),
        isFuture: dStr > todayDateStr
      });
    }

    // Next month padding to complete row
    const totalSlots = cells.length <= 35 ? 35 : 42;
    const remaining = totalSlots - cells.length;
    for (let dayNum = 1; dayNum <= remaining; dayNum++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      cells.push({
        dayNumber: dayNum,
        dateStr: dStr,
        isCurrentMonth: false,
        isToday: dStr === todayDateStr,
        isCompleted: completedDatesSet.has(dStr),
        isFuture: dStr > todayDateStr
      });
    }

    return cells;
  }, [year, month, startDayOffset, daysInMonth, daysInPrevMonth, todayDateStr, completedDatesSet]);

  // Count how many sessions were completed in this displayed month
  const currentMonthCompletedCount = useMemo(() => {
    let count = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      if (completedDatesSet.has(dStr)) {
        count++;
      }
    }
    return count;
  }, [year, month, daysInMonth, completedDatesSet]);

  // Navigation handlers
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

  const isSelectedCompleted = completedDatesSet.has(selectedDateStr);
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

  const weekDayLabels = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'];

  return (
    <div
      id="completed-sessions-calendar-grid"
      className={`bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5 ${className}`}
    >
      {/* Header: Title + Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-semibold mb-1.5">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Kalendarz Ukończonych Sesji</span>
          </div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white capitalize">
              {monthName}
            </h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-mono">
              {currentMonthCompletedCount} zrealizowanych
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Wizualizacja systematyczności treningowej na podstawie bazy ukończonych sesji (completedSessionDates).
          </p>
        </div>

        {/* Month Navigation & "Dzisiaj" Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            id="calendar-grid-today-btn"
            type="button"
            onClick={handleGoToday}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            Dzisiaj
          </button>
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              id="calendar-grid-prev-month-btn"
              type="button"
              onClick={handlePrevMonth}
              aria-label="Poprzedni miesiąc"
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Poprzedni miesiąc"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              id="calendar-grid-next-month-btn"
              type="button"
              onClick={handleNextMonth}
              aria-label="Następny miesiąc"
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Następny miesiąc"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Completed in Month */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              W tym miesiącu
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

        {/* Streak */}
        <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Ciągłość (Streak)
            </span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black font-mono text-amber-950 dark:text-amber-200">
              {streakDays}
            </span>
            <span className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
              dni z rzędu
            </span>
          </div>
        </div>

        {/* Total Sessions */}
        <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
              Łącznie ukończone
            </span>
            <Target className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black font-mono text-teal-950 dark:text-teal-200">
              {totalCompletedSessions ?? completedDatesSet.size}
            </span>
            <span className="text-xs text-teal-700 dark:text-teal-400 font-semibold">
              sesji
            </span>
          </div>
        </div>

        {/* Consistency Ratio */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Wskaźnik nawyku
            </span>
            <Sparkles className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">
              {Math.min(100, Math.round((currentMonthCompletedCount / Math.max(1, daysInMonth)) * 100))}%
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              regularności
            </span>
          </div>
        </div>
      </div>

      {/* 7-Column Calendar Grid */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/50">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-800/90 text-center py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300">
          {weekDayLabels.map((day, idx) => (
            <div key={day} className={idx >= 5 ? 'text-amber-700 dark:text-amber-400' : ''}>
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid Cells */}
        <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-800">
          {calendarCells.map((cell, idx) => {
            const isSelected = cell.dateStr === selectedDateStr;

            return (
              <button
                key={`${cell.dateStr}-${idx}`}
                id={`calendar-cell-${cell.dateStr}`}
                type="button"
                onClick={() => setSelectedDateStr(cell.dateStr)}
                title={
                  cell.isCompleted
                    ? `Dzień ${cell.dateStr}: Sesja ukończona`
                    : `Dzień ${cell.dateStr}: Brak sesji`
                }
                className={`min-h-[64px] sm:min-h-[76px] p-1.5 sm:p-2 flex flex-col justify-between items-start transition-all relative text-left outline-hidden cursor-pointer ${
                  !cell.isCurrentMonth
                    ? 'bg-slate-50/40 dark:bg-slate-900/40 text-slate-300 dark:text-slate-700'
                    : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:bg-teal-50/50 dark:hover:bg-slate-800/70'
                } ${
                  isSelected
                    ? 'ring-2 ring-teal-500 ring-inset z-10 bg-teal-50/60 dark:bg-teal-950/30'
                    : ''
                }`}
              >
                {/* Top: Day number + "Dziś" badge */}
                <div className="w-full flex items-center justify-between">
                  <span
                    className={`text-xs sm:text-sm font-mono font-bold ${
                      cell.isToday
                        ? 'w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center font-black shadow-xs'
                        : !cell.isCurrentMonth
                        ? 'text-slate-300 dark:text-slate-700'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  {cell.isToday && (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 hidden sm:inline">
                      Dziś
                    </span>
                  )}
                </div>

                {/* Bottom: Completion Indicator */}
                <div className="w-full mt-auto pt-1 flex items-center justify-between">
                  {cell.isCompleted ? (
                    <div className="w-full flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="text-[10px] font-bold truncate hidden sm:inline">
                        Ukończono
                      </span>
                    </div>
                  ) : cell.isToday ? (
                    <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400">
                      Do zrobienia
                    </span>
                  ) : (
                    <div className="h-4" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend & Selected Day Context Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 text-xs">
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-slate-600 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Legenda:</span>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>Sesja zrealizowana (completedSessionDates)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-teal-600" />
            <span>Dzisiejszy dzień</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span>Dzień bez sesji</span>
          </div>
        </div>

        {/* Selected date quick summary / actions */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium capitalize">
              {selectedFormattedDate}
            </span>
            <div className="flex items-center gap-1.5 font-bold">
              {isSelectedCompleted ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Sesja zaliczona
                </span>
              ) : (
                <span className="text-slate-500 dark:text-slate-400">
                  Brak ukończonej sesji
                </span>
              )}
            </div>
          </div>

          {/* Optional toggle button if parent provided onToggleCompletedDate */}
          {onToggleCompletedDate && (
            <button
              id={`toggle-complete-date-btn-${selectedDateStr}`}
              type="button"
              onClick={() => onToggleCompletedDate(selectedDateStr)}
              className="ml-auto px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
              title="Przełącz status ukończenia dla tego dnia"
            >
              {isSelectedCompleted ? 'Cofnij' : 'Oznacz jako ukończoną'}
            </button>
          )}

          {/* If today and not completed, button to start session */}
          {isSelectedToday && !isSelectedCompleted && onStartSession && (
            <button
              id="calendar-grid-start-today-session-btn"
              type="button"
              onClick={onStartSession}
              className="ml-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Zacznij</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
