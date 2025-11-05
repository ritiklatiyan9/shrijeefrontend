// AdminDashboard.jsx - Main Dashboard Page for Admins

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

const API_BASE_URL = 'https://shreejeebackend.onrender.com/api/v1/admin';

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
        const response = await axios.post('https://shreejeebackend.onrender.com/api/v1/users/refresh-token', {
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

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch dashboard statistics
  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/dashboard/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to fetch dashboard statistics');
    } finally {
      setLoading(false); // Ensure loading stops even if fetch fails
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users, KYC verifications, and system operations
          </p>
        </div>
        <Button onClick={fetchStats} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Dashboard Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.total}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.users.recentRegistrations} in last 30 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.active}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.users.active / stats.users.total) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending KYC</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.kyc.pending}</div>
            <p className="text-xs text-muted-foreground">
              {stats.kyc.verified} verified
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Wallet Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{stats.wallet.totalBalance.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              ₹{stats.wallet.totalWithdrawn.toLocaleString()} withdrawn
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Status Distribution</CardTitle>
            <CardDescription>Current status of all users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Active</span>
              <Badge variant="default">{stats.users.active}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Pending</span>
              <Badge variant="secondary">{stats.users.pending}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Suspended</span>
              <Badge variant="destructive">{stats.users.suspended}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Blocked</span>
              <Badge variant="destructive">{stats.users.blocked}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Rank Distribution</CardTitle>
            <CardDescription>Users by rank levels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.ranks.map((rank) => (
              <div key={rank._id} className="flex items-center justify-between">
                <span className="text-sm">{rank._id}</span>
                <Badge variant="outline">{rank.count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Optional: Add more dashboard content here */}
    </div>
  );
};

export default AdminDashboard;