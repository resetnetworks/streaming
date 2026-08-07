import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { useCreateMigration, useMigrationStatus, usePublishDraftAlbum, useUpdateDraftAlbum, useUpdateDraftTrack, useImportMigration } from "../../hooks/api/useMigration";
import { migrationApi } from "../../api/migrationApi";
import { uploadApi } from "../../api/uploadApi";
import { FiTag } from "react-icons/fi";
import { getS3Url } from "../../utills/s3Utils";

import { MdDragIndicator } from "react-icons/md";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
  IoArrowForward,
  IoChevronDown,
  IoChevronUp,
} from "react-icons/io5";

const defaultGenres = [
  "electronic", "idm", "ambient", "experimental", "avant garde", "noise", "downtempo",
  "soundtrack", "industrial", "ebm", "electro", "techno", "dance", "electronica",
  "sound art", "jazz", "classical", "classical crossover", "soundscapes", "field recordings"
];

const mapGenres = (apiGenres) => {
  if (!apiGenres) return [];
  const normalized = Array.isArray(apiGenres) ? apiGenres : [apiGenres];
  return normalized
    .map(g => g.toLowerCase())
    .filter(g => defaultGenres.includes(g))
    .filter((g, idx, arr) => arr.indexOf(g) === idx) // unique
    .slice(0, 5);
};

