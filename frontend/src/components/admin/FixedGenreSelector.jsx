import React from "react";
import { FaTimes, FaCheck } from "react-icons/fa";

// Fixed list multi-select with chips (no dropdown, no free input)
const FixedGenreSelector = ({
  value = [],
  onChange,
  options = [],
  disabled = false,
  maxTags,
}) => {
  const toggleGenre = (genre) => {
    if (disabled) return;
    if (value.includes(genre)) {
      onChange(value.filter((g) => g !== genre));
    } else {
      if (!maxTags || value.length < maxTags) {
        onChange([...value, genre]);
      }
    }
  };

  return (
    <div className="w-full">
      {/* Selected Chips */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((g) => (
            <span
              key={g}
              className="inline-flex items-center gap-1 bg-blue-600/20 text-blue-300 border border-blue-500/30 px-2 py-1 rounded-full text-xs"
            >
              {g}
              {!disabled && (
                <button
                  type="button"
                  className="hover:text-white"
                  onClick={() => toggleGenre(g)}
                  aria-label={`Remove ${g}`}
                >
                  <FaTimes className="text-[10px]" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Genre Select List */}
      <div
        className="grid grid-cols-2 gap-2 bg-gray-700 p-2 rounded border border-gray-600 max-h-44 overflow-y-auto"
        role="listbox"
        aria-multiselectable="true"
        aria-label="Select genres"
      >
        {options.map((opt) => {
          const active = value.includes(opt);
          return (
            <button
              type="button"
              key={opt}
              onClick={() => toggleGenre(opt)}
              disabled={disabled}
              role="option"
              aria-selected={active}
              className={`flex items-center justify-between px-3 py-2 rounded text-sm transition-all
                ${
                  active
                    ? "bg-blue-600/30 text-blue-300 border border-blue-500/30"
                    : "bg-gray-600/40 text-gray-300 hover:bg-gray-600"
                }`}
            >
              {opt}
              {active && <FaCheck className="text-xs" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FixedGenreSelector;
