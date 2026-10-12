import React, { useState } from 'react';
import { Megaphone, Pin, Plus, Trash2, X } from 'lucide-react';
import { Announcement } from '../../types';
import { useApp } from '../../context/AppContext';

export const AnnouncementsView: React.FC = () => {
  const { announcements, addAnnouncement, deleteAnnouncement, currentUser, classes } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState('Semua');
  const [isPinned, setIsPinned] = useState(false);

  const canManage =
    currentUser.role === 'super_admin' ||
    currentUser.role === 'guru' ||
    currentUser.role === 'wali_kelas';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Judul dan isi pengumuman wajib diisi.');
      return;
    }

    addAnnouncement({
      title,
      content,
      authorName: currentUser.fullName,
      targetAudience,
      isPinned,
    });

    setIsModalOpen(false);
    setTitle('');
    setContent('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Pengumuman & Informasi Asesmen
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
              {announcements.length} Pengumuman
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Informasi pelaksanaan asesmen, jadwal susulan, dan pengumuman kelas untuk peserta didik.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Buat Pengumuman</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {announcements.map((a) => (
          <div
            key={a.id}
            className={`rounded-xl border p-5 shadow-xs transition-colors ${
              a.isPinned ? 'border-amber-300 bg-amber-50/40' : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {a.isPinned && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      <Pin className="h-3 w-3" /> Disematkan
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    Sasaran: {a.targetAudience}
                  </span>
                  <span className="text-[11px] text-slate-400 tabular-nums">
                    {new Date(a.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{a.title}</h3>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line pt-1">
                  {a.content}
                </p>
                <div className="pt-2 text-[11px] font-semibold text-slate-500">
                  Diumumkan oleh: {a.authorName}
                </div>
              </div>

              {canManage && (
                <button
                  onClick={() => {
                    if (window.confirm(`Hapus pengumuman '${a.title}'?`)) {
                      deleteAnnouncement(a.id);
                    }
                  }}
                  className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 transition-colors shrink-0"
                  title="Hapus Pengumuman"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Terbitkan Pengumuman Baru</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Pengumuman *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Jadwal Ujian Susulan Formatif Matematika"
                  className="w-full rounded-lg border border-slate-300 p-2 focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sasaran Pembaca</label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2"
                  >
                    <option value="Semua">Semua (Seluruh Siswa & Guru)</option>
                    <option value="Peserta Didik">Hanya Peserta Didik</option>
                    <option value="Guru">Hanya Dewan Guru</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.rombel}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={isPinned}
                      onChange={(e) => setIsPinned(e.target.checked)}
                      className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-4 w-4"
                    />
                    <span>Sematkan di Atas</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Isi Pesan Pengumuman *</label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tuliskan isi pengumuman secara jelas..."
                  className="w-full rounded-lg border border-slate-300 p-2 leading-relaxed"
                />
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
                  Terbitkan Pengumuman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
