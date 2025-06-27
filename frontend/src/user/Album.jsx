import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import UserLayout from "../components/user/UserLayout";
import UserHeader from "../components/user/UserHeader";
import SongList from "../components/user/SongList";

import { fetchAlbumById } from "../features/albums/albumsSlice";
import { selectAlbumDetails, selectAlbumsLoading } from "../features/albums/albumsSelector";

import { fetchAllArtists } from "../features/artists/artistsSlice";
import { selectAllArtists } from "../features/artists/artistsSelectors";

import { setSelectedSong, play } from "../features/playback/playerSlice";
import { formatDuration } from "../utills/helperFunctions";

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

    const album = useSelector(selectAlbumDetails);
    const loading = useSelector(selectAlbumsLoading);
    const selectedSong = useSelector((state) => state.player.selectedSong);
    const artists = useSelector(selectAllArtists);

    useEffect(() => {
        if (albumId) {
            dispatch(fetchAlbumById(albumId));
        }
        dispatch(fetchAllArtists());
    }, [albumId, dispatch]);

    const handlePlaySong = (songId) => {
        dispatch(setSelectedSong(songId));
        dispatch(play());
    };

    if (loading || !album || artists.length === 0) {
        return <div className="text-white p-8">Loading...</div>;
    }

    const artistName =
        typeof album.artist === "object"
            ? album.artist.name
            : artists.find((artist) => artist._id === album.artist)?.name || "Unknown Artist";

    const songs = album.songs || [];

    return (
        <UserLayout>
            <UserHeader />
            <div className="min-h-screen text-white">
                {/* Album Header */}
                <div className="flex flex-col md:flex-row items-start md:items-end gap-8 px-8 pt-10 pb-6">
                    <img
                        src={album.coverImage}
                        alt="Album Cover"
                        className="w-[232px] h-[232px] object-cover rounded-lg shadow-lg"
                    />
                    <div>
                        <div className="text-sm font-bold tracking-widest uppercase opacity-80">
                            Album
                        </div>
                        <h1 className="text-5xl md:text-6xl font-extrabold my-2">
                            {album.title}
                        </h1>
                        <p className="text-lg text-gray-400">{album.description}</p>
                        <div className="flex items-center gap-2 mt-4 flex-wrap text-sm md:text-base text-gray-300">
                            <span className="font-semibold">{artistName}</span>
                            <span className="text-xl">•</span>
                            <span>{formatDate(album.releaseDate)}</span>
                            <span className="text-xl">•</span>
                            <span>{songs.length} songs</span>
                        </div>
                    </div>
                </div>

                {/* Song List */}
                <div className="px-8 pb-8">
                    {songs.length === 0 ? (
                        <div className="text-center text-gray-400 mt-8 text-lg">
                            No songs in this album.
                        </div>
                    ) : (
                        songs.map((song) => (
                            <div key={song._id} className="mb-4">
                                <SongList
                                    songId={song._id}
                                    img={song.coverImage || album.coverImage}
                                    songName={song.title}
                                    singerName={song.singer}
                                    seekTime={formatDuration(song.duration)}
                                    onPlay={() => handlePlaySong(song._id)}
                                    isSelected={selectedSong === song._id}
                                />
                            </div>
                        ))
                    )}
                </div>
            </div>
        </UserLayout>
    );
}
