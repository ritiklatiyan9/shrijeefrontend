import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCcw, TrendingUp, Users } from "lucide-react";

const API_BASE_URL = "http://13.127.229.155:5000/api/v1/plots";

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [stats, setStats] = useState({
    total: { bookings: 0, collection: 0 },
    left: { bookings: 0, collection: 0 },
    right: { bookings: 0, collection: 0 }
  });

  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
  });

  // Fetch bookings based on active tab
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeTab !== "all") {
        params.position = activeTab;
      }
      
      const { data } = await api.get("/admin/plots/bookings", { params });
      console.log("Bookings data:", data.data.bookings); // Debug log
      setBookings(data.data.bookings || []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch team statistics
  const fetchStats = async () => {
    try {
      const { data } = await api.get("/admin/plots/bookings/stats");
      console.log("Stats data:", data.data); // Debug log
      setStats(data.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchStats();
  }, [activeTab]);

  const handleRefresh = () => {
    fetchBookings();
    fetchStats();
  };

  const getStatsForTab = () => {
    switch(activeTab) {
      case "left": return stats.left;
      case "right": return stats.right;
      default: return stats.total;
    }
  };

  const currentStats = getStatsForTab();

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Booking Management</h1>
          <p className="text-gray-600 mt-1">Track and manage all plot bookings</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCcw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Collection Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-lg border-t-4 border-t-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Collection</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  ₹{stats.total.collection.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.total.bookings} bookings
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-t-4 border-t-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Left Team Collection</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  ₹{stats.left.collection.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.left.bookings} bookings
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-t-4 border-t-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Right Team Collection</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  ₹{stats.right.collection.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.right.bookings} bookings
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold">
                {activeTab === "all" 
                  ? "All Bookings" 
                  : activeTab === "left" 
                    ? "Left Team Bookings" 
                    : "Right Team Bookings"}
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Showing {currentStats.bookings} booking(s)
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={activeTab === "all" ? "default" : "outline"}
                onClick={() => setActiveTab("all")}
              >
                All Teams
              </Button>
              <Button
                size="sm"
                variant={activeTab === "left" ? "default" : "outline"}
                onClick={() => setActiveTab("left")}
                className={activeTab === "left" ? "bg-green-600 hover:bg-green-700" : ""}
              >
                Left Team
              </Button>
              <Button
                size="sm"
                variant={activeTab === "right" ? "default" : "outline"}
                onClick={() => setActiveTab("right")}
                className={activeTab === "right" ? "bg-purple-600 hover:bg-purple-700" : ""}
              >
                Right Team
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin w-8 h-8 text-gray-600" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No bookings found</p>
              <p className="text-gray-400 text-sm mt-2">
                {activeTab !== "all" ? `No bookings for ${activeTab} team` : "Start booking plots to see them here"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="p-3 text-left font-semibold">Plot Details</th>
                    <th className="p-3 text-left font-semibold">Buyer Info</th>
                    <th className="p-3 text-left font-semibold">Team</th>
                    <th className="p-3 text-left font-semibold">Location</th>
                    <th className="p-3 text-left font-semibold">Pricing</th>
                    <th className="p-3 text-left font-semibold">Payment</th>
                    <th className="p-3 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((plot) => {
                    // ✅ FIXED: Access position from root level, not personalInfo
                    const position = plot.bookingDetails?.buyerId?.position;
                    
                    return (
                      <tr key={plot._id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-3">
                          <div className="font-semibold text-sm text-gray-800">
                            {plot.plotName}
                          </div>
                          <div className="text-xs text-gray-500">
                            #{plot.plotNumber}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {plot.size?.value} {plot.size?.unit}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm font-medium text-gray-800">
                            {plot.bookingDetails?.buyerId?.personalInfo?.firstName}{" "}
                            {plot.bookingDetails?.buyerId?.personalInfo?.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {plot.bookingDetails?.buyerId?.email}
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge
                            className={
                              position === "left"
                                ? "bg-green-100 text-green-800"
                                : position === "right"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {position?.toUpperCase() || "N/A"}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm">
                          <div className="text-gray-800">
                            {plot.siteLocation?.address?.city}
                          </div>
                          <div className="text-xs text-gray-500">
                            {plot.siteLocation?.siteName}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm font-semibold text-gray-800">
                            ₹{plot.pricing?.totalPrice?.toLocaleString()}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm font-semibold text-green-600">
                            ₹{plot.bookingDetails?.totalPaidAmount?.toLocaleString() || 0}
                          </div>
                         
                        </td>
                        <td className="p-3">
                          <Badge
                            className={
                              plot.bookingDetails?.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : plot.bookingDetails?.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {plot.bookingDetails?.status?.toUpperCase()}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBookings;