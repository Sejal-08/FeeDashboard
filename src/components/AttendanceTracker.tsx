import React, { useState } from 'react';
import { useFeeData } from '../FeeContext';
import { format, subDays, addDays } from 'date-fns';
import { Calendar, X } from 'lucide-react';
import { AttendanceStatus } from '../types';

export const AttendanceTracker: React.FC = () => {
  const { students, attendanceRecords, addAttendanceRecord } = useFeeData();
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const [activeBatchTab, setActiveBatchTab] = useState<string>('Class 8');
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

  const presentCount = filteredStudents.filter(s => getStatus(s.id) === 'present').length;
  const absentCount = filteredStudents.filter(s => getStatus(s.id) === 'absent').length;
  const totalCount = filteredStudents.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Batch selector */}
      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
        {batches.map((b, idx) => {
          const isActive = activeBatchTab === b;
          const numMatch = b.match(/\d+/);
          const num = numMatch ? numMatch[0] : (idx + 1);
          return (
            <button 
              key={b}
              onClick={() => setActiveBatchTab(b)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '6px 16px 6px 6px', borderRadius: '99px',
                background: isActive ? 'var(--accent-blue)' : '#ffffff',
                color: isActive ? '#ffffff' : 'var(--text-main)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem',
                transition: 'all 0.2s', whiteSpace: 'nowrap'
              }}
            >
              <div style={{
                background: isActive ? 'var(--accent-gold)' : '#f1f5f9',
                color: isActive ? 'var(--bg-dark)' : 'var(--text-main)',
                width: '32px', height: '32px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.9rem'
              }}>
                {num}
              </div>
              {b} {isActive ? 'batch' : ''}
            </button>
          )
        })}
      </div>

      {/* Main card */}
      <div className="card" style={{ padding: '32px' }}>
        <div className="section-header">
          <span className="section-badge">02</span>
          <h3 className="section-title">Mark attendance</h3>
        </div>

        {/* Date picker mock */}
        <div style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          border: '1px solid var(--border-color)', borderRadius: '8px',
          padding: '12px 16px', marginBottom: '24px'
        }}>
          <span style={{ fontSize: '1rem', color: 'var(--text-main)' }}>
             {format(selectedDate, 'MM/dd/yyyy')}
          </span>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setSelectedDate(subDays(selectedDate, 1))}>&larr;</button>
            <Calendar size={20} color="var(--text-main)" />
            <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setSelectedDate(addDays(selectedDate, 1))}>&rarr;</button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
          <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-green)', fontFamily: 'Georgia, serif' }}>{presentCount}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', marginTop: '4px' }}>PRESENT</div>
          </div>
          <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-red)', fontFamily: 'Georgia, serif' }}>{absentCount}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', marginTop: '4px' }}>ABSENT</div>
          </div>
          <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-main)', fontFamily: 'Georgia, serif' }}>{totalCount}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', marginTop: '4px' }}>TOTAL</div>
          </div>
        </div>

        {/* Student list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          {filteredStudents.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No students found in {activeBatchTab}.</p>
          ) : (
            filteredStudents.map((student, idx) => {
              const status = getStatus(student.id);
              return (
                <div key={student.id} style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  paddingBottom: '16px', borderBottom: '1px solid var(--border-color)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, width: '20px' }}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span style={{ fontSize: '1rem', fontWeight: 500 }}>{student.name}</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
                      <button 
                        onClick={() => handleAttendance(student.id, 'present')}
                        style={{ 
                          padding: '8px 16px', border: 'none', cursor: 'pointer',
                          background: status === 'present' ? '#f0fdf4' : 'transparent',
                          color: status === 'present' ? 'var(--accent-green)' : 'var(--text-muted)',
                          fontWeight: status === 'present' ? 600 : 400,
                          borderRight: '1px solid var(--border-color)'
                        }}
                      >
                        Present
                      </button>
                      <button 
                        onClick={() => handleAttendance(student.id, 'absent')}
                        style={{ 
                          padding: '8px 16px', border: 'none', cursor: 'pointer',
                          background: status === 'absent' ? '#fef2f2' : 'transparent',
                          color: status === 'absent' ? 'var(--accent-red)' : 'var(--text-muted)',
                          fontWeight: status === 'absent' ? 600 : 400
                        }}
                      >
                        Absent
                      </button>
                    </div>
                    <button 
                      onClick={() => alert('Clear not implemented in context yet')}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1rem', borderRadius: '8px' }}>
            Save attendance for {dateStr}
          </button>
        </div>

      </div>
    </div>
  );
};
