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
  const { settings, loginStudent, loginTeacher, loginSuperAdmin, students, teachers, classes } = useApp();

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

  // Error feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter students by selected class for quick helper
  const classStudents = students.filter((s) => s.rombel === studentRombel);

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!studentName.trim()) {
      setErrorMessage('Harap masukkan nama lengkap peserta didik.');
      return;
    }
    if (!studentAbsen) {
      setErrorMessage('Harap masukkan nomor absen.');
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

    if (!teacherName.trim()) {
      setErrorMessage('Harap masukkan nama guru.');
      return;
    }
    if (!teacherNip.trim()) {
      setErrorMessage('Harap masukkan NIP guru.');
      return;
    }

    const res = loginTeacher(teacherName, teacherNip);
    if (!res.success) {
      setErrorMessage(res.message || 'Nama guru atau NIP tidak cocok.');
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!adminUser.trim() || !adminPass.trim()) {
      setErrorMessage('Username dan Password Super Admin wajib diisi.');
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

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 px-4 py-8">
      {/* Brand & Institution Header */}
      <div className="w-full max-w-md text-center mb-6">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white font-extrabold text-2xl shadow-md mb-3">
          MI
        </div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          PORTAL ASESMEN DIGITAL
        </h1>
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 mt-0.5">
          {settings.schoolName}
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          {settings.subdistrict}, Paser, Kalimantan Timur · T.P. {settings.academicYear}
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
            }}
            className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'siswa'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5" />
            <span>Siswa</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('guru');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'guru'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Guru</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'admin'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span>Admin Super</span>
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* FORM 1: SISWA (Nama Lengkap dan Nomor Absen) */}
        {activeTab === 'siswa' && (
          <form onSubmit={handleStudentSubmit} className="space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-800">
                  Rombongan Belajar (Kelas)
                </label>
                <span className="text-[10px] text-slate-400">Pilih kelas</span>
              </div>
              <select
                value={studentRombel}
                onChange={(e) => setStudentRombel(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-blue-600 focus:outline-hidden"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.rombel}>
                    {c.name}
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
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Contoh: Muhammad Al-Fatih Pratama"
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-blue-600 focus:outline-hidden"
              />
              {classStudents.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  <span className="text-[10px] text-slate-400 self-center">Pilihan cepat:</span>
                  {classStudents.slice(0, 3).map((st) => (
                    <button
                      type="button"
                      key={st.id}
                      onClick={() => autofillStudent(st.fullName, st.attendanceNumber || 1, st.rombel)}
                      className="text-[10px] bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 px-2 py-0.5 rounded transition-colors"
                    >
                      {st.fullName.split(' ')[0]} (Absen {st.attendanceNumber})
                    </button>
                  ))}
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

            <div className="rounded-lg bg-blue-50/60 p-2.5 border border-blue-100 text-[11px] text-blue-800 leading-relaxed">
              💡 <strong>Contoh Login Siswa:</strong> Nama: <em>Muhammad Al-Fatih Pratama</em>, Absen: <em>1</em>, Kelas: <em>6A</em>.
            </div>
          </form>
        )}

        {/* FORM 2: GURU (Nama Guru dan NIP) */}
        {activeTab === 'guru' && (
          <form onSubmit={handleTeacherSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Nama Lengkap Guru <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                placeholder="Contoh: Dzakirul Husni, S.Pd."
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-blue-600 focus:outline-hidden"
              />
              <div className="mt-1.5 flex flex-wrap gap-1">
                <span className="text-[10px] text-slate-400 self-center">Pilihan cepat:</span>
                {teachers.slice(0, 3).map((tch) => (
                  <button
                    type="button"
                    key={tch.id}
                    onClick={() => autofillTeacher(tch.fullName, tch.nip || '')}
                    className="text-[10px] bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 px-2 py-0.5 rounded transition-colors"
                  >
                    {tch.fullName.split(' ')[0]}
                  </button>
                ))}
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

            <div className="rounded-lg bg-emerald-50/60 p-2.5 border border-emerald-100 text-[11px] text-emerald-800 leading-relaxed">
              💡 <strong>Contoh Login Guru:</strong> Nama: <em>Dzakirul Husni, S.Pd.</em>, NIP: <em>198902142014031002</em>.
            </div>
          </form>
        )}

        {/* FORM 3: ADMIN SUPER (user: Dzakirul, Password: 123456) */}
        {activeTab === 'admin' && (
          <form onSubmit={handleAdminSubmit} className="space-y-4 text-xs">
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
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs flex items-center justify-center gap-2 mt-2"
            >
              <KeyRound className="h-4 w-4 text-amber-400" />
              <span>Masuk Sebagai Admin Super</span>
            </button>

            <div className="rounded-lg bg-slate-100 p-2.5 border border-slate-200 text-[11px] text-slate-700 leading-relaxed font-mono">
              <strong>Kredensial Sesuai Ketentuan:</strong><br />
              User : <span className="text-blue-700 font-bold">Dzakirul</span><br />
              Password : <span className="text-emerald-700 font-bold">123456</span>
            </div>
          </form>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-6 text-center text-xs text-slate-400">
        Portal Asesmen Digital Terpadu · MIN 1 Paser © {new Date().getFullYear()}
      </div>
    </div>
  );
};
