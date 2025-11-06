import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import {
  getAllIncomeRecords,
  getDashboardStats,
  approveMatchingIncome,
  bulkApproveIncome,
  rejectMatchingIncome,
  updateIncomeStatus,
} from "../../api/matchingIncomeService";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  Eye,
  CheckCheck,
  Ban,
  AlertCircle,
  Calendar,
  Filter,
  ArrowLeftRight,
  FileText,
  Download,
} from "lucide-react";

const AdminMatchingIncomeApproval = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedRecords, setSelectedRecords] = useState(new Set());
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [actionType, setActionType] = useState(null); // 'approve', 'reject', 'updateStatus'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    status: "",
    incomeType: "",
    eligibleOnly: true,
    search: "",
  });

  useEffect(() => {
    fetchData();
    fetchStats();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllIncomeRecords({
        ...filters,
        page: 1,
        limit: 1000,
      });
      if (response.success) {
        setRecords(response.data || []);
      } else {
        setError(response.message || "Failed to fetch records");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getDashboardStats();
      if (response.success) {
        setStats(response.data || null);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const handleSelectRecord = (recordId) => {
    setSelectedRecords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(recordId)) {
        newSet.delete(recordId);
      } else {
        newSet.add(recordId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedRecords.size === eligibleRecords.length) {
      setSelectedRecords(new Set());
    } else {
      setSelectedRecords(new Set(eligibleRecords.map((r) => r._id)));
    }
  };

  const openActionModal = (type, record = null) => {
    setActionType(type);
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleApprove = async () => {
    if (!user?._id) return;
    setActionLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await approveMatchingIncome(selectedRecord._id, user._id);
      if (response.success) {
        setSuccess("Income approved successfully!");
        await fetchData();
        await fetchStats();
        setIsModalOpen(false);
        setSelectedRecord(null);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkApprove = async () => {
    if (!user?._id || selectedRecords.size === 0) return;
    setActionLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await bulkApproveIncome({
        adminId: user._id,
        recordIds: Array.from(selectedRecords),
      });
      if (response.success) {
        setSuccess(
          `Successfully approved ${response.data?.approved || selectedRecords.size} records!`
        );
        await fetchData();
        await fetchStats();
        setSelectedRecords(new Set());
        setIsModalOpen(false);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reason) => {
    if (!user?._id || !selectedRecord) return;
    setActionLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await rejectMatchingIncome(selectedRecord._id, {
        adminId: user._id,
        reason,
      });
      if (response.success) {
        setSuccess("Income rejected successfully!");
        await fetchData();
        await fetchStats();
        setIsModalOpen(false);
        setSelectedRecord(null);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus, paymentDetails) => {
    if (!selectedRecord) return;
    setActionLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await updateIncomeStatus(selectedRecord._id, {
        status: newStatus,
        paymentDetails,
      });
      if (response.success) {
        setSuccess(`Status updated to ${newStatus} successfully!`);
        await fetchData();
        await fetchStats();
        setIsModalOpen(false);
        setSelectedRecord(null);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  
  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  // Filter records
  const eligibleRecords = records.filter(
    (r) =>
      ["pending", "eligible"].includes(r.status) &&
      new Date() >= new Date(r.eligibleForApprovalDate)
  );
  const approvedRecords = records.filter((r) =>
    ["approved", "credited", "paid"].includes(r.status)
  );

  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Access Denied</strong>
            <p className="mt-1">You must be an admin to view this page.</p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading && records.length === 0) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Admin: Income Approval Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Review and approve income records for all users
          </p>
        </motion.div>

        {/* Success/Error Messages */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {success}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Cards */}
        {stats && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Eligible for Approval"
              value={stats.eligibleForApproval?.count || 0}
              subtitle={formatCurrency(stats.eligibleForApproval?.amount || 0)}
              icon={<Clock className="w-8 h-8" />}
              gradient="from-amber-500 to-orange-600"
            />
            <StatCard
              title="Approved This Month"
              value={stats.currentMonth?.approved || 0}
              subtitle={formatCurrency(stats.currentMonth?.totalIncome || 0)}
              icon={<CheckCircle2 className="w-8 h-8" />}
              gradient="from-green-500 to-emerald-600"
            />
            <StatCard
              title="Total Records"
              value={stats.overall?.totalRecords || 0}
              subtitle={formatCurrency(stats.overall?.totalIncome || 0)}
              icon={<FileText className="w-8 h-8" />}
              gradient="from-blue-500 to-indigo-600"
            />
            <StatCard
              title="Total Users"
              value={stats.overall?.uniqueUsers || 0}
              subtitle="Active participants"
              icon={<Users className="w-8 h-8" />}
              gradient="from-purple-500 to-pink-600"
            />
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="eligible">Eligible</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="credited">Credited</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Income Type</Label>
                <Select
                  value={filters.incomeType}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, incomeType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal_sale">Personal Sale</SelectItem>
                    <SelectItem value="matching_bonus">Matching Bonus</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Search</Label>
                <Input
                  placeholder="Plot number or user..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                />
              </div>

              <div className="flex items-end">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="eligibleOnly"
                    checked={filters.eligibleOnly}
                    onCheckedChange={(checked) =>
                      setFilters((prev) => ({ ...prev, eligibleOnly: checked }))
                    }
                  />
                  <Label
                    htmlFor="eligibleOnly"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Eligible Only
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedRecords.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCheck className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">
                      {selectedRecords.size} record(s) selected
                    </span>
                  </div>
                  <Button
                    onClick={() => openActionModal("bulkApprove")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve Selected
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Records Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Income Records</CardTitle>
                <CardDescription>
                  Review and manage all income transactions
                </CardDescription>
              </div>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="eligible" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="eligible">
                  Eligible ({eligibleRecords.length})
                </TabsTrigger>
                <TabsTrigger value="approved">
                  Approved ({approvedRecords.length})
                </TabsTrigger>
                <TabsTrigger value="all">All ({records.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="eligible" className="mt-6">
                <AdminIncomeTable
                  records={eligibleRecords}
                  selectedRecords={selectedRecords}
                  onSelectRecord={handleSelectRecord}
                  onSelectAll={handleSelectAll}
                  onViewDetails={(record) => openActionModal("view", record)}
                  onApprove={(record) => openActionModal("approve", record)}
                  onReject={(record) => openActionModal("reject", record)}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                  showActions
                  showSelect
                />
              </TabsContent>

              <TabsContent value="approved" className="mt-6">
                <AdminIncomeTable
                  records={approvedRecords}
                  selectedRecords={selectedRecords}
                  onViewDetails={(record) => openActionModal("view", record)}
                  onUpdateStatus={(record) =>
                    openActionModal("updateStatus", record)
                  }
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                  showStatusUpdate
                />
              </TabsContent>

              <TabsContent value="all" className="mt-6">
                <AdminIncomeTable
                  records={records}
                  selectedRecords={selectedRecords}
                  onViewDetails={(record) => openActionModal("view", record)}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Info Alert */}
        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            <strong>3-Month Approval Lock:</strong> Income records can only be
            approved 3 months after the sale date. Records automatically become
            "eligible" when the lock period expires.
          </AlertDescription>
        </Alert>
      </div>

      {/* Action Modals */}
      <ActionModals
        actionType={actionType}
        record={selectedRecord}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRecord(null);
          setActionType(null);
        }}
        onApprove={handleApprove}
        onBulkApprove={handleBulkApprove}
        onReject={handleReject}
        onUpdateStatus={handleUpdateStatus}
        loading={actionLoading}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        selectedCount={selectedRecords.size}
      />
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, subtitle, icon, gradient }) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -4 }}
    transition={{ duration: 0.2 }}
  >
    <Card
      className={`bg-gradient-to-br ${gradient} text-white shadow-xl border-0 overflow-hidden relative`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
      <CardHeader className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardDescription className="text-white/90 font-medium text-sm">
              {title}
            </CardDescription>
            <p className="text-4xl font-bold">{value}</p>
            <p className="text-sm text-white/80">{subtitle}</p>
          </div>
          <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
            {icon}
          </div>
        </div>
      </CardHeader>
    </Card>
  </motion.div>
);

// Admin Income Table Component
const AdminIncomeTable = ({
  records,
  selectedRecords,
  onSelectRecord,
  onSelectAll,
  onViewDetails,
  onApprove,
  onReject,
  onUpdateStatus,
  formatCurrency,
  formatDate,
  showActions = false,
  showSelect = false,
  showStatusUpdate = false,
}) => {
  const getStatusBadge = (status) => {
    const variants = {
      pending: {
        variant: "outline",
        className: "border-yellow-500 text-yellow-700 bg-yellow-50",
      },
      eligible: {
        variant: "outline",
        className: "border-blue-500 text-blue-700 bg-blue-50",
      },
      approved: {
        variant: "outline",
        className: "border-indigo-500 text-indigo-700 bg-indigo-50",
      },
      credited: {
        variant: "outline",
        className: "border-green-500 text-green-700 bg-green-50",
      },
      paid: { variant: "default", className: "bg-green-600 hover:bg-green-700" },
      rejected: { variant: "destructive", className: "" },
    };

    const config = variants[status] || variants.pending;
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  if (records.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <FileText className="w-16 h-16 mx-auto text-gray-300" />
        <div>
          <p className="text-lg font-medium text-gray-500">No records found</p>
          <p className="text-sm text-gray-400">
            Try adjusting your filters or check back later
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            {showSelect && (
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedRecords.size === records.length}
                  onCheckedChange={onSelectAll}
                />
              </TableHead>
            )}
            <TableHead className="font-semibold">User</TableHead>
            <TableHead className="font-semibold">Type</TableHead>
            <TableHead className="font-semibold">Plot</TableHead>
            <TableHead className="font-semibold">Sale Date</TableHead>
            <TableHead className="font-semibold text-right">Sale Amount</TableHead>
            <TableHead className="font-semibold text-right">Income</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Eligible Date</TableHead>
            <TableHead className="font-semibold text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => {
            const eligible =
              new Date() >= new Date(record.eligibleForApprovalDate);
            const daysRemaining = Math.ceil(
              (new Date(record.eligibleForApprovalDate) - new Date()) /
                (1000 * 60 * 60 * 24)
            );

            return (
              <motion.tr
                key={record._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-gray-50 transition-colors"
              >
                {showSelect && (
                  <TableCell>
                    <Checkbox
                      checked={selectedRecords.has(record._id)}
                      onCheckedChange={() => onSelectRecord(record._id)}
                    />
                  </TableCell>
                )}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm">
                      {(record.userId?.username ||
                        record.userId?.personalInfo?.firstName ||
                        "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {record.userId?.username ||
                          record.userId?.personalInfo?.firstName ||
                          "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {record.userId?.email || ""}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      record.incomeType === "personal_sale"
                        ? "border-purple-300 text-purple-700 bg-purple-50"
                        : "border-blue-300 text-blue-700 bg-blue-50"
                    }
                  >
                    {record.incomeType === "personal_sale"
                      ? "💰 Personal"
                      : "🤝 Matching"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">
                      {record.plotNumber || "-"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {record.plotId?.plotName || ""}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {formatDate(record.saleDate)}
                </TableCell>
                <TableCell className="text-right">
                  <p className="font-medium">
                    {formatCurrency(record.saleAmount)}
                  </p>
                  {record.balancedAmount > 0 && (
                    <p className="text-xs text-gray-500">
                      Bal: {formatCurrency(record.balancedAmount)}
                    </p>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <p className="font-bold text-green-600">
                    {formatCurrency(record.incomeAmount)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {record.commissionPercentage || 5}%
                  </p>
                </TableCell>
                <TableCell>{getStatusBadge(record.status)}</TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium">
                      {formatDate(record.eligibleForApprovalDate)}
                    </p>
                    {!eligible && daysRemaining > 0 && (
                      <Badge
                        variant="outline"
                        className="text-xs mt-1 border-orange-400 text-orange-700"
                      >
                        🔒 {daysRemaining}d
                      </Badge>
                    )}
                    {eligible && record.status === "pending" && (
                      <Badge
                        variant="outline"
                        className="text-xs mt-1 border-green-400 text-green-700"
                      >
                        ✅ Ready
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(record)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {showActions && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onApprove(record)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onReject(record)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {showStatusUpdate && record.status === "approved" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUpdateStatus(record)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        Update
                      </Button>
                    )}
                  </div>
                </TableCell>
              </motion.tr>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

// Action Modals Component
const ActionModals = ({
  actionType,
  record,
  isOpen,
  onClose,
  onApprove,
  onBulkApprove,
  onReject,
  onUpdateStatus,
  loading,
  formatCurrency,
  formatDate,
  selectedCount,
}) => {
  const [rejectReason, setRejectReason] = useState("");
  const [paymentDetails, setPaymentDetails] = useState({
    paidAmount: 0,
    paidDate: "",
    transactionId: "",
    paymentMode: "bank_transfer",
  });
  const [newStatus, setNewStatus] = useState("credited");

  if (!isOpen) return null;

  // View Details Modal
  if (actionType === "view" && record) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Income Record Details</DialogTitle>
            <DialogDescription>
              Complete information about this income transaction
            </DialogDescription>
          </DialogHeader>
          {/* Reuse the detail view from user dashboard */}
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-600">User</Label>
                <p className="font-medium">
                  {record.userId?.username || "Unknown"}
                </p>
              </div>
              <div>
                <Label className="text-gray-600">Income Type</Label>
                <p className="font-medium">
                  {record.incomeType === "personal_sale"
                    ? "Personal Sale"
                    : "Matching Bonus"}
                </p>
              </div>
              <div>
                <Label className="text-gray-600">Sale Amount</Label>
                <p className="font-bold text-blue-600">
                  {formatCurrency(record.saleAmount)}
                </p>
              </div>
              <div>
                <Label className="text-gray-600">Income Amount</Label>
                <p className="font-bold text-green-600">
                  {formatCurrency(record.incomeAmount)}
                </p>
              </div>
              <div>
                <Label className="text-gray-600">Sale Date</Label>
                <p className="font-medium">{formatDate(record.saleDate)}</p>
              </div>
              <div>
                <Label className="text-gray-600">Eligible Date</Label>
                <p className="font-medium">
                  {formatDate(record.eligibleForApprovalDate)}
                </p>
              </div>
              <div>
                <Label className="text-gray-600">Status</Label>
                <Badge className="mt-1">{record.status}</Badge>
              </div>
              <div>
                <Label className="text-gray-600">Plot</Label>
                <p className="font-medium">{record.plotNumber || "-"}</p>
              </div>
            </div>
            {record.incomeType === "matching_bonus" && record.pairedWith && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">Pairing Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-blue-50">
                      <CardContent className="pt-4">
                        <p className="text-sm text-gray-600">
                          {record.legType === "left" ? "Left" : "Right"} Leg
                        </p>
                        <p className="font-medium">{record.buyerName}</p>
                        <p className="text-sm">
                          {formatCurrency(record.saleAmount)}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-green-50">
                      <CardContent className="pt-4">
                        <p className="text-sm text-gray-600">
                          {record.pairedWith.legType === "left"
                            ? "Left"
                            : "Right"}{" "}
                          Leg
                        </p>
                        <p className="font-medium">
                          {record.pairedWith.buyerName}
                        </p>
                        <p className="text-sm">
                          {formatCurrency(record.pairedWith.amount)}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Approve Single Record Modal
  if (actionType === "approve" && record) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Income Record</DialogTitle>
            <DialogDescription>
              Confirm approval for this income transaction
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription>
                <div className="space-y-2">
                  <p>
                    <strong>User:</strong>{" "}
                    {record.userId?.username || "Unknown"}
                  </p>
                  <p>
                    <strong>Income:</strong>{" "}
                    <span className="text-green-600 font-bold">
                      {formatCurrency(record.incomeAmount)}
                    </span>
                  </p>
                  <p>
                    <strong>Plot:</strong> {record.plotNumber}
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={onApprove} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Bulk Approve Modal
  if (actionType === "bulkApprove") {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Approve Income Records</DialogTitle>
            <DialogDescription>
              Approve {selectedCount} selected record(s)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>
                You are about to approve <strong>{selectedCount}</strong>{" "}
                income record(s). This action cannot be undone.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={onBulkApprove} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Approve All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Reject Modal
  if (actionType === "reject" && record) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Income Record</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this income
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason *</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => onReject(rejectReason)}
              disabled={loading || !rejectReason.trim()}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Update Status Modal
  if (actionType === "updateStatus" && record) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Income Status</DialogTitle>
            <DialogDescription>
              Update status to Credited or Paid with payment details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credited">Credited</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newStatus === "paid" && (
              <>
                <div className="space-y-2">
                  <Label>Paid Amount</Label>
                  <Input
                    type="number"
                    value={paymentDetails.paidAmount}
                    onChange={(e) =>
                      setPaymentDetails((prev) => ({
                        ...prev,
                        paidAmount: Number(e.target.value),
                      }))
                    }
                    placeholder="Enter amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payment Date</Label>
                  <Input
                    type="date"
                    value={paymentDetails.paidDate}
                    onChange={(e) =>
                      setPaymentDetails((prev) => ({
                        ...prev,
                        paidDate: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Transaction ID</Label>
                  <Input
                    value={paymentDetails.transactionId}
                    onChange={(e) =>
                      setPaymentDetails((prev) => ({
                        ...prev,
                        transactionId: e.target.value,
                      }))
                    }
                    placeholder="Enter transaction ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payment Mode</Label>
                  <Select
                    value={paymentDetails.paymentMode}
                    onValueChange={(value) =>
                      setPaymentDetails((prev) => ({
                        ...prev,
                        paymentMode: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">
                        Bank Transfer
                      </SelectItem>
                      <SelectItem value="wallet">Wallet</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                onUpdateStatus(
                  newStatus,
                  newStatus === "paid" ? paymentDetails : null
                )
              }
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
};

// Loading Skeleton
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-50 py-8 px-4">
    <div className="max-w-7xl mx-auto space-y-8">
      <Skeleton className="h-12 w-96" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-64" />
      <Skeleton className="h-96" />
    </div>
  </div>
);

export default AdminMatchingIncomeApproval;