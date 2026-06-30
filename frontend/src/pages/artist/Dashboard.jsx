import React, { useState, useEffect } from "react";
import Sidebar from "../../components/artist/dashboard/Sidebar";

import HomeComponent from "../../components/artist/home/HomeComponent";
import UploadsComponent from "../../components/artist/upload/UploadsComponent";
import ArtistDashboardRevenue from "../../components/artist/revenue/ArtistDashboardRevenue";
import ProfileComponent from "../../components/artist/profile/ProfileComponent";
import Topbar from "../../components/artist/dashboard/Topbar";
import SingleUpload from "./SingleUpload";
import AlbumUpload from "./AlbumUpload";
import MixUpload from "./MixUpload";
import { useDispatch } from "react-redux";
import MonetizationModal from "../../components/artist/monetization/MonitizationModal";
import { getMyMonetizationSetupStatus } from "../../features/monetization/monetizationSlice";
import { useQueryClient } from "@tanstack/react-query";
import { useMyWorkspaces } from "../../hooks/api/useWorkspace";
import TeamComponent from "../../components/artist/team/TeamComponent";

// Static tab components (no props needed)
const tabComponents = {
  profile: <ProfileComponent />,
  dashboard: <HomeComponent />,
  revenue: <ArtistDashboardRevenue />,
};

