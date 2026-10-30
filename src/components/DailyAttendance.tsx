import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Check,
  RotateCcw,
  UserCheck,
  AlertCircle,
  Clock,
  MessageSquare,
} from 'lucide-react';
import { Student, AttendanceDay, AttendanceStatus } from '../types';
import {
  setStudentStatus,
  setAllStudentsHadir,
  resetDailyAttendance,
} from '../services/attendanceService';

interface DailyAttendanceProps {
  students: Student[];
  currentDate: string;
  setCurrentDate: (date: string) => void;
  dayData: AttendanceDay | null;
  isLoading: boolean;
}

export const DailyAttendance: React.FC<DailyAttendanceProps> = ({
  students,
  currentDate,
  setCurrentDate,
  dayData,
  isLoading,
}) => {
  const [activeNoteStudentId, setActiveNoteStudentId] = useState<string | null>(null);
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
  const [isUpdatingAll, setIsUpdatingAll] = useState(false);

  // Navigate date by offset in days
  const changeDateByDays = (offset: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + offset);
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  const setToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setCurrentDate(today);
  };

  // Format date to Indonesian text
  const formatIndonesianDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(dateObj);
    } catch {
      return dateStr;
    }
  };

  // Stats calculation
  const records = dayData?.records || {};
  let hadirCount = 0;
  let izinCount = 0;
  let sakitCount = 0;
  let alpaCount = 0;

  students.forEach((s) => {
    const status = records[s.id]?.status;
    if (status === 'hadir') hadirCount++;
    else if (status === 'izin') izinCount++;
    else if (status === 'sakit') sakitCount++;
    else if (status === 'alpa') alpaCount++;
  });

  const filledCount = hadirCount + izinCount + sakitCount + alpaCount;
  const unrecordedCount = students.length - filledCount;
  const attendanceRate = students.length > 0 ? Math.round((hadirCount / students.length) * 100) : 0;

  const handleStatusChange = async (studentId: string, status: AttendanceStatus) => {
    const existingNote = noteInputs[studentId] ?? dayData?.notes?.[studentId] ?? '';
    await setStudentStatus(currentDate, studentId, status, existingNote);
  };

  const handleNoteSave = async (studentId: string) => {
    const currentStatus = records[studentId]?.status || 'hadir';
    const noteText = noteInputs[studentId] ?? dayData?.notes?.[studentId] ?? '';
    await setStudentStatus(currentDate, studentId, currentStatus, noteText);
    setActiveNoteStudentId(null);
  };

  const handleSetAllHadir = async () => {
    if (students.length === 0) return;
    setIsUpdatingAll(true);
    try {
      await setAllStudentsHadir(currentDate, students);
    } finally {
      setIsUpdatingAll(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm(`Yakin ingin mereset data absensi tanggal ${formatIndonesianDate(currentDate)}?`)) {
      await resetDailyAttendance(currentDate);
    }
  };

  return (
    <div className="space-y-5">
      {/* Date Navigation & Quick Actions Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Date Picker Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => changeDateByDays(-1)}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
              title="Hari Sebelumnya"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <input
                type="date"
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
                className="bg-transparent text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer"
              />
            </div>

            <button
              onClick={() => changeDateByDays(1)}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
              title="Hari Berikutnya"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              onClick={setToday}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              Hari Ini
            </button>
          </div>

          {/* Quick Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSetAllHadir}
              disabled={isUpdatingAll || isLoading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-all shadow-xs disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>Semua Hadir (10)</span>
            </button>

            <button
              onClick={handleReset}
              disabled={isLoading || filledCount === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-sm font-medium transition-colors disabled:opacity-40"
              title="Kosongkan absensi hari ini"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Selected Date Header */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-bold text-slate-800">
              {formatIndonesianDate(currentDate)}
            </span>
            {currentDate === new Date().toISOString().split('T')[0] && (
              <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Hari Ini
              </span>
            )}
          </div>
          {dayData?.updatedAt && (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Sinkron: {new Date(dayData.updatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Total Siswa</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-slate-800">{students.length}</span>
            <span className="text-xs text-slate-400">orang</span>
          </div>
        </div>

        <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-emerald-700">Hadir (H)</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-emerald-700">{hadirCount}</span>
            <span className="text-xs font-medium text-emerald-600">{attendanceRate}%</span>
          </div>
        </div>

        <div className="bg-sky-50/70 p-3.5 rounded-xl border border-sky-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-sky-700">Izin (I)</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-sky-700">{izinCount}</span>
            <span className="text-xs text-sky-600">siswa</span>
          </div>
        </div>

        <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-amber-700">Sakit (S)</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-amber-700">{sakitCount}</span>
            <span className="text-xs text-amber-600">siswa</span>
          </div>
        </div>

        <div className="bg-rose-50/70 p-3.5 rounded-xl border border-rose-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-rose-700">Alpa (A)</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-rose-700">{alpaCount}</span>
            <span className="text-xs text-rose-600">siswa</span>
          </div>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Belum Absen</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`text-2xl font-bold ${unrecordedCount > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
              {unrecordedCount}
            </span>
            <span className="text-xs text-slate-400">siswa</span>
          </div>
        </div>
      </div>

      {/* 10 Students Attendance List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:px-6 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            Daftar Absensi 10 Siswa
          </h2>
          <span className="text-xs text-slate-500">
            {filledCount} dari {students.length} terisi
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {students.map((student) => {
            const studentRecord = records[student.id];
            const currentStatus = studentRecord?.status;
            const currentNote = noteInputs[student.id] ?? dayData?.notes?.[student.id] ?? '';
            const isNoteOpen = activeNoteStudentId === student.id;

            return (
              <div
                key={student.id}
                className={`p-3.5 sm:p-4 transition-colors ${
                  currentStatus ? 'bg-white' : 'bg-slate-50/30'
                } hover:bg-slate-50/80`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Student Info */}
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200">
                      {student.rollNo}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-sm">
                          {student.name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            student.gender === 'L'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-pink-100 text-pink-700'
                          }`}
                        >
                          {student.gender}
                        </span>
                      </div>
                      {currentNote && (
                        <p className="text-xs text-slate-500 italic mt-0.5 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-slate-400" />
                          {currentNote}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 4 Attendance Status Buttons */}
                  <div className="flex items-center gap-1.5 sm:gap-2 self-end sm:self-auto flex-wrap">
                    {/* Hadir Button */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange(student.id, 'hadir')}
                      className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                        currentStatus === 'hadir'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm scale-105'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50/50'
                      }`}
                    >
                      Hadir (H)
                    </button>

                    {/* Izin Button */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange(student.id, 'izin')}
                      className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                        currentStatus === 'izin'
                          ? 'bg-sky-600 text-white border-sky-600 shadow-sm scale-105'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300 hover:text-sky-700 hover:bg-sky-50/50'
                      }`}
                    >
                      Izin (I)
                    </button>

                    {/* Sakit Button */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange(student.id, 'sakit')}
                      className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                        currentStatus === 'sakit'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-sm scale-105'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50/50'
                      }`}
                    >
                      Sakit (S)
                    </button>

                    {/* Alpa Button */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange(student.id, 'alpa')}
                      className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                        currentStatus === 'alpa'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm scale-105'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-rose-300 hover:text-rose-700 hover:bg-rose-50/50'
                      }`}
                    >
                      Alpa (A)
                    </button>

                    {/* Note Toggle */}
                    <button
                      type="button"
                      onClick={() =>
                        setActiveNoteStudentId(isNoteOpen ? null : student.id)
                      }
                      className={`p-1.5 rounded-lg border text-xs transition-colors ${
                        currentNote
                          ? 'border-emerald-300 text-emerald-600 bg-emerald-50'
                          : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                      }`}
                      title={currentNote ? 'Edit catatan' : 'Tambah catatan keterangan'}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Inline Note Box */}
                {isNoteOpen && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={`Catatan untuk ${student.name} (misal: Sakit flu / Izin lomba)`}
                      value={noteInputs[student.id] ?? dayData?.notes?.[student.id] ?? ''}
                      onChange={(e) =>
                        setNoteInputs({ ...noteInputs, [student.id]: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleNoteSave(student.id);
                      }}
                      className="flex-1 text-xs sm:text-sm px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      onClick={() => handleNoteSave(student.id)}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                    >
                      Simpan
                    </button>
                    <button
                      onClick={() => setActiveNoteStudentId(null)}
                      className="px-2 py-1.5 text-slate-500 text-xs hover:text-slate-800"
                    >
                      Tutup
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
