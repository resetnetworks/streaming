// generate-sitemap.js
// Run: node generate-sitemap.js
// Place this file in your project root

import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = 'https://musicreset.com';

// ─────────────────────────────────────────────
// 📌 STATIC PAGES
// Only public pages — no auth required routes
// Excluded: /admin, /artist/dashboard, /artist/register,
//           /genres, /purchases, /liked-songs,
//           /payment-history, /auth/callback,
//           /payment-success, /payment-fail
// ─────────────────────────────────────────────
const staticPages = [

  // ===== LANDING (highest priority) =====
  { url: '/',                             changefreq: 'daily',   priority: 1.0 },

  // ===== DISCOVERY PAGES =====
  { url: '/home',                         changefreq: 'daily',   priority: 0.9 },
  { url: '/artists',                      changefreq: 'daily',   priority: 0.9 },
  { url: '/albums',                       changefreq: 'daily',   priority: 0.9 },
  { url: '/search',                       changefreq: 'weekly',  priority: 0.8 },

  // ===== GENRE PAGES (add more as needed) =====
  { url: '/genre/hip-hop',               changefreq: 'weekly',  priority: 0.7 },
  { url: '/genre/pop',                    changefreq: 'weekly',  priority: 0.7 },
  { url: '/genre/rock',                   changefreq: 'weekly',  priority: 0.7 },
  { url: '/genre/jazz',                   changefreq: 'weekly',  priority: 0.7 },
  { url: '/genre/classical',             changefreq: 'weekly',  priority: 0.7 },
  { url: '/genre/electronic',            changefreq: 'weekly',  priority: 0.7 },
  { url: '/genre/r-and-b',               changefreq: 'weekly',  priority: 0.7 },
  { url: '/genre/indie',                  changefreq: 'weekly',  priority: 0.7 },

  // ===== ARTIST INFO (public page) =====
  { url: '/artist-details',              changefreq: 'weekly',  priority: 0.7 },

  // ===== INFO / BRAND PAGES =====
  { url: '/about-us',                    changefreq: 'monthly', priority: 0.8 },
  { url: '/contact-us',                  changefreq: 'monthly', priority: 0.7 },
  { url: '/careers',                     changefreq: 'weekly',  priority: 0.6 },

  // ===== LEGAL PAGES =====
  { url: '/privacy-policy',              changefreq: 'monthly', priority: 0.5 },
  { url: '/terms-and-conditions',        changefreq: 'monthly', priority: 0.5 },
  { url: '/cancellation-refund-policy',  changefreq: 'monthly', priority: 0.4 },
  { url: '/data-deletion',               changefreq: 'monthly', priority: 0.4 },

  // ===== AUTH PAGES (low priority — not useful for crawlers) =====
  { url: '/login',                       changefreq: 'monthly', priority: 0.3 },
  { url: '/register',                    changefreq: 'monthly', priority: 0.3 },
  { url: '/forgot-password',             changefreq: 'monthly', priority: 0.2 },
];

// ─────────────────────────────────────────────
// 📌 DYNAMIC PAGES
// Fetch from your own API at build time.
// These are public pages: /artist/:id, /album/:id, /song/:id
//
// Replace the fetch URLs with your actual API endpoints.
// If your API is not reachable at build time, use the
// fallback arrays (emptyArtists, etc.) instead.
// ─────────────────────────────────────────────

async function fetchDynamicRoutes() {
  const dynamicPages = [];

  try {
    // ── Artists ──────────────────────────────
    const artistsRes = await fetch(`${BASE_URL}/api/artists?limit=1000`);
    if (artistsRes.ok) {
      const { data } = await artistsRes.json();           // adjust key to match your API shape
      data?.forEach(artist => {
        // ✅ Slug is SEO-friendly (e.g. /artist/arijit-singh)
        // ID is used as fallback only if slug is missing
        const artistUrl = artist.slug
          ? `/artist/${artist.slug}`
          : `/artist/${artist._id}`;

        dynamicPages.push({
          url: artistUrl,
          changefreq: 'weekly',
          priority: 0.8,
          lastmod: artist.updatedAt ?? new Date().toISOString(),
        });
      });
      console.log(`✅ Artists fetched: ${data?.length ?? 0}`);
    }
  } catch (e) {
    console.warn('⚠️  Could not fetch artists:', e.message);
  }

  try {
    // ── Albums ───────────────────────────────
    const albumsRes = await fetch(`${BASE_URL}/api/albums?limit=1000`);
    if (albumsRes.ok) {
      const { data } = await albumsRes.json();
      data?.forEach(album => {
        const albumUrl = album.slug
          ? `/album/${album.slug}`
          : `/album/${album._id}`;

        dynamicPages.push({
          url: albumUrl,
          changefreq: 'weekly',
          priority: 0.7,
          lastmod: album.updatedAt ?? new Date().toISOString(),
        });
      });
      console.log(`✅ Albums fetched: ${data?.length ?? 0}`);
    }
  } catch (e) {
    console.warn('⚠️  Could not fetch albums:', e.message);
  }

  try {
    // ── Songs ────────────────────────────────
    const songsRes = await fetch(`${BASE_URL}/api/songs?limit=1000`);
    if (songsRes.ok) {
      const { data } = await songsRes.json();
      data?.forEach(song => {
        const songUrl = song.slug
          ? `/song/${song.slug}`
          : `/song/${song._id}`;

        dynamicPages.push({
          url: songUrl,
          changefreq: 'weekly',
          priority: 0.6,
          lastmod: song.updatedAt ?? new Date().toISOString(),
        });
      });
      console.log(`✅ Songs fetched: ${data?.length ?? 0}`);
    }
  } catch (e) {
    console.warn('⚠️  Could not fetch songs:', e.message);
  }

  return dynamicPages;
}

// ─────────────────────────────────────────────
// 🚀 GENERATE SITEMAP
// ─────────────────────────────────────────────
(async () => {
  console.log('🗺️  Generating sitemap...\n');

  const dynamicPages = await fetchDynamicRoutes();
  const allPages = [...staticPages, ...dynamicPages];

  const sitemap = new SitemapStream({ hostname: BASE_URL });
  const outputPath = resolve(__dirname, 'public', 'sitemap.xml');
  const writeStream = createWriteStream(outputPath);

  sitemap.pipe(writeStream);
  allPages.forEach(page => sitemap.write(page));
  sitemap.end();

  await streamToPromise(sitemap);

  console.log(`\n✅ Sitemap generated → public/sitemap.xml`);
  console.log(`📄 Total URLs: ${allPages.length}`);
  console.log(`   Static  : ${staticPages.length}`);
  console.log(`   Dynamic : ${dynamicPages.length}`);
})();