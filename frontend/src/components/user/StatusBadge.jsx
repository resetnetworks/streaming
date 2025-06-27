import { FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';

const StatusBadge = ({ status, className = '' }) => {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  
  switch (status) {
    case 'active':
      return (
        <span className={`${baseClasses} bg-green-900/30 text-green-400 ${className}`}>
          <FiCheckCircle className="mr-1" /> Active
        </span>
      );
    case 'pending_cancellation':
      return (
        <span className={`${baseClasses} bg-yellow-900/30 text-yellow-400 ${className}`}>
          <FiClock className="mr-1" /> Ending Soon
        </span>
      );
    case 'cancelled':
      return (
        <span className={`${baseClasses} bg-red-900/30 text-red-400 ${className}`}>
          <FiXCircle className="mr-1" /> Cancelled
        </span>
      );
    default:
      return (
        <span className={`${baseClasses} bg-gray-800 text-gray-400 ${className}`}>
          Unknown
        </span>
      );
  }
};

export default StatusBadge;