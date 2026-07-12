import { useState } from 'react';
import { FeeProvider } from './FeeContext';
import { Layout } from './components/Layout';
import { DashboardOverview } from './components/DashboardOverview';
import { StudentList } from './components/StudentList';
import { FeeMatrix } from './components/FeeMatrix';
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
