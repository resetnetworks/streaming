// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import PageSEO from "../components/PageSeo/PageSEO";

import UserHeader from "../components/user/UserHeader";
import NewTracksSection from "../components/user/Home/NewTracksSection";
import AlbumsSection from "../components/user/Home/AlbumsSection";
import SimilarArtistSection from "../components/user/Home/SimilarArtistSection";
import AllTracksSection from "../components/user/Home/AllTracksSection";
import LoadingOverlay from "../components/user/Home/LoadingOverlay";
import SubscribeModal from "../components/user/SubscribeModal";
import MatchingGenreSection from "../components/user/Home/MatchingGenreSection";
import PaymentMethodModal from "../components/user/PaymentMethodModal";

// ✅ Updated import to use new hook with currency support
import { usePaymentGateway } from "../hooks/usePaymentGateway";
import { fetchAllArtists, fetchRandomArtistWithSongs } from "../features/artists/artistsSlice";
import { resetPaymentState } from "../features/payments/paymentSlice";
import GenreSection from "../components/user/Home/GenreSection";
import ArtistSection from "../components/user/Home/ArtistSection";
import { hasArtistSubscriptionInPurchaseHistory } from "../utills/subscriptions";

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);
  const [modalArtist, setModalArtist] = useState(null);
  const [modalType, setModalType] = useState(null); // "play" | "purchase"
  const [modalData, setModalData] = useState(null); // song or item

  // ✅ Separate loading states for actual payment processing
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // ✅ Updated to use new payment gateway hook with currency support
  const { 
    showPaymentOptions,
    pendingPayment,
    openPaymentOptions,
    handlePaymentMethodSelect: originalHandlePaymentMethodSelect,
    closePaymentOptions,
    getPaymentDisplayInfo
  } = usePaymentGateway();

  const currentUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(fetchAllArtists());
    dispatch(fetchRandomArtistWithSongs({ page: 1, limit: 10 }));
    dispatch(resetPaymentState());
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

  // ✅ Updated purchase handler to support currency data
  const handlePurchaseClick = (item, itemType, currencyData = null) => {
    // Reset processing states before opening payment modal
    setProcessingPayment(false);
    setPaymentLoading(false);
    openPaymentOptions(item, itemType, currencyData);
  };

  // ✅ Wrapper for payment method selection with loading states
  const handlePaymentMethodSelect = async (gateway) => {
    try {
      setProcessingPayment(true);
      setPaymentLoading(true);
      
      // Call the original payment method select
      await originalHandlePaymentMethodSelect(gateway);
      
    } catch (error) {
      console.error('Payment method selection error:', error);
    } finally {
      // Reset loading states after payment processing
      setTimeout(() => {
        setProcessingPayment(false);
        setPaymentLoading(false);
      }, 1000);
    }
  };

  // ✅ Enhanced close handler
  const handleClosePaymentOptions = () => {
    setProcessingPayment(false);
    setPaymentLoading(false);
    closePaymentOptions();
  };

  const handleSubscribeDecision = (artist, type, data) => {
    const alreadySubscribed = hasArtistSubscriptionInPurchaseHistory(currentUser, artist);

    if (type === "purchase") {
      if (alreadySubscribed) {
        // Pass the correct type for songs in NewTracks
        handlePurchaseClick(data, "song");
        return;
      }
      setModalArtist(artist);
      setModalType(type);
      setModalData(data);
      setSubscribeModalOpen(true);
      return;
    }

    if (type === "play") {
      if (alreadySubscribed) {
        setSubscribeModalOpen(false);
        return;
      }
      setModalArtist(artist);
      setModalType(type);
      setModalData(data);
      setSubscribeModalOpen(true);
      return;
    }

    setModalArtist(artist);
    setModalType(type);
    setModalData(data);
    setSubscribeModalOpen(true);
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
          <AlbumsSection
            onPurchaseClick={handlePurchaseClick} // Now supports currency data
            processingPayment={processingPayment}
            paymentLoading={paymentLoading}
          />

          <GenreSection />

          <ArtistSection
            title="Featured Artists"
            currentUser={currentUser}
            onSubscribeRequired={(artist, type, data) => handleSubscribeDecision(artist, type, data)}
            onNavigateArtist={navigateToArtistDirect}
          />

          {/* Matching Genre */}
          <MatchingGenreSection
            onPurchaseClick={handlePurchaseClick}
            onSubscribeRequired={(artist, type, data) => {
              handleSubscribeDecision(artist, type, data);
            }}
            processingPayment={processingPayment}
            paymentLoading={paymentLoading}
          />

          <SimilarArtistSection
            onPurchaseClick={handlePurchaseClick}
            onSubscribeRequired={(artist, type, data) => {
              handleSubscribeDecision(artist, type, data);
            }}
            processingPayment={processingPayment}
            paymentLoading={paymentLoading}
          />

          <AllTracksSection
            onPurchaseClick={handlePurchaseClick}
            onSubscribeRequired={(artist, type, data) => {
              handleSubscribeDecision(artist, type, data);
            }}
            processingPayment={processingPayment}
            paymentLoading={paymentLoading}
          />
        </div>

        {/* ✅ Only show loading overlay when actually processing payment */}
        <LoadingOverlay show={processingPayment && paymentLoading} />
      </SkeletonTheme>

      <SubscribeModal
        open={subscribeModalOpen}
        artist={modalArtist}
        type={modalType}
        itemData={modalData}
        onClose={handleSubscribeModalClose}
        onNavigate={handleNavigateToArtist}
      />

      {/* ✅ Enhanced Payment Method Selection Modal with proper handlers */}
      <PaymentMethodModal
        open={showPaymentOptions}
        onClose={handleClosePaymentOptions} // Use enhanced close handler
        onSelectMethod={handlePaymentMethodSelect} // Use wrapper with loading states
        item={pendingPayment?.item}
        itemType={pendingPayment?.itemType}
        currencyData={pendingPayment?.currencyData} // ✅ Pass currency data
        getPaymentDisplayInfo={getPaymentDisplayInfo} // ✅ Pass helper function
      />
    </>
  );
};

export default Home;
