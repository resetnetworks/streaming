import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createArtist, updateArtist } from "../../features/artists/artistsSlice";
import {
  selectArtistLoading,
  selectArtistError,
} from "../../features/artists/artistsSelectors";
import { IoCloudUploadOutline } from "react-icons/io5";
import { FaTimes } from "react-icons/fa";
import { toast } from "sonner";


const CreateArtistModal = ({ isOpen, onClose, initialData = null }) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectArtistLoading);
  const error = useSelector(selectArtistError);


  const [form, setForm] = useState({
    name: "",
    bio: "",
    subscriptionPrice: "0",
    cycle: "",
    location: "",
  });


  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);


  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        bio: initialData.bio || "",
        subscriptionPrice: initialData.subscriptionPrice?.toString() || "0",
        cycle: initialData.cycle || "",
        location: initialData.location || "",
      });
      setImagePreview(initialData.image || null);
    } else {
      setForm({
        name: "",
        bio: "",
        subscriptionPrice: "0",
        cycle: "",
        location: "",
      });
      setImage(null);
      setImagePreview(null);
    }
  }, [initialData]);


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  const handleImageChange = (e) => {
    const file = e.target.files;
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


    if (form.location.trim().length < 2) {
      toast.error("Location must be at least 2 characters");
      return;
    }


    const isPaid = form.subscriptionPrice !== "0";
    if (isPaid && !form.cycle) {
      toast.error("Subscription cycle is required for paid plans");
      return;
    }


    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("bio", form.bio);
    formData.append("subscriptionPrice", form.subscriptionPrice);
    formData.append("cycle", isPaid ? form.cycle : "");
    formData.append("location", form.location);
    if (image) {
      formData.append("coverImage", image);
    }


    try {
      if (initialData) {
        await dispatch(updateArtist({ id: initialData._id, formData })).unwrap();
        toast.success("Artist updated successfully!");
      } else {
        await dispatch(createArtist(formData)).unwrap();
        toast.success("Artist created successfully!");
      }
      onClose();
    } catch (err) {
      toast.error(err || "Failed to submit artist");
    }
  };


  const isPaid = (form.subscriptionPrice || "0") !== "0";


  if (!isOpen) return null;


  const mode = initialData ? "Edit" : "Create";


  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">
            {mode} Artist
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <FaTimes />
          </button>
        </div>


        {error && <p className="text-red-500 mb-4">{error}</p>}


        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* Name */}
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


          {/* Bio */}
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


          {/* Location */}
          <div className="mb-4">
            <label className="block font-medium mb-1 text-gray-300">Location *</label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full border p-2 rounded bg-gray-800 border-gray-700 text-white"
              required
              minLength={2}
            />
          </div>


          {/* Subscription Price with USD symbol */}
          <div className="mb-4">
            <label className="block font-medium mb-1 text-gray-300">Subscription Price (USD)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">
                $
              </span>
              <input
                type="number"
                name="subscriptionPrice"
                value={form.subscriptionPrice}
                onChange={handleChange}
                className="w-full border p-2 pl-8 rounded bg-gray-800 border-gray-700 text-white"
                min="0"
                step="0.01"
                placeholder="0.00"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                USD
              </span>
            </div>
          </div>


          {/* Subscription Cycle */}
          <div className="mb-4">
            <label className="block font-medium mb-1 text-gray-300">
              Subscription Cycle {isPaid ? "*" : "(optional for free)"}
            </label>
            <select
              name="cycle"
              value={form.cycle}
              onChange={handleChange}
              className="w-full border p-2 rounded bg-gray-800 border-gray-700 text-white"
              disabled={!isPaid}
            >
              <option value="">
                {isPaid ? "Select cycle" : "Disabled for free plans"}
              </option>
              <option value="1m">Monthly (1 month)</option>
              <option value="3m">Quarterly (3 months)</option>
              <option value="6m">Half-yearly (6 months)</option>
              <option value="12m">Yearly (12 months)</option>
            </select>
          </div>


          {/* Cover Image */}
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
                    <IoCloudUploadOutline className="text-gray-400 text-4xl" />
                    <p className="mb-2 text-sm text-gray-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-400">PNG, JPG, JPEG (MAX. 5MB)</p>
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


          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
          >
            {loading ? `${mode}ing...` : `${mode} Artist`}
          </button>
        </form>
      </div>
    </div>
  );
};


export default CreateArtistModal;
