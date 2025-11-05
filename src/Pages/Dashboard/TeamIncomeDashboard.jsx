// components/MyTeamIncomeDashboard.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { fetchTeamMatchingIncome } from '../../api/matchingIncomeService';
import { Loader2 } from 'lucide-react';

const MyTeamIncomeDashboard = () => {
  const { user } = useAuth();
  const [teamData, setTeamData] = useState(null);
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    cycleStartDate: '',
    cycleEndDate: '',
    status: '',
    incomeType: ''
  });

  useEffect(() => {
    if (user?._id) fetchData();
    else setLoading(false);
  }, [user?._id, filters]);

  const fetchData = async () => {
    if (!user?._id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchTeamMatchingIncome(user._id, filters);
      if (result.success) {
        setTeamData(result.data);
        setRecords(result.data?.team || []);
        setSummary(result.summary || null);
      } else {
        setError(result.message || 'Failed to fetch team data');
        setRecords([]);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'An error occurred');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({ cycleStartDate: '', cycleEndDate: '', status: '', incomeType: '' });
  };

  const totalEarned = summary?.totalIncome || 0;
  const paidIncome = summary?.paidIncome || 0;
  const pendingIncome = summary?.pendingIncome || 0;
  const teamMembers = summary?.teamMembers || 0;

  if (loading && !summary) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin text-indigo-500 w-10 h-10" />
        <p className="ml-3 text-gray-600">Loading team income data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Team Income Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome, {user?.personalInfo?.firstName || user?.username || 'User'} 👋
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded text-red-700 text-sm">
            ⚠️ {error}
          </div>
        )}

       

        {/* Records Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Team Income Records</h2>
          </div>
          {(!records || records.length === 0) ? (
            <div className="text-center py-10 text-gray-500">
              <p className="text-lg">No team income records found</p>
              <p className="text-sm text-gray-400">Team records will appear here when members make purchases</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cycle Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Income Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Left Leg
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Right Leg
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balanced/Sale
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Income
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.map((r) => {
                    const isPersonalSale = r.incomeType === 'personal_sale';
                    const startDate = r.cycleStartDate ? new Date(r.cycleStartDate) : null;
                    const endDate = r.cycleEndDate ? new Date(r.cycleEndDate) : null;
                    
                    return (
                      <motion.tr
                        key={r._id}
                        whileHover={{ backgroundColor: '#f9fafb' }}
                        transition={{ duration: 0.2 }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {r.userId?.username || r.userId?.personalInfo?.firstName || 'Unknown Member'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {startDate && endDate ? (
                            <>
                              <div className="font-medium">
                                {startDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                              </div>
                              <div className="text-xs text-gray-500">
                                to {endDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </div>
                            </>
                          ) : (
                            <span className="text-gray-400">No date</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              isPersonalSale
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {isPersonalSale ? '💰 Personal Sale' : '🤝 Matching Bonus'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {isPersonalSale ? (
                            <span className="text-gray-400">-</span>
                          ) : (
                            <>
                              ₹{(r.leftLeg?.totalSales || 0).toLocaleString('en-IN')}
                              <div className="text-xs text-gray-500">
                                {r.leftLeg?.totalBookings || 0} bookings
                              </div>
                            </>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {isPersonalSale ? (
                            <span className="text-gray-400">-</span>
                          ) : (
                            <>
                              ₹{(r.rightLeg?.totalSales || 0).toLocaleString('en-IN')}
                              <div className="text-xs text-gray-500">
                                {r.rightLeg?.totalBookings || 0} bookings
                              </div>
                            </>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          {isPersonalSale ? (
                            <>
                              ₹{(r.personalSales?.totalSales || 0).toLocaleString('en-IN')}
                              <div className="text-xs text-gray-500 font-normal">
                                {r.personalSales?.totalBookings || 0} sales
                              </div>
                            </>
                          ) : (
                            `₹${(r.balancedAmount || 0).toLocaleString('en-IN')}`
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-green-600">
                          ₹{(r.incomeAmount || 0).toLocaleString('en-IN')}
                          <div className="text-xs text-gray-500 font-normal">
                            {r.commissionPercentage || 5}% commission
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              r.status === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : r.status === 'credited'
                                ? 'bg-blue-100 text-blue-800'
                                : r.status === 'approved'
                                ? 'bg-indigo-100 text-indigo-800'
                                : r.status === 'calculated'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <p className="text-sm text-blue-700">
            <strong>💡 How Team Income Works:</strong> <br />
            <b>Team Income:</b> Earn commissions from your team members' purchases and sales. <br />
            <b>Matching Bonus:</b> Earn from the balanced amount between your team's left and right leg sales.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MyTeamIncomeDashboard;