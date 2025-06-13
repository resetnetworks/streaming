import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectAlbumById } from "../features/albums/albumsSelector";
import { fetchAlbumById } from "../features/albums/albumsSlice";
import UserLayout from "../components/UserLayout";
import UserHeader from "../components/UserHeader";
import { setSelectedSong, play } from "../features/playback/playerSlice";

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

export default function Album() {
    const { albumId } = useParams();
    const dispatch = useDispatch();
    const album = useSelector(state => selectAlbumById(state, albumId));

    const selectedSong = useSelector((state) => state.player.selectedSong);

    useEffect(() => {
        if (albumId) {
            dispatch(fetchAlbumById(albumId));
        }
    }, [albumId, dispatch]);

    if (!album) {
        return <div style={{ color: "black", padding: 32 }}>Album not found.</div>;
    }
      const handlePlaySong = (songId) => {
        console.log("Playing song with ID:", songId);
        
        dispatch(setSelectedSong(songId));
        dispatch(play());
      };
    

    const songs = album.songs || [];

    return (
        <UserLayout>
            <UserHeader />
            <div
                style={{
                    background: "linear-gradient(180deg, #333 0%, #181818 100%)",
                    minHeight: "100vh",
                    color: "white",
                    fontFamily: "Inter, Arial, sans-serif",
                }}
            >
                {/* Album Header */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "flex-end",
                        padding: "40px 32px 24px 32px",
                        gap: "32px",
                    }}
                >
                    <img
                        src={album.coverImage}
                        alt="Album Cover"
                        style={{
                            width: 232,
                            height: 232,
                            objectFit: "cover",
                            borderRadius: 8,
                            boxShadow: "0 4px 60px rgba(0,0,0,0.5)",
                        }}
                    />
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", opacity: 0.8 }}>
                            Album
                        </div>
                        <h1 style={{ fontSize: 64, fontWeight: 900, margin: "8px 0" }}>{album.title}</h1>
                        <div style={{ fontSize: 18, fontWeight: 400, margin: "8px 0", color: "#b3b3b3" }}>
                            {album.description}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16 }}>
                            <span style={{ fontWeight: 700 }}>{album.artist}</span>
                            <span style={{ fontSize: 24, margin: "0 8px" }}>•</span>
                            <span>{formatDate(album.releaseDate)}</span>
                            <span style={{ fontSize: 24, margin: "0 8px" }}>•</span>
                            <span>{songs.length} songs</span>
                        </div>
                    </div>
                </div>

                {/* Song List */}
                <div style={{ padding: "0 32px" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 32 }}>
                        <thead>
                            <tr style={{ color: "#b3b3b3", fontSize: 14, textAlign: "left" }}>
                                <th style={{ width: 40, padding: "8px 0" }}>#</th>
                                <th style={{ padding: "8px 0" }}>Title</th>
                                <th style={{ width: 80, textAlign: "right", padding: "8px 0" }}>Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            {songs.map((song, idx) => (
                                <tr
                                    key={song._id || song.id || idx}
                                    style={{
                                        borderTop: "1px solid #282828",
                                        height: 56,
                                        transition: "background 0.2s",
                                        cursor: "pointer",
                                    }}
                                    onMouseOver={e => (e.currentTarget.style.background = "#282828")}
                                    onMouseOut={e => (e.currentTarget.style.background = "transparent")}
                                    onPlay={() => handlePlaySong(song._id)}
              isSelected={selectedSong === song._id}
                                >
                                    <td style={{ color: "#b3b3b3", fontWeight: 500 }}>{idx + 1}</td>
                                    <td style={{ fontWeight: 500 }}>{song.title}</td>
                                    <td style={{ textAlign: "right", color: "#b3b3b3" }}>
                                        {typeof song.duration === "number"
                                            ? Math.floor(song.duration / 60) + ":" + String(song.duration % 60).padStart(2, "0")
                                            : song.duration}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </UserLayout>
    );
}
