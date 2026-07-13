export type BatchType = 'Class 8' | 'Class 9' | 'Class 10' | 'Class 11' | 'Class 12';

export interface Student {
  id: string;
  name: string;
  batch: BatchType | string;
  monthlyFee: number;
}

export type FeeStatus = 'paid' | 'pending' | 'overdue';
export type PaymentMethod = 'cash' | 'online' | 'cheque';

export interface FeeRecord {
  id: string;
  studentId: string;
  month: string; // e.g., '2026-01'
  amount: number;
  status: FeeStatus;
  datePaid?: string; // ISO date string
  paymentMethod?: PaymentMethod;
  remarks?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'leave';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  status: AttendanceStatus;
}

export interface MarkRecord {
  id: string;
  studentId: string;
  testName: string;
  subject: string;
  marksObtained: number;
  maxMarks: number;
  date: string; // ISO date string
}

export interface AppState {
  students: Student[];
  feeRecords: FeeRecord[];
  attendanceRecords: AttendanceRecord[];
  markRecords: MarkRecord[];
}
