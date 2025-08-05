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
    id: "Electronic",
    label: "#Electronic",
    image: "/images/genre1.jpg",
  },
  {
    id: "IDM",
    label: "#IDM",
    image: "/images/genre2.jpg",
  },
  {
    id: "Ambient",
    label: "#Ambient",
    image: "/images/genre3.jpg",
  },
  {
    id: "Experimental",
    label: "#Experimental",
    image: "/images/genre4.jpg",
  },
  {
    id: "Avant Garde",
    label: "#Avant Garde",
    image: "/images/genre5.jpg",
  },
  {
    id: "Noise",
    label: "#Noise",
    image: "/images/genre6.jpg",
  },
  {
    id: "Downtempo",
    label: "#Downtempo",
    image: "/images/genre7.jpg",
  },
  {
    id: "Soundtrack",
    label: "#Soundtrack",
    image: "/images/genre8.jpg",
  },
  {
    id: "Industrial",
    label: "#Industrial",
    image: "/images/genre9.jpg",
  },
  {
    id: "EBM",
    label: "#Techno",
    image: "/images/genre10.jpg",
  },
  {
    id: "Electro",
    label: "#Electro",
    image: "/images/genre11.jpg",
  },
  {
    id: "Techno",
    label: "#Techno",
    image: "/images/genre12.jpg",
  },
  {
    id: "Dance",
    label: "#Dance",
    image: "/images/genre13.jpg",
  },
  {
    id: "Electronica",
    label: "#Electronica",
    image: "/images/genre14.jpg",
  },
  {
    id: "Sound Art",
    label: "#Sound Art",
    image: "/images/genre15.jpg",
  },
  {
    id: "Jazz",
    label: "#Jazz",
    image: "/images/genre16.jpg",
  },
  {
    id: "Classical",
    label: "#Classical",
    image: "/images/genre17.jpg",
  },
  {
    id: "Classical Crossover",
    label: "#Classical Crossover",
    image: "/images/genre18.jpg",
  },
  {
    id: "Soundscapes",
    label: "#Soundscapes",
    image: "/images/genre19.jpg",
  },
  {
    id: "Field Recordings",
    label: "#Field Recordings",
    image: "/images/genre20.jpg",
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
      const newSelected = selected.filter((item) => item !== id);
      setSelected(newSelected);
      
      // Show toast when deselecting and goes below 3
      if (newSelected.length < 3 && newSelected.length > 0) {
        toast.warning(`Please select at least 3 genres. Currently selected: ${newSelected.length}`);
      } else if (newSelected.length === 0) {
        toast.info("Start selecting your favorite genres!");
      }
    } else {
      const newSelected = [...selected, id];
      setSelected(newSelected);
      
      // Show success toast when reaching 3 or more
      if (newSelected.length === 3) {
        toast.success("Great! You can now continue or select more genres.");
      } else if (newSelected.length === 1) {
        toast.info("Good start! Select 2 more genres to continue.");
      } else if (newSelected.length === 2) {
        toast.info("Almost there! Select 1 more genre to continue.");
      }
    }
  };

  const handleSubmit = async () => {
    if (selected.length < 3) {
      const remaining = 3 - selected.length;
      toast.error(`Please select at least 3 genres. You need ${remaining} more genre${remaining === 1 ? '' : 's'}.`);
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

      {/* Selection Counter */}
      <div className="mt-4 text-center">
        <p className={`text-lg font-semibold ${selected.length >= 3 ? 'text-green-400' : 'text-yellow-400'}`}>
          Selected: {selected.length} / 3 minimum
          {selected.length < 3 && (
            <span className="block text-sm text-gray-300 mt-1">
              Choose {3 - selected.length} more to continue
            </span>
          )}
        </p>
      </div>

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

      <div className="flex md:w-[80%] w-full justify-center gap-6 flex-wrap py-8">
        {tags.map((tag) => {
          const isSelected = selected.includes(tag.id);
          return (
            <div
              key={tag.id}
              className="flex flex-col items-center cursor-pointer transition-transform hover:scale-105"
              onClick={() => handleSelection(tag.id)}
            >
              <div
                className={`relative w-40 h-40 rounded-full overflow-hidden border-2 transition-all duration-300 bg-center bg-cover
                ${
                  isSelected
                    ? "border-[#2400FF] shadow-[inset_0_0_30px_rgba(36,0,255,0.7),0_0_15px_rgba(36,0,255,0.5)]"
                    : "border-gray-700 border-2 hover:border-gray-500"
                }`}
                style={{ backgroundImage: `url(${tag.image})` }}
              >
                {isSelected && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#2400FF] rounded-t-full w-20 h-10 flex items-center justify-center shadow-lg z-20">
                    <IoMdCheckmark className="text-white text-3xl" />
                  </div>
                )}
              </div>
              <p className="mt-2 text-white text-sm text-center">{tag.label}</p>
            </div>
          );
        })}
      </div>

      <div className="button-wrapper my-9 shadow-sm shadow-black">
        <button
          onClick={handleSubmit}
          disabled={selected.length < 3 || loading}
          className={`custom-button transition-all duration-300 ${
            selected.length < 3 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
          }`}
          title={
            selected.length < 3 
              ? `Please select ${3 - selected.length} more genre${3 - selected.length === 1 ? '' : 's'}` 
              : 'Click to save your preferences'
          }
        >
          {loading ? "Saving..." : "Continue"}
        </button>
      </div>
    </section>
  );
};

export default FavouriteGen;