const formatSecondsToMMSS = (sec) => {
  if (!sec) return "0:00";
  const mins = Math.floor(sec / 60);
  const secs = Math.floor(sec % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};



const GenreDropdown = ({ selectedGenres, toggleGenre }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#020216] border border-[#4DB3FF]/40 hover:bg-[#4DB3FF]/10 focus:border-[#4DB3FF] focus:shadow-[0_0_15px_rgba(77,179,255,0.2)] rounded py-2.5 px-4 text-[#4DB3FF] text-sm outline-none transition-all text-left flex justify-between items-center"
      >
        <span>
          {selectedGenres.length === 0
            ? "Select genres..."
            : "Edit genres..."}
        </span>
        <IoChevronDown className={`opacity-50 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-[999] w-full mt-2 bg-[#0A0A23] border border-[#4DB3FF]/30 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
          <div className="p-2 flex flex-col gap-1">
            {defaultGenres.map((g) => {
              const isSelected = selectedGenres.includes(g);
              const isDisabled = selectedGenres.length >= 5 && !isSelected;
              return (
                <label
                  key={g}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${isSelected ? "bg-[#4DB3FF]/20" : "hover:bg-[#4DB3FF]/10"
                    } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={isDisabled}
                    onChange={() => toggleGenre(g)}
                    className="w-4 h-4 rounded border-[#4DB3FF]/50 bg-[#020216] text-[#4DB3FF] focus:ring-[#4DB3FF] focus:ring-offset-0 cursor-pointer accent-[#4DB3FF]"
                  />
                  <span className={`text-sm capitalize ${isSelected ? "text-white font-medium" : "text-gray-300"}`}>
                    {g}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};


const SortableTrackItemSingle = ({
  track,
  playingTrackId,
  handleTogglePreview,
  setTracks,
  handleSingleFileSelect
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: track.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1, zIndex: isDragging ? 50 : "auto" };

  return (
    <div ref={setNodeRef} style={style} className="bg-[#020216] border border-white/5 rounded-lg p-3 flex justify-between items-center group hover:border-[#4DB3FF]/30 transition-all animate-fadeIn">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div {...attributes} {...listeners} className="cursor-grab hover:text-white text-gray-500">
          <MdDragIndicator size={16} />
        </div>
        <span className="font-['Jura'] text-sm text-gray-600 w-6 text-center flex-shrink-0 font-semibold">{track.number}</span>
        <div className="w-10 h-10 bg-white/5 rounded flex items-center justify-center relative overflow-hidden border border-white/5 flex-shrink-0">
          <span className="text-base text-gray-500">♪</span>
          {track.previewUrl && (
            <button onClick={() => handleTogglePreview(track)} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer">
              {playingTrackId === track.id ? <IoPause className="text-base" /> : <IoPlay className="text-base" />}
            </button>
          )}
        </div>
        <div className="flex-grow min-w-0">
          <input type="text" value={track.title} onChange={(e) => { const val = e.target.value; setTracks((prev) => prev.map((t) => (t.id === track.id ? { ...t, title: val } : t))); }} className="bg-transparent border border-transparent hover:border-white/10 focus:border-[#4DB3FF]/50 p-0.5 text-white font-semibold text-sm focus:ring-0 focus:outline-none w-full mb-0.5 truncate uppercase tracking-wider font-['Jura'] hover:bg-white/5 focus:bg-[#020216] rounded transition-all" />
          <span className="font-['Jura'] text-[12px] text-gray-500">{track.duration}</span>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {track.file ? (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-['Jura'] text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded border border-[#10B981]/20 truncate max-w-[180px] font-semibold">✓ {track.file.name}</span>
            <button onClick={() => setTracks((prev) => prev.map((t) => (t.id === track.id ? { ...t, file: null } : t)))} className="text-gray-500 hover:text-red-400 p-1.5 transition-colors cursor-pointer"><IoTrashOutline className="text-base" /></button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-['Jura'] text-gray-500 bg-white/5 px-3 py-1 rounded border border-white/5 font-semibold">⚠️ File Missing</span>
            <label className="text-sm text-[#4DB3FF] hover:underline cursor-pointer font-semibold uppercase tracking-wider font-['Jura']">
              Upload
              <input type="file" accept=".wav,.flac,.aiff,.mp3" className="hidden" onChange={(e) => { if (e.target.files && e.target.files[0]) { handleSingleFileSelect(track.id, e.target.files[0]); } }} />
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

const SortableTrackItemDraft = ({
  track,
  playingTrackId,
  handleTogglePreview,
  setTracks,
  handleSingleFileSelect
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: track.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1, zIndex: isDragging ? 50 : "auto" };

  return (
    <div ref={setNodeRef} style={style} className="bg-[#020216] border border-white/5 rounded-lg p-2.5 flex justify-between items-center group hover:border-[#4DB3FF]/30 transition-all">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div {...attributes} {...listeners} className="cursor-grab hover:text-white text-gray-500">
          <MdDragIndicator size={14} />
        </div>
        <span className="font-mono text-xs text-gray-500 w-5 text-center flex-shrink-0 font-semibold">{track.number}</span>
        <div className="w-8 h-8 bg-white/5 rounded flex items-center justify-center relative overflow-hidden border border-white/5 flex-shrink-0">
          <span className="text-xs text-gray-500">♪</span>
          {track.previewUrl && (
            <button onClick={() => handleTogglePreview(track)} className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer text-sm">
              {playingTrackId === track.id ? <IoPause className="text-xs" /> : <IoPlay className="text-xs" />}
            </button>
          )}
        </div>
        <div className="flex-grow min-w-0">
          <input type="text" value={track.title} onChange={(e) => { const val = e.target.value; setTracks((prev) => prev.map((t) => (t.id === track.id ? { ...t, title: val } : t))); }} className="bg-transparent border border-transparent hover:border-white/10 focus:border-[#4DB3FF]/50 p-0.5 text-white font-semibold text-xs focus:ring-0 focus:outline-none w-full mb-0.5 truncate uppercase tracking-wider hover:bg-white/5 focus:bg-[#020216] rounded transition-all font-['Jura']" />
          <span className="font-mono text-[10px] text-gray-500 block">{track.duration}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {track.file ? (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-['Jura'] text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20 truncate max-w-[150px] font-semibold">✓ {track.file.name}</span>
            <button onClick={() => setTracks((prev) => prev.map((t) => (t.id === track.id ? { ...t, file: null } : t)))} className="text-gray-500 hover:text-red-400 p-1.5 transition-colors cursor-pointer"><IoTrashOutline className="text-xs" /></button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-['Jura'] text-gray-500 bg-white/5 px-2 py-0.5 rounded border border-white/5 font-semibold tracking-wide">⚠️ FILE MISSING</span>
            <label className="text-[10px] text-[#4DB3FF] hover:underline cursor-pointer font-semibold uppercase tracking-wider">
              Upload
              <input type="file" accept=".wav,.flac,.aiff,.mp3" className="hidden" onChange={(e) => { if (e.target.files && e.target.files[0]) { handleSingleFileSelect(track.id, e.target.files[0]); } }} />
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default function ImportUpload({ onCancel, onComplete, draftId }) {
  // Check if we're editing a draft or doing a fresh import
  const [importMode] = useState(() => {
    if (draftId) return "single";
    return "discography";
  });

  // Search URLs
  const [singleUrl, setSingleUrl] = useState("");
  const [discographyUrl, setDiscographyUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const createMigrationMutation = useCreateMigration();
  const updateDraftAlbumMutation = useUpdateDraftAlbum();
  const updateDraftTrackMutation = useUpdateDraftTrack();
  const publishDraftAlbumMutation = usePublishDraftAlbum();
  const importMigrationMutation = useImportMigration();

  // Polling migration status
  const [currentJobId, setCurrentJobId] = useState(null);
  const [lastJobId, setLastJobId] = useState(null);
  const [activeDraftId, setActiveDraftId] = useState(draftId || null);

  const { data: jobStatus } = useMigrationStatus(currentJobId, {
    refetchInterval: (query) => {
      const status = query.state?.data?.data?.status;
      if (status === 'READY' || status === 'FAILED' || status === 'IMPORTED') return false;
      return 2000;
    }
  });

  useEffect(() => {
    if (jobStatus?.data?.status === 'READY' && currentJobId) {
      toast.success("Migration job completed! Loading drafts...", { id: "mig-toast" });
      setLoading(false);

      Promise.all([
        migrationApi.getMigrationAlbums(currentJobId),
        migrationApi.getMigrationTracks(currentJobId)
      ]).then(([albumRes, trackRes]) => {
        const albums = albumRes.data || [];
        const allTracks = trackRes.data || [];

        if (importMode === 'single') {
          const draftAlbum = albums[0];
          if (draftAlbum) {
            setActiveDraftId(draftAlbum._id);
            setAlbumTitle(draftAlbum.title || "Untitled Release");
            setSelectedGenres(mapGenres(draftAlbum.genres || draftAlbum.genre));
            setReleaseDate(draftAlbum.releaseDate ? draftAlbum.releaseDate.split("T")[0] : "");
            setDescription(draftAlbum.description || "");
            setAccessType(draftAlbum.accessType || "subscription");
            setPrice(draftAlbum.price || "");
            setCoverUrl(getS3Url(draftAlbum.coverImageKey || draftAlbum.coverImage) || "");

            const albumTracks = allTracks.filter(t => t.migrationAlbumId === draftAlbum._id);
            setTracks(
              albumTracks.map((t, idx) => ({
                id: t._id,
                number: String(idx + 1).padStart(2, "0"),
                title: t.title || "Untitled Track",
                duration: t.duration ? formatSecondsToMMSS(t.duration) : "03:00",
                file: null,
                previewUrl: t.previewUrl || "",
              }))
            );
          }
        } else {
          const profileData = {
            artistName: albums.length > 0 ? (albums[0].artistName || "Imported Artist") : "Imported Artist",
            releases: albums.map(album => {
              const albumTracks = allTracks.filter(t => t.migrationAlbumId === album._id);
              return {
                id: album._id,
                title: album.title,
                coverImage: album.coverImageKey || album.coverImage,
                releaseDate: album.releaseDate,
                year: album.releaseDate ? new Date(album.releaseDate).getFullYear() : "",
                genres: mapGenres(album.genres || album.genre),
                description: album.description,
                tracks: albumTracks.map((t, idx) => ({
                  id: t._id,
                  number: String(idx + 1).padStart(2, "0"),
                  title: t.title || "Untitled Track",
                  duration: t.duration ? formatSecondsToMMSS(t.duration) : "03:00",
                  file: null,
                  previewUrl: t.previewUrl || "",
                }))
              };
            })
          };
          setArtistProfile(profileData);
          setSelectedReleases(new Set(profileData.releases.map(r => r.id)));
        }
      }).catch(err => console.error(err));

      setLastJobId(currentJobId);
      setCurrentJobId(null);
    } else if (jobStatus?.data?.status === 'FAILED') {
      toast.error("Migration job failed.", { id: "mig-toast" });
      setLoading(false);
      setCurrentJobId(null);
    }
  }, [jobStatus, currentJobId, importMode]);

  // Load specific draft if draftId is provided
  useEffect(() => {
    if (draftId) {
      setLoading(true);
      migrationApi.getDraftAlbumDetails(draftId).then(detailRes => {
        const draftAlbum = detailRes.data?.album;
        const draftTracks = detailRes.data?.tracks || [];

        if (draftAlbum) {
          setAlbumTitle(draftAlbum.title || "Untitled Release");
          setSelectedGenres(mapGenres(draftAlbum.genres || draftAlbum.genre));
          setReleaseDate(draftAlbum.releaseDate ? draftAlbum.releaseDate.split("T")[0] : "");
          setDescription(draftAlbum.description || "");
          setAccessType(draftAlbum.accessType || "subscription");
          setCoverUrl(getS3Url(draftAlbum.coverImageKey || draftAlbum.coverImage) || "");

          setTracks(
            draftTracks.map((t, idx) => ({
              id: t._id,
              number: String(idx + 1).padStart(2, "0"),
              title: t.title || "Untitled Track",
              duration: t.duration ? formatSecondsToMMSS(t.duration) : "03:00",
              file: null,
              previewUrl: t.previewUrl || "",
            }))
          );
        }
      }).catch(err => {
        console.error(err);
        toast.error("Failed to load draft details");
      }).finally(() => setLoading(false));
    }
  }, [draftId]);

  // Discography State
  const [artistProfile, setArtistProfile] = useState(null);
  const [selectedReleases, setSelectedReleases] = useState(new Set());

  // Inspect / Single Album Form states
  const [inspectingRelease, setInspectingRelease] = useState(null);
  const [albumTitle, setAlbumTitle] = useState("");
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [releaseDate, setReleaseDate] = useState("");

  const toggleGenre = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      if (selectedGenres.length < 5) {
        setSelectedGenres([...selectedGenres, genre]);
      }
    }
  };

  const removeGenre = (genre) => {
    setSelectedGenres(selectedGenres.filter((g) => g !== genre));
  };

  const [description, setDescription] = useState("");
  const [accessType, setAccessType] = useState("subscription");
  const [price, setPrice] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
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
    const fileList = Array.from(files).sort((a, b) => a.name.localeCompare(b.name));

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
        
        // 1. Try to map to existing tracks
        const updatedTracks = prev.map((track) => {
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

        // 2. Append remaining unassigned files as new tracks
        const additionalTracks = unassignedFiles.map((file, idx) => {
          const newIdx = updatedTracks.length + idx + 1;
          let number = String(newIdx).padStart(2, "0");
          let title = file.name.replace(/\.[^/.]+$/, "");
          title = title.replace(/^\d+[\s-_]*/, "");
          return {
            id: `tr-manual-${Date.now()}-${idx}`,
            number,
            title,
            duration: "03:00",
            file: file,
            previewUrl: "",
          };
        });

        return [...updatedTracks, ...additionalTracks];
      });
      toast.success(`Processed ${fileList.length} files. Mapping complete!`);
    }
  };

  // Single Mode Scraper
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      setTracks((prev) => {
        const oldIndex = prev.findIndex((t) => t.id === active.id);
        const newIndex = prev.findIndex((t) => t.id === over.id);
        const newTracks = arrayMove(prev, oldIndex, newIndex);
        return newTracks.map((t, idx) => ({ ...t, number: String(idx + 1).padStart(2, "0") }));
      });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleSingleScrape = async () => {
    if (!singleUrl.trim()) {
      toast.error("Please paste a URL first!");
      return;
    }

    setLoading(true);
    toast.loading("Starting migration job in background...", { id: "mig-toast" });

    try {
      const workspaceId = localStorage.getItem("activeWorkspaceId") || "default";
      const res = await createMigrationMutation.mutateAsync({ url: singleUrl.trim(), workspaceId });
      if (res.data?._id) {
        setCurrentJobId(res.data._id);
        toast.loading("Crawling music metadata from external source...", { id: "mig-toast" });
      } else {
        toast.error("Job ID not returned.", { id: "mig-toast" });
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to start migration", { id: "mig-toast" });
      setLoading(false);
    }
  };

  const handleDiscographyScrape = async () => {
    if (!discographyUrl.trim()) {
      toast.error("Please paste a URL first!");
      return;
    }

    try {
      const urlObj = new URL(discographyUrl);
      if (!urlObj.hostname.includes("bandcamp.com")) {
        toast.error("Please enter a valid Bandcamp URL.");
        return;
      }
    } catch (e) {
      toast.error("Please enter a valid URL.");
      return;
    }

    setLoading(true);
    toast.loading("Indexing artist discography metadata...", { id: "mig-toast" });

    try {
      const workspaceId = localStorage.getItem("activeWorkspaceId") || "default";
      const res = await createMigrationMutation.mutateAsync({ url: discographyUrl.trim(), workspaceId });
      if (res.data?._id) {
        // Store job ID so UploadsComponent can poll for drafts
        localStorage.setItem("activeMigrationJobId", res.data._id);
        toast.loading("Fetching metadata in background...", { id: "mig-toast" });
        if (onComplete) {
          onComplete("drafts");
        }
      } else {
        toast.error("Job ID not returned.", { id: "mig-toast" });
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      let errorMessage = err.response?.data?.message || err.message || "Failed to index discography";
      if (errorMessage.toLowerCase().includes("validation") || err.response?.status === 400) {
        errorMessage = "Please enter a valid Bandcamp URL.";
      }
      toast.error(errorMessage, { id: "mig-toast" });
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
    setSelectedGenres(release.genres || []);
    setReleaseDate(release.releaseDate || "");
    setDescription(release.description || "");
    setAccessType(release.accessType || "subscription");
    setPrice(release.price || "");
    setCoverUrl(release.coverImage || "");
    setTracks(release.tracks || []);
  };

  const saveInspectorChanges = () => {
    if (!inspectingRelease || !artistProfile) return;

    if (accessType === "purchase-only" && Number(price) <= 0) {
      toast.error("Please enter a valid price for a purchase-only album.");
      return;
    }

    if (tracks.length === 0) {
      toast.error("An album must have at least one track.");
      return;
    }

    const missingFiles = tracks.filter((t) => !t.file);
    if (missingFiles.length > 0) {
      toast.error(`Please upload audio files for all tracks! (${missingFiles.length} missing)`);
      return;
    }

    const updatedReleases = artistProfile.releases.map((r) => {
      if (r.id === inspectingRelease.id) {
        return {
          ...r,
          title: albumTitle,
          genres: selectedGenres,
          releaseDate,
          year: releaseDate ? new Date(releaseDate).getFullYear().toString() : r.year,
          description,
          accessType,
          price: Number(price) || 0,
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
      if (!lastJobId) {
        toast.error("No migration job found to import.");
        return;
      }
      const toastId = toast.loading(`Importing ${releasesToImport.length} release(s) to production...`);
      await importMigrationMutation.mutateAsync({
        jobId: lastJobId,
        data: { releases: releasesToImport }
      });
      toast.success(`Successfully imported ${releasesToImport.length} release(s)!`, { id: toastId });

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
  const handlePublishSingle = async () => {
    if (!activeDraftId) {
      toast.error("No draft loaded to publish!");
      return;
    }

    if (accessType === "purchase-only" && Number(price) <= 0) {
      toast.error("Please enter a valid price for a purchase-only album.");
      return;
    }

    if (tracks.length === 0) {
      toast.error("An album must have at least one track.");
      return;
    }

    const missingFiles = tracks.filter((t) => !t.file);
    if (missingFiles.length > 0) {
      toast.error(
        `Please select audio files for all tracks! (${missingFiles.length} missing)`
      );
      return;
    }

    setLoading(true);
    const publishToastId = toast.loading("Updating draft details...");

    try {
      // 1. Update Album Details
      await updateDraftAlbumMutation.mutateAsync({
        albumId: activeDraftId,
        data: {
          title: albumTitle,
          genres: selectedGenres,
          releaseDate: releaseDate || undefined,
          description,
          accessType,
          price: Number(price) || 0,
          coverImageKey: coverUrl && !coverUrl.startsWith("http") ? coverUrl : undefined // if we updated image somehow, but for now we assume it's set
        }
      });

      // 2. Upload Audio Files & Update Tracks
      let uploadedCount = 0;
      for (const track of tracks) {
        toast.loading(`Uploading "${track.title}" (${uploadedCount + 1}/${tracks.length})...`, { id: publishToastId });

        const file = track.file;
        const presignRes = await uploadApi.getPresignedUrl(file.name, file.type);
        if (!presignRes || !presignRes.key) {
          throw new Error("Failed to get a valid S3 key from the server.");
        }

        await uploadApi.uploadToS3(presignRes.uploadUrl, file, (progress) => {
          // Optional: We can show progress here if we had a per-track UI, but toast updates might be too frequent
        });

        // 3. Save song file key to draft track
        await updateDraftTrackMutation.mutateAsync({
          trackId: track.id,
          data: {
            title: track.title,
            audioKey: presignRes.key
          }
        });

        uploadedCount++;
      }

      toast.loading("Publishing album to your library...", { id: publishToastId });

      await publishDraftAlbumMutation.mutateAsync({
        albumId: activeDraftId,
        data: { accessType, basePrice: price }
      });

      toast.success("Your album is now live and available to listeners.", { id: publishToastId });

      if (onComplete) {
        onComplete("album");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "Failed to publish album", { id: publishToastId });
    } finally {
      setLoading(false);
    }
  };

  // ================= RENDER METHOD 2: CLASSIC SINGLE RELEASE IMPORTER =================
  if (importMode === "single") {
    return (
      <div className="min-h-screen bg-[#020216] text-[#dfe3e9] font-['Jura'] p-6 md:p-12 flex flex-col gap-6 pb-32 select-none relative animate-fadeIn">



        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

          {/* Left column: Album metadata form */}
          <aside className="lg:col-span-4 bg-[#0A0A23]/90 backdrop-blur-[44px] border border-[#4DB3FF]/40 shadow-[0_0_40px_rgba(77,179,255,0.15)] rounded-xl p-6 flex flex-col gap-6 self-stretch">

            {/* Cover art preview with editor hover state */}
            <div className="w-full max-w-[260px] aspect-square mx-auto rounded-lg overflow-hidden relative group border border-white/10 flex-shrink-0 shadow-[0_0_15px_rgba(77,179,255,0.1)]">
              <img
                src={coverUrl || "https://via.placeholder.com/500"}
                alt="Album Cover Preview"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-end">
                <span className="font-['Jura'] text-[10px] tracking-wider text-white bg-[#0A0A23]/80 px-2.5 py-1 rounded backdrop-blur-md border border-[#4DB3FF]/30">
                  PREVIEW ARTWORK
                </span>
                <button
                  onClick={() => {
                    const newUrl = prompt("Enter cover image URL:", coverUrl);
                    if (newUrl) setCoverUrl(newUrl);
                  }}
                  className="w-8 h-8 rounded-full bg-[#4DB3FF]/20 backdrop-blur-md flex items-center justify-center border border-[#4DB3FF]/40 hover:bg-[#4DB3FF]/40 transition-colors text-white cursor-pointer shadow-[0_0_10px_rgba(77,179,255,0.3)]"
                >
                  ✎
                </button>
              </div>
            </div>

            {/* Editable Info Fields */}
            <div className="flex flex-col gap-4 flex-grow">
              <div className="flex flex-col gap-1.5">
                <label className="font-['Jura'] text-[13px] tracking-wider text-gray-400 font-bold uppercase">
                  ALBUM TITLE
                </label>
                <input
                  type="text"
                  value={albumTitle}
                  onChange={(e) => setAlbumTitle(e.target.value)}
                  className="w-full bg-[#020216] border border-[#4DB3FF]/40 focus:border-[#4DB3FF] focus:shadow-[0_0_15px_rgba(77,179,255,0.2)] rounded py-2.5 px-4 text-white text-sm outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-['Jura'] text-[13px] tracking-wider text-gray-400 font-bold uppercase">
                    GENRES
                  </label>
                  <span className={`text-[10px] font-semibold ${selectedGenres.length === 5 ? "text-amber-300" : "text-[#4DB3FF]/70"}`}>
                    {selectedGenres.length}/5
                  </span>
                </div>

                {selectedGenres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-1">
                    {selectedGenres.map((g, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1.5 bg-[#4DB3FF]/10 border border-[#4DB3FF]/30 px-2.5 py-1 rounded-md group hover:border-[#4DB3FF]/60 transition-colors"
                      >
                        <FiTag size={10} className="text-[#4DB3FF]" />
                        <span className="text-white text-xs capitalize">{g}</span>
                        <button
                          type="button"
                          onClick={() => removeGenre(g)}
                          className="text-[#4DB3FF]/60 hover:text-red-400 transition-colors ml-1"
                        >
                          <IoCloseOutline size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <GenreDropdown selectedGenres={selectedGenres} toggleGenre={toggleGenre} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-['Jura'] text-[13px] tracking-wider text-gray-400 font-bold uppercase">
                  ACCESS TYPE
                </label>
                <select
                  value={accessType}
                  onChange={(e) => setAccessType(e.target.value)}
                  className="w-full bg-[#020216] border border-[#4DB3FF]/40 focus:border-[#4DB3FF] focus:shadow-[0_0_15px_rgba(77,179,255,0.2)] rounded py-2.5 px-4 text-white text-sm outline-none transition-all"
                >
                  <option value="subscription">Subscription</option>
                  <option value="purchase-only">Purchase Only</option>
                </select>
              </div>

              {accessType === "purchase-only" && (
                <div className="flex flex-col gap-1.5 animate-fadeIn">
                  <label className="font-['Jura'] text-[13px] tracking-wider text-gray-400 font-bold uppercase">
                    PRICE (USD)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-[#020216] border border-[#4DB3FF]/40 focus:border-[#4DB3FF] focus:shadow-[0_0_15px_rgba(77,179,255,0.2)] rounded py-2.5 px-4 text-white text-sm outline-none transition-all"
                    placeholder="e.g. 5.99"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="font-['Jura'] text-[13px] tracking-wider text-gray-400 font-bold uppercase">
                  RELEASE DATE
                </label>
                <div className="relative">
                  <IoCalendarOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4DB3FF]/70 text-base" />
                  <input
                    type="date"
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                    className="w-full bg-[#020216] border border-[#4DB3FF]/40 focus:border-[#4DB3FF] focus:shadow-[0_0_15px_rgba(77,179,255,0.2)] rounded py-2.5 pl-10 pr-4 text-white text-sm outline-none transition-all [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 flex-grow">
                <label className="font-['Jura'] text-[13px] tracking-wider text-gray-400 font-bold uppercase">
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

            {/* Importer Panel - Only show when NOT editing an existing draft */}
            {!activeDraftId && (
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
            )}

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
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={tracks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                        {tracks.map((track) => (
                          <SortableTrackItemSingle
                            key={track.id}
                            track={track}
                            playingTrackId={playingTrackId}
                            handleTogglePreview={handleTogglePreview}
                            setTracks={setTracks}
                            handleSingleFileSelect={handleSingleFileSelect}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
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
          <section className="bg-[#0A0A23]/90 backdrop-blur-[44px] border border-[#4DB3FF]/40 rounded-xl p-8 flex flex-col items-center justify-center text-center max-w-5xl mx-auto w-full mt-8 shadow-[0_0_40px_rgba(77,179,255,0.15)] animate-fadeIn">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#4DB3FF] mb-3 uppercase font-['Jura']">
              IMPORT YOUR CATALOG
            </h1>
            <p className="text-sm md:text-base text-gray-300 mb-8 max-w-xl font-['Jura']">
              Paste your Bandcamp profile URL below to automatically fetch and import all your albums at once.
            </p>

            <div className="flex flex-col md:flex-row w-full gap-4 max-w-4xl">
              <div className="relative flex-grow">
                <IoLinkOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4DB3FF]/80 text-xl" />
                <input
                  type="url"
                  value={discographyUrl}
                  onChange={(e) => setDiscographyUrl(e.target.value)}
                  className="w-full bg-[#020216] border border-[#4DB3FF]/40 focus:border-[#4DB3FF] focus:shadow-[0_0_15px_rgba(77,179,255,0.3)] rounded-lg py-3.5 pl-12 pr-4 text-white text-sm outline-none transition-all placeholder:text-gray-500 font-mono tracking-wide"
                  placeholder="https://artistname.bandcamp.com"
                />
              </div>
              <button
                onClick={handleDiscographyScrape}
                disabled={loading || !discographyUrl.trim()}
                className="px-8 py-3.5 text-sm font-semibold text-white rounded-lg transition-all duration-300 hover:brightness-110 active:scale-95 flex items-center justify-center gap-2 shrink-0 group cursor-pointer disabled:opacity-55 disabled:pointer-events-none"
                style={{
                  background: 'linear-gradient(45deg, #0F3272 0%, #1A5DB4 60%, #3380FF 100%)',
                  boxShadow: '0 0 15px rgba(51, 128, 255, 0.2)',
                }}
              >
                <IoSync className={`text-lg ${loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
                {loading ? "Fetching Catalog..." : "Fetch Catalog"}
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
                  className={`bg-[#0A0A23]/50 hover:bg-[#0A0A23]/80 rounded-xl border overflow-hidden flex flex-col group cursor-pointer transition-all relative select-none ${isSelected
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
                className="px-8 py-3 text-sm font-semibold text-white rounded-lg transition-all duration-300 hover:brightness-110 active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55 disabled:pointer-events-none"
                style={{
                  background: 'linear-gradient(45deg, #0F3272 0%, #1A5DB4 60%, #3380FF 100%)',
                  boxShadow: '0 0 15px rgba(51, 128, 255, 0.2)',
                }}
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
                    <label className="font-['Jura'] text-[12px] tracking-widest text-gray-400 font-extrabold uppercase">
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
                    <div className="flex items-center justify-between">
                      <label className="font-['Jura'] text-[12px] tracking-widest text-gray-400 font-extrabold uppercase">
                        GENRES
                      </label>
                      <span className={`text-[9px] font-semibold ${selectedGenres.length === 5 ? "text-amber-300" : "text-[#4DB3FF]/70"}`}>
                        {selectedGenres.length}/5
                      </span>
                    </div>

                    {selectedGenres.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-1">
                        {selectedGenres.map((g, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-1 bg-[#4DB3FF]/10 border border-[#4DB3FF]/30 px-2 py-0.5 rounded group hover:border-[#4DB3FF]/60 transition-colors"
                          >
                            <FiTag size={9} className="text-[#4DB3FF]" />
                            <span className="text-white text-[11px] capitalize">{g}</span>
                            <button
                              type="button"
                              onClick={() => removeGenre(g)}
                              className="text-[#4DB3FF]/60 hover:text-red-400 transition-colors ml-1"
                            >
                              <IoCloseOutline size={11} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <GenreDropdown selectedGenres={selectedGenres} toggleGenre={toggleGenre} />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-['Jura'] text-[12px] tracking-widest text-gray-400 font-extrabold uppercase">
                      ACCESS TYPE
                    </label>
                    <select
                      value={accessType}
                      onChange={(e) => setAccessType(e.target.value)}
                      className="w-full bg-[#020216] border border-[#4DB3FF]/40 focus:border-[#4DB3FF] focus:shadow-[0_0_10px_rgba(77,179,255,0.15)] rounded px-3 py-2 text-white text-sm outline-none transition-all"
                    >
                      <option value="subscription">Subscription</option>
                      <option value="purchase-only">Purchase Only</option>
                    </select>
                  </div>

                  {accessType === "purchase-only" && (
                    <div className="flex flex-col gap-1 animate-fadeIn">
                      <label className="font-['Jura'] text-[12px] tracking-widest text-gray-400 font-extrabold uppercase">
                        PRICE (USD)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full bg-[#020216] border border-[#4DB3FF]/40 focus:border-[#4DB3FF] focus:shadow-[0_0_10px_rgba(77,179,255,0.15)] rounded px-3 py-2 text-white text-sm outline-none transition-all"
                        placeholder="e.g. 5.99"
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-1">
                    <label className="font-['Jura'] text-[12px] tracking-widest text-gray-400 font-extrabold uppercase">
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
                    <label className="font-['Jura'] text-[12px] tracking-widest text-gray-400 font-extrabold uppercase">
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
                      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={tracks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                          {tracks.map((track) => (
                            <SortableTrackItemDraft
                              key={track.id}
                              track={track}
                              playingTrackId={playingTrackId}
                              handleTogglePreview={handleTogglePreview}
                              setTracks={setTracks}
                              handleSingleFileSelect={handleSingleFileSelect}
                            />
                          ))}
                        </SortableContext>
                      </DndContext>
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
