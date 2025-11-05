// components/MyIncomeDashboard.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { fetchUserMatchingIncome } from '../../api/matchingIncomeService';
import { Loader2 } from 'lucide-react';

const MyIncomeDashboard = () => {
  const { user } = useAuth();
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
      const result = await fetchUserMatchingIncome(user._id, { ...filters, page: 1, limit: 100 });
      if (result.success) {
        setRecords(result.data || []);
        setSummary(result.summary || null);
      } else {
        setError(result.message || 'Failed to fetch data');
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
  const personalSaleIncome = summary?.personalSaleIncome || 0;
  const matchingBonusIncome = summary?.matchingBonusIncome || 0;
  const leftLegSales = summary?.leftLegTotalSales || 0;
  const rightLegSales = summary?.rightLegTotalSales || 0;
  const legBalance = summary?.legBalance || 0;

  if (loading && !summary) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin text-indigo-500 w-10 h-10" />
        <p className="ml-3 text-gray-600">Loading income data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Income Dashboard</h1>
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

        {/* Summary Cards */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {[
            { title: 'Total Records', value: summary?.totalRecords || 0, color: 'from-blue-500 to-blue-600', hint: 'All time cycles' },
            { title: 'Total Income', value: `₹${totalEarned.toLocaleString('en-IN')}`, color: 'from-green-500 to-green-600', hint: 'Lifetime earnings' },
            { title: 'Personal Sale Income', value: `₹${personalSaleIncome.toLocaleString('en-IN')}`, color: 'from-purple-500 to-purple-600', hint: '5% from your sales' },
            { title: 'Matching Bonus', value: `₹${matchingBonusIncome.toLocaleString('en-IN')}`, color: 'from-pink-500 to-pink-600', hint: '5% from team balance' },
          ].map((card, idx) => (
            <motion.div
              key={idx}
              layout
              whileHover={{ scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className={`bg-gradient-to-br ${card.color} p-6 rounded-xl shadow-md text-white hover:shadow-lg`}
            >
              <h3 className="text-sm font-medium opacity-90">{card.title}</h3>
              <p className="text-3xl font-bold mt-2">{card.value}</p>
              <p className="text-xs mt-1 opacity-75">{card.hint}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Leg Performance */}
        {(leftLegSales > 0 || rightLegSales > 0) && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Team Leg Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="text-sm text-gray-600">Left Leg Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">₹{leftLegSales.toLocaleString('en-IN')}</p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(leftLegSales / (leftLegSales + rightLegSales) * 100) || 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <p className="text-sm text-gray-600">Right Leg Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">₹{rightLegSales.toLocaleString('en-IN')}</p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(rightLegSales / (leftLegSales + rightLegSales) * 100) || 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <p className="text-sm text-gray-600">Leg Balance</p>
                <p className="text-2xl font-bold text-gray-900">₹{legBalance.toLocaleString('en-IN')}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {leftLegSales > rightLegSales ? '⬅️ Left is stronger' : rightLegSales > leftLegSales ? '➡️ Right is stronger' : '⚖️ Balanced'}
                </p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 <span className="font-semibold">Tip:</span> Balance your legs to maximize matching income. Your balanced amount is ₹{Math.min(leftLegSales, rightLegSales).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        )}


        {/* Records Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">My Income Records</h2>
          </div>
          {(!records || records.length === 0) ? (
            <div className="text-center py-10 text-gray-500">
              <p className="text-lg">No income records found</p>
              <p className="text-sm text-gray-400">Records will appear here after purchases are approved</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
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
            <strong>💡 How It Works:</strong> <br />
            <b>Personal Sale Income (5%):</b> Earn 5% commission from your direct plot purchases. <br />
            <b>Matching Bonus (5%):</b> Earn 5% on the balanced amount between your left and right team sales.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MyIncomeDashboard;