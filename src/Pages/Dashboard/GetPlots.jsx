import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, X, Info, Clock, CreditCard, Banknote, Calendar, IndianRupee } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

const API_BASE_URL = "https://shreejeebackend.onrender.com/api/v1/plots";

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
  const [tokenAmount, setTokenAmount] = useState(0);
  const [bookingResponse, setBookingResponse] = useState(null);
  
  // New payment type state
  const [paymentType, setPaymentType] = useState("full");
  const [selectedPlanName, setSelectedPlanName] = useState("");
  const [installmentPreview, setInstallmentPreview] = useState(null);

  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
  });

  const fetchAllPlots = async () => {
    try {
      const { data } = await apiClient.get("/user/plots/available", {
        params: { limit: 1000 },
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

  useEffect(() => {
    if (!authLoading && user) fetchAllPlots();
  }, [authLoading, user]);

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

  const handleSearch = () => fetchPlots();

  const getStatusColor = (status) => {
    if (status === "booked") return "bg-red-500 text-white";
    if (status === "pending") return "bg-yellow-400 text-black";
    if (status === "available") return "bg-green-500 text-white";
    return "bg-gray-300 text-black";
  };

  const handlePlotClick = (plot) => {
    setSelectedPlot(plot);
    setTokenAmount(0);
    setBookingResponse(null);
    setPaymentType("full");
    setSelectedPlanName("");
    setInstallmentPreview(null);
    setShowModal(true);
  };

  // Calculate installment preview
  const calculateInstallmentPreview = (plot, planName) => {
    if (!plot || !plot.installmentPlan?.enabled) return null;

    const totalPrice = plot.pricing?.totalPrice || 0;
    let plan = null;

    if (planName && plot.installmentPlan?.plans?.length > 0) {
      plan = plot.installmentPlan.plans.find(p => p.planName === planName && p.isActive);
    }

    if (!plan && plot.installmentPlan?.plans?.length > 0) {
      plan = plot.installmentPlan.plans.find(p => p.isActive);
    }

    // Use default settings if no predefined plan
    const downPaymentPercent = plan?.downPaymentPercent || plot.installmentPlan?.minDownPaymentPercent || 20;
    const numberOfInstallments = plan?.numberOfInstallments || plot.installmentPlan?.maxInstallments || 12;
    const interestRate = plan?.interestRate || plot.installmentPlan?.installmentInterestRate || 0;

    const downPaymentAmount = Math.round((totalPrice * downPaymentPercent) / 100);
    const remainingAmount = totalPrice - downPaymentAmount;
    const totalWithInterest = Math.round(remainingAmount * (1 + (interestRate / 100)));
    const emiAmount = plan?.emiAmount || Math.ceil(totalWithInterest / numberOfInstallments);
    const totalPayable = downPaymentAmount + (emiAmount * numberOfInstallments);

    return {
      planName: plan?.planName || "Default Plan",
      downPaymentPercent,
      downPaymentAmount,
      numberOfInstallments,
      interestRate,
      emiAmount,
      totalPayable,
      savings: totalPrice - totalPayable <= 0 ? 0 : totalPrice - totalPayable,
      extraCost: totalPayable - totalPrice > 0 ? totalPayable - totalPrice : 0
    };
  };

  // Update preview when payment type or plan changes
  useEffect(() => {
    if (paymentType === "installment" && selectedPlot) {
      const preview = calculateInstallmentPreview(selectedPlot, selectedPlanName);
      setInstallmentPreview(preview);
    } else {
      setInstallmentPreview(null);
    }
  }, [paymentType, selectedPlanName, selectedPlot]);

  const handleBookPlot = async () => {
    if (!selectedPlot) return;
    setBookingLoading(true);
    setBookingResponse(null);

    try {
      const response = await apiClient.post("/user/plots/book", {
        plotId: selectedPlot._id,
        paymentType,
        selectedPlanName: paymentType === "installment" ? (selectedPlanName || installmentPreview?.planName) : null,
      });

      if (response.data.success) {
        setBookingResponse(response.data.data);

        setPlots((prev) =>
          prev.map((p) =>
            p._id === selectedPlot._id ? { ...p, status: "pending" } : p
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
    <div className="p-4 sm:p-6">
      {/* Filters */}
      <Card className="mb-6 shadow-md border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Search Plots</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row flex-wrap gap-4">
          <Select
            value={filters.city}
            onValueChange={(value) =>
              setFilters({ city: value, siteName: "", facing: "" })
            }
          >
            <SelectTrigger className="w-full sm:w-52">
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

          <Select
            value={filters.siteName}
            onValueChange={(value) =>
              setFilters({ ...filters, siteName: value })
            }
            disabled={!filters.city}
          >
            <SelectTrigger className="w-full sm:w-52">
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

          <Select
            value={filters.facing}
            onValueChange={(value) => setFilters({ ...filters, facing: value })}
            disabled={!filters.city}
          >
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue placeholder="Facing" />
            </SelectTrigger>
            <SelectContent>
              {[
                "north",
                "south",
                "east",
                "west",
                "north-east",
                "north-west",
                "south-east",
                "south-west",
              ].map((dir) => (
                <SelectItem key={dir} value={dir}>
                  {dir.replace("-", " ").toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleSearch}
            disabled={!filters.city || loading}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              "Search"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Plot Grid */}
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-10 gap-3">
          {plots.map((plot) => (
            <div
              key={plot._id}
              onClick={() => handlePlotClick(plot)}
              className={`relative p-3 rounded-lg cursor-pointer flex flex-col items-center justify-center text-center transition-all duration-200 hover:opacity-90 ${getStatusColor(
                plot.status
              )}`}
            >
              <div className="font-bold text-sm">{plot.plotNumber}</div>
              <div className="text-[11px] mt-1 text-white font-medium leading-tight break-words text-center px-1">
                {plot.siteLocation?.siteName || "N/A"}
              </div>
              {plot.status === "pending" && (
                <div className="absolute top-1 right-1">
                  <Clock className="h-3 w-3 text-black" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-start justify-between">
            <DialogTitle className="text-xl sm:text-2xl font-bold">
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
            <div className="space-y-4 text-sm sm:text-base">
              {bookingResponse && (
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <div className="font-semibold mb-1">
                      Booking request submitted for{" "}
                      {bookingResponse.bookingType.replace("_", " ")}!
                    </div>
                    <div className="text-sm">
                      Your booking is pending admin approval.
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Plot Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Pricing</h3>
                  {selectedPlot.pricing?.showPriceToUser !== false ? (
                    <>
                      {selectedPlot.pricing?.showBasePrice !== false && (
                        <p>
                          Base Price: ₹
                          {selectedPlot.pricing.basePrice.toLocaleString()}
                        </p>
                      )}
                      {selectedPlot.pricing?.showTotalPrice !== false && (
                        <p className="font-semibold text-lg">
                          Total Price: ₹
                          {selectedPlot.pricing.totalPrice.toLocaleString()}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500 italic">Contact for pricing</p>
                  )}
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

              {/* Booking Section with Payment Type Selection */}
              {selectedPlot.status === "available" && !bookingResponse && (
                <div className="border-t pt-4 space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Book This Plot
                  </h3>
                  
                  {/* Payment Type Selection */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <Label className="text-base font-medium mb-3 block">
                      Choose Payment Option
                    </Label>
                    <RadioGroup
                      value={paymentType}
                      onValueChange={setPaymentType}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                    >
                      <div className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-all ${
                        paymentType === "full" 
                          ? "border-blue-500 bg-blue-50" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}>
                        <RadioGroupItem value="full" id="full" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="full" className="flex items-center gap-2 cursor-pointer font-medium">
                            <Banknote className="h-4 w-4 text-green-600" />
                            Full Payment
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">
                            Pay the entire amount at once
                          </p>
                          {selectedPlot.pricing?.showPriceToUser !== false && selectedPlot.pricing?.showTotalPrice !== false && (
                            <p className="text-sm font-semibold text-green-600 mt-1">
                              ₹{(selectedPlot.pricing?.totalPrice || 0).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Show installment option if enabled AND showInstallmentPrices is true */}
                      {selectedPlot.installmentPlan?.enabled && 
                       selectedPlot.pricing?.showInstallmentPrices !== false && (
                        <div className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-all ${
                          paymentType === "installment" 
                            ? "border-blue-500 bg-blue-50" 
                            : "border-gray-200 hover:border-gray-300"
                        }`}>
                          <RadioGroupItem 
                            value="installment" 
                            id="installment" 
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <Label htmlFor="installment" className="flex items-center gap-2 cursor-pointer font-medium">
                              <Calendar className="h-4 w-4 text-orange-600" />
                              Pay in Installments
                            </Label>
                            <p className="text-sm text-gray-600 mt-1">
                              Flexible EMI options available
                            </p>
                          </div>
                        </div>
                      )}
                    </RadioGroup>
                  </div>

                  {/* Installment Plan Selection & Preview */}
                  {paymentType === "installment" && 
                   selectedPlot.installmentPlan?.enabled && 
                   selectedPlot.pricing?.showInstallmentPrices !== false && (
                    <div className="bg-orange-50 p-4 rounded-lg space-y-4">
                      {/* Plan Selection */}
                      {selectedPlot.installmentPlan?.plans?.length > 0 && (
                        <div>
                          <Label className="mb-2 block">Select Installment Plan</Label>
                          <Select
                            value={selectedPlanName}
                            onValueChange={setSelectedPlanName}
                          >
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Choose a plan" />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedPlot.installmentPlan.plans
                                .filter(plan => plan.isActive)
                                .map((plan) => (
                                  <SelectItem key={plan.planName} value={plan.planName}>
                                    {plan.planName} - {plan.numberOfInstallments} EMIs @ {plan.downPaymentPercent}% down
                                  </SelectItem>
                                ))
                              }
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Installment Preview */}
                      {installmentPreview && (
                        <div className="bg-white p-4 rounded-lg border border-orange-200">
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <IndianRupee className="h-4 w-4" />
                            Payment Breakdown: {installmentPreview.planName}
                          </h4>
                          
                          {/* Show rupee amounts only if showPriceToUser is true */}
                          {selectedPlot.pricing?.showPriceToUser !== false ? (
                            <>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <p className="text-gray-600">Down Payment ({installmentPreview.downPaymentPercent}%)</p>
                                  <p className="font-semibold">₹{installmentPreview.downPaymentAmount.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">No. of EMIs</p>
                                  <p className="font-semibold">{installmentPreview.numberOfInstallments} months</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">EMI Amount</p>
                                  <p className="font-semibold">₹{installmentPreview.emiAmount.toLocaleString()}/month</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Interest Rate</p>
                                  <p className="font-semibold">{installmentPreview.interestRate}%</p>
                                </div>
                              </div>
                              <div className="mt-3 pt-3 border-t">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">Total Payable Amount</span>
                                  <span className="text-lg font-bold text-orange-600">
                                    ₹{installmentPreview.totalPayable.toLocaleString()}
                                  </span>
                                </div>
                                {installmentPreview.extraCost > 0 && (
                                  <p className="text-xs text-gray-500 text-right mt-1">
                                    (Interest: ₹{installmentPreview.extraCost.toLocaleString()})
                                  </p>
                                )}
                              </div>
                            </>
                          ) : (
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-600">Down Payment</p>
                                <p className="font-semibold">{installmentPreview.downPaymentPercent}%</p>
                              </div>
                              <div>
                                <p className="text-gray-600">No. of EMIs</p>
                                <p className="font-semibold">{installmentPreview.numberOfInstallments} months</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Interest Rate</p>
                                <p className="font-semibold">{installmentPreview.interestRate}%</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Pricing</p>
                                <p className="text-sm text-orange-600">Contact for details</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 text-sm">
                      Your booking request will be sent for admin approval. 
                      Payment details will be finalized after approval.
                    </AlertDescription>
                  </Alert>

                  <Button
                    onClick={handleBookPlot}
                    disabled={bookingLoading}
                    className="w-full"
                    size="lg"
                  >
                    {bookingLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Request Booking ({paymentType === "full" ? "Full Payment" : "Installments"})
                      </>
                    )}
                  </Button>
                </div>
              )}

              {selectedPlot.status === "pending" && (
                <Alert className="bg-yellow-50 border-yellow-200">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    This booking is pending admin approval.
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
