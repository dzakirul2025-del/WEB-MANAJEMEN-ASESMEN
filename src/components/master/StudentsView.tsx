import React, { useState } from 'react';
import {
  Download,
  Edit,
  GraduationCap,
  Plus,
  Search,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Student } from '../../types';
import { useApp } from '../../context/AppContext';

export const StudentsView: React.FC = () => {
  const { students, addStudent, updateStudent, deleteStudent, classes, currentUser } = useApp();

  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form states
  const [nis, setNis] = useState('');
  const [nisn, setNisn] = useState('');
  const [fullName, setFullName] = useState('');
  const [rombel, setRombel] = useState('6A');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');

  const canManage = currentUser.role === 'super_admin';

  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.nis.includes(search) ||
      (s.nisn && s.nisn.includes(search));
    const matchClass = classFilter === 'all' || s.rombel === classFilter;
    return matchSearch && matchClass;
  });

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setNis(`2021${String(students.length + 1).padStart(3, '0')}`);
    setNisn('');
    setFullName('');
    setRombel('6A');
    setGender('L');
    setParentName('');
    setParentPhone('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Student) => {
    setEditingStudent(s);
    setNis(s.nis);
    setNisn(s.nisn || '');
    setFullName(s.fullName);
    setRombel(s.rombel);
    setGender(s.gender);
    setParentName(s.parentName || '');
    setParentPhone(s.parentPhone || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nis.trim() || !fullName.trim()) {
      alert('NIS dan Nama Siswa wajib diisi.');
      return;
    }

    const classItem = classes.find((c) => c.rombel === rombel);
    const classId = classItem ? classItem.id : 'cls-6a';

    if (editingStudent) {
      updateStudent({
        ...editingStudent,
        nis,
        nisn,
        fullName,
        rombel,
        classId,
        gender,
        parentName,
        parentPhone,
      });
    } else {
      addStudent({
        nis,
        nisn,
        fullName,
        rombel,
        classId,
        gender,
        parentName,
        parentPhone,
        isActive: true,
      });
    }

    setIsModalOpen(false);
  };

  const handleExportStudents = () => {
    const data = filteredStudents.map((s, idx) => ({
      No: idx + 1,
      NIS: s.nis,
      NISN: s.nisn || '-',
      'Nama Lengkap': s.fullName,
      'Jenis Kelamin': s.gender === 'L' ? 'Laki-laki' : 'Perempuan',
      Rombel: s.rombel,
      'Nama Orang Tua': s.parentName || '-',
      'No. Telepon Wali': s.parentPhone || '-',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Daftar_Siswa');
    XLSX.writeFile(wb, `Data_Peserta_Didik_MIN1Paser_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Master Data Peserta Didik
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              {students.length} Siswa Terdaftar
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Data identitas siswa untuk pemetaan kelas sasaran, login ujian, dan pencatatan nilai.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canManage && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Siswa</span>
            </button>
          )}
          <button
            onClick={handleExportStudents}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="h-4 w-4 text-emerald-600" />
            <span>Ekspor Excel</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama atau NIS siswa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs focus:bg-white focus:border-blue-600 focus:outline-hidden"
          />
        </div>

        <div className="sm:w-56">
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:bg-white focus:border-blue-600 focus:outline-hidden"
          >
            <option value="all">Semua Rombel</option>
            {classes.map((c) => (
              <option key={c.id} value={c.rombel}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3 w-12 text-center">No</th>
                <th className="py-3 px-4">NIS / NISN</th>
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-3 text-center">L/P</th>
                <th className="py-3 px-3 text-center">Rombel</th>
                <th className="py-3 px-4">Kontak Wali Murid</th>
                {canManage && <th className="py-3 px-4 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Tidak ada data peserta didik yang cocok.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 text-center text-slate-400 tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <div className="font-semibold text-slate-800">{s.nis}</div>
                      <div className="text-[10px] text-slate-400">{s.nisn || '-'}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {s.fullName}
                    </td>
                    <td className="py-3 px-3 text-center text-slate-600 font-medium">
                      {s.gender}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {s.rombel}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-600">
                      <div>{s.parentName || '-'}</div>
                      <div className="text-slate-400">{s.parentPhone || '-'}</div>
                    </td>
                    {canManage && (
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(s)}
                            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 transition-colors"
                            title="Ubah Data Siswa"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Hapus data siswa '${s.fullName}'?`)) {
                                deleteStudent(s.id);
                              }
                            }}
                            className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 transition-colors"
                            title="Hapus Siswa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingStudent ? 'Ubah Data Siswa' : 'Tambah Peserta Didik Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    NIS <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nis}
                    onChange={(e) => setNis(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 focus:border-blue-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NISN</label>
                  <input
                    type="text"
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 focus:border-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap Siswa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Muhammad Al-Fatih"
                  className="w-full rounded-lg border border-slate-300 p-2 focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rombel Kelas</label>
                  <select
                    value={rombel}
                    onChange={(e) => setRombel(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 focus:border-blue-600 focus:outline-hidden"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.rombel}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'L' | 'P')}
                    className="w-full rounded-lg border border-slate-300 p-2 focus:border-blue-600 focus:outline-hidden"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Orang Tua</label>
                  <input
                    type="text"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 focus:border-blue-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No. HP Orang Tua</label>
                  <input
                    type="text"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 focus:border-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

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
                  className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
