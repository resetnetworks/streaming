import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import { fetchAllArtists } from '../features/artists/artistsSlice'; 
import { selectAllArtists, selectArtistLoading, selectArtistError } from '../features/artists/artistsSelectors';

import AdminLayout from './AdminLayout';
import Dashboard from './Dashboard';
import Artists from './Artists';
import Albums from "./Album";
import Songs from './Songs';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const dispatch = useDispatch();
  const artists = useSelector(selectAllArtists);
  const loading = useSelector(selectArtistLoading);
  const error = useSelector(selectArtistError);

  const [albums, setAlbums] = useState([]);
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    dispatch(fetchAllArtists());

    const initialSongs = [
      { id: 1, title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: '3:20' },
      { id: 2, title: 'Anti-Hero', artist: 'Taylor Swift', album: 'Midnights', duration: '3:20' },
      { id: 3, title: 'Way 2 Sexy', artist: 'Drake', album: 'Certified Lover Boy', duration: '4:17' }
    ];
    setSongs(initialSongs);
  }, [dispatch]);

  const handleAlbumUpdate = (updatedAlbums) => {
    setAlbums(updatedAlbums);
  };

  const renderSkeleton = () => (
    <SkeletonTheme baseColor="#1f2937" highlightColor="#374151">
      <div className="space-y-4 px-4 py-6 rounded-md">
        <Skeleton height={900} width="100%" />
      </div>
    </SkeletonTheme>
  );

  const renderContent = () => {
    if (loading) return renderSkeleton();
    if (error) return <div className="text-red-400 text-sm px-4 py-2">Error: {error}</div>;

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
