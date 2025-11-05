// DashboardHome.jsx - Create at: src/Pages/Dashboard/DashboardHome.jsx
import { useAuth } from '../../context/AuthContext';
import { Home, TrendingUp, Users, FileText } from 'lucide-react';

function DashboardHome() {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Total Properties',
      value: '0',
      icon: Home,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Listings',
      value: '0',
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      title: 'Saved Properties',
      value: '0',
      icon: FileText,
      color: 'bg-purple-500',
    },
    {
      title: 'Agents Connected',
      value: '0',
      icon: Users,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.name || 'User'}!
        </h1>
        <p className="text-purple-100">
          Here's what's happening with your real estate portfolio today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h2>
        <div className="text-center py-8 text-gray-500">
          No recent activity to display
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;

// ============================================

