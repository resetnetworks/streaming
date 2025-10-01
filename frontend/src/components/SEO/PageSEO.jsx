import React from 'react';
import { Helmet } from 'react-helmet';

const PageSEO = ({ 
  title = "Reset Streaming Platform - Reset Music | Instrumental Music",
  description = "Reset Streaming Platform by Reset Music - Stream ambient, instrumental, classical and experimental music. Built for next generation musicians, sound designers, listeners and audiophiles. Multi-currency support with monthly subscriptions.",
  url = "https://musicreset.com",
  type = "website"
}) => {
  return (
    <Helmet>
      {/* Primary SEO Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content="reset streaming platform, musicreset, reset music, ambient music streaming, instrumental music platform, experimental music, electronic music, classical music, sound design, audiophile platform, IDM, drone, techno, electroacoustic" />
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Reset Music" />
      <link rel="canonical" href="https://musicreset.com/"/>

       <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" href="/icon.png" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/svg+xml" href="/icon.svg" />
      
     {/* Open Graph Tags for Social Media */}
    <meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:type" content={type} />
<meta property="og:url" content={url} />
<meta property="og:site_name" content="ResetMusic" />
<meta property="og:locale" content="en_US" />
<meta property="og:image" content="https://musicreset.com/icon.png" />
<meta property="og:image:alt" content="Reset Streaming Platform - Reset Music" />

{/* Twitter Card Tags */}
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:site" content="@musicreset" />
<meta name="twitter:image" content="https://musicreset.com/icon.png" />
<meta name="twitter:image:alt" content="Reset Streaming Platform - Reset Music" />

      
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
          "name": "Reset Streaming Platform - Reset Music",
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
          "name": "Reset Streaming Platform - Reset Music",
          "description": "Reset Streaming Platform by Reset Music for next generation musicians, sound designers, listeners and audiophiles",
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
