import React from 'react';
import { 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaInfoCircle, 
  FaBan,
  FaHourglassHalf,
  FaUserClock,
  FaExclamationCircle
} from 'react-icons/fa';

const StatusBadge = ({ 
  status, 
  size = 'md', 
  showIcon = true, 
  showText = true,
  className = ''
}) => {
  // Status configuration with colors, icons, and labels
  const getStatusConfig = (status) => {
    const configs = {
      // Core statuses
      pending: {
        color: 'bg-yellow-900/20 text-yellow-300 border-yellow-700/40',
        hoverColor: 'hover:bg-yellow-900/30',
        icon: <FaClock />,
        iconColor: 'text-yellow-400',
        text: 'Pending',
        description: 'Awaiting review'
      },
      approved: {
        color: 'bg-green-900/20 text-green-300 border-green-700/40',
        hoverColor: 'hover:bg-green-900/30',
        icon: <FaCheckCircle />,
        iconColor: 'text-green-400',
        text: 'Approved',
        description: 'Application approved'
      },
      rejected: {
        color: 'bg-red-900/20 text-red-300 border-red-700/40',
        hoverColor: 'hover:bg-red-900/30',
        icon: <FaTimesCircle />,
        iconColor: 'text-red-400',
        text: 'Rejected',
        description: 'Application rejected'
      },
      needs_info: {
        color: 'bg-blue-900/20 text-blue-300 border-blue-700/40',
        hoverColor: 'hover:bg-blue-900/30',
        icon: <FaInfoCircle />,
        iconColor: 'text-blue-400',
        text: 'Needs Info',
        description: 'Additional information required'
      },
      cancelled: {
        color: 'bg-gray-700/30 text-gray-400 border-gray-600/40',
        hoverColor: 'hover:bg-gray-700/40',
        icon: <FaBan />,
        iconColor: 'text-gray-500',
        text: 'Cancelled',
        description: 'Application cancelled'
      },
      
      // Additional statuses (if needed)
      under_review: {
        color: 'bg-purple-900/20 text-purple-300 border-purple-700/40',
        hoverColor: 'hover:bg-purple-900/30',
        icon: <FaHourglassHalf />,
        iconColor: 'text-purple-400',
        text: 'Under Review',
        description: 'Currently being reviewed'
      },
      on_hold: {
        color: 'bg-orange-900/20 text-orange-300 border-orange-700/40',
        hoverColor: 'hover:bg-orange-900/30',
        icon: <FaUserClock />,
        iconColor: 'text-orange-400',
        text: 'On Hold',
        description: 'Temporarily paused'
      },
      requires_action: {
        color: 'bg-pink-900/20 text-pink-300 border-pink-700/40',
        hoverColor: 'hover:bg-pink-900/30',
        icon: <FaExclamationCircle />,
        iconColor: 'text-pink-400',
        text: 'Requires Action',
        description: 'Immediate action needed'
      },
      
      // Default fallback
      default: {
        color: 'bg-gray-700/30 text-gray-400 border-gray-600/40',
        hoverColor: 'hover:bg-gray-700/40',
        icon: null,
        iconColor: 'text-gray-500',
        text: status || 'Unknown',
        description: 'Unknown status'
      }
    };
    
    return configs[status] || configs.default;
  };
  
  // Size configuration
  const getSizeConfig = (size) => {
    const configs = {
      xs: {
        padding: 'px-2 py-0.5',
        textSize: 'text-xs',
        iconSize: 'text-xs',
        borderRadius: 'rounded'
      },
      sm: {
        padding: 'px-2.5 py-1',
        textSize: 'text-sm',
        iconSize: 'text-sm',
        borderRadius: 'rounded-md'
      },
      md: {
        padding: 'px-3 py-1.5',
        textSize: 'text-sm',
        iconSize: 'text-base',
        borderRadius: 'rounded-lg'
      },
      lg: {
        padding: 'px-4 py-2',
        textSize: 'text-base',
        iconSize: 'text-lg',
        borderRadius: 'rounded-lg'
      },
      xl: {
        padding: 'px-5 py-2.5',
        textSize: 'text-lg',
        iconSize: 'text-xl',
        borderRadius: 'rounded-xl'
      }
    };
    
    return configs[size] || configs.md;
  };
  
  const config = getStatusConfig(status);
  const sizeConfig = getSizeConfig(size);

  // Simple badge (icon + text)
  if (showIcon && showText) {
    return (
      <span 
        className={`
          inline-flex items-center 
          ${config.color} 
          ${sizeConfig.padding} 
          ${sizeConfig.textSize} 
          ${sizeConfig.borderRadius}
          border font-medium
          transition-all duration-200
          ${config.hoverColor}
          ${className}
        `}
        title={config.description}
      >
        {config.icon && (
          <span className={`mr-2 ${config.iconColor}`}>
            {config.icon}
          </span>
        )}
        {config.text}
      </span>
    );
  }

  // Icon only
  if (showIcon && !showText) {
    return (
      <span 
        className={`
          inline-flex items-center justify-center
          ${config.color} 
          ${sizeConfig.padding} 
          ${sizeConfig.borderRadius}
          border
          transition-all duration-200
          ${config.hoverColor}
          ${className}
        `}
        title={`${config.text}: ${config.description}`}
      >
        {config.icon && (
          <span className={`${config.iconColor} ${sizeConfig.iconSize}`}>
            {config.icon}
          </span>
        )}
      </span>
    );
  }

  // Text only
  if (!showIcon && showText) {
    return (
      <span 
        className={`
          inline-flex items-center justify-center
          ${config.color} 
          ${sizeConfig.padding} 
          ${sizeConfig.textSize} 
          ${sizeConfig.borderRadius}
          border font-medium
          transition-all duration-200
          ${config.hoverColor}
          ${className}
        `}
        title={config.description}
      >
        {config.text}
      </span>
    );
  }

  // Dot indicator only
  return (
    <span 
      className={`
        inline-block
        w-2 h-2
        ${config.iconColor.replace('text-', 'bg-')}
        rounded-full
        ${className}
      `}
      title={`${config.text}: ${config.description}`}
    />
  );
};

