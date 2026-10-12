import React, { useState } from 'react';
import { Search, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useApp();
  const [search, setSearch] = useState('');

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Audit Log & Jejak Aktivitas Keamanan
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              {auditLogs.length} Catatan Log
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pencatatan riwayat perubahan nilai, penambahan tautan, konfigurasi lembaga, dan hak akses.
          </p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Cari tindakan, nama pengguna, atau rincian..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs focus:border-blue-600 focus:outline-hidden"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-44">Waktu (WITA)</th>
                <th className="py-3 px-4 w-48">Pengguna</th>
                <th className="py-3 px-4 w-52">Tindakan</th>
                <th className="py-3 px-4">Rincian Aktivitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-4 tabular-nums text-slate-500 text-[11px]">
                    {new Date(log.timestamp).toLocaleString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}{' '}
                    WITA
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="font-semibold text-slate-800">{log.userName}</div>
                    <div className="text-[10px] text-slate-400 capitalize">{log.userRole.replace('_', ' ')}</div>
                  </td>
                  <td className="py-2.5 px-4 font-bold text-slate-900">{log.action}</td>
                  <td className="py-2.5 px-4 text-slate-600 leading-relaxed text-[11px]">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
