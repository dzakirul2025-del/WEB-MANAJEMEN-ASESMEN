import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Copy,
  Edit,
  ExternalLink,
  FileSpreadsheet,
  Globe,
  Plus,
  Search,
  Trash2,
  Check,
  Layers,
} from 'lucide-react';
import { ASSESSMENT_CATEGORIES } from '../../data/seedData';
import { Assessment, AssessmentCategoryType } from '../../types';
import { useApp } from '../../context/AppContext';
import { AssessmentFormModal } from './AssessmentFormModal';

interface AssessmentListProps {
  forcedCategory?: AssessmentCategoryType;
}

export const AssessmentList: React.FC<AssessmentListProps> = ({ forcedCategory }) => {
  const {
    assessments,
    subjects,
    deleteAssessment,
    duplicateAssessment,
    setCurrentView,
    currentUser,
    isCategoryActive,
    toggleAssessmentCategoryActive,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<AssessmentCategoryType | 'all'>(
    forcedCategory || 'all'
  );
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  React.useEffect(() => {
    if (forcedCategory) {
      setActiveCategory(forcedCategory);
    }
  }, [forcedCategory]);

  const canManage = currentUser.role === 'super_admin' || currentUser.role === 'guru';

  const filteredAssessments = assessments.filter((asm) => {
    const matchCat = activeCategory === 'all' || asm.category === activeCategory;
    const matchSearch =
      asm.title.toLowerCase().includes(search.toLowerCase()) ||
      asm.chapterOrTopic.toLowerCase().includes(search.toLowerCase()) ||
      asm.teacherName.toLowerCase().includes(search.toLowerCase());
    const matchLevel = levelFilter === 'all' || asm.level.toString() === levelFilter;
    const matchStatus = statusFilter === 'all' || asm.status === statusFilter;
    return matchCat && matchSearch && matchLevel && matchStatus;
  });

  const currentCategoryInfo = ASSESSMENT_CATEGORIES.find((c) => c.id === activeCategory);

  const handleCopyLink = (asm: Assessment) => {
    navigator.clipboard.writeText(asm.assessmentUrl);
    setCopiedId(asm.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Category Banner if specific */}
      {currentCategoryInfo ? (
        <div
          className="rounded-2xl p-6 border text-slate-900"
          style={{
            backgroundColor: `${currentCategoryInfo.accentColor}0D`,
            borderColor: `${currentCategoryInfo.accentColor}33`,
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: currentCategoryInfo.accentColor }}
                />
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  {currentCategoryInfo.title}
                </h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white border border-slate-200">
                  {filteredAssessments.length} Kegiatan
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-600 max-w-2xl leading-relaxed">
                {currentCategoryInfo.description}
              </p>

              {/* Fitur Kotak Ceklist: Status Aktif Pelaksanaan Asesmen */}
              <div className="flex flex-wrap items-center gap-2.5 mt-3 pt-3 border-t border-slate-200/70">
                <button
                  type="button"
                  onClick={() => {
                    if (canManage && currentCategoryInfo) {
                      toggleAssessmentCategoryActive(currentCategoryInfo.id);
                    }
                  }}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold select-none transition-all ${
                    canManage ? 'cursor-pointer hover:shadow-xs active:scale-98' : 'cursor-default'
                  } ${
                    isCategoryActive(currentCategoryInfo.id)
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                  }`}
                  title={
                    canManage
                      ? 'Klik untuk mengubah status ceklist jenis asesmen ini'
                      : 'Status pelaksanaan ditentukan oleh Guru/Admin'
                  }
                >
                  {/* Kotak Checklist */}
                  <div
                    className={`flex h-4.5 w-4.5 items-center justify-center rounded border transition-all ${
                      isCategoryActive(currentCategoryInfo.id)
                        ? 'border-white bg-white text-emerald-700'
                        : 'border-slate-400 bg-white'
                    }`}
                  >
                    {isCategoryActive(currentCategoryInfo.id) && (
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    )}
                  </div>
                  <span>
                    {isCategoryActive(currentCategoryInfo.id)
                      ? 'Kotak Ceklist: [ ✓ ] AKTIF DIGUNAKAN UNTUK PELAKSANAAN'
                      : 'Kotak Ceklist: [   ] NONAKTIF / BELUM DICEKLIST'}
                  </span>
                </button>

                {canManage && (
                  <span className="text-[11px] text-slate-500">
                    💡 <em>Klik kotak ceklist di atas untuk mengaktifkan / menonaktifkan jenis asesmen ini.</em>
                  </span>
                )}
              </div>
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
                <span>Buat Asesmen Baru</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Daftar Seluruh Kegiatan Asesmen
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Pengelolaan lengkap 6 kategori asesmen (Formatif, Sumatif Bab, SAS, SAT, Try Out, dan TKA).
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
              <span>Tambah Asesmen</span>
            </button>
          )}
        </div>
      )}

      {/* Category Segmented Tabs (If not forced single category) */}
      {!forcedCategory && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 text-xs">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
              activeCategory === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Semua ({assessments.length})
          </button>
          {ASSESSMENT_CATEGORIES.map((cat) => {
            const isCatActive = isCategoryActive(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {/* Kotak Checklist Status */}
                <span
                  className={`flex h-3.5 w-3.5 items-center justify-center rounded-xs border text-[9px] font-black ${
                    isCatActive
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-slate-300 bg-white text-transparent'
                  }`}
                  title={isCatActive ? 'Status: Aktif Diceklist' : 'Status: Nonaktif'}
                >
                  {isCatActive ? '✓' : ''}
                </span>
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: cat.accentColor }}
                />
                <span>{cat.badgeLabel}</span>
                <span className="opacity-75 text-[11px] tabular-nums">
                  ({assessments.filter((a) => a.category === cat.id).length})
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari asesmen, materi, atau guru..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs focus:bg-white focus:border-blue-600 focus:outline-hidden"
          />
        </div>

        <div>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
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

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:bg-white focus:border-blue-600 focus:outline-hidden"
          >
            <option value="all">Semua Status Pelaksanaan</option>
            <option value="draft">Draf</option>
            <option value="terjadwal">Terjadwal</option>
            <option value="berlangsung">Sedang Berlangsung</option>
            <option value="selesai">Selesai</option>
            <option value="dibatalkan">Dibatalkan</option>
          </select>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssessments.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
            <Layers className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-slate-700 text-sm">Tidak Ada Kegiatan Asesmen Ditemukan</h3>
            <p className="text-xs text-slate-400 mt-1">
              Silakan tambahkan asesmen baru atau sesuaikan filter pencarian.
            </p>
          </div>
        ) : (
          filteredAssessments.map((asm) => {
            const catMeta = ASSESSMENT_CATEGORIES.find((c) => c.id === asm.category);
            const sub = subjects.find((s) => s.id === asm.subjectId);

            return (
              <div
                key={asm.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-colors"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold text-blue-700">
                      {catMeta?.title || asm.category}
                    </span>
                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {asm.platform}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                    {asm.title}
                  </h3>

                  {/* Subject and Topic */}
                  <div className="mt-2 text-xs text-slate-500">
                    <span className="font-medium text-slate-700">{sub?.name || 'Mata Pelajaran'}</span>
                    <span className="mx-1.5 text-slate-300">·</span>
                    <span>Kelas {asm.level} ({asm.rombelTargets.join(', ')})</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                    {asm.chapterOrTopic}
                  </div>

                  {/* Schedule */}
                  <div className="mt-3 rounded-lg bg-slate-50 p-2.5 text-[11px] text-slate-600 space-y-1 border border-slate-100">
                    <div className="flex items-center gap-1.5 tabular-nums">
                      <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>
                        {new Date(asm.startTime).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                        })}{' '}
                        · {new Date(asm.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WITA
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Durasi: {asm.durationMinutes} menit · Guru: {asm.teacherName}
                    </div>
                  </div>

                  {/* Category-specific indicators */}
                  {asm.category === 'tka' && (
                    <div className="mt-2 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      {asm.isOfficialTka ? 'TKA Resmi Daerah/Pusat' : 'Simulasi Pembinaan Internal'}
                    </div>
                  )}
                  {asm.category === 'try_out' && asm.tryOutOrganizer && (
                    <div className="mt-2 text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Penyelenggara: {asm.tryOutOrganizer}
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <a
                      href={asm.assessmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors inline-flex items-center gap-1"
                      title="Buka Soal Eksternal"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Buka</span>
                    </a>

                    <button
                      onClick={() => handleCopyLink(asm)}
                      className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 transition-colors"
                      title="Salin Link"
                    >
                      {copiedId === asm.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentView('scores')}
                      className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors inline-flex items-center gap-1"
                      title="Kelola Nilai Siswa"
                    >
                      <FileSpreadsheet className="h-3.5 w-3.5" />
                      <span>Nilai</span>
                    </button>

                    {canManage && (
                      <>
                        <button
                          onClick={() => {
                            setEditingAssessment(asm);
                            setIsModalOpen(true);
                          }}
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 transition-colors"
                          title="Ubah Asesmen"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus kegiatan asesmen '${asm.title}'?`)) {
                              deleteAssessment(asm.id);
                            }
                          }}
                          className="rounded-lg border border-slate-200 p-1.5 text-red-600 hover:bg-red-50 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Edit / Add */}
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
