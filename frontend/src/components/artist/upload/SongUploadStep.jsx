import React, { useState, useRef, useEffect } from "react";
import {
  FiUpload, FiMusic, FiCheck, FiX, FiTrash2, FiClock, FiEdit2, FiSave,
} from "react-icons/fi";
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

// ─── Sortable Song Item ────────────────────────────────────────────────────────
const SortableSongItem = ({
  song,
  index,
  editingSongId,
  editSongName,
  setEditSongName,
  startEditSong,
  saveEditSong,
  cancelEdit,
  removeSong,
  isUploading,
  hasStartedUpload,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: song.id, disabled: hasStartedUpload });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  const isEditing = editingSongId === song.id;

  const getStatusInfo = (status, progress) => {
    switch (status) {
      case "success":
        return {
          color: "text-green-500",
          bgColor: "bg-green-500/10",
          borderColor: "border-green-500/30",
          icon: <FiCheck size={14} className="text-green-500" />,
          text: "Uploaded",
        };
      case "uploading":
        return {
          color: "text-blue-500",
          bgColor: "bg-blue-500/10",
          borderColor: "border-blue-500/30",
          icon: (
            <div className="relative w-5 h-5">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent" />
            </div>
          ),
          text: `${progress}%`,
        };
      case "error":
        return {
          color: "text-red-500",
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500/30",
          icon: <FiX size={14} className="text-red-500" />,
          text: "Failed",
        };
      default:
        return {
          color: "text-gray-500",
          bgColor: "bg-gray-500/10",
          borderColor: "border-gray-500/30",
          icon: null,
          text: "Pending",
        };
    }
  };

  const statusInfo = getStatusInfo(song.status, song.progress);
  const isCurrentUploading = song.status === "uploading";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 rounded-lg border ${statusInfo.borderColor} ${statusInfo.bgColor} transition-all ${
        isDragging ? "shadow-2xl ring-2 ring-blue-500/50" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">

          {/* Drag handle */}
          {!hasStartedUpload && song.status === "pending" ? (
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-gray-600 hover:text-gray-400 transition-colors flex-shrink-0 touch-none"
              title="Drag to reorder"
            >
              <MdDragIndicator size={22} />
            </div>
          ) : (
            <div className="w-6 flex-shrink-0" /> // spacer
          )}

          {/* Song number */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${statusInfo.color} bg-black/30 flex-shrink-0`}
          >
            {index + 1}
          </div>

          {/* Song info */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="mb-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editSongName}
                    onChange={(e) => setEditSongName(e.target.value)}
                    className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                    placeholder="Enter song name"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEditSong(song.id);
                      if (e.key === "Escape") cancelEdit();
                    }}
                  />
                  <button
                    onClick={() => saveEditSong(song.id)}
                    className="p-2 bg-green-600 hover:bg-green-500 text-white rounded"
                    title="Save"
                  >
                    <FiSave size={16} />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
                    title="Cancel"
                  >
                    <FiX size={16} />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Original: {song.originalName}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-1">
                <p className="text-white font-medium truncate">{song.name}</p>
                {song.name !== song.originalName && (
                  <span className="text-xs text-gray-500" title="Original name">
                    ({song.originalName})
                  </span>
                )}
                {statusInfo.icon && (
                  <div className={`p-1 rounded ${statusInfo.bgColor}`}>
                    {statusInfo.icon}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <FiClock size={12} />
                <span>{song.duration || "00:00"}</span>
              </div>
              <span>•</span>
              <span className={`${statusInfo.color} font-medium`}>
                {statusInfo.text}
              </span>
              {song.status === "pending" && !isEditing && (
                <>
                  <span>•</span>
                  <button
                    onClick={() => startEditSong(song)}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Editable
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {isCurrentUploading && (
            <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300"
                style={{ width: `${song.progress}%` }}
              />
            </div>
          )}

          {song.status === "pending" && !isEditing && (
            <button
              onClick={() => startEditSong(song)}
              className="text-blue-400 hover:text-blue-300 p-1 transition-colors"
              title="Edit song name"
            >
              <FiEdit2 size={18} />
            </button>
          )}

          {song.status === "pending" && (
            <button
              onClick={() => removeSong(song.id)}
              className="text-red-400 hover:text-red-300 p-1 transition-colors"
              title="Remove song"
              disabled={isEditing}
            >
              <FiTrash2 size={18} />
            </button>
          )}
        </div>
      </div>

      {song.status === "success" && song.uploadedData && (
        <div className="mt-3 pt-3 border-t border-gray-700/50">
          <div className="text-xs text-gray-400">
            Uploaded as:{" "}
            <span className="text-green-400">{song.uploadedData.song?.title}</span>
          </div>
        </div>
      )}

      {song.status === "error" && song.error && (
        <div className="mt-3 pt-3 border-t border-red-500/30">
          <div className="text-xs text-red-400">Error: {song.error}</div>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const SongUploadStep = ({
  onSongsSelected,
  onStartUpload,
  uploadedSongs = [],
  isUploading,
  hasStartedUpload,
  currentUploadIndex = 0,
  uploadProgress = 0,
}) => {
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [songsWithStatus, setSongsWithStatus] = useState([]);
  const [editingSongId, setEditingSongId] = useState(null);
  const [editSongName, setEditSongName] = useState("");
  const fileInputRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }, // 5px move se drag start — accidental drag avoid
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Initialize songs with status
  useEffect(() => {
    if (selectedSongs.length > 0) {
      setSongsWithStatus(
        selectedSongs.map((song) => ({
          ...song,
          status: "pending",
          progress: 0,
          error: null,
        }))
      );
    }
  }, [selectedSongs]);

  // Update uploading progress
  useEffect(() => {
    if (isUploading && songsWithStatus.length > 0 && currentUploadIndex < songsWithStatus.length) {
      setSongsWithStatus((prev) =>
        prev.map((song, index) =>
          index === currentUploadIndex
            ? { ...song, status: "uploading", progress: uploadProgress }
            : song
        )
      );
    }
  }, [isUploading, currentUploadIndex, uploadProgress]);

  // Update success status
  useEffect(() => {
    if (uploadedSongs.length > 0) {
      setSongsWithStatus((prev) =>
        prev.map((song, index) => {
          const uploadedSong = uploadedSongs.find((us) => us.originalIndex === index);
          if (uploadedSong) {
            return { ...song, status: "success", progress: 100, uploadedData: uploadedSong };
          }
          return song;
        })
      );
    }
  }, [uploadedSongs]);

  // ✅ Drag end — reorder karo
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setSelectedSongs((prev) => {
      const oldIndex = prev.findIndex((s) => s.id === active.id);
      const newIndex = prev.findIndex((s) => s.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });

    setSongsWithStatus((prev) => {
      const oldIndex = prev.findIndex((s) => s.id === active.id);
      const newIndex = prev.findIndex((s) => s.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newSongs = files.map((file, index) => {
      const getDuration = () =>
        new Promise((resolve) => {
          const audio = document.createElement("audio");
          audio.preload = "metadata";
          audio.onloadedmetadata = () => {
            window.URL.revokeObjectURL(audio.src);
            const duration = audio.duration;
            const minutes = Math.floor(duration / 60);
            const seconds = Math.floor(duration % 60);
            resolve({
              duration: `${minutes}:${seconds.toString().padStart(2, "0")}`,
              durationInSeconds: duration,
            });
          };
          audio.onerror = () => {
            window.URL.revokeObjectURL(audio.src);
            resolve({ duration: "00:00", durationInSeconds: 0 });
          };
          audio.src = URL.createObjectURL(file);
        });

      const fileName = file.name.replace(/\.[^/.]+$/, "");
      return { id: Date.now() + index, file, name: fileName, originalName: fileName, status: "pending", progress: 0, getDuration };
    });

    Promise.all(
      newSongs.map(async (song) => {
        const durationInfo = await song.getDuration();
        return { ...song, ...durationInfo };
      })
    ).then((songsWithDuration) => {
      setSelectedSongs((prev) => [...prev, ...songsWithDuration]);
    });
  };

  const removeSong = (id) => {
    setSelectedSongs((prev) => prev.filter((s) => s.id !== id));
    setSongsWithStatus((prev) => prev.filter((s) => s.id !== id));
    setEditingSongId(null);
  };

  const startEditSong = (song) => {
    setEditingSongId(song.id);
    setEditSongName(song.name);
  };

  const saveEditSong = (id) => {
    if (!editSongName.trim()) { alert("Song name cannot be empty!"); return; }
    const update = (prev) => prev.map((s) => s.id === id ? { ...s, name: editSongName.trim() } : s);
    setSelectedSongs(update);
    setSongsWithStatus(update);
    setEditingSongId(null);
    setEditSongName("");
  };

  const cancelEdit = () => { setEditingSongId(null); setEditSongName(""); };

  const handleConfirmSelection = () => {
    if (selectedSongs.length === 0) { alert("Please select at least one song!"); return; }
    if (editingSongId) cancelEdit();
    onSongsSelected(
      selectedSongs.map((song) => ({
        title: song.name,
        audioFile: song.file,
        duration: song.durationInSeconds || 180,
        name: song.name,
        originalName: song.originalName,
      }))
    );
  };

  const handleStartUpload = () => {
    if (selectedSongs.length === 0 && !hasStartedUpload) { alert("Please select songs first!"); return; }
    if (editingSongId) cancelEdit();
    onStartUpload();
  };

  return (
    <div className="space-y-6">
      {/* File upload area */}
      <div
        onClick={triggerFileInput}
        className="cursor-pointer border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-blue-500 transition-colors"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".wav,.aif,.aiff,.flac"
          multiple
          className="hidden"
        />
        <div className="mb-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-blue-900/20 border-2 border-blue-500/30 flex items-center justify-center">
            <FiUpload size={32} className="text-blue-400" />
          </div>
        </div>
        <h3 className="text-white text-xl mb-2">Select Songs for Album</h3>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          Upload multiple audio files. You can drag to reorder before uploading.
        </p>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
          disabled={hasStartedUpload && isUploading}
          className={`px-6 py-3 rounded-full font-medium inline-flex items-center gap-2 ${
            hasStartedUpload && isUploading ? "bg-gray-700 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 text-white"
          }`}
        >
          <FiMusic size={18} />
          {hasStartedUpload && isUploading ? "Uploading..." : "Choose Audio Files"}
        </button>
        <p className="text-gray-500 text-sm mt-4">
          Selected: {selectedSongs.length} file{selectedSongs.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Songs list */}
      {songsWithStatus.length > 0 && (
        <div className="bg-gray-900/50 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-white">Songs List</h4>
              {!hasStartedUpload && (
                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                  <MdDragIndicator size={14} />
                  Drag songs to reorder track order
                </p>
              )}
            </div>
            <span className="text-gray-400 text-sm">
              {songsWithStatus.filter((s) => s.status === "success").length} of {songsWithStatus.length} uploaded
            </span>
          </div>

          {/* ✅ DnD wrapper */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={songsWithStatus.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {songsWithStatus.map((song, index) => (
                  <SortableSongItem
                    key={song.id}
                    song={song}
                    index={index}
                    editingSongId={editingSongId}
                    editSongName={editSongName}
                    setEditSongName={setEditSongName}
                    startEditSong={startEditSong}
                    saveEditSong={saveEditSong}
                    cancelEdit={cancelEdit}
                    removeSong={removeSong}
                    isUploading={isUploading}
                    hasStartedUpload={hasStartedUpload}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Action buttons */}
          <div className="mt-4 flex justify-between items-center">
            <div className="text-gray-400 text-sm">
              {songsWithStatus.length} song{songsWithStatus.length !== 1 ? "s" : ""} selected
              {editingSongId && <span className="ml-2 text-yellow-500">• Editing mode active</span>}
            </div>

            <div className="flex gap-3">
              {!hasStartedUpload && (
                <button
                  onClick={handleConfirmSelection}
                  className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-full transition-colors"
                  disabled={!!editingSongId}
                >
                  {editingSongId ? "Finish Editing First" : "Confirm Selection"}
                </button>
              )}

              {hasStartedUpload && !isUploading && (
                <button
                  onClick={handleStartUpload}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-colors"
                  disabled={!!editingSongId}
                >
                  {editingSongId ? "Finish Editing First" : "Start Upload"}
                </button>
              )}

              {isUploading && (
                <div className="px-6 py-2 bg-blue-700 text-blue-300 rounded-full flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-300 border-t-transparent" />
                  <span>Uploading {currentUploadIndex + 1} of {songsWithStatus.length}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function triggerFileInput() {
    fileInputRef.current?.click();
  }
};

export default SongUploadStep;