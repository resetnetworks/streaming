import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
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

const Artist = () => {
  const { artistId } = useParams();
  const dispatch = useDispatch();
  const heroSectionRef = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  
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
    handlePaymentMethodSelect,
    closePaymentOptions
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

  const handleCloseSubscriptionOptions = () => {
    closeSubscriptionOptions();
    setSubscriptionLoading(false);
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
        
        <ArtistSongsSection artistId={artistId} artist={artist} />
        
        <ArtistAlbumsSection
          artistId={artistId}
          currentUser={currentUser}
          onPurchaseClick={openPaymentOptions}
        />
        
        <ArtistSinglesSection
          artistId={artistId}
          currentUser={currentUser}
          onPurchaseClick={openPaymentOptions}
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
          onClose={closePaymentOptions}
          onSelectMethod={handlePaymentMethodSelect}
          item={pendingPayment?.item}
          itemType={pendingPayment?.itemType}
        />
      </SkeletonTheme>
    </>
  );
};

export default Artist;
