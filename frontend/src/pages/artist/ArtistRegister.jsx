import React, { useState } from 'react'
import BackgroundWrapper from "../../components/BackgroundWrapper";
import IconHeader from "../../components/user/IconHeader";
import ProgressTracker from '../../components/artist/ProgressTracker';
import ArtistBasicInfo from '../../components/artist/ArtistBasicInfo';
import ArtistProfileDetails from '../../components/artist/ArtistProfileDetails';
import ArtistDocuments from '../../components/artist/ArtistDocuments';
import ArtistConfirmation from '../../components/artist/ArtistConfirmation';
import PageSEO from "../../components/PageSeo/PageSEO";

const ArtistRegister = () => {
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

  // Update form data
  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Navigation functions
  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  // Handle final form submission
  const submitForm = () => {
    console.log('Final form data:', formData);
    // Handle your final submission logic here
    nextStep(); // Move to confirmation step after submission
  };

  // Render current step component
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <ArtistBasicInfo 
            formData={formData} 
            updateFormData={updateFormData} 
            nextStep={nextStep} 
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
          
          {/* Progress Tracker - currentStep changes with each step */}
          <ProgressTracker currentStep={currentStep} />
          
          {/* Render current step component */}
          {renderCurrentStep()}
        </section>
      </BackgroundWrapper>
    </>
  )
}

export default ArtistRegister;