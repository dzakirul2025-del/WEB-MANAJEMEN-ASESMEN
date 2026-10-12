import React, { useState, useRef } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Edit,
  Eye,
  FileSpreadsheet,
  GraduationCap,
  LogIn,
  MoreVertical,
  Phone,
  Plus,
  Printer,
  QrCode,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Upload,
  UploadCloud,
  User,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Student, StudentScore } from '../../types';
import { useApp } from '../../context/AppContext';

interface ParsedStudentRow {
  rowNumber: number;
  nis: string;
  nisn: string;
  attendanceNumber: number;
  fullName: string;
  rombel: string;
  classId: string;
  gender: 'L' | 'P';
  parentName: string;
  parentPhone: string;
  isValid: boolean;
  validationError?: string;
}

export const StudentsView: React.FC = () => {
  const {
    students,
    addStudent,
    updateStudent,
    deleteStudent,
    deleteStudentsBulk,
    updateStudentsRombelBulk,
    importStudentsBulk,
    classes,
    scores,
    assessments,
    currentUser,
    loginStudent,
    settings,
  } = useApp();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');

  // Selected students for Bulk Actions
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Single Delete Confirmation Modal
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Bulk Delete Confirmation Modal
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Bulk Move Rombel Modal
  const [isBulkMoveModalOpen, setIsBulkMoveModalOpen] = useState(false);
  const [bulkTargetRombel, setBulkTargetRombel] = useState('6A');

  // Detail Modal
  const [studentForDetail, setStudentForDetail] = useState<Student | null>(null);

  // Exam Card (Kartu Ujian) Modal
  const [examCardStudents, setExamCardStudents] = useState<Student[]>([]);
  const [isExamCardModalOpen, setIsExamCardModalOpen] = useState(false);

  // Active Action Dropdown (per student row)
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Toast notification
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Form states for manual input / edit
  const [nis, setNis] = useState('');
  const [nisn, setNisn] = useState('');
  const [attendanceNumber, setAttendanceNumber] = useState<number>(1);
  const [fullName, setFullName] = useState('');
  const [rombel, setRombel] = useState('6A');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  // Excel Import states
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [updateExistingOnImport, setUpdateExistingOnImport] = useState(true);
  const [importStatusMessage, setImportStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const canManage =
    currentUser.role === 'super_admin' ||
    currentUser.role === 'guru' ||
    currentUser.role === 'wali_kelas';

  // Filtered students
  const filteredStudents = students.filter((s) => {
    const term = search.toLowerCase().trim();
    const matchSearch =
      !term ||
      s.fullName.toLowerCase().includes(term) ||
      s.nis.toLowerCase().includes(term) ||
      (s.nisn && s.nisn.toLowerCase().includes(term)) ||
      (s.attendanceNumber && s.attendanceNumber.toString() === term);
    const matchClass = classFilter === 'all' || s.rombel === classFilter;
    return matchSearch && matchClass;
  });

  // Calculate next attendance number for selected rombel
  const getNextAttendanceNumber = (targetRombel: string) => {
    const existingInRombel = students.filter((s) => s.rombel === targetRombel);
    if (existingInRombel.length === 0) return 1;
    const maxNum = Math.max(
      ...existingInRombel.map((s) => s.attendanceNumber || 0),
      0
    );
    return maxNum + 1;
  };

  // Selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedStudentIds(filteredStudents.map((s) => s.id));
    } else {
      setSelectedStudentIds([]);
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Open Add Manual Modal
  const handleOpenAdd = () => {
    setEditingStudent(null);
    const defaultRombel = classFilter !== 'all' ? classFilter : '6A';
    setNis(`2021${String(students.length + 1).padStart(3, '0')}`);
    setNisn('');
    setAttendanceNumber(getNextAttendanceNumber(defaultRombel));
    setFullName('');
    setRombel(defaultRombel);
    setGender('L');
    setParentName('');
    setParentPhone('');
    setIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (s: Student) => {
    setEditingStudent(s);
    setNis(s.nis);
    setNisn(s.nisn || '');
    setAttendanceNumber(s.attendanceNumber || 1);
    setFullName(s.fullName);
    setRombel(s.rombel);
    setGender(s.gender);
    setParentName(s.parentName || '');
    setParentPhone(s.parentPhone || '');
    setIsActive(s.isActive !== false);
    setFormError(null);
    setOpenDropdownId(null);
    setIsModalOpen(true);
  };

  // Submit Add / Edit Manual
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nis.trim()) {
      setFormError('Nomor Induk Siswa (NIS) wajib diisi.');
      return;
    }
    if (!fullName.trim()) {
      setFormError('Nama Lengkap Siswa wajib diisi.');
      return;
    }

    const classItem = classes.find((c) => c.rombel === rombel);
    const classId = classItem ? classItem.id : `cls-${rombel.toLowerCase()}`;

    if (editingStudent) {
      updateStudent({
        ...editingStudent,
        nis: nis.trim(),
        nisn: nisn.trim() || undefined,
        attendanceNumber: Number(attendanceNumber) || 1,
        fullName: fullName.trim(),
        rombel,
        classId,
        gender,
        parentName: parentName.trim() || undefined,
        parentPhone: parentPhone.trim() || undefined,
        isActive,
      });
      showToast(`Data siswa "${fullName.trim()}" berhasil diperbarui.`);
    } else {
      addStudent({
        nis: nis.trim(),
        nisn: nisn.trim() || undefined,
        attendanceNumber: Number(attendanceNumber) || 1,
        fullName: fullName.trim(),
        rombel,
        classId,
        gender,
        parentName: parentName.trim() || undefined,
        parentPhone: parentPhone.trim() || undefined,
        isActive,
      });
      showToast(`Data siswa baru "${fullName.trim()}" berhasil disimpan.`);
    }

    setIsModalOpen(false);
  };

  // Confirm Single Delete
  const handleConfirmSingleDelete = () => {
    if (!studentToDelete) return;
    deleteStudent(studentToDelete.id);
    setSelectedStudentIds((prev) => prev.filter((id) => id !== studentToDelete.id));
    showToast(`Data siswa "${studentToDelete.fullName}" berhasil dihapus.`);
    setStudentToDelete(null);
  };

  // Confirm Bulk Delete
  const handleConfirmBulkDelete = () => {
    if (selectedStudentIds.length === 0) return;
    const count = selectedStudentIds.length;
    deleteStudentsBulk(selectedStudentIds);
    setSelectedStudentIds([]);
    showToast(`${count} data siswa berhasil dihapus secara massal.`);
    setIsBulkDeleteModalOpen(false);
  };

  // Confirm Bulk Move Rombel
  const handleConfirmBulkMove = () => {
    if (selectedStudentIds.length === 0) return;
    const classItem = classes.find((c) => c.rombel === bulkTargetRombel);
    const classId = classItem ? classItem.id : `cls-${bulkTargetRombel.toLowerCase()}`;
    const count = selectedStudentIds.length;

    updateStudentsRombelBulk(selectedStudentIds, bulkTargetRombel, classId);
    setSelectedStudentIds([]);
    showToast(`${count} siswa berhasil dipindahkan ke rombel ${bulkTargetRombel}.`);
    setIsBulkMoveModalOpen(false);
  };

  // Open Exam Card Modal (Single or Bulk)
  const handleOpenExamCard = (targetStudents: Student[]) => {
    setExamCardStudents(targetStudents);
    setIsExamCardModalOpen(true);
    setOpenDropdownId(null);
  };

  // Simulate Student Login
  const handleSimulateLogin = (s: Student) => {
    const res = loginStudent(s.fullName, s.attendanceNumber || 1, s.rombel);
    if (res.success) {
      showToast(`Beralih ke sesi siswa: ${s.fullName} (Absen #${s.attendanceNumber || 1})`);
    } else {
      showToast(res.message || 'Gagal login sebagai siswa ini.', 'error');
    }
  };

  // Export current students to Excel
  const handleExportStudents = (dataToExport: Student[] = filteredStudents) => {
    const data = dataToExport.map((s, idx) => ({
      'No.': idx + 1,
      'Nomor Absen': s.attendanceNumber || idx + 1,
      'NIS': s.nis,
      'NISN': s.nisn || '-',
      'Nama Lengkap Siswa': s.fullName,
      'Jenis Kelamin': s.gender === 'L' ? 'L' : 'P',
      'Rombel Kelas': s.rombel,
      'Nama Orang Tua / Wali': s.parentName || '-',
      'No. Telepon / WhatsApp': s.parentPhone || '-',
      'Status': s.isActive ? 'Aktif' : 'Nonaktif',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data_Peserta_Didik');
    XLSX.writeFile(
      wb,
      `Data_Siswa_MIN1Paser_${new Date().toISOString().split('T')[0]}.xlsx`
    );
    showToast(`Berhasil mengekspor ${dataToExport.length} data siswa ke Excel.`);
  };

  // Download Sample Template for Excel Import
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Nomor Absen': 1,
        'NIS': '2021021',
        'NISN': '0123456793',
        'Nama Lengkap': 'Muhammad Rayyan Al-Farizi',
        'Jenis Kelamin': 'L',
        'Rombel': '6A',
        'Nama Orang Tua': 'H. Fariz Rahman',
        'No Telepon Wali': '081234567890',
      },
      {
        'Nomor Absen': 2,
        'NIS': '2021022',
        'NISN': '0123456794',
        'Nama Lengkap': 'Fathimah Az-Zahra',
        'Jenis Kelamin': 'P',
        'Rombel': '6A',
        'Nama Orang Tua': 'Ahmad Fauzi',
        'No Telepon Wali': '081345678901',
      },
      {
        'Nomor Absen': 3,
        'NIS': '2021023',
        'NISN': '0123456795',
        'Nama Lengkap': 'Ibrahim Hanif',
        'Jenis Kelamin': 'L',
        'Rombel': '6B',
        'Nama Orang Tua': 'Supriyanto',
        'No Telepon Wali': '082156789012',
      },
      {
        'Nomor Absen': 4,
        'NIS': '2021024',
        'NISN': '0123456796',
        'Nama Lengkap': 'Amina Syakira Putri',
        'Jenis Kelamin': 'P',
        'Rombel': '6B',
        'Nama Orang Tua': 'Ir. Hendra',
        'No Telepon Wali': '085234567890',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    ws['!cols'] = [
      { wch: 14 },
      { wch: 12 },
      { wch: 14 },
      { wch: 30 },
      { wch: 14 },
      { wch: 10 },
      { wch: 24 },
      { wch: 18 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template_Impor_Siswa');
    XLSX.writeFile(wb, 'Format_Impor_Data_Siswa_MIN1Paser.xlsx');
  };

  // Process Excel File Upload & Parse
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);
    setImportStatusMessage(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
          defval: '',
        });

        if (jsonRows.length === 0) {
          setImportStatusMessage({
            type: 'error',
            text: 'File Excel kosong atau tidak memiliki data pada lembar pertama.',
          });
          setParsedRows([]);
          return;
        }

        const parsed: ParsedStudentRow[] = jsonRows.map((rawRow, idx) => {
          const getVal = (possibleKeys: string[]): string => {
            for (const key of possibleKeys) {
              const foundKey = Object.keys(rawRow).find(
                (k) => k.trim().toLowerCase() === key.toLowerCase()
              );
              if (foundKey && rawRow[foundKey] !== undefined && rawRow[foundKey] !== null) {
                return String(rawRow[foundKey]).trim();
              }
            }
            return '';
          };

          const rawAbsen = getVal([
            'nomor absen',
            'no absen',
            'absen',
            'no. absen',
            'nomor_absen',
            'no',
            'no.',
          ]);
          const rawNis = getVal(['nis', 'nomor induk', 'no induk', 'nis_siswa']);
          const rawNisn = getVal(['nisn', 'nomor induk siswa nasional']);
          const rawName = getVal([
            'nama lengkap',
            'nama siswa',
            'nama peserta didik',
            'nama',
            'nama lengkap siswa',
          ]);
          const rawGender = getVal(['jenis kelamin', 'jk', 'gender', 'l/p', 'j.k']);
          const rawRombel = getVal(['rombel', 'kelas', 'rombel kelas', 'kelas/rombel']);
          const rawParentName = getVal(['nama orang tua', 'nama wali', 'orang tua', 'wali']);
          const rawParentPhone = getVal([
            'no telepon wali',
            'no hp',
            'no. telepon',
            'telepon',
            'wa',
            'whatsapp',
            'no telepon',
          ]);

          const parsedAbsen = parseInt(rawAbsen, 10);
          const attendanceNum = !isNaN(parsedAbsen) && parsedAbsen > 0 ? parsedAbsen : idx + 1;

          const targetRombel = rawRombel.trim() ? rawRombel.trim().toUpperCase() : '6A';
          const matchedClass = classes.find(
            (c) => c.rombel.toUpperCase() === targetRombel.toUpperCase()
          );
          const classId = matchedClass ? matchedClass.id : `cls-${targetRombel.toLowerCase()}`;

          let normalizedGender: 'L' | 'P' = 'L';
          const gUpper = rawGender.toUpperCase();
          if (gUpper.includes('P') || gUpper.includes('PEREMPUAN') || gUpper.includes('WANITA')) {
            normalizedGender = 'P';
          }

          const isValidName = rawName.length > 0;
          const assignedNis = rawNis.length > 0 ? rawNis : `2021${String(idx + 100).padStart(3, '0')}`;
          const isValid = isValidName;

          return {
            rowNumber: idx + 2,
            attendanceNumber: attendanceNum,
            nis: assignedNis,
            nisn: rawNisn,
            fullName: rawName,
            gender: normalizedGender,
            rombel: targetRombel,
            classId,
            parentName: rawParentName,
            parentPhone: rawParentPhone,
            isValid,
            validationError: !isValidName ? 'Nama Siswa tidak boleh kosong' : undefined,
          };
        });

        setParsedRows(parsed);
        const validCount = parsed.filter((r) => r.isValid).length;
        setImportStatusMessage({
          type: 'info',
          text: `File berhasil dianalisis: ${parsed.length} baris data ditemukan (${validCount} siap diimpor).`,
        });
      } catch (err) {
        console.error('Error reading excel file:', err);
        setImportStatusMessage({
          type: 'error',
          text: 'Gagal membaca file Excel. Pastikan format file adalah .xlsx atau .xls yang valid.',
        });
        setParsedRows([]);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Execute Import
  const handleExecuteImport = () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      showToast('Tidak ada data siswa yang valid untuk diimpor.', 'error');
      return;
    }

    setIsImporting(true);

    try {
      const incomingList: Array<Omit<Student, 'id'>> = validRows.map((row) => ({
        nis: row.nis,
        nisn: row.nisn || undefined,
        attendanceNumber: row.attendanceNumber,
        fullName: row.fullName,
        rombel: row.rombel,
        classId: row.classId,
        gender: row.gender,
        parentName: row.parentName || undefined,
        parentPhone: row.parentPhone || undefined,
        isActive: true,
      }));

      const result = importStudentsBulk(incomingList, updateExistingOnImport);

      showToast(
        `Berhasil mengimpor ${result.total} siswa (${result.added} siswa baru, ${result.updated} diperbarui).`
      );

      setTimeout(() => {
        setIsImportModalOpen(false);
        setImportFile(null);
        setParsedRows([]);
        setIsImporting(false);
        setImportStatusMessage(null);
      }, 1000);
    } catch (err) {
      console.error('Failed to import students:', err);
      showToast('Terjadi kesalahan saat memproses impor data siswa.', 'error');
      setIsImporting(false);
    }
  };

  // Stats
  const totalCount = students.length;
  const countLaki = students.filter((s) => s.gender === 'L').length;
  const countPerempuan = students.filter((s) => s.gender === 'P').length;
  const countWithAbsen = students.filter((s) => s.attendanceNumber && s.attendanceNumber > 0).length;

  // Selected students details
  const selectedStudents = students.filter((s) => selectedStudentIds.includes(s.id));
  const isAllSelected =
    filteredStudents.length > 0 && selectedStudentIds.length === filteredStudents.length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-bounce duration-300">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold border ${
              toast.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : toast.type === 'error'
                ? 'bg-red-600 text-white border-red-500'
                : 'bg-blue-600 text-white border-blue-500'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="h-4 w-4 shrink-0" />
            ) : (
              <Sparkles className="h-4 w-4 shrink-0" />
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 hover:opacity-75"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Header & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Master Data Peserta Didik
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              {totalCount} Siswa Terdaftar
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Data identitas siswa MIN 1 Paser untuk otentikasi login ujian (Nama & No. Absen),
            cetak kartu peserta, pengelompokan rombel, dan tindakan administrasi lengkap.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canManage && (
            <>
              {/* Tombol Impor Data Siswa File Excel */}
              <button
                onClick={() => {
                  setImportFile(null);
                  setParsedRows([]);
                  setImportStatusMessage(null);
                  setIsImportModalOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors shrink-0"
                title="Impor daftar siswa massal dari file Excel (.xlsx)"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Impor Data Siswa (Excel)</span>
              </button>

              {/* Tambah Siswa Manual */}
              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>Input Data Siswa</span>
              </button>
            </>
          )}

          {/* Ekspor Excel */}
          <button
            onClick={() => handleExportStudents(filteredStudents)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            title="Unduh seluruh data siswa saat ini dalam file Excel"
          >
            <Download className="h-4 w-4 text-emerald-600" />
            <span>Ekspor Excel</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Informasi Siswa & Nomor Absen */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Total Siswa Terdaftar</span>
          <span className="text-xl font-bold text-slate-900 tabular-nums">{totalCount}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Semua Rombel</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Kesiapan Login Ujian</span>
          <span className="text-xl font-bold text-blue-700 tabular-nums">
            {countWithAbsen} / {totalCount}
          </span>
          <span className="text-[10px] text-emerald-600 block mt-0.5">Nomor Absen Lengkap</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Peserta Didik Laki-laki</span>
          <span className="text-xl font-bold text-slate-800 tabular-nums">{countLaki}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {totalCount > 0 ? Math.round((countLaki / totalCount) * 100) : 0}% dari total
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Peserta Didik Perempuan</span>
          <span className="text-xl font-bold text-slate-800 tabular-nums">{countPerempuan}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {totalCount > 0 ? Math.round((countPerempuan / totalCount) * 100) : 0}% dari total
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama siswa, nomor absen (misal: 1), NIS, atau NISN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs focus:bg-white focus:border-blue-600 focus:outline-hidden"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="sm:w-56">
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:bg-white focus:border-blue-600 focus:outline-hidden"
          >
            <option value="all">Semua Rombel ({students.length} Siswa)</option>
            {classes.map((c) => {
              const inClassCount = students.filter((s) => s.rombel === c.rombel).length;
              return (
                <option key={c.id} value={c.rombel}>
                  {c.name} ({inClassCount} Siswa)
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Sticky Bulk Action Toolbar (Active when students are checked) */}
      {selectedStudentIds.length > 0 && (
        <div className="sticky top-2 z-30 flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900 text-white shadow-xl border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 font-bold text-[11px]">
              {selectedStudentIds.length}
            </span>
            <span className="font-semibold">
              {selectedStudentIds.length} Peserta Didik Terpilih
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Cetak Kartu Massal */}
            <button
              onClick={() => handleOpenExamCard(selectedStudents)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-semibold text-white transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Cetak Kartu ({selectedStudentIds.length})</span>
            </button>

            {/* Pindah Rombel Massal */}
            {canManage && (
              <button
                onClick={() => setIsBulkMoveModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 font-semibold text-white transition-colors"
              >
                <ArrowRight className="h-3.5 w-3.5" />
                <span>Pindah Rombel</span>
              </button>
            )}

            {/* Ekspor Terpilih */}
            <button
              onClick={() => handleExportStudents(selectedStudents)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 font-semibold text-slate-200 transition-colors border border-slate-700"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Ekspor Terpilih</span>
            </button>

            {/* Hapus Terpilih */}
            {canManage && (
              <button
                onClick={() => setIsBulkDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 font-semibold text-white transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Hapus Terpilih</span>
              </button>
            )}

            {/* Batal Pilih */}
            <button
              onClick={() => setSelectedStudentIds([])}
              className="text-slate-400 hover:text-white px-2 py-1 text-xs"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Students Table with Functional Actions */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                    title="Pilih Semua Siswa yang Tampil"
                  />
                </th>
                <th className="py-3 px-2 w-10 text-center">No</th>
                <th className="py-3 px-3 text-center">No. Absen</th>
                <th className="py-3 px-4">NIS / NISN</th>
                <th className="py-3 px-4">Nama Lengkap Siswa</th>
                <th className="py-3 px-3 text-center">L/P</th>
                <th className="py-3 px-3 text-center">Rombel</th>
                <th className="py-3 px-4">Kontak Orang Tua / Wali</th>
                <th className="py-3 px-3 text-center">Kredensial Login</th>
                <th className="py-3 px-4 text-center min-w-[220px]">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <GraduationCap className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">Tidak ada data peserta didik yang cocok.</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Gunakan tombol "Input Data Siswa" atau "Impor Data Siswa (Excel)" untuk menambahkan data.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, idx) => {
                  const isChecked = selectedStudentIds.includes(s.id);
                  const isDropdownOpen = openDropdownId === s.id;

                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isChecked ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      {/* Checkbox Selector */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelectOne(s.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                        />
                      </td>

                      {/* Number */}
                      <td className="py-3 px-2 text-center text-slate-400 tabular-nums font-mono text-[11px]">
                        {idx + 1}
                      </td>

                      {/* Nomor Absen */}
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center justify-center font-bold font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-xs shadow-2xs">
                          #{s.attendanceNumber || idx + 1}
                        </span>
                      </td>

                      {/* NIS / NISN */}
                      <td className="py-3 px-4 font-mono">
                        <div className="font-semibold text-slate-800">{s.nis}</div>
                        <div className="text-[10px] text-slate-400">{s.nisn || '-'}</div>
                      </td>

                      {/* Nama Siswa */}
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span>{s.fullName}</span>
                          {s.isActive === false && (
                            <span className="text-[9px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.2 rounded">
                              Nonaktif
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                          Login: <span className="font-medium text-slate-600">{s.fullName}</span> | Absen:{' '}
                          <span className="font-medium text-slate-600">#{s.attendanceNumber || 1}</span>
                        </div>
                      </td>

                      {/* L/P */}
                      <td className="py-3 px-3 text-center text-slate-600 font-medium">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            s.gender === 'L'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-pink-50 text-pink-700 border border-pink-200'
                          }`}
                        >
                          {s.gender === 'L' ? 'L' : 'P'}
                        </span>
                      </td>

                      {/* Rombel */}
                      <td className="py-3 px-3 text-center">
                        <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                          {s.rombel}
                        </span>
                      </td>

                      {/* Kontak Wali */}
                      <td className="py-3 px-4 text-[11px] text-slate-600">
                        <div className="font-medium text-slate-700">{s.parentName || '-'}</div>
                        <div className="text-slate-400 flex items-center gap-1">
                          {s.parentPhone ? (
                            <>
                              <Phone className="h-3 w-3 text-slate-400" />
                              <span>{s.parentPhone}</span>
                            </>
                          ) : (
                            '-'
                          )}
                        </div>
                      </td>

                      {/* Kredensial Login Badge */}
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium">
                          <Check className="h-3 w-3" />
                          <span>Siap Login</span>
                        </div>
                      </td>

                      {/* FITUR TINDAKAN (ACTION BUTTONS GROUP) */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* 1. Tombol Ubah / Edit */}
                          {canManage && (
                            <button
                              onClick={() => handleOpenEdit(s)}
                              className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1.5 text-[11px] font-bold text-blue-700 hover:bg-blue-600 hover:text-white transition-colors border border-blue-200 shadow-2xs"
                              title="Ubah data lengkap siswa ini"
                            >
                              <Edit className="h-3.5 w-3.5" />
                              <span>Ubah</span>
                            </button>
                          )}

                          {/* 2. Tombol Hapus */}
                          {canManage && (
                            <button
                              onClick={() => setStudentToDelete(s)}
                              className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2.5 py-1.5 text-[11px] font-bold text-red-700 hover:bg-red-600 hover:text-white transition-colors border border-red-200 shadow-2xs"
                              title="Hapus siswa ini dari sistem"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Hapus</span>
                            </button>
                          )}

                          {/* 3. Dropdown Menu Tindakan Tambahan (Detail, Cetak Kartu, Uji Login) */}
                          <div className="relative">
                            <button
                              onClick={() =>
                                setOpenDropdownId(isDropdownOpen ? null : s.id)
                              }
                              className={`rounded-md p-1.5 border transition-colors ${
                                isDropdownOpen
                                  ? 'bg-slate-200 text-slate-800 border-slate-300'
                                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                              }`}
                              title="Opsi Tindakan Lainnya"
                            >
                              <MoreVertical className="h-3.5 w-3.5" />
                            </button>

                            {isDropdownOpen && (
                              <div
                                className="absolute right-0 mt-1 w-48 rounded-xl bg-white shadow-xl border border-slate-200 py-1.5 z-40 text-left text-xs divide-y divide-slate-100"
                                onClick={() => setOpenDropdownId(null)}
                              >
                                <div className="py-1">
                                  {/* Rincian Profil & Nilai */}
                                  <button
                                    onClick={() => setStudentForDetail(s)}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors font-medium text-[11px]"
                                  >
                                    <Eye className="h-3.5 w-3.5 text-blue-600" />
                                    <span>Lihat Rincian & Nilai</span>
                                  </button>

                                  {/* Cetak Kartu Peserta Ujian */}
                                  <button
                                    onClick={() => handleOpenExamCard([s])}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors font-medium text-[11px]"
                                  >
                                    <Printer className="h-3.5 w-3.5 text-emerald-600" />
                                    <span>Cetak Kartu Ujian</span>
                                  </button>
                                </div>

                                <div className="py-1">
                                  {/* Uji Coba Login Siswa */}
                                  <button
                                    onClick={() => handleSimulateLogin(s)}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-amber-700 hover:bg-amber-50 transition-colors font-medium text-[11px]"
                                    title="Masuk ke portal ujian sebagai siswa ini"
                                  >
                                    <LogIn className="h-3.5 w-3.5 text-amber-600" />
                                    <span>Uji Login Siswa Ini</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. MODAL KONFIRMASI HAPUS SISWA (IN-APP MODAL, TIDAK PAKAI ALERT) */}
      {/* ============================================================== */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-red-100 text-red-600 shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-sm">
                  Hapus Data Peserta Didik?
                </h3>
                <p className="text-slate-600 text-xs">
                  Apakah Anda yakin ingin menghapus data siswa ini dari sistem madrasah? Tindakan ini
                  tidak dapat dibatalkan.
                </p>
              </div>
            </div>

            {/* Student Preview Box */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{studentToDelete.fullName}</span>
                <span className="font-bold font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[11px]">
                  Absen #{studentToDelete.attendanceNumber || 1}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                <div>
                  NIS: <span className="font-mono text-slate-800">{studentToDelete.nis}</span>
                </div>
                <div>
                  Rombel: <span className="font-semibold text-blue-700">{studentToDelete.rombel}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmSingleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                <span>Ya, Hapus Data Siswa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. MODAL KONFIRMASI HAPUS MASSAL (BULK DELETE) */}
      {/* ============================================================== */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-red-100 text-red-600 shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Hapus {selectedStudentIds.length} Siswa Sekaligus?
                </h3>
                <p className="text-slate-600 text-xs mt-1">
                  Seluruh {selectedStudentIds.length} siswa yang Anda pilih akan dihapus dari daftar
                  database peserta didik.
                </p>
              </div>
            </div>

            <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-lg p-2.5 divide-y divide-slate-100 text-[11px] bg-slate-50">
              {selectedStudents.map((s) => (
                <div key={s.id} className="py-1 flex items-center justify-between">
                  <span className="font-medium text-slate-800">{s.fullName}</span>
                  <span className="text-slate-500 font-mono">
                    #{s.attendanceNumber || 1} • {s.rombel}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkDelete}
                className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                <span>Ya, Hapus {selectedStudentIds.length} Siswa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. MODAL PINDAH ROMBEL MASSAL (BULK MOVE CLASS) */}
      {/* ============================================================== */}
      {isBulkMoveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                Pindah Rombel Kelas ({selectedStudentIds.length} Siswa)
              </h3>
              <button
                onClick={() => setIsBulkMoveModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-slate-600 text-xs">
              Pilih rombel target untuk memindahkan seluruh {selectedStudentIds.length} peserta didik
              terpilih sekaligus:
            </p>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Rombel Kelas Sasaran
              </label>
              <select
                value={bulkTargetRombel}
                onChange={(e) => setBulkTargetRombel(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-semibold focus:border-blue-600 focus:outline-hidden"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.rombel}>
                    {c.name} (Tingkat {c.level})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsBulkMoveModalOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkMove}
                className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs"
              >
                Pindahkan ke {bulkTargetRombel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. MODAL RINCIAN & NILAI SISWA (STUDENT DETAIL & SCORES) */}
      {/* ============================================================== */}
      {studentForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold text-sm">
                  {studentForDetail.fullName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{studentForDetail.fullName}</h3>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                    <span className="font-mono">NIS: {studentForDetail.nis}</span>
                    <span>•</span>
                    <span className="font-bold text-blue-700">Kelas {studentForDetail.rombel}</span>
                    <span>•</span>
                    <span className="font-bold text-amber-700">
                      Absen #{studentForDetail.attendanceNumber || 1}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setStudentForDetail(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Action Bar inside Detail Modal */}
            <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <button
                onClick={() => {
                  const s = studentForDetail;
                  setStudentForDetail(null);
                  handleOpenEdit(s);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Ubah Data</span>
              </button>
              <button
                onClick={() => {
                  const s = studentForDetail;
                  setStudentForDetail(null);
                  handleOpenExamCard([s]);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-colors"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Cetak Kartu Ujian</span>
              </button>
              <button
                onClick={() => {
                  const s = studentForDetail;
                  setStudentForDetail(null);
                  handleSimulateLogin(s);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-white font-semibold text-xs hover:bg-amber-700 transition-colors"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Simulasi Login Siswa Ini</span>
              </button>
            </div>

            {/* Student Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border border-slate-100 bg-slate-50">
                <span className="text-[10px] text-slate-400 block">Nomor Absen</span>
                <span className="font-bold text-slate-900 text-sm font-mono">
                  #{studentForDetail.attendanceNumber || 1}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-100 bg-slate-50">
                <span className="text-[10px] text-slate-400 block">NISN Siswa</span>
                <span className="font-bold text-slate-900 font-mono">
                  {studentForDetail.nisn || '-'}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-100 bg-slate-50">
                <span className="text-[10px] text-slate-400 block">Jenis Kelamin</span>
                <span className="font-bold text-slate-900">
                  {studentForDetail.gender === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-100 bg-slate-50">
                <span className="text-[10px] text-slate-400 block">Nama Orang Tua / Wali</span>
                <span className="font-bold text-slate-900">
                  {studentForDetail.parentName || '-'}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-100 bg-slate-50">
                <span className="text-[10px] text-slate-400 block">Kontak Telepon / WA</span>
                <span className="font-bold text-slate-900 font-mono">
                  {studentForDetail.parentPhone || '-'}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-100 bg-slate-50">
                <span className="text-[10px] text-slate-400 block">Status Siswa</span>
                <span className="font-bold text-emerald-700">
                  {studentForDetail.isActive !== false ? 'Aktif Terdaftar' : 'Nonaktif'}
                </span>
              </div>
            </div>

            {/* Riwayat Asesmen & Nilai Siswa */}
            <div className="space-y-2 pt-2">
              <h4 className="font-bold text-slate-900 text-xs">
                Riwayat Pengerjaan & Perolehan Nilai Asesmen:
              </h4>

              {(() => {
                const studentScores = scores.filter(
                  (sc) =>
                    sc.studentId === studentForDetail.id ||
                    sc.studentNis === studentForDetail.nis
                );

                if (studentScores.length === 0) {
                  return (
                    <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl text-slate-400">
                      Belum ada catatan nilai asesmen untuk siswa ini.
                    </div>
                  );
                }

                return (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                        <tr>
                          <th className="p-2.5">Nama Asesmen</th>
                          <th className="p-2.5 text-center">Status</th>
                          <th className="p-2.5 text-center">Nilai</th>
                          <th className="p-2.5">Catatan Guru</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {studentScores.map((sc) => {
                          const asm = assessments.find((a) => a.id === sc.assessmentId);
                          const isPassed =
                            sc.score !== null && asm ? sc.score >= asm.passingScore : false;

                          return (
                            <tr key={sc.id} className="hover:bg-slate-50">
                              <td className="p-2.5">
                                <div className="font-semibold text-slate-900">
                                  {asm ? asm.title : 'Asesmen Madrasah'}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {asm ? asm.chapterOrTopic : '-'}
                                </div>
                              </td>
                              <td className="p-2.5 text-center">
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 capitalize">
                                  {sc.attendanceStatus}
                                </span>
                              </td>
                              <td className="p-2.5 text-center font-bold font-mono text-sm">
                                {sc.score !== null ? (
                                  <span
                                    className={
                                      isPassed ? 'text-emerald-700' : 'text-red-600'
                                    }
                                  >
                                    {sc.score}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </td>
                              <td className="p-2.5 text-slate-600 text-[11px]">
                                {sc.teacherNotes || '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. MODAL CETAK KARTU PESERTA ASESMEN / UJIAN DIGITAL (PRINTABLE) */}
      {/* ============================================================== */}
      {isExamCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 print:hidden">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                  <Printer className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Kartu Peserta Asesmen & Ujian Digital ({examCardStudents.length} Siswa)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Format resmi kartu peserta ujian CBT MIN 1 Paser lengkap dengan kredensial login
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 font-semibold text-white hover:bg-emerald-700 transition-colors shadow-xs"
                >
                  <Printer className="h-4 w-4" />
                  <span>Cetak / Cetak PDF</span>
                </button>
                <button
                  onClick={() => setIsExamCardModalOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Printable Cards Container */}
            <div className="space-y-6">
              {examCardStudents.map((st, idx) => (
                <div
                  key={st.id || idx}
                  className="border-2 border-slate-800 rounded-xl p-5 bg-white text-slate-900 space-y-4 shadow-xs"
                >
                  {/* Kop Kartu */}
                  <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3 text-center">
                    <div className="flex items-center gap-3 text-left">
                      <div className="h-12 w-12 rounded-full border border-slate-800 flex items-center justify-center font-bold text-xs bg-emerald-50 text-emerald-800 shrink-0">
                        MIN 1
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                          Kementerian Agama Republik Indonesia
                        </div>
                        <div className="font-black text-sm text-slate-900 leading-tight">
                          MADRASAH IBTIDAIYAH NEGERI 1 PASER
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {settings.address || 'Kabupaten Paser, Kalimantan Timur'} • T.A. {settings.academicYear}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2.5 py-1 rounded bg-slate-900 text-white font-bold text-[10px] tracking-wide uppercase">
                        Kartu Peserta Ujian
                      </span>
                    </div>
                  </div>

                  {/* Body Kartu */}
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <div className="col-span-2 space-y-1.5 text-xs">
                      <div className="grid grid-cols-3">
                        <span className="text-slate-500">Nama Peserta</span>
                        <span className="col-span-2 font-bold text-slate-900 text-sm">
                          : {st.fullName}
                        </span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="text-slate-500">Nomor Absen</span>
                        <span className="col-span-2 font-mono font-bold text-amber-800">
                          : #{st.attendanceNumber || 1}
                        </span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="text-slate-500">NIS / NISN</span>
                        <span className="col-span-2 font-mono">
                          : {st.nis} {st.nisn ? `/ ${st.nisn}` : ''}
                        </span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="text-slate-500">Kelas / Rombel</span>
                        <span className="col-span-2 font-bold text-blue-800">
                          : Kelas {st.rombel}
                        </span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="text-slate-500">Jenis Kelamin</span>
                        <span className="col-span-2">
                          : {st.gender === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}
                        </span>
                      </div>
                    </div>

                    {/* Kotak Petunjuk Login CBT */}
                    <div className="border border-blue-200 bg-blue-50/70 rounded-xl p-3 text-center space-y-1">
                      <div className="text-[10px] font-bold text-blue-900 uppercase">
                        Kredensial Login Portal
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-blue-200 font-mono text-[11px] text-left space-y-0.5">
                        <div>
                          <span className="text-slate-400 text-[10px]">Nama:</span>{' '}
                          <span className="font-bold text-slate-800">{st.fullName}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px]">No. Absen:</span>{' '}
                          <span className="font-bold text-amber-700">{st.attendanceNumber || 1}</span>
                        </div>
                      </div>
                      <div className="text-[9px] text-blue-700">
                        *Gunakan untuk login di Portal Siswa
                      </div>
                    </div>
                  </div>

                  {/* Footer Tanda Tangan */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[10px] text-slate-500">
                    <div>Dicetak pada: {new Date().toLocaleDateString('id-ID')}</div>
                    <div className="text-right">
                      <div>Kepala Madrasah / Panitia Asesmen</div>
                      <div className="font-bold text-slate-900 mt-4 underline">
                        {settings.headmasterName || 'Ismail, S.Ag.'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. MODAL IMPOR DATA SISWA FILE EXCEL */}
      {/* ============================================================== */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-5 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Impor Data Siswa dari File Excel
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Unggah file spreadsheet (.xlsx / .xls / .csv) berisi daftar siswa dan nomor absen
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportFile(null);
                  setParsedRows([]);
                  setImportStatusMessage(null);
                }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Download Template Step */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  Format Template Excel Standar MIN 1 Paser
                </div>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Gunakan template resmi agar kolom Nomor Absen, NIS, Nama Lengkap, dan Rombel terisi dengan tepat.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-800 transition-colors shrink-0"
              >
                <Download className="h-4 w-4" />
                <span>Unduh Format Template (.xlsx)</span>
              </button>
            </div>

            {/* Upload Zone */}
            <div className="space-y-2">
              <label className="block font-semibold text-slate-800 text-xs">
                Pilih atau Tarik File Excel (.xlsx, .xls, .csv)
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                  importFile
                    ? 'border-emerald-400 bg-emerald-50/30'
                    : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {importFile ? (
                  <div className="space-y-1">
                    <FileSpreadsheet className="h-8 w-8 mx-auto text-emerald-600" />
                    <div className="font-bold text-slate-800">{importFile.name}</div>
                    <div className="text-[11px] text-slate-500">
                      {(importFile.size / 1024).toFixed(1)} KB — Klik untuk mengganti file
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <UploadCloud className="h-8 w-8 mx-auto text-slate-400" />
                    <div className="font-semibold text-slate-700">
                      Klik di sini atau geser file Excel ke area ini
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Mendukung format .xlsx, .xls, dan .csv
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status Message */}
            {importStatusMessage && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
                  importStatusMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : importStatusMessage.type === 'error'
                    ? 'bg-red-50 text-red-800 border-red-200'
                    : 'bg-blue-50 text-blue-800 border-blue-200'
                }`}
              >
                {importStatusMessage.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                ) : importStatusMessage.type === 'error' ? (
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                ) : (
                  <RefreshCw className="h-4 w-4 shrink-0 text-blue-600 animate-spin" />
                )}
                <span>{importStatusMessage.text}</span>
              </div>
            )}

            {/* Preview Data Table */}
            {parsedRows.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 text-xs">
                    Pratinjau Data yang Terbaca ({parsedRows.length} Baris):
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {parsedRows.filter((r) => r.isValid).length} baris valid
                  </span>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden max-h-52 overflow-y-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-100 text-slate-600 sticky top-0 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-2 text-center w-10">Baris</th>
                        <th className="p-2 text-center w-14">Absen</th>
                        <th className="p-2">NIS</th>
                        <th className="p-2">Nama Lengkap</th>
                        <th className="p-2 text-center">L/P</th>
                        <th className="p-2 text-center">Rombel</th>
                        <th className="p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {parsedRows.slice(0, 15).map((row, idx) => (
                        <tr
                          key={idx}
                          className={!row.isValid ? 'bg-red-50/60' : 'hover:bg-slate-50'}
                        >
                          <td className="p-2 text-center text-slate-400">{row.rowNumber}</td>
                          <td className="p-2 text-center font-mono font-bold text-amber-700">
                            #{row.attendanceNumber}
                          </td>
                          <td className="p-2 font-mono text-slate-700">{row.nis}</td>
                          <td className="p-2 font-medium text-slate-800">{row.fullName}</td>
                          <td className="p-2 text-center text-slate-600">{row.gender}</td>
                          <td className="p-2 text-center font-semibold text-blue-700">
                            {row.rombel}
                          </td>
                          <td className="p-2">
                            {row.isValid ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 text-[10px] font-semibold">
                                <Check className="h-3 w-3" /> Valid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-red-700 text-[10px] font-semibold">
                                <AlertCircle className="h-3 w-3" /> {row.validationError}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 text-xs font-medium">
                    <input
                      type="checkbox"
                      checked={updateExistingOnImport}
                      onChange={(e) => setUpdateExistingOnImport(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span>
                      Perbarui data (timpa) jika NIS atau NISN siswa sudah ada di database
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportFile(null);
                  setParsedRows([]);
                  setImportStatusMessage(null);
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={parsedRows.filter((r) => r.isValid).length === 0 || isImporting}
                onClick={handleExecuteImport}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>
                      Mulai Impor ({parsedRows.filter((r) => r.isValid).length} Siswa)
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. MODAL INPUT & EDIT SISWA (FORM ADD / EDIT DENGAN VALIDASI INLINE) */}
      {/* ============================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingStudent ? 'Ubah Data Peserta Didik' : 'Input Data Siswa Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 flex items-center gap-2 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Absen & Rombel */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nomor Absen <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    required
                    value={attendanceNumber}
                    onChange={(e) => setAttendanceNumber(parseInt(e.target.value, 10) || 1)}
                    placeholder="Contoh: 1"
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono font-bold focus:border-blue-600 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Digunakan saat login siswa di portal ujian
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Rombel Kelas <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={rombel}
                    onChange={(e) => {
                      const newRombel = e.target.value;
                      setRombel(newRombel);
                      if (!editingStudent) {
                        setAttendanceNumber(getNextAttendanceNumber(newRombel));
                      }
                    }}
                    className="w-full rounded-lg border border-slate-300 p-2 focus:border-blue-600 focus:outline-hidden"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.rombel}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* NIS & NISN */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    NIS (Nomor Induk) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nis}
                    onChange={(e) => setNis(e.target.value)}
                    placeholder="Contoh: 2021001"
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono focus:border-blue-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NISN (Opsional)</label>
                  <input
                    type="text"
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value)}
                    placeholder="Contoh: 0123456781"
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono focus:border-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Nama Lengkap */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap Siswa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Muhammad Al-Fatih Pratama"
                  className="w-full rounded-lg border border-slate-300 p-2 font-medium focus:border-blue-600 focus:outline-hidden"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Siswa wajib memasukkan nama lengkap ini saat login ujian.
                </p>
              </div>

              {/* Jenis Kelamin */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center justify-center gap-2 p-2 rounded-lg border cursor-pointer font-medium text-xs ${
                      gender === 'L'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value="L"
                      checked={gender === 'L'}
                      onChange={() => setGender('L')}
                      className="hidden"
                    />
                    <span>Laki-laki (L)</span>
                  </label>
                  <label
                    className={`flex items-center justify-center gap-2 p-2 rounded-lg border cursor-pointer font-medium text-xs ${
                      gender === 'P'
                        ? 'border-pink-600 bg-pink-50 text-pink-700'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value="P"
                      checked={gender === 'P'}
                      onChange={() => setGender('P')}
                      className="hidden"
                    />
                    <span>Perempuan (P)</span>
                  </label>
                </div>
              </div>

              {/* Kontak Orang Tua */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Orang Tua / Wali
                  </label>
                  <input
                    type="text"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="Contoh: Bambang Pratama"
                    className="w-full rounded-lg border border-slate-300 p-2 focus:border-blue-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    No. Telepon / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full rounded-lg border border-slate-300 p-2 focus:border-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Status Siswa */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span>Status Aktif Terdaftar (dapat mengikuti asesmen)</span>
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs"
                >
                  {editingStudent ? 'Simpan Perubahan' : 'Simpan Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
