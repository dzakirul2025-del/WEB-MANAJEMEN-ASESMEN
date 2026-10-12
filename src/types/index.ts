export type UserRole = 'super_admin' | 'guru' | 'wali_kelas' | 'siswa';

export type AssessmentCategoryType =
  | 'formatif'
  | 'sumatif_akhir_bab'
  | 'sas'
  | 'sat'
  | 'try_out'
  | 'tka';

export type AssessmentStatus = 'draft' | 'terjadwal' | 'berlangsung' | 'selesai' | 'dibatalkan';

export type ExternalPlatform =
  | 'Wayground'
  | 'EdCafe'
  | 'Google Forms'
  | 'Microsoft Forms'
  | 'Quizizz'
  | 'Moodle'
  | 'Website CBT'
  | 'Google Sites'
  | 'Lainnya';

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  nipOrNis?: string;
  avatarUrl?: string;
  assignedClassId?: string; // For wali_kelas or siswa
  assignedSubjectIds?: string[]; // For guru
  isActive: boolean;
  createdAt: string;
}

export interface Student {
  id: string;
  nis: string;
  nisn?: string;
  attendanceNumber?: number; // Nomor Absen Siswa
  fullName: string;
  classId: string;
  rombel: string; // e.g. 6A, 6B
  gender: 'L' | 'P';
  parentName?: string;
  parentPhone?: string;
  isActive: boolean;
}

export interface Teacher {
  id: string;
  nip?: string;
  fullName: string;
  title: string;
  email: string;
  phone?: string;
  subjectIds: string[];
  homeroomClassId?: string; // If wali kelas
  isActive: boolean;
}

export interface SchoolClass {
  id: string;
  level: number; // 1 to 6
  rombel: string; // "6A", "6B", etc.
  name: string; // "Kelas 6A"
  homeroomTeacherId?: string;
  academicYearId: string;
  studentCount: number;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  group: 'Pendidikan Agama Islam' | 'Mata Pelajaran Umum' | 'Muatan Lokal';
  kktpStandard: number; // Kriteria Ketercapaian Tujuan Pembelajaran default (e.g. 75)
  isActive: boolean;
}

export interface AcademicYear {
  id: string;
  year: string; // "2026/2027"
  semester: 'Ganjil' | 'Genap';
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface AssessmentCategoryInfo {
  id: AssessmentCategoryType;
  title: string;
  description: string;
  badgeLabel: string;
  accentColor: string; // Hex color for visual distinction
  textColor: string;
  bgLightColor: string;
}

export interface Assessment {
  id: string;
  title: string;
  category: AssessmentCategoryType;
  level: number; // Class level: 1 to 6
  rombelTargets: string[]; // ["6A", "6B"] or ["Semua"]
  subjectId: string;
  semester: 'Ganjil' | 'Genap';
  academicYear: string;
  chapterOrTopic: string; // Bab / Materi
  cpOrTp?: string; // Capaian / Tujuan Pembelajaran
  description: string;
  instructions: string;
  specialNotes?: string;
  
  // Link & Platform Metadata
  platform: ExternalPlatform;
  customPlatformName?: string;
  assessmentUrl: string;
  isUrlVerified: boolean;
  canStudentOpen: boolean;
  
  // Scheduling (WITA Asia/Makassar)
  startTime: string; // ISO string
  endTime: string; // ISO string
  durationMinutes: number;
  status: AssessmentStatus;
  
  // Scoring parameters
  maxScore: number;
  passingScore: number; // KKTP
  isScorePublished: boolean;
  
  // Category specific flags
  isOfficialTka?: boolean; // TKA: Resmi vs Simulasi
  tryOutOrganizer?: string; // Try Out: Penyelenggara
  examSession?: string; // SAS/SAT/TKA: Sesi ujian
  examRoom?: string; // Ruang ujian
  followUpPlan?: string; // Formatif: Catatan tindak lanjut
  
  // Author
  teacherId: string;
  teacherName: string;
  teacherContact?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface StudentScore {
  id: string;
  assessmentId: string;
  studentId: string;
  studentNis: string;
  studentName: string;
  rombel: string;
  score: number | null; // null if not graded yet
  rawScore?: number;
  maxScore: number;
  attendanceStatus: 'hadir' | 'sakit' | 'izin' | 'tanpa_keterangan' | 'belum_mengerjakan';
  submittedAt?: string;
  teacherNotes?: string;
  isVerified: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  ipAddress?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'jadwal' | 'nilai' | 'sistem' | 'pengumuman';
  targetRoles: UserRole[];
  targetClass?: string;
  createdAt: string;
  isRead?: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorName: string;
  targetAudience: 'Semua' | 'Guru' | 'Peserta Didik' | string; // Or specific rombel like "6A"
  isPinned: boolean;
  createdAt: string;
}

export interface InstitutionSettings {
  schoolName: string;
  schoolType: string;
  address: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  headmasterName: string;
  headmasterNip: string;
  developerName: string;
  academicYear: string;
  activeSemester: 'Ganjil' | 'Genap';
  timezone: string; // 'Asia/Makassar' (WITA)
  logoUrl?: string;
}
