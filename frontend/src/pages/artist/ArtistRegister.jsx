// src/pages/ArtistRegister.js
import React, { useState, useEffect } from 'react';
import BackgroundWrapper from "../../components/BackgroundWrapper";
import IconHeader from "../../components/user/IconHeader";
import ProgressTracker from '../../components/artist/register/ProgressTracker';
import ArtistBasicInfo from '../../components/artist/register/ArtistBasicInfo';
import ArtistProfileDetails from '../../components/artist/register/ArtistProfileDetails';
import ArtistDocuments from '../../components/artist/register/ArtistDocuments';
import ArtistConfirmation from '../../components/artist/register/ArtistConfirmation';
import PageSEO from "../../components/PageSeo/PageSEO";
import { useSelector, useDispatch } from "react-redux";
import { selectIsAuthenticated, selectCurrentUser } from "../../features/auth/authSelectors";
import { 
  getMyArtistApplication, 
  clearMyApplication,
  checkIfUserIsArtist 
} from "../../features/artistApplications/artistApplicationSlice";

const ArtistRegister = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  
  // Get application data from Redux
  const { 
    myApplication, 
    fetchLoading, 
    fetchError,
    submittedApplication,
    isUserArtist,
    userCheckLoading,
    userCheckError
  } = useSelector((state) => state.artistApplication);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [showExistingApplication, setShowExistingApplication] = useState(false);
  const [skipApplicationCheck, setSkipApplicationCheck] = useState(false);

  // Check if user is already an artist on component mount
  useEffect(() => {
    if (isAuthenticated && user) {
      // First check if user already has artist role
      dispatch(checkIfUserIsArtist()).then((result) => {
        if (result.payload?.isArtist) {
          // If user is already artist, skip application check
          setSkipApplicationCheck(true);
          setShowExistingApplication(false);
          
        } else {
          // If not artist, fetch application if exists
          dispatch(getMyArtistApplication());
        }
      });
    } else {
      // Clear any existing application data if user logs out
      dispatch(clearMyApplication());
    }
  }, [dispatch, isAuthenticated]);

  // Check if user already has an application
  useEffect(() => {
    if (skipApplicationCheck) {
      // Skip application check if user is already artist
      return;
    }

    if (!fetchLoading && !userCheckLoading && (myApplication || submittedApplication)) {
      const existingApp = submittedApplication || myApplication;
      
      // If application exists and is not rejected, show confirmation page
      if (existingApp && existingApp.status !== 'rejected') {
        setShowExistingApplication(true);
        setCurrentStep(3); // Go directly to confirmation step
      } 
      // If rejected, allow re-application (stay on form)
      else if (existingApp?.status === 'rejected') {
        setShowExistingApplication(false);
        // User can re-apply, start from step 1 if authenticated
        if (isAuthenticated) {
          setCurrentStep(1);
        }
      }
    }
  }, [myApplication, submittedApplication, fetchLoading, isAuthenticated, skipApplicationCheck, userCheckLoading]);

  // Set initial step based on authentication status
  useEffect(() => {
    if (isAuthenticated && user && !showExistingApplication && !skipApplicationCheck) {
      setCurrentStep(1);
    } else if (!isAuthenticated && !showExistingApplication) {
      setCurrentStep(0);
    }
  }, [isAuthenticated, user, showExistingApplication, skipApplicationCheck]);

  // If user is already an artist, show different UI
  if (isAuthenticated && isUserArtist && !userCheckLoading) {
    return (
      <>
        <PageSEO
          title="Artist Dashboard - Reset Music"
          description="Welcome to your artist dashboard on Reset Music."
          canonicalUrl="https://musicreset.com/artist-dashboard"
        />

        <BackgroundWrapper>
          <IconHeader />
          <section className='text-white px-4'>
            <h1 className="text-4xl text-center mt-4 md:mt-10">
              <span className="text-blue-700">Welcome back, </span>Artist!
            </h1>
            
            <div className="max-w-4xl mx-auto mt-8 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2">
                  You're already an artist!
                </h2>
                
                <p className="text-slate-300 mb-6">
                  You have successfully registered as an artist on Reset Music.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/artist/dashboard"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Go to Artist Dashboard
                  </a>
                  <a
                    href="/upload"
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Upload New Music
                  </a>
                </div>
              </div>
            </div>
          </section>
        </BackgroundWrapper>
      </>
    );
  }

  // Function to handle successful registration (for new users)
  const handleRegistrationSuccess = (userData) => {
    setCurrentStep(1);
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (isAuthenticated && currentStep === 1) {
      return;
    }
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const submitForm = () => {
    nextStep();
  };

  const handleReapply = () => {
    setShowExistingApplication(false);
    if (isAuthenticated) {
      setCurrentStep(1);
    } else {
      setCurrentStep(0);
    }
  };

  const renderCurrentStep = () => {
    // Show loading while checking user status or application status
    if (userCheckLoading || (fetchLoading && !skipApplicationCheck)) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <h2 className="text-xl font-bold text-white mb-2">Loading...</h2>
          <p className="text-slate-400 text-sm">
            {userCheckLoading ? 'Checking your artist status...' : 'Checking your application status...'}
          </p>
        </div>
      );
    }

    // Show error if fetching failed (but not for "no application found" case)
    if (fetchError && !fetchError.includes('No artist application') && !showExistingApplication) {
      return (
        <div className="max-w-[90%] mx-auto mt-8 p-6 bg-red-500/10 border border-red-500/20 rounded-lg">
          <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Data</h2>
          <p className="text-red-300 mb-4">{fetchError}</p>
          <button
            onClick={() => dispatch(getMyArtistApplication())}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    // Always show confirmation step if existing application found
    if (showExistingApplication) {
      return (
        <ArtistConfirmation 
          onReapply={handleReapply}
        />
      );
    }

    // Normal flow for new applications
    if (isAuthenticated && currentStep === 0) {
      return (
        <ArtistProfileDetails 
          nextStep={nextStep} 
          prevStep={prevStep} 
        />
      );
    }

    switch (currentStep) {
      case 0:
        return (
          <ArtistBasicInfo 
            onRegistrationSuccess={handleRegistrationSuccess}
          />
        );
      case 1:
        return (
          <ArtistProfileDetails 
            nextStep={nextStep} 
            prevStep={prevStep} 
          />
        );
      case 2:
        return (
          <ArtistDocuments 
            prevStep={prevStep} 
            submitForm={submitForm} 
          />
        );
      case 3:
        return (
          <ArtistConfirmation />
        );
      default:
        return null;
    }
  };

  // Don't show progress tracker if showing existing application or user is already artist
  const showProgressTracker = !showExistingApplication && !fetchLoading && !fetchError && !isUserArtist;

  return (
    <>
      <PageSEO
        title="Artist Registration - Reset Music | Sign Up as Artist"
        description="Join Reset Music as an artist. Create your artist account to upload music, manage your profile and reach new audiences."
        canonicalUrl="https://musicreset.com/artist-register"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Artist Registration - Reset Music",
          "description": "Artist registration page for Reset Music streaming platform",
          "url": "https://musicreset.com/artist-register"
        }}
        noIndex={true}
      />

      <BackgroundWrapper>
        <IconHeader />
        <section className='text-white px-4'>
          <h1 className="text-4xl text-center mt-4 md:mt-10">
            <span className="text-blue-700">sign up, </span>as an artist
          </h1>

          {showProgressTracker && (
            <ProgressTracker currentStep={currentStep} />
          )}

          {renderCurrentStep()}
        </section>
      </BackgroundWrapper>
    </>
  );
};

export default ArtistRegister;