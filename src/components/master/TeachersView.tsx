import React, { useState } from 'react';
import { Edit, Mail, Phone, Plus, Trash2, User, X } from 'lucide-react';
import { Teacher } from '../../types';
import { useApp } from '../../context/AppContext';

export const TeachersView: React.FC = () => {
  const { teachers, addTeacher, updateTeacher, deleteTeacher, subjects, classes, currentUser } =
    useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Form states
  const [nip, setNip] = useState('');
  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [homeroomClassId, setHomeroomClassId] = useState('');

  const canManage = currentUser.role === 'super_admin';

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setNip('');
    setFullName('');
    setTitle('Guru Mata Pelajaran');
    setEmail('');
    setPhone('');
    setSelectedSubjects([]);
    setHomeroomClassId('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Teacher) => {
    setEditingTeacher(t);
    setNip(t.nip || '');
    setFullName(t.fullName);
    setTitle(t.title);
    setEmail(t.email);
    setPhone(t.phone || '');
    setSelectedSubjects(t.subjectIds || []);
    setHomeroomClassId(t.homeroomClassId || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      alert('Nama guru dan email wajib diisi.');
      return;
    }

    if (editingTeacher) {
      updateTeacher({
        ...editingTeacher,
        nip,
        fullName,
        title,
        email,
        phone,
        subjectIds: selectedSubjects,
        homeroomClassId: homeroomClassId || undefined,
      });
    } else {
      addTeacher({
        nip,
        fullName,
        title,
        email,
        phone,
        subjectIds: selectedSubjects,
        homeroomClassId: homeroomClassId || undefined,
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
              Master Data Tenaga Pendidik (Guru)
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              {teachers.length} Guru
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Data guru madrasah pengampu mata pelajaran dan wali kelas MIN 1 Paser.
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Guru</span>
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teachers.map((tch) => {
          const taughtSubs = subjects.filter((s) => tch.subjectIds.includes(s.id));
          const homeroomClass = classes.find((c) => c.id === tch.homeroomClassId);

          return (
            <div
              key={tch.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wide bg-blue-50 px-2 py-0.5 rounded">
                    {tch.title}
                  </span>
                  {homeroomClass && (
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      Wali {homeroomClass.name}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-sm">{tch.fullName}</h3>
                <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                  NIP: {tch.nip || 'Belum diisi'}
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span className="truncate">{tch.email}</span>
                  </div>
                  {tch.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span>{tch.phone}</span>
                    </div>
                  )}
                </div>

                {taughtSubs.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 block mb-1">
                      Mata Pelajaran Diampu:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {taughtSubs.map((s) => (
                        <span
                          key={s.id}
                          className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {canManage && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-1">
                  <button
                    onClick={() => handleOpenEdit(tch)}
                    className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Hapus data guru '${tch.fullName}'?`)) {
                        deleteTeacher(tch.id);
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
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingTeacher ? 'Ubah Data Guru' : 'Tambah Tenaga Pendidik Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap & Gelar *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 focus:border-blue-600"
                  placeholder="Contoh: Siti Rahmah, S.Pd.I."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIP</label>
                  <input
                    type="text"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jabatan / Peran</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No. WhatsApp</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Wali Kelas (Opsional)</label>
                <select
                  value={homeroomClassId}
                  onChange={(e) => setHomeroomClassId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2"
                >
                  <option value="">Bukan Wali Kelas</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
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
                  Simpan Guru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
