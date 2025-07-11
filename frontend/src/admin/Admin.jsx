import { useState } from 'react';
import { useSelector } from 'react-redux';

import {
  selectAllArtists,
  selectArtistLoading,
  selectArtistError,
} from '../features/artists/artistsSelectors';

import AdminLayout from './AdminLayout';
import Dashboard from './Dashboard';
import Artists from './Artists';
import Albums from "./Album";
import Songs from './Songs';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const artists = useSelector(selectAllArtists);

  const [albums, setAlbums] = useState([]);
  const [songs, setSongs] = useState([
    { id: 1, title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: '3:20' },
    { id: 2, title: 'Anti-Hero', artist: 'Taylor Swift', album: 'Midnights', duration: '3:20' },
    { id: 3, title: 'Way 2 Sexy', artist: 'Drake', album: 'Certified Lover Boy', duration: '4:17' }
  ]);

  const handleAlbumUpdate = (updatedAlbums) => {
    setAlbums(updatedAlbums);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'artists':
        return <Artists />;
      case 'albums':
        return <Albums albums={albums} onAlbumUpdate={handleAlbumUpdate} />;
      case 'songs':
        return <Songs songs={songs} />;
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
