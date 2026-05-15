// LandingPage.js
import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PageSEO from '../../components/PageSeo/PageSEO';
import Header from '../../components/user/LandingPage/Header';
import HeroSection from '../../components/user/LandingPage/HeroSection';
import LandingSections from '../../components/user/LandingPage/LandingSections';
import Footer from '../../components/user/Footer';
import '../../styles/LandingPage.css';
import PlatformFeaturesSection from '../../components/user/LandingPage/PlatformFeaturesSection';

const LandingPage = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home");
    }
  }, [isAuthenticated, navigate]);

  const scrollContainerRef = useRef(null);

  return (
    <>
      <PageSEO />
      <div ref={scrollContainerRef} className="landing-page-container">
        <Header />

        <HeroSection />
        <PlatformFeaturesSection/>
        <LandingSections/>
        <Footer />
      </div>
    </>
  );
};

export default LandingPage;