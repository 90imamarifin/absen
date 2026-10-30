import React, { useState } from 'react';
import { Users, Edit3, Check, RotateCcw, ShieldCheck } from 'lucide-react';
import { Student } from '../types';
import { updateStudent, resetToDefaultStudents } from '../services/attendanceService';

interface StudentManagerProps {
  students: Student[];
}

export const StudentManager: React.FC<StudentManagerProps> = ({ students }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editGender, setEditGender] = useState<'L' | 'P'>('L');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  const startEdit = (student: Student) => {
    setEditingId(student.id);
    setEditName(student.name);
    setEditGender(student.gender);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const saveEdit = async (id: string) => {
    if (!editName.trim()) return;
    setIsSaving(true);
    try {
      await updateStudent(id, {
        name: editName.trim(),
        gender: editGender,
      });
      setMessage('Data siswa berhasil diperbarui!');
      setTimeout(() => setMessage(null), 3000);
      setEditingId(null);
    } catch {
      alert('Gagal memperbarui data siswa');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    if (
      window.confirm(
        'Kembalikan daftar nama ke 10 siswa default (Aditiya, Budi, Cantika, dst)?'
      )
    ) {
      setIsSaving(true);
      try {
        await resetToDefaultStudents();
        setMessage('Daftar siswa dikembalikan ke default!');
        setTimeout(() => setMessage(null), 3000);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-800">
              Kelola 10 Siswa Kelas
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Anda dapat menyesuaikan nama dan jenis kelamin 10 siswa sesuai dengan daftar absensi kelas Anda.
          </p>
        </div>

        <button
          onClick={handleResetDefaults}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Nama Default</span>
        </button>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          {message}
        </div>
      )}

      {/* Students List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {students.map((student) => {
            const isEditing = editingId === student.id;

            return (
              <div
                key={student.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
              >
                {/* Number & Info */}
                <div className="flex items-center gap-3.5 flex-1">
                  <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-sm flex items-center justify-center shrink-0 border border-emerald-200">
                    {student.rollNo}
                  </span>

                  {isEditing ? (
                    <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Nama Siswa"
                        className="text-sm font-semibold px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-64"
                      />
                      <select
                        value={editGender}
                        onChange={(e) => setEditGender(e.target.value as 'L' | 'P')}
                        className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="L">Laki-Laki (L)</option>
                        <option value="P">Perempuan (P)</option>
                      </select>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-sm">
                          {student.name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            student.gender === 'L'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-pink-100 text-pink-700'
                          }`}
                        >
                          {student.gender === 'L' ? 'Laki-Laki' : 'Perempuan'}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        Nomor Absen: {student.rollNo}
                      </span>
                    </div>
                  )}
                </div>

                {/* Edit Controls */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => saveEdit(student.id)}
                        disabled={isSaving}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Simpan</span>
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-2.5 py-1.5 text-slate-500 hover:text-slate-800 text-xs font-medium"
                      >
                        Batal
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => startEdit(student)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-medium transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Ubah</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
