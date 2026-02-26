import React, { useState, useEffect } from "react";
import Sidebar from "../../components/artist/dashboard/Sidebar";
import BackgroundWrapper from "../../components/BackgroundWrapper";
import HomeComponent from "../../components/artist/home/HomeComponent";
import UploadsComponent from "../../components/artist/upload/UploadsComponent";
import ArtistDashboardRevenue from "../../components/artist/revenue/ArtistDashboardRevenue";
import ProfileComponent from "../../components/artist/profile/ProfileComponent";
import Topbar from "../../components/artist/dashboard/Topbar";
import SingleUpload from "./SingleUpload";
import AlbumUpload from "./AlbumUpload";
import { useDispatch } from "react-redux";
import { resetAllAlbumState } from "../../features/artistAlbums/artistAlbumsSlice";
import { resetUploadState } from "../../features/artistSong/artistSongSlice";
import MonetizationModal from "../../components/artist/monetization/MonitizationModal";
import { getMyMonetizationSetupStatus } from "../../features/monetization/monetizationSlice";
import { toast } from "sonner";

const tabComponents = {
  profile: <ProfileComponent />,
  dashboard: <HomeComponent />,
  uploads: <UploadsComponent />,
  revenue: <ArtistDashboardRevenue />,
};

export default function Dashboard() {
  const dispatch = useDispatch();

  // Initialize state from localStorage or default to "profile"
  const [selectedTab, setSelectedTab] = useState(() => {
    // Check if we're in the browser environment
    if (typeof window !== "undefined") {
      const savedTab = localStorage.getItem("dashboardSelectedTab");
      // Validate that the saved tab is one of our valid tabs
      const validTabs = ["profile", "dashboard", "uploads"];
      return validTabs.includes(savedTab) ? savedTab : "profile";
    }
    return "profile";
  });

  const [currentUploadPage, setCurrentUploadPage] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showBatchProgress, setShowBatchProgress] = useState(false);
  const [batchProgressData, setBatchProgressData] = useState(null);

  // Monetization Modal State
  const [showMonetizationModal, setShowMonetizationModal] = useState(false);
  const [isMonetized, setIsMonetized] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("artistMonetized") === "true";
    }
    return false;
  });

  // Save selected tab to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dashboardSelectedTab", selectedTab);
    }
  }, [selectedTab]);

  // Also save upload page state if needed
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (currentUploadPage) {
        localStorage.setItem("currentUploadPage", currentUploadPage);
      } else {
        localStorage.removeItem("currentUploadPage");
      }
    }
  }, [currentUploadPage]);

  // Load upload page state on initial render
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUploadPage = localStorage.getItem("currentUploadPage");
      const validUploadPages = ["single", "album"];
      if (validUploadPages.includes(savedUploadPage)) {
        setCurrentUploadPage(savedUploadPage);
      }
    }
  }, []);

  // Check if artist is monetized on component mount
  useEffect(() => {
    const checkMonetizationStatus = async () => {
      try {
        // Fetch monetization status from Redux
        const result = await dispatch(getMyMonetizationSetupStatus());
        
        // Check both Redux state and localStorage
        const reduxMonetized = result?.payload?.isMonetizationComplete;
        const localMonetized = localStorage.getItem("artistMonetized") === "true";
        
        // Determine final monetization status
        const finalMonetizedStatus = reduxMonetized || localMonetized;
        
        // Update state
        setIsMonetized(finalMonetizedStatus);

        // अगर artist monetized नहीं है, तो modal show करें
        if (!finalMonetizedStatus) {
          // Small delay to ensure component is fully mounted
          setTimeout(() => {
            setShowMonetizationModal(true);
          }, 500);
        }
      } catch (error) {
        console.error("Error checking monetization status:", error);
      }
    };

    checkMonetizationStatus();
  }, [dispatch]);

  // Handle tab change
  const handleTabChange = (tab) => {
    // If artist is not monetized, don't allow tab changes (except profile)
    if (!isMonetized && tab !== "profile") {
      alert("Please complete monetization setup to access this feature");
      setShowMonetizationModal(true);
      return;
    }

    // If switching tabs while in upload mode, cancel upload first
    if (currentUploadPage) {
      handleCancelUpload();
    }
    setSelectedTab(tab);
  };

  // Handle monetization completion
  const handleMonetizationComplete = () => {
    setIsMonetized(true);
    localStorage.setItem("artistMonetized", "true");
    setShowMonetizationModal(false);
    // setSelectedTab("profile"); // Automatically switch to dashboard after monetization
  };

  // Handle upload type selection
  const handleUploadTypeSelect = (type) => {
    // Check if artist is monetized before allowing uploads
    if (!isMonetized) {
      alert("Please complete monetization setup to upload content");
      setShowMonetizationModal(true);
      return;
    }

    if (type === "album") {
      setShowUploadModal(true);
    } else {
      setCurrentUploadPage(type);
      dispatch(resetAllAlbumState()); // Reset album state for fresh start
      dispatch(resetUploadState()); // Reset song state
    }
  };

  // Handle upload cancellation
  const handleCancelUpload = () => {
    if (currentUploadPage === "album") {
      // Confirm before cancelling album upload (as it may have progress)
      const confirmCancel = window.confirm(
        "Are you sure you want to cancel? Any unsaved progress will be lost."
      );
      if (!confirmCancel) return;

      // Reset all album and song states
      dispatch(resetAllAlbumState());
      dispatch(resetUploadState());
    } else {
      dispatch(resetUploadState());
    }

    setCurrentUploadPage(null);
    setShowUploadModal(false);
  };

  // Handle batch upload progress
  const handleBatchProgress = (data) => {
    setBatchProgressData(data);
    setShowBatchProgress(true);
  };

  // Close batch progress modal
  const handleCloseBatchProgress = () => {
    setShowBatchProgress(false);
    setBatchProgressData(null);
  };

  // Handle upload completion
  const handleUploadComplete = () => {

    // Reset and go back to uploads tab
    dispatch(resetAllAlbumState());
    dispatch(resetUploadState());
    setCurrentUploadPage(null);
    setSelectedTab("uploads");
  };

  // Listen for escape key to cancel upload
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape" && currentUploadPage) {
        handleCancelUpload();
      }
    };

    if (currentUploadPage) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [currentUploadPage]);

  return (
    <BackgroundWrapper>
      <div className="flex min-h-screen">
        <Sidebar
          selectedTab={selectedTab}
          setSelectedTab={handleTabChange}
          currentUploadPage={currentUploadPage}
          onUploadSelect={handleUploadTypeSelect}
          isMonetized={isMonetized}
        />
        <div className="flex-grow w-full flex flex-col">
          <Topbar
            selectedTab={selectedTab}
            currentUploadPage={currentUploadPage}
            setCurrentUploadPage={setCurrentUploadPage}
            onUploadSelect={handleUploadTypeSelect}
            isMonetized={isMonetized}
          />
          <main className="flex-grow relative">
            {currentUploadPage === "single" ? (
              <SingleUpload
                onCancel={handleCancelUpload}
                onComplete={handleUploadComplete}
              />
            ) : currentUploadPage === "album" ? (
              <AlbumUpload
                onCancel={handleCancelUpload}
                onComplete={handleUploadComplete}
                onBatchProgress={handleBatchProgress}
              />
            ) : (
              tabComponents[selectedTab]
            )}
          </main>
        </div>

        {/* Mandatory Monetization Modal */}
        <MonetizationModal
          isOpen={showMonetizationModal}
          onClose={() => {
            // Allow closing only if monetized
            if (isMonetized) {
              setShowMonetizationModal(false);
            }
          }}
          onComplete={handleMonetizationComplete}
          isMandatory={!isMonetized} // Pass isMandatory prop
        />

        {/* Upload Type Selection Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl text-white mb-2">Choose Upload Type</h2>
              <p className="text-gray-400 mb-6">
                Select what you want to upload
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setCurrentUploadPage("single");
                  }}
                  className="w-full p-6 border-2 border-blue-700 rounded-xl hover:border-blue-500 hover:bg-blue-900/10 transition-all text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <span className="text-blue-400 text-2xl">♪</span>
                    </div>
                    <div>
                      <h3 className="text-white text-lg mb-1">Single Track</h3>
                      <p className="text-gray-400 text-sm">
                        Upload one individual song
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setCurrentUploadPage("album");
                    dispatch(resetAllAlbumState());
                  }}
                  className="w-full p-6 border-2 border-purple-700 rounded-xl hover:border-purple-500 hover:bg-purple-900/10 transition-all text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <span className="text-purple-400 text-2xl">🎵</span>
                    </div>
                    <div>
                      <h3 className="text-white text-lg mb-1">Album</h3>
                      <p className="text-gray-400 text-sm">
                        Create album with multiple songs
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-6 py-2 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Batch Upload Progress Modal */}
        {showBatchProgress && batchProgressData && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-lg w-full mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white text-xl">Uploading Album Songs</h3>
                <button
                  onClick={handleCloseBatchProgress}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300">
                    {batchProgressData.currentIndex + 1} of{" "}
                    {batchProgressData.totalSongs} songs
                  </span>
                  <span className="text-blue-400 font-mono">
                    {batchProgressData.currentProgress}%
                  </span>
                </div>

                <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                    style={{
                      width: `${
                        (batchProgressData.currentIndex /
                          batchProgressData.totalSongs) *
                          100 +
                        batchProgressData.currentProgress /
                          batchProgressData.totalSongs
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-900/30 rounded flex items-center justify-center">
                      <span className="text-blue-400">♪</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {batchProgressData.currentSongName}
                      </p>
                      <p className="text-gray-400 text-sm">
                        Uploading song {batchProgressData.currentIndex + 1} of{" "}
                        {batchProgressData.totalSongs}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-blue-400 text-lg">
                      {batchProgressData.currentProgress}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-800">
                <p className="text-gray-400 text-sm text-center">
                  Please don't close this window while upload is in progress.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </BackgroundWrapper>
  );
}