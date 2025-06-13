

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectAllArtists } from "../features/artists/artistsSelectors";
import { fetchAllArtists } from "../features/artists/artistsSlice";
import { all } from "axios";
import { useDispatch } from "react-redux";



export default function Albums({
    albums,
    albumForm,
    editingAlbum,
    setEditingAlbum,
    setAlbumForm,
    initialAlbum,
    handleAlbumChange,
    submitAlbum,
    deleteAlbum,
    inputClass,
    textareaClass,
    coverFile,     
    setCoverFile,
}) 


{
    // const { albumForm, setAlbumForm } = props;
    const allArtists = useSelector(selectAllArtists);
 const dispatch = useDispatch();
    useEffect(() => {
        if (!allArtists || allArtists.length === 0) {
            dispatch(fetchAllArtists());
            
        }
    }, [allArtists, dispatch]);
    

    const [artistSearch, setArtistSearch] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);



    // Filter artists by search
    const filteredArtists = allArtists.filter(artist =>
        artist.name.toLowerCase().startsWith(artistSearch.toLowerCase())
    );

    return (
        <section className="w-full max-w-5xl flex flex-col lg:flex-row gap-8">
            {/* Left: Album List & Create New */}
            <div className="w-full lg:w-1/3 min-w-[260px] bg-gradient-to-br from-blue-500/80 to-blue-900/80 rounded-2xl shadow-2xl p-6 border border-blue-100 flex flex-col mb-6 lg:mb-0">
                <button
                    className={`mb-4 px-4 py-2 rounded-lg font-semibold shadow border transition text-left ${
                        editingAlbum === null
                            ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white border-blue-700"
                            : "bg-blue-100 text-blue-700 border-blue-400 hover:bg-blue-200"
                    }`}
                    onClick={() => {
                        setEditingAlbum(null);
                        setAlbumForm(initialAlbum);
                    }}
                >
                    + Create New Album
                </button>
                <div className="overflow-y-auto flex-1">
                    <ul className="space-y-2">
                        {albums.length === 0 && (
                            <li className="text-blue-200 text-center py-8">No albums yet.</li>
                        )}
                        {albums.map((al, idx) => (
                            <li
                                key={idx}
                                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer border transition ${
                                    editingAlbum === idx
                                        ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white border-blue-700"
                                        : "bg-blue-700/30 hover:bg-blue-700/50 text-white border-blue-200"
                                }`}
                                onClick={() => {
                                    setEditingAlbum(idx);
                                    setAlbumForm(albums[idx]);
                                }}
                            >
                                {al.cover && (
                                    <img
                                        src={al.cover}
                                        alt="cover"
                                        className="w-10 h-10 object-cover rounded-lg border border-blue-300"
                                    />
                                )}
                                <div className="flex-1">
                                    <div className="font-semibold truncate">{al.title}</div>
                                    <div className="text-xs text-blue-200 truncate">{al.artist}</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            {/* Right: Create/Edit Album */}
            <div className="flex-1 bg-gradient-to-br from-blue-500/80 to-blue-900/80 rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 lg:p-10 border border-blue-100">
                <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-white flex items-center gap-3">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="16" fill="#2563eb" />
                        <path d="M23.5 12.5C20.5 10.5 11.5 10.5 8.5 12.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                        <path d="M22 15.5C19.5 14 12.5 14 10 15.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                        <path d="M20.5 18.5C18.5 17.5 13.5 17.5 11.5 18.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    {editingAlbum !== null ? "Edit Album" : "Create New Album"}
                </h2>
                <form onSubmit={submitAlbum} className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                        <div className="w-full md:w-auto">
                            <label className="block font-medium mb-1 text-white">Cover Image</label>
   <input
  type="file"
  accept="image/*"
  className="block w-full text-white"
  onChange={e => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file); // <-- use prop from Admin
      const reader = new FileReader();
      reader.onloadend = () => setAlbumForm({ ...albumForm, coverPreview: reader.result });
      reader.readAsDataURL(file);
    }
  }}
/>
{albumForm.coverPreview && (
  <img
    src={albumForm.coverPreview}
    alt="cover preview"
    className="mt-2 w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl border-4 border-blue-500 shadow-lg"
  />
)}
                        </div>
                        <div className="flex-1 w-full space-y-4">
                            <input
                                className={inputClass + " text-lg font-semibold bg-white/80"}
                                name="title"
                                placeholder="Album Title"
                                value={albumForm.title}
                                onChange={handleAlbumChange}
                                required
                            />
                            <div className="relative">
    {/* // ...inside your form, replacing your current artist input block */}

  <input
    className={inputClass + " bg-white/80"}
    name="artist"
    placeholder="Artist"
    value={artistSearch}
    onChange={e => {
      setArtistSearch(e.target.value);
      setShowDropdown(true);
      // Optionally clear the artist id if user is typing
      setAlbumForm({ ...albumForm, artist: "", artistName: e.target.value });
    }}
    onFocus={() => setShowDropdown(true)}
    onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
    autoComplete="off"
    required
  />
  {showDropdown && filteredArtists.length > 0 && (
   <ul className="absolute z-10 bg-white border border-blue-200 rounded-lg mt-1 w-full max-h-48 overflow-y-auto shadow-lg">
  {filteredArtists.map(artist => (
    <li
      key={artist._id}
      className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-blue-100"
      onMouseDown={() => { // <-- use onMouseDown instead of onClick
        setAlbumForm({ ...albumForm, artist: artist._id, artistName: artist.name });
        setArtistSearch(artist.name);
        setShowDropdown(false);
      }}
    >
      <img
        src={artist.image}
        alt={artist.name}
        className="w-8 h-8 rounded-full object-cover border border-blue-300"
      />
      <span>{artist.name}</span>
    </li>
  ))}
</ul>
  )}
</div>

                            <input
                                className={inputClass + " bg-white/80"}
                                name="price"
                                placeholder="Price"
                                type="number"
                                value={albumForm.price}
                                onChange={handleAlbumChange}
                            />
                        </div>
                    </div>
                    <textarea
                        className={textareaClass + " bg-white/80"}
                        name="description"
                        placeholder="Album Description"
                        value={albumForm.description}
                        onChange={handleAlbumChange}
                        rows={3}
                    />
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            type="submit"
                            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-8 py-3 rounded-full font-bold shadow-lg transition text-lg hover:from-blue-600 hover:to-blue-800"
                        >
                            {editingAlbum !== null ? "Update Album" : "Create Album"}
                        </button>
                        {editingAlbum !== null && (
                            <button
                                type="button"
                                className="bg-white text-blue-700 border border-blue-500 px-8 py-3 rounded-full font-bold shadow-lg transition text-lg hover:bg-blue-100 ml-0 sm:ml-2"
                                onClick={() => {
                                    deleteAlbum(editingAlbum);
                                    setEditingAlbum(null);
                                    setAlbumForm(initialAlbum);
                                }}
                            >
                                Delete Album
                            </button>
                        )}
                        {editingAlbum !== null && (
                            <button
                                type="button"
                                className="sm:ml-2 text-white underline"
                                onClick={() => {
                                    setEditingAlbum(null);
                                    setAlbumForm(initialAlbum);
                                }}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>
            {/* Responsive: Stack columns on small screens */}
            <style>{`
                @media (max-width: 1023px) {
                    .lg\\:flex-row {
                        flex-direction: column !important;
                    }
                    .lg\\:w-1\\/3 {
                        width: 100% !important;
                    }
                    .lg\\:mb-0 {
                        margin-bottom: 1.5rem !important;
                    }
                }
            `}</style>
        </section>
    );
}
