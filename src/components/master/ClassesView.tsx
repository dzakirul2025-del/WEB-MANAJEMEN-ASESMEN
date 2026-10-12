import React, { useState } from 'react';
import { Edit, Plus, School, Trash2, Users, X } from 'lucide-react';
import { SchoolClass } from '../../types';
import { useApp } from '../../context/AppContext';

export const ClassesView: React.FC = () => {
  const { classes, addClass, updateClass, deleteClass, teachers, students, currentUser, settings } =
    useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);

  const [level, setLevel] = useState<number>(6);
  const [rombel, setRombel] = useState('6A');
  const [homeroomTeacherId, setHomeroomTeacherId] = useState('');

  const canManage = currentUser.role === 'super_admin';

  const handleOpenAdd = () => {
    setEditingClass(null);
    setLevel(6);
    setRombel('6D');
    setHomeroomTeacherId('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: SchoolClass) => {
    setEditingClass(c);
    setLevel(c.level);
    setRombel(c.rombel);
    setHomeroomTeacherId(c.homeroomTeacherId || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = `Kelas ${rombel}`;
    const studentCount = students.filter((s) => s.rombel === rombel).length;

    if (editingClass) {
      updateClass({
        ...editingClass,
        level,
        rombel,
        name,
        homeroomTeacherId: homeroomTeacherId || undefined,
        studentCount,
      });
    } else {
      addClass({
        level,
        rombel,
        name,
        homeroomTeacherId: homeroomTeacherId || undefined,
        academicYearId: 'ay-2026-ganjil',
        studentCount,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Master Data Kelas & Rombongan Belajar
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              {classes.length} Rombel
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pengelompokan peserta didik jenjang Madrasah Ibtidaiyah Kelas 1 sampai 6 MIN 1 Paser.
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Rombel</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {classes.map((cls) => {
          const homeroomTeacher = teachers.find((t) => t.id === cls.homeroomTeacherId);
          const studentCount = students.filter((s) => s.rombel === cls.rombel).length;

          return (
            <div
              key={cls.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                    Jenjang Kelas {cls.level}
                  </span>
                  <span className="text-xs font-bold text-slate-500 tabular-nums">
                    {studentCount} Siswa
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 text-base">{cls.name}</h3>

                <div className="mt-3 rounded-lg bg-slate-50 p-2 text-xs text-slate-600 border border-slate-100 space-y-1">
                  <span className="text-[10px] text-slate-400 block">Wali Kelas:</span>
                  <span className="font-semibold text-slate-800 block">
                    {homeroomTeacher?.fullName || 'Belum Ditentukan'}
                  </span>
                </div>
              </div>

              {canManage && (
                <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-end gap-1">
                  <button
                    onClick={() => handleOpenEdit(cls)}
                    className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Hapus rombel '${cls.name}'?`)) {
                        deleteClass(cls.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingClass ? 'Ubah Rombel' : 'Tambah Rombel Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tingkat Kelas</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 p-2"
                  >
                    {[1, 2, 3, 4, 5, 6].map((l) => (
                      <option key={l} value={l}>
                        Kelas {l}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kode Rombel</label>
                  <input
                    type="text"
                    value={rombel}
                    onChange={(e) => setRombel(e.target.value.toUpperCase())}
                    placeholder="Contoh: 6A"
                    className="w-full rounded-lg border border-slate-300 p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Wali Kelas</label>
                <select
                  value={homeroomTeacherId}
                  onChange={(e) => setHomeroomTeacherId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2"
                >
                  <option value="">Belum Ditentukan</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
                >
                  Simpan Rombel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
