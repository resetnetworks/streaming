import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllArtists } from '../features/artists/artistsSlice'; 
import { selectAllArtists,selectArtistLoading,selectArtistError } from '../features/artists/artistsSelectors';
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
  
  // Local state for albums and songs (you might want to move these to Redux too)
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

  // Fetch artists when component mounts
  useEffect(() => {
    dispatch(fetchAllArtists());
  }, [dispatch]);

  const renderContent = () => {
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    
    switch (activeTab) {
      case 'artists':
        return <Artists artists={artists} />;
      case 'albums':
        return <Albums albums={albums} />;
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