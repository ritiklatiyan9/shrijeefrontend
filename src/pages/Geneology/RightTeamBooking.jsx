import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, MapPin, IndianRupee, Calendar } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";

const API_BASE_URL = "http://13.127.229.155:5000/api/v1/plots";

const RightTeamBookings = () => {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  // Axios instance with auth
  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
  });

  // Fetch right team bookings
  const fetchRightTeamBookings = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/user/plots/team/right");
      
      if (data.success) {
        setBookings(data.data.plots || []);
        setSummary({
          total: data.data.total || 0,
          teamMembers: data.data.teamMembers || 0,
        });
      }
    } catch (err) {
      console.error("Error fetching right team bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchRightTeamBookings();
    }
  }, [authLoading, user]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Loader & Auth guard
  if (authLoading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
      </div>
    );

  if (!user)
    return (
      <div className="text-center text-gray-600 mt-20">
        Please log in to view right team bookings.
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Right Team Plot Bookings</h1>
          <p className="text-gray-500 mt-1">View all plots booked by your right team members</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Users className="h-4 w-4 mr-2" />
          {summary?.teamMembers || 0} Team Members
        </Badge>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                  <p className="text-3xl font-bold text-gray-900">{summary.total}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Team Members</p>
                  <p className="text-3xl font-bold text-gray-900">{summary.teamMembers}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Value</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(
                      bookings.reduce(
                        (sum, plot) => sum + (plot.pricing?.totalPrice || 0),
                        0
                      )
                    )}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <IndianRupee className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Booking Details</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
            </div>
          ) : bookings.length === 0 ? (
            <Alert>
              <AlertDescription className="text-center py-8">
                No bookings found from right team members yet.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>S.No.</TableHead>
                    <TableHead>Plot Number</TableHead>
                    <TableHead>Plot Name</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Member ID</TableHead>
                    <TableHead>Site Name</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Total Price</TableHead>
                    
                    <TableHead>Booking Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((plot, index) => (
                    <TableRow key={plot._id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">
                        {plot.plotNumber}
                      </TableCell>
                      <TableCell>{plot.plotName}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {plot.bookingDetails?.buyerId?.personalInfo?.firstName || ""}{" "}
                            {plot.bookingDetails?.buyerId?.personalInfo?.lastName || ""}
                          </div>
                          <div className="text-xs text-gray-500">
                            {plot.bookingDetails?.buyerId?.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {plot.bookingDetails?.buyerId?.memberId}
                      </TableCell>
                      <TableCell>{plot.siteLocation?.siteName}</TableCell>
                      <TableCell>{plot.siteLocation?.address?.city}</TableCell>
                      <TableCell>
                        {plot.size?.value} {plot.size?.unit}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(plot.pricing?.totalPrice || 0)}
                      </TableCell>
                     
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                          {formatDate(plot.bookingDetails?.bookingDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            plot.status === "booked" ? "default" : "secondary"
                          }
                        >
                          {plot.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RightTeamBookings;