import React, { useState } from 'react';
import {
  Bell,
  CheckCircle,
  HelpCircle,
  LogOut,
  ShieldAlert,
  UserCheck,
  UserCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

export const Header: React.FC<{ onToggleSidebar: () => void; isSidebarOpen: boolean }> = ({
  onToggleSidebar,
}) => {
  const { currentUser, switchRole, settings, notifications, markNotificationRead, setCurrentView, logout } =
    useApp();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.isRead);

  const roleLabels: Record<UserRole, { label: string; bg: string; text: string }> = {
    super_admin: { label: 'Super Admin', bg: 'bg-slate-100', text: 'text-slate-800 font-semibold' },
    guru: { label: 'Guru Pengampu', bg: 'bg-blue-50', text: 'text-blue-800 font-medium' },
    wali_kelas: { label: 'Wali Kelas', bg: 'bg-emerald-50', text: 'text-emerald-800 font-medium' },
    siswa: { label: 'Peserta Didik', bg: 'bg-amber-50', text: 'text-amber-800 font-medium' },
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6 shadow-xs">
      {/* Zone 1: Brand & Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigasi"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base md:text-lg tracking-tight text-slate-900 whitespace-nowrap">
              {settings.schoolName}
            </span>
            <span className="hidden sm:inline-block text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
              Portal Asesmen Digital
            </span>
          </div>
          <span className="hidden md:inline-block text-xs text-slate-500">
            Tahun Pelajaran {settings.academicYear} · Semester {settings.activeSemester} · WITA (UTC+8)
          </span>
        </div>
      </div>

      {/* Zone 2: Fast Navigation / Quick Help */}
      <div className="hidden lg:flex items-center gap-6 text-sm text-slate-600">
        <button
          onClick={() => setCurrentView(currentUser.role === 'siswa' ? 'student-dashboard' : 'dashboard')}
          className="hover:text-blue-700 font-medium transition-colors"
        >
          Beranda
        </button>
        {currentUser.role !== 'siswa' && (
          <>
            <button
              onClick={() => setCurrentView('assessment-links')}
              className="hover:text-blue-700 font-medium transition-colors"
            >
              Bank Tautan
            </button>
            <button
              onClick={() => setCurrentView('calendar')}
              className="hover:text-blue-700 font-medium transition-colors"
            >
              Kalender Asesmen
            </button>
            <button
              onClick={() => setCurrentView('reports')}
              className="hover:text-blue-700 font-medium transition-colors"
            >
              Rekap & Laporan
            </button>
          </>
        )}
        <button
          onClick={() => setCurrentView('help')}
          className="flex items-center gap-1.5 hover:text-blue-700 font-medium transition-colors"
        >
          <HelpCircle className="h-4 w-4" />
          <span>Panduan</span>
        </button>
      </div>

      {/* Zone 3: Interactive Affordances (Role switcher, Notification, Profile) */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            aria-label="Notifikasi sistem"
            className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Bell className="h-4 w-4" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white tabular-nums">
                {unreadNotifs.length}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-900">Notifikasi Aplikasi</span>
                <span className="text-[11px] text-slate-500">{unreadNotifs.length} belum dibaca</span>
              </div>
              <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="py-4 text-center text-xs text-slate-400">Tidak ada notifikasi saat ini.</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`cursor-pointer rounded-lg p-2.5 text-xs transition-colors ${
                        n.isRead ? 'bg-slate-50 text-slate-600' : 'bg-blue-50/70 text-slate-900 font-medium'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">{n.title}</span>
                        {!n.isRead && <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />}
                      </div>
                      <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Role Demo Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            title="Klik untuk simulasi peran lain"
          >
            <UserCheck className="h-4 w-4 text-blue-700" />
            <span className="hidden sm:inline">Peran:</span>
            <span className={roleLabels[currentUser.role].text}>
              {roleLabels[currentUser.role].label}
            </span>
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50">
              <div className="px-3 py-2 text-xs text-slate-500 border-b border-slate-100">
                <span className="font-semibold text-slate-800 block">Simulasi Pengujian Hak Akses</span>
                Pilih peran untuk menguji antarmuka sesuai RBAC
              </div>
              <div className="py-1">
                {(['super_admin', 'guru', 'wali_kelas', 'siswa'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      switchRole(r);
                      setShowRoleMenu(false);
                    }}
                    className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs rounded-lg transition-colors ${
                      currentUser.role === r
                        ? 'bg-blue-50 text-blue-800 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{roleLabels[r].label}</span>
                    {currentUser.role === r && <CheckCircle className="h-3.5 w-3.5 text-blue-700" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Mini Card */}
        <div
          onClick={() => setCurrentView('profile')}
          className="flex cursor-pointer items-center gap-2 rounded-lg p-1.5 hover:bg-slate-50 transition-colors"
          title="Buka profil"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white font-semibold text-xs">
            {currentUser.fullName.charAt(0)}
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[140px]">
              {currentUser.fullName}
            </span>
            <span className="text-[10px] text-slate-500">{currentUser.nipOrNis || currentUser.username}</span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          aria-label="Keluar sesi"
          title="Keluar / Ganti Akun"
          className="flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
};
