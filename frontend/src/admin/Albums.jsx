// import React from "react";

// const initialAlbum = {
//     title: "",
//     description: "",
//     artist: "",
//     cover: "",
//     genre: "",
//     songs: [""],
//     price: "",
// };

// export default function Albums({ albums, setAlbums, editingAlbum, setEditingAlbum, albumForm, setAlbumForm }) {
//     const handleAlbumChange = (e) => {
//         setAlbumForm({ ...albumForm, [e.target.name]: e.target.value });
//     };

//     const submitAlbum = (e) => {
//         e.preventDefault();
//         if (editingAlbum !== null) {
//             setAlbums(
//                 albums.map((a, i) => (i === editingAlbum ? { ...albumForm } : a))
//             );
//             setEditingAlbum(null);
//         } else {
//             setAlbums([...albums, { ...albumForm }]);
//         }
//         setAlbumForm(initialAlbum);
//     };

//     const deleteAlbum = (idx) => {
//         setAlbums(albums.filter((_, i) => i !== idx));
//         if (editingAlbum === idx) setEditingAlbum(null);
//     };

//     return (
//         <section className="w-full max-w-5xl flex gap-8">
//             <div className="w-1/3 min-w-[260px] bg-gradient-to-br from-blue-500/80 to-blue-900/80 rounded-2xl shadow-2xl p-6 border border-blue-100 flex flex-col">
//                 <button
//                     className={`mb-4 px-4 py-2 rounded-lg font-semibold shadow border transition text-left ${
//                         editingAlbum === null
//                             ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white border-blue-700"
//                             : "bg-blue-100 text-blue-700 border-blue-400 hover:bg-blue-200"
//                     }`}
//                     onClick={() => {
//                         setEditingAlbum(null);
//                         setAlbumForm(initialAlbum);
//                     }}
//                 >
//                     + Create New Album
//                 </button>
//                 <div className="overflow-y-auto flex-1">
//                     <ul className="space-y-2">
//                         {albums.length === 0 && (
//                             <li className="text-blue-200 text-center py-8">No albums yet.</li>
//                         )}
//                         {albums.map((al, idx) => (
//                             <li
//                                 key={idx}
//                                 className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer border transition ${
//                                     editingAlbum === idx
//                                         ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white border-blue-700"
//                                         : "bg-blue-700/30 hover:bg-blue-700/50 text-white border-blue-200"
//                                 }`}
//                                 onClick={() => {
//                                     setEditingAlbum(idx);
//                                     setAlbumForm(albums[idx]);
//                                 }}
//                             >
//                                 {al.cover && (
//                                     <img
//                                         src={al.cover}
//                                         alt="cover"
//                                         className="w-10 h-10 object-cover rounded-lg border border-blue-300"
//                                     />
//                                 )}
//                                 <div className="flex-1">
//                                     <div className="font-semibold truncate">{al.title}</div>
//                                     <div className="text-xs text-blue-200 truncate">{al.artist}</div>
//                                 </div>
//                             </li>
//                         ))}
//                     </ul>
//                 </div>
//             </div>
//             <div className="flex-1 bg-gradient-to-br from-blue-500/80 to-blue-900/80 rounded-2xl shadow-2xl p-10 border border-blue-100">
//                 <h2 className="text-3xl font-bold mb-6 text-white flex items-center gap-3">
//                     {editingAlbum !== null ? "Edit Album" : "Create New Album"}
//                 </h2>
//                 <form onSubmit={submitAlbum} className="space-y-6">
//                     <div className="flex gap-6 items-center">
//                         <div>
//                             <label className="block font-medium mb-1 text-white">Cover Image</label>
//                             <input
//                                 type="file"
//                                 accept="image/*"
//                                 className="block w-full text-white"
//                                 onChange={e => {
//                                     const file = e.target.files[0];
//                                     if (file) {
//                                         const reader = new FileReader();
//                                         reader.onloadend = () => {
//                                             setAlbumForm({ ...albumForm, cover: reader.result });
//                                         };
//                                         reader.readAsDataURL(file);
//                                     }
//                                 }}
//                             />
//                             {albumForm.cover && (
//                                 <img
//                                     src={albumForm.cover}
//                                     alt="cover preview"
//                                     className="mt-2 w-32 h-32 object-cover rounded-xl border-4 border-blue-500 shadow-lg"
//                                 />
//                             )}
//                         </div>
//                         <div className="flex-1 space-y-4">
//                             <input
//                                 className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black text-lg font-semibold bg-white/80"
//                                 name="title"
//                                 placeholder="Album Title"
//                                 value={albumForm.title}
//                                 onChange={handleAlbumChange}
//                                 required
//                             />
//                             <input
//                                 className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black bg-white/80"
//                                 name="artist"
//                                 placeholder="Artist"
//                                 value={albumForm.artist}
//                                 onChange={handleAlbumChange}
//                                 required
//                             />
//                             <input
//                                 className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black bg-white/80"
//                                 name="price"
//                                 placeholder="Price"
//                                 type="number"
//                                 value={albumForm.price}
//                                 onChange={handleAlbumChange}
//                             />
//                         </div>
//                     </div>
//                     <textarea
//                         className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black bg-white/80"
//                         name="description"
//                         placeholder="Album Description"
//                         value={albumForm.description}
//                         onChange={handleAlbumChange}
//                         rows={3}
//                     />
//                     <div className="flex gap-4">
//                         <button
//                             type="submit"
//                             className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-8 py-3 rounded-full font-bold shadow-lg transition text-lg hover:from-blue-600 hover:to-blue-800"
//                         >
//                             {editingAlbum !== null ? "Update Album" : "Create Album"}
//                         </button>
//                         {editingAlbum !== null && (
//                             <button
//                                 type="button"
//                                 className="bg-white text-blue-700 border border-blue-500 px-8 py-3 rounded-full font-bold shadow-lg transition text-lg hover:bg-blue-100 ml-2"
//                                 onClick={() => {
//                                     deleteAlbum(editingAlbum);
//                                     setEditingAlbum(null);
//                                     setAlbumForm(initialAlbum);
//                                 }}
//                             >
//                                 Delete Album
//                             </button>
//                         )}
//                         {editingAlbum !== null && (
//                             <button
//                                 type="button"
//                                 className="ml-2 text-white underline"
//                                 onClick={() => {
//                                     setEditingAlbum(null);
//                                     setAlbumForm(initialAlbum);
//                                 }}
//                             >
//                                 Cancel
//                             </button>
//                         )}
//                     </div>
//                 </form>
//             </div>
//         </section>
//     );
// }

