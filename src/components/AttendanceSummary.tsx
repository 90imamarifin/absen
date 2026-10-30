import React, { useState, useMemo } from 'react';
import {
  Download,
  Printer,
  Calendar,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { Student, AttendanceDay } from '../types';

interface AttendanceSummaryProps {
  students: Student[];
  allDays: AttendanceDay[];
}

export const AttendanceSummary: React.FC<AttendanceSummaryProps> = ({
  students,
  allDays,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('all'); // 'all' or 'YYYY-MM'

  // Extract unique available months from records
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    allDays.forEach((d) => {
      if (d.date && d.date.length >= 7) {
        set.add(d.date.substring(0, 7));
      }
    });
    return Array.from(set).sort().reverse();
  }, [allDays]);

  // Filter days based on month
  const filteredDays = useMemo(() => {
    if (selectedMonth === 'all') return allDays;
    return allDays.filter((d) => d.date.startsWith(selectedMonth));
  }, [allDays, selectedMonth]);

  // Aggregate stats per student
  const studentStats = useMemo(() => {
    return students.map((student) => {
      let hadir = 0;
      let izin = 0;
      let sakit = 0;
      let alpa = 0;

      filteredDays.forEach((day) => {
        const record = day.records?.[student.id];
        if (record) {
          if (record.status === 'hadir') hadir++;
          else if (record.status === 'izin') izin++;
          else if (record.status === 'sakit') sakit++;
          else if (record.status === 'alpa') alpa++;
        }
      });

      const totalRecorded = hadir + izin + sakit + alpa;
      const percentage =
        filteredDays.length > 0
          ? Math.round((hadir / (filteredDays.length || 1)) * 100)
          : 0;

      return {
        student,
        hadir,
        izin,
        sakit,
        alpa,
        totalRecorded,
        totalDays: filteredDays.length,
        percentage,
      };
    });
  }, [students, filteredDays]);

  // CSV Export Function
  const handleExportCSV = () => {
    const headers = [
      'No',
      'Nama Siswa',
      'Gender',
      'Hadir (H)',
      'Izin (I)',
      'Sakit (S)',
      'Alpa (A)',
      'Total Hari',
      'Persentase Hadir (%)',
    ];

    const rows = studentStats.map((item) => [
      item.student.rollNo,
      `"${item.student.name}"`,
      item.student.gender,
      item.hadir,
      item.izin,
      item.sakit,
      item.alpa,
      item.totalDays,
      `${item.percentage}%`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `rekap_absensi_10_siswa_${selectedMonth || 'semua'}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Action Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Riwayat Presensi</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  Bulan {m}
                </option>
              ))}
            </select>
          </div>
          <span className="text-xs text-slate-500">
            Total {filteredDays.length} hari tercatat
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Rekap</span>
          </button>
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="hidden print:block text-center pb-4 border-b border-slate-300">
        <h1 className="text-xl font-bold text-slate-900">
          REKAPITULASI PRESENSI SISWA (1 KELAS - 10 SISWA)
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Periode: {selectedMonth === 'all' ? 'Seluruh Waktu' : `Bulan ${selectedMonth}`} | Dicetak pada: {new Date().toLocaleDateString('id-ID')}
        </p>
      </div>

      {/* Aggregate Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:px-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-800">
              Tabel Rekap Kehadiran 10 Siswa
            </h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
            Kapasitas: 10 Orang
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-3 text-center w-16">L/P</th>
                <th className="py-3 px-4 text-center text-emerald-700 bg-emerald-50/50">Hadir (H)</th>
                <th className="py-3 px-4 text-center text-sky-700 bg-sky-50/50">Izin (I)</th>
                <th className="py-3 px-4 text-center text-amber-700 bg-amber-50/50">Sakit (S)</th>
                <th className="py-3 px-4 text-center text-rose-700 bg-rose-50/50">Alpa (A)</th>
                <th className="py-3 px-4 text-center">Kehadiran</th>
                <th className="py-3 px-4 text-center">Predikat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentStats.map((item) => {
                let badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                let predicate = 'Sangat Baik';
                if (item.percentage < 70) {
                  badgeColor = 'bg-rose-100 text-rose-800 border-rose-200';
                  predicate = 'Perhatian Khusus';
                } else if (item.percentage < 85) {
                  badgeColor = 'bg-amber-100 text-amber-800 border-amber-200';
                  predicate = 'Cukup';
                }

                return (
                  <tr key={item.student.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                      {item.student.rollNo}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {item.student.name}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                          item.student.gender === 'L'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-pink-100 text-pink-700'
                        }`}
                      >
                        {item.student.gender}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-emerald-700 bg-emerald-50/30">
                      {item.hadir}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-sky-700 bg-sky-50/30">
                      {item.izin}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-amber-700 bg-amber-50/30">
                      {item.sakit}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-rose-700 bg-rose-50/30">
                      {item.alpa}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                      <div className="flex items-center justify-center gap-1.5">
                        <span>{item.percentage}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${badgeColor}`}
                      >
                        {predicate}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Date-by-Date Matrix Preview (Last 7 Days) */}
      {filteredDays.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            Matriks Riwayat Harian (Status Kehadiran)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="p-2 text-left w-36">Nama Siswa</th>
                  {filteredDays.slice(-10).map((d) => (
                    <th key={d.date} className="p-2 min-w-[42px] font-medium text-slate-600">
                      {d.date.substring(5)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => (
                  <tr key={student.id}>
                    <td className="p-2 text-left font-medium text-slate-800 truncate max-w-[140px]">
                      {student.rollNo}. {student.name}
                    </td>
                    {filteredDays.slice(-10).map((d) => {
                      const st = d.records?.[student.id]?.status;
                      let badge = '-';
                      let color = 'text-slate-300';
                      if (st === 'hadir') {
                        badge = 'H';
                        color = 'bg-emerald-100 text-emerald-700 font-bold';
                      } else if (st === 'izin') {
                        badge = 'I';
                        color = 'bg-sky-100 text-sky-700 font-bold';
                      } else if (st === 'sakit') {
                        badge = 'S';
                        color = 'bg-amber-100 text-amber-700 font-bold';
                      } else if (st === 'alpa') {
                        badge = 'A';
                        color = 'bg-rose-100 text-rose-700 font-bold';
                      }

                      return (
                        <td key={d.date} className="p-1">
                          <span className={`inline-block w-6 h-6 rounded flex items-center justify-center mx-auto text-xs ${color}`}>
                            {badge}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
