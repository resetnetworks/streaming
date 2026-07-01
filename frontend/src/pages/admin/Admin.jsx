import { useState } from 'react';

import AdminLayout from './AdminLayout';
import Dashboard from './Dashboard';
import Artists from './Artists';
import AdminPaymentRequests from './AdminPaymentRequests';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'artists':
        return <Artists />;

      case 'payments':
        return <AdminPaymentRequests />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </AdminLayout>
  );
};

export default Admin;
