// components/AdminMatchingIncomeApproval.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchCycleMatchingIncome, approveMatchingIncome } from '../../api/matchingIncomeService';

const AdminMatchingIncomeApproval = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [approvingRecordId, setApprovingRecordId] = useState(null);
  // Add state for overall statistics
  const [stats, setStats] = useState(null);

  // Fetch records on component mount
  useEffect(() => {
    fetchRecords();
    fetchStats(); // Fetch overall stats
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch records with status 'calculated' (pending approval) for all cycles
      const response = await fetchCycleMatchingIncome('', '', { status: 'calculated' });
      if (response.success) {
        setRecords(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch records.');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'An error occurred while fetching records.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch summary stats for all cycles (optional, for dashboard feel)
      // You might need to modify fetchCycleMatchingIncome or create a new API call for this
      // For now, we'll calculate basic stats from the fetched records after fetchRecords
    } catch (err) {
      console.error('Fetch stats error:', err);
      // Don't set error here as it's not critical for the main functionality
    }
  };

  const handleApprove = async (recordId) => {
    if (!user?._id) {
      setError('User information not available.');
      return;
    }
    setApprovingRecordId(recordId);
    setSuccess(null);
    setError(null);

    try {
      const response = await approveMatchingIncome(recordId, user._id);
      if (response.success) {
        setSuccess(response.message || 'Income approved successfully.');
        // Update the local state optimistically
        setRecords(prevRecords =>
          prevRecords.map(record =>
            record._id === recordId ? { ...record, status: 'approved', approvedBy: user._id, approvedAt: new Date().toISOString() } : record
          )
        );
        // Also update stats if needed
        setStats(prevStats => {
          if (prevStats) {
            return {
              ...prevStats,
              totalRecords: prevStats.totalRecords - 1, // Decrease pending count
              statusBreakdown: {
                ...prevStats.statusBreakdown,
                calculated: (prevStats.statusBreakdown.calculated || 0) - 1,
                approved: (prevStats.statusBreakdown.approved || 0) + 1
              }
            };
          }
          return prevStats;
        });
      } else {
        setError(response.message || 'Failed to approve income.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during approval.');
    } finally {
      setApprovingRecordId(null);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
          <p className="text-gray-600 mt-2">You must be an admin to view this page.</p>
        </div>
      </div>
    );
  }

  if (loading && records.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading records...</p>
        </div>
      </div>
    );
  }

  // Calculate basic stats from current records if stats aren't fetched separately
  const calculatedStats = {
    totalRecords: records.length,
    totalIncome: records.reduce((sum, record) => sum + record.incomeAmount, 0)
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin: Matching Income Approval</h1>
          <p className="mt-2 text-gray-600">Approve all pending matching income requests.</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-lg shadow-lg text-white">
            <h3 className="text-sm font-medium opacity-90">Pending for Approval</h3>
            <p className="text-3xl font-bold mt-2">{calculatedStats.totalRecords}</p>
            <p className="text-xs mt-1 opacity-75">Records with status 'calculated'</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-lg text-white">
            <h3 className="text-sm font-medium opacity-90">Total Pending Income</h3>
            <p className="text-3xl font-bold mt-2">₹{calculatedStats.totalIncome.toLocaleString('en-IN')}</p>
            <p className="text-xs mt-1 opacity-75">Sum of all pending requests</p>
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Pending Approval Requests</h2>
            <p className="text-sm text-gray-500 mt-1">
              Showing all records with status 'calculated'.
            </p>
          </div>
          {records.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">✅</div>
              <p className="text-gray-500 text-lg">No records require approval at this time.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cycle Period</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Left Leg (₹)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Right Leg (₹)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balanced (₹)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Income (₹)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.userId?.username || record.userId?.email || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">
                            {new Date(record.cycleStartDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                          </div>
                          <div className="text-gray-500 text-xs">
                            to {new Date(record.cycleEndDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{record.leftLeg.totalSales.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{record.rightLeg.totalSales.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ₹{record.balancedAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                        ₹{record.incomeAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.status === 'paid' ? 'bg-green-100 text-green-800' :
                          record.status === 'credited' ? 'bg-blue-100 text-blue-800' :
                          record.status === 'approved' ? 'bg-indigo-100 text-indigo-800' :
                          record.status === 'calculated' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {record.status === 'calculated' ? (
                          <button
                            onClick={() => handleApprove(record._id)}
                            disabled={approvingRecordId === record._id}
                            className={`${
                              approvingRecordId === record._id
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700'
                            } text-white px-4 py-2 rounded-md text-sm font-medium transition-colors`}
                          >
                            {approvingRecordId === record._id ? 'Approving...' : 'Approve'}
                          </button>
                        ) : (
                          <span className="text-gray-500 text-xs">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMatchingIncomeApproval;