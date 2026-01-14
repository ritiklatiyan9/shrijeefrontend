// AdminPaymentDashboard.jsx - Admin view for all payments and verification
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  IndianRupee,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  Receipt,
  TrendingUp,
  MapPin,
  Users,
  Building2,
  PieChart,
  BarChart3,
  Download,
  Filter,
  RefreshCw,
  Eye
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const API_BASE_URL = "https://shreejeebackend.onrender.com/api/v1/plots";

const AdminPaymentDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentStats, setPaymentStats] = useState(null);
  const [allBookings, setAllBookings] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    paymentType: "",
    startDate: "",
    endDate: ""
  });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
  });

  // Fetch payment statistics
  const fetchPaymentStats = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/admin/plots/payment-stats", {
        params: {
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined
        }
      });
      setPaymentStats(data.data);
      setAllBookings(data.data.paymentDetails || []);
    } catch (err) {
      console.error("Error fetching payment stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user && user.role === "admin") {
      fetchPaymentStats();
    }
  }, [authLoading, user]);

  const formatCurrency = (amount) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
    return `₹${amount?.toLocaleString() || 0}`;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 75) return "bg-blue-500";
    if (progress >= 50) return "bg-yellow-500";
    if (progress >= 25) return "bg-orange-500";
    return "bg-red-500";
  };

  const openDetailsModal = async (booking) => {
    try {
      const { data } = await apiClient.get(`/admin/plots/${booking.plotId}`);
      setSelectedBooking(data.data);
      setDetailsModalOpen(true);
    } catch (err) {
      console.error("Error fetching plot details:", err);
    }
  };

  const getFilteredBookings = () => {
    return allBookings.filter(booking => {
      if (filters.status) {
        if (filters.status === "completed" && booking.progress < 100) return false;
        if (filters.status === "pending" && booking.progress >= 100) return false;
      }
      if (filters.paymentType && booking.paymentType !== filters.paymentType) return false;
      return true;
    });
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="text-center text-gray-600 mt-20">
        Access denied. Admin access required.
      </div>
    );
  }

  const summary = paymentStats?.summary || {};
  const filteredBookings = getFilteredBookings();

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            Payment Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Track all plot payments and collections</p>
        </div>
        <Button onClick={fetchPaymentStats} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Plots Sold</p>
                <p className="text-3xl font-bold mt-1">{summary.totalPlots || 0}</p>
                <div className="flex gap-4 mt-2 text-xs text-blue-100">
                  <span>Full: {summary.fullPaymentCount || 0}</span>
                  <span>EMI: {summary.installmentCount || 0}</span>
                </div>
              </div>
              <Building2 className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Collection</p>
                <p className="text-3xl font-bold mt-1">{formatCurrency(summary.totalCollection || 0)}</p>
              </div>
              <TrendingUp className="h-12 w-12 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Remaining to Collect</p>
                <p className="text-3xl font-bold mt-1">{formatCurrency(summary.totalRemaining || 0)}</p>
              </div>
              <IndianRupee className="h-12 w-12 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Payment Status</p>
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm">Completed: {summary.completedPayments || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Pending: {summary.pendingPayments || 0}</span>
                  </div>
                </div>
              </div>
              <PieChart className="h-12 w-12 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <Label className="text-xs">Payment Status</Label>
              <Select
                value={filters.status || undefined}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Payment Type</Label>
              <Select
                value={filters.paymentType || undefined}
                onValueChange={(value) => setFilters({ ...filters, paymentType: value })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Payment</SelectItem>
                  <SelectItem value="installment">Installments</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">From Date</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-40"
              />
            </div>
            <div>
              <Label className="text-xs">To Date</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-40"
              />
            </div>
            <Button onClick={fetchPaymentStats}>
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setFilters({ status: "", paymentType: "", startDate: "", endDate: "" })}
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            All Payment Records
          </CardTitle>
          <CardDescription>
            {filteredBookings.length} records found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <Receipt className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No payment records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plot</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>EMI Status</TableHead>
                    <TableHead>Next Due</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking.plotId}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{booking.plotNumber}</p>
                          <p className="text-xs text-gray-500">{booking.plotName}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {booking.buyer?.personalInfo?.firstName || booking.buyer?.username || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          booking.paymentType === "full" 
                            ? "border-green-500 text-green-600" 
                            : "border-orange-500 text-orange-600"
                        }>
                          {booking.paymentType === "full" ? "Full" : "EMI"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(booking.totalPrice)}
                      </TableCell>
                      <TableCell className="text-green-600 font-medium">
                        {formatCurrency(booking.totalPaid)}
                      </TableCell>
                      <TableCell className="text-orange-600 font-medium">
                        {formatCurrency(booking.remaining)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 min-w-[100px]">
                          <Progress 
                            value={booking.progress} 
                            className={`h-2 flex-1 ${getProgressColor(booking.progress)}`}
                          />
                          <span className="text-xs font-medium w-10">
                            {booking.progress}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs">
                          {booking.paidInstallments}/{booking.installments}
                        </span>
                      </TableCell>
                      <TableCell>
                        {booking.nextDueDate ? (
                          <span className={`text-xs ${
                            new Date(booking.nextDueDate) < new Date() 
                              ? "text-red-600 font-semibold" 
                              : "text-gray-600"
                          }`}>
                            {formatDate(booking.nextDueDate)}
                          </span>
                        ) : (
                          <span className="text-xs text-green-600">Completed</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openDetailsModal(booking)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-blue-600" />
              Payment Details: {selectedBooking?.plotNumber}
            </DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-6">
              {/* Plot & Buyer Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold mb-2">Plot Information</h4>
                  <p><span className="text-gray-500">Name:</span> {selectedBooking.plotName}</p>
                  <p><span className="text-gray-500">Number:</span> {selectedBooking.plotNumber}</p>
                  <p><span className="text-gray-500">Location:</span> {selectedBooking.siteLocation?.siteName}, {selectedBooking.siteLocation?.address?.city}</p>
                  <p><span className="text-gray-500">Total Price:</span> ₹{selectedBooking.pricing?.totalPrice?.toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Buyer Information</h4>
                  <p><span className="text-gray-500">Name:</span> {selectedBooking.bookingDetails?.buyerId?.personalInfo?.firstName || "N/A"}</p>
                  <p><span className="text-gray-500">Email:</span> {selectedBooking.bookingDetails?.buyerId?.email || "N/A"}</p>
                  <p><span className="text-gray-500">Booking Date:</span> {formatDate(selectedBooking.bookingDetails?.bookingDate)}</p>
                  <p><span className="text-gray-500">Payment Type:</span> {selectedBooking.bookingDetails?.paymentType === "installment" ? "Installments" : "Full Payment"}</p>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="grid grid-cols-4 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-xl font-bold text-blue-600">
                    ₹{(selectedBooking.pricing?.totalPrice || 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Paid</p>
                  <p className="text-xl font-bold text-green-600">
                    ₹{(selectedBooking.bookingDetails?.totalPaidAmount || 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Remaining</p>
                  <p className="text-xl font-bold text-orange-600">
                    ₹{(selectedBooking.bookingDetails?.remainingAmount || 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Progress</p>
                  <p className="text-xl font-bold text-purple-600">
                    {selectedBooking.bookingDetails?.paymentProgress || 0}%
                  </p>
                </div>
              </div>

              {/* Payment Schedule */}
              {selectedBooking.bookingDetails?.paymentSchedule?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Payment Schedule</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Installment</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedBooking.bookingDetails.paymentSchedule.map((inst, idx) => (
                        <TableRow key={idx} className={
                          inst.status === "paid" ? "bg-green-50" :
                          new Date(inst.dueDate) < new Date() ? "bg-red-50" : ""
                        }>
                          <TableCell>
                            {inst.installmentNumber === 0 ? "Down Payment" : `EMI ${inst.installmentNumber}`}
                          </TableCell>
                          <TableCell>{formatDate(inst.dueDate)}</TableCell>
                          <TableCell>₹{(inst.amount || 0).toLocaleString()}</TableCell>
                          <TableCell>₹{(inst.paidAmount || 0).toLocaleString()}</TableCell>
                          <TableCell className="uppercase text-xs">{inst.paymentMode || "-"}</TableCell>
                          <TableCell className="text-xs">{inst.transactionId || "-"}</TableCell>
                          <TableCell>
                            <Badge className={
                              inst.status === "paid" ? "bg-green-500" :
                              inst.status === "partial" ? "bg-blue-500" :
                              new Date(inst.dueDate) < new Date() ? "bg-red-500" : "bg-yellow-500"
                            }>
                              {inst.status === "paid" ? "Paid" :
                               inst.status === "partial" ? "Partial" :
                               new Date(inst.dueDate) < new Date() ? "Overdue" : "Pending"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPaymentDashboard;
