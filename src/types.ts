export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  batch: string;
  contact: string;
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

export interface AppState {
  students: Student[];
  feeRecords: FeeRecord[];
}
