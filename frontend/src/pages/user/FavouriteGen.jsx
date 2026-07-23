// src/pages/FavouriteGen.jsx
import React, { useState, useEffect } from "react";
import { IoMdCheckmark } from "react-icons/io";
import IconHeader from "../../components/user/IconHeader";
import { FiSearch } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { updatePreferredGenres, getMyProfile } from "../../features/auth/authSlice";
import { selectCurrentUser, selectIsAuthenticated } from "../../features/auth/authSelectors";
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

    // Check if registration was too long ago (more than 15 minutes)
    if (registrationTime) {
      const timeDiff = Date.now() - parseInt(registrationTime);
      if (timeDiff > 15 * 60 * 1000) { // 15 minutes
        localStorage.removeItem('justRegistered');
        localStorage.removeItem('registrationTime');
        if (user?.preferredGenres?.length > 0) {
          navigate("/home");
          return;
        }
      }
    }

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // If user doesn't exist yet and justRegistered flag is set, wait for profile
    if (justRegistered && (!user || !user._id)) {
      dispatch(getMyProfile()).catch((error) => {
        console.error("Failed to get profile:", error);
        toast.error("Session expired. Please login again.");
        localStorage.removeItem('justRegistered');
        localStorage.removeItem('registrationTime');
        navigate("/login");
      });
      return;
    }

    // If user has genres and not just registered, redirect to home
    // This prevents showing genre page every time for existing users
    if (!justRegistered && user?.preferredGenres?.length > 0) {
      navigate("/home");
      return;
    }

    // Set selected genres from user data if they exist
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

      // Clean up localStorage - This is important!
      localStorage.removeItem('justRegistered');
      localStorage.removeItem('registrationTime');

      toast.success("Genres saved successfully! Welcome to MusicReset!");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Genre update error:", error);
      // Handle specific token/auth errors
      if (error?.includes?.('token') || error?.includes?.('expired') || error?.includes?.('Invalid')) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem('justRegistered');
        localStorage.removeItem('registrationTime');
        navigate("/login");
      } else {
        toast.error(error || "Failed to update genres. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <section className="min-h-screen w-full flex flex-col items-center bg-[#020216] text-white px-4">
      <IconHeader />

      <h1 className="text-4xl text-center mt-6 px-2 font-['Jura'] uppercase tracking-wider font-extrabold bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
        Choose favourite genres <span className="text-slate-400 lowercase text-2xl font-normal tracking-normal">(at least three)</span>
      </h1>

      <div className="flex md:w-[80%] w-full justify-center gap-6 flex-wrap py-8 mt-6">
        {tags.map((tag) => {
          const isSelected = selected.includes(tag.id);
          return (
            <div
              key={tag.id}
              className="flex flex-col items-center cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95"
              onClick={() => handleSelection(tag.id)}
            >
              <div
                className={`relative w-40 h-40 rounded-full overflow-hidden border-2 transition-all duration-300 bg-center bg-cover
                ${
                  isSelected
                    ? "border-[#3380FF] shadow-[inset_0_0_30px_rgba(51,128,255,0.4),0_0_15px_rgba(51,128,255,0.3)]"
                    : "border-slate-800 hover:border-slate-600"
                }`}
                style={{ backgroundImage: `url(${tag.image})` }}
              >
                {isSelected && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#3380FF] rounded-t-full w-20 h-10 flex items-center justify-center shadow-lg z-20">
                    <IoMdCheckmark className="text-white text-3xl" />
                  </div>
                )}
              </div>
              <p className="mt-2 text-white text-sm text-center">{tag.label}</p>
            </div>
          );
        })}
      </div>

      <div className="w-full max-w-[380px] my-9 flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={selected.length < 3 || loading}
          className="w-full py-3 text-sm font-semibold text-white rounded-lg transition-all duration-300 hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100 flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(45deg, #0F3272 0%, #1A5DB4 60%, #3380FF 100%)',
            boxShadow: '0 0 15px rgba(51, 128, 255, 0.2)',
          }}
          title={
            selected.length < 3 
              ? `Please select ${3 - selected.length} more genre${3 - selected.length === 1 ? '' : 's'}` 
              : 'Click to save your preferences'
          }
        >
          {loading ? (
            <>
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
              Saving...
            </>
          ) : (
            "Continue"
          )}
        </button>
      </div>
    </section>
    </>
  );
};

export default FavouriteGen;
