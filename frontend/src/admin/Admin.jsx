import React, { useState } from "react";
import IconHeader from "../components/IconHeader";
import Albums from "./Albums";
import Playlists from "./Playlists";
import Artists from "./Artists";
import Songs from "./Songs";
import Transactions from "./Transactions";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import {
  selectAllAlbums,
  selectAlbumForm,
  selectEditingAlbum,
} from "../features/albums/albumsSelector";
import {
  setAlbumForm,
  setEditingAlbum,
  clearEditingAlbum,
  createAlbum,
  deleteAlbum as deleteAlbumAction,
} from "../features/albums/albumsSlice";


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

  const initialSong = {
    title: "",
    artist: "",
    album: "",
    genre: "",
    duration: "",
    cover: "",
    price: "",
    isPremium: false,
};

const initialArtist = { name: "", bio: "", image: "" };

export default function Admin() {
    // State for Playlists
    const [playlists, setPlaylists] = useState([]);
    const [playlistForm, setPlaylistForm] = useState(initialPlaylist);
    const [editingPlaylist, setEditingPlaylist] = useState(null);

    // // State for Albums
    // const [albums, setAlbums] = useState([]);
    // const [albumForm, setAlbumForm] = useState(initialAlbum);
    // const [editingAlbum, setEditingAlbum] = useState(null);

    // ...inside Admin component:
const dispatch = useDispatch();
const albums = useSelector(selectAllAlbums);
const albumForm = useSelector(selectAlbumForm);
const editingAlbum = useSelector(selectEditingAlbum);

    // State for Artists
    const [artists, setArtists] = useState([]);
    const [artistForm, setArtistForm] = useState(initialArtist);
    const [editingArtist, setEditingArtist] = useState(null);

    // State for Songs
const [songs, setSongs] = useState([]);
const [songForm, setSongForm] = useState(initialSong);
const [editingSong, setEditingSong] = useState(null);

const [coverFile, setCoverFile] = useState(null);

// State for Transactions (for future use)
const [transactions, setTransactions] = useState([]);

    // State for Featured Song (random useful feature)
    const [featuredSong, setFeaturedSong] = useState("");

    // State for section selection
    const [activeSection, setActiveSection] = useState("albums"); // "albums" by default

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
    dispatch(setAlbumForm({ ...albumForm, songs: newSongs }));
  } else {
    dispatch(setAlbumForm({ ...albumForm, [e.target.name]: e.target.value }));
  }
};

    const addAlbumSongField = () =>
        setAlbumForm({ ...albumForm, songs: [...albumForm.songs, ""] });

    const removeAlbumSongField = (idx) => {
        const newSongs = albumForm.songs.filter((_, i) => i !== idx);
        setAlbumForm({ ...albumForm, songs: newSongs });
    };

const submitAlbum = async (e) => {
  e.preventDefault();
  if (!albumForm.artist || albumForm.artist.length !== 24) {
    alert("Please select a valid artist from the dropdown.");
    return;
  }
  const formData = new FormData();
  formData.append("title", albumForm.title);
  formData.append("description", albumForm.description);
  formData.append("artist", albumForm.artist);
  formData.append("price", albumForm.price);
  if (coverFile) { // <-- use coverFile, NOT albumForm.cover
    formData.append("coverImage", coverFile);
  }
  dispatch(createAlbum(formData));
};

  

const deleteAlbum = (idx) => {
  dispatch(deleteAlbumAction(idx));
};

const editAlbum = (idx) => {
  dispatch(setEditingAlbum(idx));
  dispatch(setAlbumForm(albums[idx]));
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


    const handleSongChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSongForm({
        ...songForm,
        [name]: type === "checkbox" ? checked : value,
    });
};

