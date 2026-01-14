// PaymentTracker.jsx - User Payment Tracking Dashboard
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
  FileText,
  ChevronRight,
  Wallet,
  Building2,
  Info
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const API_BASE_URL = "https://shreejeebackend.onrender.com/api/v1/plots";

const PaymentTracker = () => {
  const { user, loading: authLoading } = useAuth();
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [response, setResponse] = useState(null);
  
  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    installmentNumber: null,
    amount: 0,
    paymentMode: "upi",
    transactionId: "",
    notes: ""
  });

  // Summary stats
  const [summary, setSummary] = useState({
    totalPlots: 0,
    totalInvested: 0,
    totalPaid: 0,
    totalRemaining: 0,
    upcomingPayments: 0
  });

  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
  });

  // Fetch user's booked plots
  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/user/plots/my-bookings");
      const bookings = data.data.plots || [];
      setMyBookings(bookings);
      calculateSummary(bookings);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary statistics
  const calculateSummary = (bookings) => {
    const approvedBookings = bookings.filter(b => b.bookingDetails?.status === "approved");
    
    const totalInvested = approvedBookings.reduce((sum, b) => {
      return sum + (b.pricing?.totalPrice || 0);
    }, 0);

    const totalPaid = approvedBookings.reduce((sum, b) => {
      return sum + (b.bookingDetails?.totalPaidAmount || 0);
    }, 0);

    const totalRemaining = approvedBookings.reduce((sum, b) => {
      return sum + (b.bookingDetails?.remainingAmount || 0);
    }, 0);

    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    let upcomingPayments = 0;
    approvedBookings.forEach(b => {
      if (b.bookingDetails?.paymentSchedule) {
        b.bookingDetails.paymentSchedule.forEach(inst => {
          if (inst.status !== "paid" && new Date(inst.dueDate) <= nextMonth) {
            upcomingPayments += inst.amount - (inst.paidAmount || 0);
          }
        });
      }
    });

    setSummary({
      totalPlots: approvedBookings.length,
      totalInvested,
      totalPaid,
      totalRemaining,
      upcomingPayments
    });
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchMyBookings();
    }
  }, [authLoading, user]);

  // Open payment modal
  const openPaymentModal = (booking, installment) => {
    setSelectedBooking(booking);
    setPaymentForm({
      installmentNumber: installment.installmentNumber,
      amount: installment.amount - (installment.paidAmount || 0),
      paymentMode: "upi",
      transactionId: "",
      notes: ""
    });
    setPaymentModalOpen(true);
    setResponse(null);
  };

  // Handle payment submission
  const handlePayment = async () => {
    if (!selectedBooking || paymentForm.installmentNumber === null) return;
    setPaymentLoading(true);
    setResponse(null);

    try {
      const { data } = await apiClient.post("/user/plots/payment", {
        plotId: selectedBooking._id,
        installmentNumber: paymentForm.installmentNumber,
        amount: parseFloat(paymentForm.amount),
        paymentMode: paymentForm.paymentMode,
        transactionId: paymentForm.transactionId,
        notes: paymentForm.notes
      });

      setResponse({ 
        success: true, 
        message: "Payment recorded successfully! Awaiting verification." 
      });
      
      // Refresh bookings
      fetchMyBookings();
      
      setTimeout(() => {
        setPaymentModalOpen(false);
        setResponse(null);
      }, 2000);
    } catch (error) {
      setResponse({
        success: false,
        message: error.response?.data?.message || "Payment failed"
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
      approved: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle2 },
      rejected: { color: "bg-red-100 text-red-800 border-red-200", icon: AlertCircle },
    };
    const config = configs[status] || configs.pending;
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const getInstallmentStatus = (installment) => {
    if (installment.status === "paid") {
      return <Badge className="bg-green-500">Paid</Badge>;
    }
    if (installment.status === "partial") {
      return <Badge className="bg-blue-500">Partial</Badge>;
    }
    if (new Date(installment.dueDate) < new Date() && installment.status !== "paid") {
      return <Badge className="bg-red-500">Overdue</Badge>;
    }
    return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Pending</Badge>;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center text-gray-600 mt-20">
        Please log in to view your payments.
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Wallet className="h-8 w-8 text-blue-600" />
          My Payments
        </h1>
        <p className="text-gray-600 mt-1">Track your plot payments and upcoming EMIs</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Plots</p>
                <p className="text-2xl font-bold">{summary.totalPlots}</p>
              </div>
              <Building2 className="h-10 w-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Invested</p>
                <p className="text-2xl font-bold">₹{(summary.totalInvested / 100000).toFixed(1)}L</p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Paid</p>
                <p className="text-2xl font-bold">₹{(summary.totalPaid / 100000).toFixed(1)}L</p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Remaining</p>
                <p className="text-2xl font-bold">₹{(summary.totalRemaining / 100000).toFixed(1)}L</p>
              </div>
              <IndianRupee className="h-10 w-10 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Due This Month</p>
                <p className="text-2xl font-bold">₹{summary.upcomingPayments.toLocaleString()}</p>
              </div>
              <Calendar className="h-10 w-10 text-red-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings List */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            My Booked Plots & Payments
          </CardTitle>
          <CardDescription>
            Click on a plot to view payment schedule and make payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
            </div>
          ) : myBookings.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No bookings found</p>
              <p className="text-sm">Book a plot to see your payment details here</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-4">
              {myBookings.map((booking) => (
                <AccordionItem
                  key={booking._id}
                  value={booking._id}
                  className="border rounded-lg px-4 bg-white shadow-sm"
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <MapPin className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-gray-800">
                            {booking.plotName} - {booking.plotNumber}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {booking.siteLocation?.siteName}, {booking.siteLocation?.address?.city}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {getStatusBadge(booking.bookingDetails?.status)}
                        {booking.bookingDetails?.status === "approved" && (
                          <div className="text-right hidden md:block">
                            <p className="text-sm text-gray-500">Progress</p>
                            <div className="flex items-center gap-2">
                              <Progress 
                                value={booking.bookingDetails?.paymentProgress || 0} 
                                className="w-24 h-2"
                              />
                              <span className="text-sm font-medium">
                                {booking.bookingDetails?.paymentProgress || 0}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    {booking.bookingDetails?.status === "pending" ? (
                      <Alert className="bg-yellow-50 border-yellow-200">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-800">
                          Your booking is pending admin approval. Payment details will be available after approval.
                        </AlertDescription>
                      </Alert>
                    ) : booking.bookingDetails?.status === "rejected" ? (
                      <Alert className="bg-red-50 border-red-200">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          This booking was rejected. Please contact support for more information.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="space-y-4">
                        {/* Payment Summary */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm text-gray-500">Payment Type</p>
                            <p className="font-semibold">
                              {booking.bookingDetails?.paymentType === "installment" 
                                ? "Installments" 
                                : "Full Payment"
                              }
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Total Amount</p>
                            <p className="font-semibold">
                              ₹{(booking.pricing?.totalPrice || 0).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Paid Amount</p>
                            <p className="font-semibold text-green-600">
                              ₹{(booking.bookingDetails?.totalPaidAmount || 0).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Remaining</p>
                            <p className="font-semibold text-orange-600">
                              ₹{(booking.bookingDetails?.remainingAmount || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Installment Plan Info */}
                        {booking.bookingDetails?.paymentType === "installment" && 
                         booking.bookingDetails?.selectedPlan && (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium text-blue-800">
                              Plan: {booking.bookingDetails.selectedPlan.planName} | 
                              {" "}EMI: ₹{booking.bookingDetails.selectedPlan.emiAmount?.toLocaleString()}/month
                            </p>
                          </div>
                        )}

                        {/* Payment Schedule Table */}
                        {booking.bookingDetails?.paymentSchedule?.length > 0 && (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Installment</TableHead>
                                  <TableHead>Due Date</TableHead>
                                  <TableHead>Amount</TableHead>
                                  <TableHead>Paid</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {booking.bookingDetails.paymentSchedule.map((installment, idx) => (
                                  <TableRow 
                                    key={idx}
                                    className={
                                      installment.status === "paid" 
                                        ? "bg-green-50" 
                                        : new Date(installment.dueDate) < new Date() 
                                          ? "bg-red-50" 
                                          : ""
                                    }
                                  >
                                    <TableCell>
                                      {installment.installmentNumber === 0 
                                        ? "Down Payment" 
                                        : `EMI ${installment.installmentNumber}`
                                      }
                                    </TableCell>
                                    <TableCell>{formatDate(installment.dueDate)}</TableCell>
                                    <TableCell>₹{(installment.amount || 0).toLocaleString()}</TableCell>
                                    <TableCell>
                                      ₹{(installment.paidAmount || 0).toLocaleString()}
                                    </TableCell>
                                    <TableCell>{getInstallmentStatus(installment)}</TableCell>
                                    <TableCell className="text-right">
                                      {installment.status !== "paid" ? (
                                        <Button
                                          size="sm"
                                          onClick={() => openPaymentModal(booking, installment)}
                                        >
                                          <CreditCard className="h-4 w-4 mr-1" />
                                          Pay
                                        </Button>
                                      ) : (
                                        <span className="text-green-600 text-sm flex items-center justify-end gap-1">
                                          <CheckCircle2 className="h-4 w-4" />
                                          Paid on {formatDate(installment.paidDate)}
                                        </span>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}

                        {/* Next Due Date Alert */}
                        {booking.bookingDetails?.nextDueDate && (
                          <Alert className="bg-orange-50 border-orange-200">
                            <Calendar className="h-4 w-4 text-orange-600" />
                            <AlertDescription className="text-orange-800">
                              Next payment due: <strong>{formatDate(booking.bookingDetails.nextDueDate)}</strong>
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Payment Modal */}
      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Make Payment
            </DialogTitle>
          </DialogHeader>

          {response && (
            <Alert className={response.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
              <AlertDescription className={response.success ? "text-green-800" : "text-red-800"}>
                {response.message}
              </AlertDescription>
            </Alert>
          )}

          {selectedBooking && (
            <div className="space-y-4 py-2">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Plot</p>
                <p className="font-semibold">
                  {selectedBooking.plotName} - {selectedBooking.plotNumber}
                </p>
              </div>

              <div>
                <Label>Installment</Label>
                <p className="text-lg font-semibold mt-1">
                  {paymentForm.installmentNumber === 0 
                    ? "Down Payment" 
                    : `EMI ${paymentForm.installmentNumber}`
                  }
                </p>
              </div>

              <div>
                <Label>Amount (₹)</Label>
                <Input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                />
              </div>

              <div>
                <Label>Payment Mode</Label>
                <Select
                  value={paymentForm.paymentMode}
                  onValueChange={(value) => setPaymentForm({ ...paymentForm, paymentMode: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="neft">NEFT</SelectItem>
                    <SelectItem value="rtgs">RTGS</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="dd">DD</SelectItem>
                    <SelectItem value="online">Online Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Transaction ID / Reference</Label>
                <Input
                  placeholder="Enter transaction reference"
                  value={paymentForm.transactionId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                />
              </div>

              <div>
                <Label>Notes (Optional)</Label>
                <Input
                  placeholder="Any additional notes"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                />
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  Payment will be verified by admin. Keep your transaction proof handy.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePayment} disabled={paymentLoading}>
              {paymentLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CreditCard className="h-4 w-4 mr-2" />
              )}
              Submit Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentTracker;
