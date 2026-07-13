import React from 'react';
import { LayoutDashboard, Users, Receipt, Settings, ClipboardCheck, GraduationCap } from 'lucide-react';
import Logo from '../assets/Logo.jpg.jpeg';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'students', label: 'Students', icon: <Users size={20} /> },
    { id: 'fees', label: 'Fee Matrix', icon: <Receipt size={20} /> },
    { id: 'attendance', label: 'Attendance', icon: <ClipboardCheck size={20} /> },
    { id: 'marks', label: 'Marks', icon: <GraduationCap size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="dashboard-layout">
      <header className="mobile-header">
        <h2 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-blue)', lineHeight: '1.4' }}>
          <img src={Logo} alt="Logo" style={{ width: '28px', height: '28px', borderRadius: '8px', objectFit: 'cover' }} />
          Tarun Classes Of Mathematics
        </h2>
      </header>
      <aside className="sidebar">
        <div className="sidebar-header" style={{ padding: '16px 8px', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-blue)', lineHeight: '1.4' }}>
            <img src={Logo} alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} />
            Tarun Classes Of Mathematics
          </h2>
        </div>
        
        <nav className="nav-menu" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px', borderRadius: '8px', border: 'none',
                background: activeTab === item.id ? 'var(--accent-blue)' : 'transparent',
                color: activeTab === item.id ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer', fontSize: '0.95rem', fontWeight: 500,
                textAlign: 'left', transition: 'all 0.2s'
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};
