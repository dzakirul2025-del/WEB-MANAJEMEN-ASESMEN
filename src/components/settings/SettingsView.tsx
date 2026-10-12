import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  CheckSquare,
  Database,
  Download,
  RotateCcw,
  Save,
  School,
  Settings as SettingsIcon,
  ShieldAlert,
  UploadCloud,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActiveCategoriesChecklist } from '../assessments/ActiveCategoriesChecklist';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, backupDatabase, restoreDatabase, resetToDefault } = useApp();

  const [formData, setFormData] = useState({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [restoreFeedback, setRestoreFeedback] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      const success = restoreDatabase(content);
      if (success) {
        setRestoreFeedback('Database berhasil dipulihkan dari berkas cadangan!');
      } else {
        setRestoreFeedback('Gagal memulihkan database. Format berkas cadangan tidak cocok.');
      }
      setTimeout(() => setRestoreFeedback(null), 4000);
    };
    reader.readAsText(file);
  };

  const handleResetConfirm = () => {
    if (
      window.confirm(
        'PERINGATAN: Apakah Anda yakin ingin mengatur ulang data ke kondisi awal (seed data)? Seluruh perubahan lokal akan dikembalikan.'
      )
    ) {
      resetToDefault();
      setFormData({ ...settings });
      alert('Data sistem telah dikembalikan ke kondisi awal.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Pengaturan & Administrasi Lembaga
          </h1>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
            Super Admin
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Konfigurasi identitas madrasah, kepala madrasah, tahun pelajaran aktif, serta pencadangan database.
        </p>
      </div>

      {saveSuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Pengaturan madrasah berhasil disimpan dan diperbarui!</span>
        </div>
      )}

      {restoreFeedback && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-3.5 text-xs font-semibold text-blue-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-blue-600" />
          <span>{restoreFeedback}</span>
        </div>
      )}

      {/* Identitas Madrasah Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <School className="h-4 w-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Identitas Resmi Madrasah & Kepala Madrasah
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Lembaga *</label>
              <input
                type="text"
                name="schoolName"
                value={formData.schoolName}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Jenjang Pendidikan *</label>
              <input
                type="text"
                name="schoolType"
                value={formData.schoolType}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Alamat Lengkap *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kecamatan</label>
              <input
                type="text"
                name="subdistrict"
                value={formData.subdistrict}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kabupaten / Kota</label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Provinsi</label>
              <input
                type="text"
                name="province"
                value={formData.province}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kode Pos</label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kepala Madrasah *</label>
              <input
                type="text"
                name="headmasterName"
                value={formData.headmasterName}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">NIP Kepala Madrasah *</label>
              <input
                type="text"
                name="headmasterNip"
                value={formData.headmasterNip}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pengembang Sistem</label>
              <input
                type="text"
                name="developerName"
                value={formData.developerName}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Zona Waktu Sistem</label>
              <input
                type="text"
                name="timezone"
                value={formData.timezone}
                disabled
                className="w-full rounded-lg border border-slate-200 bg-slate-100 p-2 text-xs text-slate-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tahun Pelajaran Aktif</label>
              <input
                type="text"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Semester Aktif</label>
              <select
                name="activeSemester"
                value={formData.activeSemester}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              >
                <option value="Ganjil">Semester Ganjil</option>
                <option value="Genap">Semester Genap</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs"
            >
              <Save className="h-4 w-4" />
              <span>Simpan Perubahan Pengaturan</span>
            </button>
          </div>
        </div>
      </form>

      {/* Checklist Fitur: Aktivasi Jenis Asesmen Pelaksanaan */}
      <ActiveCategoriesChecklist />

      {/* Database Backup & Restore */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 text-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Database className="h-4 w-4 text-emerald-600" />
          <h3 className="font-bold text-slate-900 text-sm">
            Pencadangan, Pemulihan Data & Manajemen Cadangan
          </h3>
        </div>

        <p className="text-slate-500 text-xs leading-relaxed">
          Seluruh data kegiatan asesmen, tautan platform eksternal, rekap nilai siswa, dan catatan audit tersimpan secara persisten. Anda dapat mengunduh salinan cadangan dalam format JSON terenkripsi untuk keamanan.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            onClick={backupDatabase}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 font-semibold text-slate-800 hover:bg-slate-100 transition-colors shadow-xs"
          >
            <Download className="h-4 w-4 text-emerald-600" />
            <span>Unduh Cadangan JSON</span>
          </button>

          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 font-semibold text-slate-800 hover:bg-slate-100 transition-colors shadow-xs">
            <UploadCloud className="h-4 w-4 text-blue-600" />
            <span>Pulihkan Cadangan JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleRestoreFile}
              className="hidden"
            />
          </label>

          <button
            onClick={handleResetConfirm}
            className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700 hover:bg-red-100 transition-colors shadow-xs"
          >
            <RotateCcw className="h-4 w-4 text-red-600" />
            <span>Reset Data ke Awal (Seed)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
