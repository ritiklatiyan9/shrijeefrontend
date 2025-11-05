// components/RightTeamBookings.js (Updated)

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, MapPin, IndianRupee, Calendar, FileDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const API_BASE_URL = "https://shreejeebackend.onrender.com/api/v1/plots";

const RightTeamBookings = () => {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
  });

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

  const formatCurrencyNoSymbol = (amount) => {
    return 'Rs. ' + (amount || 0).toLocaleString('en-IN');
  };

  const handleShowPaymentDetails = (plot) => {
    setSelectedPlot(plot);
    setIsModalOpen(true);
  };

  const handleDownloadPDF = () => {
    if (!selectedPlot) return;

    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.width;
    let y = 20;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(30, 144, 255); // Dodger Blue
    doc.setFont(undefined, 'bold');
    doc.text("PLOT BOOKING RECEIPT", pageWidth / 2, y, { align: "center" });

    y += 10;

    // Subtitle
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.setFont(undefined, 'normal');
    doc.text("Real Estate Transaction Details", pageWidth / 2, y, { align: "center" });

    y += 15;

    // Company Info Placeholder (if you have one)
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text("Real Estate Solutions Pvt. Ltd.", pageWidth / 2, y, { align: "center" });
    y += 5;
    doc.text("123 Business Park, Mumbai - 400001", pageWidth / 2, y, { align: "center" });
    y += 5;
    doc.text("Phone: +91 9876543210 | Email: info@resale.com", pageWidth / 2, y, { align: "center" });

    y += 15;

    // Buyer and Plot Details
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.setFont(undefined, 'bold');
    doc.text("Booking Information", 20, y);

    y += 8;

    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(50, 50, 50);

    // Grid of details
    const details = [
      { label: "Buyer Name", value: `${selectedPlot.bookingDetails?.buyerId?.personalInfo?.firstName || ""} ${selectedPlot.bookingDetails?.buyerId?.personalInfo?.lastName || ""}` },
      { label: "Member ID", value: selectedPlot.bookingDetails?.buyerId?.memberId || "N/A" },
      { label: "Project", value: selectedPlot.siteLocation?.siteName || "N/A" },
      { label: "Plot Number", value: selectedPlot.plotNumber || "N/A" },
      { label: "Plot Type", value: selectedPlot.features?.facing || "N/A" },
      { label: "Booking Date", value: formatDate(selectedPlot.bookingDetails?.bookingDate) },
    ];

    const colWidth = (pageWidth - 40) / 2;
    details.forEach((detail, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      const x = 20 + col * colWidth;
      const yPos = y + (row * 8);

      doc.setFont(undefined, 'bold');
      doc.text(detail.label + ":", x, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(detail.value, x + 35, yPos);
    });

    // Calculate the height used by the details
    const rowsUsed = Math.ceil(details.length / 2);
    y += (rowsUsed * 8) + 10;

    // Price Details
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.setFont(undefined, 'bold');
    doc.text("Financial Summary", 20, y);

    y += 8;

    const priceDetails = [
      { label: "Base Rate", value: formatCurrencyNoSymbol(selectedPlot.pricing?.basePrice) },
      { label: "Total Area", value: `${selectedPlot.size?.value} ${selectedPlot.size?.unit}` },
      { label: "Total Price", value: formatCurrencyNoSymbol(selectedPlot.pricing?.totalPrice) },
      { label: "Paid Amount", value: formatCurrencyNoSymbol(selectedPlot.bookingDetails?.totalPaidAmount) },
      { label: "Balance Due", value: formatCurrencyNoSymbol(
        (selectedPlot.pricing?.totalPrice || 0) - (selectedPlot.bookingDetails?.totalPaidAmount || 0)
      ) },
    ];

    priceDetails.forEach((detail, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      const x = 20 + col * colWidth;
      const yPos = y + (row * 8);

      doc.setFont(undefined, 'bold');
      doc.text(detail.label + ":", x, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(detail.value, x + 40, yPos);
    });

    const priceRowsUsed = Math.ceil(priceDetails.length / 2);
    y += (priceRowsUsed * 8) + 15;

    // Payment Schedule Table
    const paymentSchedule = selectedPlot.bookingDetails?.paymentSchedule?.map((p, i) => [
      (i + 1).toString(),
      formatDate(p.paidDate),
      formatCurrencyNoSymbol(p.amount),
      p.receiptNo || "N/A",
      p.paymentMode?.toUpperCase() || "CASH",
      p.transactionId || "N/A",
      formatDate(p.transactionDate),
      p.notes || "N/A",
    ]) || [];

    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.setFont(undefined, 'bold');
    doc.text("Payment Schedule", 20, y);

    y += 8;

    autoTable(doc, {
      startY: y,
      head: [
        [
          "S.No",
          "Payment Date",
          "Amount",
          "Receipt No",
          "Mode",
          "Txn ID",
          "Txn Date",
          "Notes",
        ],
      ],
      body: paymentSchedule,
      styles: { 
        fontSize: 10,
        cellPadding: 5,
      },
      headStyles: { 
        fillColor: [30, 144, 255], // Dodger Blue
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      theme: "grid",
    });

    y = doc.lastAutoTable.finalY + 10;

    // Total Paid
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(
      "Total Paid: " + formatCurrencyNoSymbol(
        selectedPlot.bookingDetails?.totalPaidAmount || 0
      ),
      20,
      y
    );

    // Footer
    y += 20;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont(undefined, 'italic');
    doc.text(
      "This is a system-generated receipt. Thank you for your payment!",
      pageWidth / 2,
      y,
      { align: "center" }
    );

    y += 8;
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text(
      "For any queries, contact our support team.",
      pageWidth / 2,
      y,
      { align: "center" }
    );

    // Add a decorative line
    doc.setDrawColor(30, 144, 255);
    doc.setLineWidth(0.5);
    doc.line(20, y + 5, pageWidth - 20, y + 5);

    doc.save(`${selectedPlot.plotName || "plot"}_receipt.pdf`);
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
                    <TableHead>Token Paid</TableHead>
                    <TableHead>Booking Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Details</TableHead> {/* Added column for payment details */}
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
                        {formatCurrency(plot.bookingDetails?.tokenAmount || 0)}
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
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => handleShowPaymentDetails(plot)}
                        >
                          Details
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

      {/* Modal for Payment Details */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader className="flex justify-between items-center">
            <DialogTitle>Payment Details for {selectedPlot?.plotName || "Plot"}</DialogTitle>
            {selectedPlot && (
              <Button
                size="sm"
                className="flex items-center gap-2"
                onClick={handleDownloadPDF}
              >
                <FileDown className="h-4 w-4" /> Download Receipt
              </Button>
            )}
          </DialogHeader>
          {selectedPlot && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Associate ID:</Label>
                  <p className="text-sm">{selectedPlot.bookingDetails?.buyerId?.memberId || "N/A"}</p>
                </div>
                <div>
                  <Label>Name:</Label>
                  <p className="text-sm">
                    {selectedPlot.bookingDetails?.buyerId?.personalInfo?.firstName || ""}{" "}
                    {selectedPlot.bookingDetails?.buyerId?.personalInfo?.lastName || ""}
                  </p>
                </div>
                <div>
                  <Label>Project:</Label>
                  <p className="text-sm">{selectedPlot.siteLocation?.siteName || "N/A"}</p>
                </div>
                <div>
                  <Label>Plot Type:</Label>
                  <p className="text-sm">{selectedPlot.features?.facing || "N/A"}</p>
                </div>
                <div>
                  <Label>Plot No.:</Label>
                  <p className="text-sm">{selectedPlot.plotNumber || "N/A"}</p>
                </div>
                <div>
                  <Label>Rate:</Label>
                  <p className="text-sm">{formatCurrencyNoSymbol(selectedPlot.pricing?.basePrice || 0)}</p>
                </div>
                <div>
                  <Label>Area:</Label>
                  <p className="text-sm">{selectedPlot.size?.value || "0"} {selectedPlot.size?.unit || "sqft"}</p>
                </div>
                <div>
                  <Label>Price:</Label>
                  <p className="text-sm">{formatCurrencyNoSymbol(selectedPlot.pricing?.totalPrice || 0)}</p>
                </div>
                <div>
                  <Label>Extra Price:</Label>
                  <p className="text-sm">{formatCurrencyNoSymbol(selectedPlot.pricing?.developmentCharges || 0)}</p>
                </div>
                <div>
                  <Label>Total Price:</Label>
                  <p className="text-sm">{formatCurrencyNoSymbol(selectedPlot.pricing?.totalPrice || 0)}</p>
                </div>
                <div>
                  <Label>Paid Amount:</Label>
                  <p className="text-sm">{formatCurrencyNoSymbol(selectedPlot.bookingDetails?.totalPaidAmount || 0)}</p>
                </div>
                <div>
                  <Label>Rest Amount:</Label>
                  <p className="text-sm">
                    {formatCurrencyNoSymbol(
                      (selectedPlot.pricing?.totalPrice || 0) - (selectedPlot.bookingDetails?.totalPaidAmount || 0)
                    )}
                  </p>
                </div>
              </div>

              {/* Payment Schedule Table */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Payment Schedule</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>S.N.</TableHead>
                      <TableHead>Payment Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Receipt No.</TableHead>
                      <TableHead>Payment Mode</TableHead>
                      <TableHead>Cheque / DD / NEFT / RTGS No.</TableHead>
                      <TableHead>Cheque / DD / NEFT / RTGS Date</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Print</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedPlot.bookingDetails?.paymentSchedule?.map((installment, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{formatDate(installment.paidDate)}</TableCell>
                        <TableCell>{formatCurrencyNoSymbol(installment.amount)}</TableCell>
                        <TableCell>{installment.receiptNo || "N/A"}</TableCell>
                        <TableCell>{installment.paymentMode?.toUpperCase() || "CASH"}</TableCell>
                        <TableCell>{installment.transactionId || "N/A"}</TableCell>
                        <TableCell>{formatDate(installment.transactionDate)}</TableCell>
                        <TableCell>{installment.notes || "N/A"}</TableCell>
                        <TableCell>
                          <Button variant="link" size="sm">Print</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={2} className="text-right font-bold">Total</TableCell>
                      <TableCell>{formatCurrencyNoSymbol(selectedPlot.bookingDetails?.totalPaidAmount || 0)}</TableCell>
                      <TableCell colSpan={6}></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RightTeamBookings;