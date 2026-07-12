import React, { useState } from 'react';
import { useFeeData } from '../FeeContext';
import { format, subMonths, addMonths } from 'date-fns';
import { CheckCircle, XCircle, Clock, IndianRupee } from 'lucide-react';
import { FeeStatus, PaymentMethod } from '../types';

export const FeeMatrix: React.FC = () => {
  const { students, feeRecords, addFeeRecord, updateFeeRecord } = useFeeData();
  const [baseDate, setBaseDate] = useState(new Date());
  
  const [showModal, setShowModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  // Payment Form State
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [status, setStatus] = useState<FeeStatus>('paid');
  
  const [activeBatchTab, setActiveBatchTab] = useState<string>('Class 10');
  const batches = ['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
  const filteredStudents = students.filter(s => s.batch === activeBatchTab);

  // Generate last 6 months based on baseDate
  const months = Array.from({ length: 6 }).map((_, i) => {
    const d = subMonths(baseDate, 5 - i);
    return format(d, 'yyyy-MM');
  });

  const openPaymentModal = (studentId: string, month: string) => {
    const student = students.find(s => s.id === studentId);
    const existingRecord = feeRecords.find(r => r.studentId === studentId && r.month === month);
    
    setSelectedStudentId(studentId);
    setSelectedMonth(month);
    
    if (existingRecord) {
      setAmount(existingRecord.amount);
      setMethod(existingRecord.paymentMethod || 'cash');
      setStatus(existingRecord.status);
    } else {
      setAmount(student?.monthlyFee || 0);
      setMethod('cash');
      setStatus('paid');
    }
    
    setShowModal(true);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const existingRecord = feeRecords.find(r => r.studentId === selectedStudentId && r.month === selectedMonth);
    
    if (existingRecord) {
      updateFeeRecord({
        ...existingRecord,
        amount,
        status,
        paymentMethod: method,
        datePaid: status === 'paid' ? new Date().toISOString() : undefined
      });
    } else {
      addFeeRecord({
        studentId: selectedStudentId,
        month: selectedMonth,
        amount,
        status,
        paymentMethod: method,
        datePaid: status === 'paid' ? new Date().toISOString() : undefined
      });
    }
    setShowModal(false);
  };

  const renderStatusCell = (studentId: string, month: string) => {
    const record = feeRecords.find(r => r.studentId === studentId && r.month === month);
    
    return (
      <td 
        key={`${studentId}-${month}`} 
        style={{ textAlign: 'center', cursor: 'pointer' }}
        onClick={() => openPaymentModal(studentId, month)}
      >
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4px', borderRadius: '8px', transition: 'background 0.2s' }} className="hover-bg">
          {!record && <span style={{ color: 'var(--text-muted)' }}>-</span>}
          {record?.status === 'paid' && <CheckCircle color="var(--accent-green)" className="icon-small" size={20} />}
          {record?.status === 'pending' && <Clock color="var(--accent-amber)" className="icon-small" size={20} />}
          {record?.status === 'overdue' && <XCircle color="var(--accent-red)" className="icon-small" size={20} />}
        </div>
      </td>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Fee Tracking Matrix</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn" onClick={() => setBaseDate(subMonths(baseDate, 1))}>&larr; Previous</button>
          <button className="btn" onClick={() => setBaseDate(new Date())}>Current</button>
          <button className="btn" onClick={() => setBaseDate(addMonths(baseDate, 1))}>Next &rarr;</button>
        </div>
      </div>

      <style>{`
        .hover-bg:hover { background-color: rgba(255,255,255,0.05); }
      `}</style>

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
        {filteredStudents.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No students found in {activeBatchTab}.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ position: 'sticky', left: 0, backgroundColor: 'var(--bg-card)', zIndex: 10 }} className="sticky-col">Student</th>
                {months.map(m => (
                  <th key={m} style={{ textAlign: 'center' }} className="month-label">
                    {format(new Date(m + '-01'), 'MMM')} <span className="year">{format(new Date(m + '-01'), 'yyyy')}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student.id}>
                  <td className="sticky-col" style={{ position: 'sticky', left: 0, backgroundColor: 'var(--bg-card)', fontWeight: 500, zIndex: 10, borderRight: '1px solid var(--border-color)' }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{student.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student.batch}</div>
                  </td>
                  {months.map(m => renderStatusCell(student.id, m))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="modal-content">
            <h2 style={{ marginTop: 0, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IndianRupee /> Update Fee Record
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              Recording fee for <strong>{students.find(s => s.id === selectedStudentId)?.name}</strong> for <strong>{format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}</strong>
            </p>
            
            <form onSubmit={handlePaymentSubmit}>
              <div className="form-group">
                <label>Status</label>
                <select className="form-control" value={status} onChange={e => setStatus(e.target.value as FeeStatus)}>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Amount (₹)</label>
                <input required type="number" min="0" className="form-control" value={amount} onChange={e => setAmount(Number(e.target.value))} />
              </div>
              
              <div className="form-group">
                <label>Payment Method</label>
                <select className="form-control" value={method} onChange={e => setMethod(e.target.value as PaymentMethod)}>
                  <option value="cash">Cash</option>
                  <option value="online">Online / UPI</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
