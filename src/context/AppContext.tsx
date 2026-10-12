import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  ASSESSMENT_CATEGORIES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_ASSESSMENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_CLASSES,
  INITIAL_INSTITUTION_SETTINGS,
  INITIAL_SCORES,
  INITIAL_STUDENTS,
  INITIAL_SUBJECTS,
  INITIAL_TEACHERS,
  INITIAL_USERS,
} from '../data/seedData';
import {
  Announcement,
  Assessment,
  AssessmentCategoryType,
  AuditLog,
  InstitutionSettings,
  NotificationItem,
  SchoolClass,
  Student,
  StudentScore,
  Subject,
  Teacher,
  UserProfile,
  UserRole,
} from '../types';

interface AppContextType {
  // Current user & authentication
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  switchRole: (role: UserRole) => void;
  users: UserProfile[];
  addUser: (user: Omit<UserProfile, 'id' | 'createdAt'>) => void;
  updateUser: (user: UserProfile) => void;
  deleteUser: (id: string) => void;

  // Authentication Status & Login Handlers
  isAuthenticated: boolean;
  loginStudent: (fullName: string, attendanceNumber: number, rombel?: string) => { success: boolean; message?: string };
  loginTeacher: (fullName: string, nip: string) => { success: boolean; message?: string };
  loginSuperAdmin: (user: string, password: string) => { success: boolean; message?: string };
  logout: () => void;

  // Active Assessment Categories Checklist
  activeCategories: AssessmentCategoryType[];
  toggleAssessmentCategoryActive: (categoryId: AssessmentCategoryType) => void;
  isCategoryActive: (categoryId: AssessmentCategoryType) => boolean;

  // Institution settings
  settings: InstitutionSettings;
  updateSettings: (newSettings: Partial<InstitutionSettings>) => void;

  // Master Data
  students: Student[];
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;

  teachers: Teacher[];
  addTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  updateTeacher: (teacher: Teacher) => void;
  deleteTeacher: (id: string) => void;

  classes: SchoolClass[];
  addClass: (cls: Omit<SchoolClass, 'id'>) => void;
  updateClass: (cls: SchoolClass) => void;
  deleteClass: (id: string) => void;

  subjects: Subject[];
  addSubject: (sub: Omit<Subject, 'id'>) => void;
  updateSubject: (sub: Subject) => void;
  deleteSubject: (id: string) => void;

  // Assessments & Links
  assessments: Assessment[];
  addAssessment: (assessment: Omit<Assessment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAssessment: (assessment: Assessment) => void;
  deleteAssessment: (id: string) => void;
  duplicateAssessment: (id: string) => void;
  toggleScorePublication: (assessmentId: string) => void;

  // Scores
  scores: StudentScore[];
  updateScore: (score: StudentScore) => void;
  saveMultipleScores: (assessmentId: string, updatedScores: StudentScore[]) => void;
  importScoresBatch: (
    assessmentId: string,
    importedList: Array<{
      nis: string;
      name: string;
      score: number;
      rawScore?: number;
      attendanceStatus?: 'hadir' | 'sakit' | 'izin' | 'tanpa_keterangan' | 'belum_mengerjakan';
      notes?: string;
    }>
  ) => { success: number; failed: number; errors: string[] };

  // Announcements & Notifications
  announcements: Announcement[];
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt'>) => void;
  deleteAnnouncement: (id: string) => void;

  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;

  // Audit Logs
  auditLogs: AuditLog[];
  logAction: (action: string, details: string) => void;

  // UI Navigation
  currentView: string;
  setCurrentView: (view: string) => void;
  selectedCategoryFilter: AssessmentCategoryType | 'all';
  setSelectedCategoryFilter: (category: AssessmentCategoryType | 'all') => void;

  // Backup & Reset
  backupDatabase: () => void;
  restoreDatabase: (jsonContent: string) => boolean;
  resetToDefault: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'min1paser_current_user',
  USERS_LIST: 'min1paser_users_list',
  SETTINGS: 'min1paser_settings',
  STUDENTS: 'min1paser_students',
  TEACHERS: 'min1paser_teachers',
  CLASSES: 'min1paser_classes',
  SUBJECTS: 'min1paser_subjects',
  ASSESSMENTS: 'min1paser_assessments',
  SCORES: 'min1paser_scores',
  ANNOUNCEMENTS: 'min1paser_announcements',
  AUDIT_LOGS: 'min1paser_audit_logs',
  NOTIFICATIONS: 'min1paser_notifications',
};

function getStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (e) {
    console.error(`Failed to read ${key} from localStorage`, e);
    return fallback;
  }
}

