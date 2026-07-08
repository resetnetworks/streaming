import fs from 'fs';
import path from 'path';

// Clean text helper to prevent broken layout or quotes in meta content
const cleanText = (text, maxLen) => {
  if (!text) return "";
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLen) return cleaned;
  return cleaned.slice(0, maxLen - 3) + "...";
};

// Date formatter helper
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    return "";
  }
};

// Duration formatter helper (converts seconds to MM:SS)
const formatDuration = (seconds) => {
  if (!seconds) return "";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
};

// Generate static structured HTML for crawlers and search engine bots
function generateHtmlContent(type, data) {
  if (!data) return '';

  if (type === 'song') {
    const song = data;
    const artistName = song.artist?.name || song.singer || 'Unknown Artist';
    const albumTitle = song.album?.title || '';
    const genres = Array.isArray(song.genre) ? song.genre : (song.genre ? [song.genre] : []);
    
    return `
      <div style="padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 800px; margin: 0 auto; color: #fff; background-color: #0b0f19;">
        <header>
          <span style="text-transform: uppercase; font-size: 12px; letter-spacing: 2px; color: #4DB3FF; font-weight: bold;">Track</span>
          <h1 style="font-size: 36px; margin: 10px 0 5px 0;">${song.title}</h1>
          <p style="font-size: 18px; margin: 0 0 20px 0; color: #ccc;">by <strong>${artistName}</strong></p>
        </header>
        
        ${song.coverImage || song.album?.coverImage ? `
          <div style="margin-bottom: 20px;">
            <img src="${song.coverImage || song.album?.coverImage}" alt="${song.title} cover" style="max-width: 300px; border-radius: 12px;" />
          </div>
        ` : ''}

        <section style="line-height: 1.6; margin-bottom: 30px;">
          ${song.description ? `<p style="font-size: 16px; color: #e2e8f0;">${song.description}</p>` : '<p style="font-style: italic; color: #718096;">Listen to ' + song.title + ' on Reset Music.</p>'}
        </section>

        <section style="background-color: #1a202c; padding: 20px; border-radius: 8px; font-size: 14px; color: #cbd5e0;">
          ${albumTitle ? `<p style="margin: 5px 0;"><strong>Album:</strong> ${albumTitle}</p>` : ''}
          ${song.releaseDate ? `<p style="margin: 5px 0;"><strong>Released:</strong> ${formatDate(song.releaseDate)}</p>` : ''}
          ${genres.length > 0 ? `<p style="margin: 5px 0;"><strong>Genre:</strong> ${genres.join(', ')}</p>` : ''}
          ${song.duration ? `<p style="margin: 5px 0;"><strong>Duration:</strong> ${formatDuration(song.duration)}</p>` : ''}
          ${song.copyright ? `<p style="margin: 5px 0; font-size: 12px; color: #a0aec0;">© ${song.copyright}</p>` : ''}
        </section>
      </div>
    `;
  }
  
  if (type === 'album') {
    const album = data;
    const artistName = (album.artist && typeof album.artist === 'object') ? album.artist.name : 'Unknown Artist';
    const genres = Array.isArray(album.genres) ? album.genres : (Array.isArray(album.genre) ? album.genre : []);
    const songs = Array.isArray(album.songs) ? album.songs : [];

    return `
      <div style="padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 800px; margin: 0 auto; color: #fff; background-color: #0b0f19;">
        <header>
          <span style="text-transform: uppercase; font-size: 12px; letter-spacing: 2px; color: #4DB3FF; font-weight: bold;">Album</span>
          <h1 style="font-size: 36px; margin: 10px 0 5px 0;">${album.title}</h1>
          <p style="font-size: 18px; margin: 0 0 20px 0; color: #ccc;">by <strong>${artistName}</strong></p>
        </header>

        ${album.coverImage ? `
          <div style="margin-bottom: 20px;">
            <img src="${album.coverImage}" alt="${album.title} cover" style="max-width: 300px; border-radius: 12px;" />
          </div>
        ` : ''}

        <section style="line-height: 1.6; margin-bottom: 30px;">
          ${album.description ? `<p style="font-size: 16px; color: #e2e8f0;">${album.description}</p>` : '<p style="font-style: italic; color: #718096;">Listen to ' + album.title + ' on Reset Music.</p>'}
        </section>

        <section style="background-color: #1a202c; padding: 20px; border-radius: 8px; font-size: 14px; color: #cbd5e0; margin-bottom: 30px;">
          ${album.releaseDate ? `<p style="margin: 5px 0;"><strong>Released:</strong> ${formatDate(album.releaseDate)}</p>` : ''}
          ${genres.length > 0 ? `<p style="margin: 5px 0;"><strong>Genre:</strong> ${genres.join(', ')}</p>` : ''}
          <p style="margin: 5px 0;"><strong>Total Tracks:</strong> ${songs.length}</p>
        </section>

        <section>
          <h3 style="font-size: 20px; border-bottom: 1px solid #2d3748; padding-bottom: 10px; margin-bottom: 15px;">Track List</h3>
          ${songs.length > 0 ? `
            <ol style="padding-left: 20px; line-height: 2;">
              ${songs.map(song => `
                <li style="margin-bottom: 8px;">
                  <strong>${song.title}</strong> 
                  ${song.duration ? `<span style="color: #a0aec0; font-size: 12px; margin-left: 10px;">(${formatDuration(song.duration)})</span>` : ''}
                </li>
              `).join('')}
            </ol>
          ` : '<p style="font-style: italic; color: #718096;">No tracks listed.</p>'}
        </section>
      </div>
    `;
  }

  if (type === 'artist') {
    const artist = data;
    const genres = Array.isArray(artist.genres) ? artist.genres : (Array.isArray(artist.genre) ? artist.genre : []);
    const bio = artist.bio || artist.biography || '';

    return `
      <div style="padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 800px; margin: 0 auto; color: #fff; background-color: #0b0f19;">
        <header>
          <span style="text-transform: uppercase; font-size: 12px; letter-spacing: 2px; color: #4DB3FF; font-weight: bold;">Artist Profile</span>
          <h1 style="font-size: 36px; margin: 10px 0 5px 0;">${artist.name}</h1>
        </header>

        ${artist.profileImage || artist.image ? `
          <div style="margin-bottom: 20px;">
            <img src="${artist.profileImage || artist.image}" alt="${artist.name}" style="max-width: 300px; border-radius: 50%; width: 200px; height: 200px; object-fit: cover;" />
          </div>
        ` : ''}

        <section style="line-height: 1.6; margin-bottom: 30px;">
          <h3 style="font-size: 20px; border-bottom: 1px solid #2d3748; padding-bottom: 10px; margin-bottom: 15px;">Biography</h3>
          ${bio ? `<p style="font-size: 16px; color: #e2e8f0; white-space: pre-line;">${bio}</p>` : `<p style="font-style: italic; color: #718096;">Explore exclusive music, albums, and singles of ${artist.name} on Reset Music.</p>`}
        </section>

        ${genres.length > 0 ? `
          <section style="background-color: #1a202c; padding: 20px; border-radius: 8px; font-size: 14px; color: #cbd5e0;">
            <p style="margin: 0;"><strong>Genres:</strong> ${genres.join(', ')}</p>
          </section>
        ` : ''}
      </div>
    `;
  }

  return '';
}

