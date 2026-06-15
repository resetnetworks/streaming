import React from 'react';
import IconHeader from '../../components/user/IconHeader';
import Footer from '../../components/user/Footer';
import PageSEO from '../../components/PageSeo/PageSEO';

import HeroSection from '../../components/user/ArtistDetails/HeroSection';
import RevenueChart from '../../components/user/ArtistDetails/RevenueChart';
import ToolsSection from '../../components/user/ArtistDetails/ToolsSection';
import ResetMusicFeatures from '../../components/user/ArtistDetails/ResetMusicFeatures';

const ArtistDetails = () => {
  return (
    <>
      <PageSEO
        title="Sell Music & Keep 100% Revenue - Reset Music for Artists"
        description="Learn how Reset Music helps independent artists distribute music, analyze streaming revenue, and build direct subscriber relations. Join today."
        canonicalUrl="https://musicreset.com/artist-details"
        ogUrl="https://musicreset.com/artist-details"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Reset Music for Artists - Music Distribution and Revenue",
          "description": "Sell your music online, keep 100% of your earnings, and get direct fan support with Reset Music streaming platform.",
          "url": "https://musicreset.com/artist-details",
        }}
        noIndex={false}
      />
      <>
        <IconHeader />
        <HeroSection />
        <RevenueChart />
        <ToolsSection />
        <ResetMusicFeatures />
        <Footer />
      </>
    </>
  );
};

export default ArtistDetails;
