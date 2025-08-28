// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import UserHeader from "../components/user/UserHeader";
import NewTracksSection from "../components/user/Home/NewTracksSection";
import AlbumsSection from "../components/user/Home/AlbumsSection";
import SimilarArtistSection from "../components/user/Home/SimilarArtistSection";
import AllTracksSection from "../components/user/Home/AllTracksSection";
import LoadingOverlay from "../components/user/Home/LoadingOverlay";
import SubscribeModal from "../components/user/SubscribeModal";
import MatchingGenreSection from "../components/user/Home/MatchingGenreSection";

import { useRazorpayPayment } from "../hooks/useRazorpayPayment";
import { fetchAllArtists, fetchRandomArtistWithSongs } from "../features/artists/artistsSlice";
import { resetPaymentState } from "../features/payments/paymentSlice";
import GenreSection from "../components/user/Home/GenreSection";

import { hasArtistSubscriptionInPurchaseHistory } from "../utills/subscriptions";

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Modal state
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);
  const [modalArtist, setModalArtist] = useState(null);
  const [modalType, setModalType] = useState(null); // "play" | "purchase"
  const [modalData, setModalData] = useState(null); // song or item

  // Payment hook
  const { 
    handlePurchaseClick, 
    processingPayment, 
    paymentLoading 
  } = useRazorpayPayment();

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

  // Central decision: show modal or bypass based on purchaseHistory
  const handleSubscribeDecision = (artist, type, data) => {
    const alreadySubscribed = hasArtistSubscriptionInPurchaseHistory(currentUser, artist);

    if (type === "purchase") {
      if (alreadySubscribed) {
        // Directly go to payment flow when the user already has artist-subscription
        handlePurchaseClick(data);
        return;
      }
      // Not subscribed -> open modal to subscribe + purchase
      setModalArtist(artist);
      setModalType(type);
      setModalData(data);
      setSubscribeModalOpen(true);
      return;
    }

    if (type === "play") {
      if (alreadySubscribed) {
        // Allow play without modal
        setSubscribeModalOpen(false);
        return;
      }
      // Not subscribed -> show subscribe modal
      setModalArtist(artist);
      setModalType(type);
      setModalData(data);
      setSubscribeModalOpen(true);
      return;
    }

    // Fallback: open modal if type is unknown
    setModalArtist(artist);
    setModalType(type);
    setModalData(data);
    setSubscribeModalOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>MUSICRESET - RESET MUSIC STREAMING PLATFORM</title>
        <meta name="robots" content="index, follow" />
        <meta
          name="description"
          content="Listen to relaxing ambient, instrumental, and experimental music on Reset. Enjoy music without lyrics, perfect for focus, study, and calm."
        />
      </Helmet>

      <UserHeader />
      <SkeletonTheme baseColor="#1f2937" highlightColor="#374151">
        <div className="text-white px-4 py-2 flex flex-col gap-4">
          {/* New Tracks */}
          <NewTracksSection
            onPurchaseClick={handlePurchaseClick}
            onSubscribeRequired={(artist, type, data) => {
              handleSubscribeDecision(artist, type, data);
            }}
            processingPayment={processingPayment}
            paymentLoading={paymentLoading}
          />

          <GenreSection />

          {/* Matching Genre */}
          <MatchingGenreSection
            onPurchaseClick={handlePurchaseClick}
            onSubscribeRequired={(artist, type, data) => {
              handleSubscribeDecision(artist, type, data);
            }}
            processingPayment={processingPayment}
            paymentLoading={paymentLoading}
          />

          <AlbumsSection
            onPurchaseClick={handlePurchaseClick}
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

        {/* Shows spinner overlay while Razorpay is initializing/processing */}
        <LoadingOverlay show={processingPayment || paymentLoading} />
      </SkeletonTheme>

      {/* Central modal controlled from Home */}
      <SubscribeModal
        open={subscribeModalOpen}
        artist={modalArtist}
        type={modalType}
        itemData={modalData}
        onClose={handleSubscribeModalClose}
        onNavigate={handleNavigateToArtist}
      />
    </>
  );
};

export default Home;
