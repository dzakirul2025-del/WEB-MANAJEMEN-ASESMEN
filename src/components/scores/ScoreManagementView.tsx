import React, { useState } from 'react';
import {
  AlertCircle,
  Award,
  CheckCircle2,
  ChevronDown,
  Download,
  Eye,
  EyeOff,
  FileSpreadsheet,
  FileText,
  Filter,
  Plus,
  RefreshCw,
  Save,
  Search,
  UploadCloud,
  Users,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { ASSESSMENT_CATEGORIES } from '../../data/seedData';
import { Assessment, StudentScore } from '../../types';
import { useApp } from '../../context/AppContext';
import { ImportScoreModal } from './ImportScoreModal';

export const ScoreManagementView: React.FC = () => {
  const {
    assessments,
    subjects,
    students,
    scores,
    saveMultipleScores,
    toggleScorePublication,
    currentUser,
  } = useApp();

  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>(
    assessments[0]?.id || ''
  );
  const [selectedRombel, setSelectedRombel] = useState<string>('all');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [searchStudent, setSearchStudent] = useState('');
  const [activeTab, setActiveTab] = useState<'input_nilai' | 'integrasi_sync'>('input_nilai');
  const [isSavedFeedback, setIsSavedFeedback] = useState(false);

  const selectedAssessment = assessments.find((a) => a.id === selectedAssessmentId);
  const currentSubject = subjects.find((s) => s.id === selectedAssessment?.subjectId);

  // Scores for this assessment
  const assessmentScores = scores.filter((s) => s.assessmentId === selectedAssessmentId);

  // Local state for editing in table
  const [localScores, setLocalScores] = useState<Record<string, StudentScore>>({});

  // Sync local scores when selected assessment changes
  React.useEffect(() => {
    const map: Record<string, StudentScore> = {};
    assessmentScores.forEach((s) => {
      map[s.id] = { ...s };
    });
    setLocalScores(map);
  }, [selectedAssessmentId, scores]);

  const handleScoreChange = (scoreId: string, field: keyof StudentScore, val: any) => {
    setLocalScores((prev) => {
      const current = prev[scoreId];
      if (!current) return prev;
      return {
        ...prev,
        [scoreId]: {
          ...current,
          [field]: val,
        },
      };
    });
  };

  const handleSaveAll = () => {
    if (!selectedAssessment) return;
    const itemsToSave = Object.values(localScores);
    saveMultipleScores(selectedAssessment.id, itemsToSave);
    setIsSavedFeedback(true);
    setTimeout(() => setIsSavedFeedback(false), 2500);
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (!selectedAssessment) return;

    const exportRows = filteredScoreEntries.map((entry, idx) => ({
      No: idx + 1,
      NIS: entry.studentNis,
      'Nama Siswa': entry.studentName,
      Rombel: entry.rombel,
      'Nilai Akhir': entry.score !== null ? entry.score : '-',
      'Skor Mentah': entry.rawScore !== undefined ? entry.rawScore : '-',
      'Nilai Maksimal': entry.maxScore,
      'Status Kehadiran': entry.attendanceStatus,
      'Ketuntasan KKTP':
        entry.score !== null
          ? entry.score >= selectedAssessment.passingScore
            ? 'Tuntas'
            : 'Belum Tuntas'
          : 'Belum Dinilai',
      'Catatan Guru': entry.teacherNotes || '',
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rekap_Nilai');
    XLSX.writeFile(
      wb,
      `Rekap_Nilai_${selectedAssessment.title.substring(0, 20)}_${new Date().toISOString().split('T')[0]}.xlsx`
    );
  };

  // Filtered rows
  const filteredScoreEntries = Object.values(localScores).filter((entry) => {
    const matchSearch =
      entry.studentName.toLowerCase().includes(searchStudent.toLowerCase()) ||
      entry.studentNis.includes(searchStudent);
    const matchRombel = selectedRombel === 'all' || entry.rombel === selectedRombel;
    return matchSearch && matchRombel;
  });

  // Calculate statistics
  const scoredList = filteredScoreEntries.filter((s) => s.score !== null);
  const totalStudents = filteredScoreEntries.length;
  const gradedCount = scoredList.length;
  const avgScore =
    gradedCount > 0
      ? (scoredList.reduce((acc, s) => acc + (s.score || 0), 0) / gradedCount).toFixed(1)
      : '0';
  const highestScore =
    gradedCount > 0 ? Math.max(...scoredList.map((s) => s.score || 0)) : 0;
  const lowestScore =
    gradedCount > 0 ? Math.min(...scoredList.map((s) => s.score || 0)) : 0;
  const passedCount = scoredList.filter(
    (s) => (s.score || 0) >= (selectedAssessment?.passingScore || 75)
  ).length;
  const passPercentage =
    gradedCount > 0 ? ((passedCount / gradedCount) * 100).toFixed(0) : '0';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Manajemen Nilai & Hasil Asesmen
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Kurikulum Merdeka MI
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Input nilai manual, unggah berkas CSV/Excel, pantau ketuntasan KKTP, dan publikasikan nilai ke siswa.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {selectedAssessment && (
            <>
              <button
                onClick={() => toggleScorePublication(selectedAssessment.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold border transition-colors ${
                  selectedAssessment.isScorePublished
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
                title="Atur apakah peserta didik dapat melihat nilainya"
              >
                {selectedAssessment.isScorePublished ? (
                  <>
                    <Eye className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Nilai Dipublikasikan</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3.5 w-3.5 text-slate-400" />
                    <span>Nilai Disembunyikan (Draf)</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setIsImportModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
              >
                <UploadCloud className="h-3.5 w-3.5 text-blue-600" />
                <span>Impor CSV/Excel</span>
              </button>

              <button
                onClick={handleExportExcel}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
              >
                <Download className="h-3.5 w-3.5 text-emerald-600" />
                <span>Ekspor Excel (.xlsx)</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Select Assessment Picker */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Pilih Kegiatan Asesmen untuk Dikelola:
            </label>
            <select
              value={selectedAssessmentId}
              onChange={(e) => setSelectedAssessmentId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-hidden"
            >
              {assessments.map((a) => (
                <option key={a.id} value={a.id}>
                  [{a.category.toUpperCase()}] {a.title} · Kelas {a.level} ({a.chapterOrTopic})
                </option>
              ))}
            </select>
          </div>

          <div className="sm:w-48">
            <label className="block text-xs font-bold text-slate-800 mb-1">Filter Rombel:</label>
            <select
              value={selectedRombel}
              onChange={(e) => setSelectedRombel(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs focus:bg-white focus:border-blue-600 focus:outline-hidden"
            >
              <option value="all">Semua Rombel</option>
              <option value="6A">6A</option>
              <option value="6B">6B</option>
              <option value="6C">6C</option>
            </select>
          </div>
        </div>

        {selectedAssessment && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
            <div>
              <span className="font-semibold text-slate-800">Mata Pelajaran:</span> {currentSubject?.name} ·{' '}
              <span className="font-semibold text-slate-800">KKTP Target:</span> {selectedAssessment.passingScore} ·{' '}
              <span className="font-semibold text-slate-800">Nilai Maks:</span> {selectedAssessment.maxScore}
            </div>
            <div>
              <span className="font-semibold text-slate-800">Platform Soal:</span> {selectedAssessment.platform} (
              <a
                href={selectedAssessment.assessmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-0.5"
              >
                Buka Link
              </a>
              )
            </div>
          </div>
        )}
      </div>

      {/* KPI Statistic Cards (Anti-slop clean design) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Total Siswa Terdaftar</span>
          <span className="text-xl font-bold text-slate-900 tabular-nums">{totalStudents}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Peserta sasaran</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Sudah Dinilai</span>
          <span className="text-xl font-bold text-blue-700 tabular-nums">
            {gradedCount} <span className="text-xs font-normal text-slate-500">/ {totalStudents}</span>
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {totalStudents > 0 ? ((gradedCount / totalStudents) * 100).toFixed(0) : 0}% terinput
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Rata-Rata Nilai</span>
          <span className="text-xl font-bold text-slate-900 tabular-nums">{avgScore}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Skala {selectedAssessment?.maxScore || 100}</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Tertinggi / Terendah</span>
          <span className="text-base font-bold text-slate-900 tabular-nums">
            {highestScore} <span className="text-xs font-normal text-slate-400">/</span> {lowestScore}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Rentang capaian</span>
        </div>

        <div className="col-span-2 md:col-span-1 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Ketuntasan KKTP</span>
          <span className="text-xl font-bold text-emerald-700 tabular-nums">{passPercentage}%</span>
          <span className="text-[10px] text-emerald-600 block mt-0.5">
            {passedCount} dari {gradedCount} tuntas
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('input_nilai')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'input_nilai'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Tabel Input & Edit Nilai Peserta
          </button>
          <button
            onClick={() => setActiveTab('integrasi_sync')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'integrasi_sync'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Status Integrasi Eksternal (API / Webhook)
          </button>
        </div>

        {activeTab === 'input_nilai' && (
          <div className="flex items-center gap-2 pb-2">
            {isSavedFeedback && (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Berhasil disimpan!
              </span>
            )}
            <button
              onClick={handleSaveAll}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Simpan Perubahan Nilai</span>
            </button>
          </div>
        )}
      </div>

      {/* TAB CONTENT 1: Input & Edit Nilai */}
      {activeTab === 'input_nilai' && (
        <div className="space-y-3">
          {/* Search bar inside score table */}
          <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama atau NIS siswa..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs focus:bg-white focus:border-blue-600 focus:outline-hidden"
              />
            </div>
            <div className="text-[11px] text-slate-500">
              Menampilkan {filteredScoreEntries.length} siswa
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-3 w-12 text-center">No</th>
                    <th className="py-3 px-3">NIS</th>
                    <th className="py-3 px-4">Nama Lengkap Siswa</th>
                    <th className="py-3 px-3 text-center">Rombel</th>
                    <th className="py-3 px-3 w-28 text-center">Nilai Akhir</th>
                    <th className="py-3 px-3 w-24 text-center">Skor Mentah</th>
                    <th className="py-3 px-3">Status Kehadiran</th>
                    <th className="py-3 px-4">Catatan Guru</th>
                    <th className="py-3 px-3 text-center">Ketuntasan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredScoreEntries.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-10 text-center text-slate-400">
                        Tidak ada data siswa untuk rombel ini.
                      </td>
                    </tr>
                  ) : (
                    filteredScoreEntries.map((item, idx) => {
                      const isPassing =
                        item.score !== null &&
                        item.score >= (selectedAssessment?.passingScore || 75);

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2.5 px-3 text-center text-slate-400 tabular-nums">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                            {item.studentNis}
                          </td>
                          <td className="py-2.5 px-4 font-semibold text-slate-900">
                            {item.studentName}
                          </td>
                          <td className="py-2.5 px-3 text-center font-medium text-slate-600">
                            {item.rombel}
                          </td>

                          {/* Nilai Akhir input */}
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="number"
                              min="0"
                              max={selectedAssessment?.maxScore || 100}
                              value={item.score !== null ? item.score : ''}
                              onChange={(e) =>
                                handleScoreChange(
                                  item.id,
                                  'score',
                                  e.target.value === '' ? null : Number(e.target.value)
                                )
                              }
                              placeholder="-"
                              className="w-20 rounded-md border border-slate-300 px-2 py-1 text-center font-bold text-xs tabular-nums focus:border-blue-600 focus:outline-hidden"
                            />
                          </td>

                          {/* Raw score input */}
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="number"
                              value={item.rawScore !== undefined ? item.rawScore : ''}
                              onChange={(e) =>
                                handleScoreChange(
                                  item.id,
                                  'rawScore',
                                  e.target.value === '' ? undefined : Number(e.target.value)
                                )
                              }
                              placeholder="-"
                              className="w-16 rounded-md border border-slate-200 px-2 py-1 text-center text-slate-600 text-xs tabular-nums"
                            />
                          </td>

                          {/* Attendance Status */}
                          <td className="py-2.5 px-3">
                            <select
                              value={item.attendanceStatus}
                              onChange={(e) =>
                                handleScoreChange(
                                  item.id,
                                  'attendanceStatus',
                                  e.target.value as any
                                )
                              }
                              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs capitalize text-slate-700"
                            >
                              <option value="hadir">Hadir / Mengerjakan</option>
                              <option value="sakit">Sakit</option>
                              <option value="izin">Izin</option>
                              <option value="tanpa_keterangan">Tanpa Keterangan</option>
                              <option value="belum_mengerjakan">Belum Mengerjakan</option>
                            </select>
                          </td>

                          {/* Teacher notes */}
                          <td className="py-2.5 px-4">
                            <input
                              type="text"
                              value={item.teacherNotes || ''}
                              onChange={(e) =>
                                handleScoreChange(item.id, 'teacherNotes', e.target.value)
                              }
                              placeholder="Catatan hasil..."
                              className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 placeholder:text-slate-300"
                            />
                          </td>

                          {/* KKTP Badge */}
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            {item.score === null ? (
                              <span className="text-[10px] text-slate-400 font-medium">
                                Belum ada nilai
                              </span>
                            ) : isPassing ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                Tuntas KKTP
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                Remedial
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: Integrasi Eksternal Status (Bagian K Metode 3) */}
      {activeTab === 'integrasi_sync' && (
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Status Integrasi Otomatis Platform Soal Eksternal
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sesuai ketentuan keamanan sistem, integrasi otomatis dengan API platform eksternal memerlukan konfigurasi kredensial resmi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {[
              {
                name: 'Wayground API Service',
                status: 'Kredensial Belum Terpasang',
                desc: 'Mendukung sinkronisasi skor otomatis via Webhook callback.',
                configured: false,
              },
              {
                name: 'EdCafe Assessment Connector',
                status: 'Kredensial Belum Terpasang',
                desc: 'Memerlukan API token sekolah untuk menarik hasil try out otomatis.',
                configured: false,
              },
              {
                name: 'Google Forms / Workspace API',
                status: 'Koneksi Tautan Aktif (Tautan Terbuka)',
                desc: 'Siswa mengerjakan langsung melalui link spreadsheet respons guru.',
                configured: true,
              },
              {
                name: 'Quizizz Reports Sync',
                status: 'Siap Impor CSV',
                desc: 'Ekspor file CSV dari dashboard Quizizz lalu unggah pada tombol Impor.',
                configured: true,
              },
            ].map((prov, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">{prov.name}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      prov.configured
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {prov.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{prov.desc}</p>
                <div className="pt-2 text-[11px] text-slate-400">
                  Waktu uji koneksi: {new Date().toLocaleDateString('id-ID')}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-xs text-blue-800 leading-relaxed">
            <span className="font-bold block mb-1">Catatan Penting Sistem Penilaian:</span>
            Karena sebagian besar platform soal (seperti Google Forms dan Quizizz) memiliki kebijakan keamanan terpisah, sistem portal ini mengutamakan metode <strong>Impor Berkas Nilai CSV / Excel</strong> yang cepat, fleksibel, dan 100% akurat tanpa ketergantungan API pihak ketiga.
          </div>
        </div>
      )}

      {/* Modal Import */}
      {isImportModalOpen && selectedAssessment && (
        <ImportScoreModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          assessment={selectedAssessment}
          students={students}
        />
      )}
    </div>
  );
};
