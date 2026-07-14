import React, { useState, useEffect } from 'react';
import { useFeeData } from '../FeeContext';
import { format } from 'date-fns';

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
              className={`batch-pill ${isActive ? 'active' : ''}`}
            >
              <div className="batch-pill-icon">
                {num}
              </div>
              {b} {isActive ? 'batch' : ''}
            </button>
          )
        })}
      </div>

      {/* Step 1: New Test */}
      <div className="card">
        <div className="section-header">
          <span className="section-badge">01</span>
          <h3 className="section-title">New test — {activeBatchTab}</h3>
        </div>
        <form onSubmit={handleCreateTest} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input required className="form-control" placeholder="Test name, e.g. Algebra Unit Test" value={newTestName} onChange={e => setNewTestName(e.target.value)} />
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <input required type="date" className="form-control" style={{ flex: 2, minWidth: '150px' }} value={newTestDate} onChange={e => setNewTestDate(e.target.value)} />
            <input required type="number" min="1" className="form-control" placeholder="Max marks" style={{ flex: 1, minWidth: '100px' }} value={newTestMaxMarks} onChange={e => setNewTestMaxMarks(Number(e.target.value))} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>Create test</button>
        </form>
      </div>

      {/* Step 2: Existing Tests */}
      <div className="card">
        <div className="section-header">
          <span className="section-badge">02</span>
          <h3 className="section-title">Existing tests</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {batchTests.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', margin: '12px', textAlign: 'center' }}>No tests created yet.</p>
          ) : (
            batchTests.map(test => (
              <div 
                key={test.id} 
                onClick={() => setSelectedTestId(test.id)}
                style={{ 
                  padding: '16px', 
                  background: selectedTestId === test.id ? 'var(--accent-gold-light)' : 'rgba(0,0,0,0.02)', 
                  color: selectedTestId === test.id ? 'var(--text-main)' : 'var(--text-muted)',
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: selectedTestId === test.id ? '1px solid var(--accent-gold)' : '1px solid transparent',
                  fontWeight: selectedTestId === test.id ? 600 : 400
                }}
              >
                <div>
                  <div style={{ marginBottom: '4px' }}>{test.testName}</div>
                  <div style={{ fontSize: '0.85rem' }}>{test.date}</div>
                </div>
                <div style={{ fontSize: '0.9rem' }}>/ {test.maxMarks}</div>
              </div>
            ))
          )}
          {!selectedTestId && batchTests.length > 0 && (
            <p style={{ textAlign: 'center', color: 'var(--accent-gold)', fontSize: '0.9rem', marginTop: '8px' }}>
              ↑ Click a test above to enter marks
            </p>
          )}
        </div>
      </div>

      {/* Step 3: Enter Marks */}
      {selectedTest && (
        <div className="card">
          <div className="section-header">
            <span className="section-badge">03</span>
            <h3 className="section-title">Enter marks — {selectedTest.testName}</h3>
          </div>
          <div className="table-container" style={{ border: 'none', marginBottom: '24px' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button className="btn btn-primary" style={{ padding: '16px' }} onClick={handleSaveMarks}>Save marks for {selectedTest.testName}</button>
            <button className="btn" style={{ padding: '16px', background: 'transparent', color: 'var(--accent-red)', border: 'none' }} onClick={handleDeleteTest}>Delete this test</button>
          </div>
        </div>
      )}
    </div>
  );
};
