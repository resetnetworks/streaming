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
import { useSelector } from "react-redux";
import { selectIsAuthenticated, selectCurrentUser } from "../../features/auth/authSelectors";

const ArtistRegister = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Step 0 data
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    
    // Step 1 data
    stageName: '',
    country: '',
    website: '',
    socialMedia: '',
    profileImage: null,
    
    // Step 2 data
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    ibanSwift: '',
    documents: []
  });

  // Set initial step based on authentication status
  useEffect(() => {
    if (isAuthenticated && user) {
      // If user is already logged in, start from step 1
      setCurrentStep(1);
      setFormData(prev => ({
        ...prev,
        firstName: user.name || prev.firstName,
        email: user.email || prev.email,
      }));
    } else {
      // If not logged in, start from step 0
      setCurrentStep(0);
    }
  }, [isAuthenticated, user]);

  // Function to handle successful registration (for new users)
  const handleRegistrationSuccess = (userData) => {
    // Update form data with user info
    setFormData(prev => ({
      ...prev,
      firstName: userData.name || prev.firstName,
      email: userData.email || prev.email,
    }));
    
    // Move to step 1 (profile details)
    setCurrentStep(1);
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    // If user is authenticated, don't go back to step 0
    if (isAuthenticated && currentStep === 1) {
      // Option 1: Stay at step 1
      // setCurrentStep(1);
      
      // Option 2: Redirect to home or artist dashboard
      // window.location.href = '/';
      
      // Option 3: Just prevent going back
      return;
    }
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const submitForm = () => {
    nextStep(); // Move to confirmation step
  };

  const renderCurrentStep = () => {
    // If user is authenticated, skip basic info step
    if (isAuthenticated && currentStep === 0) {
      return (
        <ArtistProfileDetails 
          formData={formData} 
          updateFormData={updateFormData} 
          nextStep={nextStep} 
          prevStep={prevStep} 
        />
      );
    }

    switch (currentStep) {
      case 0:
        return (
          <ArtistBasicInfo 
            formData={formData} 
            updateFormData={updateFormData} 
            onRegistrationSuccess={handleRegistrationSuccess}
          />
        );
      case 1:
        return (
          <ArtistProfileDetails 
            formData={formData} 
            updateFormData={updateFormData} 
            nextStep={nextStep} 
            prevStep={prevStep} 
          />
        );
      case 2:
        return (
          <ArtistDocuments 
            formData={formData} 
            updateFormData={updateFormData} 
            prevStep={prevStep} 
            submitForm={submitForm} 
          />
        );
      case 3:
        return (
          <ArtistConfirmation 
            formData={formData} 
          />
        );
      default:
        return null;
    }
  };

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

          <ProgressTracker currentStep={currentStep} />

          {renderCurrentStep()}
        </section>
      </BackgroundWrapper>
    </>
  );
};

export default ArtistRegister; 