import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { Student, AttendanceRecord, TestRecord, MarkRecord, FeeRecord } from '../types';
import logoUrl from '../assets/Logo.jpg.jpeg';

// --- Helper to add header to PDF ---
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

// --- Report 1: Absentee Report ---
export const downloadAbsenteeReport = async (
  students: Student[],
  attendanceRecords: AttendanceRecord[],
  absentDate: Date
) => {
  const absentDateStr = format(absentDate, 'yyyy-MM-dd');
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
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text("No students are recorded as absent on this date.", 14, startY + 5);
  } else {
    autoTable(doc, {
      startY: startY,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [217, 119, 6] }
    });
  }

  doc.save(`Absentees_All_Batches_${absentDateStr}.pdf`);
};

// --- Report 2: Unpaid Fees Report ---
export const downloadUnpaidFeesReport = async (
  students: Student[],
  feeRecords: FeeRecord[],
  unpaidMonth: Date
) => {
  const unpaidMonthStr = format(unpaidMonth, 'yyyy-MM');
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
      return [student.batch, student.name, status.toUpperCase(), `Rs ${student.monthlyFee}`];
    });

  if (tableRows.length === 0) {
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text("All students have paid their fees for this month.", 14, startY + 5);
  } else {
    autoTable(doc, {
      startY: startY,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [217, 119, 6] }
    });
  }

  doc.save(`Unpaid_Fees_All_Batches_${unpaidMonthStr}.pdf`);
};

