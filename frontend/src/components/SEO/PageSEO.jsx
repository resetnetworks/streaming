import React from 'react';
import { Helmet } from 'react-helmet';

const PageSEO = ({ 
  title = "Reset Streaming Platform - MusicReset | Instrumental Music",
  description = "Reset Streaming Platform by MusicReset - Stream ambient, instrumental, classical and experimental music. Built for next generation musicians, sound designers, listeners and audiophiles. Multi-currency support with monthly subscriptions.",
  url = "https://musicreset.com",
  type = "website"
}) => {
  return (
    <Helmet>
      {/* Primary SEO Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content="reset streaming platform, musicreset, ambient music streaming, instrumental music platform, experimental music, electronic music, classical music, sound design, audiophile platform, IDM, drone, techno, electroacoustic" />
      <meta name="robots" content="index, follow" />
      <meta name="author" content="MusicReset" />
      
      {/* Open Graph Tags for Social Media */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="Reset Streaming Platform - MusicReset" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:site" content="@musicreset" />
      
      {/* Additional SEO Tags */}
      <meta name="theme-color" content="#3b82f6" />
      <meta name="application-name" content="Reset Streaming Platform" />
      <meta name="apple-mobile-web-app-title" content="Reset Streaming Platform" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      
      {/* Structured Data for Search Engines */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Reset Streaming Platform - MusicReset",
          "description": description,
          "url": url,
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://musicreset.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          },
          "sameAs": [
            "https://twitter.com/musicreset",
            "https://instagram.com/musicreset"
          ]
        })}
      </script>
      
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Reset Streaming Platform - MusicReset",
          "description": "Reset Streaming Platform by MusicReset for next generation musicians, sound designers, listeners and audiophiles",
          "url": url,
          "logo": "https://musicreset.com/icon.png",
          "foundingDate": "2025",
          "numberOfEmployees": "2-10",
          "industry": "Music Technology",
          "serviceType": "Music Streaming Platform"
        })}
      </script>
    </Helmet>
  );
};

export default PageSEO;
