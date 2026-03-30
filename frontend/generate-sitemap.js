// generate-sitemap.js
// Run: node generate-sitemap.js

import { SitemapStream, streamToPromise } from "sitemap";
import { createWriteStream } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ✅ CONFIG
const FRONTEND_URL = "https://musicreset.com";
const BACKEND_URL = "https://api2.musicreset.com";

// ─────────────────────────────────────────────
// 📌 STATIC PAGES
// ─────────────────────────────────────────────
const staticPages = [
  { url: "/", changefreq: "daily", priority: 1.0 },
  { url: "/home", changefreq: "daily", priority: 0.9 },
  { url: "/artists", changefreq: "daily", priority: 0.9 },
  { url: "/albums", changefreq: "daily", priority: 0.9 },
  { url: "/search", changefreq: "weekly", priority: 0.8 },

  { url: "/genre/hip-hop", changefreq: "weekly", priority: 0.7 },
  { url: "/genre/pop", changefreq: "weekly", priority: 0.7 },
  { url: "/genre/rock", changefreq: "weekly", priority: 0.7 },
  { url: "/genre/jazz", changefreq: "weekly", priority: 0.7 },
  { url: "/genre/classical", changefreq: "weekly", priority: 0.7 },
  { url: "/genre/electronic", changefreq: "weekly", priority: 0.7 },
  { url: "/genre/r-and-b", changefreq: "weekly", priority: 0.7 },
  { url: "/genre/indie", changefreq: "weekly", priority: 0.7 },

  { url: "/artist-details", changefreq: "weekly", priority: 0.7 },

  { url: "/about-us", changefreq: "monthly", priority: 0.8 },
  { url: "/contact-us", changefreq: "monthly", priority: 0.7 },
  { url: "/careers", changefreq: "weekly", priority: 0.6 },

  { url: "/privacy-policy", changefreq: "monthly", priority: 0.5 },
  { url: "/terms-and-conditions", changefreq: "monthly", priority: 0.5 },
  { url: "/cancellation-refund-policy", changefreq: "monthly", priority: 0.4 },
  { url: "/data-deletion", changefreq: "monthly", priority: 0.4 },

  { url: "/login", changefreq: "monthly", priority: 0.3 },
  { url: "/register", changefreq: "monthly", priority: 0.3 },
  { url: "/forgot-password", changefreq: "monthly", priority: 0.2 },
];

// ─────────────────────────────────────────────
// 📌 DYNAMIC ROUTES
// ─────────────────────────────────────────────
async function fetchDynamicRoutes() {
  const dynamicPages = [];

  // ── ARTISTS ──────────────────────────────
  try {
    const res = await fetch(`${BACKEND_URL}/api/artists?limit=1000`);
    const json = await res.json();

    const artists = json.data || [];

    artists.forEach((artist) => {
      const url = artist.slug
        ? `/artist/${artist.slug}`
        : `/artist/${artist._id}`;

      dynamicPages.push({
        url,
        changefreq: "weekly",
        priority: 0.8,
        lastmod: artist.updatedAt || new Date().toISOString(),
      });
    });

    console.log(`✅ Artists fetched: ${artists.length}`);
  } catch (e) {
    console.warn("⚠️ Artists fetch error:", e.message);
  }

  // ── ALBUMS ───────────────────────────────
  try {
    const res = await fetch(`${BACKEND_URL}/api/albums?limit=1000`);
    const json = await res.json();

    const albums = json.data || [];

    albums.forEach((album) => {
      const url = album.slug
        ? `/album/${album.slug}`
        : `/album/${album._id}`;

      dynamicPages.push({
        url,
        changefreq: "weekly",
        priority: 0.7,
        lastmod: album.updatedAt || new Date().toISOString(),
      });
    });

    console.log(`✅ Albums fetched: ${albums.length}`);
  } catch (e) {
    console.warn("⚠️ Albums fetch error:", e.message);
  }

  // ── SONGS (WITH PAGINATION) ───────────────
  try {
    let currentPage = 1;
    let totalPages = 1;
    let totalSongsCount = 0;

    while (currentPage <= totalPages) {
      const res = await fetch(
        `${BACKEND_URL}/api/songs/singles?page=${currentPage}&limit=100`
      );

      const json = await res.json();

      const songs = json.songs || [];
      totalPages = json.totalPages || 1;

      songs.forEach((song) => {
        const url = song.slug
          ? `/song/${song.slug}`
          : `/song/${song._id}`;

        dynamicPages.push({
          url,
          changefreq: "weekly",
          priority: 0.6,
          lastmod: song.updatedAt || new Date().toISOString(),
        });
      });

      totalSongsCount += songs.length;
      currentPage++;
    }

    console.log(`✅ Songs fetched: ${totalSongsCount}`);
  } catch (e) {
    console.warn("⚠️ Songs fetch error:", e.message);
  }

  return dynamicPages;
}

// ─────────────────────────────────────────────
// 🚀 GENERATE SITEMAP
// ─────────────────────────────────────────────
(async () => {
  console.log("🗺️ Generating sitemap...\n");

  const dynamicPages = await fetchDynamicRoutes();
  const allPages = [...staticPages, ...dynamicPages];

  const sitemap = new SitemapStream({ hostname: FRONTEND_URL });
  const outputPath = resolve(__dirname, "public", "sitemap.xml");
  const writeStream = createWriteStream(outputPath);

  sitemap.pipe(writeStream);

  allPages.forEach((page) => sitemap.write(page));

  sitemap.end();

  await streamToPromise(sitemap);

  console.log("\n✅ Sitemap generated → public/sitemap.xml");
  console.log(`📄 Total URLs: ${allPages.length}`);
  console.log(`   Static  : ${staticPages.length}`);
  console.log(`   Dynamic : ${dynamicPages.length}`);
})();