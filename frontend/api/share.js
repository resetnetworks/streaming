// Located at frontend/api/share.js

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

  const cleanText = (text, maxLen) => {
    if (!text) return "";
    const cleaned = text.replace(/\s+/g, ' ').trim();
    if (cleaned.length <= maxLen) return cleaned;
    return cleaned.slice(0, maxLen - 3) + "...";
  };

  try {
    if (type === 'song' && id) {
      const apiRes = await fetch(`${BACKEND_URL}/api/songs/${id}`);
      if (apiRes.ok) {
        const data = await apiRes.json();
        const song = data.song || data;
        if (song && song.title) {
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

  // Return minimal HTML containing dynamic meta tags for social share bots
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta property="og:site_name" content="Reset Music">
  <meta property="og:type" content="${pageType}">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${image}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${image}">
</head>
<body>
  <p>Redirecting to Reset Music...</p>
  <script>
    window.location.href = "${pageUrl}";
  </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html;charset=UTF-8');
  res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache response for 24 hours
  return res.status(200).send(html);
}
