import React from 'react';
import {
  Check,
  CheckSquare,
  HelpCircle,
  Square,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { ASSESSMENT_CATEGORIES } from '../../data/seedData';
import { AssessmentCategoryType } from '../../types';
import { useApp } from '../../context/AppContext';

interface ActiveCategoriesChecklistProps {
  compact?: boolean;
  showTitle?: boolean;
  canEdit?: boolean;
}

export const ActiveCategoriesChecklist: React.FC<ActiveCategoriesChecklistProps> = ({
  compact = false,
  showTitle = true,
  canEdit = true,
}) => {
  const {
    activeCategories,
    toggleAssessmentCategoryActive,
    isCategoryActive,
    currentUser,
    logAction,
  } = useApp();

  const isAllowedToEdit =
    canEdit && (currentUser.role === 'super_admin' || currentUser.role === 'guru');

  const activeCount = activeCategories.length;
  const totalCount = ASSESSMENT_CATEGORIES.length;

  const handleSelectAll = () => {
    if (!isAllowedToEdit) return;
    ASSESSMENT_CATEGORIES.forEach((cat) => {
      if (!isCategoryActive(cat.id)) {
        toggleAssessmentCategoryActive(cat.id);
      }
    });
    logAction('Aktivasi Seluruh Asesmen', 'Semua 6 jenis asesmen diberi tanda ceklist aktif pelaksanaan.');
  };

  return (
    <div className="rounded-2xl border-2 border-emerald-200/80 bg-white p-4 sm:p-6 shadow-sm space-y-4">
      {/* Header Info */}
      {showTitle && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                <CheckSquare className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight">
                  Fitur Kotak Ceklist: Jenis Asesmen Aktif Pelaksanaan Asesmen
                </h3>
                <span className="text-[11px] text-emerald-700 font-semibold">
                  Kontrol Periode Ujian Madrasah Ibtidaiyah Negeri 1 Paser
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
              Beri tanda <strong>ceklist [ ✓ ]</strong> pada kotak jenis asesmen yang <strong>aktif dan akan digunakan untuk pelaksanaan asesmen</strong>. Hanya jenis asesmen yang diberi tanda ceklist yang akan dibuka untuk pengerjaan oleh peserta didik.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0">
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 tabular-nums flex items-center gap-2 shadow-2xs">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>{activeCount} dari {totalCount} Aktif Diceklist</span>
            </span>

            {isAllowedToEdit && (
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 text-slate-700 transition-colors"
                title="Beri tanda ceklist pada seluruh jenis asesmen"
              >
                Centang Semua [ ✓ ]
              </button>
            )}
          </div>
        </div>
      )}

      {/* Grid of 6 Checkbox Cards with Checkmarks */}
      <div
        className={`grid gap-3.5 ${
          compact
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        {ASSESSMENT_CATEGORIES.map((cat) => {
          const isActive = isCategoryActive(cat.id);

          return (
            <div
              key={cat.id}
              onClick={() => {
                if (isAllowedToEdit) {
                  toggleAssessmentCategoryActive(cat.id);
                }
              }}
              role="checkbox"
              aria-checked={isActive}
              tabIndex={isAllowedToEdit ? 0 : -1}
              onKeyDown={(e) => {
                if (isAllowedToEdit && (e.key === ' ' || e.key === 'Enter')) {
                  e.preventDefault();
                  toggleAssessmentCategoryActive(cat.id);
                }
              }}
              className={`relative select-none flex flex-col justify-between rounded-xl border-2 p-4 transition-all duration-200 ${
                isAllowedToEdit ? 'cursor-pointer hover:shadow-md' : 'cursor-default'
              } ${
                isActive
                  ? 'border-emerald-500 bg-gradient-to-br from-emerald-50/80 to-white shadow-xs'
                  : 'border-slate-200 bg-slate-50/60 opacity-65 hover:opacity-90'
              }`}
            >
              <div>
                {/* Top Row: Category title, dot indicator, and Kotak Ceklist */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-3.5 w-3.5 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: cat.accentColor }}
                    />
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm leading-snug">
                        {cat.title}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Kategori Resmi MI
                      </span>
                    </div>
                  </div>

                  {/* KOTAK DENGAN TANDA CEKLIST (Prominent Checkbox Box) */}
                  <div className="shrink-0 pt-0.5" title={isActive ? 'Klik untuk melepas ceklist' : 'Klik untuk memberi tanda ceklist'}>
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-lg border-2 transition-all ${
                        isActive
                          ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-200'
                          : 'border-slate-300 bg-white hover:border-emerald-400'
                      }`}
                    >
                      {isActive ? (
                        <Check className="h-5 w-5 stroke-[3]" />
                      ) : (
                        <span className="h-2.5 w-2.5 rounded-xs bg-transparent" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                  {cat.description}
                </p>
              </div>

              {/* Status Badge & Checklist Indicator */}
              <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  {isActive ? (
                    <span className="font-bold text-emerald-800 flex items-center gap-1.5 bg-emerald-100/70 px-2 py-0.5 rounded-md border border-emerald-300">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-white text-[10px] font-black">
                        ✓
                      </span>
                      <span>AKTIF DIGUNAKAN</span>
                    </span>
                  ) : (
                    <span className="font-medium text-slate-500 flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-300 text-slate-600 text-[10px]">
                        –
                      </span>
                      <span>NONAKTIF</span>
                    </span>
                  )}
                </div>

                <span
                  className="font-bold text-[10px] px-2 py-0.5 rounded border"
                  style={{
                    backgroundColor: `${cat.accentColor}15`,
                    borderColor: `${cat.accentColor}40`,
                    color: cat.accentColor,
                  }}
                >
                  {cat.badgeLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Helper Footer */}
      {isAllowedToEdit ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="text-emerald-600 font-bold">✓</span>
            <em>Klik pada kotak atau kartu di atas untuk memberi/mencabut tanda ceklist jenis asesmen.</em>
          </span>
          <span className="text-slate-400">
            Perubahan otomatis tersimpan ke sistem portal & memfilter asesmen pelaksanaan.
          </span>
        </div>
      ) : (
        <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
          ℹ️ <em>Status jenis asesmen yang aktif pelaksanaan dikonfigurasi oleh Tenaga Pendidik / Admin Super.</em>
        </div>
      )}
    </div>
  );
};
