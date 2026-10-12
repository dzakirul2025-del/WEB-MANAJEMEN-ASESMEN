import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { LinkBankView } from './components/links/LinkBankView';
import { AssessmentList } from './components/assessments/AssessmentList';
import { StudentPortal } from './components/student/StudentPortal';
import { AssessmentCalendarView } from './components/calendar/AssessmentCalendarView';
import { ScoreManagementView } from './components/scores/ScoreManagementView';
import { ReportsView } from './components/reports/ReportsView';
import { StudentsView } from './components/master/StudentsView';
import { TeachersView } from './components/master/TeachersView';
import { ClassesView } from './components/master/ClassesView';
import { SubjectsView } from './components/master/SubjectsView';
import { UsersView } from './components/users/UsersView';
import { SettingsView } from './components/settings/SettingsView';
import { AuditLogsView } from './components/audit/AuditLogsView';
import { AnnouncementsView } from './components/announcements/AnnouncementsView';
import { ProfileView } from './components/profile/ProfileView';
import { HelpCenterView } from './components/help/HelpCenterView';
import { LoginView } from './components/auth/LoginView';

const MainLayout: React.FC = () => {
  const { currentView, currentUser, settings, isAuthenticated } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <LoginView />;
  }

  const renderView = () => {
    // If student, route to StudentPortal by default unless help/profile/announcements
    if (currentUser.role === 'siswa') {
      if (currentView === 'announcements') return <AnnouncementsView />;
      if (currentView === 'profile') return <ProfileView />;
      if (currentView === 'help') return <HelpCenterView />;
      return <StudentPortal />;
    }

    switch (currentView) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'student-dashboard':
      case 'student-history':
        return <StudentPortal />;
      case 'assessment-links':
        return <LinkBankView />;
      case 'cat-formatif':
        return <AssessmentList forcedCategory="formatif" />;
      case 'cat-sumatif_akhir_bab':
        return <AssessmentList forcedCategory="sumatif_akhir_bab" />;
      case 'cat-sas':
        return <AssessmentList forcedCategory="sas" />;
      case 'cat-sat':
        return <AssessmentList forcedCategory="sat" />;
      case 'cat-try_out':
        return <AssessmentList forcedCategory="try_out" />;
      case 'cat-tka':
        return <AssessmentList forcedCategory="tka" />;
      case 'assessments':
        return <AssessmentList />;
      case 'calendar':
        return <AssessmentCalendarView />;
      case 'scores':
        return <ScoreManagementView />;
      case 'reports':
        return <ReportsView />;
      case 'students':
        return <StudentsView />;
      case 'teachers':
        return <TeachersView />;
      case 'classes':
        return <ClassesView />;
      case 'subjects':
        return <SubjectsView />;
      case 'users':
        return <UsersView />;
      case 'settings':
        return <SettingsView />;
      case 'audit-logs':
        return <AuditLogsView />;
      case 'announcements':
        return <AnnouncementsView />;
      case 'profile':
        return <ProfileView />;
      case 'help':
        return <HelpCenterView />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Viewport Container */}
      <div className="flex flex-1 flex-col min-w-0">
        <Header
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderView()}
        </main>

        {/* Minimal Footer */}
        <footer className="no-print border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
            <span>
              © {new Date().getFullYear()} {settings.schoolName} · Portal Asesmen Digital Terpadu
            </span>
            <span className="text-[11px] text-slate-400">
              Dikembangkan oleh: {settings.developerName} · Kepala Madrasah: {settings.headmasterName}
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