function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to write ${key} to localStorage`, e);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    getStorage<boolean>('min1paser_is_authenticated', true)
  );

  const [users, setUsers] = useState<UserProfile[]>(() =>
    getStorage<UserProfile[]>(STORAGE_KEYS.USERS_LIST, INITIAL_USERS)
  );

  const [currentUser, setCurrentUser] = useState<UserProfile>(() =>
    getStorage<UserProfile>(STORAGE_KEYS.USER, INITIAL_USERS[0])
  );

  const [settings, setSettings] = useState<InstitutionSettings>(() =>
    getStorage<InstitutionSettings>(STORAGE_KEYS.SETTINGS, INITIAL_INSTITUTION_SETTINGS)
  );

  const [activeCategories, setActiveCategories] = useState<AssessmentCategoryType[]>(() => {
    return getStorage<AssessmentCategoryType[]>(
      'min1paser_active_categories',
      INITIAL_INSTITUTION_SETTINGS.activeAssessmentCategories || ['formatif', 'sumatif_akhir_bab', 'sas', 'try_out', 'tka']
    );
  });

  const [students, setStudents] = useState<Student[]>(() =>
    getStorage<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS)
  );

  const [teachers, setTeachers] = useState<Teacher[]>(() =>
    getStorage<Teacher[]>(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS)
  );

  const [classes, setClasses] = useState<SchoolClass[]>(() =>
    getStorage<SchoolClass[]>(STORAGE_KEYS.CLASSES, INITIAL_CLASSES)
  );

  const [subjects, setSubjects] = useState<Subject[]>(() =>
    getStorage<Subject[]>(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS)
  );

  const [assessments, setAssessments] = useState<Assessment[]>(() =>
    getStorage<Assessment[]>(STORAGE_KEYS.ASSESSMENTS, INITIAL_ASSESSMENTS)
  );

  const [scores, setScores] = useState<StudentScore[]>(() =>
    getStorage<StudentScore[]>(STORAGE_KEYS.SCORES, INITIAL_SCORES)
  );

  const [announcements, setAnnouncements] = useState<Announcement[]>(() =>
    getStorage<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS)
  );

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() =>
    getStorage<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS)
  );

  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    getStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, [
      {
        id: 'notif-1',
        title: 'Asesmen Formatif Matematika Aktif',
        message: 'Formatif Matematika Bab 1 Kelas 6 telah dibuka untuk dikerjakan siswa.',
        category: 'jadwal',
        targetRoles: ['siswa', 'guru', 'wali_kelas'],
        targetClass: '6A',
        createdAt: new Date().toISOString(),
        isRead: false,
      },
      {
        id: 'notif-2',
        title: 'Nilai Formatif Dipublikasikan',
        message: 'Guru Dzakirul Husni telah merilis nilai Formatif Bab 1.',
        category: 'nilai',
        targetRoles: ['siswa', 'wali_kelas'],
        targetClass: '6A',
        createdAt: new Date().toISOString(),
        isRead: false,
      },
    ])
  );

  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<AssessmentCategoryType | 'all'>('all');

  // Persistence side-effects
  useEffect(() => setStorage(STORAGE_KEYS.USER, currentUser), [currentUser]);
  useEffect(() => setStorage(STORAGE_KEYS.USERS_LIST, users), [users]);
  useEffect(() => setStorage(STORAGE_KEYS.SETTINGS, settings), [settings]);
  useEffect(() => setStorage(STORAGE_KEYS.STUDENTS, students), [students]);
  useEffect(() => setStorage(STORAGE_KEYS.TEACHERS, teachers), [teachers]);
  useEffect(() => setStorage(STORAGE_KEYS.CLASSES, classes), [classes]);
  useEffect(() => setStorage(STORAGE_KEYS.SUBJECTS, subjects), [subjects]);
  useEffect(() => setStorage(STORAGE_KEYS.ASSESSMENTS, assessments), [assessments]);
  useEffect(() => setStorage(STORAGE_KEYS.SCORES, scores), [scores]);
  useEffect(() => setStorage(STORAGE_KEYS.ANNOUNCEMENTS, announcements), [announcements]);
  useEffect(() => setStorage(STORAGE_KEYS.AUDIT_LOGS, auditLogs), [auditLogs]);
  useEffect(() => setStorage(STORAGE_KEYS.NOTIFICATIONS, notifications), [notifications]);
  useEffect(() => setStorage('min1paser_is_authenticated', isAuthenticated), [isAuthenticated]);
  useEffect(() => setStorage('min1paser_active_categories', activeCategories), [activeCategories]);

  const toggleAssessmentCategoryActive = (categoryId: AssessmentCategoryType) => {
    setActiveCategories((prev) => {
      const isCurrentlyActive = prev.includes(categoryId);
      let updated: AssessmentCategoryType[];
      if (isCurrentlyActive) {
        if (prev.length <= 1) {
          alert('Minimal harus ada 1 jenis asesmen yang aktif.');
          return prev;
        }
        updated = prev.filter((c) => c !== categoryId);
      } else {
        updated = [...prev, categoryId];
      }

      const catMeta = ASSESSMENT_CATEGORIES.find((c) => c.id === categoryId);
      logAction(
        isCurrentlyActive ? 'Nonaktifkan Jenis Asesmen' : 'Aktivasi Jenis Asesmen (Diceklis)',
        `Jenis asesmen [${catMeta?.title || categoryId}] diubah statusnya menjadi: ${!isCurrentlyActive ? 'AKTIF (Diceklis)' : 'NON-AKTIF'}.`
      );

      setSettings((s) => ({ ...s, activeAssessmentCategories: updated }));
      return updated;
    });
  };

  const isCategoryActive = (categoryId: AssessmentCategoryType) => {
    return activeCategories.includes(categoryId);
  };

  // LOGIN HANDLERS
  const loginStudent = (
    fullName: string,
    attendanceNumber: number,
    rombel?: string
  ): { success: boolean; message?: string } => {
    const cleanName = fullName.trim().toLowerCase();
    
    // First try strict match with rombel if specified
    let matched = students.find((s) => {
      const matchName =
        s.fullName.toLowerCase() === cleanName ||
        s.fullName.toLowerCase().includes(cleanName) ||
        cleanName.includes(s.fullName.toLowerCase());
      const matchNumber = s.attendanceNumber === attendanceNumber;
      const matchRombel = !rombel || rombel === 'all' || s.rombel === rombel;
      return matchName && matchNumber && matchRombel;
    });

    // If not found with rombel filter, search across all rombel by name & number
    if (!matched) {
      matched = students.find((s) => {
        const matchName =
          s.fullName.toLowerCase() === cleanName ||
          s.fullName.toLowerCase().includes(cleanName) ||
          cleanName.includes(s.fullName.toLowerCase());
        const matchNumber = s.attendanceNumber === attendanceNumber;
        return matchName && matchNumber;
      });
    }

    if (!matched) {
      return {
        success: false,
        message: `Data siswa tidak ditemukan. Pastikan Nama Lengkap dan Nomor Absen (${attendanceNumber}) cocok dengan data peserta didik MIN 1 Paser.`,
      };
    }

    const studentProfile: UserProfile = {
      id: `usr-std-${matched.id}`,
      username: matched.nis,
      fullName: matched.fullName,
      email: `${matched.nis}@siswa.min1paser.sch.id`,
      role: 'siswa',
      nipOrNis: matched.nis,
      assignedClassId: matched.classId,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    setCurrentUser(studentProfile);
    setIsAuthenticated(true);
    setCurrentView('student-dashboard');
    logAction('Login Siswa Berhasil', `Peserta didik ${matched.fullName} (Absen ${attendanceNumber}, Kelas ${matched.rombel}) berhasil masuk.`);
    return { success: true };
  };

  const loginTeacher = (
    teacherName: string,
    nip: string
  ): { success: boolean; message?: string } => {
    const cleanName = teacherName.trim().toLowerCase();
    const cleanNip = nip.trim().replace(/\s+/g, '');

    const matched = teachers.find((t) => {
      const matchName =
        t.fullName.toLowerCase() === cleanName ||
        t.fullName.toLowerCase().includes(cleanName) ||
        cleanName.includes(t.fullName.toLowerCase());
      const matchNip = t.nip && t.nip.trim().replace(/\s+/g, '') === cleanNip;
      return matchName && matchNip;
    });

    if (!matched) {
      return {
        success: false,
        message: 'Nama Guru atau NIP tidak cocok dengan data tenaga pendidik MIN 1 Paser.',
      };
    }

    const teacherProfile: UserProfile = {
      id: `usr-tch-${matched.id}`,
      username: matched.email.split('@')[0],
      fullName: matched.fullName,
      email: matched.email,
      role: matched.homeroomClassId ? 'wali_kelas' : 'guru',
      nipOrNis: matched.nip,
      assignedClassId: matched.homeroomClassId,
      assignedSubjectIds: matched.subjectIds,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    setCurrentUser(teacherProfile);
    setIsAuthenticated(true);
    setCurrentView('dashboard');
    logAction('Login Guru Berhasil', `Guru ${matched.fullName} (NIP: ${matched.nip}) berhasil masuk.`);
    return { success: true };
  };

  const loginSuperAdmin = (
    user: string,
    password: string
  ): { success: boolean; message?: string } => {
    const cleanUser = user.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (cleanUser === 'dzakirul' && cleanPassword === '123456') {
      const adminUser: UserProfile = {
        id: 'usr-admin-dzakirul',
        username: 'Dzakirul',
        fullName: 'Dzakirul Husni, S.Pd. (Super Admin)',
        email: 'dzakirul@min1paser.sch.id',
        role: 'super_admin',
        nipOrNis: '198902142014031002',
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      setCurrentUser(adminUser);
      setIsAuthenticated(true);
      setCurrentView('dashboard');
      logAction('Login Super Admin Berhasil', 'Super Admin (Dzakirul) berhasil masuk ke sistem portal.');
      return { success: true };
    }

    return {
      success: false,
      message: 'Kredensial Super Admin salah. Harap periksa user dan password (user: Dzakirul, password: 123456).',
    };
  };

  const logout = () => {
    setIsAuthenticated(false);
    logAction('Pengguna Keluar (Logout)', `Pengguna ${currentUser.fullName} keluar dari sesi.`);
  };

  const logAction = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 199)]);
  };

  const switchRole = (role: UserRole) => {
    const targetUser = users.find((u) => u.role === role) || {
      id: `usr-${role}`,
      username: `${role}_demo`,
      fullName: `Akun Demo ${role.replace('_', ' ').toUpperCase()}`,
      email: `${role}@min1paser.sch.id`,
      role,
      assignedClassId: role === 'siswa' ? 'cls-6a' : undefined,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(targetUser);
    logAction('Pergantian Peran Aktif', `Beralih ke akun peran ${role} (${targetUser.fullName}).`);
    if (role === 'siswa') {
      setCurrentView('student-dashboard');
    } else if (currentView === 'student-dashboard') {
      setCurrentView('dashboard');
    }
  };

  const updateSettings = (newSettings: Partial<InstitutionSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      logAction('Pembaruan Pengaturan Lembaga', 'Memperbarui identitas dan pengaturan madrasah.');
      return updated;
    });
  };

  // User management
  const addUser = (newUser: Omit<UserProfile, 'id' | 'createdAt'>) => {
    const created: UserProfile = {
      ...newUser,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [created, ...prev]);
    logAction('Penambahan Pengguna Baru', `Menambahkan pengguna: ${created.fullName} (${created.role})`);
  };

  const updateUser = (updated: UserProfile) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    if (currentUser.id === updated.id) {
      setCurrentUser(updated);
    }
    logAction('Pembaruan Akun Pengguna', `Mengubah profil pengguna: ${updated.fullName}`);
  };

  const deleteUser = (id: string) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;
    setUsers((prev) => prev.filter((u) => u.id !== id));
    logAction('Penghapusan Pengguna', `Menghapus akun pengguna: ${target.fullName}`);
  };

  // Master Data CRUD
  const addStudent = (newStd: Omit<Student, 'id'>) => {
    const std: Student = { ...newStd, id: `std-${Date.now()}` };
    setStudents((prev) => [...prev, std]);
    logAction('Penambahan Peserta Didik', `Menambahkan siswa: ${std.fullName} (${std.nis})`);
  };

  const updateStudent = (std: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === std.id ? std : s)));
    logAction('Pembaruan Peserta Didik', `Memperbarui data siswa: ${std.fullName}`);
  };

  const deleteStudent = (id: string) => {
    const std = students.find((s) => s.id === id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
    if (std) logAction('Penghapusan Peserta Didik', `Menghapus siswa: ${std.fullName} (${std.nis})`);
  };

  const addTeacher = (newTch: Omit<Teacher, 'id'>) => {
    const tch: Teacher = { ...newTch, id: `tch-${Date.now()}` };
    setTeachers((prev) => [...prev, tch]);
    logAction('Penambahan Guru', `Menambahkan guru baru: ${tch.fullName}`);
  };

  const updateTeacher = (tch: Teacher) => {
    setTeachers((prev) => prev.map((t) => (t.id === tch.id ? tch : t)));
    logAction('Pembaruan Guru', `Memperbarui data guru: ${tch.fullName}`);
  };

  const deleteTeacher = (id: string) => {
    const tch = teachers.find((t) => t.id === id);
    setTeachers((prev) => prev.filter((t) => t.id !== id));
    if (tch) logAction('Penghapusan Guru', `Menghapus guru: ${tch.fullName}`);
  };

  const addClass = (newCls: Omit<SchoolClass, 'id'>) => {
    const cls: SchoolClass = { ...newCls, id: `cls-${Date.now()}` };
    setClasses((prev) => [...prev, cls]);
    logAction('Penambahan Kelas', `Menambahkan rombel kelas: ${cls.name}`);
  };

  const updateClass = (cls: SchoolClass) => {
    setClasses((prev) => prev.map((c) => (c.id === cls.id ? cls : c)));
    logAction('Pembaruan Kelas', `Memperbarui data rombel: ${cls.name}`);
  };

  const deleteClass = (id: string) => {
    const cls = classes.find((c) => c.id === id);
    setClasses((prev) => prev.filter((c) => c.id !== id));
    if (cls) logAction('Penghapusan Kelas', `Menghapus rombel: ${cls.name}`);
  };

  const addSubject = (newSub: Omit<Subject, 'id'>) => {
    const sub: Subject = { ...newSub, id: `sub-${Date.now()}` };
    setSubjects((prev) => [...prev, sub]);
    logAction('Penambahan Mata Pelajaran', `Menambahkan mapel: ${sub.name} (${sub.code})`);
  };

  const updateSubject = (sub: Subject) => {
    setSubjects((prev) => prev.map((s) => (s.id === sub.id ? sub : s)));
    logAction('Pembaruan Mata Pelajaran', `Memperbarui mapel: ${sub.name}`);
  };

  const deleteSubject = (id: string) => {
    const sub = subjects.find((s) => s.id === id);
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    if (sub) logAction('Penghapusan Mata Pelajaran', `Menghapus mapel: ${sub.name}`);
  };

  // Assessment & Links CRUD
  const addAssessment = (newAsm: Omit<Assessment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const asm: Assessment = {
      ...newAsm,
      id: `asm-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setAssessments((prev) => [asm, ...prev]);
    logAction('Penambahan Asesmen & Tautan', `Menambahkan kegiatan [${asm.category}] '${asm.title}'`);
    
    // Automatically seed empty scores for target classes
    const targetStudents = students.filter(
      (s) =>
        s.classId.includes(asm.level.toString()) ||
        asm.rombelTargets.includes('Semua') ||
        asm.rombelTargets.includes(s.rombel)
    );
    const newStudentScores: StudentScore[] = targetStudents.map((std) => ({
      id: `sc-${asm.id}-${std.id}`,
      assessmentId: asm.id,
      studentId: std.id,
      studentNis: std.nis,
      studentName: std.fullName,
      rombel: std.rombel,
      score: null,
      maxScore: asm.maxScore,
      attendanceStatus: 'belum_mengerjakan',
      isVerified: false,
    }));
    setScores((prev) => [...prev, ...newStudentScores]);
  };

  const updateAssessment = (updated: Assessment) => {
    setAssessments((prev) =>
      prev.map((a) => (a.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : a))
    );
    logAction('Pembaruan Asesmen', `Memperbarui data dan tautan asesmen '${updated.title}'`);
  };

  const deleteAssessment = (id: string) => {
    const target = assessments.find((a) => a.id === id);
    setAssessments((prev) => prev.filter((a) => a.id !== id));
    setScores((prev) => prev.filter((s) => s.assessmentId !== id));
    if (target) logAction('Penghapusan Asesmen', `Menghapus asesmen dan nilai terkait: '${target.title}'`);
  };

  const duplicateAssessment = (id: string) => {
    const original = assessments.find((a) => a.id === id);
    if (!original) return;
    const duplicated: Assessment = {
      ...original,
      id: `asm-${Date.now()}`,
      title: `${original.title} (Salinan)`,
      status: 'draft',
      isScorePublished: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setAssessments((prev) => [duplicated, ...prev]);
    logAction('Duplikasi Asesmen', `Menduplikasi asesmen: '${original.title}'`);
  };

  const toggleScorePublication = (assessmentId: string) => {
    const target = assessments.find((a) => a.id === assessmentId);
    if (!target) return;
    const nextState = !target.isScorePublished;
    setAssessments((prev) =>
      prev.map((a) => (a.id === assessmentId ? { ...a, isScorePublished: nextState } : a))
    );
    logAction(
      nextState ? 'Publikasi Nilai Peserta' : 'Penarikan Publikasi Nilai',
      `Status publikasi nilai asesmen '${target.title}' diubah menjadi: ${nextState ? 'DIPUBLIKASIKAN' : 'DRAF/TERSEMBUNYI'}`
    );
  };

  // Scores CRUD
  const updateScore = (updatedScore: StudentScore) => {
    setScores((prev) => prev.map((s) => (s.id === updatedScore.id ? updatedScore : s)));
    logAction('Input/Update Nilai Siswa', `Nilai siswa ${updatedScore.studentName} (${updatedScore.studentNis}): ${updatedScore.score ?? '-'}`);
  };

  const saveMultipleScores = (assessmentId: string, updatedScores: StudentScore[]) => {
    const updatedMap = new Map(updatedScores.map((s) => [s.id, s]));
    setScores((prev) =>
      prev.map((s) => {
        if (s.assessmentId === assessmentId && updatedMap.has(s.id)) {
          return updatedMap.get(s.id)!;
        }
        return s;
      })
    );
    logAction('Penyimpanan Massal Nilai', `Memperbarui ${updatedScores.length} data nilai pada asesmen ID: ${assessmentId}`);
  };

  const importScoresBatch = (
    assessmentId: string,
    importedList: Array<{
      nis: string;
      name: string;
      score: number;
      rawScore?: number;
      attendanceStatus?: 'hadir' | 'sakit' | 'izin' | 'tanpa_keterangan' | 'belum_mengerjakan';
      notes?: string;
    }>
  ) => {
    const asm = assessments.find((a) => a.id === assessmentId);
    if (!asm) return { success: 0, failed: importedList.length, errors: ['Asesmen tidak ditemukan.'] };

    let success = 0;
    let failed = 0;
    const errors: string[] = [];
    const newScores = [...scores];

    importedList.forEach((item, index) => {
      // Find matching student by NIS or Name
      const student = students.find(
        (s) => s.nis.trim().toLowerCase() === item.nis.trim().toLowerCase() ||
               s.fullName.trim().toLowerCase() === item.name.trim().toLowerCase()
      );

      if (!student) {
        failed++;
        errors.push(`Baris ${index + 1}: NIS '${item.nis}' atau nama '${item.name}' tidak terdaftar di database peserta didik.`);
        return;
      }

      // Validate score boundary
      if (item.score < 0 || item.score > asm.maxScore) {
        failed++;
        errors.push(`Baris ${index + 1}: Nilai ${item.score} berada di luar rentang valid (0 - ${asm.maxScore}) untuk ${student.fullName}.`);
        return;
      }

      // Check if score record exists
      const existingIndex = newScores.findIndex(
        (s) => s.assessmentId === assessmentId && s.studentId === student.id
      );

      const scoreEntry: StudentScore = {
        id: existingIndex >= 0 ? newScores[existingIndex].id : `sc-${asm.id}-${student.id}`,
        assessmentId: asm.id,
        studentId: student.id,
        studentNis: student.nis,
        studentName: student.fullName,
        rombel: student.rombel,
        score: item.score,
        rawScore: item.rawScore,
        maxScore: asm.maxScore,
        attendanceStatus: item.attendanceStatus || 'hadir',
        submittedAt: new Date().toISOString(),
        teacherNotes: item.notes || 'Hasil impor berkas nilai.',
        isVerified: true,
      };

      if (existingIndex >= 0) {
        newScores[existingIndex] = scoreEntry;
      } else {
        newScores.push(scoreEntry);
      }
      success++;
    });

    setScores(newScores);
    logAction(
      'Impor Hasil Nilai Berkas',
      `Mengimpor nilai asesmen '${asm.title}': ${success} berhasil, ${failed} gagal.`
    );

    return { success, failed, errors };
  };

  // Announcements
  const addAnnouncement = (newAnc: Omit<Announcement, 'id' | 'createdAt'>) => {
    const anc: Announcement = { ...newAnc, id: `anc-${Date.now()}`, createdAt: new Date().toISOString() };
    setAnnouncements((prev) => [anc, ...prev]);
    logAction('Penerbitan Pengumuman', `Membuat pengumuman: '${anc.title}'`);
  };

  const deleteAnnouncement = (id: string) => {
    const target = announcements.find((a) => a.id === id);
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    if (target) logAction('Penghapusan Pengumuman', `Menghapus pengumuman: '${target.title}'`);
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  // Backup & Reset
  const backupDatabase = () => {
    const payload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      institution: settings,
      users,
      students,
      teachers,
      classes,
      subjects,
      assessments,
      scores,
      announcements,
      auditLogs,
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_portal_asesmen_min1paser_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    logAction('Pencadangan Database', 'Mengunduh berkas cadangan database JSON sistem.');
  };

  const restoreDatabase = (jsonContent: string): boolean => {
    try {
      const parsed = JSON.parse(jsonContent);
      if (!parsed.institution || !parsed.assessments) {
        throw new Error('Format berkas tidak valid.');
      }
      if (parsed.institution) setSettings(parsed.institution);
      if (parsed.users) setUsers(parsed.users);
      if (parsed.students) setStudents(parsed.students);
      if (parsed.teachers) setTeachers(parsed.teachers);
      if (parsed.classes) setClasses(parsed.classes);
      if (parsed.subjects) setSubjects(parsed.subjects);
      if (parsed.assessments) setAssessments(parsed.assessments);
      if (parsed.scores) setScores(parsed.scores);
      if (parsed.announcements) setAnnouncements(parsed.announcements);
      if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
      logAction('Pemulihan Database', 'Memulihkan database dari berkas cadangan JSON eksternal.');
      return true;
    } catch (e) {
      console.error('Failed to restore backup', e);
      return false;
    }
  };

  const resetToDefault = () => {
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setSettings(INITIAL_INSTITUTION_SETTINGS);
    setStudents(INITIAL_STUDENTS);
    setTeachers(INITIAL_TEACHERS);
    setClasses(INITIAL_CLASSES);
    setSubjects(INITIAL_SUBJECTS);
    setAssessments(INITIAL_ASSESSMENTS);
    setScores(INITIAL_SCORES);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    localStorage.clear();
    logAction('Reset Data Bawaan', 'Mengembalikan seluruh data ke konfigurasi awal (seed data).');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        users,
        addUser,
        updateUser,
        deleteUser,
        isAuthenticated,
        loginStudent,
        loginTeacher,
        loginSuperAdmin,
        logout,
        activeCategories,
        toggleAssessmentCategoryActive,
        isCategoryActive,
        settings,
        updateSettings,
        students,
        addStudent,
        updateStudent,
        deleteStudent,
        teachers,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        classes,
        addClass,
        updateClass,
        deleteClass,
        subjects,
        addSubject,
        updateSubject,
        deleteSubject,
        assessments,
        addAssessment,
        updateAssessment,
        deleteAssessment,
        duplicateAssessment,
        toggleScorePublication,
        scores,
        updateScore,
        saveMultipleScores,
        importScoresBatch,
        announcements,
        addAnnouncement,
        deleteAnnouncement,
        notifications,
        markNotificationRead,
        auditLogs,
        logAction,
        currentView,
        setCurrentView,
        selectedCategoryFilter,
        setSelectedCategoryFilter,
        backupDatabase,
        restoreDatabase,
        resetToDefault,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
