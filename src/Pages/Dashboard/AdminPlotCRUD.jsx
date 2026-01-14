// AdminPlotCRUD.jsx - Complete Plot Management with CRUD, Visibility & Installment Settings
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  X,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  Settings,
  IndianRupee,
  Calendar,
  ChevronDown,
  ChevronUp,
  Search,
  RefreshCw,
  AlertTriangle
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
import { Textarea } from "@/components/ui/textarea";

const API_BASE_URL = "https://shreejeebackend.onrender.com/api/v1/plots";

const AdminPlotCRUD = () => {
  const { user, loading: authLoading } = useAuth();
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [filters, setFilters] = useState({
    city: "",
    siteName: "",
    status: "",
    minPrice: "",
    maxPrice: "",
  });
  const [cities, setCities] = useState([]);
  const [sites, setSites] = useState([]);
  const [allPlots, setAllPlots] = useState([]);
  
  // Modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [visibilityModalOpen, setVisibilityModalOpen] = useState(false);
  const [installmentModalOpen, setInstallmentModalOpen] = useState(false);
  
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [response, setResponse] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const plotsPerPage = 20;

  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
  });

  // Fetch all plots for dropdown filters
  const fetchAllPlots = async () => {
    try {
      const { data } = await apiClient.get("/admin/plots", { params: { limit: 1000 } });
      const plotList = data.data.plots || [];
      setAllPlots(plotList);
      const uniqueCities = [...new Set(plotList.map((p) => p.siteLocation?.address?.city).filter(Boolean))];
      setCities(uniqueCities);
    } catch (err) {
      console.error("Error fetching all plots:", err);
    }
  };

  // Fetch filtered plots
  const fetchFilteredPlots = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/admin/plots", {
        params: {
          page: currentPage,
          limit: plotsPerPage,
          city: filters.city || undefined,
          siteName: filters.siteName || undefined,
          status: filters.status || undefined,
          minPrice: filters.minPrice || undefined,
          maxPrice: filters.maxPrice || undefined,
        },
      });
      setPlots(data.data.plots || []);
      setTotalPages(data.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching plots:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchAllPlots();
      fetchFilteredPlots();
    }
  }, [authLoading, user]);

  useEffect(() => {
    if (filters.city) {
      const filteredSites = [
        ...new Set(
          allPlots
            .filter((p) => p.siteLocation?.address?.city === filters.city)
            .map((p) => p.siteLocation?.siteName)
            .filter(Boolean)
        ),
      ];
      setSites(filteredSites);
    } else {
      setSites([]);
    }
  }, [filters.city, allPlots]);

  useEffect(() => {
    fetchFilteredPlots();
  }, [currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchFilteredPlots();
  };

  const handleClearFilters = () => {
    setFilters({ city: "", siteName: "", status: "", minPrice: "", maxPrice: "" });
    setCurrentPage(1);
    fetchFilteredPlots();
  };

  // Open Edit Modal
  const openEditModal = (plot) => {
    setSelectedPlot(plot);
    setEditFormData({
      plotName: plot.plotName || "",
      plotNumber: plot.plotNumber || "",
      size: {
        value: plot.size?.value || "",
        unit: plot.size?.unit || "sqft",
      },
      dimensions: {
        length: plot.dimensions?.length || "",
        width: plot.dimensions?.width || "",
        unit: plot.dimensions?.unit || "ft",
      },
      siteLocation: {
        siteName: plot.siteLocation?.siteName || "",
        phase: plot.siteLocation?.phase || "",
        sector: plot.siteLocation?.sector || "",
        block: plot.siteLocation?.block || "",
        address: {
          city: plot.siteLocation?.address?.city || "",
          state: plot.siteLocation?.address?.state || "",
          pincode: plot.siteLocation?.address?.pincode || "",
        },
      },
      pricing: {
        basePrice: plot.pricing?.basePrice || "",
        pricePerUnit: plot.pricing?.pricePerUnit || "",
        registrationCharges: plot.pricing?.registrationCharges || "",
        developmentCharges: plot.pricing?.developmentCharges || "",
        totalPrice: plot.pricing?.totalPrice || "",
      },
      features: {
        facing: plot.features?.facing || "",
        cornerPlot: plot.features?.cornerPlot || false,
        roadWidth: plot.features?.roadWidth || "",
        electricityConnection: plot.features?.electricityConnection || false,
        waterConnection: plot.features?.waterConnection || false,
        boundaryWall: plot.features?.boundaryWall || false,
        gatedCommunity: plot.features?.gatedCommunity || false,
      },
      status: plot.status || "available",
      description: plot.description || "",
      internalNotes: plot.internalNotes || "",
    });
    setEditModalOpen(true);
    setResponse(null);
  };

  // Handle Edit Submit
  const handleEditSubmit = async () => {
    if (!selectedPlot) return;
    setActionLoading(true);
    setResponse(null);
    
    try {
      const { data } = await apiClient.put(`/admin/plots/${selectedPlot._id}`, editFormData);
      setResponse({ success: true, message: "Plot updated successfully!" });
      setPlots((prev) =>
        prev.map((p) => (p._id === selectedPlot._id ? data.data : p))
      );
      setTimeout(() => {
        setEditModalOpen(false);
        setResponse(null);
      }, 1500);
    } catch (error) {
      setResponse({ 
        success: false, 
        message: error.response?.data?.message || "Failed to update plot" 
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Open Delete Modal
  const openDeleteModal = (plot) => {
    setSelectedPlot(plot);
    setDeleteModalOpen(true);
    setResponse(null);
  };

  // Handle Soft Delete
  const handleSoftDelete = async () => {
    if (!selectedPlot) return;
    setActionLoading(true);
    
    try {
      await apiClient.delete(`/admin/plots/${selectedPlot._id}`);
      setResponse({ success: true, message: "Plot deactivated (soft delete)" });
      setPlots((prev) => prev.filter((p) => p._id !== selectedPlot._id));
      setTimeout(() => {
        setDeleteModalOpen(false);
        setResponse(null);
      }, 1500);
    } catch (error) {
      setResponse({ 
        success: false, 
        message: error.response?.data?.message || "Failed to delete plot" 
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Hard Delete
  const handleHardDelete = async () => {
    if (!selectedPlot) return;
    setActionLoading(true);
    
    try {
      await apiClient.delete(`/admin/plots/${selectedPlot._id}/hard-delete`);
      setResponse({ success: true, message: "Plot permanently deleted" });
      setPlots((prev) => prev.filter((p) => p._id !== selectedPlot._id));
      setTimeout(() => {
        setDeleteModalOpen(false);
        setResponse(null);
      }, 1500);
    } catch (error) {
      setResponse({ 
        success: false, 
        message: error.response?.data?.message || "Failed to delete plot" 
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Open Visibility Modal
  const openVisibilityModal = (plot) => {
    setSelectedPlot(plot);
    setEditFormData({
      showPriceToUser: plot.pricing?.showPriceToUser !== false,
      showBasePrice: plot.pricing?.showBasePrice !== false,
      showTotalPrice: plot.pricing?.showTotalPrice !== false,
      showPricePerUnit: plot.pricing?.showPricePerUnit === true,
    });
    setVisibilityModalOpen(true);
    setResponse(null);
  };

  // Handle Visibility Update
  const handleVisibilityUpdate = async () => {
    if (!selectedPlot) return;
    setActionLoading(true);
    
    try {
      await apiClient.put(`/admin/plots/${selectedPlot._id}/visibility`, editFormData);
      setResponse({ success: true, message: "Visibility settings updated!" });
      fetchFilteredPlots();
      setTimeout(() => {
        setVisibilityModalOpen(false);
        setResponse(null);
      }, 1500);
    } catch (error) {
      setResponse({ 
        success: false, 
        message: error.response?.data?.message || "Failed to update visibility" 
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Open Installment Modal
  const openInstallmentModal = (plot) => {
    setSelectedPlot(plot);
    setEditFormData({
      enabled: plot.installmentPlan?.enabled !== false,
      minDownPaymentPercent: plot.installmentPlan?.minDownPaymentPercent || 20,
      maxInstallments: plot.installmentPlan?.maxInstallments || 12,
      installmentInterestRate: plot.installmentPlan?.installmentInterestRate || 0,
      plans: plot.installmentPlan?.plans || [
        { planName: "6 Month Plan", numberOfInstallments: 6, downPaymentPercent: 20, interestRate: 0, isActive: true },
        { planName: "12 Month Plan", numberOfInstallments: 12, downPaymentPercent: 20, interestRate: 0, isActive: true },
      ],
    });
    setInstallmentModalOpen(true);
    setResponse(null);
  };

  // Handle Installment Plan Update
  const handleInstallmentUpdate = async () => {
    if (!selectedPlot) return;
    setActionLoading(true);
    
    try {
      await apiClient.put(`/admin/plots/${selectedPlot._id}/installment-plan`, editFormData);
      setResponse({ success: true, message: "Installment plan updated!" });
      fetchFilteredPlots();
      setTimeout(() => {
        setInstallmentModalOpen(false);
        setResponse(null);
      }, 1500);
    } catch (error) {
      setResponse({ 
        success: false, 
        message: error.response?.data?.message || "Failed to update installment plan" 
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Add installment plan
  const addInstallmentPlan = () => {
    setEditFormData((prev) => ({
      ...prev,
      plans: [
        ...prev.plans,
        { planName: "", numberOfInstallments: 6, downPaymentPercent: 20, interestRate: 0, isActive: true },
      ],
    }));
  };

  // Remove installment plan
  const removeInstallmentPlan = (index) => {
    setEditFormData((prev) => ({
      ...prev,
      plans: prev.plans.filter((_, i) => i !== index),
    }));
  };

  // Update installment plan field
  const updatePlanField = (index, field, value) => {
    setEditFormData((prev) => ({
      ...prev,
      plans: prev.plans.map((plan, i) =>
        i === index ? { ...plan, [field]: value } : plan
      ),
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      available: "bg-green-500",
      pending: "bg-yellow-500",
      booked: "bg-blue-500",
      sold: "bg-purple-500",
      hold: "bg-orange-500",
      blocked: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
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

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <Card className="mb-6 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Plot Management (CRUD)
          </CardTitle>
          <CardDescription className="text-blue-100">
            Create, Read, Update, Delete plots • Manage visibility & installment settings
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
            <Select
              value={filters.city}
              onValueChange={(value) => setFilters({ ...filters, city: value, siteName: "" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.siteName}
              onValueChange={(value) => setFilters({ ...filters, siteName: value })}
              disabled={!filters.city}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Site" />
              </SelectTrigger>
              <SelectContent>
                {sites.map((site) => (
                  <SelectItem key={site} value={site}>{site}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="hold">Hold</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Min Price"
              type="number"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            />

            <Input
              placeholder="Max Price"
              type="number"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            />

            <div className="flex gap-2">
              <Button onClick={handleSearch} className="flex-1">
                <Search className="h-4 w-4 mr-1" /> Search
              </Button>
              <Button variant="outline" onClick={handleClearFilters}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Plots Table */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
            </div>
          ) : plots.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              No plots found. Try adjusting your filters.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead>Plot #</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Site</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Total Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Price Visible</TableHead>
                      <TableHead>Installment</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plots.map((plot) => (
                      <TableRow key={plot._id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{plot.plotNumber}</TableCell>
                        <TableCell>{plot.plotName}</TableCell>
                        <TableCell>{plot.siteLocation?.siteName || "N/A"}</TableCell>
                        <TableCell>{plot.siteLocation?.address?.city || "N/A"}</TableCell>
                        <TableCell>
                          {plot.size?.value} {plot.size?.unit}
                        </TableCell>
                        <TableCell>
                          ₹{(plot.pricing?.totalPrice || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(plot.status)} text-white`}>
                            {plot.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {plot.pricing?.showPriceToUser !== false ? (
                            <Eye className="h-4 w-4 text-green-500" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-red-500" />
                          )}
                        </TableCell>
                        <TableCell>
                          {plot.installmentPlan?.enabled !== false ? (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Enabled
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-400">
                              Disabled
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal(plot)}
                              title="Edit Plot"
                            >
                              <Edit className="h-4 w-4 text-blue-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openVisibilityModal(plot)}
                              title="Price Visibility"
                            >
                              <Eye className="h-4 w-4 text-purple-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openInstallmentModal(plot)}
                              title="Installment Settings"
                            >
                              <Calendar className="h-4 w-4 text-orange-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteModal(plot)}
                              title="Delete Plot"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Plot Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Edit Plot: {selectedPlot?.plotNumber}
            </DialogTitle>
          </DialogHeader>

          {response && (
            <Alert className={response.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
              <AlertDescription className={response.success ? "text-green-800" : "text-red-800"}>
                {response.message}
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Plot Name *</Label>
                  <Input
                    value={editFormData.plotName || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, plotName: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Plot Number *</Label>
                  <Input
                    value={editFormData.plotNumber || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, plotNumber: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Size Value *</Label>
                  <Input
                    type="number"
                    value={editFormData.size?.value || ""}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      size: { ...editFormData.size, value: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label>Size Unit</Label>
                  <Select
                    value={editFormData.size?.unit || "sqft"}
                    onValueChange={(value) => setEditFormData({
                      ...editFormData,
                      size: { ...editFormData.size, unit: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sqft">Sq. Ft</SelectItem>
                      <SelectItem value="sqm">Sq. M</SelectItem>
                      <SelectItem value="sqyd">Sq. Yd</SelectItem>
                      <SelectItem value="gaj">Gaj</SelectItem>
                      <SelectItem value="bigha">Bigha</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={editFormData.status || "available"}
                    onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="booked">Booked</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="hold">Hold</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editFormData.description || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label>Internal Notes (Admin Only)</Label>
                <Textarea
                  value={editFormData.internalNotes || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, internalNotes: e.target.value })}
                  rows={2}
                />
              </div>
            </TabsContent>

            <TabsContent value="location" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Site Name *</Label>
                  <Input
                    value={editFormData.siteLocation?.siteName || ""}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      siteLocation: { ...editFormData.siteLocation, siteName: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label>Phase</Label>
                  <Input
                    value={editFormData.siteLocation?.phase || ""}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      siteLocation: { ...editFormData.siteLocation, phase: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label>Sector</Label>
                  <Input
                    value={editFormData.siteLocation?.sector || ""}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      siteLocation: { ...editFormData.siteLocation, sector: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label>Block</Label>
                  <Input
                    value={editFormData.siteLocation?.block || ""}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      siteLocation: { ...editFormData.siteLocation, block: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label>City *</Label>
                  <Input
                    value={editFormData.siteLocation?.address?.city || ""}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      siteLocation: {
                        ...editFormData.siteLocation,
                        address: { ...editFormData.siteLocation?.address, city: e.target.value }
                      }
                    })}
                  />
                </div>
                <div>
                  <Label>State *</Label>
                  <Input
                    value={editFormData.siteLocation?.address?.state || ""}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      siteLocation: {
                        ...editFormData.siteLocation,
                        address: { ...editFormData.siteLocation?.address, state: e.target.value }
                      }
                    })}
                  />
                </div>
                <div>
                  <Label>Pincode</Label>
                  <Input
                    value={editFormData.siteLocation?.address?.pincode || ""}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      siteLocation: {
                        ...editFormData.siteLocation,
                        address: { ...editFormData.siteLocation?.address, pincode: e.target.value }
                      }
                    })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Base Price (₹) *</Label>
                  <Input
                    type="number"
                    value={editFormData.pricing?.basePrice || ""}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      pricing: { ...editFormData.pricing, basePrice: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label>Total Price (₹) *</Label>
                  <Input
                    type="number"
                    value={editFormData.pricing?.totalPrice || ""}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      pricing: { ...editFormData.pricing, totalPrice: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label>Price Per Unit</Label>
                  <Input
                    type="number"
                    value={editFormData.pricing?.pricePerUnit || ""}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      pricing: { ...editFormData.pricing, pricePerUnit: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label>Registration Charges</Label>
                  <Input
                    type="number"
                    value={editFormData.pricing?.registrationCharges || ""}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      pricing: { ...editFormData.pricing, registrationCharges: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label>Development Charges</Label>
                  <Input
                    type="number"
                    value={editFormData.pricing?.developmentCharges || ""}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      pricing: { ...editFormData.pricing, developmentCharges: e.target.value }
                    })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="features" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Facing</Label>
                  <Select
                    value={editFormData.features?.facing || ""}
                    onValueChange={(value) => setEditFormData({
                      ...editFormData,
                      features: { ...editFormData.features, facing: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Facing" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="north">North</SelectItem>
                      <SelectItem value="south">South</SelectItem>
                      <SelectItem value="east">East</SelectItem>
                      <SelectItem value="west">West</SelectItem>
                      <SelectItem value="north-east">North-East</SelectItem>
                      <SelectItem value="north-west">North-West</SelectItem>
                      <SelectItem value="south-east">South-East</SelectItem>
                      <SelectItem value="south-west">South-West</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Road Width (ft)</Label>
                  <Input
                    type="number"
                    value={editFormData.features?.roadWidth || ""}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      features: { ...editFormData.features, roadWidth: e.target.value }
                    })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="cornerPlot"
                    checked={editFormData.features?.cornerPlot || false}
                    onCheckedChange={(checked) => setEditFormData({
                      ...editFormData,
                      features: { ...editFormData.features, cornerPlot: checked }
                    })}
                  />
                  <Label htmlFor="cornerPlot">Corner Plot</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="electricityConnection"
                    checked={editFormData.features?.electricityConnection || false}
                    onCheckedChange={(checked) => setEditFormData({
                      ...editFormData,
                      features: { ...editFormData.features, electricityConnection: checked }
                    })}
                  />
                  <Label htmlFor="electricityConnection">Electricity</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="waterConnection"
                    checked={editFormData.features?.waterConnection || false}
                    onCheckedChange={(checked) => setEditFormData({
                      ...editFormData,
                      features: { ...editFormData.features, waterConnection: checked }
                    })}
                  />
                  <Label htmlFor="waterConnection">Water Connection</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="boundaryWall"
                    checked={editFormData.features?.boundaryWall || false}
                    onCheckedChange={(checked) => setEditFormData({
                      ...editFormData,
                      features: { ...editFormData.features, boundaryWall: checked }
                    })}
                  />
                  <Label htmlFor="boundaryWall">Boundary Wall</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="gatedCommunity"
                    checked={editFormData.features?.gatedCommunity || false}
                    onCheckedChange={(checked) => setEditFormData({
                      ...editFormData,
                      features: { ...editFormData.features, gatedCommunity: checked }
                    })}
                  />
                  <Label htmlFor="gatedCommunity">Gated Community</Label>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Plot: {selectedPlot?.plotNumber}
            </DialogTitle>
            <DialogDescription>
              Choose how you want to delete this plot.
            </DialogDescription>
          </DialogHeader>

          {response && (
            <Alert className={response.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
              <AlertDescription className={response.success ? "text-green-800" : "text-red-800"}>
                {response.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 py-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Soft Delete (Recommended)</h4>
              <p className="text-sm text-yellow-700 mb-3">
                Deactivates the plot. It won't appear in listings but data is preserved.
              </p>
              <Button
                variant="outline"
                className="w-full border-yellow-500 text-yellow-700 hover:bg-yellow-100"
                onClick={handleSoftDelete}
                disabled={actionLoading}
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Soft Delete
              </Button>
            </div>

            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2">Hard Delete (Permanent)</h4>
              <p className="text-sm text-red-700 mb-3">
                Permanently removes the plot. This action cannot be undone.
              </p>
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleHardDelete}
                disabled={actionLoading || selectedPlot?.status === 'booked' || selectedPlot?.status === 'sold'}
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Permanently Delete
              </Button>
              {(selectedPlot?.status === 'booked' || selectedPlot?.status === 'sold') && (
                <p className="text-xs text-red-600 mt-2">
                  Cannot hard delete booked/sold plots
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Visibility Settings Modal */}
      <Dialog open={visibilityModalOpen} onOpenChange={setVisibilityModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-500" />
              Price Visibility: {selectedPlot?.plotNumber}
            </DialogTitle>
            <DialogDescription>
              Control what pricing information users can see for this plot.
            </DialogDescription>
          </DialogHeader>

          {response && (
            <Alert className={response.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
              <AlertDescription className={response.success ? "text-green-800" : "text-red-800"}>
                {response.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <Label className="font-medium">Show Price to Users</Label>
                <p className="text-sm text-gray-500">Master toggle for all pricing</p>
              </div>
              <Switch
                checked={editFormData.showPriceToUser}
                onCheckedChange={(checked) => setEditFormData({ ...editFormData, showPriceToUser: checked })}
              />
            </div>

            <div className="pl-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label>Show Base Price</Label>
                <Switch
                  checked={editFormData.showBasePrice}
                  onCheckedChange={(checked) => setEditFormData({ ...editFormData, showBasePrice: checked })}
                  disabled={!editFormData.showPriceToUser}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Show Total Price</Label>
                <Switch
                  checked={editFormData.showTotalPrice}
                  onCheckedChange={(checked) => setEditFormData({ ...editFormData, showTotalPrice: checked })}
                  disabled={!editFormData.showPriceToUser}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Show Price Per Unit</Label>
                <Switch
                  checked={editFormData.showPricePerUnit}
                  onCheckedChange={(checked) => setEditFormData({ ...editFormData, showPricePerUnit: checked })}
                  disabled={!editFormData.showPriceToUser}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setVisibilityModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleVisibilityUpdate} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Installment Plan Settings Modal */}
      <Dialog open={installmentModalOpen} onOpenChange={setInstallmentModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              Installment Plan: {selectedPlot?.plotNumber}
            </DialogTitle>
            <DialogDescription>
              Configure installment payment options for this plot.
            </DialogDescription>
          </DialogHeader>

          {response && (
            <Alert className={response.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
              <AlertDescription className={response.success ? "text-green-800" : "text-red-800"}>
                {response.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-6 py-4">
            {/* Enable Toggle */}
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <div>
                <Label className="font-medium text-lg">Enable Installment Payments</Label>
                <p className="text-sm text-gray-600">Allow users to pay in installments</p>
              </div>
              <Switch
                checked={editFormData.enabled}
                onCheckedChange={(checked) => setEditFormData({ ...editFormData, enabled: checked })}
              />
            </div>

            {editFormData.enabled && (
              <>
                {/* Default Settings */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Min Down Payment (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={editFormData.minDownPaymentPercent}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        minDownPaymentPercent: parseFloat(e.target.value) || 0
                      })}
                    />
                  </div>
                  <div>
                    <Label>Max Installments</Label>
                    <Input
                      type="number"
                      min="1"
                      value={editFormData.maxInstallments}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        maxInstallments: parseInt(e.target.value) || 12
                      })}
                    />
                  </div>
                  <div>
                    <Label>Interest Rate (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={editFormData.installmentInterestRate}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        installmentInterestRate: parseFloat(e.target.value) || 0
                      })}
                    />
                  </div>
                </div>

                {/* Predefined Plans */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-lg font-medium">Installment Plans</Label>
                    <Button variant="outline" size="sm" onClick={addInstallmentPlan}>
                      <Plus className="h-4 w-4 mr-1" /> Add Plan
                    </Button>
                  </div>

                  {editFormData.plans?.map((plan, index) => (
                    <div key={index} className="p-4 border rounded-lg mb-3 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <Input
                          placeholder="Plan Name"
                          value={plan.planName}
                          onChange={(e) => updatePlanField(index, 'planName', e.target.value)}
                          className="w-48"
                        />
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Label className="text-sm">Active</Label>
                            <Switch
                              checked={plan.isActive}
                              onCheckedChange={(checked) => updatePlanField(index, 'isActive', checked)}
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeInstallmentPlan(index)}
                            disabled={editFormData.plans.length <= 1}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        <div>
                          <Label className="text-xs">No. of Installments</Label>
                          <Input
                            type="number"
                            min="1"
                            value={plan.numberOfInstallments}
                            onChange={(e) => updatePlanField(index, 'numberOfInstallments', parseInt(e.target.value) || 6)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Down Payment (%)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={plan.downPaymentPercent}
                            onChange={(e) => updatePlanField(index, 'downPaymentPercent', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Interest Rate (%)</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.1"
                            value={plan.interestRate}
                            onChange={(e) => updatePlanField(index, 'interestRate', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">EMI Amount (₹)</Label>
                          <Input
                            type="number"
                            min="0"
                            value={plan.emiAmount || ''}
                            placeholder="Auto"
                            onChange={(e) => updatePlanField(index, 'emiAmount', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setInstallmentModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInstallmentUpdate} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Installment Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPlotCRUD;
