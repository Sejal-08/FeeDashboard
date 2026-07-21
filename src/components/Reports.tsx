import React, { useState, useEffect } from 'react';
import { useFeeData } from '../FeeContext';
import { format, subDays, addDays, subMonths, addMonths } from 'date-fns';
import { Calendar, Download, FileText, Layers, Filter } from 'lucide-react';
import {
  downloadAbsenteeReport,
  downloadUnpaidFeesReport,
  downloadCombinedTestMarksReport,
  downloadBatchWiseTestMarksReport,
  downloadSingleTestReport
} from '../utils/pdfGenerator';

export const Reports: React.FC = () => {
  const { students, attendanceRecords, testRecords, markRecords, feeRecords } = useFeeData();
  
  // States for Absentee and Unpaid Fee Reports
  const [absentDate, setAbsentDate] = useState(new Date());
  const [unpaidMonth, setUnpaidMonth] = useState(new Date());

  // States for Test Marks Reports
  const [testReportMode, setTestReportMode] = useState<'test' | 'batch' | 'combined'>('test');
  const [selectedBatch, setSelectedBatch] = useState<string>('Class 10');
  const [selectedTestId, setSelectedTestId] = useState<string>('');

  const batches = ['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];

  // Filter tests by selected batch
  const batchTests = testRecords
    .filter(t => t.batch === selectedBatch)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Auto-select first test when batch or tests change
  useEffect(() => {
    if (batchTests.length > 0) {
      if (!selectedTestId || !batchTests.some(t => t.id === selectedTestId)) {
        setSelectedTestId(batchTests[0].id);
      }
    } else {
      setSelectedTestId('');
    }
  }, [selectedBatch, testRecords]);

  // Handlers for report downloads
  const handleAbsenteeDownload = () => {
    downloadAbsenteeReport(students, attendanceRecords, absentDate);
  };

  const handleUnpaidFeesDownload = () => {
    downloadUnpaidFeesReport(students, feeRecords, unpaidMonth);
  };

  const handleTestMarksDownload = () => {
    if (testReportMode === 'combined') {
      downloadCombinedTestMarksReport(students, testRecords, markRecords);
    } else if (testReportMode === 'batch') {
      downloadBatchWiseTestMarksReport(students, testRecords, markRecords, selectedBatch);
    } else if (testReportMode === 'test') {
      if (selectedTestId) {
        downloadSingleTestReport(students, testRecords, markRecords, selectedTestId);
      } else {
        alert('Please select a test to download.');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* 01 Absentees */}
      <div className="card">
        <div className="section-header">
          <span className="section-badge" style={{ background: '#fef3c7', color: '#d97706' }}>01</span>
          <h3 className="section-title">Absentees — all batches</h3>
        </div>
        
        <div style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          border: '1px solid var(--border-color)', borderRadius: '8px',
          padding: '12px 16px', marginBottom: '16px'
        }}>
          <span style={{ fontSize: '1rem', color: 'var(--text-main)' }}>
             {format(absentDate, 'MM/dd/yyyy')}
          </span>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setAbsentDate(subDays(absentDate, 1))}>&larr;</button>
            <Calendar size={20} color="var(--text-main)" />
            <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setAbsentDate(addDays(absentDate, 1))}>&rarr;</button>
          </div>
        </div>

        <button 
          className="btn btn-primary" 
          style={{ width: '100%', padding: '16px', fontSize: '1rem', borderRadius: '8px', background: 'var(--accent-gold)' }} 
          onClick={handleAbsenteeDownload}
        >
          <Download size={18} /> Download absentee report (all batches, PDF)
        </button>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '12px' }}>
          Pulls saved attendance for the chosen date across 8th–12th batches into a single PDF.
        </p>
      </div>

      {/* 02 Test Marks Reports */}
      <div className="card">
        <div className="section-header">
          <span className="section-badge" style={{ background: '#fef3c7', color: '#d97706' }}>02</span>
          <h3 className="section-title">Test marks reports</h3>
        </div>
        
        {/* Mode Selector Sub-Tabs */}
        <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '8px', marginBottom: '20px' }}>
          <button
            onClick={() => setTestReportMode('test')}
            style={{
              flex: 1,
              padding: '10px 14px',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: testReportMode === 'test' ? 'var(--bg-card)' : 'transparent',
              color: testReportMode === 'test' ? 'var(--accent-blue)' : 'var(--text-muted)',
              boxShadow: testReportMode === 'test' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <FileText size={16} /> Test-Wise
          </button>
          <button
            onClick={() => setTestReportMode('batch')}
            style={{
              flex: 1,
              padding: '10px 14px',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: testReportMode === 'batch' ? 'var(--bg-card)' : 'transparent',
              color: testReportMode === 'batch' ? 'var(--accent-blue)' : 'var(--text-muted)',
              boxShadow: testReportMode === 'batch' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <Filter size={16} /> Batch-Wise
          </button>
          <button
            onClick={() => setTestReportMode('combined')}
            style={{
              flex: 1,
              padding: '10px 14px',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: testReportMode === 'combined' ? 'var(--bg-card)' : 'transparent',
              color: testReportMode === 'combined' ? 'var(--accent-blue)' : 'var(--text-muted)',
              boxShadow: testReportMode === 'combined' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <Layers size={16} /> Combined (All)
          </button>
        </div>

        {/* Content based on Mode */}
        {testReportMode === 'test' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Batch Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px' }}>
                1. SELECT BATCH
              </label>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {batches.map((b, idx) => {
                  const isActive = selectedBatch === b;
                  const numMatch = b.match(/\d+/);
                  const num = numMatch ? numMatch[0] : (idx + 1);
                  return (
                    <button 
                      key={b}
                      onClick={() => setSelectedBatch(b)}
                      className={`batch-pill ${isActive ? 'active' : ''}`}
                    >
                      <div className="batch-pill-icon">{num}</div>
                      {b}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Test Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px' }}>
                2. SELECT TEST
              </label>
              {batchTests.length === 0 ? (
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No tests found for {selectedBatch}. Create a test in Marks Tracker first.
                </div>
              ) : (
                <select
                  className="form-control"
                  style={{ width: '100%', fontWeight: 500 }}
                  value={selectedTestId}
                  onChange={(e) => setSelectedTestId(e.target.value)}
                >
                  {batchTests.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.testName} — {format(new Date(t.date), 'dd MMM yyyy')} (Max: {t.maxMarks} marks)
                    </option>
                  ))}
                </select>
              )}
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '16px', fontSize: '1rem', borderRadius: '8px', background: 'var(--accent-gold)', marginTop: '8px' }} 
              onClick={handleTestMarksDownload}
              disabled={batchTests.length === 0 || !selectedTestId}
            >
              <Download size={18} /> Download Test-Wise Report (PDF)
            </button>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Generates a PDF report for a single test with student marks, percentages, and class summary stats.
            </p>
          </div>
        )}

        {testReportMode === 'batch' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Batch Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px' }}>
                SELECT BATCH
              </label>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {batches.map((b, idx) => {
                  const isActive = selectedBatch === b;
                  const numMatch = b.match(/\d+/);
                  const num = numMatch ? numMatch[0] : (idx + 1);
                  return (
                    <button 
                      key={b}
                      onClick={() => setSelectedBatch(b)}
                      className={`batch-pill ${isActive ? 'active' : ''}`}
                    >
                      <div className="batch-pill-icon">{num}</div>
                      {b}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.95rem' }}>
              📊 <strong>{batchTests.length}</strong> test(s) recorded for <strong>{selectedBatch}</strong>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '16px', fontSize: '1rem', borderRadius: '8px', background: 'var(--accent-gold)' }} 
              onClick={handleTestMarksDownload}
            >
              <Download size={18} /> Download {selectedBatch} Report (PDF)
            </button>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Pulls all test reports recorded for {selectedBatch} into a single PDF document.
            </p>
          </div>
        )}

        {testReportMode === 'combined' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.95rem' }}>
              🌐 Includes all tests across <strong>Class 8, Class 9, Class 10, Class 11, Class 12</strong> ({testRecords.length} total test records)
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '16px', fontSize: '1rem', borderRadius: '8px', background: 'var(--accent-gold)' }} 
              onClick={handleTestMarksDownload}
            >
              <Download size={18} /> Download Combined Report (All Batches, PDF)
            </button>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Combines every recorded test for batches 8th–12th into one comprehensive PDF.
            </p>
          </div>
        )}
      </div>

      {/* 03 Unpaid fees */}
      <div className="card">
        <div className="section-header">
          <span className="section-badge" style={{ background: '#fef3c7', color: '#d97706' }}>03</span>
          <h3 className="section-title">Unpaid fees — all batches</h3>
        </div>
        
        <div style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          border: '1px solid var(--border-color)', borderRadius: '8px',
          padding: '12px 16px', marginBottom: '16px'
        }}>
          <span style={{ fontSize: '1rem', color: 'var(--text-main)' }}>
             {format(unpaidMonth, 'MMMM yyyy')}
          </span>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setUnpaidMonth(subMonths(unpaidMonth, 1))}>&larr;</button>
            <Calendar size={20} color="var(--text-main)" />
            <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setUnpaidMonth(addMonths(unpaidMonth, 1))}>&rarr;</button>
          </div>
        </div>

        <button 
          className="btn btn-primary" 
          style={{ width: '100%', padding: '16px', fontSize: '1rem', borderRadius: '8px', background: 'var(--accent-gold)' }} 
          onClick={handleUnpaidFeesDownload}
        >
          <Download size={18} /> Download unpaid fees report (all batches, PDF)
        </button>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '12px' }}>
          Lists every unpaid student across 8th–12th batches for the chosen month, in one PDF.
        </p>
      </div>

    </div>
  );
};