export default function Dashboard() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { data: workspaces = [] } = useMyWorkspaces();
  const activeWorkspace = React.useMemo(() => {
    if (!workspaces || workspaces.length === 0) return null;
    if (typeof window !== "undefined") {
      const savedId = localStorage.getItem("activeWorkspaceId");
      const matched = workspaces.find((w) => w.workspaceId === savedId);
      if (matched) return matched;
    }
    return workspaces[0];
  }, [workspaces]);

  // Restore last active tab from localStorage, default to "profile"
  const [selectedTab, setSelectedTab] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTab = localStorage.getItem("dashboardSelectedTab");
      const validTabs = ["profile", "dashboard", "uploads", "revenue", "team"];
      return validTabs.includes(savedTab) ? savedTab : "profile";
    }
    return "profile";
  });

  const [currentUploadPage, setCurrentUploadPage] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [_showBatchProgress, setShowBatchProgress] = useState(false);
  const [_batchProgressData, setBatchProgressData] = useState(null);

  // After upload completes, signal UploadsComponent which tab to show
  const [uploadedTabToShow, setUploadedTabToShow] = useState(null);

  // Monetization state — restored from localStorage for instant UI
  const [showMonetizationModal, setShowMonetizationModal] = useState(false);
  const [isMonetized, setIsMonetized] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("artistMonetized") === "true";
    }
    return false;
  });

  // Persist active tab to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dashboardSelectedTab", selectedTab);
    }
  }, [selectedTab]);

  // Persist active workspace ID to localStorage for axios headers
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (activeWorkspace?.workspaceId) {
        localStorage.setItem("activeWorkspaceId", activeWorkspace.workspaceId);
      } else {
        localStorage.removeItem("activeWorkspaceId");
      }
    }
  }, [activeWorkspace]);

  // Persist upload page so refresh doesn't lose progress
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (currentUploadPage) {
        localStorage.setItem("currentUploadPage", currentUploadPage);
      } else {
        localStorage.removeItem("currentUploadPage");
      }
    }
  }, [currentUploadPage]);

  // Restore upload page on initial render
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUploadPage = localStorage.getItem("currentUploadPage");
      const validUploadPages = ["single", "album", "mix"];
      if (validUploadPages.includes(savedUploadPage)) {
        setCurrentUploadPage(savedUploadPage);
      }
    }
  }, []);

  // Verify monetization status from server on mount
  useEffect(() => {
    const checkMonetizationStatus = async () => {
      // Bypass if user is collaborator (not owner)
      if (activeWorkspace && activeWorkspace.role !== "owner") {
        setIsMonetized(true);
        return;
      }
      try {
        const result = await dispatch(getMyMonetizationSetupStatus());
        const serverMonetized = result?.payload?.isMonetizationComplete;
        const localMonetized = localStorage.getItem("artistMonetized") === "true";
        const finalStatus = serverMonetized || localMonetized;

        setIsMonetized(finalStatus);

        if (!finalStatus) {
          setTimeout(() => setShowMonetizationModal(true), 500);
        }
      } catch (error) {
        console.error("Monetization check failed:", error);
      }
    };

    checkMonetizationStatus();
  }, [dispatch, activeWorkspace]);

  // Handle sidebar/topbar tab navigation
  const handleTabChange = (tab) => {
    if (!isMonetized && tab !== "profile") {
      alert("Please complete monetization setup to access this feature");
      setShowMonetizationModal(true);
      return;
    }

    // Cancel any active upload before switching tabs
    if (currentUploadPage) {
      handleCancelUpload();
    }
    setSelectedTab(tab);
  };

  // Mark monetization as complete and refresh profile data
  const handleMonetizationComplete = () => {
    setIsMonetized(true);
    localStorage.setItem("artistMonetized", "true");
    queryClient.invalidateQueries({ queryKey: ["artist-dashboard", "profile"] });
    setShowMonetizationModal(false);
  };

  // Begin an upload flow (single / album / mix)
  const handleUploadTypeSelect = (type) => {
    if (!isMonetized) {
      alert("Please complete monetization setup to upload content");
      setShowMonetizationModal(true);
      return;
    }

    if (type === "album") {
      setShowUploadModal(true);
    } else {
      setCurrentUploadPage(type);
    }
  };

  // Cancel an in-progress upload and clean up state
  const handleCancelUpload = () => {
    if (currentUploadPage === "album") {
      const confirmed = window.confirm(
        "Are you sure you want to cancel? Any unsaved progress will be lost."
      );
      if (!confirmed) return;
    }

    setCurrentUploadPage(null);
    setShowUploadModal(false);
  };

  /**
   * Called by SingleUpload / AlbumUpload / MixUpload on success.
   * uploadType: "single" | "album" | "mix"
   * Navigates to the uploads tab and signals which sub-tab to activate.
   */
  const handleUploadComplete = (uploadType) => {
    setCurrentUploadPage(null);
    setSelectedTab("uploads");
    // "single" and "mix" both belong to the "songs" tab
    setUploadedTabToShow(uploadType === "album" ? "albums" : "songs");
  };

  // Batch progress handlers for album multi-song uploads
  const handleBatchProgress = (data) => {
    setBatchProgressData(data);
    setShowBatchProgress(true);
  };

  const _handleCloseBatchProgress = () => {
    setShowBatchProgress(false);
    setBatchProgressData(null);
  };

  // Close upload modal on Escape key
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape" && currentUploadPage) {
        handleCancelUpload();
      }
    };

    if (currentUploadPage) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => document.removeEventListener("keydown", handleEscapeKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUploadPage]);

  // Render the correct content for the active tab
  const renderMainContent = () => {
    if (currentUploadPage === "single") {
      return (
        <SingleUpload
          onCancel={handleCancelUpload}
          onComplete={handleUploadComplete}
        />
      );
    }

    if (currentUploadPage === "album") {
      return (
        <AlbumUpload
          onCancel={handleCancelUpload}
          onComplete={handleUploadComplete}
          onBatchProgress={handleBatchProgress}
        />
      );
    }

    if (currentUploadPage === "mix") {
      return (
        <MixUpload
          onCancel={handleCancelUpload}
          onComplete={handleUploadComplete}
          onBatchProgress={handleBatchProgress}
        />
      );
    }

    // Uploads tab gets special props to auto-switch its internal tab
    if (selectedTab === "uploads") {
      return (
        <UploadsComponent
          defaultTab={uploadedTabToShow}
          onTabConsumed={() => setUploadedTabToShow(null)}
        />
      );
    }

    if (selectedTab === "team") {
      return <TeamComponent workspace={activeWorkspace} />;
    }

    return tabComponents[selectedTab] || null;
  };

  return (
    <>
      <div className="flex min-h-screen">
        <div className="flex-shrink-0">
          <Sidebar
            selectedTab={selectedTab}
            setSelectedTab={handleTabChange}
            currentUploadPage={currentUploadPage}
            onUploadSelect={handleUploadTypeSelect}
            isMonetized={isMonetized}
          />
        </div>

        <div className="flex-grow min-w-0 flex flex-col overflow-hidden">
          <Topbar
            selectedTab={selectedTab}
            currentUploadPage={currentUploadPage}
            setCurrentUploadPage={setCurrentUploadPage}
            onUploadSelect={handleUploadTypeSelect}
            isMonetized={isMonetized}
          />

          <main className="flex-grow relative">
            {renderMainContent()}
          </main>
        </div>

        {/* Monetization gate — blocks access until setup is complete */}
        <MonetizationModal
          isOpen={showMonetizationModal}
          onClose={() => {
            if (isMonetized) setShowMonetizationModal(false);
          }}
          onComplete={handleMonetizationComplete}
          isMandatory={!isMonetized}
        />

        {/* Upload type picker modal (shown before album flow starts) */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl text-white mb-2">Choose Upload Type</h2>
              <p className="text-gray-400 mb-6">Select what you want to upload</p>

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
                      <p className="text-gray-400 text-sm">Upload one individual song</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setCurrentUploadPage("album");
                  }}
                  className="w-full p-6 border-2 border-purple-700 rounded-xl hover:border-purple-500 hover:bg-purple-900/10 transition-all text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <span className="text-purple-400 text-2xl">🎵</span>
                    </div>
                    <div>
                      <h3 className="text-white text-lg mb-1">Album</h3>
                      <p className="text-gray-400 text-sm">Create album with multiple songs</p>
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

        {/* Batch upload progress modal for album songs */}
     
      </div>
    </>
  );
}