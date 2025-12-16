import { useState, useEffect } from 'react';
import { 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaInfoCircle, 
  FaTimes,
  FaExclamationCircle
} from 'react-icons/fa';

const AlertNotification = ({ 
  type = 'info', 
  message, 
  title,
  show = false, 
  autoClose = 0,
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
    
    if (show && autoClose > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose && onClose();
      }, autoClose);

      return () => clearTimeout(timer);
    }
  }, [show, autoClose, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    onClose && onClose();
  };

  if (!isVisible) return null;

  const alertConfig = {
    info: {
      bg: 'bg-blue-900/20',
      border: 'border-blue-700/50',
      icon: <FaInfoCircle className="text-blue-400" />,
      iconColor: 'text-blue-400',
      title: title || 'Information'
    },
    success: {
      bg: 'bg-green-900/20',
      border: 'border-green-700/50',
      icon: <FaCheckCircle className="text-green-400" />,
      iconColor: 'text-green-400',
      title: title || 'Success'
    },
    warning: {
      bg: 'bg-yellow-900/20',
      border: 'border-yellow-700/50',
      icon: <FaExclamationTriangle className="text-yellow-400" />,
      iconColor: 'text-yellow-400',
      title: title || 'Warning'
    },
    error: {
      bg: 'bg-red-900/20',
      border: 'border-red-700/50',
      icon: <FaExclamationCircle className="text-red-400" />,
      iconColor: 'text-red-400',
      title: title || 'Error'
    }
  };

  const config = alertConfig[type] || alertConfig.info;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slideIn">
      <div 
        className={`${config.bg} ${config.border} border rounded-lg shadow-lg overflow-hidden max-w-md`}
      >
        <div className="p-4">
          <div className="flex items-start">
            <div className={`text-xl ${config.iconColor} mr-3 mt-0.5`}>
              {config.icon}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className={`font-medium ${config.iconColor} mb-1`}>
                    {config.title}
                  </h4>
                  <p className="text-white text-sm">
                    {message}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-white ml-4 transition-colors"
                >
                  <FaTimes size={16} />
                </button>
              </div>
              
              {autoClose > 0 && (
                <div className="mt-3">
                  <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${config.iconColor.replace('text-', 'bg-')} transition-all duration-300`}
                      style={{ 
                        width: '100%',
                        animation: `shrink ${autoClose}ms linear forwards`
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

// Stackable Alert Container
export const AlertContainer = ({ children }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {children}
    </div>
  );
};

export default AlertNotification;