// Status badge with count (for stats)
export const StatusBadgeWithCount = ({ 
  status, 
  count = 0,
  size = 'md',
  className = ''
}) => {
  const config = getStatusConfig(status);
  const sizeConfig = getSizeConfig(size);

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <StatusBadge status={status} size={size} />
      {count > 0 && (
        <span className={`
          ${config.color.replace('bg-', 'bg-').replace('/20', '/40')}
          ${sizeConfig.padding}
          ${sizeConfig.textSize}
          ${sizeConfig.borderRadius}
          font-bold
          min-w-[24px] text-center
        `}>
          {count}
        </span>
      )}
    </div>
  );
};

// Status indicator (small dot)
export const StatusIndicator = ({ 
  status,
  size = 'sm',
  pulse = false,
  className = ''
}) => {
  const config = getStatusConfig(status);
  
  const sizeClasses = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4'
  };

  return (
    <span 
      className={`
        inline-block
        ${sizeClasses[size] || sizeClasses.sm}
        ${config.iconColor.replace('text-', 'bg-')}
        rounded-full
        ${pulse ? 'animate-pulse' : ''}
        ${className}
      `}
      title={config.text}
    />
  );
};

// Status label (just the text without styling)
export const StatusLabel = ({ 
  status,
  className = ''
}) => {
  const config = getStatusConfig(status);
  
  return (
    <span 
      className={`${className}`}
      title={config.description}
    >
      {config.text}
    </span>
  );
};

// Status with tooltip
export const StatusBadgeWithTooltip = ({ 
  status,
  size = 'md',
  tooltipPosition = 'top',
  className = ''
}) => {
  const config = getStatusConfig(status);
  
  const tooltipClasses = {
    top: 'bottom-full mb-2 left-1/2 transform -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 transform -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 transform -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 transform -translate-y-1/2'
  };

  return (
    <div className={`relative inline-block group ${className}`}>
      <StatusBadge status={status} size={size} />
      
      {/* Tooltip */}
      <div className={`
        absolute ${tooltipClasses[tooltipPosition] || tooltipClasses.top}
        hidden group-hover:block
        z-50
      `}>
        <div className={`
          ${config.color.replace('border-', 'bg-').replace('/40', '/90')}
          text-white text-xs
          px-3 py-2
          rounded-lg
          whitespace-nowrap
          shadow-lg
        `}>
          <div className="font-semibold">{config.text}</div>
          <div className="text-white/80 text-xs mt-1">{config.description}</div>
        </div>
        
        {/* Tooltip arrow */}
        <div className={`
          absolute w-2 h-2
          ${config.color.replace('border-', 'bg-').replace('/40', '/90')}
          transform rotate-45
          ${tooltipPosition === 'top' ? 'top-full -mt-1 left-1/2 -translate-x-1/2' : ''}
          ${tooltipPosition === 'bottom' ? 'bottom-full -mb-1 left-1/2 -translate-x-1/2' : ''}
          ${tooltipPosition === 'left' ? 'left-full -ml-1 top-1/2 -translate-y-1/2' : ''}
          ${tooltipPosition === 'right' ? 'right-full -mr-1 top-1/2 -translate-y-1/2' : ''}
        `} />
      </div>
    </div>
  );
};

// Status select option (for dropdowns)
export const StatusOption = ({ 
  status,
  selected = false,
  onClick,
  className = ''
}) => {
  const config = getStatusConfig(status);
  
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2
        w-full px-3 py-2
        text-left
        rounded-lg
        transition-all duration-200
        ${selected ? config.color : 'hover:bg-gray-800/50 text-gray-300'}
        ${className}
      `}
    >
      {config.icon && (
        <span className={config.iconColor}>
          {config.icon}
        </span>
      )}
      <span className="flex-1">{config.text}</span>
      {selected && (
        <FaCheckCircle className="text-green-400" />
      )}
    </button>
  );
};

export default StatusBadge;