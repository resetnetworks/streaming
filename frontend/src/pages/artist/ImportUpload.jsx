import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  IoCloudUploadOutline,
  IoCheckmarkCircle,
  IoPlay,
  IoPause,
  IoSync,
  IoCalendarOutline,
  IoLinkOutline,
  IoTrashOutline,
  IoCloseOutline,
  IoDiscOutline,
  IoEllipseOutline,
  IoDownloadOutline,
} from "react-icons/io5";

// Helper to parse artist name from URL
const getArtistNameFromUrl = (urlStr) => {
  try {
    const parsed = new URL(urlStr);
    const host = parsed.hostname;
    if (host.includes("bandcamp.com")) {
      const parts = host.split(".");
      if (parts.length >= 3) {
        const rawName = parts[0];
        return rawName
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      }
    }
    return "Neon Horizon";
  } catch {
    return "Neon Horizon";
  }
};

// Generates a mock discography matching the theme & data in the request
const generateMockDiscography = (urlStr) => {
  const artistName = getArtistNameFromUrl(urlStr);
  return {
    artistName,
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAbU1BGWATR6VReSoPt2Qc4cGgyBLiD_XDh-eDjuEJkc1cKMlaQmYfz8bFh1U__z7jjBGcNKtixArhzqpbVJZvV-U6d8UAbYktmRtkN9JB17Uz4VBdComfvyVlSNhUjImJ-mCorOS5FCIQ2iAmfcp6tojGNpN_2xVjqXAH2jRQltWHMK_3tOqNIEv29oBOWl_r0NrI8jkSJ-HXC_o98UOaBR2PEo7tEiuQ9iPEE7CCKX6MMo_MEjdg0y4R5p11GBVdwBDAJVPioX8tK",
    genres: ["Electronic", "Synthwave", "Cyberpunk"],
    releases: [
      {
        id: "rel-1",
        title: "Project Nebula",
        coverImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuBxbkhQtamnh0eFHTIkm8FNUxdAAcmCTgMWSOZdhj5bdg2ZIHWDd5EROYuEeerkV8KY4e5vyIELC9ZmwWF67uMI9VXmC0OmFVIQwEUO8Jcxzlco7cs52Z1gJrdDwY2zxGDfIpHGReexIxTiKRyc2bx16oHqL_-lQMRpz2oFtHlFx6fso8xC0vPd3vLC8VUsLjIZ5-X6y2HfbQ67ErpK8_LePX2cLi4PsqBSf-z4mL1CIIqenYGpHrhHE14JUSyxlEU0NBnXydg4wRZO",
        releaseDate: "2023-05-12",
        year: "2023",
        genre: "Synthwave",
        description: "A futuristic voyage into neon-drenched skies and high-speed synth grids.",
        tracks: [
          { id: "tr-1-1", number: "01", title: "Nebula Drift", duration: "03:45", file: null, previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
          { id: "tr-1-2", number: "02", title: "Cosmic Highway", duration: "04:12", file: null, previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
          { id: "tr-1-3", number: "03", title: "Stardust Echoes", duration: "02:58", file: null, previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
          { id: "tr-1-4", number: "04", title: "Retro Void", duration: "05:01", file: null, previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
          { id: "tr-1-5", number: "05", title: "Solar Wind", duration: "03:30", file: null, previewUrl: "" },
          { id: "tr-1-6", number: "06", title: "Event Horizon", duration: "04:15", file: null, previewUrl: "" },
          { id: "tr-1-7", number: "07", title: "Binary Star", duration: "03:22", file: null, previewUrl: "" },
          { id: "tr-1-8", number: "08", title: "Deep Space Pulse", duration: "06:10", file: null, previewUrl: "" }
        ]
      },
      {
        id: "rel-2",
        title: "Stellar Drift",
        coverImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuA5VPUds3jXldu9vTjIS3rAD-RdEDGaj7qneu2XkrxranP2hR3tNwriDi4LBzX7rdvcR8IwsbG7izt82MJDmGUnNTKKlx7CFCu7jTa_7pAiRCQBpL9L4ZfIoSEH56KapAb1MWXDkchLsovo__CNA_hVcqjSOJDXELmcUYxVuS0nLrPNdgGKB8XcAxARcGUwqXGQe52rm6vDSdZVpQvnvVVlXyAXgvBt9SMf7-7yjV32LWoy4lubfWk1XXZqml3QE0BM8m9uJKyriKzc",
        releaseDate: "2021-10-08",
        year: "2021",
        genre: "Cyberpunk",
        description: "Dark atmosphere and ambient synthetic noises mirroring deep stellar cosmic streams.",
        tracks: [
          { id: "tr-2-1", number: "01", title: "Arrival Vector", duration: "02:30", file: null, previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
          { id: "tr-2-2", number: "02", title: "Stellar Drift", duration: "04:45", file: null, previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3" },
          { id: "tr-2-3", number: "03", title: "Gravity Well", duration: "03:55", file: null, previewUrl: "" },
          { id: "tr-2-4", number: "04", title: "Quantum Dust", duration: "04:10", file: null, previewUrl: "" },
          { id: "tr-2-5", number: "05", title: "Dark Matter Pulse", duration: "05:20", file: null, previewUrl: "" },
          { id: "tr-2-6", number: "06", title: "Neutron Horizon", duration: "03:15", file: null, previewUrl: "" },
          { id: "tr-2-7", number: "07", title: "Solar Flare", duration: "03:50", file: null, previewUrl: "" },
          { id: "tr-2-8", number: "08", title: "Anomalous Reading", duration: "04:05", file: null, previewUrl: "" },
          { id: "tr-2-9", number: "09", title: "Zero Gravity Bounce", duration: "03:40", file: null, previewUrl: "" },
          { id: "tr-2-10", number: "10", title: "Hyperdrive Engaged", duration: "05:12", file: null, previewUrl: "" },
          { id: "tr-2-11", number: "11", title: "Cosmic Background", duration: "06:02", file: null, previewUrl: "" },
          { id: "tr-2-12", number: "12", title: "Singularity", duration: "07:15", file: null, previewUrl: "" }
        ]
      },
      {
        id: "rel-3",
        title: "Void Echoes",
        coverImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuCEQO-vXtFWe4SD34FaH5I0qYlZ-Cwlh81CgoFCbdtO3zkrF6iaRA4hRcUjsMzVqMp2YTTvdvKob6hhtfGnURAm8nVv82YKFYuK6Fxj76UXGsU9SxmSSPXMAYKgf5yF3hgV0duwaroaGCq7R1TakHhwBF-xg-MgBRp-MGLauR5nhxt6F22a_MDW4C97OB4HQH2I4neJt2ROxKYJSX2jZJ_mwcMhrhXTSgilaJOzGOrN2XJu-JAKlJ0kGN6R6isAjlzUBw8dJ07459Ai",
        releaseDate: "2020-03-20",
        year: "2020",
        genre: "Ambient",
        description: "Surreal minimalist sounds exploring the acoustic response of the hollow infinite.",
        tracks: [
          { id: "tr-3-1", number: "01", title: "Silent Ocean", duration: "05:40", file: null, previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3" },
          { id: "tr-3-2", number: "02", title: "Monolith Reflect", duration: "06:12", file: null, previewUrl: "" },
          { id: "tr-3-3", number: "03", title: "Pale Ringed Planet", duration: "04:58", file: null, previewUrl: "" },
          { id: "tr-3-4", number: "04", title: "Echo Chamber", duration: "08:15", file: null, previewUrl: "" },
          { id: "tr-3-5", number: "05", title: "Infinite Descent", duration: "10:04", file: null, previewUrl: "" }
        ]
      },
      {
        id: "rel-4",
        title: "Neon Nights EP",
        coverImage: null,
        releaseDate: "2019-11-01",
        year: "2019",
        genre: "Electronic",
        description: "Late night drives, fluorescent retro beats, and nostalgic synthesizers.",
        tracks: [
          { id: "tr-4-1", number: "01", title: "Fluorescent Streets", duration: "03:20", file: null, previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" },
          { id: "tr-4-2", number: "02", title: "Midnight Cruiser", duration: "04:05", file: null, previewUrl: "" },
          { id: "tr-4-3", number: "03", title: "Grid Run", duration: "03:45", file: null, previewUrl: "" },
          { id: "tr-4-4", number: "04", title: "Nostalgic Reflection", duration: "05:10", file: null, previewUrl: "" }
        ]
      }
    ]
  };
};

export default function ImportUpload({ onCancel, onComplete }) {
  // Mode selection state: determined directly from localStorage selection
  const [importMode] = useState(() => {
    const savedType = localStorage.getItem("selectedImportType") || "single";
    // Map SelectImportType output ('single' or 'artist') to our page state modes
    return savedType === "single" ? "single" : "discography";
  });

  // Search URLs
  const [singleUrl, setSingleUrl] = useState("https://music.apple.com/us/album/random-access-memories/617154241");
  const [discographyUrl, setDiscographyUrl] = useState("https://neonavigator.bandcamp.com");
  const [loading, setLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Discography State
  const [artistProfile, setArtistProfile] = useState(null);
  const [selectedReleases, setSelectedReleases] = useState(new Set());

  // Inspect / Single Album Form states
  const [inspectingRelease, setInspectingRelease] = useState(null);
  const [albumTitle, setAlbumTitle] = useState("Project Nebula");
  const [genre, setGenre] = useState("Electronic");
  const [releaseDate, setReleaseDate] = useState("2024-11-15");
  const [description, setDescription] = useState("An exploration of sonic landscapes and deep space frequencies.");
  const [coverUrl, setCoverUrl] = useState("https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=500&auto=format&fit=crop");
  const [tracks, setTracks] = useState([]);

  // Audio player preview states
  const [playingTrackId, setPlayingTrackId] = useState(null);
  const audioRef = useRef(new Audio());
  const fileInputRef = useRef(null);

  // Play / Pause preview clip
  const handleTogglePreview = (track) => {
    if (!track.previewUrl) {
      toast.error("Audio preview not available for this track.");
      return;
    }

    if (playingTrackId === track.id) {
      audioRef.current.pause();
      setPlayingTrackId(null);
    } else {
      audioRef.current.src = track.previewUrl;
      audioRef.current.play();
      setPlayingTrackId(track.id);
    }
  };

  // Pause preview when modal closes or component unmounts
  useEffect(() => {
    const currentAudio = audioRef.current;
    return () => {
      currentAudio.pause();
    };
  }, []);

  const formatSecondsToMMSS = (sec) => {
    if (!sec) return "0:00";
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Single release uploader - Attach single file selection
  const handleSingleFileSelect = (trackId, file) => {
    if (!file) return;
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, file } : t))
    );
    toast.success(`Attached "${file.name}" to track.`);
  };

  // Single release uploader - Bulk map multiple files
  const handleBulkFilesSelect = (files) => {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);

    if (tracks.length === 0) {
      const newTracks = fileList.map((file, idx) => {
        let number = String(idx + 1).padStart(2, "0");
        let title = file.name.replace(/\.[^/.]+$/, "");
        title = title.replace(/^\d+[\s-_]*/, "");
        return {
          id: `tr-manual-${idx + 1}`,
          number,
          title,
          duration: "03:00",
          file: file,
          previewUrl: "",
        };
      });
      setTracks(newTracks);
      toast.success(`Imported ${fileList.length} track files!`);
    } else {
      setTracks((prev) => {
        let unassignedFiles = [...fileList];
        return prev.map((track) => {
          const matchedIndex = unassignedFiles.findIndex(
            (f) =>
              f.name.toLowerCase().includes(track.title.toLowerCase()) ||
              f.name.includes(track.number)
          );

          if (matchedIndex !== -1) {
            const matchedFile = unassignedFiles[matchedIndex];
            unassignedFiles.splice(matchedIndex, 1);
            return { ...track, file: matchedFile };
          }

          if (unassignedFiles.length > 0 && !track.file) {
            const fallbackFile = unassignedFiles.shift();
            return { ...track, file: fallbackFile };
          }

          return track;
        });
      });
      toast.success(`Processed ${fileList.length} files. Mapping complete!`);
    }
  };

  // Single Mode Scraper
  const handleSingleScrape = async () => {
    if (!singleUrl.trim()) {
      toast.error("Please paste a URL first!");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Crawling music metadata from external source...");

    try {
      let apiEndpoint = `/api/import-bandcamp?url=${encodeURIComponent(singleUrl.trim())}`;
      if (window.location.hostname === "localhost") {
        apiEndpoint = `http://localhost:5005/api/scrape?url=${encodeURIComponent(singleUrl.trim())}`;
      }

      let data = null;
      try {
        const res = await fetch(apiEndpoint);
        if (res.ok) {
          const json = await res.json();
          if (json && json.releases && json.releases.length > 0) {
            data = json.releases[0];
          } else if (json && json.title) {
            data = json;
          }
        }
      } catch (err) {
        console.warn("Backend API not reachable; generating mock single release.", err);
      }

      if (!data) {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        data = {
          title: "Project Nebula",
          genre: "Synthwave",
          releaseDate: "2023-05-12",
          description: "A futuristic voyage into neon-drenched skies and high-speed synth grids.",
          coverImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuBxbkhQtamnh0eFHTIkm8FNUxdAAcmCTgMWSOZdhj5bdg2ZIHWDd5EROYuEeerkV8KY4e5vyIELC9ZmwWF67uMI9VXmC0OmFVIQwEUO8Jcxzlco7cs52Z1gJrdDwY2zxGDfIpHGReexIxTiKRyc2bx16oHqL_-lQMRpz2oFtHlFx6fso8xC0vPd3vLC8VUsLjIZ5-X6y2HfbQ67ErpK8_LePX2cLi4PsqBSf-z4mL1CIIqenYGpHrhHE14JUSyxlEU0NBnXydg4wRZO",
          tracks: [
            { id: "tr-1", number: "01", title: "Nebula Drift", duration: "03:45", file: null, previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
            { id: "tr-2", number: "02", title: "Cosmic Highway", duration: "04:12", file: null, previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
            { id: "tr-3", number: "03", title: "Stardust Echoes", duration: "02:58", file: null, previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
            { id: "tr-4", number: "04", title: "Retro Void", duration: "05:01", file: null, previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
            { id: "tr-5", number: "05", title: "Solar Wind", duration: "03:30", file: null, previewUrl: "" },
            { id: "tr-6", number: "06", title: "Event Horizon", duration: "04:15", file: null, previewUrl: "" },
            { id: "tr-7", number: "07", title: "Binary Star", duration: "03:22", file: null, previewUrl: "" },
            { id: "tr-8", number: "08", title: "Deep Space Pulse", duration: "06:10", file: null, previewUrl: "" }
          ]
        };
      }

      setAlbumTitle(data.title || "Untitled Release");
      setGenre(data.genre || "Electronic");
      setReleaseDate(data.releaseDate ? data.releaseDate.split("T")[0] : "");
      setDescription(data.description || "");
      setCoverUrl(data.coverImage || "");

      if (data.tracks && data.tracks.length > 0) {
        setTracks(
          data.tracks.map((t, idx) => ({
            id: t.id || `tr-${idx + 1}`,
            number: t.number || String(idx + 1).padStart(2, "0"),
            title: t.title || "Untitled Track",
            duration: typeof t.duration === "number" ? formatSecondsToMMSS(t.duration) : (t.duration || "03:00"),
            file: t.file || null,
            previewUrl: t.previewUrl || "",
          }))
        );
      } else {
        setTracks([]);
      }

      toast.success("Single release metadata pre-filled!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to import single release", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // Discography Mode Scraper
  const handleDiscographyScrape = async () => {
    if (!discographyUrl.trim()) {
      toast.error("Please paste a URL first!");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Indexing artist discography metadata...");

    try {
      let apiEndpoint = `/api/import-bandcamp?url=${encodeURIComponent(discographyUrl.trim())}`;
      if (window.location.hostname === "localhost") {
        apiEndpoint = `http://localhost:5005/api/scrape?url=${encodeURIComponent(discographyUrl.trim())}`;
      }

      let profileData = null;
      try {
        const res = await fetch(apiEndpoint);
        if (res.ok) {
          const data = await res.json();
          if (data && data.releases) {
            profileData = data;
          }
        }
      } catch (err) {
        console.warn("Backend API not reachable; generating mock discography fallback.", err);
      }

      if (!profileData) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        profileData = generateMockDiscography(discographyUrl.trim());
      }

      setArtistProfile(profileData);
      const allIds = profileData.releases.map((r) => r.id);
      setSelectedReleases(new Set(allIds));
      toast.success("Discography fetched and loaded successfully!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to index discography", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // Card Selection utilities
  const handleSelectAll = () => {
    if (!artistProfile) return;
    const allIds = artistProfile.releases.map((r) => r.id);
    setSelectedReleases(new Set(allIds));
    toast.info("Selected all albums");
  };

  const handleClearAll = () => {
    setSelectedReleases(new Set());
    toast.info("Cleared selections");
  };

  const handleToggleSelect = (id, e) => {
    e.stopPropagation();
    setSelectedReleases((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Inspector Modal controls
  const openInspector = (release) => {
    audioRef.current.pause();
    setPlayingTrackId(null);

    setInspectingRelease(release);
    setAlbumTitle(release.title || "");
    setGenre(release.genre || "");
    setReleaseDate(release.releaseDate || "");
    setDescription(release.description || "");
    setCoverUrl(release.coverImage || "");
    setTracks(release.tracks || []);
  };

  const saveInspectorChanges = () => {
    if (!inspectingRelease || !artistProfile) return;

    const updatedReleases = artistProfile.releases.map((r) => {
      if (r.id === inspectingRelease.id) {
        return {
          ...r,
          title: albumTitle,
          genre,
          releaseDate,
          year: releaseDate ? new Date(releaseDate).getFullYear().toString() : r.year,
          description,
          coverImage: coverUrl,
          tracks: tracks,
        };
      }
      return r;
    });

    setArtistProfile({
      ...artistProfile,
      releases: updatedReleases,
    });

    setInspectingRelease(null);
    toast.success(`Updated details for "${albumTitle}"`);
  };

  // Bulk sync trigger execution
  const handleBulkImport = async () => {
    if (selectedReleases.size === 0) {
      toast.error("Please select at least one release to import.");
      return;
    }

    setIsImporting(true);
    const releasesToImport = artistProfile.releases.filter((r) =>
      selectedReleases.has(r.id)
    );

    try {
      for (const rel of releasesToImport) {
        const toastId = toast.loading(`Creating draft & parsing assets for "${rel.title}"...`);
        await new Promise((resolve) => setTimeout(resolve, 800));
        toast.success(`"${rel.title}" imported to library drafts!`, { id: toastId });
      }

      toast.success(`Successfully imported ${releasesToImport.length} release(s) as drafts.`);
      if (onComplete) {
        onComplete("album");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred during bulk sync.");
    } finally {
      setIsImporting(false);
    }
  };

  // Classic Single Release publish
  const handlePublishSingle = () => {
    const missingFiles = tracks.filter((t) => !t.file);
    if (missingFiles.length > 0) {
      toast.error(
        `Please select audio files for all tracks! (${missingFiles.length} missing)`
      );
      return;
    }
    toast.success("Draft saved and ready for S3 uploading!");
    if (onComplete) onComplete("album");
  };

  // ================= RENDER METHOD 2: CLASSIC SINGLE RELEASE IMPORTER =================
  if (importMode === "single") {
    return (
      <div className="min-h-screen bg-[#020216] text-[#dfe3e9] font-['Jura'] p-6 md:p-12 flex flex-col gap-6 pb-32 select-none relative animate-fadeIn">
        
        {/* Top Header Mode Toggle */}
        <div className="flex justify-between items-center">
          <button
            onClick={onCancel}
            className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer font-semibold uppercase tracking-wider"
          >
            ← Back to Dashboard
          </button>
          <span className="text-[11px] text-[#4DB3FF] bg-[#4db3ff]/10 px-3 py-1 rounded-full border border-[#4db3ff]/20 uppercase tracking-wider font-semibold">
            Classic Single Importer
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left column: Album metadata form */}
          <aside className="lg:col-span-4 bg-[rgba(10,10,35,0.6)] backdrop-blur-[44px] border border-[rgba(77,179,255,0.2)] rounded-xl p-6 flex flex-col gap-6 self-stretch">
            
            {/* Cover art preview with editor hover state */}
            <div className="w-full max-w-[260px] aspect-square mx-auto rounded-lg overflow-hidden relative group border border-white/5 flex-shrink-0">
              <img
                src={coverUrl || "https://via.placeholder.com/500"}
                alt="Album Cover Preview"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-end">
                <span className="font-['Jura'] text-[10px] tracking-wider text-white bg-black/50 px-2.5 py-1 rounded backdrop-blur-md border border-white/10">
                  PREVIEW ARTWORK
                </span>
                <button
                  onClick={() => {
                    const newUrl = prompt("Enter cover image URL:", coverUrl);
                    if (newUrl) setCoverUrl(newUrl);
                  }}
                  className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-white/20 transition-colors text-white cursor-pointer"
                >
                  ✎
                </button>
              </div>
            </div>

            {/* Editable Info Fields */}
            <div className="flex flex-col gap-4 flex-grow">
              <div className="flex flex-col gap-1.5">
                <label className="font-['Jura'] text-[11px] tracking-wider text-gray-400">
                  ALBUM TITLE
                </label>
                <input
                  type="text"
                  value={albumTitle}
                  onChange={(e) => setAlbumTitle(e.target.value)}
                  className="w-full bg-[#020216] border border-white/10 focus:border-[#4DB3FF] focus:shadow-[inset_0_0_10px_rgba(77,179,255,0.2)] rounded py-2.5 px-4 text-white text-sm outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-['Jura'] text-[11px] tracking-wider text-gray-400">
                  GENRE
                </label>
                <input
                  type="text"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full bg-[#020216] border border-white/10 focus:border-[#4DB3FF] focus:shadow-[inset_0_0_10px_rgba(77,179,255,0.2)] rounded py-2.5 px-4 text-white text-sm outline-none transition-all"
                  placeholder="e.g. Electronic, Rock, Lofi"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-['Jura'] text-[11px] tracking-wider text-gray-400">
                  RELEASE DATE
                </label>
                <div className="relative">
                  <IoCalendarOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-base" />
                  <input
                    type="date"
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                    className="w-full bg-[#020216] border border-white/10 focus:border-[#4DB3FF] rounded py-2.5 pl-10 pr-4 text-white text-sm outline-none transition-all [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 flex-grow">
                <label className="font-['Jura'] text-[11px] tracking-wider text-gray-400">
                  DESCRIPTION
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full flex-grow bg-[#020216] border border-white/10 focus:border-[#4DB3FF] rounded py-2.5 px-4 text-white text-sm outline-none transition-all resize-none min-h-[100px]"
                />
              </div>
            </div>
          </aside>

          {/* Right column: Crawl & Assets */}
          <div className="lg:col-span-8 flex flex-col gap-8 self-stretch">
            
            {/* Importer Panel */}
            <section className="bg-[rgba(10,10,35,0.6)] backdrop-blur-[44px] border border-[rgba(77,179,255,0.2)] rounded-xl p-6 md:p-8 flex flex-col gap-6 relative">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight uppercase">
                  UNIVERSAL IMPORTER
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Paste your Bandcamp Album or Apple Music Link below to crawl and pre-fill details:
                </p>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-grow relative">
                  <IoLinkOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
                  <input
                    type="text"
                    value={singleUrl}
                    onChange={(e) => setSingleUrl(e.target.value)}
                    className="w-full bg-[#020216] border border-white/10 focus:border-[#4DB3FF] focus:shadow-[inset_0_0_10px_rgba(77,179,255,0.2)] rounded-lg py-3 pl-12 pr-4 text-white font-['Jura'] text-sm outline-none transition-all placeholder:text-gray-600"
                    placeholder="Paste URL here..."
                  />
                </div>
                <button
                  onClick={handleSingleScrape}
                  disabled={loading || !singleUrl.trim()}
                  className="bg-gradient-to-r from-[#0F3272] to-[#3380FF] hover:from-[#153e8a] hover:to-[#408eff] text-white px-8 py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 group transition-all cursor-pointer disabled:opacity-60"
                >
                  <IoSync className={`text-lg ${loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
                  {loading ? "Parsing..." : "Autofill Draft"}
                </button>
              </div>
            </section>

            {/* Assets & Files */}
            <section className="bg-[rgba(10,10,35,0.6)] backdrop-blur-[44px] border border-[rgba(77,179,255,0.2)] rounded-xl p-6 md:p-8 flex-grow flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white tracking-tight uppercase">
                    Track Assets
                  </h2>
                  <span className="font-['Jura'] text-[11px] text-[#4DB3FF] bg-[#4db3ff]/10 px-3.5 py-1 rounded-full border border-[#4db3ff]/20 tracking-wider font-semibold">
                    {tracks.length} TRACKS
                  </span>
                </div>

                {/* Upload Box */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleBulkFilesSelect(e.dataTransfer.files);
                  }}
                  className="mb-6 p-8 border border-dashed border-[#4DB3FF]/40 hover:border-solid hover:bg-[#4DB3FF]/5 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer text-gray-400 hover:text-[#4DB3FF] text-center"
                >
                  <IoCloudUploadOutline className="text-4xl mb-2 text-[#4DB3FF]" />
                  <h3 className="text-white font-semibold text-sm">UPLOAD AUDIO FILES</h3>
                  <p className="text-[12px] font-['Jura'] tracking-wider text-gray-500 mt-1">
                    Drag & drop multiple WAV/FLAC files or click to browse
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept=".wav,.flac,.aiff,.mp3"
                  ref={fileInputRef}
                  onChange={(e) => handleBulkFilesSelect(e.target.files)}
                  className="hidden"
                />

                {/* Track rows */}
                {tracks.length > 0 && (
                  <div className="grid grid-cols-1 gap-3 overflow-y-auto max-h-[300px] pr-2 flex-grow mb-4">
                    {tracks.map((track) => (
                      <div
                        key={track.id}
                        className="bg-[#020216] border border-white/5 rounded-lg p-3 flex justify-between items-center group hover:border-[#4DB3FF]/30 transition-all animate-fadeIn"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <span className="font-['Jura'] text-sm text-gray-600 w-6 text-center flex-shrink-0 font-semibold">
                            {track.number}
                          </span>
                          <div className="w-10 h-10 bg-white/5 rounded flex items-center justify-center relative overflow-hidden border border-white/5 flex-shrink-0">
                            <span className="text-base text-gray-500">♪</span>
                            {track.previewUrl && (
                              <button
                                onClick={() => handleTogglePreview(track)}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"
                              >
                                {playingTrackId === track.id ? (
                                  <IoPause className="text-base" />
                                ) : (
                                  <IoPlay className="text-base" />
                                )}
                              </button>
                            )}
                          </div>
                          <div className="flex-grow min-w-0">
                            <input
                              type="text"
                              value={track.title}
                              onChange={(e) => {
                                const val = e.target.value;
                                setTracks((prev) =>
                                  prev.map((t) => (t.id === track.id ? { ...t, title: val } : t))
                                );
                              }}
                              className="bg-transparent border-none p-0 text-white font-semibold text-sm focus:ring-0 focus:outline-none w-full mb-0.5 truncate uppercase tracking-wider font-['Jura']"
                            />
                            <span className="font-['Jura'] text-[12px] text-gray-500">
                              {track.duration}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          {track.file ? (
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-['Jura'] text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded border border-[#10B981]/20 truncate max-w-[180px] font-semibold">
                                ✓ {track.file.name}
                              </span>
                              <button
                                onClick={() =>
                                  setTracks((prev) =>
                                    prev.map((t) => (t.id === track.id ? { ...t, file: null } : t))
                                  )
                                }
                                className="text-gray-500 hover:text-red-400 p-1.5 transition-colors cursor-pointer"
                              >
                                <IoTrashOutline className="text-base" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-['Jura'] text-gray-500 bg-white/5 px-2.5 py-1 rounded border border-white/5 font-semibold">
                                ⚠️ File Missing
                              </span>
                              <label className="text-xs text-[#4DB3FF] hover:underline cursor-pointer font-semibold uppercase tracking-wider">
                                Upload
                                <input
                                  type="file"
                                  accept=".wav,.flac,.aiff,.mp3"
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      handleSingleFileSelect(track.id, e.target.files[0]);
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="mt-8 flex justify-end gap-4 border-t border-white/5 pt-6">
                <button
                  onClick={onCancel}
                  className="px-6 py-2.5 text-gray-400 hover:text-white transition-colors text-sm font-semibold uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePublishSingle}
                  className="bg-gradient-to-r from-[#0F3272] to-[#3380FF] hover:from-[#153e8a] hover:to-[#408eff] text-white px-8 py-3 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(77,179,255,0.2)]"
                >
                  <IoCloudUploadOutline className="text-lg" />
                  Publish Album
                </button>
              </div>

            </section>
          </div>

        </div>

      </div>
    );
  }

  // ================= RENDER METHOD 3: NEW DISCOGRAPHY SYNC GRID =================
  return (
    <div className="min-h-screen bg-[#020216] text-[#dfe3e9] font-['Jura'] p-6 md:p-12 flex flex-col gap-8 pb-32 select-none relative overflow-x-hidden animate-fadeIn">
      
      {/* ================= STATE 1: INITIAL SEARCH PANEL ================= */}
      {!artistProfile && (
        <div className="flex flex-col gap-4">
          <button
            onClick={onCancel}
            className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer max-w-max uppercase tracking-wider font-semibold"
          >
            ← Back to Dashboard
          </button>
          
          <section className="bg-[#0A0A23]/60 backdrop-blur-[44px] border border-[#4DB3FF]/20 rounded-xl p-8 flex flex-col items-center justify-center text-center max-w-3xl mx-auto w-full mt-8 shadow-[0_0_30px_rgba(77,179,255,0.05)] animate-fadeIn">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#4DB3FF] mb-3 uppercase font-['Jura']">
              ARTIST PROFILE SYNC
            </h1>
            <p className="text-sm md:text-base text-gray-400 mb-8 max-w-xl font-['Jura']">
              Enter your Bandcamp artist page URL to instantly index and bulk-import your entire discography.
            </p>

            <div className="flex flex-col md:flex-row w-full gap-4 max-w-2xl">
              <div className="relative flex-grow">
                <IoLinkOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4DB3FF]/50 text-xl" />
                <input
                  type="url"
                  value={discographyUrl}
                  onChange={(e) => setDiscographyUrl(e.target.value)}
                  className="w-full bg-[#020216] border border-[#4DB3FF]/20 focus:border-[#4DB3FF] focus:shadow-[0_0_15px_rgba(77,179,255,0.15)] rounded-lg py-3.5 pl-12 pr-4 text-white text-sm outline-none transition-all placeholder:text-gray-600 font-mono tracking-wide"
                  placeholder="https://artistname.bandcamp.com"
                />
              </div>
              <button
                onClick={handleDiscographyScrape}
                disabled={loading || !discographyUrl.trim()}
                className="bg-gradient-to-r from-[#0F3272] via-[#1A5DB4] to-[#3380FF] hover:from-[#153e8a] hover:to-[#408eff] text-white font-semibold px-8 py-3.5 rounded-lg text-sm hover:shadow-[0_0_20px_rgba(77,179,255,0.4)] transition-all flex items-center justify-center gap-2 shrink-0 group cursor-pointer disabled:opacity-55 disabled:pointer-events-none"
              >
                <IoSync className={`text-lg ${loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
                {loading ? "Fetching Discography..." : "Fetch Discography"}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* ================= STATE 2: DISCOGRAPHY DASHBOARD ================= */}
      {artistProfile && (
        <div className="flex flex-col gap-8 animate-fadeIn">
          
          {/* Back button & Action Header */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setArtistProfile(null)}
              className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer font-['Jura'] uppercase tracking-wider font-semibold"
            >
              ← Sync Different Profile
            </button>
            <span className="text-[11px] text-[#4DB3FF] bg-[#4db3ff]/10 px-3 py-1 rounded-full border border-[#4db3ff]/20 uppercase tracking-wider font-semibold">
              Importer Dashboard
            </span>
          </div>

          {/* ARTIST PROFILE BILLBOARD */}
          <section className="bg-[#0A0A23]/60 backdrop-blur-[44px] border border-[#4DB3FF]/20 rounded-xl p-6 flex flex-col md:flex-row items-center md:items-start gap-6 relative shadow-[0_0_25px_rgba(0,0,0,0.4)] border-l-4 border-l-[#4DB3FF]">
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-full border-2 border-[#4DB3FF]/50 overflow-hidden shadow-[0_0_15px_rgba(77,179,255,0.3)]">
                <img
                  src={artistProfile.avatar}
                  alt={artistProfile.artistName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-[#020216] rounded-full p-1 border border-[#4DB3FF]/30">
                <IoCheckmarkCircle className="text-[#4DB3FF] text-base" />
              </div>
            </div>

            <div className="flex-grow text-center md:text-left flex flex-col justify-center h-full pt-1">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-white tracking-wide uppercase font-['Jura']">
                  {artistProfile.artistName}
                </h2>
                <div className="flex gap-2 justify-center md:justify-start">
                  <span className="bg-[#0A0A23]/80 text-[#4DB3FF] font-['Jura'] text-[10px] px-2 py-0.5 rounded border border-[#4DB3FF]/30 tracking-widest font-semibold uppercase">
                    BANDCAMP
                  </span>
                  <span className="bg-[#0A0A23]/80 text-[#4DB3FF] font-['Jura'] text-[10px] px-2 py-0.5 rounded border border-[#4DB3FF]/30 tracking-widest font-semibold uppercase">
                    VERIFIED
                  </span>
                </div>
              </div>
              <p className="text-xs md:text-sm text-[#88B2EF] tracking-wider uppercase font-['Jura']">
                {artistProfile.genres.join(" / ")}
              </p>
            </div>

            <div className="bg-[#0A0A23]/80 rounded-lg p-4 border border-white/5 flex flex-col items-center justify-center min-w-[150px] shadow-[inset_0_0_15px_rgba(77,179,255,0.05)]">
              <span className="text-[10px] tracking-widest text-gray-400 mb-1 uppercase font-semibold">RELEASES FOUND</span>
              <span className="text-3xl text-[#4DB3FF] font-bold font-mono">
                {artistProfile.releases.length}
              </span>
            </div>
          </section>



          {/* DISCORAPHY GRID */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {artistProfile.releases.map((release) => {
              const isSelected = selectedReleases.has(release.id);
              return (
                <div
                  key={release.id}
                  onClick={() => openInspector(release)}
                  className={`bg-[#0A0A23]/50 hover:bg-[#0A0A23]/80 rounded-xl border overflow-hidden flex flex-col group cursor-pointer transition-all relative select-none ${
                    isSelected
                      ? "border-[#4DB3FF] shadow-[0_0_20px_rgba(77,179,255,0.2)]"
                      : "border-white/5 hover:border-[#4DB3FF]/40 shadow-none"
                  }`}
                >
                  {/* Select toggle icon (top right) */}
                  <div
                    onClick={(e) => handleToggleSelect(release.id, e)}
                    className="absolute top-3.5 right-3.5 z-25 bg-[#020216] rounded-full p-1 border border-white/10 hover:border-[#4DB3FF] shadow-[0_2px_8px_rgba(0,0,0,0.8)] cursor-pointer transition-all duration-300 flex items-center justify-center text-lg"
                  >
                    {isSelected ? (
                      <IoCheckmarkCircle className="text-[#4DB3FF]" />
                    ) : (
                      <IoEllipseOutline className="text-gray-500 hover:text-[#4DB3FF] opacity-50 group-hover:opacity-100" />
                    )}
                  </div>

                  {/* Cover Art Wrapper */}
                  <div className="w-full aspect-square overflow-hidden relative bg-[#020216]">
                    {release.coverImage ? (
                      <img
                        src={release.coverImage}
                        alt={release.title}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 group-hover:text-[#4DB3FF] transition-colors gap-2">
                        <IoDiscOutline className="text-5xl stroke-1 animate-pulse" />
                        <span className="text-[10px] tracking-widest uppercase">No Art Added</span>
                      </div>
                    )}
                    <div
                      className="absolute inset-0 pointer-events-none opacity-80"
                      style={{
                        background:
                          "linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(10, 10, 35, 0.4) 50%, rgba(2, 2, 22, 0.95) 100%)",
                      }}
                    />
                    
                    {/* Hover Inspect Text Overlay */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                      <span className="text-xs text-white bg-[#0F3272]/90 border border-[#4DB3FF]/40 rounded-lg px-4 py-2 font-semibold tracking-wider shadow-[0_0_15px_rgba(77,179,255,0.3)]">
                        INSPECT & EDIT
                      </span>
                    </div>
                  </div>

                  {/* Info details */}
                  <div className="p-4 flex flex-col flex-grow bg-[#0A0A23]/90 relative border-t border-white/5">
                    <h3 className="font-semibold text-white tracking-wide truncate text-sm mb-1 uppercase font-['Jura']">
                      {release.title}
                    </h3>
                    <p className="text-[11px] text-gray-400 uppercase tracking-widest font-['Jura'] mb-4">
                      {release.genre || "Electronic"}
                    </p>
                    <div className="flex justify-between items-center mt-auto pt-2 border-t border-white/5">
                      <span className="text-xs text-gray-400 font-mono tracking-widest">
                        {release.year}
                      </span>
                      <span className="text-[10px] font-semibold text-[#4DB3FF] bg-[#4DB3FF]/10 px-2 py-0.5 rounded border border-[#4DB3FF]/10 tracking-widest uppercase">
                        {(release.tracks || []).length} Tracks
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          {/* ================= STICKY BOTTOM BAR (BULK SYNC TRIGGER) ================= */}
          {selectedReleases.size > 0 && (
            <div className="fixed bottom-0 left-0 w-full z-45 border-t border-[#4DB3FF]/20 shadow-[0_-8px_30px_rgba(0,0,0,0.85)] py-4 px-6 md:px-12 flex justify-between items-center bg-[#0A0A23] backdrop-blur-md animate-slideUp">
              <div className="flex items-center gap-4">
                <span className="bg-[#4DB3FF]/20 text-[#4DB3FF] font-semibold font-mono text-xl w-12 h-12 flex items-center justify-center rounded-lg border border-[#4DB3FF]/30">
                  {selectedReleases.size}
                </span>
                <div>
                  <span className="text-sm font-semibold text-white uppercase tracking-wider block">
                    {selectedReleases.size === 1 ? "Album" : "Albums"} Selected
                  </span>
                  <span className="text-[11px] text-gray-400 tracking-wider">Ready for library sync</span>
                </div>
              </div>
              <button
                onClick={handleBulkImport}
                disabled={isImporting}
                className="bg-gradient-to-r from-[#0F3272] via-[#1A5DB4] to-[#3380FF] hover:from-[#153e8a] hover:to-[#408eff] text-white font-semibold px-8 py-3 rounded-lg text-sm hover:shadow-[0_0_25px_rgba(77,179,255,0.4)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-55 disabled:pointer-events-none"
              >
                <IoDownloadOutline className="text-lg" />
                {isImporting ? "Importing Drafts..." : "Import Selected as Drafts"}
              </button>
            </div>
          )}

        </div>
      )}

      {/* ================= STATE 3: ALBUM DETAIL INSPECTOR MODAL ================= */}
      {inspectingRelease && (
        <div className="fixed inset-0 z-50 bg-[#020216]/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 overflow-y-auto">
          <div className="w-full max-w-6xl bg-[#0A0A23] border border-[#4DB3FF]/30 rounded-xl p-6 md:p-8 flex flex-col gap-6 relative shadow-[0_0_50px_rgba(2,2,22,0.9)] animate-fadeIn">
            
            {/* Modal Close Button */}
            <button
              onClick={() => {
                audioRef.current.pause();
                setPlayingTrackId(null);
                setInspectingRelease(null);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-white text-2xl transition-colors cursor-pointer"
            >
              <IoCloseOutline />
            </button>

            {/* Modal Header */}
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide uppercase font-['Jura'] flex items-center gap-2">
                <IoDiscOutline className="text-[#4DB3FF]" /> Inspect & Edit Release Details
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Fine-tune metadata and map high-quality audio files for draft uploads.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* ================= LEFT COLUMN: Album Metadata (lg:col-span-4) ================= */}
              <aside className="lg:col-span-4 bg-[#020216]/80 border border-white/5 rounded-xl p-6 flex flex-col gap-6 self-stretch">
                
                {/* Cover art preview with editor hover state */}
                <div className="w-full max-w-[240px] aspect-square mx-auto rounded-lg overflow-hidden relative group border border-white/5 flex-shrink-0 bg-[#020216]">
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt="Album Cover Preview"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 gap-1">
                      <IoDiscOutline className="text-4xl" />
                      <span className="text-[10px] tracking-wider">NO COVER ART</span>
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-end">
                    <span className="font-['Jura'] text-[9px] tracking-wider text-white bg-black/60 px-2 py-0.5 rounded border border-white/10">
                      COVER ARTWORK
                    </span>
                    <button
                      onClick={() => {
                        const newUrl = prompt("Enter cover image URL:", coverUrl);
                        if (newUrl !== null) setCoverUrl(newUrl);
                      }}
                      className="w-7 h-7 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-white/35 transition-colors text-white cursor-pointer text-xs"
                      title="Edit Image URL"
                    >
                      ✎
                    </button>
                  </div>
                </div>

                {/* Editable Info Fields */}
                <div className="flex flex-col gap-4 flex-grow">
                  <div className="flex flex-col gap-1">
                    <label className="font-['Jura'] text-[10px] tracking-widest text-[#88B2EF] font-semibold uppercase">
                      ALBUM TITLE
                    </label>
                    <input
                      type="text"
                      value={albumTitle}
                      onChange={(e) => setAlbumTitle(e.target.value)}
                      className="w-full bg-[#020216] border border-[#4DB3FF]/20 focus:border-[#4DB3FF] focus:shadow-[0_0_10px_rgba(77,179,255,0.15)] rounded py-2 px-3.5 text-white text-xs outline-none transition-all font-semibold uppercase"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-['Jura'] text-[10px] tracking-widest text-[#88B2EF] font-semibold uppercase">
                      GENRE
                    </label>
                    <input
                      type="text"
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="w-full bg-[#020216] border border-[#4DB3FF]/20 focus:border-[#4DB3FF] focus:shadow-[0_0_10px_rgba(77,179,255,0.15)] rounded py-2 px-3.5 text-white text-xs outline-none transition-all uppercase"
                      placeholder="e.g. Electronic, Rock, Lofi"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-['Jura'] text-[10px] tracking-widest text-[#88B2EF] font-semibold uppercase">
                      RELEASE DATE
                    </label>
                    <div className="relative">
                      <IoCalendarOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                      <input
                        type="date"
                        value={releaseDate}
                        onChange={(e) => setReleaseDate(e.target.value)}
                        className="w-full bg-[#020216] border border-[#4DB3FF]/20 focus:border-[#4DB3FF] rounded py-2 pl-9 pr-3.5 text-white text-xs outline-none transition-all [color-scheme:dark]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 flex-grow">
                    <label className="font-['Jura'] text-[10px] tracking-widest text-[#88B2EF] font-semibold uppercase">
                      DESCRIPTION
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full flex-grow bg-[#020216] border border-[#4DB3FF]/20 focus:border-[#4DB3FF] rounded py-2 px-3.5 text-white text-xs outline-none transition-all resize-none min-h-[90px]"
                    />
                  </div>
                </div>
              </aside>

              {/* ================= RIGHT COLUMN: Tracks List & Asset Manager (lg:col-span-8) ================= */}
              <div className="lg:col-span-8 flex flex-col gap-5 self-stretch justify-between">
                
                <div className="flex flex-col flex-grow">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-semibold text-white tracking-wider uppercase font-['Jura']">
                      Track Assets
                    </h3>
                    <span className="font-['Jura'] text-[10px] text-[#4DB3FF] bg-[#4db3ff]/10 px-3 py-0.5 rounded-full border border-[#4db3ff]/20 font-semibold uppercase tracking-wider">
                      {tracks.length} Tracks
                    </span>
                  </div>

                  {/* Centralized Upload Box */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleBulkFilesSelect(e.dataTransfer.files);
                    }}
                    className="p-5 border border-dashed border-[#4DB3FF]/30 hover:border-solid hover:bg-[#4DB3FF]/5 rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer text-gray-400 hover:text-[#4DB3FF] text-center mb-4"
                  >
                    <IoCloudUploadOutline className="text-2xl mb-1.5 text-[#4DB3FF]" />
                    <h4 className="text-white font-semibold text-xs uppercase tracking-widest">Upload Audio Files</h4>
                    <p className="text-[10px] font-['Jura'] tracking-wider text-gray-500 mt-0.5">
                      Drag & drop multiple WAV/FLAC files or click to browse
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept=".wav,.flac,.aiff,.mp3"
                    ref={fileInputRef}
                    onChange={(e) => handleBulkFilesSelect(e.target.files)}
                    className="hidden"
                  />

                  {/* Tracks Scroll Panel */}
                  <div className="grid grid-cols-1 gap-2.5 overflow-y-auto max-h-[220px] pr-1.5 flex-grow">
                    {tracks.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-600 text-xs py-8">
                        No tracks added yet. Use the upload box to add songs.
                      </div>
                    ) : (
                      tracks.map((track) => (
                        <div
                          key={track.id}
                          className="bg-[#020216] border border-white/5 rounded-lg p-2.5 flex justify-between items-center group hover:border-[#4DB3FF]/30 transition-all"
                        >
                          {/* Track details (left) */}
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="font-mono text-xs text-gray-500 w-5 text-center flex-shrink-0 font-semibold">
                              {track.number}
                            </span>
                            <div className="w-8 h-8 bg-white/5 rounded flex items-center justify-center relative overflow-hidden border border-white/5 flex-shrink-0">
                              <span className="text-xs text-gray-500">♪</span>
                              {track.previewUrl && (
                                <button
                                  onClick={() => handleTogglePreview(track)}
                                  className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer text-sm"
                                >
                                  {playingTrackId === track.id ? (
                                    <IoPause className="text-xs" />
                                  ) : (
                                    <IoPlay className="text-xs" />
                                  )}
                                </button>
                              )}
                            </div>
                            <div className="flex-grow min-w-0">
                              <input
                                type="text"
                                value={track.title}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setTracks((prev) =>
                                    prev.map((t) => (t.id === track.id ? { ...t, title: val } : t))
                                  );
                                }}
                                className="bg-transparent border-none p-0 text-white font-semibold text-xs focus:ring-0 focus:outline-none w-full mb-0.5 truncate uppercase tracking-wider"
                              />
                              <span className="font-mono text-[10px] text-gray-500 block">
                                {track.duration}
                              </span>
                            </div>
                          </div>

                          {/* Matching status (right) */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {track.file ? (
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-['Jura'] text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20 truncate max-w-[150px] font-semibold">
                                  ✓ {track.file.name}
                                </span>
                                <button
                                  onClick={() =>
                                    setTracks((prev) =>
                                      prev.map((t) => (t.id === track.id ? { ...t, file: null } : t))
                                    )
                                  }
                                  className="text-gray-500 hover:text-red-400 p-1.5 transition-colors cursor-pointer"
                                >
                                  <IoTrashOutline className="text-xs" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-['Jura'] text-gray-500 bg-white/5 px-2 py-0.5 rounded border border-white/5 font-semibold tracking-wide">
                                  ⚠️ FILE MISSING
                                </span>
                                <label className="text-[10px] text-[#4DB3FF] hover:underline cursor-pointer font-semibold uppercase tracking-wider">
                                  Upload
                                  <input
                                    type="file"
                                    accept=".wav,.flac,.aiff,.mp3"
                                    className="hidden"
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        handleSingleFileSelect(track.id, e.target.files[0]);
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Modal actions footer */}
                <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
                  <button
                    onClick={() => {
                      audioRef.current.pause();
                      setPlayingTrackId(null);
                      setInspectingRelease(null);
                    }}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-xs font-semibold uppercase cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveInspectorChanges}
                    className="bg-[#3380FF] hover:bg-[#3380FF]/85 text-white font-semibold px-6 py-2.5 rounded-lg text-xs tracking-wider transition-all uppercase cursor-pointer shadow-[0_0_15px_rgba(51,128,255,0.2)]"
                  >
                    Save Album Details
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
