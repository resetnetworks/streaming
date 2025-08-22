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

import { useRazorpayPayment } from "../hooks/useRazorpayPayment";
import { fetchAllArtists, fetchRandomArtistWithSongs } from "../features/artists/artistsSlice";
import { resetPaymentState } from "../features/payments/paymentSlice";

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Modal state
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);
  const [modalArtist, setModalArtist] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [modalData, setModalData] = useState(null);

  // Custom hooks
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

  return (
    <>
      <Helmet>
        <title>MUSICRESET - RESET MUSIC STREAMING PLATFORM</title>
        <meta name="robots" content="index, follow" />
        <meta name="description" content="Listen to relaxing ambient, instrumental, and experimental music on Reset. Enjoy music without lyrics, perfect for focus, study, and calm." />
      </Helmet>
      
      <UserHeader />
      <SkeletonTheme baseColor="#1f2937" highlightColor="#374151">
        <div className="text-white px-4 py-2 flex flex-col gap-4">
          <NewTracksSection
            onPurchaseClick={handlePurchaseClick}
            onSubscribeRequired={(artist, type, data) => {
              setModalArtist(artist);
              setModalType(type);
              setModalData(data);
              setSubscribeModalOpen(true);
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
              setModalArtist(artist);
              setModalType(type);
              setModalData(data);
              setSubscribeModalOpen(true);
            }}
            processingPayment={processingPayment}
            paymentLoading={paymentLoading}
          />

          <AllTracksSection />
        </div>

        <LoadingOverlay 
          show={processingPayment || paymentLoading} 
        />
      </SkeletonTheme>

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