// --- Report 3: Combined Test Marks Report (All Batches & All Tests) ---
export const downloadCombinedTestMarksReport = async (
  students: Student[],
  testRecords: TestRecord[],
  markRecords: MarkRecord[]
) => {
  const doc = new jsPDF();
  const initialY = await addHeaderToDoc(doc, 'Combined Test Marks Report (All Batches)', `Generated: ${format(new Date(), 'dd MMM yyyy')}`);

  let startY = initialY;
  const batches = ['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
  let hasTests = false;

  batches.forEach(batch => {
    const batchTests = testRecords.filter(t => t.batch === batch).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    batchTests.forEach(test => {
      hasTests = true;
      if (startY > 240) {
        doc.addPage();
        startY = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
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
        const percentage = marksObtained !== null ? ((marksObtained / test.maxMarks) * 100).toFixed(1) + '%' : 'Absent';
        return [
          (index + 1).toString(),
          student.name,
          marksObtained !== null ? marksObtained.toString() : 'Absent',
          percentage
        ];
      });

      autoTable(doc, {
        startY: startY + 10,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [217, 119, 6] },
        didParseCell: (data) => {
          if (data.section === 'body' && data.cell.raw === 'Absent') {
            data.cell.styles.textColor = [220, 38, 38];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      });

      // @ts-ignore
      startY = doc.lastAutoTable.finalY + 15;
    });
  });

  if (!hasTests) {
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text("No tests recorded yet.", 14, startY);
  }

  doc.save(`Combined_Test_Marks_All_Batches_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

// --- Report 4: Batch-wise Test Marks Report ---
export const downloadBatchWiseTestMarksReport = async (
  students: Student[],
  testRecords: TestRecord[],
  markRecords: MarkRecord[],
  selectedBatch: string
) => {
  const doc = new jsPDF();
  const initialY = await addHeaderToDoc(doc, `Batch Test Report - ${selectedBatch}`, `Generated: ${format(new Date(), 'dd MMM yyyy')}`);

  let startY = initialY;
  const batchTests = testRecords.filter(t => t.batch === selectedBatch).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if (batchTests.length === 0) {
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`No tests recorded yet for ${selectedBatch}.`, 14, startY + 5);
  } else {
    batchTests.forEach(test => {
      if (startY > 240) {
        doc.addPage();
        startY = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`Test: ${test.testName}`, 14, startY);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Date: ${format(new Date(test.date), 'dd MMM yyyy')} | Max Marks: ${test.maxMarks}`, 14, startY + 6);

      const testMarks = markRecords.filter(m => m.testId === test.id);
      const batchStudents = students.filter(s => s.batch === selectedBatch);
      
      const tableColumn = ["S.No", "Student Name", "Marks Obtained", "Percentage"];
      const tableRows = batchStudents.map((student, index) => {
        const markRec = testMarks.find(m => m.studentId === student.id);
        const marksObtained = markRec ? markRec.marksObtained : null;
        const percentage = marksObtained !== null ? ((marksObtained / test.maxMarks) * 100).toFixed(1) + '%' : 'Absent';
        return [
          (index + 1).toString(),
          student.name,
          marksObtained !== null ? marksObtained.toString() : 'Absent',
          percentage
        ];
      });

      autoTable(doc, {
        startY: startY + 10,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [217, 119, 6] },
        didParseCell: (data) => {
          if (data.section === 'body' && data.cell.raw === 'Absent') {
            data.cell.styles.textColor = [220, 38, 38];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      });

      // @ts-ignore
      startY = doc.lastAutoTable.finalY + 15;
    });
  }

  doc.save(`Test_Marks_${selectedBatch.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

// --- Report 5: Single Test-wise Report ---
export const downloadSingleTestReport = async (
  students: Student[],
  testRecords: TestRecord[],
  markRecords: MarkRecord[],
  testId: string
) => {
  const test = testRecords.find(t => t.id === testId);
  if (!test) return;

  const doc = new jsPDF();
  const initialY = await addHeaderToDoc(
    doc, 
    `Test Report - ${test.testName}`, 
    `Batch: ${test.batch} | Date: ${format(new Date(test.date), 'dd MMM yyyy')} | Max Marks: ${test.maxMarks}`
  );

  let startY = initialY;

  const testMarks = markRecords.filter(m => m.testId === test.id);
  const batchStudents = students.filter(s => s.batch === test.batch);
  
  // Stats
  const validMarks = testMarks
    .map(m => m.marksObtained)
    .filter(m => m !== undefined && m !== null && !isNaN(m));
  const highestMarks = validMarks.length > 0 ? Math.max(...validMarks) : null;
  const lowestMarks = validMarks.length > 0 ? Math.min(...validMarks) : null;
  const averageMarks = validMarks.length > 0 ? (validMarks.reduce((a, b) => a + b, 0) / validMarks.length).toFixed(1) : null;

  const presentCount = validMarks.length;
  const absentCount = batchStudents.length - presentCount;

  // Render stats bar box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(14, startY, 182, 14, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(
    `Total: ${batchStudents.length}  |  Present: ${presentCount}  |  Absent: ${absentCount}  |  Highest: ${highestMarks !== null ? highestMarks : 'N/A'}/${test.maxMarks}  |  Lowest: ${lowestMarks !== null ? lowestMarks : 'N/A'}/${test.maxMarks}  |  Avg: ${averageMarks !== null ? averageMarks : 'N/A'}`,
    18, 
    startY + 9
  );

  const tableColumn = ["S.No", "Student Name", "Marks Obtained", "Percentage"];
  const tableRows = batchStudents.map((student, index) => {
    const markRec = testMarks.find(m => m.studentId === student.id);
    const marksObtained = markRec ? markRec.marksObtained : null;
    const percentage = marksObtained !== null ? ((marksObtained / test.maxMarks) * 100).toFixed(1) + '%' : 'Absent';
    return [
      (index + 1).toString(),
      student.name,
      marksObtained !== null ? marksObtained.toString() : 'Absent',
      percentage
    ];
  });

  autoTable(doc, {
    startY: startY + 20,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [217, 119, 6] },
    didParseCell: (data) => {
      if (data.section === 'body' && data.cell.raw === 'Absent') {
        data.cell.styles.textColor = [220, 38, 38];
        data.cell.styles.fontStyle = 'bold';
      }
    }
  });

  const safeTestName = test.testName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeBatchName = test.batch.replace(/\s+/g, '_');
  doc.save(`Test_Marks_${safeBatchName}_${safeTestName}.pdf`);
};
