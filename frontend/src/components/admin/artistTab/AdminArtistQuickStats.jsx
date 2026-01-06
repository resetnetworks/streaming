import { FaFileAlt, FaClock, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';

const StatCard = ({ title, count, color, icon }) => (
  <div className={`bg-gray-800 border ${color} rounded-lg p-4`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
        <p className="text-2xl font-bold text-white">{count}</p>
      </div>
      <div className={`text-3xl ${color.split(' ')[2]}`}>
        {icon}
      </div>
    </div>
  </div>
);

const AdminArtistQuickStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard
        title="Total Applications"
        count={stats.total}
        color="border-gray-700"
        icon={<FaFileAlt />}
      />
      <StatCard
        title="Pending Review"
        count={stats.pending}
        color="border-yellow-700"
        icon={<FaClock />}
      />
      <StatCard
        title="Needs Info"
        count={stats.needs_info}
        color="border-blue-700"
        icon={<FaInfoCircle />}
      />
      <StatCard
        title="Approved"
        count={stats.approved}
        color="border-green-700"
        icon={<FaCheckCircle />}
      />
    </div>
  );
};

export default AdminArtistQuickStats;