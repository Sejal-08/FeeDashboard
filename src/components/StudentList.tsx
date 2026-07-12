import React, { useState } from 'react';
import { useFeeData } from '../FeeContext';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Student } from '../types';

export const StudentList: React.FC = () => {
  const { students, addStudent, updateStudent, deleteStudent } = useFeeData();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [batch, setBatch] = useState('');
  const [contact, setContact] = useState('');
  const [monthlyFee, setMonthlyFee] = useState(0);

  const openModal = (student?: Student) => {
    if (student) {
      setEditingId(student.id);
      setName(student.name);
      setRollNumber(student.rollNumber);
      setBatch(student.batch);
      setContact(student.contact);
      setMonthlyFee(student.monthlyFee);
    } else {
      setEditingId(null);
      setName('');
      setRollNumber('');
      setBatch('');
      setContact('');
      setMonthlyFee(0);
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateStudent({ id: editingId, name, rollNumber, batch, contact, monthlyFee });
    } else {
      addStudent({ name, rollNumber, batch, contact, monthlyFee });
    }
    setShowModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Students</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> Add Student
        </button>
      </div>

      <div className="card table-container">
        {students.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No students added yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Name</th>
                <th>Batch/Class</th>
                <th>Contact</th>
                <th>Monthly Fee</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id}>
                  <td>{student.rollNumber}</td>
                  <td style={{ fontWeight: 500 }}>{student.name}</td>
                  <td>{student.batch}</td>
                  <td>{student.contact}</td>
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
              <div className="form-group">
                <label>Full Name</label>
                <input required className="form-control" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Roll Number</label>
                  <input required className="form-control" value={rollNumber} onChange={e => setRollNumber(e.target.value)} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Batch / Class</label>
                  <input required className="form-control" value={batch} onChange={e => setBatch(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>Contact Number</label>
                <input required className="form-control" value={contact} onChange={e => setContact(e.target.value)} />
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
