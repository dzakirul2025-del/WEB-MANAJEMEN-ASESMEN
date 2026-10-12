import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  KeyRound,
  LogIn,
  School,
  ShieldAlert,
  Sparkles,
  User,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LoginView: React.FC = () => {
  const {
    settings,
    loginStudent,
    loginTeacher,
    loginSuperAdmin,
    students,
    teachers,
    classes,
    switchRole,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'siswa' | 'guru' | 'admin'>('siswa');

  // Siswa Form
  const [studentRombel, setStudentRombel] = useState('6A');
  const [studentName, setStudentName] = useState('');
  const [studentAbsen, setStudentAbsen] = useState<string>('');

  // Guru Form
  const [teacherName, setTeacherName] = useState('');
  const [teacherNip, setTeacherNip] = useState('');

  // Super Admin Form
  const [adminUser, setAdminUser] = useState('Dzakirul');
  const [adminPass, setAdminPass] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);

  // Error & Success feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter students by selected class for quick helper
  const classStudents = students.filter((s) => !studentRombel || s.rombel === studentRombel);

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!studentName.trim()) {
      setErrorMessage('Harap masukkan Nama Lengkap peserta didik.');
      return;
    }
    if (!studentAbsen) {
      setErrorMessage('Harap masukkan Nomor Absen peserta didik.');
      return;
    }

    const res = loginStudent(studentName, Number(studentAbsen), studentRombel);
    if (!res.success) {
      setErrorMessage(res.message || 'Data siswa tidak cocok.');
    }
  };

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!teacherName.trim()) {
      setErrorMessage('Harap masukkan Nama Lengkap Guru.');
      return;
    }
    if (!teacherNip.trim()) {
      setErrorMessage('Harap masukkan NIP Guru.');
      return;
    }

    const res = loginTeacher(teacherName, teacherNip);
    if (!res.success) {
      setErrorMessage(res.message || 'Nama Guru atau NIP tidak cocok.');
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!adminUser.trim() || !adminPass.trim()) {
      setErrorMessage('User dan Password Super Admin wajib diisi.');
      return;
    }

    const res = loginSuperAdmin(adminUser, adminPass);
    if (!res.success) {
      setErrorMessage(res.message || 'Kredensial Super Admin salah.');
    }
  };

  // Helper autofills for fast testing
  const autofillStudent = (name: string, absen: number, rombel: string) => {
    setStudentRombel(rombel);
    setStudentName(name);
    setStudentAbsen(absen.toString());
    setErrorMessage(null);
  };

  const autofillTeacher = (name: string, nip: string) => {
    setTeacherName(name);
    setTeacherNip(nip);
    setErrorMessage(null);
  };

  const autofillAdmin = () => {
    setAdminUser('Dzakirul');
    setAdminPass('123456');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-slate-100 via-slate-50 to-blue-50/40 px-4 py-8">
      {/* Brand & Institution Header */}
      <div className="w-full max-w-md text-center mb-6">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white font-extrabold text-2xl shadow-lg border-2 border-blue-500/30 mb-3">
          MI
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          PORTAL ASESMEN DIGITAL
        </h1>
        <p className="text-xs font-bold uppercase tracking-wider text-blue-700 mt-0.5">
          {settings.schoolName}
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          {settings.subdistrict}, Kab. Paser, Kalimantan Timur · T.P. {settings.academicYear}
        </p>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl">
        {/* Role Segmented Tabs */}
        <div className="flex rounded-xl bg-slate-100 p-1 mb-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('siswa');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'siswa'
                ? 'bg-white text-blue-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            <span>Siswa</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('guru');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'guru'
                ? 'bg-white text-blue-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Guru</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'admin'
                ? 'bg-slate-900 text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="h-4 w-4 text-amber-400" />
            <span>Admin Super</span>
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
            <span className="leading-relaxed font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Success Notification */}
        {successMessage && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
            <span className="leading-relaxed font-medium">{successMessage}</span>
          </div>
        )}

        {/* =========================================================================
            TAB 1: SISWA (Nama Lengkap dan Nomor Absen)
           ========================================================================= */}
        {activeTab === 'siswa' && (
          <form onSubmit={handleStudentSubmit} className="space-y-4 text-xs">
            <div className="rounded-lg bg-blue-50/60 p-2.5 border border-blue-100 text-[11px] text-blue-900 leading-relaxed">
              🎓 <strong>Ketentuan Login Siswa:</strong> Masukkan <strong>Nama Lengkap</strong> dan <strong>Nomor Absen</strong> sesuai dengan data kelas madrasah.
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-800">
                  Rombongan Belajar (Kelas)
                </label>
                <span className="text-[10px] text-slate-400">Pilih kelas</span>
              </div>
              <select
                value={studentRombel}
                onChange={(e) => {
                  setStudentRombel(e.target.value);
                  setStudentName('');
                  setStudentAbsen('');
                }}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-800 bg-white focus:border-blue-600 focus:outline-hidden"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.rombel}>
                    {c.name} (Jenjang Kelas {c.level})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Nama Lengkap Siswa <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                list="students-datalist"
                value={studentName}
                onChange={(e) => {
                  const val = e.target.value;
                  setStudentName(val);
                  // Auto-fill nomor absen if exact name matches
                  const found = students.find(
                    (s) => s.fullName.toLowerCase() === val.trim().toLowerCase()
                  );
                  if (found && found.attendanceNumber) {
                    setStudentAbsen(found.attendanceNumber.toString());
                    setStudentRombel(found.rombel);
                  }
                }}
                placeholder="Contoh: Muhammad Al-Fatih Pratama"
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-blue-600 focus:outline-hidden"
              />
              <datalist id="students-datalist">
                {students.map((st) => (
                  <option key={st.id} value={st.fullName}>
                    {st.rombel} · Absen {st.attendanceNumber}
                  </option>
                ))}
              </datalist>

              {classStudents.length > 0 && (
                <div className="mt-2 space-y-1">
                  <span className="text-[10px] font-semibold text-slate-500 block">
                    Pilihan Cepat Peserta Didik (Kelas {studentRombel}):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {classStudents.slice(0, 4).map((st) => (
                      <button
                        type="button"
                        key={st.id}
                        onClick={() =>
                          autofillStudent(st.fullName, st.attendanceNumber || 1, st.rombel)
                        }
                        className="text-[10px] bg-slate-100 hover:bg-blue-100 hover:text-blue-800 text-slate-700 px-2 py-1 rounded-md transition-colors border border-slate-200"
                      >
                        {st.fullName.split(' ')[0]} (Absen {st.attendanceNumber})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Nomor Absen Siswa <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={studentAbsen}
                onChange={(e) => setStudentAbsen(e.target.value)}
                placeholder="Masukkan nomor absen (contoh: 1)"
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs tabular-nums focus:border-blue-600 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs flex items-center justify-center gap-2 mt-2"
            >
              <LogIn className="h-4 w-4" />
              <span>Masuk Sebagai Siswa</span>
            </button>
          </form>
        )}

        {/* =========================================================================
            TAB 2: GURU (Nama Guru dan NIP)
           ========================================================================= */}
        {activeTab === 'guru' && (
          <form onSubmit={handleTeacherSubmit} className="space-y-4 text-xs">
            <div className="rounded-lg bg-emerald-50/60 p-2.5 border border-emerald-100 text-[11px] text-emerald-900 leading-relaxed">
              👨‍🏫 <strong>Ketentuan Login Guru:</strong> Masukkan <strong>Nama Lengkap Guru</strong> dan <strong>NIP</strong> resmi pendidik MIN 1 Paser.
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Nama Lengkap Guru <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                list="teachers-datalist"
                value={teacherName}
                onChange={(e) => {
                  const val = e.target.value;
                  setTeacherName(val);
                  const found = teachers.find(
                    (t) => t.fullName.toLowerCase() === val.trim().toLowerCase()
                  );
                  if (found && found.nip) {
                    setTeacherNip(found.nip);
                  }
                }}
                placeholder="Contoh: Dzakirul Husni, S.Pd."
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-blue-600 focus:outline-hidden"
              />
              <datalist id="teachers-datalist">
                {teachers.map((tch) => (
                  <option key={tch.id} value={tch.fullName}>
                    NIP: {tch.nip} ({tch.title})
                  </option>
                ))}
              </datalist>

              <div className="mt-2 space-y-1">
                <span className="text-[10px] font-semibold text-slate-500 block">
                  Pilihan Cepat Tenaga Pendidik:
                </span>
                <div className="flex flex-wrap gap-1">
                  {teachers.slice(0, 3).map((tch) => (
                    <button
                      type="button"
                      key={tch.id}
                      onClick={() => autofillTeacher(tch.fullName, tch.nip || '')}
                      className="text-[10px] bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-700 px-2 py-1 rounded-md transition-colors border border-slate-200"
                    >
                      {tch.fullName.split(',')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                NIP Guru <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={teacherNip}
                onChange={(e) => setTeacherNip(e.target.value)}
                placeholder="Contoh: 198902142014031002"
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-mono focus:border-blue-600 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs flex items-center justify-center gap-2 mt-2"
            >
              <LogIn className="h-4 w-4" />
              <span>Masuk Sebagai Guru</span>
            </button>
          </form>
        )}

        {/* =========================================================================
            TAB 3: ADMIN SUPER (user: Dzakirul, Password: 123456)
           ========================================================================= */}
        {activeTab === 'admin' && (
          <form onSubmit={handleAdminSubmit} className="space-y-4 text-xs">
            <div className="rounded-lg bg-amber-50/70 p-3 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
              🔐 <strong>Kredensial Sesuai Ketentuan Resmi:</strong>
              <div className="mt-1 font-mono text-xs">
                <div>User : <span className="font-bold text-blue-800">Dzakirul</span></div>
                <div>Password : <span className="font-bold text-emerald-800">123456</span></div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                User / Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={adminUser}
                onChange={(e) => setAdminUser(e.target.value)}
                placeholder="Dzakirul"
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-medium focus:border-blue-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  placeholder="123456"
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs pr-10 focus:border-blue-600 focus:outline-hidden font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={autofillAdmin}
                className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Isi Kredensial Otomatis
              </button>

              <button
                type="submit"
                className="flex-1 rounded-lg bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <KeyRound className="h-4 w-4 text-amber-400" />
                <span>Masuk Sebagai Admin Super</span>
              </button>
            </div>
          </form>
        )}

        {/* Quick Demo Bypass */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <span className="text-[11px] text-slate-400 block mb-2">
            Akses Cepat Pengujian Langsung:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => {
                loginSuperAdmin('Dzakirul', '123456');
              }}
              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold transition-colors"
            >
              Demo Super Admin
            </button>
            <button
              type="button"
              onClick={() => {
                loginTeacher('Dzakirul Husni, S.Pd.', '198902142014031002');
              }}
              className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold transition-colors"
            >
              Demo Guru
            </button>
            <button
              type="button"
              onClick={() => {
                loginStudent('Muhammad Al-Fatih Pratama', 1, '6A');
              }}
              className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold transition-colors"
            >
              Demo Siswa
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-6 text-center text-xs text-slate-500">
        Portal Asesmen Digital Terpadu · MIN 1 Paser © {new Date().getFullYear()}
        <div className="text-[11px] text-slate-400 mt-0.5">
          Pengembang: {settings.developerName} · Kepala Madrasah: {settings.headmasterName}
        </div>
      </div>
    </div>
  );
};
