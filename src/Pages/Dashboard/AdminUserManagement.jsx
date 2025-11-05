// UserManagement.jsx - Separate Users Management Page

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  TrendingUp,
  Wallet,
  Shield,
  Activity,
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const API_BASE_URL = 'http://13.127.229.155:5000/api/v1/admin';

// Create axios instance with interceptors
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post('http://13.127.229.155:5000/api/v1/users/refresh-token', {
          refreshToken,
        });
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [rankFilter, setRankFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [userToReject, setUserToReject] = useState(null);
  const navigate = useNavigate();

  // Fetch all users
  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (rankFilter !== 'all') params.append('rank', rankFilter);
      const response = await apiClient.get(`/users?${params.toString()}`);
      setUsers(response.data.data.users);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // View user details
  const handleViewUser = async (userId) => {
    try {
      const response = await apiClient.get(`/users/${userId}`);
      setSelectedUser(response.data.data);
      setShowUserDetails(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to fetch user details');
    }
  };

  // Update user status
  const handleUpdateStatus = async (userId, status) => {
    try {
      await apiClient.patch(`/users/${userId}/status`, { status });
      toast.success(`User status updated to ${status}`);
      fetchUsers(currentPage); // Refresh current page after status change
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  // Delete user (block)
  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to block this user?')) return;
    try {
      await apiClient.delete(`/users/${userId}`);
      toast.success('User blocked successfully');
      fetchUsers(currentPage); // Refresh current page after deletion
    } catch (error) {
      console.error('Error blocking user:', error);
      toast.error(error.response?.data?.message || 'Failed to block user');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: 'default',
      pending: 'secondary',
      inactive: 'outline',
      suspended: 'destructive',
      blocked: 'destructive',
    };
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status}
      </Badge>
    );
  };

  const getRankBadge = (rank) => {
    const colors = {
      Bronze: 'bg-orange-100 text-orange-800',
      Silver: 'bg-gray-100 text-gray-800',
      Gold: 'bg-yellow-100 text-yellow-800',
      Platinum: 'bg-blue-100 text-blue-800',
      Diamond: 'bg-purple-100 text-purple-800',
      'Crown Diamond': 'bg-pink-100 text-pink-800',
    };
    return (
      <Badge className={colors[rank] || ''}>
        {rank}
      </Badge>
    );
  };

  // Get KYC status from user object
  const getKYCStatus = (user) => {
    if (user.kycDocuments?.status) {
      return user.kycDocuments.status;
    }
    if (user.kycStatus) {
      return user.kycStatus;
    }
    return 'pending';
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage, searchQuery, statusFilter, rankFilter]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination?.totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            View and manage all users
          </p>
        </div>
        <Button onClick={() => fetchUsers(currentPage)} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage all users</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email, username, or member ID..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
            <Select value={rankFilter} onValueChange={setRankFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Rank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ranks</SelectItem>
                <SelectItem value="Bronze">Bronze</SelectItem>
                <SelectItem value="Silver">Silver</SelectItem>
                <SelectItem value="Gold">Gold</SelectItem>
                <SelectItem value="Platinum">Platinum</SelectItem>
                <SelectItem value="Diamond">Diamond</SelectItem>
                <SelectItem value="Crown Diamond">Crown Diamond</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rank</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>KYC</TableHead>
                  <TableHead>Wallet</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      <div className="flex justify-center py-4">
                        <RefreshCw className="h-6 w-6 animate-spin" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => {
                    const kycStatus = getKYCStatus(user);
                    return (
                      <TableRow key={user._id}>
                        <TableCell className="font-medium">{user.memberId}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.username}</div>
                            <div className="text-sm text-muted-foreground">
                              {user.personalInfo?.firstName} {user.personalInfo?.lastName}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{getRankBadge(user.rank?.current)}</TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>
                          {kycStatus === 'verified' ? (
                            <Badge variant="default">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Verified
                            </Badge>
                          ) : kycStatus === 'rejected' ? (
                            <Badge variant="destructive">
                              <XCircle className="mr-1 h-3 w-3" />
                              Rejected
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <Clock className="mr-1 h-3 w-3" />
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>₹{user.wallet?.balance.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleViewUser(user._id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(user._id, 'active')}
                                disabled={user.status === 'active'}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Set Active
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(user._id, 'suspended')}
                                disabled={user.status === 'suspended'}
                              >
                                <AlertCircle className="mr-2 h-4 w-4" />
                                Suspend
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteUser(user._id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Block User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalUsers} total users)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Complete information about the user
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Member ID</Label>
                  <p className="font-medium">{selectedUser.memberId}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Username</Label>
                  <p className="font-medium">{selectedUser.username}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedUser.status)}</div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">First Name</Label>
                    <p>{selectedUser.personalInfo?.firstName || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Last Name</Label>
                    <p>{selectedUser.personalInfo?.lastName || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <p>{selectedUser.personalInfo?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Date of Birth</Label>
                    <p>
                      {selectedUser.personalInfo?.dateOfBirth
                        ? new Date(selectedUser.personalInfo.dateOfBirth).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">KYC Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Verification Status</Label>
                      <div className="mt-1">
                        {selectedUser.kycDocuments?.status === 'verified' ? (
                          <Badge variant="default">Verified</Badge>
                        ) : selectedUser.kycDocuments?.status === 'rejected' ? (
                          <Badge variant="destructive">Rejected</Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Aadhar Number</Label>
                      <p>{selectedUser.kycDocuments?.aadharNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">PAN Number</Label>
                      <p>{selectedUser.kycDocuments?.panNumber || 'N/A'}</p>
                    </div>
                    {selectedUser.kycDocuments?.verifiedDate && (
                      <div>
                        <Label className="text-muted-foreground">Verified Date</Label>
                        <p>{new Date(selectedUser.kycDocuments.verifiedDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                  {/* KYC Documents Section */}
                  <div>
                    <Label className="text-muted-foreground mb-2 block">KYC Documents</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.kycDocuments?.aadharDocumentUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(selectedUser.kycDocuments.aadharDocumentUrl, '_blank', 'noopener,noreferrer')}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Aadhar Document
                        </Button>
                      )}
                      {selectedUser.kycDocuments?.panDocumentUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(selectedUser.kycDocuments.panDocumentUrl, '_blank', 'noopener,noreferrer')}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View PAN Document
                        </Button>
                      )}
                      {selectedUser.kycDocuments?.additionalDocuments &&
                       selectedUser.kycDocuments.additionalDocuments.length > 0 && (
                        <div className="flex gap-2">
                          {selectedUser.kycDocuments.additionalDocuments.map((doc, index) => (
                            <Button
                              key={index}
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(doc.url, '_blank', 'noopener,noreferrer')}
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Additional Doc {index + 1}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {selectedUser.kycDocuments?.rejectionReason && (
                    <div className="col-span-2">
                      <Label className="text-muted-foreground">Rejection Reason</Label>
                      <p className="text-red-600 mt-1">{selectedUser.kycDocuments.rejectionReason}</p>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Wallet & Financial</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Current Balance</Label>
                    <p className="font-medium">₹{selectedUser.wallet?.balance.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Total Earnings</Label>
                    <p>₹{selectedUser.wallet?.totalEarnings.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Total Withdrawn</Label>
                    <p>₹{selectedUser.wallet?.totalWithdrawn.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Pending Commissions</Label>
                    <p>₹{selectedUser.wallet?.pendingCommissions.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Rank Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Current Rank</Label>
                    <div className="mt-1">{getRankBadge(selectedUser.rank?.current)}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Achieved Date</Label>
                    <p>
                      {new Date(selectedUser.rank?.achievedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              {selectedUser.bankDetails && (
                <div>
                  <h3 className="font-semibold mb-2">Bank Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Account Number</Label>
                      <p>{selectedUser.bankDetails.accountNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">IFSC Code</Label>
                      <p>{selectedUser.bankDetails.ifscCode || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Bank Name</Label>
                      <p>{selectedUser.bankDetails.bankName || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">UPI ID</Label>
                      <p>{selectedUser.bankDetails.upiId || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDetails(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;