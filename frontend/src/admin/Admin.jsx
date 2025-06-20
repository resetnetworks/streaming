import { useState } from 'react';
import AdminLayout from './AdminLayout';
import Dashboard from './Dashboard';
import Artists from './Artists';
import Albums from './Albums';
import Songs from './Songs';
import Settings from './Settings';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [artists, setArtists] = useState([
    { id: 1, name: 'The Weeknd', songs: 45, albums: 5 },
    { id: 2, name: 'Taylor Swift', songs: 180, albums: 10 },
    { id: 3, name: 'Drake', songs: 210, albums: 8 }
  ]);
  const [albums, setAlbums] = useState([
    { id: 1, title: 'After Hours', artist: 'The Weeknd', year: 2020 },
    { id: 2, title: 'Midnights', artist: 'Taylor Swift', year: 2022 },
    { id: 3, title: 'Certified Lover Boy', artist: 'Drake', year: 2021 }
  ]);
  const [songs, setSongs] = useState([
    { id: 1, title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: '3:20' },
    { id: 2, title: 'Anti-Hero', artist: 'Taylor Swift', album: 'Midnights', duration: '3:20' },
    { id: 3, title: 'Way 2 Sexy', artist: 'Drake', album: 'Certified Lover Boy', duration: '4:17' }
  ]);

  const renderContent = () => {
    switch (activeTab) {
      case 'artists':
        return <Artists artists={artists} />;
      case 'albums':
        return <Albums albums={albums} />;
      case 'songs':
        return <Songs songs={songs} />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard artists={artists} albums={albums} songs={songs} />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </AdminLayout>
  );
};

export default Admin;