// Read index.html local template file from filesystem
function getLocalTemplate() {
  const possiblePaths = [
    path.join(process.cwd(), 'dist', 'index.html'),
    path.join(process.cwd(), 'index.html'),
    path.join(process.cwd(), 'frontend', 'dist', 'index.html'),
    path.join(process.cwd(), 'frontend', 'index.html'),
    path.join(process.cwd(), '.next', 'server', 'dist', 'index.html'),
    path.join(process.cwd(), 'api', 'dist', 'index.html'),
  ];
  for (const p of possiblePaths) {
    try {
      if (fs.existsSync(p)) {
        return fs.readFileSync(p, 'utf8');
      }
    } catch (e) {
      // ignore errors during existence check
    }
  }
  return null;
}

// Get the index.html template (filesystem or HTTP fallback)
async function getTemplate(req) {
  const local = getLocalTemplate();
  if (local) return local;

  // Fallback to fetch from host
  try {
    const host = req.headers.host || "musicreset.com";
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const templateUrl = `${protocol}://${host}/index.html`;
    const res = await fetch(templateUrl);
    if (res.ok) {
      return await res.text();
    }
  } catch (err) {
    console.warn("⚠️ Failed to fetch index.html from host:", err.message);
  }

  // Final fallback to minimal layout if all else fails
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Reset Music</title>
  <meta name="description" content="Stream ambient, electronic, and experimental music on Reset Music.">
</head>
<body style="background-color: #0b0f19; color: #fff;">
  <div id="root"></div>
</body>
</html>`;
}

// Inject new meta tags and body content into template
function injectMetaTags(html, metadata, bodyContent) {
  const { title, description, image, pageType, pageUrl } = metadata;

  // Strip existing tags to prevent duplicates
  let cleanHtml = html.replace(/<title>[\s\S]*?<\/title>/gi, '');
  cleanHtml = cleanHtml.replace(/<meta\s+name=["']description["'][\s\S]*?>/gi, '');
  cleanHtml = cleanHtml.replace(/<meta\s+property=["']og:(title|description|image|type|url|site_name|image:width|image:height|image:alt|locale)["'][\s\S]*?>/gi, '');
  cleanHtml = cleanHtml.replace(/<meta\s+name=["']twitter:[\s\S]*?>/gi, '');

  const newMetaBlock = `
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta property="og:site_name" content="Reset Music">
  <meta property="og:type" content="${pageType}">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${image}">
  `;

  // Inject metadata right after <head>
  let finalHtml = cleanHtml.replace(/<head>/i, `<head>${newMetaBlock}`);

  // Inject content inside <div id="root"></div>
  finalHtml = finalHtml.replace(/<div\s+id=["']root["']\s*>\s*<\/div>/i, `<div id="root">${bodyContent}</div>`);

  return finalHtml;
}

export default async function handler(req, res) {
  const { type, id } = req.query;

  // Default fallback values
  let title = "Reset Music";
  let description = "Stream ambient, electronic, and experimental music on Reset Music.";
  let image = "https://musicreset.com/images/home.png"; // Fallback og-image
  let pageType = "website";
  const BACKEND_URL = "https://api.musicreset.com";

  // Build the page URL to match the requested song/album/artist page
  const host = req.headers.host || "musicreset.com";
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const pageUrl = `${protocol}://${host}/${type}/${id}`;

  let rawData = null;

  try {
    if (type === 'song' && id) {
      const apiRes = await fetch(`${BACKEND_URL}/api/songs/${id}`);
      if (apiRes.ok) {
        const data = await apiRes.json();
        const song = data.song || data;
        if (song && song.title) {
          rawData = song;
          title = `${song.title} by ${song.artist?.name || song.singer || 'Unknown'}`;
          description = cleanText(song.description, 120) || `Listen to '${song.title}' on Reset Music.`;
          image = song.coverImage || song.album?.coverImage || image;
          pageType = "music.song";
        }
      }
    } else if (type === 'album' && id) {
      const apiRes = await fetch(`${BACKEND_URL}/api/albums/${id}`);
      if (apiRes.ok) {
        const data = await apiRes.json();
        const album = data.data || data.album || data;
        if (album && album.title) {
          rawData = album;
          const artistName = (album.artist && typeof album.artist === 'object') ? album.artist.name : 'Unknown Artist';
          title = `${album.title} by ${artistName}`;
          description = cleanText(album.description, 120) || `Listen to '${album.title}' on Reset Music.`;
          image = album.coverImage || image;
          pageType = "music.album";
        }
      }
    } else if (type === 'artist' && id) {
      const apiRes = await fetch(`${BACKEND_URL}/api/artists/${id}`);
      if (apiRes.ok) {
        const data = await apiRes.json();
        const artist = data.data || data.artist || data;
        if (artist && artist.name) {
          rawData = artist;
          title = `${artist.name} on Reset Music`;
          description = cleanText(artist.bio || artist.biography, 120) || `Explore exclusive music, albums, and singles of ${artist.name} on Reset Music.`;
          image = artist.profileImage || artist.image || image;
          pageType = "profile";
        }
      }
    }
  } catch (err) {
    console.warn("⚠️ Share API metadata fetch failed:", err.message);
  }

  // Load the full template index.html
  const template = await getTemplate(req);

  // Generate crawler-friendly structural body text
  const bodyContent = generateHtmlContent(type, rawData);

  // Combine metadata and body content into the template
  const finalHtml = injectMetaTags(template, {
    title,
    description,
    image,
    pageType,
    pageUrl
  }, bodyContent);

  res.setHeader('Content-Type', 'text/html;charset=UTF-8');
  res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache response for 24 hours
  return res.status(200).send(finalHtml);
}
