import React from "react";

export default function Playlists({
    playlists,
    playlistForm,
    editingPlaylist,
    setEditingPlaylist,
    setPlaylistForm,
    initialPlaylist,
    handlePlaylistChange,
    submitPlaylist,
    deletePlaylist,
    addSongField,
    removeSongField,
    inputClass,
    inputSongClass,
}) {
    return (
        <section className="w-full max-w-5xl flex gap-8">
            {/* Left: Playlist List & Create New */}
            <div className="w-1/3 min-w-[260px] bg-gradient-to-br from-blue-500/80 to-blue-900/80 rounded-2xl shadow-2xl p-6 border border-blue-100 flex flex-col">
                <button
                    className={`mb-4 px-4 py-2 rounded-lg font-semibold shadow border transition text-left ${
                        editingPlaylist === null
                            ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white border-blue-700"
                            : "bg-blue-100 text-blue-700 border-blue-400 hover:bg-blue-200"
                    }`}
                    onClick={() => {
                        setEditingPlaylist(null);
                        setPlaylistForm(initialPlaylist);
                    }}
                >
                    + Create New Playlist
                </button>
                <div className="overflow-y-auto flex-1">
                    <ul className="space-y-2">
                        {playlists.length === 0 && (
                            <li className="text-blue-200 text-center py-8">No playlists yet.</li>
                        )}
                        {playlists.map((pl, idx) => (
                            <li
                                key={idx}
                                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer border transition ${
                                    editingPlaylist === idx
                                        ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white border-blue-700"
                                        : "bg-blue-700/30 hover:bg-blue-700/50 text-white border-blue-200"
                                }`}
                                onClick={() => {
                                    setEditingPlaylist(idx);
                                    setPlaylistForm(playlists[idx]);
                                }}
                            >
                                <div className="flex-1">
                                    <div className="font-semibold truncate">{pl.name}</div>
                                    <div className="text-xs text-blue-200 truncate">{pl.songs.length} songs</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            {/* Right: Create/Edit Playlist */}
            <div className="flex-1 bg-gradient-to-br from-blue-500/80 to-blue-900/80 rounded-2xl shadow-2xl p-10 border border-blue-100">
                <h2 className="text-3xl font-bold mb-6 text-white flex items-center gap-3">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="16" fill="#2563eb" />
                        <path d="M10 16h12M16 10v12" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    {editingPlaylist !== null ? "Edit Playlist" : "Create New Playlist"}
                </h2>
                <form onSubmit={submitPlaylist} className="space-y-6">
                    <input
                        className={inputClass + " text-lg font-semibold bg-white/80"}
                        name="name"
                        placeholder="Playlist Name"
                        value={playlistForm.name}
                        onChange={handlePlaylistChange}
                        required
                    />
                    <div>
                        <label className="block font-medium mb-1 text-white">Songs</label>
                        {playlistForm.songs.map((song, idx) => (
                            <div key={idx} className="flex items-center mb-2">
                                <input
                                    className={inputSongClass + " bg-white/80"}
                                    name="songs"
                                    placeholder={`Song ${idx + 1}`}
                                    value={song}
                                    onChange={(e) => handlePlaylistChange(e, idx)}
                                    required
                                />
                                {playlistForm.songs.length > 1 && (
                                    <button
                                        type="button"
                                        className="ml-2 text-red-200 hover:text-red-400 text-xl"
                                        onClick={() => removeSongField(idx)}
                                    >
                                        &times;
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            className="text-white text-sm mt-1 hover:underline"
                            onClick={addSongField}
                        >
                            + Add Song
                        </button>
                    </div>
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-8 py-3 rounded-full font-bold shadow-lg transition text-lg hover:from-blue-600 hover:to-blue-800"
                        >
                            {editingPlaylist !== null ? "Update Playlist" : "Create Playlist"}
                        </button>
                        {editingPlaylist !== null && (
                            <button
                                type="button"
                                className="bg-white text-blue-700 border border-blue-500 px-8 py-3 rounded-full font-bold shadow-lg transition text-lg hover:bg-blue-100 ml-2"
                                onClick={() => {
                                    deletePlaylist(editingPlaylist);
                                    setEditingPlaylist(null);
                                    setPlaylistForm(initialPlaylist);
                                }}
                            >
                                Delete Playlist
                            </button>
                        )}
                        {editingPlaylist !== null && (
                            <button
                                type="button"
                                className="ml-2 text-white underline"
                                onClick={() => {
                                    setEditingPlaylist(null);
                                    setPlaylistForm(initialPlaylist);
                                }}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </section>
    );
}