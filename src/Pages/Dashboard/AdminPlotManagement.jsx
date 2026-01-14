// components/AdminPlotManagement.js

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, X, Check, XCircle, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const API_BASE_URL = "https://shreejeebackend.onrender.com/api/v1/plots";

const AdminPlotManagement = () => {
  const { user, loading: authLoading } = useAuth();
  const [plots, setPlots] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [filters, setFilters] = useState({
    city: "",
    siteName: "",
    status: "",
    minPrice: "",
    maxPrice: "",
  });
  const [allPlots, setAllPlots] = useState([]); // All available plots
  const [cities, setCities] = useState([]); // Unique cities
  const [sites, setSites] = useState([]); // Sites for selected city
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionResponse, setActionResponse] = useState(null);
  const [paymentFormOpen, setPaymentFormOpen] = useState(false); // Toggle for payment form
  const [paymentDetails, setPaymentDetails] = useState([{
    installmentNumber: 1,
    amount: 0,
    paidDate: new Date().toISOString().split('T')[0],
    receiptNo: "",
    paymentMode: "cash",
    transactionId: "",
    transactionDate: new Date().toISOString().split('T')[0],
    notes: ""
  }]);
  const [totalPaidAmount, setTotalPaidAmount] = useState(0);

  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
  });

  // Fetch all plots for dropdowns
  const fetchAllPlots = async () => {
    try {
      const { data } = await apiClient.get("/admin/plots", {
        params: { limit: 1000 },
      });
      const plots = data.data.plots || [];
      setAllPlots(plots);

      // Extract unique cities
      const uniqueCities = [
        ...new Set(plots.map((p) => p.siteLocation.address.city)),
      ];
      setCities(uniqueCities);
    } catch (err) {
      console.error("Error fetching plots:", err);
    }
  };

  // Fetch filtered plots based on filters
  const fetchFilteredPlots = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/admin/plots", {
        params: {
          city: filters.city || undefined,
          siteName: filters.siteName || undefined,
          status: filters.status || undefined,
          minPrice: filters.minPrice || undefined,
          maxPrice: filters.maxPrice || undefined,
          limit: 1000,
        },
      });
      setPlots(data.data.plots || []);
    } catch (err) {
      console.error("Error fetching plots:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch pending bookings
  const fetchPendingBookings = async () => {
    try {
      const { data } = await apiClient.get("/admin/plots/pending");
      setPendingBookings(data.data.plots || []);
    } catch (err) {
      console.error("Error fetching pending bookings:", err);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchAllPlots();
      fetchPendingBookings();
    }
  }, [authLoading, user]);

  // Update sites when city is selected
  useEffect(() => {
    if (filters.city) {
      const filteredSites = [
        ...new Set(
          allPlots
            .filter((p) => p.siteLocation.address.city === filters.city)
            .map((p) => p.siteLocation.siteName)
        ),
      ];
      setSites(filteredSites);
    } else {
      setSites([]);
    }
  }, [filters.city, allPlots]);

  // Apply filters when they change
  useEffect(() => {
    if (filters.city || filters.siteName || filters.status || filters.minPrice || filters.maxPrice) {
      fetchFilteredPlots();
    }
  }, [filters]);

  // Calculate total paid amount
  useEffect(() => {
    const total = paymentDetails.reduce((sum, detail) => sum + (parseFloat(detail.amount) || 0), 0);
    setTotalPaidAmount(total);
  }, [paymentDetails]);

  const handleApproveBooking = async (plotId) => {
    setActionLoading(true);
    setActionResponse(null);
    try {
      const response = await apiClient.post(`/admin/plots/${plotId}/approve`, {
        paymentDetails, // Send the array of payment details
        totalPaidAmount, // Send the calculated total
        finalStatus: "booked" // Optional: you can let admin choose the final status
      });
      if (response.data.success) {
        setActionResponse({ success: true, message: "Booking approved successfully with payment details ✅" });
        setPlots((prev) =>
          prev.map((p) =>
            p._id === plotId
              ? { ...p, status: "booked", bookingDetails: { ...p.bookingDetails, status: "approved" } }
              : p
          )
        );
        setPendingBookings((prev) => prev.filter((p) => p._id !== plotId));
        setSelectedPlot((prev) => ({
          ...prev,
          status: "booked",
          bookingDetails: { ...prev.bookingDetails, status: "approved" },
        }));
        setPaymentFormOpen(false); // Close the form after successful approval
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Approval failed ❌";
      setActionResponse({ success: false, message: msg });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectBooking = async (plotId) => {
    setActionLoading(true);
    setActionResponse(null);
    try {
      const response = await apiClient.post(`/admin/plots/${plotId}/reject`);
      if (response.data.success) {
        setActionResponse({ success: true, message: "Booking rejected successfully ❌" });
        setPlots((prev) =>
          prev.map((p) =>
            p._id === plotId
              ? { ...p, status: "available", bookingDetails: { ...p.bookingDetails, status: "rejected" } }
              : p
          )
        );
        setPendingBookings((prev) => prev.filter((p) => p._id !== plotId));
        setSelectedPlot((prev) => ({
          ...prev,
          status: "available",
          bookingDetails: { ...prev.bookingDetails, status: "rejected" },
        }));
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Rejection failed ❌";
      setActionResponse({ success: false, message: msg });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === "booked") return "bg-red-500 text-white";
    if (status === "pending") return "bg-yellow-400 text-black";
    if (status === "available") return "bg-green-500 text-white";
    if (status === "sold") return "bg-purple-500 text-white";
    return "bg-gray-300 text-black";
  };

  // Add a new installment row
  const addInstallment = () => {
    setPaymentDetails(prev => [
      ...prev,
      {
        installmentNumber: prev.length + 1,
        amount: 0,
        paidDate: new Date().toISOString().split('T')[0],
        receiptNo: "",
        paymentMode: "cash",
        transactionId: "",
        transactionDate: new Date().toISOString().split('T')[0],
        notes: ""
      }
    ]);
  };

  // Remove an installment row
  const removeInstallment = (index) => {
    if (paymentDetails.length > 1) {
      setPaymentDetails(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Update a specific field in an installment
  const updateInstallmentField = (index, field, value) => {
    setPaymentDetails(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  if (authLoading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
      </div>
    );

  if (!user || user.role !== "admin")
    return (
      <div className="text-center text-gray-600 mt-20">
        Access denied. Admin access required.
      </div>
    );

  return (
    <div className="p-6">
      <Card className="mb-6 shadow-md border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Admin Plot Management
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Select
            value={filters.city}
            onValueChange={(value) => setFilters({ ...filters, city: value, siteName: "" })}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select City" />
            </SelectTrigger>
            <SelectContent>
              {cities.length > 0 ? (
                cities.map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))
              ) : (
                <div className="text-gray-400 p-2">No cities found</div>
              )}
            </SelectContent>
          </Select>

          <Select
            value={filters.siteName}
            onValueChange={(value) => setFilters({ ...filters, siteName: value })}
            disabled={!filters.city}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder={filters.city ? "Select Site" : "Select City First"} />
            </SelectTrigger>
            <SelectContent>
              {sites.length > 0 ? (
                sites.map((site) => (
                  <SelectItem key={site} value={site}>{site}</SelectItem>
                ))
              ) : (
                <div className="text-gray-400 p-2">
                  {filters.city ? "No sites found" : "Select a city first"}
                </div>
              )}
            </SelectContent>
          </Select>

          <Select
            value={filters.status}
            onValueChange={(value) => setFilters({ ...filters, status: value })}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="booked">Booked</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Min Price"
            type="number"
            value={filters.minPrice}
            onChange={(e) =>
              setFilters({ ...filters, minPrice: e.target.value })
            }
            className="w-32"
          />
          <Input
            placeholder="Max Price"
            type="number"
            value={filters.maxPrice}
            onChange={(e) =>
              setFilters({ ...filters, maxPrice: e.target.value })
            }
            className="w-32"
          />
          <Button
            onClick={() => setFilters({ city: "", siteName: "", status: "", minPrice: "", maxPrice: "" })}
            disabled={loading}
          >
            Clear
          </Button>
        </CardContent>
      </Card>

      {/* Grid of plots */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
        </div>
      ) : plots.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">No plots found.</p>
      ) : (
        <div className="grid grid-cols-10 gap-3">
          {plots.map((plot) => (
            <div
              key={plot._id}
              onClick={() => {
                setSelectedPlot(plot);
                setShowModal(true);
              }}
              className={`p-3 rounded-lg cursor-pointer text-center transition-all duration-200 hover:opacity-90 relative ${getStatusColor(
                plot.status
              )}`}
            >
              <div className="font-bold text-sm">{plot.plotNumber}</div>
              <div className="text-[12px] mt-1 text-white font-medium">
                {plot.siteLocation?.siteName || "N/A"}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for details + approval actions */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex justify-between">
              <span>
                {selectedPlot?.plotName} - {selectedPlot?.plotNumber}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowModal(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          {actionResponse && (
            <Alert
              className={
                actionResponse.success
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }
            >
              <AlertDescription
                className={
                  actionResponse.success ? "text-green-800" : "text-red-800"
                }
              >
                {actionResponse.message}
              </AlertDescription>
            </Alert>
          )}

          {selectedPlot && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Location</h3>
                  <p>{selectedPlot.siteLocation.siteName}</p>
                  <p>
                    {selectedPlot.siteLocation.address.city},{" "}
                    {selectedPlot.siteLocation.address.state}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Pricing</h3>
                  <p>
                    Base: ₹{selectedPlot.pricing.basePrice.toLocaleString()}
                  </p>
                  <p>
                    Total: ₹{selectedPlot.pricing.totalPrice.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Booking section */}
              {selectedPlot.bookingDetails && (
                <div className="border-t pt-3">
                  <h3 className="font-semibold mb-2">Booking Details</h3>
                  <p>
                    <span className="font-medium">Buyer:</span>{" "}
                    {selectedPlot.bookingDetails.buyerId?.personalInfo
                      ?.firstName || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span>{" "}
                    <Badge
                      variant={
                        selectedPlot.bookingDetails.status === "approved"
                          ? "default"
                          : selectedPlot.bookingDetails.status === "rejected"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {selectedPlot.bookingDetails.status}
                    </Badge>
                  </p>

                  {selectedPlot.status === "pending" && (
                    <div className="flex gap-3 mt-4">
                      <Button
                        onClick={() => setPaymentFormOpen(true)} // Open the payment form
                        disabled={actionLoading}
                      >
                        {actionLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <Check className="h-4 w-4 mr-1" />
                        )}
                        Approve Booking & Enter Payment Details
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleRejectBooking(selectedPlot._id)}
                        disabled={actionLoading}
                      >
                        {actionLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-1" />
                        )}
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Payment Details Form */}
              {paymentFormOpen && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Enter Payment Details</h3>
                  <p className="text-sm text-gray-500 mb-3">
                    Fill out the payment schedule for this booking.
                  </p>

                  {/* Payment Schedule Table */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>S.N.</TableHead>
                        <TableHead>Payment Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Receipt No.</TableHead>
                        <TableHead>Payment Mode</TableHead>
                        <TableHead>Cheque / DD / NEFT / RTGS No.</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentDetails.map((installment, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <Input
                              type="date"
                              value={installment.paidDate}
                              onChange={(e) => updateInstallmentField(index, 'paidDate', e.target.value)}
                              className="w-full"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={installment.amount}
                              onChange={(e) => updateInstallmentField(index, 'amount', e.target.value)}
                              className="w-full"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={installment.receiptNo}
                              onChange={(e) => updateInstallmentField(index, 'receiptNo', e.target.value)}
                              className="w-full"
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={installment.paymentMode}
                              onValueChange={(value) => updateInstallmentField(index, 'paymentMode', value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Mode" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="cheque">Cheque</SelectItem>
                                <SelectItem value="rtgs">RTGS</SelectItem>
                                <SelectItem value="neft">NEFT</SelectItem>
                                <SelectItem value="upi">UPI</SelectItem>
                                <SelectItem value="dd">DD</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              value={installment.transactionId}
                              onChange={(e) => updateInstallmentField(index, 'transactionId', e.target.value)}
                              className="w-full"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="date"
                              value={installment.transactionDate}
                              onChange={(e) => updateInstallmentField(index, 'transactionDate', e.target.value)}
                              className="w-full"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={installment.notes}
                              onChange={(e) => updateInstallmentField(index, 'notes', e.target.value)}
                              className="w-full"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeInstallment(index)}
                              disabled={paymentDetails.length <= 1}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="flex justify-between items-center mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addInstallment}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Installment
                    </Button>
                    <div className="text-right">
                      <strong>Total Paid Amount:</strong> ₹{totalPaidAmount.toLocaleString()}
                    </div>
                  </div>

                  <DialogFooter className="mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setPaymentFormOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleApproveBooking(selectedPlot._id)}
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <Check className="h-4 w-4 mr-1" />
                      )}
                      Confirm & Approve
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPlotManagement;