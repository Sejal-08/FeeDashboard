import React from 'react';
import { useFeeData } from '../FeeContext';
import { IndianRupee, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export const DashboardOverview: React.FC = () => {
  const { students, feeRecords } = useFeeData();

  const currentMonth = format(new Date(), 'yyyy-MM');
  
  // Calculate metrics
  const totalStudents = students.length;
  
  const currentMonthRecords = feeRecords.filter(r => r.month === currentMonth);
  const totalCollectedThisMonth = currentMonthRecords
    .filter(r => r.status === 'paid')
    .reduce((sum, record) => sum + record.amount, 0);

  const pendingAmountThisMonth = students.reduce((sum, student) => {
    const record = currentMonthRecords.find(r => r.studentId === student.id);
    if (!record || record.status !== 'paid') {
      return sum + student.monthlyFee;
    }
    return sum;
  }, 0);

  const recentPayments = [...feeRecords]
    .filter(r => r.status === 'paid')
    .sort((a, b) => new Date(b.datePaid || '').getTime() - new Date(a.datePaid || '').getTime())
    .slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Dashboard Overview</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        <div className="card metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="metric-title">Total Collected ({format(new Date(), 'MMM yyyy')})</span>
            <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-green)', borderRadius: '8px' }}>
              <IndianRupee size={20} />
            </div>
          </div>
          <p className="metric-value">₹{totalCollectedThisMonth.toLocaleString()}</p>
        </div>

        <div className="card metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="metric-title">Pending Dues ({format(new Date(), 'MMM yyyy')})</span>
            <div style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-red)', borderRadius: '8px' }}>
              <AlertCircle size={20} />
            </div>
          </div>
          <p className="metric-value">₹{pendingAmountThisMonth.toLocaleString()}</p>
        </div>

        <div className="card metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="metric-title">Total Active Students</span>
            <div style={{ padding: '8px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', borderRadius: '8px' }}>
              <Users size={20} />
            </div>
          </div>
          <p className="metric-value">{totalStudents}</p>
        </div>
      </div>

      <div className="card" style={{ marginTop: '16px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={20} color="var(--accent-blue)" /> Recent Payments
        </h3>
        
        {recentPayments.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No recent payments recorded.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Month</th>
                  <th>Amount</th>
                  <th>Date Paid</th>
                  <th>Method</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map(record => {
                  const student = students.find(s => s.id === record.studentId);
                  return (
                    <tr key={record.id}>
                      <td style={{ fontWeight: 500 }}>{student?.name || 'Unknown'}</td>
                      <td>{format(new Date(record.month + '-01'), 'MMMM yyyy')}</td>
                      <td style={{ color: 'var(--accent-green)', fontWeight: 600 }}>₹{record.amount}</td>
                      <td>{record.datePaid ? format(new Date(record.datePaid), 'dd MMM yyyy') : '-'}</td>
                      <td style={{ textTransform: 'capitalize' }}>{record.paymentMethod}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
