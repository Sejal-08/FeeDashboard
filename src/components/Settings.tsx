import React, { useRef } from 'react';
import { useFeeData } from '../FeeContext';
import { Download, Upload } from 'lucide-react';

export const Settings: React.FC = () => {
  const { exportData, importData } = useFeeData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        if (confirm('Importing data will overwrite your current data. Are you sure you want to proceed?')) {
          importData(content);
        }
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
      <div className="section-header" style={{ marginBottom: 0 }}>
        <span className="section-badge">01</span>
        <h3 className="section-title">Settings & Data Management</h3>
      </div>
      
      <div className="card">
        <div className="section-header">
          <span className="section-badge" style={{ background: 'var(--accent-amber)', color: 'var(--bg-dark)' }}>!</span>
          <h3 className="section-title">Data Backup & Restore</h3>
        </div>
        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
          All your student and fee records are securely saved directly in this browser (Local Storage). This means your data is completely free and private.
          <br /><br />
          However, if you clear your browser history or switch computers, you might lose this data. It is highly recommended to <strong>Export a Backup</strong> regularly (e.g., once a week).
        </p>

        <div style={{ display: 'flex', gap: '16px', marginTop: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, padding: '24px', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '8px' }}>
            <h3 style={{ marginTop: 0 }}>Export Data</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>Download a secure JSON file containing all your records to your computer.</p>
            <button className="btn btn-primary" onClick={exportData}>
              <Download size={18} /> Download Backup File
            </button>
          </div>

          <div style={{ flex: 1, padding: '24px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px' }}>
            <h3 style={{ marginTop: 0 }}>Import Data</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>Restore your records from a previously downloaded JSON backup file.</p>
            <input 
              type="file" 
              accept=".json" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileUpload}
            />
            <button className="btn btn-success" onClick={() => fileInputRef.current?.click()}>
              <Upload size={18} /> Select Backup to Import
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
