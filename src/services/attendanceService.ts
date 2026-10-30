import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Student, AttendanceDay, AttendanceStatus, StudentAttendance } from '../types';
import { DEFAULT_STUDENTS } from '../data/defaultStudents';

const STUDENTS_COL = 'students';
const ATTENDANCE_COL = 'attendance_days';

/**
 * Initialize 10 students if collection is empty
 */
export async function ensureDefaultStudentsExist(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, STUDENTS_COL));
    if (snap.empty) {
      console.log('Inisialisasi 10 siswa default...');
      for (const student of DEFAULT_STUDENTS) {
        await setDoc(doc(db, STUDENTS_COL, student.id), {
          rollNo: student.rollNo,
          name: student.name,
          gender: student.gender,
          active: true,
          updatedAt: new Date().toISOString(),
        });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, STUDENTS_COL);
  }
}

/**
 * Listen to real-time changes in students list
 */
export function subscribeToStudents(
  onUpdate: (students: Student[]) => void,
  onError?: (err: Error) => void
) {
  return onSnapshot(
    collection(db, STUDENTS_COL),
    (snapshot) => {
      if (snapshot.empty) {
        // Return default students while seeding
        onUpdate(DEFAULT_STUDENTS);
        ensureDefaultStudentsExist();
        return;
      }
      const list: Student[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        list.push({
          id: d.id,
          rollNo: Number(data.rollNo) || 1,
          name: data.name || 'Tanpa Nama',
          gender: data.gender === 'P' ? 'P' : 'L',
          active: data.active !== false,
          updatedAt: data.updatedAt,
        });
      });
      list.sort((a, b) => a.rollNo - b.rollNo);
      onUpdate(list);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, STUDENTS_COL);
    }
  );
}

/**
 * Update single student info
 */
export async function updateStudent(id: string, updates: Partial<Student>): Promise<void> {
  try {
    const studentDoc = doc(db, STUDENTS_COL, id);
    await setDoc(
      studentDoc,
      {
        ...updates,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${STUDENTS_COL}/${id}`);
  }
}

/**
 * Reset students list back to 10 default names
 */
export async function resetToDefaultStudents(): Promise<void> {
  try {
    for (const student of DEFAULT_STUDENTS) {
      await setDoc(doc(db, STUDENTS_COL, student.id), {
        rollNo: student.rollNo,
        name: student.name,
        gender: student.gender,
        active: true,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, STUDENTS_COL);
  }
}

/**
 * Subscribe in real-time to attendance record of a given date (YYYY-MM-DD)
 */
export function subscribeToDailyAttendance(
  dateStr: string,
  onUpdate: (dayData: AttendanceDay | null) => void,
  onError?: (err: Error) => void
) {
  const docRef = doc(db, ATTENDANCE_COL, dateStr);
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        onUpdate({
          date: dateStr,
          records: data.records || {},
          notes: data.notes || {},
          updatedAt: data.updatedAt,
        });
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, `${ATTENDANCE_COL}/${dateStr}`);
    }
  );
}

/**
 * Save / Update attendance for single student on a date
 */
export async function setStudentStatus(
  dateStr: string,
  studentId: string,
  status: AttendanceStatus,
  note?: string
): Promise<void> {
  try {
    const docRef = doc(db, ATTENDANCE_COL, dateStr);
    const now = new Date().toISOString();
    
    // We update using merge
    await setDoc(
      docRef,
      {
        date: dateStr,
        records: {
          [studentId]: {
            status,
            updatedAt: now,
          },
        },
        ...(note !== undefined
          ? {
              notes: {
                [studentId]: note,
              },
            }
          : {}),
        updatedAt: now,
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${ATTENDANCE_COL}/${dateStr}`);
  }
}

/**
 * Quick Action: Set all students to Hadir for a date
 */
export async function setAllStudentsHadir(dateStr: string, students: Student[]): Promise<void> {
  try {
    const docRef = doc(db, ATTENDANCE_COL, dateStr);
    const now = new Date().toISOString();
    const newRecords: Record<string, StudentAttendance> = {};

    students.forEach((s) => {
      newRecords[s.id] = {
        status: 'hadir',
        updatedAt: now,
      };
    });

    await setDoc(
      docRef,
      {
        date: dateStr,
        records: newRecords,
        updatedAt: now,
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${ATTENDANCE_COL}/${dateStr}`);
  }
}

/**
 * Reset all attendance for a date
 */
export async function resetDailyAttendance(dateStr: string): Promise<void> {
  try {
    const docRef = doc(db, ATTENDANCE_COL, dateStr);
    const now = new Date().toISOString();
    await setDoc(docRef, {
      date: dateStr,
      records: {},
      notes: {},
      updatedAt: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${ATTENDANCE_COL}/${dateStr}`);
  }
}

/**
 * Subscribe to all attendance records (for monthly / total summary & reports)
 */
export function subscribeToAllAttendance(
  onUpdate: (days: AttendanceDay[]) => void,
  onError?: (err: Error) => void
) {
  return onSnapshot(
    collection(db, ATTENDANCE_COL),
    (snapshot) => {
      const days: AttendanceDay[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        days.push({
          date: d.id,
          records: data.records || {},
          notes: data.notes || {},
          updatedAt: data.updatedAt,
        });
      });
      days.sort((a, b) => a.date.localeCompare(b.date));
      onUpdate(days);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, ATTENDANCE_COL);
    }
  );
}
