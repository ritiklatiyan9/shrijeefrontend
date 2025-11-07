import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { fetchTeamMatchingIncome } from "../../api/matchingIncomeService";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users,
  DollarSign,
  TrendingUp,
  Eye,
  AlertCircle,
  Info,
  FileText,
  ArrowLeftRight,
  Filter,
  X,
  ArrowLeft,
  ArrowRight,
  Clock,
} from "lucide-react";

const MyTeamIncomeDashboard = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [legBalance, setLegBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: "",
    incomeType: "",
    memberId: "",
  });

  useEffect(() => {
    if (user?._id) fetchData();
  }, [user?._id, filters]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch team income records
      const result = await fetchTeamMatchingIncome(user._id, {
        ...filters,
        page: 1,
        limit: 1000,
      });
      if (result.success) {
        setRecords(Array.isArray(result.data) ? result.data : []);
        setSummary(result.summary || {});
      } else {
        setError(result.message || "Failed to fetch team data");
        setRecords([]);
        setSummary({});
      }

      // Fetch leg balance summary
      const legBalanceResult = await fetchUserLegBalanceSummary(user._id);
      if (legBalanceResult.success) {
        setLegBalance(legBalanceResult.data);
      }
    } catch (err) {
      setError(err.message);
      setRecords([]);
      setSummary({});
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

  const clearFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      status: "",
      incomeType: "",
      memberId: "",
    });
  };

  // Calculate statistics
  const stats = React.useMemo(() => {
    const myRecords = records.filter((r) => r.userId?._id === user?._id);
    const teamRecords = records.filter((r) => r.userId?._id !== user?._id);

    const myMatchingIncome = myRecords
      .filter((r) => r.incomeType === "matching_bonus")
      .reduce((sum, r) => sum + r.incomeAmount, 0);

    const myApprovedIncome = myRecords
      .filter((r) => ["approved", "credited", "paid"].includes(r.status))
      .reduce((sum, r) => sum + r.incomeAmount, 0);

    const teamTotalIncome = teamRecords.reduce(
      (sum, r) => sum + r.incomeAmount,
      0
    );

    const teamApprovedIncome = teamRecords
      .filter((r) => ["approved", "credited", "paid"].includes(r.status))
      .reduce((sum, r) => sum + r.incomeAmount, 0);

    return {
      totalTeamMembers: summary?.totalTeamMembers || 0,
      activeMembers: summary?.activeMembers || 0,
      totalTeamIncome: summary?.totalTeamIncome || 0,
      totalRecords: records.length,
      myMatchingIncome,
      myApprovedIncome,
      teamTotalIncome,
      teamApprovedIncome,
      avgPerMember:
        summary?.totalTeamMembers > 0
          ? summary.totalTeamIncome / summary.totalTeamMembers
          : 0,
    };
  }, [records, summary, user]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            My Team Income Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Welcome,{" "}
            <span className="font-semibold text-indigo-600">
              {user?.personalInfo?.firstName || user?.username}
            </span>
            ! Track your team's earnings and performance.
          </p>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Top Level Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Team Members"
            subtitle={`${stats.activeMembers} active`}
            value={stats.totalTeamMembers}
            icon={<Users className="w-8 h-8" />}
            gradient="from-blue-500 to-indigo-600"
          />
          <StatCard
            title="Total Team Income"
            subtitle="All team earnings"
            value={formatCurrency(stats.totalTeamIncome)}
            icon={<DollarSign className="w-8 h-8" />}
            gradient="from-green-500 to-emerald-600"
          />
          <StatCard
            title="Total Records"
            subtitle="Transaction count"
            value={stats.totalRecords}
            icon={<FileText className="w-8 h-8" />}
            gradient="from-purple-500 to-pink-600"
          />
          <StatCard
            title="Avg Per Member"
            subtitle="Average earnings"
            value={formatCurrency(stats.avgPerMember)}
            icon={<TrendingUp className="w-8 h-8" />}
            gradient="from-amber-500 to-orange-600"
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
                    My Leg Balance & Carry-Forward
                  </CardTitle>
                  <CardDescription>
                    Your personal left and right leg sales balance with carry-forward tracking
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

        {/* My Income from Team */}
        <div className="grid sm:grid-cols-2 gap-6">
          <Card className="border-l-4 border-l-indigo-500 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    My Matching Bonus from Team
                  </CardTitle>
                  <CardDescription>
                    Income earned from team leg balance
                  </CardDescription>
                </div>
                <div className="bg-indigo-100 p-3 rounded-full">
                  <ArrowLeftRight className="w-8 h-8 text-indigo-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Total Earned</p>
                  <p className="text-3xl font-bold text-indigo-600">
                    {formatCurrency(stats.myMatchingIncome)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Approved</p>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(stats.myApprovedIncome)}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between pt-2">
                <Badge variant="outline" className="text-indigo-700 border-indigo-300">
                  My Income
                </Badge>
                <Badge variant="secondary">
                  {records.filter((r) => r.userId?._id === user?._id).length} records
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    Team Total Income
                  </CardTitle>
                  <CardDescription>
                    Generated by all team members
                  </CardDescription>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Total Income</p>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(stats.teamTotalIncome)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Approved</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {formatCurrency(stats.teamApprovedIncome)}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between pt-2">
                <Badge variant="outline" className="text-green-700 border-green-300">
                  Team Earnings
                </Badge>
                <Badge variant="secondary">
                  {records.filter((r) => r.userId?._id !== user?._id).length} records
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-600" />
                <CardTitle>Filters</CardTitle>
              </div>
              {(filters.status ||
                filters.incomeType ||
                filters.startDate ||
                filters.endDate) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>
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
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, startDate: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, endDate: e.target.value }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Income Records Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Team Income Records</CardTitle>
            <CardDescription>
              Detailed breakdown of all team member earnings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All ({records.length})</TabsTrigger>
                <TabsTrigger value="mine">
                  Mine (
                  {records.filter((r) => r.userId?._id === user?._id).length})
                </TabsTrigger>
                <TabsTrigger value="team">
                  Team (
                  {records.filter((r) => r.userId?._id !== user?._id).length})
                </TabsTrigger>
                <TabsTrigger value="matching">
                  Matching (
                  {
                    records.filter((r) => r.incomeType === "matching_bonus")
                      .length
                  }
                  )
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <TeamIncomeTable
                  records={records}
                  currentUserId={user?._id}
                  onViewDetails={openRecordDetails}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                />
              </TabsContent>

              <TabsContent value="mine" className="mt-6">
                <TeamIncomeTable
                  records={records.filter((r) => r.userId?._id === user?._id)}
                  currentUserId={user?._id}
                  onViewDetails={openRecordDetails}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                />
              </TabsContent>

              <TabsContent value="team" className="mt-6">
                <TeamIncomeTable
                  records={records.filter((r) => r.userId?._id !== user?._id)}
                  currentUserId={user?._id}
                  onViewDetails={openRecordDetails}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                />
              </TabsContent>

              <TabsContent value="matching" className="mt-6">
                <TeamIncomeTable
                  records={records.filter(
                    (r) => r.incomeType === "matching_bonus"
                  )}
                  currentUserId={user?._id}
                  onViewDetails={openRecordDetails}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                  showPairing
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Income Breakdown */}
        {summary?.incomeByType && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Income by Type</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <BreakdownRow
                  label="Personal Sales"
                  value={formatCurrency(
                    summary.incomeByType.personal_sale || 0
                  )}
                  color="text-purple-600"
                />
                <BreakdownRow
                  label="Matching Bonus"
                  value={formatCurrency(
                    summary.incomeByType.matching_bonus || 0
                  )}
                  color="text-blue-600"
                />
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Income by Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(summary.incomeByStatus || {}).map(
                  ([status, amount]) =>
                    amount > 0 && (
                      <BreakdownRow
                        key={status}
                        label={status.charAt(0).toUpperCase() + status.slice(1)}
                        value={formatCurrency(amount)}
                      />
                    )
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Info Card */}
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            <strong className="font-semibold">💡 Team Income & Carry-Forward System:</strong>
            <ul className="mt-2 space-y-1 list-disc list-inside text-sm">
              <li>
                <strong>Team Income:</strong> Earnings generated by all your
                downline members
              </li>
              <li>
                <strong>Personal Sale:</strong> 5% from each member's own plot
                purchases
              </li>
              <li>
                <strong>Matching Bonus:</strong> 5% from balanced Left & Right
                leg sales
              </li>
              <li>
                <strong>Carry-Forward:</strong> Unmatched balances are automatically tracked and used in future matchings
              </li>
              <li>
                <strong>Example:</strong> If Left = ₹2L and Right = ₹1.5L, you earn 5% of ₹1.5L, and ₹50K carries forward
              </li>
              <li>
                <strong>3-Month Approval Lock:</strong> Income can be approved
                only after 3 months from sale date
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
        isCurrentUser={selectedRecord?.userId?._id === user?._id}
      />
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, subtitle, value, icon, gradient }) => (
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
            <p className="text-xs text-white/70">{subtitle}</p>
          </div>
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  </motion.div>
);

