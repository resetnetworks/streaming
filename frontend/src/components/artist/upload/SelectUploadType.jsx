import React, { useState } from "react";
import { 
  IoClose, 
  IoMusicalNotes, 
  IoAlbums, 
  IoArrowForward, 
  IoCheckmark 
} from "react-icons/io5";

const SelectUploadType = ({ isOpen, onClose, onUploadTypeSelect }) => {
  const [selectedType, setSelectedType] = useState("single");
  const [isClosing, setIsClosing] = useState(false);

  // Close with animation
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const handleSubmit = () => {
    onUploadTypeSelect(selectedType);
    handleClose();
  };

  // Agar modal open nahi hai to kuch na dikhao
  if (!isOpen && !isClosing) return null;

  return (
    <>
      {/* Backdrop with blur overlay */}
      <div 
        className={`fixed inset-0 z-[998] transition-all duration-300 ease-out ${
          isClosing 
            ? "opacity-0" 
            : "bg-black/60 backdrop-blur-sm"
        }`}
        onClick={handleClose}
      />

      {/* Modal Card with animation */}
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
        <div 
          className={`subscription-wrapper md:w-[26rem] w-[90vw] max-w-md transition-all duration-300 ease-out transform ${
            isClosing 
              ? "opacity-0 scale-90 translate-y-2" 
              : "opacity-100 scale-100 translate-y-0"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative subscription-card">
            {/* Close Button */}
            <button 
              onClick={handleClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl transition-colors p-2 rounded-lg hover:bg-gray-800/50 z-[1000] cursor-pointer"
            >
              <IoClose />
            </button>

            {/* Content */}
            <div className="relative overflow-hidden h-full">
              {/* Subtle background pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent"></div>
              </div>
              
              {/* Header */}
              <div className="px-6 pt-6 pb-4 relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="button-wrapper w-10 h-10 rounded-lg flex items-center justify-center">
                    <div className="w-full h-full rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                      <IoMusicalNotes className="text-xl text-white" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Upload Music</h2>
                    <p className="text-sm text-gray-300">Select upload type</p>
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="px-6 pb-4 relative">
                <div className="flex flex-col gap-4">
                  {/* Single Track Option */}
                  <div
                    onClick={() => setSelectedType("single")}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 flex items-center gap-4 ${
                      selectedType === "single"
                        ? "border-blue-500 bg-gradient-to-r from-blue-900/20 to-blue-800/10 shadow-lg shadow-blue-900/20"
                        : "border-gray-600 hover:border-gray-500 bg-gray-800/40 hover:bg-gray-800/60"
                    }`}
                  >
                    <div className={`button-wrapper w-12 h-12 rounded-lg ${
                      selectedType === "single" ? "p-[1.5px]" : ""
                    }`}>
                      <div className={`w-full h-full rounded-lg flex items-center justify-center ${
                        selectedType === "single" 
                          ? "bg-gradient-to-br from-blue-500 to-blue-600" 
                          : "bg-gray-700"
                      }`}>
                        <IoMusicalNotes className={`text-lg ${
                          selectedType === "single" ? "text-white" : "text-gray-300"
                        }`} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">Single Track</h3>
                      <p className="text-xs text-gray-300 mt-0.5">Upload one song</p>
                    </div>
                    <div className="play-pause-wrapper w-6 h-6 rounded-full">
                      <div className={`w-full h-full rounded-full flex items-center justify-center ${
                        selectedType === "single" 
                          ? "bg-blue-500" 
                          : "bg-gray-800"
                      }`}>
                        {selectedType === "single" && (
                          <IoCheckmark className="text-xs text-white" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Album Option */}
                  <div
                    onClick={() => setSelectedType("album")}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 flex items-center gap-4 ${
                      selectedType === "album"
                        ? "border-blue-500 bg-gradient-to-r from-blue-900/20 to-blue-800/10 shadow-lg shadow-blue-900/20"
                        : "border-gray-600 hover:border-gray-500 bg-gray-800/40 hover:bg-gray-800/60"
                    }`}
                  >
                    <div className={`button-wrapper w-12 h-12 rounded-lg ${
                      selectedType === "album" ? "p-[1.5px]" : ""
                    }`}>
                      <div className={`w-full h-full rounded-lg flex items-center justify-center ${
                        selectedType === "album" 
                          ? "bg-gradient-to-br from-blue-500 to-blue-600" 
                          : "bg-gray-700"
                      }`}>
                        <IoAlbums className={`text-lg ${
                          selectedType === "album" ? "text-white" : "text-gray-300"
                        }`} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">Album</h3>
                      <p className="text-xs text-gray-300 mt-0.5">Multiple songs collection</p>
                    </div>
                    <div className="play-pause-wrapper w-6 h-6 rounded-full">
                      <div className={`w-full h-full rounded-full flex items-center justify-center ${
                        selectedType === "album" 
                          ? "bg-blue-500" 
                          : "bg-gray-800"
                      }`}>
                        {selectedType === "album" && (
                          <IoCheckmark className="text-xs text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Continue Button */}
              <div className="px-6 pb-6 pt-4 relative">
                <div className="button-wrapper !w-full">
                  <button 
                    onClick={handleSubmit}
                    className="custom-button !w-full flex justify-center items-center gap-2"
                  >
                    <span>{selectedType === "single" ? "Upload Single" : "Create Album"}</span>
                    <IoArrowForward className="text-lg" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SelectUploadType;