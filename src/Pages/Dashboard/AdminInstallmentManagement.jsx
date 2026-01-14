// AdminInstallmentManagement.jsx - Admin page for managing installments, downpayments, and price visibility
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  Settings,
  Eye,
  EyeOff,
  Percent,
  CreditCard,
  Receipt,
  Save,
  RefreshCw,
  Building2,
  MapPin,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  Plus
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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

const AdminInstallmentManagement = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [plots, setPlots] = useState([]);
  const [bookedPlots, setBookedPlots] = useState([]);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [activeTab, setActiveTab] = useState("installment-settings");
  
  // Modals
  const [installmentModalOpen, setInstallmentModalOpen] = useState(false);
  const [visibilityModalOpen, setVisibilityModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [bulkVisibilityModalOpen, setBulkVisibilityModalOpen] = useState(false);
  
  // Form states
  const [installmentForm, setInstallmentForm] = useState({
    enabled: true,
    minDownPaymentPercent: 20,
    maxInstallments: 12,
    installmentInterestRate: 0,
    plans: [
      { name: "3 Months", months: 3, interestRate: 0 },
      { name: "6 Months", months: 6, interestRate: 2 },
      { name: "12 Months", months: 12, interestRate: 5 }
    ]
  });
  
  const [visibilityForm, setVisibilityForm] = useState({
    showPriceToUser: true,
    showBasePrice: true,
    showTotalPrice: true,
    showPricePerUnit: true,
    showInstallmentPrices: true
  });

  const [manualPaymentForm, setManualPaymentForm] = useState({
    installmentNumber: 0,
    amount: 0,
    paymentMode: "cash",
    transactionId: "",
    notes: ""
  });

  const [bulkVisibility, setBulkVisibility] = useState({
    showPriceToUser: true,
    plotIds: []
  });

  const [filters, setFilters] = useState({
    city: "",
    status: ""
  });

  const [actionMessage, setActionMessage] = useState(null);

  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
  });

  // Fetch all plots
  const fetchPlots = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/admin/plots", {
        params: { limit: 1000 }
      });
      setPlots(data.data.plots || []);
    } catch (err) {
      console.error("Error fetching plots:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch booked plots with payment details
  const fetchBookedPlots = async () => {
    try {
      const { data } = await apiClient.get("/admin/plots/bookings");
      setBookedPlots(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error("Error fetching booked plots:", err);
      setBookedPlots([]);
    }
  };

  useEffect(() => {
    if (!authLoading && user && user.role === "admin") {
      fetchPlots();
      fetchBookedPlots();
    }
  }, [authLoading, user]);

  const formatCurrency = (amount) => {
    if (!amount) return "₹0";
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return `₹${amount.toLocaleString()}`;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  // Open installment settings modal
  const openInstallmentModal = (plot) => {
    setSelectedPlot(plot);
    setInstallmentForm({
      enabled: plot.installmentPlan?.enabled ?? true,
      minDownPaymentPercent: plot.installmentPlan?.minDownPaymentPercent ?? 20,
      maxInstallments: plot.installmentPlan?.maxInstallments ?? 12,
      installmentInterestRate: plot.installmentPlan?.installmentInterestRate ?? 0,
      plans: plot.installmentPlan?.plans?.length > 0 
        ? plot.installmentPlan.plans 
        : [
            { name: "3 Months", months: 3, interestRate: 0 },
            { name: "6 Months", months: 6, interestRate: 2 },
            { name: "12 Months", months: 12, interestRate: 5 }
          ]
    });
    setInstallmentModalOpen(true);
  };

  // Open visibility settings modal
  const openVisibilityModal = (plot) => {
    setSelectedPlot(plot);
    setVisibilityForm({
      showPriceToUser: plot.pricing?.showPriceToUser ?? true,
      showBasePrice: plot.pricing?.showBasePrice ?? true,
      showTotalPrice: plot.pricing?.showTotalPrice ?? true,
      showPricePerUnit: plot.pricing?.showPricePerUnit ?? true,
      showInstallmentPrices: plot.pricing?.showInstallmentPrices ?? true
    });
    setVisibilityModalOpen(true);
  };

  // Open manual payment modal
  const openPaymentModal = (plot) => {
    setSelectedPlot(plot);
    const nextInstallment = plot.bookingDetails?.paymentSchedule?.find(
      s => s.status !== "paid"
    );
    setManualPaymentForm({
      installmentNumber: nextInstallment?.installmentNumber ?? 1,
      amount: nextInstallment?.amount ?? 0,
      paymentMode: "cash",
      transactionId: "",
      notes: ""
    });
    setPaymentModalOpen(true);
  };

  // Save installment settings
  const saveInstallmentSettings = async () => {
    try {
      await apiClient.put(`/admin/plots/${selectedPlot._id}/installment-plan`, installmentForm);
      setActionMessage({ type: "success", text: "Installment settings saved successfully!" });
      setInstallmentModalOpen(false);
      fetchPlots();
    } catch (err) {
      setActionMessage({ type: "error", text: err.response?.data?.message || "Failed to save settings" });
    }
  };

  // Save visibility settings
  const saveVisibilitySettings = async () => {
    try {
      await apiClient.put(`/admin/plots/${selectedPlot._id}/visibility`, visibilityForm);
      setActionMessage({ type: "success", text: "Visibility settings saved successfully!" });
      setVisibilityModalOpen(false);
      fetchPlots();
    } catch (err) {
      setActionMessage({ type: "error", text: err.response?.data?.message || "Failed to save settings" });
    }
  };

  // Add installment plan
  const addPlan = () => {
    setInstallmentForm({
      ...installmentForm,
      plans: [...installmentForm.plans, { name: "", months: 0, interestRate: 0 }]
    });
  };

  // Remove installment plan
  const removePlan = (index) => {
    const newPlans = installmentForm.plans.filter((_, i) => i !== index);
    setInstallmentForm({ ...installmentForm, plans: newPlans });
  };

  // Update plan
  const updatePlan = (index, field, value) => {
    const newPlans = [...installmentForm.plans];
    newPlans[index][field] = field === "name" ? value : Number(value);
    setInstallmentForm({ ...installmentForm, plans: newPlans });
  };

  // Process manual payment
  const processManualPayment = async () => {
    try {
      await apiClient.post(`/user/plots/${selectedPlot._id}/payment`, {
        amount: manualPaymentForm.amount,
        paymentMode: manualPaymentForm.paymentMode,
        transactionId: manualPaymentForm.transactionId || `ADMIN-${Date.now()}`,
        notes: manualPaymentForm.notes
      });
      setActionMessage({ type: "success", text: "Payment recorded successfully!" });
      setPaymentModalOpen(false);
      fetchBookedPlots();
    } catch (err) {
      setActionMessage({ type: "error", text: err.response?.data?.message || "Failed to record payment" });
    }
  };

  // Bulk update visibility
  const saveBulkVisibility = async () => {
    try {
      await apiClient.put("/admin/plots/bulk-visibility", bulkVisibility);
      setActionMessage({ type: "success", text: "Bulk visibility updated!" });
      setBulkVisibilityModalOpen(false);
      fetchPlots();
    } catch (err) {
      setActionMessage({ type: "error", text: err.response?.data?.message || "Failed to update" });
    }
  };

  const getFilteredPlots = () => {
    return plots.filter(plot => {
      if (filters.city && plot.siteLocation?.address?.city !== filters.city) return false;
      if (filters.status && plot.status !== filters.status) return false;
      return true;
    });
  };

  const cities = [...new Set(plots.map(p => p.siteLocation?.address?.city).filter(Boolean))];

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

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Settings className="h-8 w-8 text-blue-600" />
            Installment & Price Management
          </h1>
          <p className="text-gray-600 mt-1">Manage installment plans, down payments, and price visibility</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setBulkVisibilityModalOpen(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Bulk Visibility
          </Button>
          <Button variant="outline" onClick={() => { fetchPlots(); fetchBookedPlots(); }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Action Message */}
      {actionMessage && (
        <Alert className={`mb-4 ${actionMessage.type === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
          <AlertDescription className={actionMessage.type === "success" ? "text-green-800" : "text-red-800"}>
            {actionMessage.text}
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="installment-settings">
            <CreditCard className="h-4 w-4 mr-2" />
            Installment
          </TabsTrigger>
          <TabsTrigger value="visibility">
            <Eye className="h-4 w-4 mr-2" />
            Visibility
          </TabsTrigger>
          <TabsTrigger value="payments">
            <Receipt className="h-4 w-4 mr-2" />
            Payments
          </TabsTrigger>
        </TabsList>

        {/* Installment Settings Tab */}
        <TabsContent value="installment-settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Plot Installment Plans
              </CardTitle>
              <CardDescription>
                Configure installment options, down payment percentages, and payment plans for each plot
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex gap-4 mb-4">
                <Select value={filters.city || undefined} onValueChange={(v) => setFilters({ ...filters, city: v })}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Cities" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filters.status || undefined} onValueChange={(v) => setFilters({ ...filters, status: v })}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="booked">Booked</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plot</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Installment</TableHead>
                      <TableHead>Down Payment</TableHead>
                      <TableHead>Plans</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredPlots().map((plot) => (
                      <TableRow key={plot._id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{plot.plotNumber}</p>
                            <p className="text-xs text-gray-500">{plot.plotName}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3" />
                            {plot.siteLocation?.siteName}, {plot.siteLocation?.address?.city}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(plot.pricing?.totalPrice)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={plot.installmentPlan?.enabled ? "default" : "secondary"}>
                            {plot.installmentPlan?.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {plot.installmentPlan?.minDownPaymentPercent || 20}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {plot.installmentPlan?.plans?.length || 0} plans
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" onClick={() => openInstallmentModal(plot)}>
                            <Settings className="h-4 w-4 mr-1" />
                            Configure
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Visibility Settings Tab */}
        <TabsContent value="visibility">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Price Visibility Settings
              </CardTitle>
              <CardDescription>
                Control which price information is shown to users for each plot
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plot</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Show Price</TableHead>
                      <TableHead>Base Price</TableHead>
                      <TableHead>Total Price</TableHead>
                      <TableHead>Per Unit</TableHead>
                      <TableHead>Installment</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredPlots().map((plot) => (
                      <TableRow key={plot._id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{plot.plotNumber}</p>
                            <p className="text-xs text-gray-500">{plot.plotName}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {plot.siteLocation?.siteName}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(plot.pricing?.totalPrice)}
                        </TableCell>
                        <TableCell>
                          {plot.pricing?.showPriceToUser !== false ? (
                            <Eye className="h-4 w-4 text-green-600" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-red-500" />
                          )}
                        </TableCell>
                        <TableCell>
                          {plot.pricing?.showBasePrice !== false ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-gray-400" />
                          )}
                        </TableCell>
                        <TableCell>
                          {plot.pricing?.showTotalPrice !== false ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-gray-400" />
                          )}
                        </TableCell>
                        <TableCell>
                          {plot.pricing?.showPricePerUnit !== false ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-gray-400" />
                          )}
                        </TableCell>
                        <TableCell>
                          {plot.pricing?.showInstallmentPrices !== false ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-gray-400" />
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => openVisibilityModal(plot)}>
                            <Eye className="h-4 w-4 mr-1" />
                            Settings
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Tracking Tab */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Payment Tracking & Manual Entry
              </CardTitle>
              <CardDescription>
                Track all installment payments and manually record offline payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!bookedPlots || bookedPlots.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <Receipt className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>No booked plots with installment payments</p>
                </div>
              ) : (
                <Accordion type="single" collapsible className="space-y-2">
                  {(Array.isArray(bookedPlots) ? bookedPlots : [])
                    .filter(p => p.bookingDetails?.paymentType === "installment")
                    .map((plot) => (
                    <AccordionItem key={plot._id} value={plot._id} className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center gap-4">
                            <div className="text-left">
                              <p className="font-semibold">{plot.plotNumber} - {plot.plotName}</p>
                              <p className="text-xs text-gray-500">
                                Buyer: {plot.bookingDetails?.buyerId?.personalInfo?.firstName || "N/A"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {formatCurrency(plot.bookingDetails?.totalPaidAmount || 0)} / {formatCurrency(plot.pricing?.totalPrice)}
                              </p>
                              <Progress 
                                value={plot.bookingDetails?.paymentProgress || 0} 
                                className="w-32 h-2 mt-1"
                              />
                            </div>
                            <Badge className={
                              (plot.bookingDetails?.paymentProgress || 0) >= 100 
                                ? "bg-green-500" 
                                : "bg-orange-500"
                            }>
                              {plot.bookingDetails?.paymentProgress || 0}%
                            </Badge>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pt-4 space-y-4">
                          {/* Payment Schedule Table */}
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Installment</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Paid</TableHead>
                                <TableHead>Mode</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {(plot.bookingDetails?.paymentSchedule || []).map((inst, idx) => (
                                <TableRow key={idx} className={
                                  inst.status === "paid" ? "bg-green-50" :
                                  new Date(inst.dueDate) < new Date() ? "bg-red-50" : ""
                                }>
                                  <TableCell>
                                    {inst.installmentNumber === 0 ? "Down Payment" : `EMI ${inst.installmentNumber}`}
                                  </TableCell>
                                  <TableCell>{formatDate(inst.dueDate)}</TableCell>
                                  <TableCell>{formatCurrency(inst.amount)}</TableCell>
                                  <TableCell>{formatCurrency(inst.paidAmount || 0)}</TableCell>
                                  <TableCell className="uppercase text-xs">{inst.paymentMode || "-"}</TableCell>
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
                          
                          <div className="flex justify-end">
                            <Button onClick={() => openPaymentModal(plot)}>
                              <Plus className="h-4 w-4 mr-2" />
                              Record Payment
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Installment Settings Modal */}
      <Dialog open={installmentModalOpen} onOpenChange={setInstallmentModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Installment Settings: {selectedPlot?.plotNumber}
            </DialogTitle>
            <DialogDescription>
              Configure installment options for this plot
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Enable Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-base font-medium">Enable Installments</Label>
                <p className="text-sm text-gray-500">Allow buyers to pay in installments</p>
              </div>
              <Switch
                checked={installmentForm.enabled}
                onCheckedChange={(checked) => setInstallmentForm({ ...installmentForm, enabled: checked })}
              />
            </div>

            {installmentForm.enabled && (
              <>
                {/* Down Payment Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Minimum Down Payment (%)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="5"
                        max="100"
                        value={installmentForm.minDownPaymentPercent}
                        onChange={(e) => setInstallmentForm({ 
                          ...installmentForm, 
                          minDownPaymentPercent: Number(e.target.value) 
                        })}
                      />
                      <Percent className="h-4 w-4 text-gray-500" />
                    </div>
                    <p className="text-xs text-gray-500">
                      Min: {formatCurrency((selectedPlot?.pricing?.totalPrice || 0) * installmentForm.minDownPaymentPercent / 100)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Max Installments</Label>
                    <Input
                      type="number"
                      min="2"
                      max="60"
                      value={installmentForm.maxInstallments}
                      onChange={(e) => setInstallmentForm({ 
                        ...installmentForm, 
                        maxInstallments: Number(e.target.value) 
                      })}
                    />
                  </div>
                </div>

                {/* Interest Rate */}
                <div className="space-y-2">
                  <Label>Default Interest Rate (%)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="50"
                      step="0.5"
                      value={installmentForm.installmentInterestRate}
                      onChange={(e) => setInstallmentForm({ 
                        ...installmentForm, 
                        installmentInterestRate: Number(e.target.value) 
                      })}
                      className="w-32"
                    />
                    <Percent className="h-4 w-4 text-gray-500" />
                  </div>
                </div>

                {/* Payment Plans */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Payment Plans</Label>
                    <Button size="sm" variant="outline" onClick={addPlan}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Plan
                    </Button>
                  </div>
                  
                  {installmentForm.plans.map((plan, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="flex-1">
                        <Label className="text-xs">Plan Name</Label>
                        <Input
                          value={plan.name}
                          onChange={(e) => updatePlan(idx, "name", e.target.value)}
                          placeholder="e.g., 6 Months"
                        />
                      </div>
                      <div className="w-24">
                        <Label className="text-xs">Months</Label>
                        <Input
                          type="number"
                          value={plan.months}
                          onChange={(e) => updatePlan(idx, "months", e.target.value)}
                        />
                      </div>
                      <div className="w-24">
                        <Label className="text-xs">Interest %</Label>
                        <Input
                          type="number"
                          step="0.5"
                          value={plan.interestRate}
                          onChange={(e) => updatePlan(idx, "interestRate", e.target.value)}
                        />
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-red-500 mt-4"
                        onClick={() => removePlan(idx)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setInstallmentModalOpen(false)}>Cancel</Button>
            <Button onClick={saveInstallmentSettings}>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Visibility Settings Modal */}
      <Dialog open={visibilityModalOpen} onOpenChange={setVisibilityModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              Price Visibility: {selectedPlot?.plotNumber}
            </DialogTitle>
            <DialogDescription>
              Control what pricing information users can see
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <Label className="font-medium">Show All Prices</Label>
                <p className="text-sm text-gray-500">Master toggle for all price visibility</p>
              </div>
              <Switch
                checked={visibilityForm.showPriceToUser}
                onCheckedChange={(checked) => setVisibilityForm({ ...visibilityForm, showPriceToUser: checked })}
              />
            </div>

            {visibilityForm.showPriceToUser && (
              <>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label>Show Base Price</Label>
                    <p className="text-xs text-gray-500">Price per sq.ft./sq.meter</p>
                  </div>
                  <Switch
                    checked={visibilityForm.showBasePrice}
                    onCheckedChange={(checked) => setVisibilityForm({ ...visibilityForm, showBasePrice: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label>Show Total Price</Label>
                    <p className="text-xs text-gray-500">Complete plot price</p>
                  </div>
                  <Switch
                    checked={visibilityForm.showTotalPrice}
                    onCheckedChange={(checked) => setVisibilityForm({ ...visibilityForm, showTotalPrice: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label>Show Price Per Unit</Label>
                    <p className="text-xs text-gray-500">Calculated unit price</p>
                  </div>
                  <Switch
                    checked={visibilityForm.showPricePerUnit}
                    onCheckedChange={(checked) => setVisibilityForm({ ...visibilityForm, showPricePerUnit: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label>Show Installment Prices</Label>
                    <p className="text-xs text-gray-500">Show EMI breakdown amounts</p>
                  </div>
                  <Switch
                    checked={visibilityForm.showInstallmentPrices}
                    onCheckedChange={(checked) => setVisibilityForm({ ...visibilityForm, showInstallmentPrices: checked })}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setVisibilityModalOpen(false)}>Cancel</Button>
            <Button onClick={saveVisibilitySettings}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Payment Modal */}
      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-green-600" />
              Record Payment: {selectedPlot?.plotNumber}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm">
                <span className="font-medium">Remaining:</span>{" "}
                {formatCurrency(selectedPlot?.bookingDetails?.remainingAmount || 0)}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Payment Amount</Label>
              <div className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-gray-500" />
                <Input
                  type="number"
                  value={manualPaymentForm.amount}
                  onChange={(e) => setManualPaymentForm({ ...manualPaymentForm, amount: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Payment Mode</Label>
              <Select
                value={manualPaymentForm.paymentMode}
                onValueChange={(value) => setManualPaymentForm({ ...manualPaymentForm, paymentMode: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Transaction ID / Reference</Label>
              <Input
                value={manualPaymentForm.transactionId}
                onChange={(e) => setManualPaymentForm({ ...manualPaymentForm, transactionId: e.target.value })}
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                value={manualPaymentForm.notes}
                onChange={(e) => setManualPaymentForm({ ...manualPaymentForm, notes: e.target.value })}
                placeholder="Optional notes"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentModalOpen(false)}>Cancel</Button>
            <Button onClick={processManualPayment} className="bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Visibility Modal */}
      <Dialog open={bulkVisibilityModalOpen} onOpenChange={setBulkVisibilityModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Update Price Visibility</DialogTitle>
            <DialogDescription>
              Select plots and update their price visibility at once
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <Label>Show Prices to Users:</Label>
              <Switch
                checked={bulkVisibility.showPriceToUser}
                onCheckedChange={(checked) => setBulkVisibility({ ...bulkVisibility, showPriceToUser: checked })}
              />
              <span className="text-sm text-gray-600">
                {bulkVisibility.showPriceToUser ? "Visible" : "Hidden"}
              </span>
            </div>

            <div className="space-y-2">
              <Label>Select Plots ({bulkVisibility.plotIds.length} selected)</Label>
              <div className="max-h-60 overflow-y-auto border rounded-lg p-2 space-y-1">
                {plots.map((plot) => (
                  <div key={plot._id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      checked={bulkVisibility.plotIds.includes(plot._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setBulkVisibility({ 
                            ...bulkVisibility, 
                            plotIds: [...bulkVisibility.plotIds, plot._id] 
                          });
                        } else {
                          setBulkVisibility({ 
                            ...bulkVisibility, 
                            plotIds: bulkVisibility.plotIds.filter(id => id !== plot._id) 
                          });
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{plot.plotNumber} - {plot.plotName}</span>
                    <span className="text-xs text-gray-500 ml-auto">
                      {plot.siteLocation?.siteName}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setBulkVisibility({ ...bulkVisibility, plotIds: plots.map(p => p._id) })}
                >
                  Select All
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setBulkVisibility({ ...bulkVisibility, plotIds: [] })}
                >
                  Clear All
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkVisibilityModalOpen(false)}>Cancel</Button>
            <Button onClick={saveBulkVisibility} disabled={bulkVisibility.plotIds.length === 0}>
              Update {bulkVisibility.plotIds.length} Plots
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminInstallmentManagement;
