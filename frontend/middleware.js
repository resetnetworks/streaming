// middleware.js
// Located at frontend/middleware.js

export const config = {
  matcher: [
    '/song/:id*',
    '/album/:id*',
    '/artist/:id*',
  ],
};

export async function middleware(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Immediately ignore static subroutes under /artist/ or others
  if (path === '/artist/register' || path === '/artist/dashboard') {
    return;
  }

  const userAgent = request.headers.get('user-agent') || '';
  
  // List of scrapers/crawlers that fetch HTML for link previews
  const botRegex = /bot|crawler|spider|facebookexternalhit|whatsapp|twitterbot|linkedinbot|telegrambot|discordbot|slackbot/i;
  
  if (botRegex.test(userAgent)) {
    // Default metadata values
    let title = "Reset Music";
    let description = "Stream ambient, electronic, and experimental music on Reset Music.";
    let image = "https://musicreset.com/images/home.png"; // Fallback og-image
    let type = "website";
    
    const BACKEND_URL = "https://api.musicreset.com";
    
    try {
      if (path.startsWith('/song/')) {
        const id = path.split('/')[2];
        if (id) {
          const res = await fetch(`${BACKEND_URL}/api/songs/${id}`);
          if (res.ok) {
            const data = await res.json();
            const song = data.song || data;
            if (song && song.title) {
              title = `${song.title} by ${song.artist?.name || song.singer || 'Unknown'} | Reset Music`;
              description = song.description || `Listen to '${song.title}' on Reset Music.`;
              image = song.coverImage || song.album?.coverImage || image;
              type = "music.song";
            }
          }
        }
      } else if (path.startsWith('/album/')) {
        const id = path.split('/')[2];
        if (id) {
          const res = await fetch(`${BACKEND_URL}/api/albums/${id}`);
          if (res.ok) {
            const data = await res.json();
            const album = data.album || data;
            if (album && album.title) {
              const artistName = (album.artist && typeof album.artist === 'object') ? album.artist.name : 'Unknown Artist';
              title = `Album: ${album.title} by ${artistName} | Reset Music`;
              description = album.description || `Listen to '${album.title}' on Reset Music.`;
              image = album.coverImage || image;
              type = "music.album";
            }
          }
        }
      } else if (path.startsWith('/artist/')) {
        const id = path.split('/')[2];
        if (id) {
          const res = await fetch(`${BACKEND_URL}/api/artists/${id}`);
          if (res.ok) {
            const data = await res.json();
            const artist = data.data || data.artist || data;
            if (artist && artist.name) {
              title = `${artist.name} – Reset Music Streaming Artist Profile`;
              description = artist.bio || artist.biography || `Explore exclusive music, albums, and singles of ${artist.name} on Reset Music.`;
              image = artist.profileImage || artist.image || image;
              type = "profile";
            }
          }
        }
      }
    } catch (err) {
      console.warn("⚠️ Middleware metadata fetch failed:", err.message);
    }
    
    // Return custom minimal HTML for crawler/scraper card generators
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta property="og:type" content="${type}">
  <meta property="og:url" content="${url.href}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${image}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${image}">
</head>
<body>
  <p>Loading Reset Music...</p>
</body>
</html>`;
    
    return new Response(html, {
      headers: {
        'content-type': 'text/html;charset=UTF-8',
        'cache-control': 'public, max-age=86400', // Cache response for 24 hours
      },
    });
  }
}
