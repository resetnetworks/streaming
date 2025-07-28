// FavouriteGen.jsx
import React, { useState, useEffect } from "react";
import { IoMdCheckmark } from "react-icons/io";
import IconHeader from "../components/user/IconHeader";
import { FiSearch } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { updatePreferredGenres, getMyProfile } from "../features/auth/authSlice";
import { selectCurrentUser, selectIsAuthenticated } from "../features/auth/authSelectors";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const tags = [
  {
    id: "electronic",
    label: "#electronic",
    image: "https://images.unsplash.com/photo-1511376777868-611b54f68947",
  },
  {
    id: "techno",
    label: "#techno",
    image: "https://images.unsplash.com/photo-1549924231-f129b911e442",
  },
  {
    id: "idm",
    label: "#IDM",
    image: "https://images.unsplash.com/photo-1581091215367-59d3a6ccf3fc",
  },
  {
    id: "ambient",
    label: "#ambient",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
  },
  {
    id: "soundtrack",
    label: "#soundtrack",
    image: "https://images.unsplash.com/photo-1600267165910-2f47d8eecf02",
  },
];

const FavouriteGen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [selected, setSelected] = useState(user?.preferredGenres || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const justRegistered = localStorage.getItem('justRegistered');
    const registrationTime = localStorage.getItem('registrationTime');

    // Check if registration was too long ago (more than 10 minutes)
    if (registrationTime) {
      const timeDiff = Date.now() - parseInt(registrationTime);
      if (timeDiff > 10 * 60 * 1000) { // 10 minutes
        localStorage.removeItem('justRegistered');
        localStorage.removeItem('registrationTime');
      }
    }

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (justRegistered && (!user || !user._id)) {
      dispatch(getMyProfile()).catch((error) => {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem('justRegistered');
        localStorage.removeItem('registrationTime');
        navigate("/login");
      });
      return;
    }

    if (!justRegistered && user?.preferredGenres?.length > 0) {
      navigate("/");
      return;
    }

    if (user?.preferredGenres?.length > 0) {
      setSelected(user.preferredGenres);
    }
  }, [isAuthenticated, user, navigate, dispatch]);

  const handleSelection = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((item) => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleSubmit = async () => {
    if (selected.length < 3) {
      toast.error("Please select at least 3 genres");
      return;
    }

    // Check authentication before proceeding
    if (!isAuthenticated) {
      toast.error("Please login again to continue");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      // Verify user is still authenticated by checking profile first
      try {
        await dispatch(getMyProfile()).unwrap();
      } catch (profileError) {
        // If profile fetch fails, likely token is invalid
        toast.error("Session expired. Please login again.");
        localStorage.removeItem('justRegistered');
        localStorage.removeItem('registrationTime');
        navigate("/login");
        return;
      }

      // Now update preferred genres
      await dispatch(updatePreferredGenres(selected)).unwrap();

      // Refresh user profile after successful update
      await dispatch(getMyProfile()).unwrap();

      // Clean up localStorage
      localStorage.removeItem('justRegistered');
      localStorage.removeItem('registrationTime');

      toast.success("Genres saved successfully!");
      navigate("/", { replace: true });
    } catch (error) {
      // Handle specific token/auth errors
      if (error?.includes?.('token') || error?.includes?.('expired') || error?.includes?.('Invalid')) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem('justRegistered');
        localStorage.removeItem('registrationTime');
        navigate("/login");
      } else {
        toast.error(error || "Failed to update genres");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-image min-h-screen w-full flex flex-col items-center text-white">
      <IconHeader />

      <h1 className="md:text-4xl text-3xl text-center mt-6 px-2">
        Choose favourite genres
        <span className="text-blue-700"> (at least three)</span>
      </h1>

      <div className="w-full flex flex-col items-center px-8">
        <div className="flex items-center w-full max-w-3xl mx-auto mt-8 p-[2px] rounded-2xl searchbar-container shadow-inner shadow-[#7B7B7B47] bg-gray-700">
          <div className="flex items-center flex-grow rounded-l-2xl bg-gray-700">
            <FiSearch className="text-white mx-3" size={20} />
            <input
              type="text"
              placeholder="Search genres..."
              className="w-full bg-transparent text-white placeholder-gray-400 py-2 pr-4 outline-none"
            />
          </div>

          <button className="bg-gradient-to-r from-[#1b233dfe] via-[#0942a4e1] via-40% to-[#0C63FF] text-white font-semibold py-2 px-6 rounded-r-2xl border-[1px] searchbar-button">
            Search
          </button>
        </div>
      </div>

      <div className="flex md:w-2/3 w-full justify-center gap-6 flex-wrap py-8">
        {tags.map((tag) => {
          const isSelected = selected.includes(tag.id);
          return (
            <div
              key={tag.id}
              className="flex flex-col items-center cursor-pointer"
              onClick={() => handleSelection(tag.id)}
            >
              <div
                className={`relative w-40 h-40 rounded-full overflow-hidden border-2 transition-all duration-300 bg-center bg-cover
                ${
                  isSelected
                    ? "border-[#2400FF] shadow-[inset_0_0_30px_rgba(36,0,255,0.7),0_0_15px_rgba(36,0,255,0.5)]"
                    : "border-gray-700 border-2"
                }`}
                style={{ backgroundImage: `url(${tag.image})` }}
              >
                {isSelected && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#2400FF] rounded-t-full w-20 h-10 flex items-center justify-center shadow-lg z-20">
                    <IoMdCheckmark className="text-white text-3xl" />
                  </div>
                )}
              </div>
              <p className="mt-2 text-white text-sm">{tag.label}</p>
            </div>
          );
        })}
      </div>

      <div className="button-wrapper my-9 shadow-sm shadow-black">
        <button
          onClick={handleSubmit}
          disabled={selected.length < 3 || loading}
          className="custom-button"
        >
          {loading ? "Saving..." : "Continue"}
        </button>
      </div>
    </section>
  );
};

export default FavouriteGen;
