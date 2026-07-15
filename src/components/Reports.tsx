import React, { useState } from 'react';
import { useFeeData } from '../FeeContext';
import { format, subDays, addDays, subMonths, addMonths } from 'date-fns';
import { Calendar } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoUrl from '../assets/Logo.jpg.jpeg';

export const Reports: React.FC = () => {
  const { students, attendanceRecords, testRecords, markRecords, feeRecords } = useFeeData();
  
  // States
  const [absentDate, setAbsentDate] = useState(new Date());
  const [unpaidMonth, setUnpaidMonth] = useState(new Date());

  const absentDateStr = format(absentDate, 'yyyy-MM-dd');
  const unpaidMonthStr = format(unpaidMonth, 'yyyy-MM');

  // --- Helper to add header ---
  const addHeaderToDoc = (doc: jsPDF, reportTitle: string, dateText: string): Promise<number> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = logoUrl;
      img.onload = () => {
        doc.addImage(img, 'JPEG', 14, 10, 24, 24);
        
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42); 
        doc.text('Tarun Classes Of Mathematics', 42, 22);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(217, 119, 6); 
        doc.text('EXCELLENCE IN MATHEMATICS', 42, 28);
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(reportTitle, 14, 46);
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(dateText, 14, 53);
        
        resolve(58);
      };
      img.onerror = () => {
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42); 
        doc.text('Tarun Classes Of Mathematics', 14, 22);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(217, 119, 6);
        doc.text('EXCELLENCE IN MATHEMATICS', 14, 28);
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(reportTitle, 14, 46);
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(dateText, 14, 53);
        
        resolve(58);
      };
    });
  };

  // --- Report 1: Absentees all batches ---
  const downloadAbsenteeReport = async () => {
    const doc = new jsPDF();
    const startY = await addHeaderToDoc(doc, 'Absentee Report (All Batches)', `Date: ${format(absentDate, 'dd MMM yyyy')}`);

    const absentStudents = students.filter(student => {
      const record = attendanceRecords.find(r => r.studentId === student.id && r.date === absentDateStr);
      return record?.status === 'absent';
    });

    const tableColumn = ["Batch", "Student Name", "Status"];
    const tableRows = absentStudents
      .sort((a, b) => a.batch.localeCompare(b.batch) || a.name.localeCompare(b.name))
      .map(student => [student.batch, student.name, "Absent"]);

    if (tableRows.length === 0) {
      doc.text("No students are recorded as absent on this date.", 14, startY + 5);
    } else {
      autoTable(doc, {
        startY: startY,
        head: [tableColumn],
        body: tableRows,
      });
    }

    doc.save(`Absentees_All_Batches_${absentDateStr}.pdf`);
  };

  // --- Report 2: Test marks all batches ---
  const downloadTestMarksReport = async () => {
    const doc = new jsPDF();
    const initialY = await addHeaderToDoc(doc, 'All Batches Test Marks', `Generated: ${format(new Date(), 'dd MMM yyyy')}`);

    let startY = initialY;

    // Group tests by batch
    const batches = ['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
    let hasTests = false;

    batches.forEach(batch => {
      const batchTests = testRecords.filter(t => t.batch === batch).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      batchTests.forEach(test => {
        hasTests = true;
        // Check if we need a new page
        if (startY > 250) {
          doc.addPage();
          startY = 20;
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(`Test: ${test.testName} (${batch})`, 14, startY);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`Date: ${format(new Date(test.date), 'dd MMM yyyy')} | Max Marks: ${test.maxMarks}`, 14, startY + 6);

        const testMarks = markRecords.filter(m => m.testId === test.id);
        const batchStudents = students.filter(s => s.batch === batch);
        
        const tableColumn = ["S.No", "Student Name", "Marks Obtained", "Percentage"];
        const tableRows = batchStudents.map((student, index) => {
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
          startY: startY + 10,
          head: [tableColumn],
          body: tableRows,
          theme: 'grid',
          styles: { fontSize: 9 },
          headStyles: { fillColor: [217, 119, 6] } // gold accent
        });

        // @ts-ignore
        startY = doc.lastAutoTable.finalY + 15;
      });
    });

    if (!hasTests) {
      doc.text("No tests recorded yet.", 14, startY);
    }

    doc.save(`Test_Marks_All_Batches.pdf`);
  };

  // --- Report 3: Unpaid fees all batches ---
  const downloadUnpaidFeesReport = async () => {
    const doc = new jsPDF();
    const startY = await addHeaderToDoc(doc, `Unpaid Fees Report - ${format(unpaidMonth, 'MMMM yyyy')}`, `Generated: ${format(new Date(), 'dd MMM yyyy')}`);

    const unpaidStudents = students.filter(student => {
      const record = feeRecords.find(r => r.studentId === student.id && r.month === unpaidMonthStr);
      return !record || record.status !== 'paid';
    });

    const tableColumn = ["Batch", "Student Name", "Status", "Amount Due (Rs)"];
    const tableRows = unpaidStudents
      .sort((a, b) => a.batch.localeCompare(b.batch) || a.name.localeCompare(b.name))
      .map(student => {
        const record = feeRecords.find(r => r.studentId === student.id && r.month === unpaidMonthStr);
        const status = record ? record.status : 'pending';
        return [student.batch, student.name, status.toUpperCase(), student.monthlyFee.toString()];
      });

    if (tableRows.length === 0) {
      doc.text("All students have paid their fees for this month.", 14, startY + 5);
    } else {
      autoTable(doc, {
        startY: startY,
        head: [tableColumn],
        body: tableRows,
      });
    }

    doc.save(`Unpaid_Fees_All_Batches_${unpaidMonthStr}.pdf`);
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
          onClick={downloadAbsenteeReport}
        >
          Download absentee report (all batches, PDF)
        </button>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '12px' }}>
          Pulls saved attendance for the chosen date across 8th–12th batches into a single PDF.
        </p>
      </div>

      {/* 02 Test Marks */}
      <div className="card">
        <div className="section-header">
          <span className="section-badge" style={{ background: '#fef3c7', color: '#d97706' }}>02</span>
          <h3 className="section-title">Test marks — all batches</h3>
        </div>
        
        <button 
          className="btn btn-primary" 
          style={{ width: '100%', padding: '16px', fontSize: '1rem', borderRadius: '8px', background: 'var(--accent-gold)' }} 
          onClick={downloadTestMarksReport}
        >
          Download all batches marks (PDF)
        </button>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '12px' }}>
          Combines every recorded test for batches 8th–12th into one PDF, one table per test.
        </p>
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
          onClick={downloadUnpaidFeesReport}
        >
          Download unpaid fees report (all batches, PDF)
        </button>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '12px' }}>
          Lists every unpaid student across 8th–12th batches for the chosen month, in one PDF.
        </p>
      </div>

    </div>
  );
};
