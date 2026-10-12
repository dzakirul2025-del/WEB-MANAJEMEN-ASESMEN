import React, { useState } from 'react';
import {
  AlertTriangle,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { ASSESSMENT_CATEGORIES } from '../../data/seedData';
import { Assessment } from '../../types';
import { useApp } from '../../context/AppContext';
import { AssessmentFormModal } from '../assessments/AssessmentFormModal';

export const AssessmentCalendarView: React.FC = () => {
  const { assessments, subjects, currentUser } = useApp();

  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1)); // October 2026
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday

  // Days array
  const calendarDays = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(new Date(year, month, d));
  }

  // Filtered assessments
  const filtered = assessments.filter((asm) => {
    const matchCat = selectedCategory === 'all' || asm.category === selectedCategory;
    const matchLevel = selectedLevel === 'all' || asm.level.toString() === selectedLevel;
    return matchCat && matchLevel;
  });

  // Schedule conflict detector: find if two assessments on the same day target the same class & level
  const conflicts: Array<{ date: string; level: number; rombel: string; items: Assessment[] }> = [];
  const dateGroups: Record<string, Assessment[]> = {};

  filtered.forEach((a) => {
    const dStr = a.startTime.split('T')[0];
    if (!dateGroups[dStr]) dateGroups[dStr] = [];
    dateGroups[dStr].push(a);
  });

  Object.entries(dateGroups).forEach(([dateStr, items]) => {
    if (items.length > 1) {
      // check if any share same level
      const levels: Record<number, Assessment[]> = {};
      items.forEach((it) => {
        if (!levels[it.level]) levels[it.level] = [];
        levels[it.level].push(it);
      });
      Object.entries(levels).forEach(([lvl, lvlItems]) => {
        if (lvlItems.length > 1) {
          conflicts.push({
            date: dateStr,
            level: Number(lvl),
            rombel: lvlItems.map((i) => i.rombelTargets.join('/')).join(', '),
            items: lvlItems,
          });
        }
      });
    }
  });

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Kalender Asesmen Digital
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              Zona Waktu WITA (Asia/Makassar)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Penjadwalan terpadu untuk mencegah benturan jadwal ujian pada kelas yang sama.
          </p>
        </div>

        {(currentUser.role === 'super_admin' || currentUser.role === 'guru') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Jadwal Asesmen</span>
          </button>
        )}
      </div>

      {/* Schedule Conflict Warning Banner */}
      {conflicts.length > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 space-y-2">
          <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span>Peringatan Benturan Jadwal Ujian Terdeteksi!</span>
          </div>
          <div className="space-y-1 text-xs text-amber-800">
            {conflicts.map((c, i) => (
              <div key={i} className="leading-relaxed">
                Tanggal <strong>{new Date(c.date).toLocaleDateString('id-ID', { dateStyle: 'long' })}</strong>: Terdapat {c.items.length} kegiatan bersamaan untuk <strong>Kelas {c.level}</strong> ({c.items.map((it) => it.title).join(' dan ')}).
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Month Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        {/* Month Selector */}
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-extrabold text-sm text-slate-900 min-w-[140px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 focus:bg-white focus:border-blue-600 focus:outline-hidden"
          >
            <option value="all">Semua Kategori</option>
            {ASSESSMENT_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.badgeLabel}
              </option>
            ))}
          </select>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 focus:bg-white focus:border-blue-600 focus:outline-hidden"
          >
            <option value="all">Semua Kelas</option>
            {[1, 2, 3, 4, 5, 6].map((l) => (
              <option key={l} value={l.toString()}>
                Kelas {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-[11px] font-bold text-slate-600 uppercase py-2">
          <span className="text-red-600">Ahad</span>
          <span>Senin</span>
          <span>Selasa</span>
          <span>Rabu</span>
          <span>Kamis</span>
          <span className="text-emerald-700">Jumat</span>
          <span>Sabtu</span>
        </div>

        {/* Days Cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
          {calendarDays.map((d, index) => {
            if (!d) {
              return <div key={`empty-${index}`} className="min-h-[110px] bg-slate-50/40 p-2" />;
            }

            const dateStr = d.toISOString().split('T')[0];
            const dayAssessments = filtered.filter(
              (a) => a.startTime.split('T')[0] === dateStr
            );
            const isToday =
              d.getDate() === new Date().getDate() &&
              d.getMonth() === new Date().getMonth() &&
              d.getFullYear() === new Date().getFullYear();

            return (
              <div
                key={dateStr}
                className={`min-h-[110px] p-2 hover:bg-slate-50/80 transition-colors flex flex-col justify-between ${
                  isToday ? 'bg-blue-50/30' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold tabular-nums ${
                      isToday
                        ? 'h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center'
                        : d.getDay() === 0
                        ? 'text-red-500'
                        : 'text-slate-800'
                    }`}
                  >
                    {d.getDate()}
                  </span>
                  {dayAssessments.length > 0 && (
                    <span className="text-[10px] font-bold text-slate-400">
                      {dayAssessments.length} agenda
                    </span>
                  )}
                </div>

                {/* Day events badges */}
                <div className="mt-1 space-y-1 flex-1 overflow-y-auto max-h-[85px]">
                  {dayAssessments.map((ev) => {
                    const catMeta = ASSESSMENT_CATEGORIES.find((c) => c.id === ev.category);
                    return (
                      <div
                        key={ev.id}
                        className="rounded p-1 text-[10px] font-medium leading-tight truncate border"
                        style={{
                          backgroundColor: `${catMeta?.accentColor}15`,
                          borderColor: `${catMeta?.accentColor}40`,
                          color: '#0f172a',
                        }}
                        title={`${ev.title} (${ev.durationMinutes} menit, ${ev.platform})`}
                      >
                        <div className="font-bold truncate">{ev.title}</div>
                        <div className="text-[9px] text-slate-500 tabular-nums">
                          Kls {ev.level} · {new Date(ev.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WITA
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isModalOpen && (
        <AssessmentFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};
