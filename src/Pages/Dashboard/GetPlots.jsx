// Updated components/Plots.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, X, Info, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

const API_BASE_URL = "http://13.127.229.155:5000/api/v1/plots";

const Plots = () => {
  const { user, loading: authLoading } = useAuth();
  const [plots, setPlots] = useState([]);
  const [allPlots, setAllPlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [filters, setFilters] = useState({ city: "", siteName: "", facing: "" });
  const [sites, setSites] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [showModal, setShowModal] = useState(false);
  // Initialize tokenAmount to 0
  const [tokenAmount, setTokenAmount] = useState(0);
  const [bookingResponse, setBookingResponse] = useState(null);

  // Axios instance with auth
  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
  });

  // Fetch all plots (for dropdowns)
  const fetchAllPlots = async () => {
    try {
      const { data } = await apiClient.get("/user/plots/available", { 
        params: { limit: 1000 } 
      });
      const plots = data.data.plots || [];
      setAllPlots(plots);
      const uniqueCities = [
        ...new Set(plots.map((p) => p.siteLocation.address.city)),
      ];
      setCities(uniqueCities);
    } catch (err) {
      console.error("Error fetching plots:", err);
    }
  };

  // Fetch filtered plots
  const fetchPlots = async () => {
    if (!filters.city) return;
    setLoading(true);
    try {
      const { data } = await apiClient.get("/user/plots/available", {
        params: {
          city: filters.city,
          siteName: filters.siteName || undefined,
          facing: filters.facing || undefined,
          limit: 200,
        },
      });
      setPlots(data.data.plots || []);
    } catch (err) {
      console.error("Error fetching plots:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load cities once user is authenticated
  useEffect(() => {
    if (!authLoading && user) fetchAllPlots();
  }, [authLoading, user]);

  // When a city is selected, filter sites belonging to that city
  useEffect(() => {
    if (filters.city) {
      const filteredSites = [
        ...new Set(
          allPlots
            .filter((p) => p.siteLocation.address.city === filters.city)
            .map((p) => p.siteLocation.siteName)
        ),
      ];
      setSites(filteredSites);
    } else {
      setSites([]);
    }
  }, [filters.city, allPlots]);

  // Removed the useEffect that auto-set tokenAmount to 10% of the price

  const handleSearch = () => fetchPlots();

  const getStatusColor = (status) => {
    if (status === "booked") return "bg-red-500 text-white";
    if (status === "pending") return "bg-yellow-500 text-black";
    if (status === "available") return "bg-green-500 text-white";
    return "bg-gray-300 text-black";
  };

  const handlePlotClick = (plot) => {
    setSelectedPlot(plot);
    // Explicitly set tokenAmount to 0 when a plot is clicked
    setTokenAmount(0);
    setBookingResponse(null);
    setShowModal(true);
  };

  const handleBookPlot = async () => {
    if (!selectedPlot) return;
    setBookingLoading(true);
    setBookingResponse(null);
    
    try {
      // Endpoint call with potentially 0 tokenAmount
      const response = await apiClient.post("/user/plots/book", {
        plotId: selectedPlot._id,
        tokenAmount,
      });

      if (response.data.success) {
        setBookingResponse(response.data.data);
        
        // Update local state to pending
        setPlots((prev) =>
          prev.map((p) => 
            p._id === selectedPlot._id 
              ? { ...p, status: "pending" } 
              : p
          )
        );
        setSelectedPlot({ ...selectedPlot, status: "pending" });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Unknown error";
      alert("Booking failed: " + errorMessage);
      console.error("Booking error:", error);
    } finally {
      setBookingLoading(false);
    }
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
        Please log in to view available plots.
      </div>
    );

  return (
    <div className="p-6">
      {/* 🔍 Filters */}
      <Card className="mb-6 shadow-md border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Search Plots</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          {/* 🏙 City Dropdown */}
          <Select
            value={filters.city}
            onValueChange={(value) =>
              setFilters({ city: value, siteName: "", facing: "" })
            }
          >
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Select City" />
            </SelectTrigger>
            <SelectContent>
              {cities.length > 0 ? (
                cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))
              ) : (
                <div className="text-gray-400 p-2">No cities found</div>
              )}
            </SelectContent>
          </Select>

          {/* 🏗 Site Dropdown */}
          <Select
            value={filters.siteName}
            onValueChange={(value) =>
              setFilters({ ...filters, siteName: value })
            }
            disabled={!filters.city}
          >
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Select Site" />
            </SelectTrigger>
            <SelectContent>
              {sites.length > 0 ? (
                sites.map((site) => (
                  <SelectItem key={site} value={site}>
                    {site}
                  </SelectItem>
                ))
              ) : (
                <div className="text-gray-400 p-2">
                  {filters.city ? "No sites found" : "Select a city first"}
                </div>
              )}
            </SelectContent>
          </Select>

          {/* 🧭 Facing Dropdown */}
          <Select
            value={filters.facing}
            onValueChange={(value) => setFilters({ ...filters, facing: value })}
            disabled={!filters.city}
          >
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Facing" />
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

          <Button onClick={handleSearch} disabled={!filters.city || loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : "Search"}
          </Button>
        </CardContent>
      </Card>

      {/* 🧱 Plot Grid */}
      {!filters.city ? (
        <p className="text-center text-gray-500 mt-10">
          Please select a city to view plots.
        </p>
      ) : loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
        </div>
      ) : plots.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">No plots found.</p>
      ) : (
        <div className="grid grid-cols-10 gap-3">
          {plots.map((plot) => (
            <div
              key={plot._id}
              onClick={() => handlePlotClick(plot)}
              className={`p-3 rounded-lg cursor-pointer flex flex-col items-center justify-center text-center transition-all duration-200 hover:opacity-90 ${getStatusColor(
                plot.status
              )}`}
            >
              {/* Plot Number */}
              <div className="font-bold text-sm">{plot.plotNumber}</div>

              {/* Full Site Name */}
              <div
                className="text-[12px] mt-1 text-white font-medium leading-tight break-words text-center px-1"
                style={{ wordBreak: "break-word", whiteSpace: "normal" }}
              >
                {plot.siteLocation?.siteName || "N/A"}
              </div>
              
              {/* Pending indicator */}
              {plot.status === "pending" && (
                <div className="absolute top-1 right-1">
                  <Clock className="h-3 w-3 text-black" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 📄 Plot Details Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-start justify-between">
            <DialogTitle className="text-2xl font-bold">
              {selectedPlot?.plotName} - {selectedPlot?.plotNumber}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowModal(false)}
              className="p-1 h-auto"
            >
              <X className="h-5 w-5" />
            </Button>
          </DialogHeader>

          {selectedPlot && (
            <div className="space-y-4">
              {/* Success Message */}
              {bookingResponse && (
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <div className="font-semibold mb-1">
                      Booking request submitted for {bookingResponse.bookingType.replace('_', ' ')}!
                    </div>
                    <div className="text-sm">
                      Your booking is pending admin approval.
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Location</h3>
                  <p>{selectedPlot.siteLocation.siteName}</p>
                  <p>
                    {selectedPlot.siteLocation.address.city},{" "}
                    {selectedPlot.siteLocation.address.state}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Size</h3>
                  <p>
                    {selectedPlot.size.value} {selectedPlot.size.unit}
                  </p>
                  <p>
                    Dimensions: {selectedPlot.dimensions.length} ×{" "}
                    {selectedPlot.dimensions.width}{" "}
                    {selectedPlot.dimensions.unit}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Pricing</h3>
                  <p>
                    Base Price: ₹
                    {selectedPlot.pricing.basePrice.toLocaleString()}
                  </p>
                  <p>
                    Total Price: ₹
                    {selectedPlot.pricing.totalPrice.toLocaleString()}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Features</h3>
                  <p>Facing: {selectedPlot.features.facing}</p>
                  <p>
                    Corner Plot:{" "}
                    {selectedPlot.features.cornerPlot ? "Yes" : "No"}
                  </p>
                  <p>Road Width: {selectedPlot.features.roadWidth} ft</p>
                </div>
              </div>

              {/* Booking Section */}
              {selectedPlot.status === "available" && !bookingResponse && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Book Plot</h3>
                  
                  {/* Info Alert about automatic team detection */}
                  <Alert className="mb-4 bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 text-sm">
                      The system will automatically detect your team position and book accordingly.
                      Booking requires admin approval. Token amount can be 0.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
              

                    <Button
                      onClick={handleBookPlot}
                      disabled={bookingLoading}
                      className="w-full"
                    >
                      {bookingLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Booking...
                        </>
                      ) : (
                        "Request Booking"
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Pending Status */}
              {selectedPlot.status === "pending" && (
                <Alert className="bg-yellow-50 border-yellow-200">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    This booking is pending admin approval. You will be notified once approved.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end">
                <Badge
                  variant={
                    selectedPlot.status === "available"
                      ? "outline"
                      : selectedPlot.status === "pending"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {selectedPlot.status}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Plots;