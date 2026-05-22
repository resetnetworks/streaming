import { useState } from 'react';
import { useSelector } from 'react-redux';

import {
  selectAllArtists,
} from '../../features/artists/artistsSelectors';

import AdminLayout from './AdminLayout';
import Dashboard from './Dashboard';
import Artists from './Artists';
import AdminPaymentRequests from './AdminPaymentRequests';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const artists = useSelector(selectAllArtists);


  const renderContent = () => {
    switch (activeTab) {
      case 'artists':
        return <Artists />;

      case 'payments':
        return <AdminPaymentRequests />;
      default:
        return <Dashboard artists={artists} />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </AdminLayout>
  );
};

export default Admin;
