/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DailyAttendance } from './components/DailyAttendance';
import { AttendanceSummary } from './components/AttendanceSummary';
import { StudentManager } from './components/StudentManager';
import { VercelDeployGuide } from './components/VercelDeployModal';
import { Student, AttendanceDay } from './types';
import { DEFAULT_STUDENTS } from './data/defaultStudents';
import {
  subscribeToStudents,
  subscribeToDailyAttendance,
  subscribeToAllAttendance,
} from './services/attendanceService';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'daily' | 'summary' | 'students' | 'vercel'>('daily');
  const [students, setStudents] = useState<Student[]>(DEFAULT_STUDENTS);
  
  // Format today as YYYY-MM-DD
  const getTodayStr = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [currentDate, setCurrentDate] = useState<string>(getTodayStr());
  const [dayData, setDayData] = useState<AttendanceDay | null>(null);
  const [allDays, setAllDays] = useState<AttendanceDay[]>([]);
  
  const [isStudentsLoading, setIsStudentsLoading] = useState(true);
  const [isDayLoading, setIsDayLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(new Date());

  // Subscribe to 10 Students in realtime
  useEffect(() => {
    const unsubscribe = subscribeToStudents(
      (updatedStudents) => {
        setStudents(updatedStudents);
        setIsStudentsLoading(false);
        setIsOnline(true);
        setLastSyncTime(new Date());
      },
      (error) => {
        console.error('Error listening to students:', error);
        setIsOnline(false);
        setIsStudentsLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Subscribe to Daily Attendance for current date in realtime
  useEffect(() => {
    setIsDayLoading(true);
    const unsubscribe = subscribeToDailyAttendance(
      currentDate,
      (data) => {
        setDayData(data);
        setIsDayLoading(false);
        setIsOnline(true);
        setLastSyncTime(new Date());
      },
      (error) => {
        console.error('Error listening to daily attendance:', error);
        setIsOnline(false);
        setIsDayLoading(false);
      }
    );
    return () => unsubscribe();
  }, [currentDate]);

  // Subscribe to All Attendance records for summary / reports
  useEffect(() => {
    const unsubscribe = subscribeToAllAttendance(
      (days) => {
        setAllDays(days);
        setIsOnline(true);
      },
      (error) => {
        console.error('Error listening to all attendance:', error);
      }
    );
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans antialiased flex flex-col">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOnline={isOnline}
        lastSyncTime={lastSyncTime}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6">
        {isStudentsLoading && students.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-sm font-medium">Memuat data absensi kelas...</p>
          </div>
        ) : (
          <>
            {activeTab === 'daily' && (
              <DailyAttendance
                students={students}
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                dayData={dayData}
                isLoading={isDayLoading}
              />
            )}

            {activeTab === 'summary' && (
              <AttendanceSummary
                students={students}
                allDays={allDays}
              />
            )}

            {activeTab === 'students' && (
              <StudentManager students={students} />
            )}

            {activeTab === 'vercel' && (
              <VercelDeployGuide />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Aplikasi Absensi 1 Kelas (10 Siswa) &bull; Sinkronisasi Realtime Firebase</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('vercel')}
              className="text-emerald-700 hover:underline font-semibold"
            >
              Lihat Skema vercel.json
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
