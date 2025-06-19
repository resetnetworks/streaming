import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { createAdminPlaylist } from "../features/playlist/playlistSlice";
import {
  selectAdminPlaylistLoading,
  selectAdminPlaylistError,
} from "../features/playlist/playlistSelector";

const AdminPlaylist = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loading = useSelector(selectAdminPlaylistLoading);
  const error = useSelector(selectAdminPlaylistError);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
  });

  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files.length > 0) {
      setFormData({ ...formData, image: files[0] });
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    if (formData.image) {
      data.append("image", formData.image);
    }

    const result = await dispatch(createAdminPlaylist(data));

    if (createAdminPlaylist.fulfilled.match(result)) {
      toast.success("Playlist created successfully!");
      navigate("/admin/playlists");
    } else {
      toast.error(result.payload || "Failed to create playlist");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-gray-900 p-6 rounded-xl shadow-lg text-white">
      <h2 className="text-2xl font-bold mb-6">Create Playlist</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Playlist Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block mb-1">Cover Image</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            className="text-sm text-gray-300"
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="w-32 h-32 mt-3 rounded object-cover border border-gray-600"
            />
          )}
        </div>

        {error && <p className="text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-md font-semibold"
        >
          {loading ? "Creating..." : "Create Playlist"}
        </button>
      </form>
    </div>
  );
};

export default AdminPlaylist;
