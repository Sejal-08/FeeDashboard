import { useState } from 'react';
import { FeeProvider } from './FeeContext';
import { Layout } from './components/Layout';
import { DashboardOverview } from './components/DashboardOverview';
import { StudentList } from './components/StudentList';
import { FeeMatrix } from './components/FeeMatrix';
import { AttendanceTracker } from './components/AttendanceTracker';
import { MarksTracker } from './components/MarksTracker';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'students':
        return <StudentList />;
      case 'fees':
        return <FeeMatrix />;
      case 'attendance':
        return <AttendanceTracker />;
      case 'marks':
        return <MarksTracker />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}

function App() {
  return (
    <FeeProvider>
      <AppContent />
    </FeeProvider>
  );
}

export default App;
