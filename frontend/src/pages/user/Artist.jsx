import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import PageSEO from "../../components/PageSeo/PageSEO";

import UserHeader from "../../components/user/UserHeader";
import ArtistHeroSection from "../../components/user/Artist/ArtistHeroSection";
import ArtistSongsSection from "../../components/user/Artist/ArtistSongsSection";
import ArtistAlbumsSection from "../../components/user/Artist/ArtistAlbumsSection";
import ArtistSinglesSection from "../../components/user/Artist/ArtistSinglesSection";
import ArtistAboutSection from "../../components/user/Artist/ArtistAboutSection";
import SubscriptionMethodModal from "../../components/user/SubscriptionMethodModal";
import PaymentMethodModal from "../../components/user/PaymentMethodModal";
import SubscribeModal from "../../components/user/SubscribeModal";

import { useArtist, useSubscriberCount } from "../../hooks/api/useArtists";
import { useArtistAlbumsSimple } from "../../hooks/api/useAlbums";
import { selectPaymentError } from "../../features/payments/paymentSelectors";
import { useSubscriptionPayment } from "../../hooks/useSubscriptionPayment";
import { usePaymentGateway } from "../../hooks/usePaymentGateway";
import { hasArtistSubscriptionInPurchaseHistory } from "../../utills/subscriptions";

const Artist = () => {
  const { artistId } = useParams();
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
  
  // React Query hooks
  const { 
    data: artist, 
    isLoading: isArtistLoading, 
    error: artistError 
  } = useArtist(artistId);
  
  const { 
    data: subscriberCountData 
  } = useSubscriberCount(artist?._id);
  
  // Simple query use करें infinite query की जगह
  const { 
    data: artistAlbumsData,
    isLoading: albumsLoading
  } = useArtistAlbumsSimple(artistId, 10);
  
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

  // Show loading state while fetching data
  if (isArtistLoading) {
    return (
      <>
        <UserHeader />
        <SkeletonTheme baseColor="#1f2937" highlightColor="#374151">
          <div className="min-h-screen">
            <div ref={heroSectionRef}>
              <ArtistHeroSection
                artist={null}
                artistId={artistId}
                currentUser={currentUser}
                isInView={isInView}
                openSubscriptionOptions={openSubscriptionOptions}
                subscriptionLoading={subscriptionLoading}
                setSubscriptionLoading={setSubscriptionLoading}
                isLoading={true}
              />
            </div>
            
            <ArtistSongsSection 
              artistId={artistId} 
              artist={null}
              onSubscribeRequired={handleSubscribeDecision}
              isLoading={true}
            />
            
            <ArtistAlbumsSection
              artistId={artistId}
              currentUser={currentUser}
              onPurchaseClick={handlePurchaseClick}
              onSubscribeRequired={handleSubscribeDecision}
              processingPayment={processingPayment}
              paymentLoading={paymentLoading}
              isLoading={true}
            />
            
            <ArtistSinglesSection
              artistId={artistId}
              currentUser={currentUser}
              onPurchaseClick={handlePurchaseClick}
              onSubscribeRequired={handleSubscribeDecision}
              processingPayment={processingPayment}
              paymentLoading={paymentLoading}
              isLoading={true}
            />
            
            <ArtistAboutSection
              artist={null}
              artistId={artistId}
              currentUser={currentUser}
              openSubscriptionOptions={openSubscriptionOptions}
              subscriptionLoading={subscriptionLoading}
              setSubscriptionLoading={setSubscriptionLoading}
              isLoading={true}
            />
          </div>
        </SkeletonTheme>
      </>
    );
  }

  // Return null if no artist found after loading
  if (!isArtistLoading && !artist) {
    return null;
  }

  const artistSlug = artist?.slug || artist?._id;
  const canonicalUrl = `https://musicreset.com/artist/${artistSlug}`;

  // Data को सही format में पास करें
  const albumsData = artistAlbumsData?.albums || [];

  return (
    <>
      <PageSEO
        title={`${artist?.name} – Reset Music Streaming Artist Profile`}
        description={`Explore the artist profile of ${artist.name} on Reset Music Streaming. Access exclusive music, albums, singles, and subscription features.`}
        canonicalUrl={canonicalUrl}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "MusicGroup",
          "name": artist.name,
          "description": artist.biography || `Music artist profile on Reset Music streaming platform.`,
          "url": canonicalUrl,
          "image": artist.image || null,
          "sameAs": artist.socialLinks || [],
        }}
        noIndex={true}
      />
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
            subscriberCountData={subscriberCountData}
          />
        </div>
        
        <ArtistSongsSection 
          artistId={artistId} 
          artist={artist}
          onSubscribeRequired={handleSubscribeDecision}
        />
        
        <ArtistAlbumsSection
          artistId={artistId}
          currentUser={currentUser}
          onPurchaseClick={handlePurchaseClick}
          onSubscribeRequired={handleSubscribeDecision}
          processingPayment={processingPayment}
          paymentLoading={paymentLoading}
          albums={albumsData} // Direct albums array pass करें
          albumsLoading={albumsLoading}
        />
        
        <ArtistSinglesSection
          artistId={artistId}
          currentUser={currentUser}
          artist={artist}
          onPurchaseClick={handlePurchaseClick}
          onSubscribeRequired={handleSubscribeDecision}
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