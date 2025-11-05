import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, IndianRupee, Calendar, X, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const API_BASE_URL = "https://shreejeebackend.onrender.com/api/v1/plots";

const MyBookings = () => {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Axios instance with auth
  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
  });

  // Fetch user's bookings
  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/user/plots/my-bookings");
      
      if (data.success) {
        setBookings(data.data.plots || []);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchMyBookings();
    }
  }, [authLoading, user]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleCancelClick = (plot) => {
    setSelectedPlot(plot);
    setShowCancelDialog(true);
  };

  const handleCancelBooking = async () => {
    if (!selectedPlot) return;
    
    setCancelLoading(true);
    try {
      const { data } = await apiClient.post(
        `/user/plots/${selectedPlot._id}/cancel`
      );

      if (data.success) {
        // Remove cancelled booking from list
        setBookings((prev) => prev.filter((p) => p._id !== selectedPlot._id));
        setShowCancelDialog(false);
        setSelectedPlot(null);
        alert("Booking cancelled successfully!");
      }
    } catch (error) {
      alert(
        "Cancellation failed: " +
          (error.response?.data?.message || "Unknown error")
      );
    } finally {
      setCancelLoading(false);
    }
  };

  const calculateTotalValue = () => {
    return bookings.reduce(
      (sum, plot) => sum + (plot.pricing?.totalPrice || 0),
      0
    );
  };

  const calculateTotalPaid = () => {
    return bookings.reduce(
      (sum, plot) => sum + (plot.bookingDetails?.totalPaidAmount || 0),
      0
    );
  };

  const calculatePendingAmount = () => {
    return calculateTotalValue() - calculateTotalPaid();
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
        Please log in to view your bookings.
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">My Plot Bookings</h1>
        <p className="text-gray-500 mt-1">Manage and track all your plot bookings</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
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
                <p className="text-sm font-medium text-gray-500">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(calculateTotalValue())}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <IndianRupee className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Amount Paid</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(calculateTotalPaid())}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Amount</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(calculatePendingAmount())}
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                <div className="text-gray-500 mb-2">
                  You haven't booked any plots yet.
                </div>
                <Button
                  onClick={() => (window.location.href = "/plots")}
                  variant="outline"
                  size="sm"
                >
                  Browse Available Plots
                </Button>
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
                    <TableHead>Site Name</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Total Price</TableHead>
                    <TableHead>Token Paid</TableHead>
                    <TableHead>Pending</TableHead>
                    <TableHead>Booking Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((plot, index) => {
                    const pendingAmount =
                      (plot.pricing?.totalPrice || 0) -
                      (plot.bookingDetails?.totalPaidAmount || 0);

                    return (
                      <TableRow key={plot._id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">
                          {plot.plotNumber}
                        </TableCell>
                        <TableCell>{plot.plotName}</TableCell>
                        <TableCell>{plot.siteLocation?.siteName}</TableCell>
                        <TableCell>{plot.siteLocation?.address?.city}</TableCell>
                        <TableCell>
                          {plot.size?.value} {plot.size?.unit}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(plot.pricing?.totalPrice || 0)}
                        </TableCell>
                        <TableCell className="text-green-600 font-medium">
                          {formatCurrency(
                            plot.bookingDetails?.totalPaidAmount || 0
                          )}
                        </TableCell>
                        <TableCell className="text-orange-600 font-medium">
                          {formatCurrency(pendingAmount)}
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
                        <TableCell>
                          {plot.status === "booked" && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleCancelClick(plot)}
                            >
                              Cancel
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Plot Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          {selectedPlot && (
            <div className="space-y-2 py-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Plot Number:</span>
                <span className="font-medium">{selectedPlot.plotNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Plot Name:</span>
                <span className="font-medium">{selectedPlot.plotName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Site:</span>
                <span className="font-medium">
                  {selectedPlot.siteLocation?.siteName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Price:</span>
                <span className="font-medium">
                  {formatCurrency(selectedPlot.pricing?.totalPrice || 0)}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              disabled={cancelLoading}
            >
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelBooking}
              disabled={cancelLoading}
            >
              {cancelLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Cancelling...
                </>
              ) : (
                "Cancel Booking"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyBookings;