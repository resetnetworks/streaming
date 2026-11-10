// src/components/artist/home/CardStat.jsx
import React, { useState, useEffect } from "react";
import { FiInfo } from "react-icons/fi";

const CardStat = ({
  label = "",
  value = "0",
  subtext = null,
  subtextColor = "text-emerald-400",
  tooltip = null,
  onClick = null,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Close tooltip when clicking outside
  useEffect(() => {
    if (!showTooltip) return;
    const handleClickOutside = (e) => {
      if (!e.target.closest(".card-tooltip-container")) {
        setShowTooltip(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showTooltip]);

  return (
    <div
      onClick={onClick}
      className={`card-container ${showTooltip ? "has-active-tooltip" : ""} ${onClick ? "cursor-pointer" : ""}`}
      style={{ zIndex: showTooltip ? 999 : undefined }}
    >
      <div className="card">
        <div className="label-row">
          <div className="label">{label}</div>
          {tooltip && (
            <div
              className="card-tooltip-container relative flex items-center"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltip((prev) => !prev);
                }}
                className="text-gray-400 hover:text-white transition-colors p-0.5 focus:outline-none cursor-pointer"
                aria-label={`Info about ${label}`}
              >
                <FiInfo className="w-3.5 h-3.5" />
              </button>
              {showTooltip && (
                <div className="card-tooltip-popup">
                  {tooltip}
                  <div className="card-tooltip-arrow" />
                </div>
              )}
            </div>
          )}
        </div>
        <div className="text">{value}</div>
        {subtext && (
          <div className={`text-[10.5px] font-bold ${subtextColor} mt-0.5 flex items-center gap-1 z-10 relative truncate max-w-full leading-tight`}>
            {subtext}
          </div>
        )}
      </div>
      
      <style>{`
        .card-container {
          --card-height: 105px;
          --label-font-size: 0.72rem;
          --value-font-size: clamp(1.25rem, 1.6vw, 1.7rem);
          --padding: 12px 14px;
          
          width: 100%;
          min-height: var(--card-height);
          height: 100%;
          border-radius: 12px;
          padding: 1px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(12, 13, 13, 0.9));
          position: relative;
          z-index: 1;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
        }

        .card-container:hover,
        .card-container:focus-within,
        .card-container.has-active-tooltip {
          z-index: 999 !important;
          transform: translateY(-3px) scale(1.01);
          box-shadow: 0 10px 28px rgba(4, 89, 254, 0.22);
        }
        
        .card {
          width: 100%;
          height: 100%;
          border-radius: 10px;
          background: radial-gradient(ellipse at 50% 0%, #0d1527 0%, #050811 100%);
          border: 1px solid rgba(0, 0, 0, 0.95);
          box-shadow: 
            inset 0 4px 8px rgba(0, 0, 0, 0.9),
            inset 0 1px 3px rgba(0, 0, 0, 0.95),
            inset 0 -1px 1px rgba(255, 255, 255, 0.08),
            0 1px 0 rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          flex-direction: column;
          color: #fff;
          position: relative;
          overflow: visible;
          padding: var(--padding);
          transition: border-color 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .card-container:hover .card {
          border-color: rgba(4, 89, 254, 0.35);
          box-shadow: 
            inset 0 4px 8px rgba(0, 0, 0, 0.9),
            inset 0 1px 3px rgba(0, 0, 0, 0.95),
            inset 0 -1px 1px rgba(255, 255, 255, 0.12),
            0 0 12px rgba(4, 89, 254, 0.15);
        }
        
        .card-container .label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          margin-bottom: 6px;
          position: relative;
          z-index: 2;
        }

        .card .label {
          font-size: var(--label-font-size);
          color: #cbd5e1;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .card .text {
          font-size: var(--value-font-size);
          font-weight: 900;
          font-family: 'Jura', sans-serif;
          color: white;
          line-height: 1.1;
          z-index: 2;
          position: relative;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
          letter-spacing: -0.02em;
        }

        .card-tooltip-popup {
          position: absolute;
          bottom: calc(100% + 8px);
          right: -8px;
          z-index: 1000;
          padding: 8px 11px;
          background: #090e17;
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 8px;
          color: #f1f5f9;
          font-size: 11px;
          font-weight: 500;
          line-height: 1.35;
          white-space: normal;
          width: max-content;
          max-width: 220px;
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.85);
          pointer-events: none;
          backdrop-filter: blur(10px);
        }

        .card-tooltip-arrow {
          position: absolute;
          top: 100%;
          right: 12px;
          width: 8px;
          height: 8px;
          background: #090e17;
          border-right: 1px solid rgba(255, 255, 255, 0.18);
          border-bottom: 1px solid rgba(255, 255, 255, 0.18);
          transform: translateY(-4px) rotate(45deg);
        }
      `}</style>
    </div>
  );
};

export default CardStat;