import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  UploadCloud,
  X,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Assessment, Student } from '../../types';
import { useApp } from '../../context/AppContext';

interface ImportScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: Assessment;
  students: Student[];
}

interface ParsedRow {
  nis: string;
  name: string;
  score: number;
  rawScore?: number;
  attendanceStatus?: 'hadir' | 'sakit' | 'izin' | 'tanpa_keterangan' | 'belum_mengerjakan';
  notes?: string;
  isValid: boolean;
  validationError?: string;
}

export const ImportScoreModal: React.FC<ImportScoreModalProps> = ({
  isOpen,
  onClose,
  assessment,
  students,
}) => {
  const { importScoresBatch } = useApp();

  const [fileName, setFileName] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  if (!isOpen) return null;

  // Generate and download standard CSV Template
  const handleDownloadTemplate = () => {
    const targetStudents = students.filter(
      (s) =>
        s.classId.includes(assessment.level.toString()) ||
        assessment.rombelTargets.includes('Semua') ||
        assessment.rombelTargets.includes(s.rombel)
    );

    const data = [
      ['NIS', 'NAMA_LENGKAP', 'ROMBEL', 'NILAI_AKHIR', 'SKOR_MENTAH', 'STATUS_KEHADIRAN', 'CATATAN_GURU'],
      ...targetStudents.map((std) => [
        std.nis,
        std.fullName,
        std.rombel,
        '', // empty for teacher to fill
        '',
        'hadir',
        '',
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template_Nilai');
    XLSX.writeFile(wb, `Template_Nilai_${assessment.title.substring(0, 20)}.xlsx`);
  };

  // Handle file upload (CSV or XLSX)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setImportResult(null);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawJson: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (rawJson.length <= 1) {
          alert('Berkas kosong atau tidak memiliki baris data.');
          setIsProcessing(false);
          return;
        }

        // Header mapping
        const headers: string[] = rawJson[0].map((h: any) =>
          String(h).trim().toUpperCase()
        );

        const nisIdx = headers.findIndex((h) => h.includes('NIS'));
        const nameIdx = headers.findIndex((h) => h.includes('NAMA'));
        const scoreIdx = headers.findIndex((h) => h.includes('NILAI') || h.includes('SCORE'));
        const rawScoreIdx = headers.findIndex((h) => h.includes('SKOR'));
        const statusIdx = headers.findIndex((h) => h.includes('STATUS'));
        const notesIdx = headers.findIndex((h) => h.includes('CATATAN') || h.includes('NOTE'));

        const rows: ParsedRow[] = [];

        for (let i = 1; i < rawJson.length; i++) {
          const row = rawJson[i];
          if (!row || row.length === 0) continue;

          const nis = String(row[nisIdx] || '').trim();
          const name = String(row[nameIdx] || '').trim();
          const rawScoreVal = row[scoreIdx];
          const scoreNum = Number(rawScoreVal);

          let isValid = true;
          let validationError = '';

          // Validate NIS or name
          const matchedStudent = students.find(
            (s) =>
              (nis && s.nis.toLowerCase() === nis.toLowerCase()) ||
              (name && s.fullName.toLowerCase() === name.toLowerCase())
          );

          if (!matchedStudent) {
            isValid = false;
            validationError = `NIS '${nis}' atau Nama '${name}' tidak terdaftar di database siswa.`;
          } else if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > assessment.maxScore) {
            isValid = false;
            validationError = `Nilai '${rawScoreVal}' harus berupa angka antara 0 dan ${assessment.maxScore}.`;
          }

          rows.push({
            nis: matchedStudent ? matchedStudent.nis : nis,
            name: matchedStudent ? matchedStudent.fullName : name,
            score: isNaN(scoreNum) ? 0 : scoreNum,
            rawScore: row[rawScoreIdx] ? Number(row[rawScoreIdx]) : undefined,
            attendanceStatus: (row[statusIdx] as any) || 'hadir',
            notes: row[notesIdx] ? String(row[notesIdx]) : undefined,
            isValid,
            validationError,
          });
        }

        setParsedRows(rows);
      } catch (err) {
        console.error('File parsing error', err);
        alert('Gagal membaca berkas. Pastikan format CSV atau Excel valid.');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleConfirmImport = () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      alert('Tidak ada baris data yang valid untuk diimpor.');
      return;
    }

    const res = importScoresBatch(assessment.id, validRows);
    setImportResult(res);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                Impor Hasil Nilai Asesmen (CSV / Excel)
              </h2>
              <p className="text-xs text-slate-300">
                {assessment.title} (Maks: {assessment.maxScore})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Step 1: Download Template */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <span className="font-bold text-slate-800 block text-xs">
                Langkah 1: Unduh Format Template Standar
              </span>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Template telah disesuaikan dengan daftar nama dan NIS siswa kelas sasaran.
              </p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 shadow-xs shrink-0 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Unduh Template Excel</span>
            </button>
          </div>

          {/* Step 2: Upload File */}
          <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-6 text-center hover:border-emerald-500 transition-colors">
            <UploadCloud className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
            <span className="font-bold text-slate-800 block text-xs">
              Langkah 2: Unggah Berkas Hasil Nilai (.csv atau .xlsx)
            </span>
            <p className="text-[11px] text-slate-500 mt-1 mb-3">
              Seret berkas ke sini atau klik tombol di bawah untuk memilih berkas dari komputer.
            </p>
            <input
              type="file"
              accept=".csv, .xlsx, .xls"
              onChange={handleFileUpload}
              className="hidden"
              id="score-file-upload"
            />
            <label
              htmlFor="score-file-upload"
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-xs"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Pilih Berkas Nilai</span>
            </label>
            {fileName && (
              <div className="mt-2 text-xs font-semibold text-emerald-700">
                Berkas terpilih: {fileName}
              </div>
            )}
          </div>

          {/* Result Alert */}
          {importResult && (
            <div
              className={`rounded-xl p-4 border ${
                importResult.failed === 0
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-amber-200 bg-amber-50 text-amber-800'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs">
                {importResult.failed === 0 ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                )}
                <span>
                  Hasil Impor: {importResult.success} baris berhasil disimpan
                  {importResult.failed > 0 && `, ${importResult.failed} baris ditolak.`}
                </span>
              </div>
              {importResult.errors.length > 0 && (
                <ul className="mt-2 space-y-1 list-disc pl-5 text-[11px]">
                  {importResult.errors.slice(0, 5).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                  {importResult.errors.length > 5 && (
                    <li>...dan {importResult.errors.length - 5} kesalahan lainnya.</li>
                  )}
                </ul>
              )}
            </div>
          )}

          {/* Step 3: Data Preview */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs">
                  Pratinjau & Validasi Data ({parsedRows.length} Baris Terdeteksi)
                </span>
                <span className="text-[11px] text-slate-500">
                  Valid: {parsedRows.filter((r) => r.isValid).length} · Tidak Valid:{' '}
                  {parsedRows.filter((r) => !r.isValid).length}
                </span>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold sticky top-0">
                      <tr>
                        <th className="py-2 px-3">NIS</th>
                        <th className="py-2 px-3">Nama Siswa</th>
                        <th className="py-2 px-3 text-right">Nilai Akhir</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3">Validasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedRows.map((r, i) => (
                        <tr
                          key={i}
                          className={r.isValid ? 'hover:bg-slate-50' : 'bg-red-50/50 hover:bg-red-50'}
                        >
                          <td className="py-2 px-3 font-mono">{r.nis || '-'}</td>
                          <td className="py-2 px-3 font-medium text-slate-800">{r.name}</td>
                          <td className="py-2 px-3 text-right font-bold tabular-nums">
                            {r.score}
                          </td>
                          <td className="py-2 px-3 text-slate-600 capitalize">
                            {r.attendanceStatus}
                          </td>
                          <td className="py-2 px-3">
                            {r.isValid ? (
                              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Valid
                              </span>
                            ) : (
                              <span className="text-red-600 font-medium" title={r.validationError}>
                                {r.validationError}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
          <span className="text-[11px] text-slate-500">
            Nilai yang diimpor akan menggantikan catatan nilai siswa bersangkutan setelah konfirmasi.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Tutup
            </button>
            <button
              disabled={parsedRows.length === 0 || parsedRows.filter((r) => r.isValid).length === 0}
              onClick={handleConfirmImport}
              className="rounded-lg bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Konfirmasi Simpan Nilai
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
