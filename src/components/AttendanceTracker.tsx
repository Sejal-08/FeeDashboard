import React, { useState } from 'react';
import { useFeeData } from '../FeeContext';
import { format, subDays, addDays } from 'date-fns';
import { ClipboardCheck, Check, X, FileMinus, Download } from 'lucide-react';
import { AttendanceStatus } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const AttendanceTracker: React.FC = () => {
  const { students, attendanceRecords, addAttendanceRecord } = useFeeData();
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const [activeBatchTab, setActiveBatchTab] = useState<string>('Class 10');
  const batches = ['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
  const filteredStudents = students.filter(s => s.batch === activeBatchTab);

  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  const handleAttendance = (studentId: string, status: AttendanceStatus) => {
    addAttendanceRecord({
      studentId,
      date: dateStr,
      status
    });
  };

  const getStatus = (studentId: string) => {
    const record = attendanceRecords.find(r => r.studentId === studentId && r.date === dateStr);
    return record?.status;
  };

  const downloadAbsentRecord = () => {
    const absentRecords = filteredStudents.filter(s => getStatus(s.id) === 'absent');
    
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Tarun Classes Of Mathematics', 14, 22);
    
    doc.setFontSize(14);
    doc.text(`Absent Record - ${activeBatchTab}`, 14, 32);
    
    doc.setFontSize(11);
    doc.text(`Date: ${format(selectedDate, 'dd MMM yyyy')}`, 14, 40);

    const tableColumn = ["Student Name", "Status"];
    const tableRows = absentRecords.map(student => [student.name, "Absent"]);

    if (tableRows.length === 0) {
      doc.text("No students are absent today.", 14, 50);
    } else {
      autoTable(doc, {
        startY: 45,
        head: [tableColumn],
        body: tableRows,
      });
    }

    doc.save(`Absent_Record_${activeBatchTab}_${dateStr}.pdf`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ClipboardCheck /> Daily Attendance
        </h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn" onClick={() => setSelectedDate(subDays(selectedDate, 1))}>&larr; Prev Day</button>
          <div style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontWeight: 600 }}>
            {format(selectedDate, 'dd MMM yyyy')}
          </div>
          <button className="btn" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>Next Day &rarr;</button>
        </div>
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

      <div className="card table-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Mark Attendance</h3>
          <button className="btn btn-primary" onClick={downloadAbsentRecord} style={{ background: 'var(--accent-red)', borderColor: 'var(--accent-red)' }}>
            <Download size={16} /> Download Absent PDF
          </button>
        </div>

        {filteredStudents.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No students found in {activeBatchTab}.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => {
                const status = getStatus(student.id);
                return (
                  <tr key={student.id}>
                    <td style={{ fontWeight: 500 }}>{student.name}</td>
                    <td>
                      {status === 'present' && <span className="badge badge-paid"><Check size={12}/> Present</span>}
                      {status === 'absent' && <span className="badge badge-overdue"><X size={12}/> Absent</span>}
                      {status === 'leave' && <span className="badge badge-pending"><FileMinus size={12}/> Leave</span>}
                      {!status && <span style={{ color: 'var(--text-muted)' }}>Not Marked</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className={`btn ${status === 'present' ? 'btn-success' : ''}`}
                          style={{ padding: '6px 12px' }}
                          onClick={() => handleAttendance(student.id, 'present')}
                        >
                          Present
                        </button>
                        <button 
                          className="btn"
                          style={{ padding: '6px 12px', background: status === 'absent' ? 'var(--accent-red)' : 'transparent', color: status === 'absent' ? '#fff' : 'inherit' }}
                          onClick={() => handleAttendance(student.id, 'absent')}
                        >
                          Absent
                        </button>
                        <button 
                          className="btn"
                          style={{ padding: '6px 12px', background: status === 'leave' ? 'var(--accent-amber)' : 'transparent', color: status === 'leave' ? '#fff' : 'inherit' }}
                          onClick={() => handleAttendance(student.id, 'leave')}
                        >
                          Leave
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
