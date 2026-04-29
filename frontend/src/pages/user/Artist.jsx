import React, { useEffect, useRef, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import PageSEO from "../../components/PageSeo/PageSEO";
import UserHeader from "../../components/user/UserHeader";
import ArtistHeroSection from "../../components/user/Artist/ArtistHeroSection";
import ArtistAlbumsSection from "../../components/user/Artist/ArtistAlbumsSection";
import ArtistSinglesSection from "../../components/user/Artist/ArtistSinglesSection";
import ArtistAboutSection from "../../components/user/Artist/ArtistAboutSection";
import SubscriptionMethodModal from "../../components/user/SubscriptionMethodModal";
import PaymentMethodModal from "../../components/user/PaymentMethodModal";
import SubscribeModal from "../../components/user/SubscribeModal";
import { useDispatch } from "react-redux";
import { useArtist, useSubscriberCount } from "../../hooks/api/useArtists";
import { useArtistAlbumsSimple } from "../../hooks/api/useAlbums";
import { selectPaymentError } from "../../features/payments/paymentSelectors";
import { useSubscriptionPayment } from "../../hooks/useSubscriptionPayment";
import { usePaymentGateway } from "../../hooks/usePaymentGateway";
import { useUserPurchases, useUserSubscriptions } from "../../hooks/api/useUserDashboard";
import LoginRequiredModal from "../../components/user/LoginRequiredModal"

const Artist = () => {
  const { artistId } = useParams();
  const navigate = useNavigate();
  const heroSectionRef = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [loginModal, setLoginModal] = useState({
  open: false,
  type: "play",
  contentType: "song",
  data: null,
});
  const dispatch = useDispatch();

  const currentUser = useSelector((state) => state.auth.user);

  const { data: purchasesData } = useUserPurchases();
  const userPurchases = Array.isArray(purchasesData?.history)
    ? purchasesData.history
    : [];

  // ✅ Real API se subscriptions fetch karo — localStorage nahi
  const { data: subscriptionsData } = useUserSubscriptions();
  const userSubscriptions = subscriptionsData?.subscriptions || [];

  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);
  const [modalArtist, setModalArtist] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [modalData, setModalData] = useState(null);

  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const requireLogin = (type, contentType, data = null) => {
  if (!currentUser) {
    setLoginModal({
      open: true,
      type,
      contentType,
      data,
    });
    return false;
  }
  return true;
};

  const {
    data: artist,
    isLoading: isArtistLoading,
    error: artistError,
  } = useArtist(artistId);

  const { data: subscriberCountData } = useSubscriberCount(artist?._id);

  const {
    data: artistAlbumsData,
    isLoading: albumsLoading,
  } = useArtistAlbumsSimple(artistId, 10);

  const paymentError = useSelector(selectPaymentError);

  const {
    showSubscriptionOptions,
    pendingSubscription,
    openSubscriptionOptions,
    handleSubscriptionMethodSelect,
    closeSubscriptionOptions,
  } = useSubscriptionPayment();

  const {
    showPaymentOptions,
    pendingPayment,
    openPaymentOptions,
    handlePaymentMethodSelect: originalHandlePaymentMethodSelect,
    closePaymentOptions,
    getPaymentDisplayInfo,
  } = usePaymentGateway();

  // ✅ Real API data se subscription check — artist load hone ke baad
  const isSubscribedToCurrentArtist = useMemo(() => {
    if (!artist || !userSubscriptions.length) return false;
    return userSubscriptions.some(
      (sub) =>
        sub.artist?._id === artist?._id ||
        sub.artist?.slug === artist?.slug
    );
  }, [userSubscriptions, artist]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.3 }
    );
    if (heroSectionRef.current) observer.observe(heroSectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleSubscribeModalClose = () => {
    setSubscribeModalOpen(false);
    setModalType(null);
    setModalArtist(null);
    setModalData(null);
  };

  const handleNavigateToArtist = () => handleSubscribeModalClose();

  const handleCloseSubscriptionOptions = () => {
    closeSubscriptionOptions();
    setSubscriptionLoading(false);
  };

 const handlePurchaseClick = (item, itemType) => {
  setProcessingPayment(false);
  setPaymentLoading(false);
  openPaymentOptions(item, itemType); // no currencyData needed
};

const handlePaymentMethodSelect = async (gateway, currencyInfo) => {
  try {
    setProcessingPayment(true);
    setPaymentLoading(true);
    // Pass the selected currency info to the original handler
    await originalHandlePaymentMethodSelect(gateway, currencyInfo);
  } catch (error) {
    console.error("Payment method selection error:", error);
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

  // ✅ localStorage/purchaseHistory hatao — real subscription data use karo
  const handleSubscribeDecision = (targetArtist, type, data) => {

  // ✅ FIRST: login check
  if (!requireLogin(type, data?.type || "song", data)) return;

  const alreadySubscribed = userSubscriptions.some(
    (sub) =>
      sub.artist?._id === targetArtist?._id ||
      sub.artist?.slug === targetArtist?.slug
  );

  if (type === "purchase") {
    if (alreadySubscribed) {
      const itemType = data.type || "song";
      handlePurchaseClick(data, itemType);
      return;
    }
    setModalArtist(targetArtist);
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
  }

  setModalArtist(targetArtist);
  setModalType(type);
  setModalData(data);
  setSubscribeModalOpen(true);
};

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
            <ArtistAlbumsSection
              artistId={artistId}
              purchases={userPurchases}
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

  if (!isArtistLoading && !artist) return null;

  const artistSlug = artist?.slug || artist?._id;
  const canonicalUrl = `https://musicreset.com/artist/${artistSlug}`;

  return (
    <>
      <PageSEO
        title={`${artist?.name} – Reset Music Streaming Artist Profile`}
        description={`Explore the artist profile of ${artist.name} on Reset Music Streaming. Access exclusive music, albums, singles, and subscription features.`}
        canonicalUrl={canonicalUrl}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "MusicGroup",
          name: artist.name,
          description:
            artist.biography ||
            "Music artist profile on Reset Music streaming platform.",
          url: canonicalUrl,
          image: artist.image || null,
          sameAs: artist.socialLinks || [],
        }}
        noIndex={false}
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
            requireLogin={requireLogin}
          />
        </div>

        <ArtistAlbumsSection
          artistId={artistId}
          onPurchaseClick={handlePurchaseClick}
          onSubscribeRequired={handleSubscribeDecision}
          processingPayment={processingPayment}
          paymentLoading={paymentLoading}
          purchases={userPurchases}
        />

        <ArtistSinglesSection
          artistId={artistId}
          currentUser={currentUser}
          artist={artist}
          purchases={userPurchases}
          onPurchaseClick={handlePurchaseClick}
          onSubscribeRequired={handleSubscribeDecision}
          processingPayment={processingPayment}
          paymentLoading={paymentLoading}
          userSubscriptions={userSubscriptions}
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

        <LoginRequiredModal
  open={loginModal.open}
  onClose={() => setLoginModal(prev => ({ ...prev, open: false }))}
  type={loginModal.type}
  contentType={loginModal.contentType}
  itemData={loginModal.data}
  onLogin={() => navigate("/login")}
/>
      </SkeletonTheme>
    </>
  );
};

export default Artist;