// Team Income Table Component
const TeamIncomeTable = ({
  records,
  currentUserId,
  onViewDetails,
  formatCurrency,
  formatDate,
  showPairing = false,
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
        <Users className="w-16 h-16 mx-auto text-gray-300" />
        <div>
          <p className="text-lg font-medium text-gray-500">No records found</p>
          <p className="text-sm text-gray-400">
            Income records will appear here once team generates sales
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
            <TableHead className="font-semibold">Member</TableHead>
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead className="font-semibold">Plot</TableHead>
            <TableHead className="font-semibold">Type</TableHead>
            {showPairing && <TableHead className="font-semibold">Pairing</TableHead>}
            <TableHead className="font-semibold">Leg</TableHead>
            <TableHead className="font-semibold text-right">
              Sale Amount
            </TableHead>
            <TableHead className="font-semibold text-right">Income</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => {
            const isCurrentUser = record.userId?._id === currentUserId;
            const isPersonalSale = record.incomeType === "personal_sale";

            return (
              <motion.tr
                key={record._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`hover:bg-gray-50 transition-colors ${
                  isCurrentUser ? "bg-indigo-50" : ""
                }`}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                        isCurrentUser
                          ? "bg-indigo-200 text-indigo-800"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {(
                        record.userId?.username ||
                        record.userId?.personalInfo?.firstName ||
                        "?"
                      )[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {record.userId?.username ||
                          record.userId?.personalInfo?.firstName ||
                          "Unknown"}
                      </p>
                      {isCurrentUser && (
                        <Badge variant="outline" className="text-xs mt-1 border-indigo-400 text-indigo-700">
                          You
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {formatDate(record.saleDate)}
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
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      isPersonalSale
                        ? "border-purple-300 text-purple-700 bg-purple-50"
                        : "border-blue-300 text-blue-700 bg-blue-50"
                    }
                  >
                    {isPersonalSale ? "💰 Personal" : "🤝 Matching"}
                  </Badge>
                </TableCell>
                {showPairing && record.incomeType === "matching_bonus" && (
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Badge
                        variant="outline"
                        className="text-xs border-blue-400 text-blue-700"
                      >
                        {record.legType === "left" ? "⬅️ L" : "➡️ R"}
                      </Badge>
                      <ArrowLeftRight className="w-3 h-3 text-gray-400" />
                      <Badge
                        variant="outline"
                        className="text-xs border-green-400 text-green-700"
                      >
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
                {!showPairing && (
                  <TableCell>
                    {record.legType === "personal" ? (
                      <span className="text-gray-600 text-sm">Personal</span>
                    ) : (
                      <Badge
                        variant="outline"
                        className={
                          record.legType === "left"
                            ? "border-blue-400 text-blue-700"
                            : "border-green-400 text-green-700"
                        }
                      >
                        {record.legType === "left" ? "⬅️ Left" : "➡️ Right"}
                      </Badge>
                    )}
                  </TableCell>
                )}
                <TableCell className="text-right">
                  <div>
                    <p className="font-medium">
                      {formatCurrency(record.saleAmount)}
                    </p>
                    {record.balancedAmount > 0 && (
                      <p className="text-xs text-gray-500">
                        Bal: {formatCurrency(record.balancedAmount)}
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

// Breakdown Row Component
const BreakdownRow = ({ label, value, color }) => (
  <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
    <span className="text-sm font-medium text-gray-700">{label}</span>
    <span className={`text-sm font-bold ${color || "text-gray-900"}`}>
      {value}
    </span>
  </div>
);

// Record Detail Modal (same as before)
const RecordDetailModal = ({
  record,
  isOpen,
  onClose,
  formatCurrency,
  formatDate,
  isCurrentUser,
}) => {
  if (!record) return null;

  const isMatching = record.incomeType === "matching_bonus";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            {isMatching ? "🤝" : "💰"} Team Income Record Details
            {isCurrentUser && (
              <Badge variant="outline" className="ml-2 border-indigo-400 text-indigo-700">
                Your Income
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Complete information about this team income transaction
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

          {/* Member & Basic Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Member Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoRow
                label="Member Name"
                value={
                  record.userId?.username ||
                  record.userId?.personalInfo?.firstName ||
                  "Unknown"
                }
              />
              <InfoRow
                label="Member Email"
                value={record.userId?.email || "—"}
              />
              <InfoRow label="Sale Date" value={formatDate(record.saleDate)} />
              <InfoRow
                label="Eligible Date"
                value={formatDate(record.eligibleForApprovalDate)}
              />
            </div>
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
                  <p className="text-sm text-gray-600">Income Earned</p>
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

          {/* Plot Details */}
          <Separator />
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Plot Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Plot Number" value={record.plotNumber || "-"} />
              <InfoRow label="Plot Name" value={record.plotId?.plotName || "-"} />
              <InfoRow
                label="Buyer Name"
                value={record.buyerName || "—"}
              />
              <InfoRow
                label="Leg Type"
                value={
                  record.legType === "personal"
                    ? "Personal"
                    : record.legType === "left"
                    ? "Left Leg"
                    : "Right Leg"
                }
              />
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
                        value={`Plot ${
                          record.pairedWith.plotId?.plotNumber || "-"
                        }`}
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
    <p
      className={`${
        small ? "text-xs" : "text-sm"
      } text-gray-600 font-medium`}
    >
      {label}
    </p>
    <div
      className={`${
        small ? "text-sm" : "text-base"
      } font-semibold text-gray-900 break-words`}
    >
      {value}
    </div>
  </div>
);

// Loading Skeleton
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-50 py-8 px-4">
    <div className="max-w-7xl mx-auto space-y-8">
      <Skeleton className="h-12 w-96" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
      <Skeleton className="h-48" />
      <div className="grid sm:grid-cols-2 gap-6">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
      <Skeleton className="h-96" />
    </div>
  </div>
);

export default MyTeamIncomeDashboard;