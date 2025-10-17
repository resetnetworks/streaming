import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import UserHeader from "../components/user/UserHeader";
import ArtistHeroSection from "../components/user/Artist/ArtistHeroSection";
import ArtistSongsSection from "../components/user/Artist/ArtistSongsSection";
import ArtistAlbumsSection from "../components/user/Artist/ArtistAlbumsSection";
import ArtistSinglesSection from "../components/user/Artist/ArtistSinglesSection";
import ArtistAboutSection from "../components/user/Artist/ArtistAboutSection";
import SubscriptionMethodModal from "../components/user/SubscriptionMethodModal";
import PaymentMethodModal from "../components/user/PaymentMethodModal";
import SubscribeModal from "../components/user/SubscribeModal";
import PaymentErrorNotification from "../components/user/Artist/PaymentErrorNotification";

import { 
  fetchArtistBySlug,
  fetchSubscriberCount,
  clearSelectedArtist, // ✅ Add this import
} from "../features/artists/artistsSlice";
import { selectSelectedArtist } from "../features/artists/artistsSelectors";
import { fetchUserSubscriptions } from "../features/payments/userPaymentSlice";
import { resetPaymentState } from "../features/payments/paymentSlice";
import { selectPaymentError } from "../features/payments/paymentSelectors";
import { getAlbumsByArtist } from "../features/albums/albumsSlice";
import { fetchSongsByArtist } from "../features/songs/songSlice";
import { useSubscriptionPayment } from "../hooks/useSubscriptionPayment";
import { usePaymentGateway } from "../hooks/usePaymentGateway";
import { hasArtistSubscriptionInPurchaseHistory } from "../utills/subscriptions";

const Artist = () => {
  const { artistId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const heroSectionRef = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);
  const [modalArtist, setModalArtist] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [modalData, setModalData] = useState(null);
  
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  
  const artist = useSelector(selectSelectedArtist);
  const paymentError = useSelector(selectPaymentError);
  const currentUser = useSelector((state) => state.auth.user);
  
  const {
    showSubscriptionOptions,
    pendingSubscription,
    openSubscriptionOptions,
    handleSubscriptionMethodSelect,
    closeSubscriptionOptions
  } = useSubscriptionPayment();
  
  const {
    showPaymentOptions,
    pendingPayment,
    openPaymentOptions,
    handlePaymentMethodSelect: originalHandlePaymentMethodSelect,
    closePaymentOptions,
    getPaymentDisplayInfo
  } = usePaymentGateway();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );
    if (heroSectionRef.current) {
      observer.observe(heroSectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // ✅ Clear previous artist data immediately when artistId changes
  useEffect(() => {
    dispatch(clearSelectedArtist());
  }, [artistId, dispatch]);

  useEffect(() => {
    if (artistId) {
      dispatch(fetchArtistBySlug(artistId));
      dispatch(fetchUserSubscriptions());
      dispatch(getAlbumsByArtist({ artistId, page: 1, limit: 10 }));
      dispatch(fetchSongsByArtist({ artistId, page: 1, limit: 10 }));
    }
  }, [dispatch, artistId]);

  useEffect(() => {
    if (artist?._id) {
      dispatch(fetchSubscriberCount(artist._id));
    }
  }, [dispatch, artist?._id]);

  useEffect(() => {
    dispatch(resetPaymentState());
    return () => {
      dispatch(resetPaymentState());
    };
  }, [dispatch]);

  const handleSubscribeModalClose = () => {
    setSubscribeModalOpen(false);
    setModalType(null);
    setModalArtist(null);
    setModalData(null);
  };

  const handleNavigateToArtist = () => {
    handleSubscribeModalClose();
  };

  const handleCloseSubscriptionOptions = () => {
    closeSubscriptionOptions();
    setSubscriptionLoading(false);
  };

  const handlePurchaseClick = (item, itemType, currencyData = null) => {
    setProcessingPayment(false);
    setPaymentLoading(false);
    openPaymentOptions(item, itemType, currencyData);
  };

  const handlePaymentMethodSelect = async (gateway) => {
    try {
      setProcessingPayment(true);
      setPaymentLoading(true);
      
      await originalHandlePaymentMethodSelect(gateway);
      
    } catch (error) {
      console.error('Payment method selection error:', error);
    } finally {
      setTimeout(() => {
        setProcessingPayment(false);
        setPaymentLoading(false);
      }, 1000);
    }
  };

  const handleClosePaymentOptions = () => {
    setProcessingPayment(false);
    setPaymentLoading(false);
    closePaymentOptions();
  };

  const handleSubscribeDecision = (artist, type, data) => {
    const alreadySubscribed = hasArtistSubscriptionInPurchaseHistory(currentUser, artist);

    if (type === "purchase") {
      if (alreadySubscribed) {
        const itemType = data.type || "song";
        handlePurchaseClick(data, itemType);
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
      <UserHeader />
      <SkeletonTheme baseColor="#1f2937" highlightColor="#374151">
        <div ref={heroSectionRef}>
          <ArtistHeroSection
            artist={artist}
            artistId={artistId}
            currentUser={currentUser}
            isInView={isInView}
            openSubscriptionOptions={openSubscriptionOptions}
            subscriptionLoading={subscriptionLoading}
            setSubscriptionLoading={setSubscriptionLoading}
          />
        </div>
        
        <ArtistSongsSection 
          artistId={artistId} 
          artist={artist}
          onSubscribeRequired={(artist, type, data) => handleSubscribeDecision(artist, type, data)}
        />
        
        <ArtistAlbumsSection
          artistId={artistId}
          currentUser={currentUser}
          onPurchaseClick={handlePurchaseClick}
          onSubscribeRequired={(artist, type, data) => handleSubscribeDecision(artist, type, data)}
          processingPayment={processingPayment}
          paymentLoading={paymentLoading}
        />
        
        <ArtistSinglesSection
          artistId={artistId}
          currentUser={currentUser}
          onPurchaseClick={handlePurchaseClick}
          onSubscribeRequired={(artist, type, data) => handleSubscribeDecision(artist, type, data)}
          processingPayment={processingPayment}
          paymentLoading={paymentLoading}
        />
        
        <ArtistAboutSection
          artist={artist}
          artistId={artistId}
          currentUser={currentUser}
          openSubscriptionOptions={openSubscriptionOptions}
          subscriptionLoading={subscriptionLoading}
          setSubscriptionLoading={setSubscriptionLoading}
        />
        
        <PaymentErrorNotification 
          error={paymentError}
          onDismiss={() => dispatch(resetPaymentState())}
        />
        
        <SubscriptionMethodModal
          open={showSubscriptionOptions}
          onClose={handleCloseSubscriptionOptions}
          onSelectMethod={handleSubscriptionMethodSelect}
          artist={pendingSubscription?.artist}
          cycle={pendingSubscription?.cycle}
          subscriptionPrice={pendingSubscription?.subscriptionPrice}
        />
        
        <PaymentMethodModal
          open={showPaymentOptions}
          onClose={handleClosePaymentOptions}
          onSelectMethod={handlePaymentMethodSelect}
          item={pendingPayment?.item}
          itemType={pendingPayment?.itemType}
          currencyData={pendingPayment?.currencyData}
          getPaymentDisplayInfo={getPaymentDisplayInfo}
        />

        <SubscribeModal
          open={subscribeModalOpen}
          artist={modalArtist}
          type={modalType}
          itemData={modalData}
          onClose={handleSubscribeModalClose}
          onNavigate={handleNavigateToArtist}
        />
      </SkeletonTheme>
    </>
  );
};

export default Artist;
