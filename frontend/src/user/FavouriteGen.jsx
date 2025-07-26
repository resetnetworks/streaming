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

  // Check if user just registered and ensure proper authentication
  useEffect(() => {
    const justRegistered = localStorage.getItem('justRegistered');
    
    // Debug logs to track what's happening
    console.log("User in genre selection:", user);
    console.log("Is authenticated:", isAuthenticated);
    console.log("Just registered:", justRegistered);
    console.log("User ID:", user?._id || user?.id);
    
    if (!isAuthenticated) {
      console.log("User not authenticated, redirecting to login");
      navigate("/login");
      return;
    }

    // If user just registered but user data is not complete, fetch profile
    if (justRegistered && (!user || !user._id)) {
      console.log("Just registered but user data incomplete, fetching profile");
      dispatch(getMyProfile()).catch((error) => {
        console.error("Failed to get user profile:", error);
        navigate("/login");
      });
      return;
    }
    
    // If user didn't just register and already has genres, redirect to home
    if (!justRegistered && user?.preferredGenres?.length > 0) {
      console.log("User already has genres, redirecting to home");
      navigate("/");
      return;
    }

    // Set existing preferred genres if any
    if (user?.preferredGenres?.length > 0) {
      console.log("Setting existing preferred genres:", user.preferredGenres);
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

    try {
      setLoading(true);
      
      console.log("Starting genre update process");
      console.log("Current user before update:", user);
      
      // Update preferred genres
      await dispatch(updatePreferredGenres(selected)).unwrap();
      console.log("Genres updated successfully");
      
      // Refresh user profile to get updated data  
      await dispatch(getMyProfile()).unwrap();
      console.log("Profile refreshed after genre update");
      
      // Clear the registration flag
      localStorage.removeItem('justRegistered');
      console.log("Registration flag cleared");
      
      toast.success("Genres saved successfully!");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error(error || "Failed to update genres");
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
