import React, { useState } from "react";
import IconHeader from "../components/IconHeader";

const initialPlaylist = { name: "", songs: [""] };
const initialAlbum = {
    title: "",
    description: "",
    artist: "",
    cover: "",
    genre: "",
    songs: [""],
    price: "",
};
const initialArtist = { name: "", bio: "", image: "" };

export default function Admin() {
    // State for Playlists
    const [playlists, setPlaylists] = useState([]);
    const [playlistForm, setPlaylistForm] = useState(initialPlaylist);
    const [editingPlaylist, setEditingPlaylist] = useState(null);

    // State for Albums
    const [albums, setAlbums] = useState([]);
    const [albumForm, setAlbumForm] = useState(initialAlbum);
    const [editingAlbum, setEditingAlbum] = useState(null);

    // State for Artists
    const [artists, setArtists] = useState([]);
    const [artistForm, setArtistForm] = useState(initialArtist);
    const [editingArtist, setEditingArtist] = useState(null);

    // State for Featured Song (random useful feature)
    const [featuredSong, setFeaturedSong] = useState("");

    // Playlist Handlers
    const handlePlaylistChange = (e, idx) => {
        if (e.target.name === "songs") {
            const newSongs = [...playlistForm.songs];
            newSongs[idx] = e.target.value;
            setPlaylistForm({ ...playlistForm, songs: newSongs });
        } else {
            setPlaylistForm({ ...playlistForm, [e.target.name]: e.target.value });
        }
    };

    const addSongField = () =>
        setPlaylistForm({ ...playlistForm, songs: [...playlistForm.songs, ""] });

    const removeSongField = (idx) => {
        const newSongs = playlistForm.songs.filter((_, i) => i !== idx);
        setPlaylistForm({ ...playlistForm, songs: newSongs });
    };

    const submitPlaylist = (e) => {
        e.preventDefault();
        if (editingPlaylist !== null) {
            setPlaylists(
                playlists.map((p, i) =>
                    i === editingPlaylist ? { ...playlistForm } : p
                )
            );
            setEditingPlaylist(null);
        } else {
            setPlaylists([...playlists, { ...playlistForm }]);
        }
        setPlaylistForm(initialPlaylist);
    };

    const editPlaylist = (idx) => {
        setEditingPlaylist(idx);
        setPlaylistForm(playlists[idx]);
    };

    const deletePlaylist = (idx) => {
        setPlaylists(playlists.filter((_, i) => i !== idx));
        if (editingPlaylist === idx) setEditingPlaylist(null);
    };

    // Album Handlers
    const handleAlbumChange = (e, idx) => {
        if (e.target.name === "songs") {
            const newSongs = [...albumForm.songs];
            newSongs[idx] = e.target.value;
            setAlbumForm({ ...albumForm, songs: newSongs });
        } else {
            setAlbumForm({ ...albumForm, [e.target.name]: e.target.value });
        }
    };

    const addAlbumSongField = () =>
        setAlbumForm({ ...albumForm, songs: [...albumForm.songs, ""] });

    const removeAlbumSongField = (idx) => {
        const newSongs = albumForm.songs.filter((_, i) => i !== idx);
        setAlbumForm({ ...albumForm, songs: newSongs });
    };

    const submitAlbum = (e) => {
        e.preventDefault();
        if (editingAlbum !== null) {
            setAlbums(
                albums.map((a, i) => (i === editingAlbum ? { ...albumForm } : a))
            );
            setEditingAlbum(null);
        } else {
            setAlbums([...albums, { ...albumForm }]);
        }
        setAlbumForm(initialAlbum);
    };

    const editAlbum = (idx) => {
        setEditingAlbum(idx);
        setAlbumForm(albums[idx]);
    };

    const deleteAlbum = (idx) => {
        setAlbums(albums.filter((_, i) => i !== idx));
        if (editingAlbum === idx) setEditingAlbum(null);
    };

    // Artist Handlers
    const handleArtistChange = (e) => {
        setArtistForm({ ...artistForm, [e.target.name]: e.target.value });
    };

    const submitArtist = (e) => {
        e.preventDefault();
        if (editingArtist !== null) {
            setArtists(
                artists.map((a, i) => (i === editingArtist ? { ...artistForm } : a))
            );
            setEditingArtist(null);
        } else {
            setArtists([...artists, { ...artistForm }]);
        }
        setArtistForm(initialArtist);
    };

    const editArtist = (idx) => {
        setEditingArtist(idx);
        setArtistForm(artists[idx]);
    };

    const deleteArtist = (idx) => {
        setArtists(artists.filter((_, i) => i !== idx));
        if (editingArtist === idx) setEditingArtist(null);
    };

    // Add text-black to all input and textarea elements
    const inputClass =
        "w-full border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black";
    const inputSongClass =
        "flex-1 border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black";
    const textareaClass =
        "w-full border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black";

    // Button styles for edit and delete
    const editBtnClass =
        "inline-block px-3 py-1 mr-2 rounded-lg bg-blue-500 text-white font-semibold shadow hover:bg-blue-600 transition border border-blue-700";
    const deleteBtnClass =
        "inline-block px-3 py-1 rounded-lg bg-blue-100 text-blue-700 font-semibold shadow hover:bg-blue-200 transition border border-blue-400";

    // List item text style
    const listTextClass =
        "font-sans text-black text-base leading-relaxed";

    // Random useful feature: Pick a random song from all playlists/albums as "Featured Song"
    const pickFeaturedSong = () => {
        const allSongs = [
            ...playlists.flatMap(p => p.songs),
            ...albums.flatMap(a => a.songs)
        ].filter(Boolean);
        if (allSongs.length === 0) {
            setFeaturedSong("No songs available");
        } else {
            const randomSong = allSongs[Math.floor(Math.random() * allSongs.length)];
            setFeaturedSong(randomSong);
        }
    };

    return (
        <div className="bg-image px-8 w-full max-w-none mx-auto flex flex-col min-h-screen">
            <IconHeader/>
            <h1 className="text-4xl font-bold mb-10 text-center text-white drop-shadow-lg">Admin Dashboard</h1>
            <div className="grid md:grid-cols-3 gap-10 flex-1">
                {/* Playlist Section */}
                {/* ... (existing code unchanged) ... */}
                <section className="backdrop-blur-xl bg-white/10  rounded-2xl shadow-xl p-8 mb-8 border border-blue-100">
                    <h2 className="text-2xl font-semibold mb-4 text-white">Playlists</h2>
                    <form onSubmit={submitPlaylist} className="space-y-4">
                        <input
                            className={inputClass}
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
                                        className={inputSongClass}
                                        name="songs"
                                        placeholder={`Song ${idx + 1}`}
                                        value={song}
                                        onChange={(e) => handlePlaylistChange(e, idx)}
                                        required
                                    />
                                    {playlistForm.songs.length > 1 && (
                                        <button
                                            type="button"
                                            className="ml-2 text-red-500 hover:text-red-700 text-xl"
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
                        <button
                            type="submit"
                            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-2 rounded-lg shadow hover:from-blue-600 hover:to-blue-800 transition"
                        >
                            {editingPlaylist !== null ? "Update" : "Create"} Playlist
                        </button>
                    </form>
                    <ul className="mt-6 space-y-3">
                        {playlists.map((pl, idx) => (
                            <li
                                key={idx}
                                className="border border-blue-100 rounded-lg p-3 flex flex-col gap-1 bg-blue-50"
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-black">{pl.name}</span>
                                    <div>
                                        <button
                                            className={editBtnClass}
                                            onClick={() => editPlaylist(idx)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className={deleteBtnClass}
                                            onClick={() => deletePlaylist(idx)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                <ul className="text-sm pl-4 list-disc">
                                    {pl.songs.map((s, i) => (
                                        <li key={i} className={listTextClass}>{s}</li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Album Section */}
                <section className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-xl p-8 mb-8 border border-blue-100">
                    <h2 className="text-2xl font-semibold mb-4 text-white">Albums</h2>
                    <form onSubmit={submitAlbum} className="space-y-4">
                        <input
                            className={inputClass}
                            name="title"
                            placeholder="Title"
                            value={albumForm.title}
                            onChange={handleAlbumChange}
                            required
                        />
                        <input
                            className={inputClass}
                            name="description"
                            placeholder="Description"
                            value={albumForm.description}
                            onChange={handleAlbumChange}
                        />
                        <input
                            className={inputClass}
                            name="artist"
                            placeholder="Artist"
                            value={albumForm.artist}
                            onChange={handleAlbumChange}
                            required
                        />
                        {/* Cover Image Upload */}
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
                                            setAlbumForm({ ...albumForm, cover: reader.result });
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                            {albumForm.cover && (
                                <img
                                    src={albumForm.cover}
                                    alt="cover preview"
                                    className="mt-2 w-24 h-24 object-cover rounded-lg border border-blue-200"
                                />
                            )}
                        </div>
                        <input
                            className={inputClass}
                            name="genre"
                            placeholder="Genre"
                            value={albumForm.genre}
                            onChange={handleAlbumChange}
                        />
                        <div>
                            <label className="block font-medium mb-1 text-white">Songs</label>
                            {albumForm.songs.map((song, idx) => (
                                <div key={idx} className="flex items-center mb-2">
                                    <input
                                        className={inputSongClass}
                                        name="songs"
                                        placeholder={`Song ${idx + 1}`}
                                        value={song}
                                        onChange={(e) => handleAlbumChange(e, idx)}
                                        required
                                    />
                                    {albumForm.songs.length > 1 && (
                                        <button
                                            type="button"
                                            className="ml-2 text-red-500 hover:text-red-700 text-xl"
                                            onClick={() => removeAlbumSongField(idx)}
                                        >
                                            &times;
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                className="text-white text-sm mt-1 hover:underline"
                                onClick={addAlbumSongField}
                            >
                                + Add Song
                            </button>
                        </div>
                        <input
                            className={inputClass}
                            name="price"
                            placeholder="Price"
                            type="number"
                            value={albumForm.price}
                            onChange={handleAlbumChange}
                        />
                        <button
                            type="submit"
                            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-2 rounded-lg shadow hover:from-blue-600 hover:to-blue-800 transition"
                        >
                            {editingAlbum !== null ? "Update" : "Create"} Album
                        </button>
                    </form>
                    <ul className="mt-6 space-y-3">
                        {albums.map((al, idx) => (
                            <li
                                key={idx}
                                className="border border-blue-100 rounded-lg p-3 flex flex-col gap-2 bg-blue-50"
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-black">{al.title}</span>
                                    <div>
                                        <button
                                            className={editBtnClass}
                                            onClick={() => editAlbum(idx)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className={deleteBtnClass}
                                            onClick={() => deleteAlbum(idx)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {al.cover && (
                                        <img
                                            src={al.cover}
                                            alt="cover"
                                            className="w-16 h-16 object-cover rounded-lg border border-blue-200"
                                        />
                                    )}
                                    <div>
                                        <div className="text-sm">
                                            <span className="font-medium text-black">Artist:</span>{" "}
                                            <span className="text-black">{al.artist}</span>
                                        </div>
                                        <div className="text-sm">
                                            <span className="font-medium text-black">Genre:</span>{" "}
                                            <span className="text-black">{al.genre}</span>
                                        </div>
                                        <div className="text-sm">
                                            <span className="font-medium text-black">Price:</span>{" "}
                                            <span className="text-black">${al.price}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-sm text-black">{al.description}</div>
                                <ul className="text-sm pl-4 list-disc">
                                    {al.songs.map((s, i) => (
                                        <li key={i} className={listTextClass}>{s}</li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                </section>
                {/* ... (existing code unchanged) ... */}
                <section className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-xl p-8 mb-8 border border-blue-100">
                    <h2 className="text-2xl font-semibold mb-4 text-white">Artists</h2>
                    <form onSubmit={submitArtist} className="space-y-4">
                        <input
                            className={inputClass}
                            name="name"
                            placeholder="Artist Name"
                            value={artistForm.name}
                            onChange={handleArtistChange}
                            required
                        />
                        <textarea
                            className={textareaClass}
                            name="bio"
                            placeholder="Bio"
                            value={artistForm.bio}
                            onChange={handleArtistChange}
                        />
                        <input
                            className={inputClass}
                            name="image"
                            placeholder="Image URL"
                            value={artistForm.image}
                            onChange={handleArtistChange}
                        />
                        <button
                            type="submit"
                            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-2 rounded-lg shadow hover:from-blue-600 hover:to-blue-800 transition"
                        >
                            {editingArtist !== null ? "Update" : "Create"} Artist
                        </button>
                    </form>
                    <ul className="mt-6 space-y-3">
                        {artists.map((ar, idx) => (
                            <li
                                key={idx}
                                className="border border-blue-100 rounded-lg p-3 bg-blue-50 flex items-center gap-3"
                            >
                                {ar.image && (
                                    <img
                                        src={ar.image}
                                        alt="artist"
                                        className="w-16 h-16 object-cover rounded-lg border border-blue-200"
                                    />
                                )}
                                <div className="flex-1">
                                    <div className="font-semibold text-black">{ar.name}</div>
                                    <div className="text-sm text-black">{ar.bio}</div>
                                </div>
                                <div>
                                    <button
                                        className={editBtnClass}
                                        onClick={() => editArtist(idx)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className={deleteBtnClass}
                                        onClick={() => deleteArtist(idx)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
            {/* Featured Song Section */}
            <div className="mt-8 mb-4 flex flex-col items-center">
                <button
                    className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-2 rounded-lg shadow hover:from-blue-700 hover:to-blue-400 transition mb-2"
                    onClick={pickFeaturedSong}
                >
                    Pick Featured Song
                </button>
                {featuredSong && (
                    <div className="text-lg text-white font-semibold">
                        Featured Song: <span className="text-blue-500">{featuredSong}</span>
                    </div>
                )}
            </div>
            {/* Footer */}
            <footer className="w-full text-center py-4 mt-auto text-white bg-gradient-to-r from-blue-900/80 to-blue-700/80">
                &copy; {new Date().getFullYear()} Streamify Admin &mdash; Built with React. 
                <span className="ml-2">🎵</span>
            </footer>
        </div>
    );
}