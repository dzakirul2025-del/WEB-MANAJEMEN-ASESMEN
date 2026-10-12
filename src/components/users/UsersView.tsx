import React, { useState } from 'react';
import { Edit, Plus, Shield, Trash2, User, UserCheck, X } from 'lucide-react';
import { UserProfile, UserRole } from '../../types';
import { useApp } from '../../context/AppContext';

export const UsersView: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, currentUser, classes } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('guru');
  const [nipOrNis, setNipOrNis] = useState('');
  const [assignedClassId, setAssignedClassId] = useState('');

  const handleOpenAdd = () => {
    setEditingUser(null);
    setUsername('');
    setFullName('');
    setEmail('');
    setRole('guru');
    setNipOrNis('');
    setAssignedClassId('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u: UserProfile) => {
    setEditingUser(u);
    setUsername(u.username);
    setFullName(u.fullName);
    setEmail(u.email);
    setRole(u.role);
    setNipOrNis(u.nipOrNis || '');
    setAssignedClassId(u.assignedClassId || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !fullName.trim() || !email.trim()) {
      alert('Nama, Username, dan Email wajib diisi.');
      return;
    }

    if (editingUser) {
      updateUser({
        ...editingUser,
        username,
        fullName,
        email,
        role,
        nipOrNis,
        assignedClassId: assignedClassId || undefined,
      });
    } else {
      addUser({
        username,
        fullName,
        email,
        role,
        nipOrNis,
        assignedClassId: assignedClassId || undefined,
        isActive: true,
      });
    }

    setIsModalOpen(false);
  };

  const roleBadge = (r: UserRole) => {
    switch (r) {
      case 'super_admin':
        return 'bg-slate-900 text-white';
      case 'guru':
        return 'bg-blue-100 text-blue-800';
      case 'wali_kelas':
        return 'bg-emerald-100 text-emerald-800';
      case 'siswa':
        return 'bg-amber-100 text-amber-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Manajemen Pengguna & Hak Akses (RBAC)
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              {users.length} Akun
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pengelolaan 4 peran utama: Super Admin, Guru Pengampu, Wali Kelas, dan Peserta Didik.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Pengguna</span>
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-3 font-mono">Username</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-3 text-center">Peran (Role)</th>
                <th className="py-3 px-3 font-mono">NIP / NIS</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u, idx) => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 text-center text-slate-400 tabular-nums">{idx + 1}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{u.fullName}</td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-600">{u.username}</td>
                  <td className="py-3 px-4 text-slate-600">{u.email}</td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${roleBadge(
                        u.role
                      )}`}
                    >
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                    {u.nipOrNis || '-'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {u.id !== currentUser.id && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus pengguna '${u.fullName}'?`)) {
                              deleteUser(u.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
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
                {editingUser ? 'Ubah Pengguna' : 'Tambah Pengguna Baru'}
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
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Username *</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIP / NIS</label>
                  <input
                    type="text"
                    value={nipOrNis}
                    onChange={(e) => setNipOrNis(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2"
                  />
                </div>
              </div>

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
                <label className="block font-semibold text-slate-700 mb-1">Peran Hak Akses (Role)</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full rounded-lg border border-slate-300 p-2"
                >
                  <option value="super_admin">Super Admin (Kewenangan Penuh)</option>
                  <option value="guru">Guru Pengampu</option>
                  <option value="wali_kelas">Wali Kelas</option>
                  <option value="siswa">Peserta Didik</option>
                </select>
              </div>

              {(role === 'wali_kelas' || role === 'siswa') && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kelas Terkait</label>
                  <select
                    value={assignedClassId}
                    onChange={(e) => setAssignedClassId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2"
                  >
                    <option value="">Pilih Rombel</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
