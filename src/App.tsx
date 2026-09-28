import React from 'react';
import { useStore } from './store';
import Sidebar from './components/Sidebar';
import AccountManager from './components/AccountManager';
import LabelsManager from './components/LabelsManager';
import CustomAttributesManager from './components/CustomAttributesManager';
import KanbanBoard from './components/KanbanBoard';

function App() {
  const { currentView } = useStore();

  const renderContent = () => {
    switch (currentView) {
      case 'accounts':
        return <AccountManager />;
      case 'labels':
        return <LabelsManager />;
      case 'attributes':
        return <CustomAttributesManager />;
      case 'kanban':
        return <KanbanBoard />;
      default:
        return <AccountManager />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-64 p-8">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
