import React from 'react';
import { format } from 'date-fns';
import Logo from '../assets/Logo.jpg.jpeg';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'students', label: 'Students' },
    { id: 'fees', label: 'Fees' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'marks', label: 'Marks' },
    { id: 'settings', label: 'Settings' },
  ];

  const currentDate = format(new Date(), 'EEEE, dd MMMM yyyy');

  return (
    <div className="dashboard-layout">
      <header className="top-header">
        <div className="header-title-container">
          <img src={Logo} alt="Logo" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.2)' }} />
          <div className="header-title-text">
            <h1 className="header-title">Tarun Classes of Mathematics</h1>
            <h2 className="header-subtitle">ATTENDANCE & TEST REGISTER</h2>
          </div>
        </div>
        
        <div className="header-date">{currentDate}</div>
        
        <nav className="nav-tabs">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-tab ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>
      
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};
