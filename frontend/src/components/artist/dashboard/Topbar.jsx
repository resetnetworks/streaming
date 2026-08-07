import React, { useState } from 'react'
import { IoAddCircleSharp } from "react-icons/io5";
import SelectUploadType from '../upload/SelectUploadType';

const Topbar = ({ selectedTab, currentUploadPage, setCurrentUploadPage }) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Determine display text based on current state
  let displayText;
  
  if (currentUploadPage === "single") {
    displayText = "Single Upload";
  } else if (currentUploadPage === "album") {
    displayText = "Album Upload";
  } else if (currentUploadPage === "mix"){
    displayText = "Mix Upload";
  } else if (currentUploadPage === "import") {
    displayText = "Universal Importer";
  } else if (selectedTab === "home") {
    displayText = <>welcome, <span className='font-semibold'>allison malone</span></>;
  } else if (selectedTab === "uploads") {
    displayText = "uploads";
  } else {
    displayText = selectedTab;
  }

  const handleUploadTypeSelect = (type) => {
    // Set the current upload page
    setCurrentUploadPage(type);
    // You might want to reset selectedTab to show upload section
  };

  const handleImportTypeSelect = (type) => {
    setCurrentUploadPage("import");
    if (typeof window !== 'undefined') {
      localStorage.setItem("selectedImportType", type);
    }
  };

  return (
    <>
      <div className='h-[70px] w-full border-b bg-transparent border-gray-500 flex items-center justify-between px-6'>
        <div className='text-white font-thin md:text-3xl sm:text-2xl text-lg pl-16 md:pl-0'>
          {displayText}
        </div>
        {!currentUploadPage && (
          <div className="flex gap-4 items-center">
            <button
              onClick={() => handleImportTypeSelect("discography")}
              className="md:w-48 sm:w-40 w-36 h-9 sm:h-10 md:h-11 md:text-lg sm:text-sm text-xs font-semibold text-white border border-white/40 bg-white/5 rounded-lg transition-all duration-300 hover:bg-white/10 hover:border-white/60 active:scale-95 flex items-center justify-center cursor-pointer tracking-wider font-['Jura']"
            >
              Import Catalog
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="md:w-32 sm:w-24 w-20 h-9 sm:h-10 md:h-11 md:text-lg sm:text-sm text-xs font-semibold text-white rounded-lg transition-all duration-300 hover:brightness-110 active:scale-95 flex items-center justify-center shadow-[0_0_15px_rgba(51,128,255,0.2)] cursor-pointer tracking-wider font-['Jura']"
              style={{
                background: 'linear-gradient(45deg, #0F3272 0%, #1A5DB4 60%, #3380FF 100%)',
              }}
            >
              Upload
            </button>
          </div>
        )}
        {currentUploadPage && (
          <button
            onClick={() => setCurrentUploadPage(null)}
            className="px-6 py-2.5 text-sm font-semibold text-gray-300 border border-white/20 rounded-lg transition-all duration-300 hover:bg-white/5 active:scale-95 flex items-center justify-center uppercase tracking-wider"
          >
            Cancel Upload
          </button>
        )}
      </div>

      {/* Upload Type Modal */}
      <SelectUploadType 
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadTypeSelect={handleUploadTypeSelect}
      />
    </>
  )
}

export default Topbar;