import React from "react";

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
}) {
    return (
        <section className="w-full max-w-5xl flex gap-8">
            {/* ...Paste the Albums JSX here, replacing state/handlers with props... */}
            <section className="w-full max-w-5xl flex gap-8">
                        {/* Left: Album List & Create New */}
                        <div className="w-1/3 min-w-[260px] bg-gradient-to-br from-blue-500/80 to-blue-900/80 rounded-2xl shadow-2xl p-6 border border-blue-100 flex flex-col">
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
                        <div className="flex-1 bg-gradient-to-br from-blue-500/80 to-blue-900/80 rounded-2xl shadow-2xl p-10 border border-blue-100">
                            <h2 className="text-3xl font-bold mb-6 text-white flex items-center gap-3">
                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                    <circle cx="16" cy="16" r="16" fill="#2563eb" />
                                    <path d="M23.5 12.5C20.5 10.5 11.5 10.5 8.5 12.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                                    <path d="M22 15.5C19.5 14 12.5 14 10 15.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                                    <path d="M20.5 18.5C18.5 17.5 13.5 17.5 11.5 18.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                                {editingAlbum !== null ? "Edit Album" : "Create New Album"}
                            </h2>
                            <form onSubmit={submitAlbum} className="space-y-6">
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
                                                className="mt-2 w-32 h-32 object-cover rounded-xl border-4 border-blue-500 shadow-lg"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <input
                                            className={inputClass + " text-lg font-semibold bg-white/80"}
                                            name="title"
                                            placeholder="Album Title"
                                            value={albumForm.title}
                                            onChange={handleAlbumChange}
                                            required
                                        />
                                        <input
                                            className={inputClass + " bg-white/80"}
                                            name="artist"
                                            placeholder="Artist"
                                            value={albumForm.artist}
                                            onChange={handleAlbumChange}
                                            required
                                        />
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
                                <div className="flex gap-4">
                                    <button
                                        type="submit"
                                        className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-8 py-3 rounded-full font-bold shadow-lg transition text-lg hover:from-blue-600 hover:to-blue-800"
                                    >
                                        {editingAlbum !== null ? "Update Album" : "Create Album"}
                                    </button>
                                    {editingAlbum !== null && (
                                        <button
                                            type="button"
                                            className="bg-white text-blue-700 border border-blue-500 px-8 py-3 rounded-full font-bold shadow-lg transition text-lg hover:bg-blue-100 ml-2"
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
                                            className="ml-2 text-white underline"
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
                    </section>
        </section>
    );
}