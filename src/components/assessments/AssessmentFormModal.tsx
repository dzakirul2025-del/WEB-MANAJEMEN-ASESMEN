import React, { useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Globe,
  HelpCircle,
  Link2,
  X,
} from 'lucide-react';
import { ASSESSMENT_CATEGORIES } from '../../data/seedData';
import { Assessment, AssessmentCategoryType, ExternalPlatform } from '../../types';
import { useApp } from '../../context/AppContext';

interface AssessmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessmentToEdit?: Assessment | null;
}

const PLATFORMS: ExternalPlatform[] = [
  'Wayground',
  'EdCafe',
  'Google Forms',
  'Microsoft Forms',
  'Quizizz',
  'Moodle',
  'Website CBT',
  'Google Sites',
  'Lainnya',
];

export const AssessmentFormModal: React.FC<AssessmentFormModalProps> = ({
  isOpen,
  onClose,
  assessmentToEdit,
}) => {
  const { subjects, classes, settings, currentUser, addAssessment, updateAssessment, assessments } =
    useApp();

  const [title, setTitle] = useState(assessmentToEdit?.title || '');
  const [category, setCategory] = useState<AssessmentCategoryType>(
    assessmentToEdit?.category || 'formatif'
  );
  const [level, setLevel] = useState<number>(assessmentToEdit?.level || 6);
  const [rombelTargets, setRombelTargets] = useState<string[]>(
    assessmentToEdit?.rombelTargets || ['6A']
  );
  const [subjectId, setSubjectId] = useState(assessmentToEdit?.subjectId || subjects[0]?.id || '');
  const [semester, setSemester] = useState<'Ganjil' | 'Genap'>(
    assessmentToEdit?.semester || settings.activeSemester
  );
  const [academicYear, setAcademicYear] = useState(
    assessmentToEdit?.academicYear || settings.academicYear
  );
  const [chapterOrTopic, setChapterOrTopic] = useState(
    assessmentToEdit?.chapterOrTopic || ''
  );
  const [cpOrTp, setCpOrTp] = useState(assessmentToEdit?.cpOrTp || '');
  const [description, setDescription] = useState(assessmentToEdit?.description || '');
  const [instructions, setInstructions] = useState(
    assessmentToEdit?.instructions ||
      '1. Siapkan alat tulis dan kertas coret.\n2. Pastikan koneksi internet stabil.\n3. Kerjakan dengan jujur dan teliti.'
  );
  const [specialNotes, setSpecialNotes] = useState(assessmentToEdit?.specialNotes || '');

  // Platform & Link
  const [platform, setPlatform] = useState<ExternalPlatform>(
    assessmentToEdit?.platform || 'Google Forms'
  );
  const [customPlatformName, setCustomPlatformName] = useState(
    assessmentToEdit?.customPlatformName || ''
  );
  const [assessmentUrl, setAssessmentUrl] = useState(
    assessmentToEdit?.assessmentUrl || ''
  );
  const [canStudentOpen, setCanStudentOpen] = useState(
    assessmentToEdit?.canStudentOpen ?? true
  );

  // Scheduling
  const [startTime, setStartTime] = useState(
    assessmentToEdit?.startTime
      ? assessmentToEdit.startTime.substring(0, 16)
      : new Date().toISOString().substring(0, 16)
  );
  const [endTime, setEndTime] = useState(
    assessmentToEdit?.endTime
      ? assessmentToEdit.endTime.substring(0, 16)
      : new Date(Date.now() + 86400000 * 3).toISOString().substring(0, 16)
  );
  const [durationMinutes, setDurationMinutes] = useState(
    assessmentToEdit?.durationMinutes || 60
  );
  const [status, setStatus] = useState<Assessment['status']>(
    assessmentToEdit?.status || 'draft'
  );

  // Scoring
  const [maxScore, setMaxScore] = useState(assessmentToEdit?.maxScore || 100);
  const [passingScore, setPassingScore] = useState(assessmentToEdit?.passingScore || 75);

  // Category specific
  const [isOfficialTka, setIsOfficialTka] = useState(assessmentToEdit?.isOfficialTka || false);
  const [tryOutOrganizer, setTryOutOrganizer] = useState(
    assessmentToEdit?.tryOutOrganizer || ''
  );
  const [examSession, setExamSession] = useState(assessmentToEdit?.examSession || '');
  const [examRoom, setExamRoom] = useState(assessmentToEdit?.examRoom || '');
  const [followUpPlan, setFollowUpPlan] = useState(assessmentToEdit?.followUpPlan || '');

  // Teacher contact
  const [teacherName, setTeacherName] = useState(
    assessmentToEdit?.teacherName || currentUser.fullName
  );
  const [teacherContact, setTeacherContact] = useState(
    assessmentToEdit?.teacherContact || '085249001122'
  );

  // Validation state
  const [errorMsg, setErrorMsg] = useState('');
  const [urlDomain, setUrlDomain] = useState('');
  const [urlDuplicateWarning, setUrlDuplicateWarning] = useState(false);

  // Validate URL helper
  const handleUrlChange = (val: string) => {
    setAssessmentUrl(val);
    try {
      if (val.trim().length > 0) {
        const parsed = new URL(val);
        setUrlDomain(parsed.hostname);

        // Check for duplicates
        const isDupe = assessments.some(
          (a) => a.id !== assessmentToEdit?.id && a.assessmentUrl.trim().toLowerCase() === val.trim().toLowerCase()
        );
        setUrlDuplicateWarning(isDupe);
      } else {
        setUrlDomain('');
        setUrlDuplicateWarning(false);
      }
    } catch {
      setUrlDomain('Format URL tidak valid (gunakan https://)');
      setUrlDuplicateWarning(false);
    }
  };

  const handleTestLink = () => {
    if (!assessmentUrl.trim()) return;
    try {
      new URL(assessmentUrl);
      window.open(assessmentUrl, '_blank', 'noopener,noreferrer');
    } catch {
      alert('Tautan tidak valid. Mohon masukkan URL lengkap diawali https://');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Judul asesmen wajib diisi.');
      return;
    }
    if (!chapterOrTopic.trim()) {
      setErrorMsg('Bab atau materi asesmen wajib diisi.');
      return;
    }
    if (!assessmentUrl.trim()) {
      setErrorMsg('Tautan soal (URL) wajib diisi.');
      return;
    }

    try {
      new URL(assessmentUrl);
    } catch {
      setErrorMsg('Format tautan soal tidak valid. Pastikan diawali https:// atau http://');
      return;
    }

    if (platform === 'Lainnya' && !customPlatformName.trim()) {
      setErrorMsg('Sebutkan nama platform kustom.');
      return;
    }

    const payload = {
      title,
      category,
      level,
      rombelTargets,
      subjectId,
      semester,
      academicYear,
      chapterOrTopic,
      cpOrTp,
      description,
      instructions,
      specialNotes,
      platform,
      customPlatformName: platform === 'Lainnya' ? customPlatformName : undefined,
      assessmentUrl,
      isUrlVerified: true,
      canStudentOpen,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      durationMinutes: Number(durationMinutes),
      status,
      maxScore: Number(maxScore),
      passingScore: Number(passingScore),
      isScorePublished: assessmentToEdit?.isScorePublished ?? false,
      isOfficialTka: category === 'tka' ? isOfficialTka : undefined,
      tryOutOrganizer: category === 'try_out' ? tryOutOrganizer : undefined,
      examSession: ['sas', 'sat', 'tka'].includes(category) ? examSession : undefined,
      examRoom: ['sas', 'sat'].includes(category) ? examRoom : undefined,
      followUpPlan: category === 'formatif' ? followUpPlan : undefined,
      teacherId: currentUser.id,
      teacherName,
      teacherContact,
    };

    if (assessmentToEdit) {
      updateAssessment({
        ...payload,
        id: assessmentToEdit.id,
        createdAt: assessmentToEdit.createdAt,
        updatedAt: new Date().toISOString(),
      });
    } else {
      addAssessment(payload);
    }

    onClose();
  };

  if (!isOpen) return null;

  const currentCategoryMeta = ASSESSMENT_CATEGORIES.find((c) => c.id === category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 my-8 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Link2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                {assessmentToEdit ? 'Ubah Asesmen & Tautan Soal' : 'Tambah Bank Tautan Asesmen Baru'}
              </h2>
              <p className="text-xs text-slate-300">
                Pusat Integrasi Asesmen Multi-Platform MIN 1 Paser
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="max-h-[75vh] overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-red-700">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Identitas & Klasifikasi */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-[10px]">1</span>
              Klasifikasi & Target Kurikulum
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-800 mb-1">
                  Kategori Asesmen <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as AssessmentCategoryType)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-blue-600 focus:outline-hidden"
                >
                  {ASSESSMENT_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.title}
                    </option>
                  ))}
                </select>
                {currentCategoryMeta && (
                  <p className="mt-1 text-[11px] text-slate-500">{currentCategoryMeta.description}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Mata Pelajaran <span className="text-red-500">*</span>
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-blue-600 focus:outline-hidden"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Jenjang Kelas</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                >
                  {[1, 2, 3, 4, 5, 6].map((l) => (
                    <option key={l} value={l}>
                      Kelas {l} (Fase {l <= 2 ? 'A' : l <= 4 ? 'B' : 'C'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Rombongan Belajar</label>
                <select
                  value={rombelTargets[0] || '6A'}
                  onChange={(e) => setRombelTargets([e.target.value])}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                >
                  <option value="Semua">Semua Rombel Kelas {level}</option>
                  <option value={`${level}A`}>{level}A</option>
                  <option value={`${level}B`}>{level}B</option>
                  <option value={`${level}C`}>{level}C</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Semester</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value as 'Ganjil' | 'Genap')}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                >
                  <option value="Ganjil">Ganjil</option>
                  <option value="Genap">Genap</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Tahun Pelajaran</label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Judul Lengkap Asesmen <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Formatif Matematika: Bilangan Bulat dan Garis Bilangan"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-blue-600 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Bab atau Materi Pokok <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Bab 1 Operasi Hitung Campuran"
                  value={chapterOrTopic}
                  onChange={(e) => setChapterOrTopic(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Capaian / Tujuan Pembelajaran (TP)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: TP 6.1 Mampu menyelesaikan operasi hitung pecahan..."
                  value={cpOrTp}
                  onChange={(e) => setCpOrTp(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Integrasi Tautan & Platform Eksternal (Fitur Inti) */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 space-y-4">
            <h3 className="font-bold text-blue-900 text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[10px]">2</span>
                Tautan Soal & Platform Sumber Eksternal
              </span>
              <span className="text-[11px] font-normal text-blue-700">Multi-Platform Terbuka</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Platform Sumber Soal <span className="text-red-500">*</span>
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as ExternalPlatform)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-blue-600"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {platform === 'Lainnya' && (
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Nama Platform Kustom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Sebutkan nama aplikasi / web"
                    value={customPlatformName}
                    onChange={(e) => setCustomPlatformName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                  />
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-800 mb-1">
                  Tautan / URL Soal Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="url"
                      placeholder="https://forms.gle/... atau https://quizizz.com/..."
                      value={assessmentUrl}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono pr-8 focus:border-blue-600"
                    />
                    <Globe className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <button
                    type="button"
                    onClick={handleTestLink}
                    className="flex items-center gap-1.5 rounded-lg border border-blue-300 bg-blue-100/70 px-3 py-2 text-xs font-semibold text-blue-800 hover:bg-blue-200 transition-colors shrink-0"
                    title="Uji buka link di tab baru"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Uji Tautan</span>
                  </button>
                </div>

                {/* Real-time Domain Extraction */}
                {urlDomain && (
                  <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-600">
                    <span className="font-semibold text-blue-700">Domain terdeteksi:</span>
                    <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {urlDomain}
                    </span>
                  </div>
                )}

                {urlDuplicateWarning && (
                  <p className="mt-1 text-[11px] text-amber-700 flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    Peringatan: Tautan ini telah digunakan pada asesmen lain. Pastikan ini bukan duplikasi tidak disengaja.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                <input
                  type="checkbox"
                  checked={canStudentOpen}
                  onChange={(e) => setCanStudentOpen(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span>Izinkan Peserta Didik Membuka Tautan Soal Secara Mandiri</span>
              </label>
            </div>
          </div>

          {/* Section 3: Waktu, Durasi, dan Jadwal WITA */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-[10px]">3</span>
              Penjadwalan & Waktu Pelaksanaan (Zona Waktu WITA)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Waktu Mulai (WITA)
                </label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Waktu Selesai (WITA)
                </label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Durasi Pengerjaan (Menit)
                </label>
                <input
                  type="number"
                  min="5"
                  max="240"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Status Publikasi Kegiatan
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Assessment['status'])}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold"
                >
                  <option value="draft">Draf (Disimpan Sementara)</option>
                  <option value="terjadwal">Terjadwal</option>
                  <option value="berlangsung">Sedang Berlangsung</option>
                  <option value="selesai">Selesai</option>
                  <option value="dibatalkan">Dibatalkan</option>
                </select>
              </div>
            </div>

            {/* Category specific fields */}
            {category === 'tka' && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-rose-900 block">Identifikasi TKA Resmi vs Simulasi Internal</span>
                  <span className="text-[11px] text-rose-700">Tandai apakah kegiatan ini merupakan TKA Resmi Kementerian/Daerah atau simulasi pembinaan madrasah.</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-rose-900">
                  <input
                    type="checkbox"
                    checked={isOfficialTka}
                    onChange={(e) => setIsOfficialTka(e.target.checked)}
                    className="h-4 w-4 rounded border-rose-400 text-rose-600"
                  />
                  <span>TKA Resmi</span>
                </label>
              </div>
            )}

            {category === 'try_out' && (
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Penyelenggara Try Out</label>
                <input
                  type="text"
                  placeholder="Contoh: KKG MI Kabupaten Paser / Lembaga Bimbingan"
                  value={tryOutOrganizer}
                  onChange={(e) => setTryOutOrganizer(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                />
              </div>
            )}

            {['sas', 'sat', 'tka'].includes(category) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Sesi Ujian</label>
                  <input
                    type="text"
                    placeholder="Contoh: Sesi 1 (08.00 - 09.30 WITA)"
                    value={examSession}
                    onChange={(e) => setExamSession(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Ruang / Lokasi Ujian</label>
                  <input
                    type="text"
                    placeholder="Contoh: Lab CBT 1 / Ruang Kelas 6A"
                    value={examRoom}
                    onChange={(e) => setExamRoom(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Penilaian, Petunjuk, & Tindak Lanjut */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-[10px]">4</span>
              Parameter Penilaian & Petunjuk Peserta
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Nilai Maksimal</label>
                <input
                  type="number"
                  value={maxScore}
                  onChange={(e) => setMaxScore(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Kriteria Ketuntasan (KKTP)</label>
                <input
                  type="number"
                  value={passingScore}
                  onChange={(e) => setPassingScore(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Nama Guru Pembuat</label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Kontak Guru (WA)</label>
                <input
                  type="text"
                  value={teacherContact}
                  onChange={(e) => setTeacherContact(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Petunjuk Pengerjaan Peserta Didik</label>
              <textarea
                rows={3}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs leading-relaxed"
                placeholder="Tuliskan petunjuk teknis yang jelas bagi peserta didik..."
              />
            </div>

            {category === 'formatif' && (
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Rencana Tindak Lanjut Pembelajaran</label>
                <input
                  type="text"
                  value={followUpPlan}
                  onChange={(e) => setFollowUpPlan(e.target.value)}
                  placeholder="Contoh: Siswa di bawah KKTP akan mendapatkan pendampingan peer-tutoring..."
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
            >
              {assessmentToEdit ? 'Simpan Perubahan Asesmen' : 'Simpan ke Bank Tautan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
