import React, { useState } from 'react';
import { CheckCircle2, Lock, Save, Shield, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ProfileView: React.FC = () => {
  const { currentUser, updateUser } = useApp();

  const [fullName, setFullName] = useState(currentUser.fullName);
  const [email, setEmail] = useState(currentUser.email);
  const [nipOrNis, setNipOrNis] = useState(currentUser.nipOrNis || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      ...currentUser,
      fullName,
      email,
      nipOrNis,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Profil Akun Pengguna
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Informasi identitas akun dan kewenangan hak akses pada sistem Portal Asesmen Digital MIN 1 Paser.
        </p>
      </div>

      {savedSuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Profil berhasil diperbarui!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 text-xs">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white font-extrabold text-xl">
            {currentUser.fullName.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">{currentUser.fullName}</h3>
            <span className="text-[11px] font-bold text-blue-700 uppercase bg-blue-50 px-2 py-0.5 rounded">
              Peran: {currentUser.role.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Username (ID Masuk)</label>
          <input
            type="text"
            value={currentUser.username}
            disabled
            className="w-full rounded-lg border border-slate-200 bg-slate-100 p-2 font-mono text-slate-500"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap *</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-2 focus:border-blue-600 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Alamat Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-2 focus:border-blue-600 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">NIP / NIS Identitas</label>
          <input
            type="text"
            value={nipOrNis}
            onChange={(e) => setNipOrNis(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-2 focus:border-blue-600 focus:outline-hidden font-mono"
          />
        </div>

        <div className="pt-2 flex justify-end border-t border-slate-100">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs"
          >
            <Save className="h-4 w-4" />
            <span>Simpan Perubahan Profil</span>
          </button>
        </div>
      </form>
    </div>
  );
};
