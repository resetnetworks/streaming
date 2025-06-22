import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createArtist } from "../features/artists/artistsSlice";
import { selectArtistLoading, selectArtistError } from "../features/artists/artistsSelectors";
import { IoCloudUploadOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const CreateArtistPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loading = useSelector(selectArtistLoading);
  const error = useSelector(selectArtistError);

  const [form, setForm] = useState({
    name: "",
    bio: "",
    subscriptionPrice: "",
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Artist name is required");
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("bio", form.bio);
    formData.append("subscriptionPrice", form.subscriptionPrice);
    if (image) {
      formData.append("coverImage", image);
    }

    try {
      await dispatch(createArtist(formData)).unwrap();
      toast.success("Artist created successfully!");
      navigate("/admin");
    } catch (err) {
      toast.error(err || "Failed to create artist");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 border rounded shadow-lg bg-gray-900 border-gray-700">
      <h2 className="text-2xl font-bold mb-4 text-white">Create New Artist</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-4">
          <label className="block font-medium mb-1 text-gray-300">Artist Name *</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border p-2 rounded bg-gray-800 border-gray-700 text-white"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1 text-gray-300">Bio</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            className="w-full border p-2 rounded bg-gray-800 border-gray-700 text-white"
            rows="4"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1 text-gray-300">Subscription Price</label>
          <input
            type="number"
            name="subscriptionPrice"
            value={form.subscriptionPrice}
            onChange={handleChange}
            className="w-full border p-2 rounded bg-gray-800 border-gray-700 text-white"
            min="0"
          />
        </div>

        <div className="mb-6">
          <label className="block font-medium mb-2 text-gray-300">Cover Image</label>
          
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-gray-800 border-gray-600 hover:border-gray-500">
              {imagePreview ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-full max-w-full object-contain rounded"
                  />
                  <div className="absolute bottom-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm">
                    Click to change
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                 <IoCloudUploadOutline className="text-gray-400 text-4xl"/>
                  <p className="mb-2 text-sm text-gray-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-400">
                    PNG, JPG, JPEG (MAX. 5MB)
                  </p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
        >
          {loading ? "Creating..." : "Create Artist"}
        </button>
      </form>
    </div>
  );
};

export default CreateArtistPage;