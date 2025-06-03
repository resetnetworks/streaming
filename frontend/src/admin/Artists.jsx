import React from "react";
import { useRef } from "react";

export default function Artists({
    artists,
    artistForm,
    editingArtist,
    setEditingArtist,
    setArtistForm,
    initialArtist,
    handleArtistChange,
    submitArtist,
    deleteArtist,
    inputClass,
    textareaClass,
}) {
    const fileInputRef = useRef();

    // Handle file upload and convert to base64
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setArtistForm({ ...artistForm, image: reader.result });
        };
        reader.readAsDataURL(file);
    };

    return (
        <section className="w-full max-w-5xl flex gap-8">
            {/* Left: Artist List & Create New */}
            <div className="w-1/3 min-w-[260px] bg-gradient-to-br from-blue-500/80 to-blue-900/80 rounded-2xl shadow-2xl p-6 border border-blue-100 flex flex-col">
                <button
                    className={`mb-4 px-4 py-2 rounded-lg font-semibold shadow border transition text-left ${
                        editingArtist === null
                            ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white border-blue-700"
                            : "bg-blue-100 text-blue-700 border-blue-400 hover:bg-blue-200"
                    }`}
                    onClick={() => {
                        setEditingArtist(null);
                        setArtistForm(initialArtist);
                    }}
                >
                    + Create New Artist
                </button>
                <div className="overflow-y-auto flex-1">
                    <ul className="space-y-2">
                        {artists.length === 0 && (
                            <li className="text-blue-200 text-center py-8">No artists yet.</li>
                        )}
                        {artists.map((ar, idx) => (
                            <li
                                key={idx}
                                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer border transition ${
                                    editingArtist === idx
                                        ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white border-blue-700"
                                        : "bg-blue-700/30 hover:bg-blue-700/50 text-white border-blue-200"
                                }`}
                                onClick={() => {
                                    setEditingArtist(idx);
                                    setArtistForm(artists[idx]);
                                }}
                            >
                                {ar.image && (
                                    <img
                                        src={ar.image}
                                        alt="artist"
                                        className="w-10 h-10 object-cover rounded-lg border border-blue-300"
                                    />
                                )}
                                <div className="flex-1">
                                    <div className="font-semibold truncate">{ar.name}</div>
                                    <div className="text-xs text-blue-200 truncate">{ar.bio?.slice(0, 30)}{ar.bio?.length > 30 ? "..." : ""}</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            {/* Right: Create/Edit Artist */}
            <div className="flex-1 bg-gradient-to-br from-blue-500/80 to-blue-900/80 rounded-2xl shadow-2xl p-10 border border-blue-100">
                <h2 className="text-3xl font-bold mb-6 text-white flex items-center gap-3">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="16" fill="#2563eb" />
                        <path d="M16 10a4 4 0 110 8 4 4 0 010-8zm0 10c-4 0-8 2-8 4v2h16v-2c0-2-4-4-8-4z" fill="#fff"/>
                    </svg>
                    {editingArtist !== null ? "Edit Artist" : "Create New Artist"}
                </h2>
                <form onSubmit={submitArtist} className="space-y-6">
                    <input
                        className={inputClass + " text-lg font-semibold bg-white/80"}
                        name="name"
                        placeholder="Artist Name"
                        value={artistForm.name}
                        onChange={handleArtistChange}
                        required
                    />
                    <textarea
                        className={textareaClass + " bg-white/80"}
                        name="bio"
                        placeholder="Bio"
                        value={artistForm.bio}
                        onChange={handleArtistChange}
                    />
                    <div>
                        <label className="block mb-2 text-white font-semibold">Artist Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            className={inputClass + " bg-white/80"}
                            onChange={handleImageUpload}
                        />
                        {artistForm.image && (
                            <img
                                src={artistForm.image}
                                alt="preview"
                                className="mt-2 w-24 h-24 object-cover rounded-lg border border-blue-300"
                            />
                        )}
                    </div>
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-8 py-3 rounded-full font-bold shadow-lg transition text-lg hover:from-blue-600 hover:to-blue-800"
                        >
                            {editingArtist !== null ? "Update Artist" : "Create Artist"}
                        </button>
                        {editingArtist !== null && (
                            <button
                                type="button"
                                className="bg-white text-blue-700 border border-blue-500 px-8 py-3 rounded-full font-bold shadow-lg transition text-lg hover:bg-blue-100 ml-2"
                                onClick={() => {
                                    deleteArtist(editingArtist);
                                    setEditingArtist(null);
                                    setArtistForm(initialArtist);
                                }}
                            >
                                Delete Artist
                            </button>
                        )}
                        {editingArtist !== null && (
                            <button
                                type="button"
                                className="ml-2 text-white underline"
                                onClick={() => {
                                    setEditingArtist(null);
                                    setArtistForm(initialArtist);
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