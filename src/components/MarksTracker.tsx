import React, { useState } from 'react';
import { useFeeData } from '../FeeContext';
import { format } from 'date-fns';
import { GraduationCap, Download, Plus, Trash2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const MarksTracker: React.FC = () => {
  const { students, markRecords, addMarkRecord, deleteMarkRecord } = useFeeData();
  
  const [activeBatchTab, setActiveBatchTab] = useState<string>('Class 10');
  const batches = ['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
  const filteredStudents = students.filter(s => s.batch === activeBatchTab);

  const [showModal, setShowModal] = useState(false);
  
  // Form state
  const [studentId, setStudentId] = useState('');
  const [testName, setTestName] = useState('');
  const [marksObtained, setMarksObtained] = useState(0);
  const [maxMarks, setMaxMarks] = useState(100);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMarkRecord({
      studentId, testName, subject: 'Mathematics', marksObtained, maxMarks, date
    });
    setShowModal(false);
    // Reset form mostly, keep date and testName to make multiple entries easier
    setStudentId('');
    setMarksObtained(0);
  };

  const openAddModal = () => {
    if (filteredStudents.length > 0) {
      setStudentId(filteredStudents[0].id);
    }
    setShowModal(true);
  };

  const downloadReportCard = (targetStudentId: string) => {
    const student = students.find(s => s.id === targetStudentId);
    if (!student) return;

    const studentMarks = markRecords.filter(m => m.studentId === targetStudentId);
    
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

    if (studentMarks.length === 0) {
      doc.text("No marks recorded yet.", 14, 75);
    } else {
      const tableColumn = ["Date", "Test Name", "Subject", "Marks Obtained", "Max Marks", "Percentage"];
      const tableRows = studentMarks.map(m => {
        const percentage = ((m.marksObtained / m.maxMarks) * 100).toFixed(1) + '%';
        return [
          format(new Date(m.date), 'dd MMM yyyy'),
          m.testName,
          m.subject,
          m.marksObtained.toString(),
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

  // Filter marks for the current active batch
  const batchStudentIds = new Set(filteredStudents.map(s => s.id));
  const currentBatchMarks = markRecords
    .filter(m => batchStudentIds.has(m.studentId))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GraduationCap /> Marks & Reports
        </h1>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} /> Add Marks
        </button>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div className="card table-container">
          <h3 style={{ marginTop: 0 }}>Recent Marks Entry ({activeBatchTab})</h3>
          {currentBatchMarks.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No marks recorded for this class yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Test</th>
                  <th>Subject</th>
                  <th>Score</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentBatchMarks.slice(0, 10).map(mark => {
                  const student = students.find(s => s.id === mark.studentId);
                  return (
                    <tr key={mark.id}>
                      <td style={{ fontWeight: 500 }}>{student?.name}</td>
                      <td>{mark.testName}</td>
                      <td>{mark.subject}</td>
                      <td style={{ fontWeight: 600, color: 'var(--accent-green)' }}>{mark.marksObtained}/{mark.maxMarks}</td>
                      <td>
                        <button className="btn" style={{ padding: '4px', color: 'var(--accent-red)' }} onClick={() => {
                          if (confirm('Delete this record?')) deleteMarkRecord(mark.id);
                        }}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="card table-container">
          <h3 style={{ marginTop: 0 }}>Generate Report Cards</h3>
          {filteredStudents.length === 0 ? (
             <p style={{ color: 'var(--text-muted)' }}>No students in this class.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => (
                  <tr key={student.id}>
                    <td style={{ fontWeight: 500 }}>{student.name}</td>
                    <td>
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

      {showModal && (
        <div className="modal-overlay" onClick={(e) => { if(e.target === e.currentTarget) setShowModal(false)}}>
          <div className="modal-content">
            <h2 style={{ marginTop: 0, marginBottom: '24px' }}>Add Test Marks</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Student</label>
                <select required className="form-control" value={studentId} onChange={e => setStudentId(e.target.value)}>
                  {filteredStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Test Name</label>
                <input required className="form-control" placeholder="e.g. Term 1" value={testName} onChange={e => setTestName(e.target.value)} />
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Marks Obtained</label>
                  <input required type="number" min="0" step="0.5" className="form-control" value={marksObtained} onChange={e => setMarksObtained(Number(e.target.value))} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Max Marks</label>
                  <input required type="number" min="1" className="form-control" value={maxMarks} onChange={e => setMaxMarks(Number(e.target.value))} />
                </div>
              </div>
              <div className="form-group">
                <label>Date of Test</label>
                <input required type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Marks</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
