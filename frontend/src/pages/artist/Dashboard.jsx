import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/artist/dashboard/sidebar';
import BackgroundWrapper from '../../components/BackgroundWrapper';
import HomeComponent from '../../components/artist/home/HomeComponent';
import UploadsComponent from '../../components/artist/upload/UploadsComponent';
import ProfileComponent from '../../components/artist/profile/ProfileComponent';
import Topbar from '../../components/artist/dashboard/Topbar';
import SingleUpload from './SingleUpload';
import AlbumUpload from './AlbumUpload';

const tabComponents = {
  profile: <ProfileComponent />,
  dashboard: <HomeComponent />,
  uploads: <UploadsComponent />,
};

export default function Dashboard() {
  // Initialize state from localStorage or default to "profile"
  const [selectedTab, setSelectedTab] = useState(() => {
    // Check if we're in the browser environment
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('dashboardSelectedTab');
      // Validate that the saved tab is one of our valid tabs
      const validTabs = ['profile', 'dashboard', 'uploads'];
      return validTabs.includes(savedTab) ? savedTab : 'profile';
    }
    return 'profile';
  });

  const [currentUploadPage, setCurrentUploadPage] = useState(null);

  // Save selected tab to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboardSelectedTab', selectedTab);
    }
  }, [selectedTab]);

  // Also save upload page state if needed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (currentUploadPage) {
        localStorage.setItem('currentUploadPage', currentUploadPage);
      } else {
        localStorage.removeItem('currentUploadPage');
      }
    }
  }, [currentUploadPage]);

  // Load upload page state on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUploadPage = localStorage.getItem('currentUploadPage');
      const validUploadPages = ['single', 'album'];
      if (validUploadPages.includes(savedUploadPage)) {
        setCurrentUploadPage(savedUploadPage);
      }
    }
  }, []);

  // Handle tab change
  const handleTabChange = (tab) => {
    // If switching tabs while in upload mode, cancel upload first
    if (currentUploadPage) {
      setCurrentUploadPage(null);
    }
    setSelectedTab(tab);
  };

  // Handle upload cancellation
  const handleCancelUpload = () => {
    setCurrentUploadPage(null);
  };

  return (
    <BackgroundWrapper>
      <div className="flex min-h-screen">
        <Sidebar 
          selectedTab={selectedTab} 
          setSelectedTab={handleTabChange} 
          currentUploadPage={currentUploadPage}
        />
        <div className="flex-grow w-full flex flex-col">
          <Topbar 
            selectedTab={selectedTab} 
            currentUploadPage={currentUploadPage}
            setCurrentUploadPage={setCurrentUploadPage}
          />
          <main className="flex-grow">
            {currentUploadPage === "single" ? (
              <SingleUpload onCancel={handleCancelUpload} />
            ) : currentUploadPage === "album" ? (
              <AlbumUpload onCancel={handleCancelUpload} />
            ) : (
              tabComponents[selectedTab]
            )}
          </main>
        </div>
      </div>
    </BackgroundWrapper>
  );
}