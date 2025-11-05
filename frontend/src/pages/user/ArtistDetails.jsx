import React from 'react';
import IconHeader from '../../components/user/IconHeader';
import Footer from '../../components/user/Footer';
import BackgroundWrapper from '../../components/BackgroundWrapper';
import HeroSection from '../../components/user/ArtistDetails/HeroSection';
import RevenueChart from '../../components/user/ArtistDetails/RevenueChart';
import ToolsSection from '../../components/user/ArtistDetails/ToolsSection';
import ResetMusicFeatures from '../../components/user/ArtistDetails/ResetMusicFeatures';

const ArtistDetails = () => {
  return (
    <>
      <BackgroundWrapper>
        <IconHeader />
        <HeroSection />
        <RevenueChart />
        <ToolsSection />
        <ResetMusicFeatures />
        <Footer />
      </BackgroundWrapper>
    </>
  );
};

export default ArtistDetails;
