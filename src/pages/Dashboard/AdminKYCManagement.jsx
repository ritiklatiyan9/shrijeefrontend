// KYCManagement.jsx - Separate KYC Management Page

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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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

const API_BASE_URL = 'http://localhost:5000/api/v1/admin';

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
        const response = await axios.post('http://localhost:5000/api/v1/users/refresh-token', {
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

const KYCManagement = () => {
  const [pendingKYC, setPendingKYC] = useState([]);
  const [verifiedKYC, setVerifiedKYC] = useState([]);
  const [rejectedKYC, setRejectedKYC] = useState([]);
  const [loading, setLoading] = useState({ pending: true, verified: true, rejected: true });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [userToReject, setUserToReject] = useState(null);
  const [activeTab, setActiveTab] = useState('pending'); // Default to pending
  const navigate = useNavigate();

  // Fetch pending KYC
  const fetchPendingKYC = async () => {
    try {
      setLoading(prev => ({ ...prev, pending: true }));
      const response = await apiClient.get('/kyc/pending');
      setPendingKYC(response.data.data.users);
    } catch (error) {
      console.error('Error fetching pending KYC:', error);
      toast.error('Failed to fetch pending KYC');
    } finally {
      setLoading(prev => ({ ...prev, pending: false }));
    }
  };

  // Fetch verified KYC
  const fetchVerifiedKYC = async () => {
    try {
      setLoading(prev => ({ ...prev, verified: true }));
      const response = await apiClient.get('/kyc/verified');
      setVerifiedKYC(response.data.data.users);
    } catch (error) {
      console.error('Error fetching verified KYC:', error);
    } finally {
      setLoading(prev => ({ ...prev, verified: false }));
    }
  };

  // Fetch rejected KYC
  const fetchRejectedKYC = async () => {
    try {
      setLoading(prev => ({ ...prev, rejected: true }));
      const response = await apiClient.get('/kyc/rejected');
      setRejectedKYC(response.data.data.users);
    } catch (error) {
      console.error('Error fetching rejected KYC:', error);
    } finally {
      setLoading(prev => ({ ...prev, rejected: false }));
    }
  };

  // Approve KYC
  const handleApproveKYC = async (userId) => {
    try {
      await apiClient.patch(`/kyc/${userId}/approve`);
      toast.success('KYC approved successfully');
      fetchPendingKYC(); // Refresh pending list
      fetchVerifiedKYC(); // Refresh verified list
      // Optionally refresh dashboard stats here if needed in this component
      // fetchStats(); // This would require importing/fetching stats function
    } catch (error) {
      console.error('Error approving KYC:', error);
      toast.error(error.response?.data?.message || 'Failed to approve KYC');
    }
  };

  // Reject KYC
  const handleRejectKYC = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    try {
      await apiClient.patch(`/kyc/${userToReject}/reject`, {
        reason: rejectionReason,
      });
      toast.success('KYC rejected successfully');
      setShowRejectDialog(false);
      setRejectionReason('');
      setUserToReject(null);
      fetchPendingKYC(); // Refresh pending list
      fetchRejectedKYC(); // Refresh rejected list
      // Optionally refresh dashboard stats here if needed in this component
      // fetchStats(); // This would require importing/fetching stats function
    } catch (error) {
      console.error('Error rejecting KYC:', error);
      toast.error(error.response?.data?.message || 'Failed to reject KYC');
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

  // Open KYC document in new tab
  const openDocument = (documentUrl, documentType) => {
    if (documentUrl) {
      window.open(documentUrl, '_blank', 'noopener,noreferrer');
    } else {
      toast.error(`No ${documentType} document available.`);
    }
  };

  // Open Additional KYC document in new tab
  const openAdditionalDocument = (documentUrl) => {
    if (documentUrl) {
      window.open(documentUrl, '_blank', 'noopener,noreferrer');
    } else {
      toast.error('No document available.');
    }
  };

  useEffect(() => {
    fetchPendingKYC();
    fetchVerifiedKYC();
    fetchRejectedKYC();
  }, []);

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingKYC();
    } else if (activeTab === 'verified') {
      fetchVerifiedKYC();
    } else if (activeTab === 'rejected') {
      fetchRejectedKYC();
    }
  }, [activeTab]);

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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">KYC Management</h1>
          <p className="text-muted-foreground">
            Review and manage user KYC verifications
          </p>
        </div>
        <Button onClick={() => { fetchPendingKYC(); fetchVerifiedKYC(); fetchRejectedKYC(); }} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh All
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            <Clock className="mr-2 h-4 w-4" />
            Pending ({pendingKYC.length})
          </TabsTrigger>
          <TabsTrigger value="verified">
            <CheckCircle className="mr-2 h-4 w-4" />
            Verified ({verifiedKYC.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            <XCircle className="mr-2 h-4 w-4" />
            Rejected ({rejectedKYC.length})
          </TabsTrigger>
        </TabsList>

        {/* Pending KYC */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending KYC Verifications</CardTitle>
              <CardDescription>Review and approve user KYC documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Documents</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading.pending ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          <div className="flex justify-center py-4">
                            <RefreshCw className="h-6 w-6 animate-spin" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : pendingKYC.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No pending KYC verifications
                        </TableCell>
                      </TableRow>
                    ) : (
                      pendingKYC.map((user) => (
                        <TableRow key={user._id}>
                          <TableCell className="font-medium">{user.memberId}</TableCell>
                          <TableCell>
                            {user.personalInfo?.firstName} {user.personalInfo?.lastName}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {user.kycDocuments?.aadharDocumentUrl && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openDocument(user.kycDocuments.aadharDocumentUrl, 'Aadhar')}
                                  className="h-6 px-2 text-xs"
                                >
                                  View Aadhar <ExternalLink className="ml-1 h-3 w-3" />
                                </Button>
                              )}
                              {user.kycDocuments?.panDocumentUrl && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openDocument(user.kycDocuments.panDocumentUrl, 'PAN')}
                                  className="h-6 px-2 text-xs"
                                >
                                  View PAN <ExternalLink className="ml-1 h-3 w-3" />
                                </Button>
                              )}
                              {user.kycDocuments?.additionalDocuments && user.kycDocuments.additionalDocuments.length > 0 && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="outline" className="h-6 px-2 text-xs">
                                      View Additional <ExternalLink className="ml-1 h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    {user.kycDocuments.additionalDocuments.map((doc, index) => (
                                      <DropdownMenuItem key={index} onClick={() => openAdditionalDocument(doc.url)}>
                                        Doc {index + 1}
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewUser(user.userId)}
                              >
                                <Eye className="mr-1 h-3 w-3" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleApproveKYC(user.userId)}
                              >
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setUserToReject(user.userId);
                                  setShowRejectDialog(true);
                                }}
                              >
                                <XCircle className="mr-1 h-3 w-3" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Verified KYC */}
        <TabsContent value="verified">
          <Card>
            <CardHeader>
              <CardTitle>Verified KYC</CardTitle>
              <CardDescription>Users with verified KYC documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Documents</TableHead>
                      <TableHead>Verified Date</TableHead>
                      <TableHead>Verified By</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading.verified ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          <div className="flex justify-center py-4">
                            <RefreshCw className="h-6 w-6 animate-spin" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : verifiedKYC.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No verified KYC users
                        </TableCell>
                      </TableRow>
                    ) : (
                      verifiedKYC.map((user) => (
                        <TableRow key={user._id}>
                          <TableCell className="font-medium">{user.memberId}</TableCell>
                          <TableCell>
                            {user.personalInfo?.firstName} {user.personalInfo?.lastName}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {user.kycDocuments?.aadharDocumentUrl && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openDocument(user.kycDocuments.aadharDocumentUrl, 'Aadhar')}
                                  className="h-6 px-2 text-xs"
                                >
                                  View Aadhar <ExternalLink className="ml-1 h-3 w-3" />
                                </Button>
                              )}
                              {user.kycDocuments?.panDocumentUrl && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openDocument(user.kycDocuments.panDocumentUrl, 'PAN')}
                                  className="h-6 px-2 text-xs"
                                >
                                  View PAN <ExternalLink className="ml-1 h-3 w-3" />
                                </Button>
                              )}
                              {user.kycDocuments?.additionalDocuments && user.kycDocuments.additionalDocuments.length > 0 && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="outline" className="h-6 px-2 text-xs">
                                      View Additional <ExternalLink className="ml-1 h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    {user.kycDocuments.additionalDocuments.map((doc, index) => (
                                      <DropdownMenuItem key={index} onClick={() => openAdditionalDocument(doc.url)}>
                                        Doc {index + 1}
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.kycDocuments?.verifiedDate
                              ? new Date(user.kycDocuments.verifiedDate).toLocaleDateString()
                              : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {user.verifiedBy || 'N/A'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewUser(user.userId)}
                            >
                              <Eye className="mr-1 h-3 w-3" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rejected KYC */}
        <TabsContent value="rejected">
          <Card>
            <CardHeader>
              <CardTitle>Rejected KYC</CardTitle>
              <CardDescription>Users with rejected KYC documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Documents</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Rejected Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading.rejected ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          <div className="flex justify-center py-4">
                            <RefreshCw className="h-6 w-6 animate-spin" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : rejectedKYC.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No rejected KYC users
                        </TableCell>
                      </TableRow>
                    ) : (
                      rejectedKYC.map((user) => (
                        <TableRow key={user._id}>
                          <TableCell className="font-medium">{user.memberId}</TableCell>
                          <TableCell>
                            {user.personalInfo?.firstName} {user.personalInfo?.lastName}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {user.kycDocuments?.aadharDocumentUrl && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openDocument(user.kycDocuments.aadharDocumentUrl, 'Aadhar')}
                                  className="h-6 px-2 text-xs"
                                >
                                  View Aadhar <ExternalLink className="ml-1 h-3 w-3" />
                                </Button>
                              )}
                              {user.kycDocuments?.panDocumentUrl && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openDocument(user.kycDocuments.panDocumentUrl, 'PAN')}
                                  className="h-6 px-2 text-xs"
                                >
                                  View PAN <ExternalLink className="ml-1 h-3 w-3" />
                                </Button>
                              )}
                              {user.kycDocuments?.additionalDocuments && user.kycDocuments.additionalDocuments.length > 0 && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="outline" className="h-6 px-2 text-xs">
                                      View Additional <ExternalLink className="ml-1 h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    {user.kycDocuments.additionalDocuments.map((doc, index) => (
                                      <DropdownMenuItem key={index} onClick={() => openAdditionalDocument(doc.url)}>
                                        Doc {index + 1}
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {user.kycDocuments?.rejectionReason || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {user.kycDocuments?.verifiedDate
                              ? new Date(user.kycDocuments.verifiedDate).toLocaleDateString()
                              : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewUser(user.userId)}
                            >
                              <Eye className="mr-1 h-3 w-3" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reject KYC Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject KYC</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this KYC application
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason('');
                setUserToReject(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectKYC}>
              Reject KYC
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Details Dialog - Reusing from UserManagement */}
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
                          onClick={() => openDocument(selectedUser.kycDocuments.aadharDocumentUrl, 'Aadhar')}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Aadhar Document
                        </Button>
                      )}
                      {selectedUser.kycDocuments?.panDocumentUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDocument(selectedUser.kycDocuments.panDocumentUrl, 'PAN')}
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
                              onClick={() => openAdditionalDocument(doc.url)}
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

export default KYCManagement;