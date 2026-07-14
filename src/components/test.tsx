import React, { useState, useEffect } from 'react';
import { useFeeData } from '../FeeContext';
import { format } from 'date-fns';
import { GraduationCap, Download, Plus, List, Edit } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const MarksTracker: React.FC = () => {
  const { students, testRecords, markRecords, addTestRecord, deleteTestRecord, saveBulkMarks } = useFeeData();
  
  const [activeBatchTab, setActiveBatchTab] = useState<string>('Class 10');
  const batches = ['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
  const filteredStudents = students.filter(s => s.batch === activeBatchTab);

  const batchTests = testRecords.filter(t => t.batch === activeBatchTab).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Step 1: New test state
  const [newTestName, setNewTestName] = useState('');
  const [newTestDate, setNewTestDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newTestMaxMarks, setNewTestMaxMarks] = useState(100);

  // Step 2 & 3: Selected test and marks state
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [marksMap, setMarksMap] = useState<Record<string, string>>({});

  const selectedTest = batchTests.find(t => t.id === selectedTestId);

  // Initialize marks map when a test is selected
  useEffect(() => {
    if (selectedTestId) {
      const existingMarks = markRecords.filter(m => m.testId === selectedTestId);
      const newMap: Record<string, string> = {};
      existingMarks.forEach(m => {
        newMap[m.studentId] = m.marksObtained.toString();
      });
      setMarksMap(newMap);
    } else {
      setMarksMap({});
    }
  }, [selectedTestId, markRecords]);

  // If batch changes, deselect test
  useEffect(() => {
    setSelectedTestId(null);
  }, [activeBatchTab]);

  const handleCreateTest = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = addTestRecord({
      batch: activeBatchTab,
      testName: newTestName,
      date: newTestDate,
      maxMarks: newTestMaxMarks
    });
    setNewTestName('');
    setSelectedTestId(newId);
  };

  const handleSaveMarks = () => {
    if (!selectedTestId) return;
    const marksArray = Object.entries(marksMap)
      .filter(([_, value]) => value !== '')
      .map(([studentId, value]) => ({
        studentId,
        marksObtained: Number(value)
      }));
    saveBulkMarks(selectedTestId, marksArray);
    alert('Marks saved successfully!');
  };

  const handleDeleteTest = () => {
    if (!selectedTestId) return;
    if (confirm('Are you sure you want to delete this test and all its marks?')) {
      deleteTestRecord(selectedTestId);
      setSelectedTestId(null);
    }
  };

  const handleMarkChange = (studentId: string, value: string) => {
    setMarksMap(prev => ({
      ...prev,
      [studentId]: value
    }));
  };

  const downloadReportCard = (targetStudentId: string) => { ... };
  // I need to properly include the downloadReportCard and downloadTestReport functions!
  // It's better if I just use multi_replace to not wipe out the long PDF logic.
