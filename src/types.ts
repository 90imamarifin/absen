export type AttendanceStatus = 'hadir' | 'izin' | 'sakit' | 'alpa';

export interface Student {
  id: string;
  rollNo: number;
  name: string;
  gender: 'L' | 'P';
  active?: boolean;
  updatedAt?: string;
}

export interface StudentAttendance {
  status: AttendanceStatus;
  note?: string;
  updatedAt?: string;
}

export interface AttendanceDay {
  date: string; // YYYY-MM-DD
  records: Record<string, StudentAttendance>;
  notes?: Record<string, string>;
  updatedAt?: string;
}

export interface StudentStats {
  student: Student;
  hadir: number;
  izin: number;
  sakit: number;
  alpa: number;
  totalDays: number;
  percentage: number;
}
