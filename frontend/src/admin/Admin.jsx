import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllArtists } from '../features/artists/artistsSlice'; 
import { selectAllArtists, selectArtistLoading, selectArtistError } from '../features/artists/artistsSelectors';
import AdminLayout from './AdminLayout';
import Dashboard from './Dashboard';
import Artists from './Artists';
import Albums from "./Album";
import Songs from './Songs';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Get data from Redux store
  const dispatch = useDispatch();
  const artists = useSelector(selectAllArtists);
  const loading = useSelector(selectArtistLoading);
  const error = useSelector(selectArtistError);
  
  // State for albums and songs
  const [albums, setAlbums] = useState([]);
  const [songs, setSongs] = useState([]);

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchAllArtists());

    const initialSongs = [
      { id: 1, title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: '3:20' },
      { id: 2, title: 'Anti-Hero', artist: 'Taylor Swift', album: 'Midnights', duration: '3:20' },
      { id: 3, title: 'Way 2 Sexy', artist: 'Drake', album: 'Certified Lover Boy', duration: '4:17' }
    ];
    setSongs(initialSongs);
  }, [dispatch]);

  // Handler for updating albums
  const handleAlbumUpdate = (updatedAlbums) => {
    setAlbums(updatedAlbums);
  };

  const renderContent = () => {
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    
    switch (activeTab) {
      case 'artists':
        return <Artists artists={artists} />;
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