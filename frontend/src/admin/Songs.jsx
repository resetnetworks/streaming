import React from "react";

export default function Songs({
    songs,
    songForm,
    editingSong,
    setEditingSong,
    setSongForm,
    initialSong,
    handleSongChange,
    submitSong,
    deleteSong,
    inputClass,
    textareaClass,
}) {
    return (
        <section className="w-full max-w-5xl flex gap-8">
            {/* Left: Song List & Create New */}
            <div className="w-1/3 min-w-[260px] bg-gradient-to-br from-blue-500/80 to-blue-900/80 rounded-2xl shadow-2xl p-6 border border-blue-100 flex flex-col">
                <button
                    className={`mb-4 px-4 py-2 rounded-lg font-semibold shadow border transition text-left ${
                        editingSong === null
                            ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white border-blue-700"
                            : "bg-blue-100 text-blue-700 border-blue-400 hover:bg-blue-200"
                    }`}
                    onClick={() => {
                        setEditingSong(null);
                        setSongForm(initialSong);
                    }}
                >
                    + Create New Song
                </button>
                <div className="overflow-y-auto flex-1">
                    <ul className="space-y-2">
                        {songs.length === 0 && (
                            <li className="text-blue-200 text-center py-8">No songs yet.</li>
                        )}
                        {songs.map((song, idx) => (
                            <li
                                key={idx}
                                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer border transition ${
                                    editingSong === idx
                                        ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white border-blue-700"
                                        : "bg-blue-700/30 hover:bg-blue-700/50 text-white border-blue-200"
                                }`}
                                onClick={() => {
                                    setEditingSong(idx);
                                    setSongForm(songs[idx]);
                                }}
                            >
                                {song.cover && (
                                    <img
                                        src={song.cover}
                                        alt="cover"
                                        className="w-10 h-10 object-cover rounded-lg border border-blue-300"
                                    />
                                )}
                                <div className="flex-1">
                                    <div className="font-semibold truncate">{song.title}</div>
                                    <div className="text-xs text-blue-200 truncate">{song.artist}</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            {/* Right: Create/Edit Song */}
            <div className="flex-1 bg-gradient-to-br from-blue-500/80 to-blue-900/80 rounded-2xl shadow-2xl p-10 border border-blue-100">
                <h2 className="text-3xl font-bold mb-6 text-white flex items-center gap-3">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="16" fill="#2563eb" />
                        <path d="M10 22V10l12-2v12" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="16" cy="22" r="2" fill="#fff" />
                    </svg>
                    {editingSong !== null ? "Edit Song" : "Create New Song"}
                </h2>
                <form onSubmit={submitSong} className="space-y-6">
                    <div className="flex gap-6 items-center">
                        <div>
                            <label className="block font-medium mb-1 text-white">Cover Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                className="block w-full text-white"
                                onChange={e => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setSongForm({ ...songForm, cover: reader.result });
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                            {songForm.cover && (
                                <img
                                    src={songForm.cover}
                                    alt="cover preview"
                                    className="mt-2 w-32 h-32 object-cover rounded-xl border-4 border-blue-500 shadow-lg"
                                />
                            )}
                            <label className="block font-medium mb-1 text-white mt-4">Song File</label>
                            <input
                                type="file"
                                accept="audio/*"
                                className="block w-full text-white"
                                onChange={e => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setSongForm({ ...songForm, file: reader.result });
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                            {songForm.file && (
                                <audio controls className="mt-2 w-full">
                                    <source src={songForm.file} />
                                    Your browser does not support the audio element.
                                </audio>
                            )}
                        </div>
                        <div className="flex-1 space-y-4">
                            <input
                                className={inputClass + " text-lg font-semibold bg-white/80"}
                                name="title"
                                placeholder="Song Title"
                                value={songForm.title}
                                onChange={handleSongChange}
                                required
                            />
                            <input
                                className={inputClass + " bg-white/80"}
                                name="artist"
                                placeholder="Artist"
                                value={songForm.artist}
                                onChange={handleSongChange}
                                required
                            />
                            <input
                                className={inputClass + " bg-white/80"}
                                name="album"
                                placeholder="Album"
                                value={songForm.album}
                                onChange={handleSongChange}
                            />
                            <input
                                className={inputClass + " bg-white/80"}
                                name="genre"
                                placeholder="Genre"
                                value={songForm.genre}
                                onChange={handleSongChange}
                            />
                            <input
                                className={inputClass + " bg-white/80"}
                                name="duration"
                                placeholder="Duration (e.g. 3:45)"
                                value={songForm.duration}
                                onChange={handleSongChange}
                            />
                            <input
                                className={inputClass + " bg-white/80"}
                                name="price"
                                placeholder="Price"
                                type="number"
                                value={songForm.price}
                                onChange={handleSongChange}
                            />
                            <label className="flex items-center gap-2 text-white">
                                <input
                                    type="checkbox"
                                    name="isPremium"
                                    checked={songForm.isPremium}
                                    onChange={handleSongChange}
                                />
                                Premium Song
                            </label>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-8 py-3 rounded-full font-bold shadow-lg transition text-lg hover:from-blue-600 hover:to-blue-800"
                        >
                            {editingSong !== null ? "Update Song" : "Create Song"}
                        </button>
                        {editingSong !== null && (
                            <button
                                type="button"
                                className="bg-white text-blue-700 border border-blue-500 px-8 py-3 rounded-full font-bold shadow-lg transition text-lg hover:bg-blue-100 ml-2"
                                onClick={() => {
                                    deleteSong(editingSong);
                                    setEditingSong(null);
                                    setSongForm(initialSong);
                                }}
                            >
                                Delete Song
                            </button>
                        )}
                        {editingSong !== null && (
                            <button
                                type="button"
                                className="ml-2 text-white underline"
                                onClick={() => {
                                    setEditingSong(null);
                                    setSongForm(initialSong);
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