import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom"; // ✅ Add useNavigate
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
import SubscribeModal from "../components/user/SubscribeModal"; // ✅ Import SubscribeModal
import PaymentErrorNotification from "../components/user/Artist/PaymentErrorNotification";

import { 
  fetchArtistBySlug,
  fetchSubscriberCount,
} from "../features/artists/artistsSlice";
import { selectSelectedArtist } from "../features/artists/artistsSelectors";
import { fetchUserSubscriptions } from "../features/payments/userPaymentSlice";
import { resetPaymentState } from "../features/payments/paymentSlice";
import { selectPaymentError } from "../features/payments/paymentSelectors";
import { getAlbumsByArtist } from "../features/albums/albumsSlice";
import { fetchSongsByArtist } from "../features/songs/songSlice";
import { useSubscriptionPayment } from "../hooks/useSubscriptionPayment";
import { usePaymentGateway } from "../hooks/usePaymentGateway";
import { hasArtistSubscriptionInPurchaseHistory } from "../utills/subscriptions"; // ✅ Import subscription utility

const Artist = () => {
  const { artistId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate(); // ✅ Add navigate hook
  const heroSectionRef = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  
  // ✅ Add SubscribeModal states
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);
  const [modalArtist, setModalArtist] = useState(null);
  const [modalType, setModalType] = useState(null); // "play" | "purchase"
  const [modalData, setModalData] = useState(null); // song or item
  
  // ✅ Add loading states for payments
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
  
  // ✅ Updated to use payment gateway hook with currency support
  const {
    showPaymentOptions,
    pendingPayment,
    openPaymentOptions,
    handlePaymentMethodSelect: originalHandlePaymentMethodSelect,
    closePaymentOptions,
    getPaymentDisplayInfo // ✅ Add this helper function
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

  // ✅ Add SubscribeModal handlers
  const handleSubscribeModalClose = () => {
    setSubscribeModalOpen(false);
    setModalType(null);
    setModalArtist(null);
    setModalData(null);
  };

  const handleNavigateToArtist = () => {
    handleSubscribeModalClose();
    // Since we're already on the artist page, we can scroll to subscription section
    // or just close the modal and let user subscribe via hero section
  };

  const handleCloseSubscriptionOptions = () => {
    closeSubscriptionOptions();
    setSubscriptionLoading(false);
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

  // ✅ Add subscription decision handler
  const handleSubscribeDecision = (artist, type, data) => {
    const alreadySubscribed = hasArtistSubscriptionInPurchaseHistory(currentUser, artist);

    if (type === "purchase") {
      if (alreadySubscribed) {
        // User is already subscribed, proceed with purchase
        const itemType = data.type || "song";
        handlePurchaseClick(data, itemType);
        return;
      }
      // User is not subscribed, show subscribe modal
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
        
        {/* ✅ Updated ArtistSongsSection with subscription handler */}
        <ArtistSongsSection 
          artistId={artistId} 
          artist={artist}
          onSubscribeRequired={(artist, type, data) => handleSubscribeDecision(artist, type, data)}
        />
        
        {/* ✅ Updated ArtistAlbumsSection with subscription handler */}
        <ArtistAlbumsSection
          artistId={artistId}
          currentUser={currentUser}
          onPurchaseClick={handlePurchaseClick}
          onSubscribeRequired={(artist, type, data) => handleSubscribeDecision(artist, type, data)}
          processingPayment={processingPayment}
          paymentLoading={paymentLoading}
        />
        
        {/* ✅ Updated ArtistSinglesSection with subscription handler */}
        <ArtistSinglesSection
          artistId={artistId}
          currentUser={currentUser}
          onPurchaseClick={handlePurchaseClick}
          onSubscribeRequired={(artist, type, data) => handleSubscribeDecision(artist, type, data)} // ✅ Add this
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
        
        {/* ✅ Enhanced PaymentMethodModal with currency data support */}
        <PaymentMethodModal
          open={showPaymentOptions}
          onClose={handleClosePaymentOptions}
          onSelectMethod={handlePaymentMethodSelect}
          item={pendingPayment?.item}
          itemType={pendingPayment?.itemType}
          currencyData={pendingPayment?.currencyData}
          getPaymentDisplayInfo={getPaymentDisplayInfo}
        />

        {/* ✅ Add SubscribeModal */}
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
