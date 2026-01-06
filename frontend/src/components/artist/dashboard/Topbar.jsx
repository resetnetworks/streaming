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

  return (
    <>
      <div className='h-[70px] w-full border-b bg-transparent border-gray-500 flex items-center justify-between px-6'>
        <div className='text-white font-thin md:text-3xl sm:text-2xl text-lg pl-16 md:pl-0'>
          {displayText}
        </div>
        {!currentUploadPage && (
          <div 
            className="button-wrapper cursor-pointer shadow-[0_0_20px_10px_rgba(59,130,246,0.3)]"
            onClick={() => setShowUploadModal(true)}
          >
            <button className="custom-button md:!w-32 sm:!w-24 !w-20 md:!text-[20px] !text-[12px] sm:!text-[14px] flex justify-center items-center">
              upload <i className='ml-2 md:text-[23px] text-[16px] sm:text-[18px]'><IoAddCircleSharp /></i>
            </button>
          </div>
        )}
        {currentUploadPage && (
          <div 
            className="button-wrapper cursor-pointer shadow-[0_0_20px_10px_rgba(59,130,246,0.3)]"
            onClick={() => setCurrentUploadPage(null)}
          >
            <button className="custom-button md:!w-32 sm:!w-24 !w-20 md:!text-[16px] !text-[12px] sm:!text-[14px] flex justify-center items-center">
              Cancel Upload
            </button>
          </div>
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