import React, { useState } from 'react';
import { useFeeData } from '../FeeContext';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Student } from '../types';

export const StudentList: React.FC = () => {
  const { students, addStudent, updateStudent, deleteStudent } = useFeeData();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeBatchTab, setActiveBatchTab] = useState<string>('Class 10');

  // Form State
  const [name, setName] = useState('');
  const [batch, setBatch] = useState('Class 10');
  const [monthlyFee, setMonthlyFee] = useState(0);

  const openModal = (student?: Student) => {
    if (student) {
      setEditingId(student.id);
      setName(student.name);
      setBatch(student.batch);
      setMonthlyFee(student.monthlyFee);
    } else {
      setEditingId(null);
      setName('');
      setBatch(activeBatchTab !== 'All' ? activeBatchTab : 'Class 10');
      setMonthlyFee(0);
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateStudent({ id: editingId, name, batch, monthlyFee });
    } else {
      addStudent({ name, batch, monthlyFee });
    }
    setShowModal(false);
  };

  const batches = ['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
  const filteredStudents = students.filter(s => s.batch === activeBatchTab);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> Add Student
        </button>
      </div>

      <div className="section-header" style={{ marginBottom: 0 }}>
        <span className="section-badge">01</span>
        <h3 className="section-title">Students</h3>
      </div>
      
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

      <div className="card table-container">
        <div className="section-header">
          <span className="section-badge">02</span>
          <h3 className="section-title">{activeBatchTab} List</h3>
        </div>
        {filteredStudents.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No students found in {activeBatchTab}.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Monthly Fee</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student.id}>
                  <td style={{ fontWeight: 500 }}>{student.name}</td>
                  <td>₹{student.monthlyFee}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn" style={{ padding: '6px' }} onClick={() => openModal(student)}>
                        <Edit2 size={16} />
                      </button>
                      <button className="btn" style={{ padding: '6px', color: 'var(--accent-red)' }} onClick={() => {
                        if (confirm('Are you sure you want to delete this student and all their fee records?')) {
                          deleteStudent(student.id);
                        }
                      }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ marginTop: 0, marginBottom: '24px' }}>{editingId ? 'Edit Student' : 'Add New Student'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Full Name</label>
                  <input required className="form-control" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Batch / Class</label>
                  <select required className="form-control" value={batch} onChange={e => setBatch(e.target.value)}>
                    {batches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Monthly Fee Amount (₹)</label>
                <input required type="number" min="0" className="form-control" value={monthlyFee} onChange={e => setMonthlyFee(Number(e.target.value))} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Save Changes' : 'Add Student'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
