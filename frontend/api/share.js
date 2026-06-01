import fs from 'fs';
import path from 'path';

// Helper function to escape HTML entities for meta tags
function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default async function handler(req, res) {
  const { type, id } = req.query;

  // Default values (fallback to standard home page meta tags)
  let title = "Reset Streaming Platform - Reset Music | Instrumental Music";
  let description = "Stream ambient, instrumental, classical and experimental music. Built for next generation musicians, sound designers, listeners and audiophiles.";
  let imageUrl = "https://musicreset.com/og-image-1200x630.jpg";

  // Use production or fallback to local API URL
  const apiUrl = process.env.VITE_API_URL || "http://localhost:4000/api";

  if (id && (type === 'album' || type === 'song' || type === 'artist')) {
    try {
      let fetchUrl = '';
      if (type === 'album') {
        fetchUrl = `${apiUrl}/albums/${id}`;
      } else if (type === 'song') {
        fetchUrl = `${apiUrl}/songs/${id}`;
      } else if (type === 'artist') {
        fetchUrl = `${apiUrl}/artists/${id}`;
      }

      console.log(`[Share API] Fetching metadata from: ${fetchUrl}`);
      const apiResponse = await fetch(fetchUrl);
      
      if (apiResponse.ok) {
        const json = await apiResponse.json();
        
        if (type === 'album' && json.data) {
          const album = json.data;
          const artistName = album.artist && (typeof album.artist === 'object') ? album.artist.name : '';
          title = `${album.title}${artistName ? ` by ${artistName}` : ''} - Reset Music`;
          description = album.description || `Listen to ${album.title} on Reset Music.`;
          if (album.coverImage) {
            imageUrl = album.coverImage;
          }
        } else if (type === 'song' && json.song) {
          const song = json.song;
          const artistName = song.artist && (typeof song.artist === 'object') ? song.artist.name : '';
          title = `${song.title}${artistName ? ` by ${artistName}` : ''} - Reset Music`;
          description = `Listen to ${song.title} on Reset Music.`;
          if (song.coverImage) {
            imageUrl = song.coverImage;
          }
        } else if (type === 'artist' && json.data) {
          const artist = json.data;
          title = `${artist.name} - Reset Music`;
          description = artist.bio || `Explore tracks and albums by ${artist.name} on Reset Music.`;
          if (artist.profileImage) {
            imageUrl = artist.profileImage;
          } else if (artist.coverImage) {
            imageUrl = artist.coverImage;
          }
        }
      } else {
        console.warn(`[Share API] API responded with status: ${apiResponse.status}`);
      }
    } catch (error) {
      console.error("[Share API] Error fetching sharing metadata:", error);
    }
  }

  try {
    // Read the built index.html from dist, fallback to project root index.html for development
    let htmlPath = path.join(process.cwd(), 'dist', 'index.html');
    if (!fs.existsSync(htmlPath)) {
      htmlPath = path.join(process.cwd(), 'index.html');
    }
    
    let html = fs.readFileSync(htmlPath, 'utf8');

    // Robust replacements of tags
    // 1. Replace <title>
    const titleRegex = /<title>[^<]*<\/title>/i;
    if (titleRegex.test(html)) {
      html = html.replace(titleRegex, `<title>${escapeHtml(title)}</title>`);
    } else {
      html = html.replace('</head>', `<title>${escapeHtml(title)}</title>\n</head>`);
    }

    // 2. Replace description tag
    const descRegex = /<meta\s+name=["']description["']\s+content=["'][^"']*["']\s*\/?>/i;
    if (descRegex.test(html)) {
      html = html.replace(descRegex, `<meta name="description" content="${escapeHtml(description)}" />`);
    } else {
      html = html.replace('</head>', `<meta name="description" content="${escapeHtml(description)}" />\n</head>`);
    }

    // 3. Replace og:title
    const ogTitleRegex = /<meta\s+property=["']og:title["']\s+content=["'][^"']*["']\s*\/?>/i;
    if (ogTitleRegex.test(html)) {
      html = html.replace(ogTitleRegex, `<meta property="og:title" content="${escapeHtml(title)}" />`);
    } else {
      html = html.replace('</head>', `<meta property="og:title" content="${escapeHtml(title)}" />\n</head>`);
    }

    // 4. Replace og:description
    const ogDescRegex = /<meta\s+property=["']og:description["']\s+content=["'][^"']*["']\s*\/?>/i;
    if (ogDescRegex.test(html)) {
      html = html.replace(ogDescRegex, `<meta property="og:description" content="${escapeHtml(description)}" />`);
    } else {
      html = html.replace('</head>', `<meta property="og:description" content="${escapeHtml(description)}" />\n</head>`);
    }

    // 5. Replace og:image
    const ogImageRegex = /<meta\s+property=["']og:image["']\s+content=["'][^"']*["']\s*\/?>/i;
    if (ogImageRegex.test(html)) {
      html = html.replace(ogImageRegex, `<meta property="og:image" content="${escapeHtml(imageUrl)}" />`);
    } else {
      html = html.replace('</head>', `<meta property="og:image" content="${escapeHtml(imageUrl)}" />\n</head>`);
    }

    // 6. Clean up or inject Twitter Card Tags
    const twitterCardRegex = /<meta\s+name=["']twitter:[^"']*["']\s+content=["'][^"']*["']\s*\/?>/gi;
    html = html.replace(twitterCardRegex, ''); // Remove existing ones to avoid duplicates
    
    const twitterTags = `
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="${escapeHtml(title)}" />
      <meta name="twitter:description" content="${escapeHtml(description)}" />
      <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />
    `;
    html = html.replace('</head>', `${twitterTags}\n</head>`);

    // Return the response
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (err) {
    console.error("[Share API] Error serving index.html:", err);
    res.status(500).send("Internal Server Error");
  }
}
