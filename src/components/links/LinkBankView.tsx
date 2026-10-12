import React, { useState } from 'react';
import {
  AlertCircle,
  Check,
  Copy,
  ExternalLink,
  Filter,
  Globe,
  Link2,
  Plus,
  Search,
  Trash2,
  Edit,
  CopyCheck,
  Calendar,
  Layers,
} from 'lucide-react';
import { ASSESSMENT_CATEGORIES } from '../../data/seedData';
import { Assessment, ExternalPlatform } from '../../types';
import { useApp } from '../../context/AppContext';
import { AssessmentFormModal } from '../assessments/AssessmentFormModal';

export const LinkBankView: React.FC = () => {
  const { assessments, subjects, deleteAssessment, duplicateAssessment, currentUser } = useApp();

  const [search, setSearch] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const canManage = currentUser.role === 'super_admin' || currentUser.role === 'guru';

  const filteredAssessments = assessments.filter((asm) => {
    const matchSearch =
      asm.title.toLowerCase().includes(search.toLowerCase()) ||
      asm.chapterOrTopic.toLowerCase().includes(search.toLowerCase()) ||
      asm.teacherName.toLowerCase().includes(search.toLowerCase()) ||
      asm.assessmentUrl.toLowerCase().includes(search.toLowerCase());

    const matchPlatform = selectedPlatform === 'all' || asm.platform === selectedPlatform;
    const matchLevel = selectedLevel === 'all' || asm.level.toString() === selectedLevel;
    const matchCat = selectedCategory === 'all' || asm.category === selectedCategory;

    return matchSearch && matchPlatform && matchLevel && matchCat;
  });

  const handleCopyLink = (asm: Assessment) => {
    navigator.clipboard.writeText(asm.assessmentUrl);
    setCopiedId(asm.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getPlatformColor = (p: ExternalPlatform) => {
    switch (p) {
      case 'Wayground':
        return 'text-cyan-700 bg-cyan-50 border-cyan-200';
      case 'EdCafe':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Google Forms':
        return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'Microsoft Forms':
        return 'text-teal-700 bg-teal-50 border-teal-200';
      case 'Quizizz':
        return 'text-violet-700 bg-violet-50 border-violet-200';
      case 'Moodle':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'Website CBT':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const getCategoryMeta = (catId: string) => {
    return ASSESSMENT_CATEGORIES.find((c) => c.id === catId);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Bank Tautan Asesmen Digital
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              {filteredAssessments.length} Tautan
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pusat penyimpanan tautan soal dari berbagai platform (Wayground, EdCafe, Google Forms, CBT, Quizizz, Moodle, dll.)
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => {
              setEditingAssessment(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Tautan Asesmen</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari judul, materi, URL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs focus:bg-white focus:border-blue-600 focus:outline-hidden"
          />
        </div>

        <div>
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:bg-white focus:border-blue-600 focus:outline-hidden"
          >
            <option value="all">Semua Platform Sumber</option>
            <option value="Wayground">Wayground</option>
            <option value="EdCafe">EdCafe</option>
            <option value="Google Forms">Google Forms</option>
            <option value="Microsoft Forms">Microsoft Forms</option>
            <option value="Quizizz">Quizizz</option>
            <option value="Moodle">Moodle</option>
            <option value="Website CBT">Website CBT</option>
            <option value="Google Sites">Google Sites</option>
            <option value="Lainnya">Platform Lainnya</option>
          </select>
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:bg-white focus:border-blue-600 focus:outline-hidden"
          >
            <option value="all">Semua 6 Kategori Asesmen</option>
            {ASSESSMENT_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:bg-white focus:border-blue-600 focus:outline-hidden"
          >
            <option value="all">Semua Kelas (1 - 6)</option>
            {[1, 2, 3, 4, 5, 6].map((l) => (
              <option key={l} value={l.toString()}>
                Kelas {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* High-density Link Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Asesmen & Materi</th>
                <th className="py-3 px-3">Kategori & Sasaran</th>
                <th className="py-3 px-3">Platform & Domain</th>
                <th className="py-3 px-3">Jadwal WITA</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi & Buka</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAssessments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Link2 className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600 text-sm">Belum ada tautan asesmen.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Klik "Tambah Tautan Asesmen" untuk memasukkan URL soal dari platform eksternal.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredAssessments.map((asm) => {
                  const catMeta = getCategoryMeta(asm.category);
                  const sub = subjects.find((s) => s.id === asm.subjectId);
                  let domain = '';
                  try {
                    domain = new URL(asm.assessmentUrl).hostname;
                  } catch {
                    domain = 'invalid-url';
                  }

                  return (
                    <tr key={asm.id} className="hover:bg-slate-50/75 transition-colors">
                      {/* Asesmen & Materi */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 leading-snug">{asm.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          <span>{sub?.name || 'Mata Pelajaran'}</span>
                          <span className="mx-1.5 text-slate-300">·</span>
                          <span>{asm.chapterOrTopic}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Guru: {asm.teacherName}
                        </div>
                      </td>

                      {/* Kategori & Sasaran */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">
                          {catMeta?.title || asm.category}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Kelas {asm.level} ({asm.rombelTargets.join(', ')})
                        </div>
                        {asm.category === 'tka' && (
                          <div className="text-[10px] font-bold text-rose-700 mt-0.5">
                            {asm.isOfficialTka ? 'TKA Resmi' : 'Simulasi Internal'}
                          </div>
                        )}
                      </td>

                      {/* Platform & Domain */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 text-[11px] font-semibold rounded border ${getPlatformColor(
                              asm.platform
                            )}`}
                          >
                            {asm.platform === 'Lainnya' ? asm.customPlatformName || 'Lainnya' : asm.platform}
                          </span>
                        </div>
                        <div className="font-mono text-[11px] text-slate-500 mt-1 flex items-center gap-1 truncate max-w-[180px]" title={asm.assessmentUrl}>
                          <Globe className="h-3 w-3 shrink-0 text-slate-400" />
                          <span className="truncate">{domain}</span>
                        </div>
                      </td>

                      {/* Jadwal WITA */}
                      <td className="py-3 px-3 text-[11px] text-slate-600 whitespace-nowrap tabular-nums">
                        <div>{new Date(asm.startTime).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                        <div className="text-slate-400">
                          {new Date(asm.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - {new Date(asm.endTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WITA
                        </div>
                        <div className="text-[10px] text-slate-500">{asm.durationMinutes} Menit</div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                            asm.status === 'berlangsung'
                              ? 'bg-emerald-100 text-emerald-800'
                              : asm.status === 'terjadwal'
                              ? 'bg-blue-100 text-blue-800'
                              : asm.status === 'selesai'
                              ? 'bg-slate-100 text-slate-700'
                              : asm.status === 'dibatalkan'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {asm.status}
                        </span>
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Test open button */}
                          <a
                            href={asm.assessmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                            title="Buka Lembar Soal Langsung"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span>Buka Soal</span>
                          </a>

                          {/* Copy URL */}
                          <button
                            onClick={() => handleCopyLink(asm)}
                            className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                            title="Salin Tautan ke Clipboard"
                          >
                            {copiedId === asm.id ? (
                              <Check className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>

                          {/* Duplicate */}
                          {canManage && (
                            <button
                              onClick={() => duplicateAssessment(asm.id)}
                              className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                              title="Duplikasi Kegiatan Asesmen"
                            >
                              <CopyCheck className="h-4 w-4" />
                            </button>
                          )}

                          {/* Edit */}
                          {canManage && (
                            <button
                              onClick={() => {
                                setEditingAssessment(asm);
                                setIsModalOpen(true);
                              }}
                              className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                              title="Ubah Asesmen & Tautan"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}

                          {/* Delete */}
                          {canManage && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Yakin ingin menghapus asesmen '${asm.title}'?`)) {
                                  deleteAssessment(asm.id);
                                }
                              }}
                              className="rounded-lg border border-slate-200 p-1.5 text-red-600 hover:bg-red-50 transition-colors"
                              title="Hapus Asesmen"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
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

      {/* Modal Form */}
      {isModalOpen && (
        <AssessmentFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingAssessment(null);
          }}
          assessmentToEdit={editingAssessment}
        />
      )}
    </div>
  );
};
