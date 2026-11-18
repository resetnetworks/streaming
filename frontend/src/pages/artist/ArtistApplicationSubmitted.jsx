// src/pages/artist/ArtistApplicationSubmitted.jsx
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated, selectCurrentUser } from "../../features/auth/authSelectors";
import { useMyApplication, useCheckUserArtistRole } from "../../hooks/api/useArtistApplications";
import IconHeader from "../../components/user/IconHeader";
import ArtistConfirmation from "../../components/artist/register/ArtistConfirmation";
import PageSEO from "../../components/PageSeo/PageSEO";
import Loader from "../../components/Loader";
import { analytics } from "../../utills/analytics/index.js";

/**
 * Dedicated conversion & status page for submitted artist applications.
 * - Changes URL to /artist/application-submitted for Meta Ads & Google Ads conversion tracking.
 * - Protected: Only authenticated users with an actual submitted application can view this page.
 * - Random visitors without an application are automatically blocked and redirected to /artist/register.
 */
const ArtistApplicationSubmitted = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);

  const myApplicationQuery = useMyApplication({ enabled: isAuthenticated });
  const userRoleQuery = useCheckUserArtistRole({ enabled: isAuthenticated });

  // Use application from navigation state if available (immediate), else query data
  const application = location.state?.application || myApplicationQuery.data;
  const isQueryLoading = myApplicationQuery.isLoading;
  const isRoleLoading = userRoleQuery.isLoading;
  const isArtist = userRoleQuery.data?.isArtist || user?.role === "artist";

  // Strict Access Guard: Prevent direct unauthorized visits
  useEffect(() => {
    // 1. Unauthenticated users cannot view conversion page
    if (!isAuthenticated) {
      navigate("/artist/register", { replace: true });
      return;
    }

    // 2. Already approved artists belong on the dashboard
    if (!isRoleLoading && isArtist) {
      navigate("/artist/dashboard", { replace: true });
      return;
    }

    // 3. User is logged in, but has never submitted an application -> Block access!
    if (!isQueryLoading && !application && !location.state?.application && !myApplicationQuery.isError) {
      navigate("/artist/register", { replace: true });
      return;
    }
  }, [isAuthenticated, isRoleLoading, isArtist, isQueryLoading, application, location.state, myApplicationQuery.isError, navigate]);

  // Ad Conversion Tracking (Meta Pixel, Google Ads, GTM, Internal Analytics)
  useEffect(() => {
    if (!application) return;

    const appId = application._id || application.id;
    if (!appId) return;

    const trackingKey = `tracked_artist_conversion_${appId}`;

    // Fire conversion only once per application submission session
    if (!sessionStorage.getItem(trackingKey)) {
      sessionStorage.setItem(trackingKey, "true");

      const artistName = application.stageName || "Artist";

      // 1. Google Tag Manager / dataLayer push
      if (typeof window !== "undefined") {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "artist_application_submitted",
          conversionType: "lead",
          applicationId: appId,
          artistName: artistName,
          status: application.status || "submitted",
        });
      }

      // 2. Google Analytics 4 (gtag)
      if (typeof window !== "undefined" && typeof window.gtag === "function") {
        window.gtag("event", "artist_application_submitted", {
          application_id: appId,
          artist_name: artistName,
          event_category: "acquisition",
          event_label: "Artist Application",
        });
        window.gtag("event", "conversion", {
          send_to: "artist_application_lead",
          application_id: appId,
        });
      }

      // 3. Meta / Facebook Pixel (fbq)
      if (typeof window !== "undefined" && typeof window.fbq === "function") {
        window.fbq("track", "Lead", {
          content_name: "Artist Application",
          content_category: "Artist Registration",
          application_id: appId,
          status: "submitted",
        });
        window.fbq("trackCustom", "ArtistApplicationSubmitted", {
          application_id: appId,
          artist_name: artistName,
        });
      }

      // 4. Platform Analytics Pipeline
      try {
        analytics.track("signup_completed", {
          source: "artist_application_submitted",
          applicationId: appId,
          role: "artist",
          artistName: artistName,
        }, {}, { immediate: true });
        analytics.flush();
      } catch (err) {
        console.warn("[Analytics] Artist conversion tracking error:", err);
      }
    }
  }, [application]);

  // Loading state while verifying credentials
  if (!application && (isQueryLoading || isRoleLoading)) {
    return (
      <div className="min-h-screen bg-[#09090D] text-white flex flex-col">
        <IconHeader />
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <Loader noBg={true} />
          <p className="text-slate-400 text-sm mt-4 tracking-wide font-['Jura']">
            Verifying application status...
          </p>
        </div>
      </div>
    );
  }

  // If user is not allowed (will redirect via useEffect), prevent flash
  if (!isAuthenticated || (!application && !isQueryLoading)) {
    return null;
  }

  return (
    <>
      <PageSEO
        title="Application Submitted - Reset Music"
        description="Your artist application has been submitted and is currently under verification."
        canonicalUrl="https://musicreset.com/artist/application-submitted"
        noIndex={true}
      />

      <div className="min-h-screen bg-[#09090D] text-white flex flex-col">
        <IconHeader />
        <main className="flex-1 px-4 pb-16">
          <h1 className="text-3xl sm:text-4xl text-center mt-4 md:mt-10 font-['Jura'] capitalize tracking-wider font-extrabold bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
            sign up as an artist
          </h1>
          <ArtistConfirmation
            applicationData={application}
            onReapply={() => navigate("/artist/register?reapply=true")}
          />
        </main>
      </div>
    </>
  );
};

export default ArtistApplicationSubmitted;
