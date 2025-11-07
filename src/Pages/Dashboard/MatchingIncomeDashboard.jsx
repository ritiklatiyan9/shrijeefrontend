import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { fetchUserMatchingIncome } from "../../api/matchingIncomeService";
import { fetchUserLegBalanceSummary } from "../../api/legBalanceService";
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
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  Eye,
  Users,
  ArrowLeftRight,
  Info,
  AlertCircle,
  FileText,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

const MyIncomeDashboard = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [legBalance, setLegBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user?._id) fetchData();
  }, [user?._id]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch income records
      const result = await fetchUserMatchingIncome(user._id, {
        page: 1,
        limit: 1000,
      });
      if (result.success) {
        setRecords(result.data || []);
        setSummary(result.summary || null);
      } else {
        setError(result.message || "Failed to fetch data");
      }

      // Fetch leg balance summary
      const legBalanceResult = await fetchUserLegBalanceSummary(user._id);
      if (legBalanceResult.success) {
        setLegBalance(legBalanceResult.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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

  // Calculate detailed statistics
  const stats = React.useMemo(() => {
    const approved = records.filter((r) =>
      ["approved", "credited", "paid"].includes(r.status)
    );
    const pending = records.filter((r) =>
      ["pending", "eligible"].includes(r.status)
    );
    const personal = records.filter((r) => r.incomeType === "personal_sale");
    const matching = records.filter((r) => r.incomeType === "matching_bonus");

    const approvedPersonal = personal.filter((r) =>
      ["approved", "credited", "paid"].includes(r.status)
    );
    const approvedMatching = matching.filter((r) =>
      ["approved", "credited", "paid"].includes(r.status)
    );
    const pendingMatching = matching.filter((r) =>
      ["pending", "eligible"].includes(r.status)
    );

    return {
      totalEarned: approved.reduce((sum, r) => sum + r.incomeAmount, 0),
      totalApprovedSales: approved.reduce((sum, r) => sum + r.saleAmount, 0),
      totalUnapprovedSales: pending.reduce((sum, r) => sum + r.saleAmount, 0),
      totalPendingIncome: pending.reduce((sum, r) => sum + r.incomeAmount, 0),
      personalSaleIncome: personal.reduce((sum, r) => sum + r.incomeAmount, 0),
      personalSaleCount: personal.length,
      approvedPersonalIncome: approvedPersonal.reduce(
        (sum, r) => sum + r.incomeAmount,
        0
      ),
      approvedPersonalCount: approvedPersonal.length,
      matchingBonusIncome: matching.reduce((sum, r) => sum + r.incomeAmount, 0),
      matchingBonusCount: matching.length,
      approvedMatchingIncome: approvedMatching.reduce(
        (sum, r) => sum + r.incomeAmount,
        0
      ),
      approvedMatchingCount: approvedMatching.length,
      pendingMatchingIncome: pendingMatching.reduce(
        (sum, r) => sum + r.incomeAmount,
        0
      ),
      pendingMatchingCount: pendingMatching.length,
    };
  }, [records]);

  const openRecordDetails = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  const leftLeg = legBalance?.leftLeg || {};
  const rightLeg = legBalance?.rightLeg || {};
  const carryForward = legBalance?.carryForward || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            My Income Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Welcome back,{" "}
            <span className="font-semibold text-blue-600">
              {user?.personalInfo?.firstName || user?.username}
            </span>
            ! Track your earnings and commission breakdown.
          </p>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Summary Cards - Top Level */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Earned"
            subtitle="Approved Income"
            value={formatCurrency(stats.totalEarned)}
            icon={<CheckCircle2 className="w-8 h-8" />}
            gradient="from-green-500 to-emerald-600"
            trend="+12% from last month"
          />
          <StatCard
            title="Pending Approval"
            subtitle="Awaiting Admin Review"
            value={formatCurrency(stats.totalPendingIncome)}
            icon={<Clock className="w-8 h-8" />}
            gradient="from-amber-500 to-orange-600"
            count={`${records.filter((r) => ["pending", "eligible"].includes(r.status)).length} records`}
          />
          <StatCard
            title="Approved Sales"
            subtitle="Total Sale Value"
            value={formatCurrency(stats.totalApprovedSales)}
            icon={<TrendingUp className="w-8 h-8" />}
            gradient="from-blue-500 to-indigo-600"
          />
          <StatCard
            title="Unapproved Sales"
            subtitle="Pending Review"
            value={formatCurrency(stats.totalUnapprovedSales)}
            icon={<DollarSign className="w-8 h-8" />}
            gradient="from-purple-500 to-pink-600"
          />
        </div>

        {/* Leg Balance & Carry-Forward Section */}
        {legBalance && (
          <Card className="border-l-4 border-l-amber-500 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <ArrowLeftRight className="w-6 h-6" />
                    Leg Balance & Carry-Forward
                  </CardTitle>
                  <CardDescription>
                    Track your left and right leg sales with automatic balance tracking
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = "/leg-balance"}
                >
                  View Details
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Visual Balance Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4 text-blue-600" />
                    Left: {formatCurrency(leftLeg.availableBalance || 0)}
                  </span>
                  <span className="flex items-center gap-2">
                    Right: {formatCurrency(rightLeg.availableBalance || 0)}
                    <ArrowRight className="w-4 h-4 text-green-600" />
                  </span>
                </div>
                <div className="h-8 flex rounded-lg overflow-hidden border-2 border-gray-200">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${
                        (leftLeg.availableBalance || 0) + (rightLeg.availableBalance || 0) > 0
                          ? ((leftLeg.availableBalance || 0) /
                              ((leftLeg.availableBalance || 0) + (rightLeg.availableBalance || 0))) *
                            100
                          : 50
                      }%`,
                    }}
                    transition={{ duration: 0.5 }}
                    className="bg-blue-500 flex items-center justify-center text-white font-semibold text-xs"
                  >
                    {((leftLeg.availableBalance || 0) + (rightLeg.availableBalance || 0) > 0) &&
                      (((leftLeg.availableBalance || 0) /
                        ((leftLeg.availableBalance || 0) + (rightLeg.availableBalance || 0))) *
                        100 >
                      15) &&
                      `${(
                        ((leftLeg.availableBalance || 0) /
                          ((leftLeg.availableBalance || 0) + (rightLeg.availableBalance || 0))) *
                        100
                      ).toFixed(0)}%`}
                  </motion.div>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${
                        (leftLeg.availableBalance || 0) + (rightLeg.availableBalance || 0) > 0
                          ? ((rightLeg.availableBalance || 0) /
                              ((leftLeg.availableBalance || 0) + (rightLeg.availableBalance || 0))) *
                            100
                          : 50
                      }%`,
                    }}
                    transition={{ duration: 0.5 }}
                    className="bg-green-500 flex items-center justify-center text-white font-semibold text-xs"
                  >
                    {((leftLeg.availableBalance || 0) + (rightLeg.availableBalance || 0) > 0) &&
                      (((rightLeg.availableBalance || 0) /
                        ((leftLeg.availableBalance || 0) + (rightLeg.availableBalance || 0))) *
                        100 >
                      15) &&
                      `${(
                        ((rightLeg.availableBalance || 0) /
                          ((leftLeg.availableBalance || 0) + (rightLeg.availableBalance || 0))) *
                        100
                      ).toFixed(0)}%`}
                  </motion.div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700 font-medium mb-1">Left Leg Total</p>
                  <p className="text-lg font-bold text-blue-700">
                    {formatCurrency(leftLeg.totalSales || 0)}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Available: {formatCurrency(leftLeg.availableBalance || 0)}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-xs text-green-700 font-medium mb-1">Right Leg Total</p>
                  <p className="text-lg font-bold text-green-700">
                    {formatCurrency(rightLeg.totalSales || 0)}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Available: {formatCurrency(rightLeg.availableBalance || 0)}
                  </p>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <p className="text-xs text-amber-700 font-medium mb-1">⏳ Carry-Forward</p>
                  <p className="text-lg font-bold text-amber-700">
                    {formatCurrency(carryForward.amount || 0)}
                  </p>
                  {carryForward.amount > 0 && (
                    <Badge variant="outline" className="text-xs mt-1 border-amber-400 text-amber-700">
                      {carryForward.leg === "left" ? "⬅️ Left" : "➡️ Right"}
                    </Badge>
                  )}
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <p className="text-xs text-indigo-700 font-medium mb-1">✅ Total Matched</p>
                  <p className="text-lg font-bold text-indigo-700">
                    {formatCurrency(legBalance.totalMatchedAmount || 0)}
                  </p>
                  <p className="text-xs text-indigo-600 mt-1">
                    {legBalance.matchingCount || 0} matchings
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Income Breakdown Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Personal Sale Card */}
          <Card className="border-l-4 border-l-purple-500 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Personal Sale Income</CardTitle>
                  <CardDescription>5% commission from your own purchases</CardDescription>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <DollarSign className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Total Income</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(stats.personalSaleIncome)}
                  </p>
                  <p className="text-xs text-gray-500">{stats.personalSaleCount} transactions</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Approved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(stats.approvedPersonalIncome)}
                  </p>
                  <p className="text-xs text-gray-500">{stats.approvedPersonalCount} approved</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between pt-2">
                <Badge variant="outline" className="text-purple-700 border-purple-300">
                  Personal Sales
                </Badge>
                <Badge variant="secondary">
                  {stats.personalSaleCount - stats.approvedPersonalCount} pending
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Matching Bonus Card */}
          <Card className="border-l-4 border-l-blue-500 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Matching Bonus Income</CardTitle>
                  <CardDescription>5% from balanced team sales</CardDescription>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Total Income</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(stats.matchingBonusIncome)}
                  </p>
                  <p className="text-xs text-gray-500">{stats.matchingBonusCount} pairings</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Approved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(stats.approvedMatchingIncome)}
                  </p>
                  <p className="text-xs text-gray-500">{stats.approvedMatchingCount} approved</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between pt-2">
                <Badge variant="outline" className="text-blue-700 border-blue-300">
                  Team Matching
                </Badge>
                <Badge variant="secondary">
                  {stats.pendingMatchingCount} pending
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Income Records */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Detailed Income Records</CardTitle>
            <CardDescription>
              Complete transaction history with approval status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All ({records.length})</TabsTrigger>
                <TabsTrigger value="personal">
                  Personal ({stats.personalSaleCount})
                </TabsTrigger>
                <TabsTrigger value="matching">
                  Matching ({stats.matchingBonusCount})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pending ({stats.pendingMatchingCount + (stats.personalSaleCount - stats.approvedPersonalCount)})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <IncomeTable
                  records={records}
                  onViewDetails={openRecordDetails}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                />
              </TabsContent>

              <TabsContent value="personal" className="mt-6">
                <IncomeTable
                  records={records.filter((r) => r.incomeType === "personal_sale")}
                  onViewDetails={openRecordDetails}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                />
              </TabsContent>

              <TabsContent value="matching" className="mt-6">
                <IncomeTable
                  records={records.filter((r) => r.incomeType === "matching_bonus")}
                  onViewDetails={openRecordDetails}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                  showPairing
                />
              </TabsContent>

              <TabsContent value="pending" className="mt-6">
                <IncomeTable
                  records={records.filter((r) =>
                    ["pending", "eligible"].includes(r.status)
                  )}
                  onViewDetails={openRecordDetails}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                  showPairing
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            <strong className="font-semibold">Income & Carry-Forward System:</strong>
            <ul className="mt-2 space-y-1 list-disc list-inside text-sm">
              <li>
                <strong>Personal Sale (5%):</strong> Earned instantly from your own plot purchases
              </li>
              <li>
                <strong>Matching Bonus (5%):</strong> Earned when Left & Right team legs balance
              </li>
              <li>
                <strong>Carry-Forward:</strong> Unmatched amounts are automatically saved and used in future matchings
              </li>
              <li>
                <strong>Example:</strong> If Left = ₹2L and Right = ₹1.5L, you earn 5% of ₹1.5L, and ₹50K carries forward
              </li>
              <li>
                <strong>3-Month Approval Lock:</strong> Income becomes eligible for admin approval only after 3 months from sale date
              </li>
              <li>
                <strong>Status Flow:</strong> Pending → Eligible → Approved → Credited → Paid
              </li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>

      {/* Detail Modal */}
      <RecordDetailModal
        record={selectedRecord}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
      />
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, subtitle, value, icon, gradient, trend, count }) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -4 }}
    transition={{ duration: 0.2 }}
  >
    <Card className={`bg-gradient-to-br ${gradient} text-white shadow-xl border-0 overflow-hidden relative`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
      <CardHeader className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardDescription className="text-white/80 font-medium">
              {title}
            </CardDescription>
            <p className="text-xs text-white/70">{subtitle}</p>
          </div>
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <p className="text-3xl font-bold mb-2">{value}</p>
        {trend && (
          <p className="text-xs text-white/80">{trend}</p>
        )}
        {count && (
          <p className="text-xs text-white/80">{count}</p>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

// Income Table Component (keeping existing - no changes needed)
const IncomeTable = ({ records, onViewDetails, formatCurrency, formatDate, showPairing = false }) => {
  const getStatusBadge = (status) => {
    const variants = {
      pending: { variant: "outline", className: "border-yellow-500 text-yellow-700 bg-yellow-50" },
      eligible: { variant: "outline", className: "border-blue-500 text-blue-700 bg-blue-50" },
      approved: { variant: "outline", className: "border-indigo-500 text-indigo-700 bg-indigo-50" },
      credited: { variant: "outline", className: "border-green-500 text-green-700 bg-green-50" },
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
          <p className="text-sm text-gray-400">Income records will appear here once generated</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead className="font-semibold">Type</TableHead>
            <TableHead className="font-semibold">Plot</TableHead>
            {showPairing && <TableHead className="font-semibold">Pairing</TableHead>}
            <TableHead className="font-semibold text-right">Sale Amount</TableHead>
            <TableHead className="font-semibold text-right">Income</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Eligible Date</TableHead>
            <TableHead className="font-semibold text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => {
            const eligible = new Date() >= new Date(record.eligibleForApprovalDate);
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
                <TableCell className="font-medium">
                  {formatDate(record.saleDate)}
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
                    {record.incomeType === "personal_sale" ? "💰 Personal" : "🤝 Matching"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{record.plotNumber || "-"}</p>
                    <p className="text-xs text-gray-500">
                      {record.plotId?.plotName || ""}
                    </p>
                  </div>
                </TableCell>
                {showPairing && record.incomeType === "matching_bonus" && (
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs border-blue-400 text-blue-700">
                        {record.legType === "left" ? "⬅️ L" : "➡️ R"}
                      </Badge>
                      <ArrowLeftRight className="w-3 h-3 text-gray-400" />
                      <Badge variant="outline" className="text-xs border-green-400 text-green-700">
                        {record.pairedWith?.legType === "left" ? "⬅️ L" : "➡️ R"}
                      </Badge>
                    </div>
                  </TableCell>
                )}
                {showPairing && record.incomeType === "personal_sale" && (
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      N/A
                    </Badge>
                  </TableCell>
                )}
                <TableCell className="text-right">
                  <div>
                    <p className="font-medium">{formatCurrency(record.saleAmount)}</p>
                    {record.balancedAmount > 0 && (
                      <p className="text-xs text-gray-500">
                        Balanced: {formatCurrency(record.balancedAmount)}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div>
                    <p className="font-bold text-green-600">
                      {formatCurrency(record.incomeAmount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {record.commissionPercentage || 5}%
                    </p>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(record.status)}</TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium">
                      {formatDate(record.eligibleForApprovalDate)}
                    </p>
                    {!eligible && daysRemaining > 0 && (
                      <Badge variant="outline" className="text-xs mt-1 border-orange-400 text-orange-700">
                        🔒 {daysRemaining}d left
                      </Badge>
                    )}
                    {eligible && record.status === "pending" && (
                      <Badge variant="outline" className="text-xs mt-1 border-green-400 text-green-700">
                        ✅ Ready
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(record)}
                    className="hover:bg-blue-50"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </TableCell>
              </motion.tr>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

// Record Detail Modal (keeping existing - same as before)
const RecordDetailModal = ({ record, isOpen, onClose, formatCurrency, formatDate }) => {
  if (!record) return null;

  const isMatching = record.incomeType === "matching_bonus";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            {isMatching ? "🤝" : "💰"} Income Record Details
          </DialogTitle>
          <DialogDescription>
            Complete information about this income transaction
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <Badge
              variant={record.status === "paid" ? "default" : "outline"}
              className={`text-lg px-4 py-2 ${
                record.status === "paid"
                  ? "bg-green-600"
                  : record.status === "approved"
                  ? "border-indigo-500 text-indigo-700"
                  : "border-yellow-500 text-yellow-700"
              }`}
            >
              {record.status.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="text-base px-3 py-1">
              {isMatching ? "Matching Bonus" : "Personal Sale"}
            </Badge>
          </div>

          <Separator />

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-6">
            <InfoRow label="Sale Date" value={formatDate(record.saleDate)} />
            <InfoRow
              label="Eligible Date"
              value={formatDate(record.eligibleForApprovalDate)}
            />
            <InfoRow label="Plot Number" value={record.plotNumber || "-"} />
            <InfoRow label="Plot Name" value={record.plotId?.plotName || "-"} />
          </div>

          <Separator />

          {/* Financial Details */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Financial Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <p className="text-sm text-gray-600">Sale Amount</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(record.saleAmount)}
                  </p>
                </CardContent>
              </Card>
              {record.balancedAmount > 0 && (
                <Card className="border-l-4 border-l-purple-500">
                  <CardContent className="pt-4">
                    <p className="text-sm text-gray-600">Balanced Amount</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatCurrency(record.balancedAmount)}
                    </p>
                  </CardContent>
                </Card>
              )}
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="pt-4">
                  <p className="text-sm text-gray-600">Your Income</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(record.incomeAmount)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {record.commissionPercentage || 5}% commission
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Matching Bonus Pairing Details */}
          {isMatching && record.pairedWith && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <ArrowLeftRight className="w-5 h-5" />
                  Team Pairing Breakdown
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Triggered Sale */}
                  <Card className="border-2 border-blue-200 bg-blue-50">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Badge className="bg-blue-600">
                          {record.legType === "left" ? "⬅️ Left" : "➡️ Right"} Leg
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <InfoRow
                        label="Buyer"
                        value={record.buyerName || "—"}
                        small
                      />
                      <InfoRow
                        label="Plot"
                        value={`${record.plotNumber || "-"}`}
                        small
                      />
                      <InfoRow
                        label="Sale Amount"
                        value={formatCurrency(record.saleAmount)}
                        small
                      />
                    </CardContent>
                  </Card>

                  {/* Paired Sale */}
                  <Card className="border-2 border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Badge className="bg-green-600">
                          {record.pairedWith.legType === "left"
                            ? "⬅️ Left"
                            : "➡️ Right"}{" "}
                          Leg
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <InfoRow
                        label="Buyer"
                        value={record.pairedWith.buyerName || "—"}
                        small
                      />
                      <InfoRow
                        label="Plot"
                        value={`Plot ${record.pairedWith.plotId?.plotNumber || "-"}`}
                        small
                      />
                      <InfoRow
                        label="Sale Amount"
                        value={formatCurrency(record.pairedWith.amount)}
                        small
                      />
                      <InfoRow
                        label="Sale Date"
                        value={formatDate(record.pairedWith.saleDate)}
                        small
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}

          {/* Buyer Info for Personal Sale */}
          {!isMatching && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Buyer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <InfoRow label="Buyer Name" value={record.buyerName || "—"} />
                  <InfoRow label="Buyer ID" value={record.buyerId?._id || "—"} />
                </div>
              </div>
            </>
          )}

          {/* Approval Info */}
          {record.approvedBy && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Approval Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <InfoRow
                    label="Approved At"
                    value={formatDate(record.approvedAt)}
                  />
                  <InfoRow
                    label="Approved By"
                    value={record.approvedBy?.username || "Admin"}
                  />
                </div>
              </div>
            </>
          )}

          {/* Payment Info */}
          {record.paymentDetails?.paidAmount > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Payment Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <InfoRow
                    label="Paid Amount"
                    value={formatCurrency(record.paymentDetails.paidAmount)}
                  />
                  <InfoRow
                    label="Payment Date"
                    value={formatDate(record.paymentDetails.paidDate)}
                  />
                  <InfoRow
                    label="Transaction ID"
                    value={record.paymentDetails.transactionId || "—"}
                  />
                  <InfoRow
                    label="Payment Mode"
                    value={
                      record.paymentDetails.paymentMode?.toUpperCase() || "—"
                    }
                  />
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          {(record.notes || record.adminNotes) && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Notes</h3>
                {record.notes && (
                  <Alert>
                    <AlertDescription>{record.notes}</AlertDescription>
                  </Alert>
                )}
                {record.adminNotes && (
                  <Alert className="bg-blue-50">
                    <AlertDescription>
                      <strong>Admin Notes:</strong> {record.adminNotes}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Info Row Component
const InfoRow = ({ label, value, small = false }) => (
  <div className={small ? "space-y-0.5" : "space-y-1"}>
    <p className={`${small ? "text-xs" : "text-sm"} text-gray-600 font-medium`}>
      {label}
    </p>
    <p className={`${small ? "text-sm" : "text-base"} font-semibold text-gray-900 break-words`}>
      {value}
    </p>
  </div>
);

// Loading Skeleton
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 py-8 px-4">
    <div className="max-w-7xl mx-auto space-y-8">
      <Skeleton className="h-12 w-96" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
      <Skeleton className="h-48" />
      <div className="grid lg:grid-cols-2 gap-6">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
      <Skeleton className="h-96" />
    </div>
  </div>
);

export default MyIncomeDashboard;