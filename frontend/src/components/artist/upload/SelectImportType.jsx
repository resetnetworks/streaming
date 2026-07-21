import React, { useState } from "react";
import {
  IoClose,
  IoAlbums,
  IoDisc,
  IoCheckmark,
} from "react-icons/io5";

const SelectImportType = ({ isOpen, onClose, onImportTypeSelect }) => {
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
    onImportTypeSelect(selectedType);
    handleClose();
  };

  // Agar modal open nahi hai to kuch na dikhao
  if (!isOpen && !isClosing) return null;

  return (
    <>
      {/* Backdrop with blur overlay */}
      <div
        className={`fixed inset-0 z-[998] transition-all duration-300 ease-out ${isClosing ? "opacity-0" : "bg-black/60 backdrop-blur-sm"
          }`}
        onClick={handleClose}
      />

      {/* Modal Card with animation */}
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
        <div
          className={`subscription-wrapper md:w-[26rem] w-[90vw] max-w-md transition-all duration-300 ease-out transform ${isClosing
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
                      <IoAlbums className="text-xl text-white" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Import Music
                    </h2>
                    <p className="text-sm text-gray-300 font-sans">Select import source type</p>
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="px-6 pb-4 relative">
                <div className="flex flex-col gap-4">
                  {/* Single Release Option */}
                  <div
                    onClick={() => setSelectedType("single")}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 flex items-center gap-4 ${selectedType === "single"
                      ? "border-blue-500 bg-gradient-to-r from-blue-900/20 to-blue-800/10 shadow-lg shadow-blue-900/20"
                      : "border-gray-600 hover:border-gray-500 bg-gray-800/40 hover:bg-gray-800/60"
                      }`}
                  >
                    <div
                      className={`button-wrapper w-12 h-12 rounded-lg ${selectedType === "single" ? "p-[1.5px]" : ""
                        }`}
                    >
                      <div className="w-full h-full rounded-lg bg-[#0e1525] flex items-center justify-center text-white">
                        <IoAlbums className="text-xl" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-sm">Single Release</h3>
                      <p className="text-xs text-gray-400 font-sans mt-0.5">
                        Import a single album or song from a link.
                      </p>
                    </div>
                    {selectedType === "single" && (
                      <IoCheckmark className="text-blue-500 text-lg" />
                    )}
                  </div>

                  {/* Full Discography Option */}
                  <div
                    onClick={() => setSelectedType("artist")}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 flex items-center gap-4 ${selectedType === "artist"
                      ? "border-blue-500 bg-gradient-to-r from-blue-900/20 to-blue-800/10 shadow-lg shadow-blue-900/20"
                      : "border-gray-600 hover:border-gray-500 bg-gray-800/40 hover:bg-gray-800/60"
                      }`}
                  >
                    <div
                      className={`button-wrapper w-12 h-12 rounded-lg ${selectedType === "artist" ? "p-[1.5px]" : ""
                        }`}
                    >
                      <div className="w-full h-full rounded-lg bg-[#0e1525] flex items-center justify-center text-white">
                        <IoDisc className="text-xl" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-sm">Full Discography</h3>
                      <p className="text-xs text-gray-400 font-sans mt-0.5">
                        Import all releases from an artist profile.
                      </p>
                    </div>
                    {selectedType === "artist" && (
                      <IoCheckmark className="text-blue-500 text-lg" />
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Actions */}
              <div className="px-6 py-4 flex justify-center border-t border-gray-800 relative bg-[#0a0a23]/30">
                <div className="button-wrapper">
                  <button
                    onClick={handleSubmit}
                    className="custom-button !h-9 flex items-center justify-center text-sm"
                  >
                    Continue
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

export default SelectImportType;
