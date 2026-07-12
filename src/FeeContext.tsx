import React, { createContext, useContext, useState, useEffect } from 'react';
import { Student, FeeRecord, AppState } from './types';

interface FeeContextType extends AppState {
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;
  addFeeRecord: (record: Omit<FeeRecord, 'id'>) => void;
  updateFeeRecord: (record: FeeRecord) => void;
  deleteFeeRecord: (id: string) => void;
  exportData: () => void;
  importData: (data: string) => void;
}

const FeeContext = createContext<FeeContextType | undefined>(undefined);

const STORAGE_KEY = 'fee-dashboard-data';

const getInitialState = (): AppState => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      const validBatches = ['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
      
      // Filter out legacy students from before the batch dropdown was added
      const validStudents = (parsed.students || []).filter((s: Student) => validBatches.includes(s.batch));
      const validStudentIds = new Set(validStudents.map((s: Student) => s.id));
      
      // Filter out fee records belonging to legacy students
      const validFeeRecords = (parsed.feeRecords || []).filter((r: FeeRecord) => validStudentIds.has(r.studentId));
      
      return { students: validStudents, feeRecords: validFeeRecords };
    } catch (e) {
      console.error('Failed to parse local storage data', e);
    }
  }
  return { students: [], feeRecords: [] };
};

export const FeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(getInitialState);

  // Save to local storage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addStudent = (student: Omit<Student, 'id'>) => {
    const newStudent = { ...student, id: crypto.randomUUID() };
    setState(prev => ({ ...prev, students: [...prev.students, newStudent] }));
  };

  const updateStudent = (updatedStudent: Student) => {
    setState(prev => ({
      ...prev,
      students: prev.students.map(s => s.id === updatedStudent.id ? updatedStudent : s)
    }));
  };

  const deleteStudent = (id: string) => {
    setState(prev => ({
      ...prev,
      students: prev.students.filter(s => s.id !== id),
      // Also delete associated fee records
      feeRecords: prev.feeRecords.filter(r => r.studentId !== id)
    }));
  };

  const addFeeRecord = (record: Omit<FeeRecord, 'id'>) => {
    const newRecord = { ...record, id: crypto.randomUUID() };
    setState(prev => ({
      ...prev,
      // Remove any existing record for this student and month before adding new one
      feeRecords: [...prev.feeRecords.filter(r => !(r.studentId === record.studentId && r.month === record.month)), newRecord]
    }));
  };

  const updateFeeRecord = (updatedRecord: FeeRecord) => {
    setState(prev => ({
      ...prev,
      feeRecords: prev.feeRecords.map(r => r.id === updatedRecord.id ? updatedRecord : r)
    }));
  };

  const deleteFeeRecord = (id: string) => {
    setState(prev => ({
      ...prev,
      feeRecords: prev.feeRecords.filter(r => r.id !== id)
    }));
  };

  const exportData = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fee_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importData = (dataStr: string) => {
    try {
      const parsed = JSON.parse(dataStr);
      if (parsed && Array.isArray(parsed.students) && Array.isArray(parsed.feeRecords)) {
        setState(parsed);
        alert('Data imported successfully!');
      } else {
        alert('Invalid backup file format.');
      }
    } catch (e) {
      alert('Error reading backup file.');
    }
  };

  return (
    <FeeContext.Provider value={{
      ...state,
      addStudent, updateStudent, deleteStudent,
      addFeeRecord, updateFeeRecord, deleteFeeRecord,
      exportData, importData
    }}>
      {children}
    </FeeContext.Provider>
  );
};

export const useFeeData = () => {
  const context = useContext(FeeContext);
  if (context === undefined) {
    throw new Error('useFeeData must be used within a FeeProvider');
  }
  return context;
};
