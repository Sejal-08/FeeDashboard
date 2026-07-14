import React, { useState, useEffect } from 'react';
import { useFeeData } from '../FeeContext';
import { format } from 'date-fns';
import { GraduationCap, Download } from 'lucide-react';
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

  const downloadReportCard = (targetStudentId: string) => {
    const student = students.find(s => s.id === targetStudentId);
    if (!student) return;

    // Get all tests for this batch
    const studentTests = testRecords.filter(t => t.batch === student.batch);
    
    // Build marks for this student
    const studentMarksData = studentTests.map(test => {
      const markRec = markRecords.find(m => m.testId === test.id && m.studentId === targetStudentId);
      return {
        testName: test.testName,
        date: test.date,
        maxMarks: test.maxMarks,
        marksObtained: markRec ? markRec.marksObtained : null
      };
    }).filter(d => d.marksObtained !== null);
    
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.text('Tarun Classes Of Mathematics', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text('Student Report Card', 105, 30, { align: 'center' });
    
    // Student Info
    doc.setFontSize(12);
    doc.text(`Name: ${student.name}`, 14, 45);
    doc.text(`Class/Batch: ${student.batch}`, 14, 52);
    doc.text(`Date Generated: ${format(new Date(), 'dd MMM yyyy')}`, 14, 59);

    if (studentMarksData.length === 0) {
      doc.text("No marks recorded yet.", 14, 75);
    } else {
      const tableColumn = ["Date", "Test Name", "Subject", "Marks Obtained", "Max Marks", "Percentage"];
      const tableRows = studentMarksData.map(m => {
        const percentage = ((m.marksObtained! / m.maxMarks) * 100).toFixed(1) + '%';
        return [
          format(new Date(m.date), 'dd MMM yyyy'),
          m.testName,
          'Mathematics', // Hardcoded subject
          m.marksObtained!.toString(),
          m.maxMarks.toString(),
          percentage
        ];
      });

      autoTable(doc, {
        startY: 65,
        head: [tableColumn],
        body: tableRows,
      });
    }

    doc.save(`${student.name.replace(/\s+/g, '_')}_ReportCard.pdf`);
  };

  const downloadTestReport = () => {
    if (!selectedTestId) return;
    const test = batchTests.find(t => t.id === selectedTestId);
    if (!test) return;

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.text('Tarun Classes Of Mathematics', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text(`Test Report: ${test.testName}`, 105, 30, { align: 'center' });
    
    // Test Info
    doc.setFontSize(12);
    doc.text(`Class/Batch: ${test.batch}`, 14, 45);
    doc.text(`Date: ${format(new Date(test.date), 'dd MMM yyyy')}`, 14, 52);
    doc.text(`Max Marks: ${test.maxMarks}`, 14, 59);

    const testMarks = markRecords.filter(m => m.testId === selectedTestId);
    
    if (filteredStudents.length === 0) {
      doc.text("No students in this batch.", 14, 75);
    } else {
      const tableColumn = ["S.No", "Student Name", "Marks Obtained", "Percentage"];
      const tableRows = filteredStudents.map((student, index) => {
        const markRec = testMarks.find(m => m.studentId === student.id);
        const marksObtained = markRec ? markRec.marksObtained : null;
        const percentage = marksObtained !== null ? ((marksObtained / test.maxMarks) * 100).toFixed(1) + '%' : 'N/A';
        return [
          (index + 1).toString(),
          student.name,
          marksObtained !== null ? marksObtained.toString() : 'Not Entered',
          percentage
        ];
      });

      autoTable(doc, {
        startY: 65,
        head: [tableColumn],
        body: tableRows,
      });
    }

    doc.save(`${test.testName.replace(/\s+/g, '_')}_Report.pdf`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GraduationCap /> Marks & Reports
        </h1>
      </div>

      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
        {batches.map(b => (
          <button 
            key={b}
            onClick={() => setActiveBatchTab(b)}
            className={`btn ${activeBatchTab === b ? 'btn-primary' : ''}`}
            style={{ whiteSpace: 'nowrap' }}
          >
            {b}
          </button>
        ))}
      </div>

      {/* Step 1: New Test */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.85rem' }}>01</span>
          <h3 style={{ margin: 0, color: 'var(--accent-blue)' }}>New test — {activeBatchTab}</h3>
        </div>
        <div style={{ padding: '20px' }}>
          <form onSubmit={handleCreateTest} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input required className="form-control" placeholder="Test name, e.g. Algebra Unit Test" value={newTestName} onChange={e => setNewTestName(e.target.value)} />
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <input required type="date" className="form-control" style={{ flex: 2, minWidth: '150px' }} value={newTestDate} onChange={e => setNewTestDate(e.target.value)} />
              <input required type="number" min="1" className="form-control" placeholder="Max marks" style={{ flex: 1, minWidth: '100px' }} value={newTestMaxMarks} onChange={e => setNewTestMaxMarks(Number(e.target.value))} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>Create test</button>
          </form>
        </div>
      </div>

      {/* Step 2: Existing Tests */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.85rem' }}>02</span>
          <h3 style={{ margin: 0, color: 'var(--accent-blue)' }}>Existing tests</h3>
        </div>
        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {batchTests.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', margin: '12px', textAlign: 'center' }}>No tests created yet.</p>
          ) : (
            batchTests.map(test => (
              <div 
                key={test.id} 
                onClick={() => setSelectedTestId(test.id)}
                style={{ 
                  padding: '16px', 
                  background: selectedTestId === test.id ? '#fef3c7' : 'rgba(255,255,255,0.03)', 
                  color: selectedTestId === test.id ? '#1e293b' : 'inherit',
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: selectedTestId === test.id ? '1px solid #fcd34d' : '1px solid transparent'
                }}
              >
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{test.testName}</div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>{test.date}</div>
                </div>
                <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>/ {test.maxMarks}</div>
              </div>
            ))
          )}
          {!selectedTestId && batchTests.length > 0 && (
            <p style={{ textAlign: 'center', color: 'var(--accent-blue)', fontSize: '0.9rem', marginTop: '8px' }}>
              ↑ Click a test above to enter marks
            </p>
          )}
        </div>
      </div>

      {/* Step 3: Enter Marks */}
      {selectedTest && (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.85rem' }}>03</span>
            <h3 style={{ margin: 0, color: 'var(--accent-blue)' }}>Enter marks — {selectedTest.testName}</h3>
          </div>
          <div className="table-container" style={{ border: 'none' }}>
            <table style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '1px' }}>STUDENT</th>
                  <th style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '1px', textAlign: 'right' }}>MARKS (/{selectedTest.maxMarks})</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr><td colSpan={2} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No students in this class.</td></tr>
                ) : (
                  filteredStudents.map(student => (
                    <tr key={student.id}>
                      <td style={{ fontWeight: 500 }}>{student.name}</td>
                      <td style={{ textAlign: 'right' }}>
                        <input 
                          type="number" 
                          className="form-control" 
                          style={{ width: '80px', display: 'inline-block', textAlign: 'center' }} 
                          min="0"
                          max={selectedTest.maxMarks}
                          value={marksMap[student.id] || ''} 
                          onChange={(e) => handleMarkChange(student.id, e.target.value)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.01)' }}>
            <button className="btn btn-primary" style={{ padding: '12px' }} onClick={handleSaveMarks}>Save marks</button>
            <button 
              className="btn" 
              style={{ padding: '12px', background: '#e2e8f0', color: '#1e293b', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} 
              onClick={downloadTestReport}
            >
              <Download size={18} /> Download Test Report
            </button>
            <button className="btn" style={{ padding: '12px', background: 'transparent', color: 'var(--accent-red)', border: 'none' }} onClick={handleDeleteTest}>Delete this test</button>
          </div>
        </div>
      )}

      {/* Generate Reports Section */}
      <div className="card table-container">
        <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Download size={20} color="var(--accent-blue)"/> Generate Report Cards
        </h3>
        {filteredStudents.length === 0 ? (
           <p style={{ color: 'var(--text-muted)' }}>No students in this class.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student.id}>
                  <td style={{ fontWeight: 500 }}>{student.name}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-primary" style={{ padding: '6px 12px' }} onClick={() => downloadReportCard(student.id)}>
                      <Download size={14} /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};
