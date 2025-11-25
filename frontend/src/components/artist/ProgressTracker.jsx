import React from "react";
import { MdCheck, MdHourglassEmpty, MdPerson, MdAccountCircle, MdDescription, MdVerifiedUser } from "react-icons/md";

/**
 * ProgressTracker component for showing progress with 4 steps
 * @param {number} currentStep - The current active step (0, 1, 2, or 3)
 */
const ProgressTracker = ({ currentStep }) => {
  const STEPS = 4; // Now 4 steps including account confirmation

  // Step labels and icons
  const stepConfig = [
    { label: "Basic Info", icon: <MdPerson className="w-3 h-3" /> },
    { label: "Profile", icon: <MdAccountCircle className="w-3 h-3" /> },
    { label: "Account", icon: <MdDescription className="w-3 h-3" /> },
    { label: "Confirmation", icon: <MdVerifiedUser className="w-3 h-3" /> }
  ];

  /**
   * StepNode component for individual progress circles
   */
  const StepNode = ({ index }) => {
    const isCompleted = index < currentStep;
    const isActive = index === currentStep;
    const isFinalStep = index === STEPS - 1;

    const baseClasses =
      "relative z-20 flex items-center justify-center w-8 h-8 rounded-full font-extrabold text-xl transition-all duration-700 ease-in-out border-2 shadow-lg cursor-default font-jura";

    const nodeClasses = isActive
      ? "border-blue-400 text-white transform scale-110 bg-blue-600"
      : isCompleted
      ? "border-blue-300 text-white bg-blue-500"
      : "bg-gray-800 border-gray-600 text-gray-400";

    const glowStyle = isActive
      ? {
          boxShadow:
            "0 0 15px 5px rgba(59, 130, 246, 0.8), 0 0 5px 2px rgba(255, 255, 255, 0.6)",
          filter: "drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))",
          outline: "2px solid #3B82F6",
          outlineOffset: "2px"
        }
      : isCompleted
      ? {
          boxShadow: "0 0 5px 1px rgba(59, 130, 246, 0.4)",
        }
      : {
          boxShadow: "0 0 3px 1px rgba(107, 114, 128, 0.3)",
        };

    return (
      <div className="flex flex-col items-center">
        <div className="flex-shrink-0 relative z-20">
          <div
            className={`${baseClasses} ${nodeClasses}`}
            style={glowStyle}
          >
            {isCompleted ? (
              <MdCheck className="w-4 h-4 text-white" />
            ) : isFinalStep && isActive ? (
              <MdHourglassEmpty className="w-4 h-4 text-white" />
            ) : (
              <span className="relative z-30 font-jura text-sm font-normal">
                {stepConfig[index].icon || index + 1}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  /**
   * StepLine component for connecting lines between circles
   */
  const StepLine = ({ isCompleted }) => {
    const lineClasses = isCompleted
      ? "bg-blue-500 shadow-[0_0_15px_3px_rgba(59,130,246,0.7)]"
      : "bg-gray-700";

    return (
      <div className="flex-1 h-0.5 mx-[-24px] transition-all duration-700 ease-in-out relative z-10">
        <div className={`w-full h-full ${lineClasses} rounded-full`}></div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center max-w-5xl mx-auto py-8 font-jura relative">
        {Array.from({ length: STEPS }).map((_, index) => (
          <React.Fragment key={index}>
            <StepNode index={index} />

            {/* Line Connector - don't render after last step */}
            {index < STEPS - 1 && <StepLine isCompleted={index < currentStep} />}
          </React.Fragment>
        ))}
      </div>
      
      {/* Status Message */}
      {currentStep === 3 && (
        <div className="text-center mt-4">
          <div className="inline-flex items-center gap-2 bg-blue-900/30 border border-blue-700/50 rounded-lg px-4 py-2">
            <MdHourglassEmpty className="md:w-5 md:h-5 w-8 h-8 text-blue-400 animate-pulse" />
            <span className="text-blue-300 md:text-base text-xs font-jura">
              Your account is under verification. Once confirmed, you'll be eligible to upload music.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;