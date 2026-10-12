import React from 'react';
import {
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  CheckSquare,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  HelpCircle,
  Home,
  Layers,
  LayoutDashboard,
  Link2,
  Megaphone,
  School,
  Settings,
  ShieldCheck,
  User,
  Users,
  LogOut,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AssessmentCategoryType } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentUser, currentView, setCurrentView, setSelectedCategoryFilter, settings, logout } = useApp();

  const isStudent = currentUser.role === 'siswa';
  const isSuperAdmin = currentUser.role === 'super_admin';
  const isTeacherOrAdmin = currentUser.role === 'guru' || currentUser.role === 'super_admin' || currentUser.role === 'wali_kelas';

  const navigateToCategory = (catId: AssessmentCategoryType) => {
    setSelectedCategoryFilter(catId);
    setCurrentView(`cat-${catId}`);
    if (window.innerWidth < 1024) onClose();
  };

  const navigateTo = (view: string) => {
    setCurrentView(view);
    if (window.innerWidth < 1024) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl lg:shadow-none' : '-translate-x-full'
        }`}
      >
        {/* Madrasah Brand Header */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5 bg-slate-900 text-white">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white font-black text-sm">
            MI
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="font-bold text-sm tracking-tight truncate leading-tight">
              {settings.schoolName}
            </span>
            <span className="text-[11px] text-slate-300 truncate">
              {settings.subdistrict}, Paser
            </span>
          </div>
        </div>

        {/* Scrollable Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* STUDENT NAVIGATION */}
          {isStudent ? (
            <div className="space-y-1">
              <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Menu Peserta Didik
              </div>
              <button
                onClick={() => navigateTo('student-dashboard')}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
                  currentView === 'student-dashboard'
                    ? 'bg-blue-50 text-blue-800 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Home className="h-4 w-4 text-blue-600" />
                <span>Asesmen Saya</span>
              </button>
              <button
                onClick={() => navigateTo('student-history')}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
                  currentView === 'student-history'
                    ? 'bg-blue-50 text-blue-800 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <CheckSquare className="h-4 w-4 text-emerald-600" />
                <span>Riwayat & Nilai Pribadi</span>
              </button>
              <button
                onClick={() => navigateTo('announcements')}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
                  currentView === 'announcements'
                    ? 'bg-blue-50 text-blue-800 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Megaphone className="h-4 w-4 text-amber-600" />
                <span>Pengumuman Kelas</span>
              </button>
              <button
                onClick={() => navigateTo('help')}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
                  currentView === 'help'
                    ? 'bg-blue-50 text-blue-800 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <HelpCircle className="h-4 w-4 text-purple-600" />
                <span>Petunjuk Ujian</span>
              </button>
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Keluar Akun Siswa</span>
              </button>
            </div>
          ) : (
            <>
              {/* SECTION: UTAMA */}
              <div className="space-y-1">
                <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Utama
                </div>
                <button
                  onClick={() => navigateTo('dashboard')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    currentView === 'dashboard'
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard Ringkasan</span>
                </button>
                <button
                  onClick={() => navigateTo('assessment-links')}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    currentView === 'assessment-links'
                      ? 'bg-blue-50 text-blue-800 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Link2 className="h-4 w-4 text-blue-600" />
                    <span>Bank Tautan Asesmen</span>
                  </div>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                    Inti
                  </span>
                </button>
                <button
                  onClick={() => navigateTo('calendar')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    currentView === 'calendar'
                      ? 'bg-blue-50 text-blue-800 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span>Kalender Asesmen</span>
                </button>
              </div>

              {/* SECTION: 6 KATEGORI ASESMEN WAJIB */}
              <div className="space-y-1">
                <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  6 Kategori Asesmen
                </div>
                <button
                  onClick={() => navigateToCategory('formatif')}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    currentView === 'cat-formatif'
                      ? 'bg-sky-50 text-sky-800 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-sky-500" />
                    <span>Asesmen Formatif</span>
                  </div>
                  <ChevronRight className="h-3 w-3 text-slate-400" />
                </button>

                <button
                  onClick={() => navigateToCategory('sumatif_akhir_bab')}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    currentView === 'cat-sumatif_akhir_bab'
                      ? 'bg-emerald-50 text-emerald-800 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Sumatif Akhir Bab</span>
                  </div>
                  <ChevronRight className="h-3 w-3 text-slate-400" />
                </button>

                <button
                  onClick={() => navigateToCategory('sas')}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    currentView === 'cat-sas'
                      ? 'bg-indigo-50 text-indigo-800 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                    <span>Sumatif Akhir Semester (SAS)</span>
                  </div>
                  <ChevronRight className="h-3 w-3 text-slate-400" />
                </button>

                <button
                  onClick={() => navigateToCategory('sat')}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    currentView === 'cat-sat'
                      ? 'bg-violet-50 text-violet-800 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-violet-500" />
                    <span>Sumatif Akhir Tahun (SAT)</span>
                  </div>
                  <ChevronRight className="h-3 w-3 text-slate-400" />
                </button>

                <button
                  onClick={() => navigateToCategory('try_out')}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    currentView === 'cat-try_out'
                      ? 'bg-amber-50 text-amber-800 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span>Try Out Asesmen</span>
                  </div>
                  <ChevronRight className="h-3 w-3 text-slate-400" />
                </button>

                <button
                  onClick={() => navigateToCategory('tka')}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    currentView === 'cat-tka'
                      ? 'bg-rose-50 text-rose-800 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    <span>Tes Kemampuan Akademik (TKA)</span>
                  </div>
                  <ChevronRight className="h-3 w-3 text-slate-400" />
                </button>
              </div>

              {/* SECTION: NILAI & LAPORAN */}
              <div className="space-y-1">
                <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Hasil & Pelaporan
                </div>
                <button
                  onClick={() => navigateTo('scores')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    currentView === 'scores'
                      ? 'bg-blue-50 text-blue-800 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                  <span>Manajemen Nilai & Impor</span>
                </button>
                <button
                  onClick={() => navigateTo('reports')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    currentView === 'reports'
                      ? 'bg-blue-50 text-blue-800 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  <span>Rekapitulasi & Laporan</span>
                </button>
                <button
                  onClick={() => navigateTo('announcements')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    currentView === 'announcements'
                      ? 'bg-blue-50 text-blue-800 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Megaphone className="h-4 w-4 text-amber-600" />
                  <span>Pengumuman</span>
                </button>
              </div>

              {/* SECTION: DATA MASTER */}
              <div className="space-y-1">
                <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Data Master Madrasah
                </div>
                <button
                  onClick={() => navigateTo('students')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    currentView === 'students'
                      ? 'bg-blue-50 text-blue-800 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <GraduationCap className="h-4 w-4 text-slate-500" />
                  <span>Data Peserta Didik</span>
                </button>

                {isSuperAdmin && (
                  <button
                    onClick={() => navigateTo('teachers')}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                      currentView === 'teachers'
                        ? 'bg-blue-50 text-blue-800 font-semibold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <User className="h-4 w-4 text-slate-500" />
                    <span>Data Guru</span>
                  </button>
                )}

                <button
                  onClick={() => navigateTo('classes')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    currentView === 'classes'
                      ? 'bg-blue-50 text-blue-800 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <School className="h-4 w-4 text-slate-500" />
                  <span>Data Kelas & Rombel</span>
                </button>

                <button
                  onClick={() => navigateTo('subjects')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    currentView === 'subjects'
                      ? 'bg-blue-50 text-blue-800 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <BookOpen className="h-4 w-4 text-slate-500" />
                  <span>Mata Pelajaran & KKTP</span>
                </button>
              </div>

              {/* SECTION: SISTEM & PENGATURAN */}
              <div className="space-y-1">
                <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Sistem & Administrasi
                </div>
                {isSuperAdmin && (
                  <>
                    <button
                      onClick={() => navigateTo('users')}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                        currentView === 'users'
                          ? 'bg-blue-50 text-blue-800 font-semibold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Users className="h-4 w-4 text-slate-500" />
                      <span>Manajemen Pengguna (RBAC)</span>
                    </button>
                    <button
                      onClick={() => navigateTo('settings')}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                        currentView === 'settings'
                          ? 'bg-blue-50 text-blue-800 font-semibold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Settings className="h-4 w-4 text-slate-500" />
                      <span>Pengaturan Lembaga</span>
                    </button>
                    <button
                      onClick={() => navigateTo('audit-logs')}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                        currentView === 'audit-logs'
                          ? 'bg-blue-50 text-blue-800 font-semibold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <ShieldCheck className="h-4 w-4 text-slate-500" />
                      <span>Audit Log Keamanan</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => navigateTo('profile')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    currentView === 'profile'
                      ? 'bg-blue-50 text-blue-800 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <User className="h-4 w-4 text-slate-500" />
                  <span>Profil Akun</span>
                </button>
                <button
                  onClick={() => navigateTo('help')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    currentView === 'help'
                      ? 'bg-blue-50 text-blue-800 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <HelpCircle className="h-4 w-4 text-slate-500" />
                  <span>Pusat Bantuan & Panduan</span>
                </button>
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Keluar Sistem (Logout)</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Institution Info Footer */}
        <div className="border-t border-slate-200 p-3 bg-slate-50">
          <div className="text-[11px] text-slate-500 leading-tight">
            <span className="font-semibold text-slate-700 block">MIN 1 Paser · 2026</span>
            Kepala: {settings.headmasterName}
          </div>
        </div>
      </aside>
    </>
  );
};
