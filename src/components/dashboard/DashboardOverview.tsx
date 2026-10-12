import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileSpreadsheet,
  GraduationCap,
  Layers,
  Link2,
  Plus,
  TrendingUp,
  User,
  Users,
} from 'lucide-react';
import { ASSESSMENT_CATEGORIES } from '../../data/seedData';
import { AssessmentCategoryType } from '../../types';
import { useApp } from '../../context/AppContext';
import { ActiveCategoriesChecklist } from '../assessments/ActiveCategoriesChecklist';

export const DashboardOverview: React.FC = () => {
  const {
    assessments,
    students,
    teachers,
    subjects,
    settings,
    announcements,
    setCurrentView,
    setSelectedCategoryFilter,
    isCategoryActive,
    toggleAssessmentCategoryActive,
    currentUser,
  } = useApp();

  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterSemester, setFilterSemester] = useState<string>(settings.activeSemester);

  const filteredAssessments = assessments.filter((asm) => {
    const matchLevel = filterLevel === 'all' || asm.level.toString() === filterLevel;
    const matchSem = asm.semester === filterSemester;
    return matchLevel && matchSem;
  });

  const now = new Date();

  // Metric counts
  const totalAssessments = filteredAssessments.length;
  const activeLinks = filteredAssessments.filter((a) => a.assessmentUrl && a.canStudentOpen).length;
  const ongoingCount = filteredAssessments.filter((a) => {
    const s = new Date(a.startTime);
    const e = new Date(a.endTime);
    return a.status === 'berlangsung' || (now >= s && now <= e && a.status !== 'dibatalkan');
  }).length;
  const upcomingCount = filteredAssessments.filter((a) => {
    const s = new Date(a.startTime);
    return now < s && a.status !== 'dibatalkan';
  }).length;
  const completedCount = filteredAssessments.filter((a) => a.status === 'selesai' || now > new Date(a.endTime)).length;
  const draftCount = filteredAssessments.filter((a) => a.status === 'draft').length;

  // Category counts
  const categoryCounts = ASSESSMENT_CATEGORIES.map((cat) => ({
    ...cat,
    count: filteredAssessments.filter((a) => a.category === cat.id).length,
  }));

  // Class level breakdown
  const levelCounts = [1, 2, 3, 4, 5, 6].map((lvl) => ({
    level: lvl,
    count: filteredAssessments.filter((a) => a.level === lvl).length,
  }));

  // Recent and Approaching Deadlines
  const upcomingAssessments = [...filteredAssessments]
    .filter((a) => a.status !== 'selesai' && a.status !== 'dibatalkan')
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 5);

  const getSubjectName = (subId: string) => subjects.find((s) => s.id === subId)?.name || 'Mata Pelajaran';

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Dashboard Ringkasan Asesmen Digital
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-800">
              {settings.schoolName}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pantau seluruh kegiatan evaluasi, jadwal aktif, bank tautan multi-platform, dan ketuntasan belajar peserta didik.
          </p>
        </div>

        {/* Dynamic Filters */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <select
            value={filterSemester}
            onChange={(e) => setFilterSemester(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs focus:border-blue-600 focus:outline-hidden"
          >
            <option value="Ganjil">Semester Ganjil</option>
            <option value="Genap">Semester Genap</option>
          </select>

          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs focus:border-blue-600 focus:outline-hidden"
          >
            <option value="all">Semua Jenjang Kelas</option>
            {[1, 2, 3, 4, 5, 6].map((l) => (
              <option key={l} value={l.toString()}>
                Kelas {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main KPI Stat Grid (Single-elevation, tabular numbers) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Total Kegiatan</span>
          <span className="text-2xl font-bold text-slate-900 tabular-nums">{totalAssessments}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Sem. {filterSemester}</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Tautan Soal Aktif</span>
          <span className="text-2xl font-bold text-blue-700 tabular-nums">{activeLinks}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Dapat diakses</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Sedang Berlangsung</span>
          <span className="text-2xl font-bold text-emerald-700 tabular-nums">{ongoingCount}</span>
          <span className="text-[10px] text-emerald-600 block mt-0.5">Dalam jadwal ujian</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Akan Datang</span>
          <span className="text-2xl font-bold text-slate-700 tabular-nums">{upcomingCount}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Terjadwal</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Telah Selesai</span>
          <span className="text-2xl font-bold text-slate-700 tabular-nums">{completedCount}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Tahap penilaian</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Draf Asesmen</span>
          <span className="text-2xl font-bold text-amber-700 tabular-nums">{draftCount}</span>
          <span className="text-[10px] text-amber-600 block mt-0.5">Belum dipublikasikan</span>
        </div>
      </div>

      {/* Madrasah Master Stats Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 tabular-nums">{students.length}</span>
              <span className="text-xs text-slate-500 block">Peserta Didik Terdaftar</span>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('students')}
            className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1 shadow-2xs"
            title="Buka Data Siswa & Impor File Excel"
          >
            <span>Input & Impor Excel</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <User className="h-5 w-5" />
          </div>
          <div>
            <span className="text-base font-bold text-slate-900 tabular-nums">{teachers.length}</span>
            <span className="text-xs text-slate-500 block">Guru Pengampu & Wali Kelas</span>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <span className="text-base font-bold text-slate-900 tabular-nums">{subjects.length}</span>
            <span className="text-xs text-slate-500 block">Mata Pelajaran Kurikulum MI</span>
          </div>
        </div>
      </div>

      {/* Checklist Fitur: Jenis Asesmen Aktif Pelaksanaan Asesmen */}
      <ActiveCategoriesChecklist />

      {/* 6 Kategori Asesmen Wajib - Visual Distribution Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Distribusi Enam Kategori Asesmen Wajib
          </h2>
          <span className="text-xs text-slate-500">Klik kategori untuk melihat rincian asesmen</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {categoryCounts.map((cat) => {
            const isActive = isCategoryActive(cat.id as AssessmentCategoryType);

            return (
              <div
                key={cat.id}
                onClick={() => {
                  setSelectedCategoryFilter(cat.id as AssessmentCategoryType);
                  setCurrentView(`cat-${cat.id}`);
                }}
                className={`cursor-pointer rounded-xl border p-4 shadow-xs transition-all ${
                  isActive
                    ? 'border-slate-200 bg-white hover:border-blue-400 hover:shadow-sm'
                    : 'border-slate-200 bg-slate-50/70 opacity-75 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {/* Kotak Checklist Status */}
                    <div
                      className={`flex h-4.5 w-4.5 items-center justify-center rounded border ${
                        isActive
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                      title={isActive ? 'Jenis Asesmen Aktif Pelaksanaan' : 'Jenis Asesmen Non-Aktif'}
                    >
                      {isActive && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>

                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: cat.accentColor }}
                      />
                      {cat.title}
                    </span>
                  </div>

                  <span className="text-base font-extrabold text-slate-900 tabular-nums">
                    {cat.count}
                  </span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  {isActive ? (
                    <span className="font-semibold text-emerald-700 flex items-center gap-1">
                      <span>✓</span> Aktif Pelaksanaan
                    </span>
                  ) : (
                    <span className="text-slate-400">Non-Aktif</span>
                  )}
                  <span className="font-semibold text-blue-700 flex items-center gap-1">
                    <span>Lihat Asesmen</span>
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Section: Upcoming Schedule & Level Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Agenda Mendatang & Tenggat Waktu (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span>Agenda Asesmen Mendatang & Berjalan</span>
            </h2>
            <button
              onClick={() => setCurrentView('calendar')}
              className="text-xs font-semibold text-blue-700 hover:underline"
            >
              Lihat Kalender Lengkap
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="divide-y divide-slate-100">
              {upcomingAssessments.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Tidak ada agenda asesmen dalam waktu dekat.
                </div>
              ) : (
                upcomingAssessments.map((asm) => (
                  <div key={asm.id} className="p-4 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                          Kelas {asm.level} ({asm.rombelTargets.join(', ')})
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {asm.platform}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{asm.title}</h4>
                      <p className="text-[11px] text-slate-500">
                        {getSubjectName(asm.subjectId)} · Guru: {asm.teacherName}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-semibold text-slate-800 tabular-nums">
                        {new Date(asm.startTime).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </div>
                      <div className="text-[11px] text-slate-400 tabular-nums">
                        {new Date(asm.startTime).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        WITA
                      </div>
                      <a
                        href={asm.assessmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:underline mt-1"
                      >
                        <span>Buka Soal</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Distribusi Kelas & Pengumuman (1 col) */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 flex items-center justify-between">
              <span>Distribusi Kegiatan per Jenjang</span>
              <span className="text-[10px] font-normal text-slate-400">Kelas 1 - 6</span>
            </h3>

            <div className="space-y-2">
              {levelCounts.map((item) => (
                <div key={item.level} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-slate-700">Kelas {item.level} MI</span>
                    <span className="font-semibold text-slate-900 tabular-nums">{item.count} kegiatan</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{
                        width: `${totalAssessments > 0 ? (item.count / totalAssessments) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Announcement Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900">Pengumuman Terkini</h3>
              <button
                onClick={() => setCurrentView('announcements')}
                className="text-[11px] text-blue-700 font-semibold hover:underline"
              >
                Semua
              </button>
            </div>

            <div className="space-y-2.5">
              {announcements.slice(0, 2).map((a) => (
                <div key={a.id} className="rounded-lg bg-slate-50 p-2.5 border border-slate-100 text-xs">
                  <span className="font-bold text-slate-800 block leading-tight">{a.title}</span>
                  <p className="mt-1 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {a.content}
                  </p>
                  <span className="mt-1 block text-[10px] text-slate-400">{a.authorName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
