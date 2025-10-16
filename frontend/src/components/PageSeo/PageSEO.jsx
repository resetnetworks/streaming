import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

const PageSEO = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogUrl,
  twitterTitle,
  twitterDescription,
  twitterImage,
  structuredData,
  noIndex = false,
  children
}) => {
  // Default fallback values
  const defaultTitle = "Reset Streaming Platform - Reset Music | Instrumental Music";
  const defaultDescription = "Stream ambient, instrumental, classical and experimental music. Built for next generation musicians, sound designers, listeners and audiophiles.";
  const defaultKeywords = "reset streaming platform, musicreset, reset music, ambient music streaming, instrumental music platform, experimental music, electronic music, classical music, sound design, audiophile platform, IDM, drone, techno, electroacoustic";
  const defaultUrl = "https://musicreset.com";

  // Default WebSite structured data
  const defaultWebSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Reset Music",
    "alternateName": ["Reset Streaming Platform", "Reset"],
    "url": "https://musicreset.com",
    "description": "Stream ambient, instrumental, classical and experimental music. Built for next generation musicians, sound designers, listeners and audiophiles.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://musicreset.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  // Build final values
  const finalTitle = title || defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalKeywords = keywords || defaultKeywords;
  const finalCanonicalUrl = canonicalUrl || defaultUrl;
  const finalOgUrl = ogUrl || finalCanonicalUrl;
  const finalTwitterTitle = twitterTitle || finalTitle;
  const finalTwitterDescription = twitterDescription || finalDescription;

  // Use provided structured data or default WebSite schema
  const finalStructuredData = structuredData || defaultWebSiteSchema;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="author" content="Reset Music" />
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />
      <link rel="canonical" href={finalCanonicalUrl} />

      {/* Mobile Web App */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Reset Music" />

      {/* Open Graph Meta Tags */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={finalOgUrl} />
      <meta property="og:site_name" content="Reset Music" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="Reset Music - Ambient and Electronic Music Streaming Platform" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@musicreset" />
      <meta name="twitter:creator" content="@musicreset" />
      <meta name="twitter:title" content={finalTwitterTitle} />
      <meta name="twitter:description" content={finalTwitterDescription} />
      <meta name="twitter:image:alt" content="Reset Music - Ambient and Electronic Music Streaming Platform" />

      {/* Default WebSite Structured Data - Always included */}
      <script type="application/ld+json">
        {JSON.stringify(finalStructuredData)}
      </script>

      {/* Any additional custom tags */}
      {children}
    </Helmet>
  );
};

PageSEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  keywords: PropTypes.string,
  canonicalUrl: PropTypes.string,
  ogUrl: PropTypes.string,
  twitterTitle: PropTypes.string,
  twitterDescription: PropTypes.string,
  twitterImage: PropTypes.string,
  structuredData: PropTypes.object,
  noIndex: PropTypes.bool,
  children: PropTypes.node
};

export default PageSEO;
