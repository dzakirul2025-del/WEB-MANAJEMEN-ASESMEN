import React, { useState } from 'react';
import { BookOpen, Edit, Plus, Trash2, X } from 'lucide-react';
import { Subject } from '../../types';
import { useApp } from '../../context/AppContext';

export const SubjectsView: React.FC = () => {
  const { subjects, addSubject, updateSubject, deleteSubject, currentUser } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [group, setGroup] = useState<Subject['group']>('Mata Pelajaran Umum');
  const [kktpStandard, setKktpStandard] = useState(75);

  const canManage = currentUser.role === 'super_admin';

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setCode(`MAPEL-0${subjects.length + 1}`);
    setName('');
    setGroup('Mata Pelajaran Umum');
    setKktpStandard(75);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Subject) => {
    setEditingSubject(s);
    setCode(s.code);
    setName(s.name);
    setGroup(s.group);
    setKktpStandard(s.kktpStandard);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      alert('Kode dan nama mata pelajaran wajib diisi.');
      return;
    }

    if (editingSubject) {
      updateSubject({
        ...editingSubject,
        code,
        name,
        group,
        kktpStandard: Number(kktpStandard),
      });
    } else {
      addSubject({
        code,
        name,
        group,
        kktpStandard: Number(kktpStandard),
        isActive: true,
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
              Master Data Mata Pelajaran & KKTP
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              Kurikulum Merdeka MI
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Daftar rumpun mata pelajaran PAI, Umum, dan Muatan Lokal beserta nilai standar KKTP kelulusan.
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Mapel</span>
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3 w-12 text-center">No</th>
                <th className="py-3 px-3 font-mono">Kode</th>
                <th className="py-3 px-4">Nama Mata Pelajaran</th>
                <th className="py-3 px-4">Kelompok / Rumpun</th>
                <th className="py-3 px-3 text-center">Standar KKTP</th>
                {canManage && <th className="py-3 px-4 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjects.map((sub, idx) => (
                <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 text-center text-slate-400 tabular-nums">{idx + 1}</td>
                  <td className="py-3 px-3 font-mono font-bold text-blue-700 text-[11px]">
                    {sub.code}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">{sub.name}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        sub.group === 'Pendidikan Agama Islam'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : sub.group === 'Muatan Lokal'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {sub.group}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-extrabold text-slate-800 tabular-nums">
                    {sub.kktpStandard}
                  </td>
                  {canManage && (
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(sub)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus mapel '${sub.name}'?`)) {
                              deleteSubject(sub.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingSubject ? 'Ubah Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
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
                  <label className="block font-semibold text-slate-700 mb-1">Kode Mapel *</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Standar KKTP *</label>
                  <input
                    type="number"
                    value={kktpStandard}
                    onChange={(e) => setKktpStandard(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Mata Pelajaran *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2"
                  placeholder="Contoh: Akidah Akhlak"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kelompok Rumpun</label>
                <select
                  value={group}
                  onChange={(e) => setGroup(e.target.value as Subject['group'])}
                  className="w-full rounded-lg border border-slate-300 p-2"
                >
                  <option value="Pendidikan Agama Islam">Pendidikan Agama Islam</option>
                  <option value="Mata Pelajaran Umum">Mata Pelajaran Umum</option>
                  <option value="Muatan Lokal">Muatan Lokal</option>
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
                  Simpan Mapel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