// Song Handlers
const submitSong = (e) => {
    e.preventDefault();
    if (editingSong !== null) {
        setSongs(songs.map((s, i) => (i === editingSong ? { ...songForm } : s)));
        setEditingSong(null);
    } else {
        setSongs([...songs, { ...songForm }]);
    }
    setSongForm(initialSong);
};
const deleteSong = (idx) => {
    setSongs(songs.filter((_, i) => i !== idx));
    if (editingSong === idx) setEditingSong(null);
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

    // Section switcher button style
    const sectionBtnClass = (section) =>
        `px-6 py-2 rounded-lg font-semibold shadow border transition mx-2
        ${activeSection === section
            ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white border-blue-700"
            : "bg-blue-100 text-blue-700 border-blue-400 hover:bg-blue-200"}`;

    return (
        <div className="bg-image px-8 w-full max-w-none mx-auto flex flex-col min-h-screen">
            <IconHeader />
            <h1 className="text-4xl font-bold mb-10 text-center text-white drop-shadow-lg">Admin Dashboard</h1>
            {/* Section Switcher */}
            <div className="flex justify-center mb-8">
                <button
                    className={sectionBtnClass("albums")}
                    onClick={() => setActiveSection("albums")}
                >
                    Albums
                </button>
                <button
                    className={sectionBtnClass("playlists")}
                    onClick={() => setActiveSection("playlists")}
                >
                    Playlists
                </button>
                <button
                    className={sectionBtnClass("artists")}
                    onClick={() => setActiveSection("artists")}
                >
                    Artists
                </button>
                <button
                    className={sectionBtnClass("songs")}
                    onClick={() => setActiveSection("songs")}
                 >
                    Songs
                </button>

                <button
                className={sectionBtnClass("transactions")}
                onClick={() => setActiveSection("transactions")}
                >
                Transactions
                </button>
            </div>
            <div className="flex-1 flex justify-center items-start">
                {activeSection === "albums" && (
                
   <Albums
  albums={albums}
  albumForm={albumForm}
  editingAlbum={editingAlbum}
  setEditingAlbum={(idx) => dispatch(setEditingAlbum(idx))}
  setAlbumForm={(form) => dispatch(setAlbumForm(form))}
  initialAlbum={initialAlbum}
  handleAlbumChange={handleAlbumChange}
  submitAlbum={submitAlbum}
  deleteAlbum={deleteAlbum}
  inputClass={inputClass}
  textareaClass={textareaClass}
  coverFile={coverFile}
  setCoverFile={setCoverFile}
/>
                )}
                {activeSection === "playlists" && (

                    <Playlists
        playlists={playlists}
        playlistForm={playlistForm}
        editingPlaylist={editingPlaylist}
        setEditingPlaylist={setEditingPlaylist}
        setPlaylistForm={setPlaylistForm}
        initialPlaylist={initialPlaylist}
        handlePlaylistChange={handlePlaylistChange}
        submitPlaylist={submitPlaylist}
        deletePlaylist={deletePlaylist}
        addSongField={addSongField}
        removeSongField={removeSongField}
        inputClass={inputClass}
        inputSongClass={inputSongClass}
    />

                )}
                {activeSection === "artists" && (
                    <Artists
        artists={artists}
        artistForm={artistForm}
        editingArtist={editingArtist}
        setEditingArtist={setEditingArtist}
        setArtistForm={setArtistForm}
        initialArtist={initialArtist}
        handleArtistChange={handleArtistChange}
        submitArtist={submitArtist}
        deleteArtist={deleteArtist}
        inputClass={inputClass}
        textareaClass={textareaClass}
    />
                   
                )}

                {activeSection === "songs" && (
    <Songs
        songs={songs}
        songForm={songForm}
        editingSong={editingSong}
        setEditingSong={setEditingSong}
        setSongForm={setSongForm}
        initialSong={initialSong}
        handleSongChange={handleSongChange}
        submitSong={submitSong}
        deleteSong={deleteSong}
        inputClass={inputClass}
        textareaClass={textareaClass}
    />
)}
{activeSection === "transactions" && (
  <Transactions transactions={transactions} />
)}


            </div>
            <div className="mt-8 mb-4 flex flex-col items-center">
                <button
                    className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-2 rounded-lg shadow hover:from-blue-700 hover:to-blue-400 transition mb-2"
                    onClick={pickFeaturedSong}
                >
                    Pick Featured Song
                </button>
                {featuredSong && (
                    <div className="text-lg text-white font-semibold">
                        Featured Song: <span className="text-blue-300">{featuredSong}</span>
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

