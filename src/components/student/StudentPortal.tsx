import React, { useState } from 'react';
import {
  AlertCircle,
  Award,
  BookOpen,
  Calendar,
  Check,
  CheckCircle,
  CheckSquare,
  Clock,
  ExternalLink,
  FileText,
  HelpCircle,
  Lock,
  Smile,
  User,
  X,
} from 'lucide-react';
import { ASSESSMENT_CATEGORIES } from '../../data/seedData';
import { Assessment } from '../../types';
import { useApp } from '../../context/AppContext';

export const StudentPortal: React.FC = () => {
  const { currentUser, assessments, subjects, scores, announcements, isCategoryActive } = useApp();

  const [activeTab, setActiveTab] = useState<'berlangsung' | 'akan_datang' | 'riwayat'>('berlangsung');
  const [selectedInstructionsAssessment, setSelectedInstructionsAssessment] = useState<Assessment | null>(null);

  // Student class level (default 6 for demo student)
  const studentLevel = 6;
  const studentRombel = '6A';

  // Assessments targeted for this student
  const myAssessments = assessments.filter(
    (asm) =>
      asm.level === studentLevel &&
      asm.status !== 'draft' &&
      (asm.rombelTargets.includes('Semua') || asm.rombelTargets.includes(studentRombel))
  );

  const now = new Date();

  // Active / Ongoing assessments
  const ongoingAssessments = myAssessments.filter((asm) => {
    const start = new Date(asm.startTime);
    const end = new Date(asm.endTime);
    return asm.status === 'berlangsung' || (now >= start && now <= end && asm.status !== 'dibatalkan');
  });

  // Upcoming assessments
  const upcomingAssessments = myAssessments.filter((asm) => {
    const start = new Date(asm.startTime);
    return now < start && asm.status !== 'dibatalkan';
  });

  // Completed or historical assessments
  const pastAssessments = myAssessments.filter((asm) => {
    const end = new Date(asm.endTime);
    return now > end || asm.status === 'selesai';
  });

  const getSubject = (subId: string) => subjects.find((s) => s.id === subId);
  const getCategoryMeta = (catId: string) => ASSESSMENT_CATEGORIES.find((c) => c.id === catId);

  // Find score for a specific assessment
  const getStudentScore = (assessmentId: string) => {
    return scores.find((s) => s.assessmentId === assessmentId && (s.studentNis === currentUser.nipOrNis || s.studentName === currentUser.fullName));
  };

  return (
    <div className="space-y-6">
      {/* Student Friendly Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 p-6 md:p-8 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold mb-1">
              <Smile className="h-4 w-4 text-amber-300" />
              <span>Assalamu’alaikum Warahmatullahi Wabarakatuh</span>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
              Selamat Datang, {currentUser.fullName}!
            </h1>
            <p className="mt-1 text-xs md:text-sm text-blue-100 max-w-xl leading-relaxed">
              Kamu terdaftar di <strong>Kelas {studentRombel} MIN 1 Paser</strong>. Kerjakan asesmen dengan mandiri, jujur, dan penuh semangat!
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xs px-4 py-3 rounded-xl border border-white/15 shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400 text-slate-900 font-black">
              MI
            </div>
            <div className="text-left">
              <span className="text-[11px] text-blue-200 block">Status Siswa</span>
              <span className="text-xs font-bold text-white">Aktif Mengikuti Ujian</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pinned Class Announcements */}
      {announcements.filter((a) => a.targetAudience === 'Semua' || a.targetAudience === studentRombel || a.targetAudience === 'Peserta Didik').length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900 mb-1.5">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span>Pengumuman Asesmen untuk Siswa</span>
          </div>
          <div className="space-y-1">
            {announcements
              .filter((a) => a.targetAudience === 'Semua' || a.targetAudience === studentRombel || a.targetAudience === 'Peserta Didik')
              .slice(0, 2)
              .map((a) => (
                <div key={a.id} className="text-xs text-amber-800 leading-relaxed">
                  <span className="font-semibold">{a.title}:</span> {a.content}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Kotak Ceklist: Jenis Asesmen yang Aktif Digunakan untuk Pelaksanaan */}
      <div className="rounded-xl border-2 border-emerald-200 bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <CheckSquare className="h-3.5 w-3.5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                Jenis Asesmen Aktif Pelaksanaan Ujian Madrasah
              </h3>
              <p className="text-[11px] text-slate-500">
                Kotak bertanda ceklist [ ✓ ] menunjukkan jenis asesmen yang sedang aktif dibuka untuk pelaksanaan ujian.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full self-start sm:self-auto flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Pelaksanaan Asesmen Dibuka</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {ASSESSMENT_CATEGORIES.map((cat) => {
            const isActive = isCategoryActive(cat.id);
            return (
              <div
                key={cat.id}
                className={`rounded-lg border p-2 text-center transition-all flex flex-col items-center justify-between gap-1.5 ${
                  isActive
                    ? 'border-emerald-300 bg-emerald-50/70 shadow-2xs'
                    : 'border-slate-200 bg-slate-50/50 opacity-60'
                }`}
              >
                {/* Kotak dengan Tanda Ceklist */}
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded border transition-all ${
                    isActive
                      ? 'border-emerald-600 bg-emerald-600 text-white shadow-2xs'
                      : 'border-slate-300 bg-white'
                  }`}
                  title={isActive ? 'Aktif digunakan untuk ujian' : 'Tidak aktif saat ini'}
                >
                  {isActive && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                </div>
                <span className="text-[11px] font-bold text-slate-900 line-clamp-1">
                  {cat.badgeLabel}
                </span>
                <span
                  className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ${
                    isActive ? 'text-emerald-800 bg-emerald-100/90' : 'text-slate-400 bg-slate-100'
                  }`}
                >
                  {isActive ? 'Aktif Ujian' : 'Nonaktif'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('berlangsung')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === 'berlangsung'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Sedang Berlangsung</span>
          <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.2 text-[10px] tabular-nums">
            {ongoingAssessments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('akan_datang')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === 'akan_datang'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Akan Datang</span>
          <span className="ml-1 rounded-full bg-slate-200 text-slate-800 px-1.5 py-0.2 text-[10px] tabular-nums">
            {upcomingAssessments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('riwayat')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === 'riwayat'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="h-4 w-4" />
          <span>Riwayat & Nilai Saya</span>
          <span className="ml-1 rounded-full bg-slate-200 text-slate-800 px-1.5 py-0.2 text-[10px] tabular-nums">
            {pastAssessments.length}
          </span>
        </button>
      </div>

      {/* Assessment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeTab === 'berlangsung' && (
          ongoingAssessments.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
              <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
              <h3 className="font-bold text-slate-700 text-sm">Tidak Ada Asesmen Aktif Saat Ini</h3>
              <p className="text-xs text-slate-400 mt-1">
                Semua tugas dan ujian terjadwal telah selesai atau belum dimulai. Silakan cek tab "Akan Datang".
              </p>
            </div>
          ) : (
            ongoingAssessments.map((asm) => (
              <AssessmentStudentCard
                key={asm.id}
                assessment={asm}
                subject={getSubject(asm.subjectId)?.name || 'Mata Pelajaran'}
                categoryMeta={getCategoryMeta(asm.category)}
                scoreRecord={getStudentScore(asm.id)}
                onShowInstructions={() => setSelectedInstructionsAssessment(asm)}
              />
            ))
          )
        )}

        {activeTab === 'akan_datang' && (
          upcomingAssessments.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
              <Calendar className="h-10 w-10 text-blue-400 mx-auto mb-2" />
              <h3 className="font-bold text-slate-700 text-sm">Belum Ada Jadwal Ujian Mendatang</h3>
              <p className="text-xs text-slate-400 mt-1">
                Guru belum menambahkan jadwal asesmen baru untuk kelasmu.
              </p>
            </div>
          ) : (
            upcomingAssessments.map((asm) => (
              <AssessmentStudentCard
                key={asm.id}
                assessment={asm}
                subject={getSubject(asm.subjectId)?.name || 'Mata Pelajaran'}
                categoryMeta={getCategoryMeta(asm.category)}
                scoreRecord={getStudentScore(asm.id)}
                onShowInstructions={() => setSelectedInstructionsAssessment(asm)}
              />
            ))
          )
        )}

        {activeTab === 'riwayat' && (
          pastAssessments.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
              <Award className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <h3 className="font-bold text-slate-700 text-sm">Belum Ada Riwayat Asesmen</h3>
              <p className="text-xs text-slate-400 mt-1">
                Riwayat asesmen dan nilai yang sudah dipublikasikan oleh guru akan tampil di sini.
              </p>
            </div>
          ) : (
            pastAssessments.map((asm) => (
              <AssessmentStudentCard
                key={asm.id}
                assessment={asm}
                subject={getSubject(asm.subjectId)?.name || 'Mata Pelajaran'}
                categoryMeta={getCategoryMeta(asm.category)}
                scoreRecord={getStudentScore(asm.id)}
                onShowInstructions={() => setSelectedInstructionsAssessment(asm)}
              />
            ))
          )
        )}
      </div>

      {/* Modal Petunjuk Asesmen */}
      {selectedInstructionsAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  Petunjuk Teknis Ujian
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {selectedInstructionsAssessment.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInstructionsAssessment(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div>
                <span className="font-semibold text-slate-800 block mb-1">Materi & Tujuan Pembelajaran:</span>
                <p className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-700 leading-relaxed">
                  {selectedInstructionsAssessment.chapterOrTopic}
                  {selectedInstructionsAssessment.cpOrTp && ` · ${selectedInstructionsAssessment.cpOrTp}`}
                </p>
              </div>

              <div>
                <span className="font-semibold text-slate-800 block mb-1">Tata Tertib & Petunjuk Soal:</span>
                <p className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 text-slate-800 leading-relaxed whitespace-pre-line font-medium">
                  {selectedInstructionsAssessment.instructions || 'Ikuti seluruh petunjuk yang ada pada lembar soal.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div className="rounded-lg border border-slate-200 p-2">
                  <span className="text-slate-400 block">Durasi Ujian:</span>
                  <span className="font-bold text-slate-800">{selectedInstructionsAssessment.durationMinutes} Menit</span>
                </div>
                <div className="rounded-lg border border-slate-200 p-2">
                  <span className="text-slate-400 block">Platform Soal:</span>
                  <span className="font-bold text-slate-800">{selectedInstructionsAssessment.platform}</span>
                </div>
              </div>

              {selectedInstructionsAssessment.teacherContact && (
                <div className="text-[11px] text-slate-500 pt-1">
                  Kendala teknis? Hubungi guru pengampu: <strong>{selectedInstructionsAssessment.teacherName}</strong> ({selectedInstructionsAssessment.teacherContact})
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedInstructionsAssessment(null)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Tutup
              </button>
              {selectedInstructionsAssessment.canStudentOpen && (
                <a
                  href={selectedInstructionsAssessment.assessmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Buka Lembar Soal</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface CardProps {
  assessment: Assessment;
  subject: string;
  categoryMeta?: { title: string; accentColor: string; bgLightColor: string };
  scoreRecord?: {
    score: number | null;
    rawScore?: number;
    maxScore: number;
    attendanceStatus: string;
    teacherNotes?: string;
  };
  onShowInstructions: () => void;
}

const AssessmentStudentCard: React.FC<CardProps> = ({
  assessment,
  subject,
  categoryMeta,
  scoreRecord,
  onShowInstructions,
}) => {
  const now = new Date();
  const start = new Date(assessment.startTime);
  const end = new Date(assessment.endTime);

  const isBeforeStart = now < start;
  const isAfterEnd = now > end;
  const isWithinSchedule = now >= start && now <= end;
  const isCanceled = assessment.status === 'dibatalkan';

  // Determine button state according to specification Bagian H
  let buttonLabel = 'Mulai Asesmen';
  let buttonDisabled = false;
  let buttonStyle = 'bg-blue-600 hover:bg-blue-700 text-white';

  if (isCanceled) {
    buttonLabel = 'Dibatalkan';
    buttonDisabled = true;
    buttonStyle = 'bg-slate-200 text-slate-500 cursor-not-allowed';
  } else if (!assessment.canStudentOpen) {
    buttonLabel = 'Tautan Dikunci Guru';
    buttonDisabled = true;
    buttonStyle = 'bg-slate-200 text-slate-500 cursor-not-allowed';
  } else if (isBeforeStart) {
    buttonLabel = 'Belum Dibuka';
    buttonDisabled = true;
    buttonStyle = 'bg-slate-200 text-slate-500 cursor-not-allowed';
  } else if (isAfterEnd) {
    buttonLabel = 'Waktu Berakhir';
    buttonDisabled = true;
    buttonStyle = 'bg-slate-200 text-slate-500 cursor-not-allowed';
  }

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-colors">
      <div>
        {/* Top Metadata Header */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-bold text-blue-700">
            {categoryMeta?.title || assessment.category}
          </span>
          <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
            {assessment.platform}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
          {assessment.title}
        </h3>

        {/* Subject & Topic */}
        <div className="mt-2 text-xs text-slate-500">
          <div className="font-medium text-slate-700">{subject}</div>
          <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{assessment.chapterOrTopic}</div>
        </div>

        {/* Teacher & Schedule */}
        <div className="mt-3 rounded-lg bg-slate-50 p-2.5 space-y-1.5 text-[11px] text-slate-600 border border-slate-100">
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">Guru: {assessment.teacherName}</span>
          </div>
          <div className="flex items-center gap-1.5 tabular-nums">
            <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>
              {start.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })},{' '}
              {start.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} -{' '}
              {end.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WITA
            </span>
          </div>
          <div className="text-[10px] text-slate-400">
            Durasi pengerjaan: {assessment.durationMinutes} menit
          </div>
        </div>

        {/* Published Score Banner (if published) */}
        {assessment.isScorePublished && scoreRecord && scoreRecord.score !== null && (
          <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Nilai Kamu:</span>
              <span className="text-base font-extrabold text-emerald-700 tabular-nums">
                {scoreRecord.score} <span className="text-xs text-emerald-600 font-medium">/ {scoreRecord.maxScore}</span>
              </span>
            </div>
            <div className="text-right text-[11px]">
              <span
                className={`font-bold ${
                  scoreRecord.score >= assessment.passingScore ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {scoreRecord.score >= assessment.passingScore ? 'Tuntas (KKTP)' : 'Perlu Pendampingan'}
              </span>
              {scoreRecord.teacherNotes && (
                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{scoreRecord.teacherNotes}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
        <button
          onClick={onShowInstructions}
          className="flex-1 rounded-lg border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Lihat Petunjuk
        </button>

        {buttonDisabled ? (
          <button
            disabled
            className={`flex-1 rounded-lg py-2 text-xs font-semibold ${buttonStyle}`}
          >
            {buttonLabel}
          </button>
        ) : (
          <a
            href={assessment.assessmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex-1 rounded-lg py-2 text-xs font-semibold text-center flex items-center justify-center gap-1.5 ${buttonStyle}`}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>{buttonLabel}</span>
          </a>
        )}
      </div>
    </div>
  );
};
