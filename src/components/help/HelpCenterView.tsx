import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  HelpCircle,
  Link2,
  Server,
  ShieldCheck,
  User,
} from 'lucide-react';

export const HelpCenterView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'guru' | 'siswa' | 'admin' | 'platform' | 'devops'>('guru');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Pusat Bantuan & Petunjuk Operasional
          </h1>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
            MIN 1 Paser
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Dokumentasi teknis, petunjuk peran, dan panduan pengelolaan asesmen digital bagi seluruh civitas madrasah.
        </p>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-xs">
        {[
          { id: 'guru', label: 'Alur Kerja Guru', icon: User },
          { id: 'siswa', label: 'Petunjuk Peserta Didik', icon: GraduationCap },
          { id: 'admin', label: 'Panduan Super Admin', icon: ShieldCheck },
          { id: 'platform', label: 'Integrasi Multi-Platform', icon: Link2 },
          { id: 'devops', label: 'Setup Database & Vercel', icon: Server },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                activeSection === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION CONTENT: GURU */}
      {activeSection === 'guru' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6 text-xs text-slate-700">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-1">
              Standar Operasional Prosedur (SOP) Alur Kerja Guru
            </h2>
            <p className="text-slate-500">
              Guru tidak diwajibkan mengetik soal di dalam website. Cukup siapkan lembar soal di platform pilihan, lalu tautkan ke portal ini.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                step: '1. Buat Soal di Platform Eksternal',
                desc: 'Susun butir soal pilihan ganda, isian, atau uraian di aplikasi seperti Wayground, EdCafe, Google Forms, Quizizz, Moodle, atau CBT sekolah.',
              },
              {
                step: '2. Salin Tautan (URL) Pembagian',
                desc: 'Salin tautan pengerjaan peserta didik. Pastikan tautan dapat diakses tanpa perlu login akun administrator.',
              },
              {
                step: '3. Masuk ke Menu "Bank Tautan Asesmen"',
                desc: 'Pilih tombol "Tambah Asesmen", tentukan 1 dari 6 kategori wajib (Formatif, Sumatif Bab, SAS, SAT, Try Out, atau TKA).',
              },
              {
                step: '4. Lengkapi Form & Uji Buka Tautan',
                desc: 'Pilih kelas sasaran, mata pelajaran, materi, jadwal mulai & selesai (WITA), lalu klik tombol "Uji Tautan" untuk memastikan URL valid.',
              },
              {
                step: '5. Simpan Sebagai Draf atau Jadwalkan',
                desc: 'Setelah tersimpan, kegiatan otomatis muncul di jadwal kalender madrasah dan dashboard kelas bersangkutan.',
              },
              {
                step: '6. Publikasikan Tautan Sesuai Waktu',
                desc: 'Siswa hanya dapat membuka tautan soal saat jadwal waktu ujian telah masuk (status berlangsung).',
              },
              {
                step: '7. Input Nilai atau Impor Berkas',
                desc: 'Setelah ujian selesai, masukkan nilai di menu "Manajemen Nilai" secara manual atau unduh template Excel lalu unggah kembali hasil dari platform.',
              },
              {
                step: '8. Terbitkan Nilai & Cetak Laporan',
                desc: 'Klik "Publikasikan Nilai" agar siswa dapat melihat nilainya sendiri, kemudian cetak Rekap Laporan resmi bermaterai kop surat madrasah.',
              },
            ].map((s, idx) => (
              <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-1">
                <span className="font-bold text-slate-900 text-xs block">{s.step}</span>
                <p className="text-[11px] text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION CONTENT: SISWA */}
      {activeSection === 'siswa' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6 text-xs text-slate-700">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-1">
              Petunjuk Pengerjaan Asesmen untuk Peserta Didik
            </h2>
            <p className="text-slate-500">
              Panduan bagi anak-anak Madrasah Ibtidaiyah dalam mengikuti asesmen digital di MIN 1 Paser.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 space-y-2">
              <span className="font-bold text-blue-900 text-xs block">
                Aturan Tombol Status Soal:
              </span>
              <ul className="list-disc pl-5 space-y-1 text-slate-700 text-[11px]">
                <li><strong>Belum Dibuka:</strong> Jam ujian belum dimulai. Silakan tunggu hingga waktu yang tertera tiba.</li>
                <li><strong>Mulai Asesmen:</strong> Waktu ujian sedang aktif! Klik tombol ini untuk membuka lembar soal di tab baru.</li>
                <li><strong>Waktu Berakhir:</strong> Batas waktu pengerjaan telah lewat.</li>
                <li><strong>Tautan Dikunci Guru:</strong> Guru sedang menyiapkan soal atau menutup akses sementara.</li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
              <span className="font-bold text-slate-900 text-xs block">
                Tips Saat Mengerjakan Ujian:
              </span>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-[11px]">
                <li>Gunakan gawai (HP, tablet, atau laptop) dengan baterai terisi penuh dan kuota/WiFi lancar.</li>
                <li>Selalu baca tombol <strong>"Lihat Petunjuk"</strong> sebelum menekan Mulai Asesmen.</li>
                <li>Setelah menyelesaikan soal di platform eksternal (misal Google Forms atau Quizizz), pastikan klik tombol <strong>Kirim / Submit</strong> pada formulir soal tersebut.</li>
                <li>Nilai akan muncul di menu "Riwayat & Nilai Saya" setelah guru pengampu selesai merekapitulasi dan memverifikasi hasil.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SECTION CONTENT: ADMIN */}
      {activeSection === 'admin' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6 text-xs text-slate-700">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-1">
              Buku Panduan Administrator Sistem (Super Admin)
            </h2>
            <p className="text-slate-500">
              Pengelolaan master data, keamanan pengguna, audit log, dan identitas madrasah.
            </p>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/70 space-y-1">
              <span className="font-bold text-slate-900 text-xs block">1. Manajemen Akun Pengguna</span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Super Admin dapat membuat akun baru dan menentukan peran hak akses (Super Admin, Guru, Wali Kelas, atau Siswa). Pastikan username NIS siswa unik dan sesuai dengan buku induk madrasah.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/70 space-y-1">
              <span className="font-bold text-slate-900 text-xs block">2. Pengaturan Tahun Pelajaran & Kop Surat</span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Di menu "Pengaturan Lembaga", administrator dapat memperbarui nama Kepala Madrasah, NIP, alamat, tahun pelajaran, dan semester aktif. Perubahan ini otomatis tercermin pada kop surat laporan resmi dan cetakan PDF.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/70 space-y-1">
              <span className="font-bold text-slate-900 text-xs block">3. Audit Log Keamanan</span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Setiap aksi penting (publikasi nilai, penghapusan soal, perubahan master data) otomatis dicatat dengan waktu WITA dan identitas pengguna untuk menjaga integritas data evaluasi.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/70 space-y-1">
              <span className="font-bold text-slate-900 text-xs block">4. Pencadangan Rutin (Backup JSON)</span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Sangat disarankan mengunduh berkas cadangan database JSON secara berkala pada akhir setiap semester sebagai arsip dokumen madrasah.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION CONTENT: PLATFORM */}
      {activeSection === 'platform' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6 text-xs text-slate-700">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-1">
              Panduan Praktis Platform Asesmen Eksternal
            </h2>
            <p className="text-slate-500">
              Kiat penggunaan platform pihak ketiga agar berjalan lancar tanpa kendala izin atau blokir iframe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 p-4 space-y-2">
              <span className="font-bold text-slate-900 text-xs block">Google Forms & Microsoft Forms</span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                • Pastikan setelan formulir: batasi 1 tanggapan (jika siswa memiliki email) atau izinkan pengisian nama & NIS secara manual.<br />
                • Gunakan tautan pendek (goo.gl / forms.gle).
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 space-y-2">
              <span className="font-bold text-slate-900 text-xs block">Quizizz & EdCafe</span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                • Gunakan mode "Pekerjaan Rumah (PR)" atau mode terjadwal agar batas waktu pengerjaan sinkron dengan kalender portal.<br />
                • Tautan yang disalin berupa tautan join kode langsung.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 space-y-2">
              <span className="font-bold text-slate-900 text-xs block">Wayground & Website CBT Eksternal</span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                • Ideal untuk kegiatan Try Out simulasi dan Tes Kemampuan Akademik (TKA).<br />
                • Siswa membuka melalui tab baru agar timer CBT berjalan independen.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 space-y-2">
              <span className="font-bold text-slate-900 text-xs block">Moodle LMS Madrasah</span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                • Salin URL langsung ke modul quiz (`/mod/quiz/view.php?id=...`).<br />
                • Pastikan waktu buka kuis di Moodle sama dengan jadwal di portal ini.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION CONTENT: DEVOPS */}
      {activeSection === 'devops' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6 text-xs text-slate-700">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-1">
              Petunjuk Deployment GitHub, Vercel, & PostgreSQL / Supabase
            </h2>
            <p className="text-slate-500">
              Dokumentasi bagi Tim DevOps dan Pengembang Aplikasi (Dzakirul Husni, S.Pd.)
            </p>
          </div>

          <div className="space-y-3 font-mono text-[11px]">
            <div className="rounded-xl border border-slate-200 bg-slate-900 text-slate-200 p-4 space-y-2">
              <span className="font-sans font-bold text-xs text-white block">1. Skema Database Relasional PostgreSQL / Supabase</span>
              <p className="font-sans text-[11px] text-slate-400">
                File DDL skema 20 tabel lengkap tersedia di berkas <code>src/db/schema.sql</code>. Anda dapat menyalin seluruh perintah DDL dan menjalankannya langsung di Supabase SQL Editor.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-900 text-slate-200 p-4 space-y-2">
              <span className="font-sans font-bold text-xs text-white block">2. Deployment ke Vercel</span>
              <p className="font-sans text-[11px] text-slate-400">
                Proyek ini dibangun menggunakan Vite + React + TypeScript + Tailwind CSS. Konfigurasi build standar di Vercel:
              </p>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-emerald-400">
                Build Command: npm run build<br />
                Output Directory: dist<br />
                Install Command: npm install
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-900 text-slate-200 p-4 space-y-2">
              <span className="font-sans font-bold text-xs text-white block">3. Pembuatan Akun Super Admin Pertama Kali</span>
              <p className="font-sans text-[11px] text-slate-400">
                Akun bawaan Super Admin pertama:
              </p>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-blue-300">
                Username: admin<br />
                Nama: Ismail, S.Ag. (Super Admin)<br />
                NIP: 197405122005011003<br />
                Role: super_admin
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
