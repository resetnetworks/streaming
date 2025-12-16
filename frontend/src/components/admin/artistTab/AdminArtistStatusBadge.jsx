import { FaClock, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaBan } from 'react-icons/fa';

const AdminArtistStatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: 'bg-yellow-900/30 text-yellow-400 border-yellow-700/50',
        icon: <FaClock className="mr-1" />,
        text: 'Pending'
      },
      approved: {
        color: 'bg-green-900/30 text-green-400 border-green-700/50',
        icon: <FaCheckCircle className="mr-1" />,
        text: 'Approved'
      },
      rejected: {
        color: 'bg-red-900/30 text-red-400 border-red-700/50',
        icon: <FaTimesCircle className="mr-1" />,
        text: 'Rejected'
      },
      needs_info: {
        color: 'bg-blue-900/30 text-blue-400 border-blue-700/50',
        icon: <FaInfoCircle className="mr-1" />,
        text: 'Needs Info'
      },
      cancelled: {
        color: 'bg-gray-700/30 text-gray-400 border-gray-600/50',
        icon: <FaBan className="mr-1" />,
        text: 'Cancelled'
      },
      default: {
        color: 'bg-gray-700/30 text-gray-400 border-gray-600/50',
        icon: null,
        text: status || 'Unknown'
      }
    };
    
    return configs[status] || configs.default;
  };
  
  const config = getStatusConfig(status);
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      {config.icon}
      {config.text}
    </span>
  );
};

export default AdminArtistStatusBadge;