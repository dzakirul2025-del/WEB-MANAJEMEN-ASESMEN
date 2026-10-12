import React, { useState } from 'react';
import {
  Award,
  BarChart3,
  CheckCircle,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  Search,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { ASSESSMENT_CATEGORIES } from '../../data/seedData';
import { AssessmentCategoryType } from '../../types';
import { useApp } from '../../context/AppContext';

export const ReportsView: React.FC = () => {
  const { assessments, subjects, scores, settings, students, classes, teachers } = useApp();

  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>(
    assessments[0]?.id || ''
  );
  const [selectedRombel, setSelectedRombel] = useState<string>('all');

  const selectedAssessment = assessments.find((a) => a.id === selectedAssessmentId);
  const subject = subjects.find((s) => s.id === selectedAssessment?.subjectId);
  const teacher = teachers.find((t) => t.id === selectedAssessment?.teacherId);

  // Scores for this assessment
  const assessmentScores = scores.filter((s) => s.assessmentId === selectedAssessmentId);

  const filteredScores = assessmentScores.filter((s) => {
    return selectedRombel === 'all' || s.rombel === selectedRombel;
  });

  // Analytics
  const gradedList = filteredScores.filter((s) => s.score !== null);
  const totalStudents = filteredScores.length;
  const gradedCount = gradedList.length;
  const avg =
    gradedCount > 0
      ? (gradedList.reduce((acc, s) => acc + (s.score || 0), 0) / gradedCount).toFixed(1)
      : '0';
  const highest = gradedCount > 0 ? Math.max(...gradedList.map((s) => s.score || 0)) : 0;
  const lowest = gradedCount > 0 ? Math.min(...gradedList.map((s) => s.score || 0)) : 0;
  const passed = gradedList.filter(
    (s) => (s.score || 0) >= (selectedAssessment?.passingScore || 75)
  ).length;
  const passRate = gradedCount > 0 ? ((passed / gradedCount) * 100).toFixed(0) : '0';

  // Score distribution brackets
  const bracketA = gradedList.filter((s) => (s.score || 0) >= 90).length;
  const bracketB = gradedList.filter((s) => (s.score || 0) >= 80 && (s.score || 0) < 90).length;
  const bracketC = gradedList.filter(
    (s) => (s.score || 0) >= (selectedAssessment?.passingScore || 75) && (s.score || 0) < 80
  ).length;
  const bracketD = gradedList.filter(
    (s) => (s.score || 0) < (selectedAssessment?.passingScore || 75)
  ).length;

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    if (!selectedAssessment) return;
    const exportRows = filteredScores.map((s, idx) => ({
      No: idx + 1,
      NIS: s.studentNis,
      'Nama Peserta Didik': s.studentName,
      Rombel: s.rombel,
      'Nilai Akhir': s.score !== null ? s.score : '-',
      'Nilai Maksimal': s.maxScore,
      'KKTP Standard': selectedAssessment.passingScore,
      Ketuntasan:
        s.score !== null
          ? s.score >= selectedAssessment.passingScore
            ? 'Tuntas'
            : 'Remedial'
          : 'Belum Dinilai',
      'Status Kehadiran': s.attendanceStatus,
      'Catatan Guru': s.teacherNotes || '',
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan_Asesmen');
    XLSX.writeFile(
      wb,
      `Laporan_Resmi_${selectedAssessment.title.substring(0, 20)}_${settings.academicYear.replace('/', '-')}.xlsx`
    );
  };

  return (
    <div className="space-y-6">
      {/* Action Header - Hidden during print */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Rekapitulasi & Laporan Hasil Asesmen
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              Format Resmi Kemenag
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Cetak lembar laporan resmi evaluasi pembelajaran atau unduh rekapitulasi data format Excel.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors shrink-0"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak Dokumen Resmi (PDF)</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs shrink-0"
          >
            <Download className="h-4 w-4 text-emerald-600" />
            <span>Unduh Excel</span>
          </button>
        </div>
      </div>

      {/* Selector Toolbar - Hidden during print */}
      <div className="no-print grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Pilih Asesmen untuk Dicetak:
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

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">Filter Rombongan Belajar:</label>
          <select
            value={selectedRombel}
            onChange={(e) => setSelectedRombel(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs focus:bg-white focus:border-blue-600 focus:outline-hidden"
          >
            <option value="all">Semua Rombel Sasaran</option>
            <option value="6A">6A</option>
            <option value="6B">6B</option>
            <option value="6C">6C</option>
          </select>
        </div>
      </div>

      {/* DOCUMENT PREVIEW CONTAINER (Styled for Screen & High-Res Print) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
        {/* KOP SURAT RESMI MADRASAH IBTIDAIYAH NEGERI 1 PASER */}
        <div className="border-b-4 border-double border-slate-900 pb-4 text-center">
          <div className="flex items-center justify-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-900 text-white font-extrabold text-xl">
              MI
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-600">
                Kementerian Agama Republik Indonesia
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Kantor Kementerian Agama Kabupaten Paser
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold uppercase tracking-tight text-slate-900">
                {settings.schoolName}
              </h2>
              <p className="text-[11px] text-slate-600">
                {settings.address}, Kec. {settings.subdistrict}, Kab. Paser, Kalimantan Timur {settings.postalCode}
              </p>
              <p className="text-[10px] text-slate-500">
                Surel: {settings.email} · Laman: {settings.website}
              </p>
            </div>
          </div>
        </div>

        {/* Report Title */}
        <div className="text-center my-6 space-y-1">
          <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-900 underline">
            Laporan Rekapitulasi Hasil Asesmen Peserta Didik
          </h3>
          <p className="text-xs text-slate-600">
            Tahun Pelajaran {settings.academicYear} · Semester {settings.activeSemester}
          </p>
        </div>

        {/* Assessment Meta Block */}
        {selectedAssessment && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-xs text-slate-700 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="space-y-1">
              <div>
                <span className="font-semibold text-slate-900">Kegiatan Asesmen:</span>{' '}
                {selectedAssessment.title}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Kategori:</span>{' '}
                {selectedAssessment.category.replace('_', ' ').toUpperCase()}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Mata Pelajaran:</span>{' '}
                {subject?.name} ({subject?.code})
              </div>
              <div>
                <span className="font-semibold text-slate-900">Materi / Bab:</span>{' '}
                {selectedAssessment.chapterOrTopic}
              </div>
            </div>

            <div className="space-y-1">
              <div>
                <span className="font-semibold text-slate-900">Jenjang / Kelas:</span> Kelas{' '}
                {selectedAssessment.level} ({selectedAssessment.rombelTargets.join(', ')})
              </div>
              <div>
                <span className="font-semibold text-slate-900">Kriteria Ketuntasan (KKTP):</span>{' '}
                {selectedAssessment.passingScore}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Guru Pengampu:</span>{' '}
                {selectedAssessment.teacherName}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Waktu Pelaksanaan:</span>{' '}
                {new Date(selectedAssessment.startTime).toLocaleDateString('id-ID', { dateStyle: 'long' })} (WITA)
              </div>
            </div>
          </div>
        )}

        {/* Summary Statistics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mb-6">
          <div className="border border-slate-200 rounded-lg p-2.5 bg-white">
            <span className="text-[11px] text-slate-500 block">Peserta Dinilai</span>
            <span className="text-base font-bold text-slate-900 tabular-nums">
              {gradedCount} / {totalStudents}
            </span>
          </div>
          <div className="border border-slate-200 rounded-lg p-2.5 bg-white">
            <span className="text-[11px] text-slate-500 block">Rata-Rata Kelas</span>
            <span className="text-base font-bold text-slate-900 tabular-nums">{avg}</span>
          </div>
          <div className="border border-slate-200 rounded-lg p-2.5 bg-white">
            <span className="text-[11px] text-slate-500 block">Nilai Tertinggi / Terendah</span>
            <span className="text-base font-bold text-slate-900 tabular-nums">
              {highest} / {lowest}
            </span>
          </div>
          <div className="border border-slate-200 rounded-lg p-2.5 bg-white">
            <span className="text-[11px] text-slate-500 block">Ketuntasan KKTP</span>
            <span className="text-base font-bold text-emerald-700 tabular-nums">{passRate}% ({passed} siswa)</span>
          </div>
        </div>

        {/* Official Grade Table */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-left text-xs border border-slate-300">
            <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
              <tr>
                <th className="py-2.5 px-3 border-r border-slate-300 text-center w-10">No</th>
                <th className="py-2.5 px-3 border-r border-slate-300">NIS</th>
                <th className="py-2.5 px-4 border-r border-slate-300">Nama Lengkap Peserta Didik</th>
                <th className="py-2.5 px-3 border-r border-slate-300 text-center w-16">Kelas</th>
                <th className="py-2.5 px-3 border-r border-slate-300 text-center w-20">Nilai</th>
                <th className="py-2.5 px-3 border-r border-slate-300 text-center w-24">Ketuntasan</th>
                <th className="py-2.5 px-3 border-r border-slate-300 text-center w-24">Kehadiran</th>
                <th className="py-2.5 px-4">Keterangan / Tindak Lanjut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredScores.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-400">
                    Belum ada catatan nilai untuk rombel ini.
                  </td>
                </tr>
              ) : (
                filteredScores.map((s, idx) => {
                  const isPass =
                    s.score !== null &&
                    s.score >= (selectedAssessment?.passingScore || 75);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 border-r border-slate-200 text-center tabular-nums text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 font-mono text-[11px]">
                        {s.studentNis}
                      </td>
                      <td className="py-2 px-4 border-r border-slate-200 font-medium text-slate-900">
                        {s.studentName}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-center font-semibold text-slate-700">
                        {s.rombel}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-center font-bold tabular-nums">
                        {s.score !== null ? s.score : '-'}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-center font-semibold">
                        {s.score === null ? (
                          <span className="text-slate-400">-</span>
                        ) : isPass ? (
                          <span className="text-emerald-700">Tuntas</span>
                        ) : (
                          <span className="text-amber-700">Remedial</span>
                        )}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-center capitalize text-slate-600">
                        {s.attendanceStatus.replace('_', ' ')}
                      </td>
                      <td className="py-2 px-4 text-slate-600 text-[11px]">
                        {s.teacherNotes || '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Official Signatures Block (Standard Indonesian Ministry of Religious Affairs) */}
        <div className="grid grid-cols-2 gap-8 text-xs text-slate-800 pt-6 border-t border-slate-200">
          <div className="text-center space-y-1">
            <p>Mengetahui,</p>
            <p className="font-bold">Kepala Madrasah Ibtidaiyah Negeri 1 Paser</p>
            <div className="h-20" /> {/* Space for signature and stamp */}
            <p className="font-bold underline tracking-wide">{settings.headmasterName}</p>
            <p className="text-[11px] text-slate-600">NIP. {settings.headmasterNip}</p>
          </div>

          <div className="text-center space-y-1">
            <p>Tanah Grogot, {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
            <p className="font-bold">Guru Pengampu Mata Pelajaran</p>
            <div className="h-20" />
            <p className="font-bold underline tracking-wide">
              {selectedAssessment?.teacherName || settings.developerName}
            </p>
            <p className="text-[11px] text-slate-600">NIP. {teacher?.nip || '198902142014031002'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
