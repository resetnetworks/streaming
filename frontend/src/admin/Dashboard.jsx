import AdminStatsCard from "../components/admin/AdminStatsCard"
import RecentItems from "../components/admin/AdminRecentItems"

const Dashboard = ({ artists, albums, songs }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
      <AdminStatsCard artists={artists} albums={albums} songs={songs} />
      <RecentItems artists={artists} albums={albums} />
    </div>
  );
};

export default Dashboard;