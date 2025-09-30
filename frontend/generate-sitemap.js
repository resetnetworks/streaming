// generate-sitemap.js
import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 👇 Your domain (must be https if deployed with SSL)
const BASE_URL = 'https://www.musicreset.com';

const pages = [
  // ===== MAIN PAGES (Static) =====
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/login', changefreq: 'monthly', priority: 0.5 },
  { url: '/register', changefreq: 'monthly', priority: 0.5 },
  
  // ===== LEGAL & INFO PAGES =====
  { url: '/contact-us', changefreq: 'weekly', priority: 0.8 },
  { url: '/about-us', changefreq: 'weekly', priority: 0.8 },
  { url: '/privacy-policy', changefreq: 'weekly', priority: 0.8 },
  { url: '/terms-and-conditions', changefreq: 'weekly', priority: 0.9 },
  { url: '/cancellation-refund-policy', changefreq: 'weekly', priority: 0.8 },
  { url: '/data-deletion', changefreq: 'weekly', priority: 0.8 },
];

(async () => {
  const sitemap = new SitemapStream({ hostname: BASE_URL });

  const writeStream = createWriteStream(resolve(__dirname, 'public', 'sitemap.xml'));
  sitemap.pipe(writeStream);

  pages.forEach(page => sitemap.write(page));
  sitemap.end();

  await streamToPromise(sitemap);
  console.log('✅ Sitemap generated at public/sitemap.xml');
})();
