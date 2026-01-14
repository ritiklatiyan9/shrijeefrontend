// components/AdminBookings.js (Updated)

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCcw, TrendingUp, Users, ChevronDown, ChevronUp } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const API_BASE_URL = "https://shreejeebackend.onrender.com/api/v1/plots";

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [stats, setStats] = useState({
    total: { bookings: 0, collection: 0 },
    left: { bookings: 0, collection: 0 },
    right: { bookings: 0, collection: 0 }
  });
  const [expandedRows, setExpandedRows] = useState(new Set()); // Track expanded rows

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
    switch (activeTab) {
      case "left": return stats.left;
      case "right": return stats.right;
      default: return stats.total;
    }
  };

  const currentStats = getStatsForTab();

  // Toggle row expansion
  const toggleRow = (plotId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(plotId)) {
        newSet.delete(plotId);
      } else {
        newSet.add(plotId);
      }
      return newSet;
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

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
                  {formatCurrency(stats.total.collection)}
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
                  {formatCurrency(stats.left.collection)}
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
                  {formatCurrency(stats.right.collection)}
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead></TableHead> {/* For Expand/Collapse Icon */}
                    <TableHead>Plot Details</TableHead>
                    <TableHead>Buyer Info</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Pricing</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((plot) => {
                    // ✅ FIXED: Access position from root level, not personalInfo
                    const position = plot.bookingDetails?.buyerId?.position;
                    const isExpanded = expandedRows.has(plot._id);

                    return (
                      <React.Fragment key={plot._id}>
                        <TableRow className="border-b hover:bg-gray-50 transition-colors">
                          <TableCell className="p-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleRow(plot._id)}
                              className="p-0 h-auto"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </Button>
                          </TableCell>
                          <TableCell className="p-3">
                            <div className="font-semibold text-sm text-gray-800">
                              {plot.plotName}
                            </div>
                            <div className="text-xs text-gray-500">
                              #{plot.plotNumber}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {plot.size?.value} {plot.size?.unit}
                            </div>
                          </TableCell>
                          <TableCell className="p-3">
                            <div className="text-sm font-medium text-gray-800">
                              {plot.bookingDetails?.buyerId?.personalInfo?.firstName}{" "}
                              {plot.bookingDetails?.buyerId?.personalInfo?.lastName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {plot.bookingDetails?.buyerId?.email}
                            </div>
                          </TableCell>
                          <TableCell className="p-3">
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
                          </TableCell>
                          <TableCell className="p-3 text-sm">
                            <div className="text-gray-800">
                              {plot.siteLocation?.address?.city}
                            </div>
                            <div className="text-xs text-gray-500">
                              {plot.siteLocation?.siteName}
                            </div>
                          </TableCell>
                          <TableCell className="p-3">
                            <div className="text-sm font-semibold text-gray-800">
                              {formatCurrency(plot.pricing?.totalPrice)}
                            </div>
                          </TableCell>
                          <TableCell className="p-3">
                            <div className="text-sm font-semibold text-green-600">
                              {formatCurrency(plot.bookingDetails?.totalPaidAmount)}
                            </div>
                          </TableCell>
                          <TableCell className="p-3">
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
                          </TableCell>
                        </TableRow>
                        {/* Collapsible Payment Details Row */}
                        {isExpanded && (
                          <TableRow className="bg-gray-100">
                            <TableCell colSpan="8" className="p-0">
                              <div className="p-4 border-t border-gray-200">
                                <h4 className="font-semibold mb-3">Payment Schedule</h4>
                                {plot.bookingDetails?.paymentSchedule && plot.bookingDetails.paymentSchedule.length > 0 ? (
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="bg-gray-200">
                                        <TableHead className="text-xs font-medium">S.N.</TableHead>
                                        <TableHead className="text-xs font-medium">Payment Date</TableHead>
                                        <TableHead className="text-xs font-medium">Amount</TableHead>
                                        <TableHead className="text-xs font-medium">Receipt No.</TableHead>
                                        <TableHead className="text-xs font-medium">Payment Mode</TableHead>
                                        <TableHead className="text-xs font-medium">Transaction ID</TableHead>
                                        <TableHead className="text-xs font-medium">Transaction Date</TableHead>
                                        <TableHead className="text-xs font-medium">Notes</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {plot.bookingDetails.paymentSchedule.map((installment, idx) => (
                                        <TableRow key={idx}>
                                          <TableCell className="text-sm">{idx + 1}</TableCell>
                                          <TableCell className="text-sm">{formatDate(installment.paidDate)}</TableCell>
                                          <TableCell className="text-sm font-medium">{formatCurrency(installment.amount)}</TableCell>
                                          <TableCell className="text-sm">{installment.receiptNo || "N/A"}</TableCell>
                                          <TableCell className="text-sm">{installment.paymentMode?.toUpperCase() || "CASH"}</TableCell>
                                          <TableCell className="text-sm">{installment.transactionId || "N/A"}</TableCell>
                                          <TableCell className="text-sm">{formatDate(installment.transactionDate)}</TableCell>
                                          <TableCell className="text-sm">{installment.notes || "N/A"}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                ) : (
                                  <p className="text-sm text-gray-500 italic">No payment details recorded yet.</p>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBookings;