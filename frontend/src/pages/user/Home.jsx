// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import PageSEO from "../../components/PageSeo/PageSEO";

import UserHeader from "../../components/user/UserHeader";
import AlbumsSection from "../../components/user/Home/AlbumsSection";
import SimilarArtistSection from "../../components/user/Home/SimilarArtistSection";
import AllTracksSection from "../../components/user/Home/AllTracksSection";
import SubscribeModal from "../../components/user/SubscribeModal";
import MatchingGenreSection from "../../components/user/Home/MatchingGenreSection";
import RoleUpdateModal from "../../components/user/RoleUpdateModal";
import { fetchAllArtists, fetchRandomArtistWithSongs } from "../../features/artists/artistsSlice";
import GenreSection from "../../components/user/Home/GenreSection";
import ArtistSection from "../../components/user/Home/ArtistSection";

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  

  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);
  const [modalArtist, setModalArtist] = useState(null);
  const [modalType, setModalType] = useState(null); // "play" | "purchase"
  const [modalData, setModalData] = useState(null); // song or item

  // ✅ NEW: State for role update modal
  const [roleUpdateModalOpen, setRoleUpdateModalOpen] = useState(false);

  const currentUser = useSelector((state) => state.auth.user);


  useEffect(() => {
    dispatch(fetchAllArtists());
    dispatch(fetchRandomArtistWithSongs({ page: 1, limit: 10 }));
  }, [dispatch]);

  const handleSubscribeModalClose = () => {
    setSubscribeModalOpen(false);
    setModalType(null);
    setModalArtist(null);
    setModalData(null);
  };

  const handleNavigateToArtist = () => {
    handleSubscribeModalClose();
    if (modalArtist?.slug) {
      navigate(`/artist/${modalArtist.slug}`);
    }
  };

  const navigateToArtistDirect = (artist) => {
    if (artist?.slug) navigate(`/artist/${artist.slug}`);
  };

  // ✅ NEW: Callback for when role update error occurs
  const handleRoleUpdateError = () => {
    setRoleUpdateModalOpen(true);
  };


  return (
    <>
<PageSEO
  title="Reset Music – Discover Tracks, Albums & Stream Effortlessly"
  description="Stream new tracks, albums, and curated playlists. Discover featured artists and genres. Enjoy exclusive music as a Reset Music member."
  canonicalUrl="https://musicreset.com/home"
  structuredData={{
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Reset Music Home",
    "description": "Protected streaming dashboard for Reset Music. Access tracks, albums, playlists, and featured artists as a registered member.",
    "url": "https://musicreset.com/home",
    "mainEntity": {
      "@type": "WebApplication",
      "name": "Reset Music Member Dashboard",
      "applicationCategory": "Music Streaming",
      "operatingSystem": "Web Browser",
      "featureList": [
        "Stream tracks and albums",
        "Access curated playlists",
        "Discover top genres",
        "Manage music subscriptions",
        "Personalized recommendations"
      ]
    },
    "publisher": {
      "@type": "Organization",
      "name": "Reset Music",
      "url": "https://musicreset.com/home"
    },
    "potentialAction": {
      "@type": "ViewAction",
      "target": "https://musicreset.com/",
      "name": "Open Member Streaming Dashboard"
    }
  }}
  noIndex={true}
/>


      <UserHeader />
      <SkeletonTheme baseColor="#1f2937" highlightColor="#374151">
        <div className="text-white px-4 py-2 flex flex-col gap-4">

          {/* ✅ Updated AlbumsSection with proper loading states */}
          <AlbumsSection />

          <GenreSection />

          <ArtistSection
            title="Featured Artists"
            currentUser={currentUser}
            onNavigateArtist={navigateToArtistDirect}
          />

          {/* Matching Genre */}
          {currentUser && (
            <MatchingGenreSection
              onRoleUpdateError={handleRoleUpdateError} // ✅ NEW: Pass callback
            />
          )}

          <SimilarArtistSection
          />

          <AllTracksSection
          />
        </div>
      </SkeletonTheme>

      <SubscribeModal
        open={subscribeModalOpen}
        artist={modalArtist}
        type={modalType}
        itemData={modalData}
        onClose={handleSubscribeModalClose}
        onNavigate={handleNavigateToArtist}
      />

      {/* ✅ NEW: Role Update Modal */}
      <RoleUpdateModal open={roleUpdateModalOpen} />
    </>
  );
};

export default Home;