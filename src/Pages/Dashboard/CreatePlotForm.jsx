import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X, MapPin, Ruler, DollarSign, Home, AlertCircle } from "lucide-react";
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = 'https://shreejeebackend.onrender.com/api/v1/plots/admin/plots';

const CreatePlotForm = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    plotName: '',
    plotNumber: '',
    size: { value: '', unit: 'sqft' },
    dimensions: { length: '', width: '', unit: 'ft' },
    siteLocation: {
      siteName: '',
      phase: '',
      sector: '',
      block: '',
      address: {
        street: '',
        city: '',
        state: '',
        pincode: ''
      },
      coordinates: { latitude: '', longitude: '' },
      googleMapsLink: ''
    },
    pricing: {
      basePrice: '',
      pricePerUnit: '',
      registrationCharges: '',
      developmentCharges: '',
      totalPrice: '',
      currency: 'INR'
    },
    features: {
      facing: '',
      cornerPlot: false,
      roadWidth: '',
      electricityConnection: false,
      waterConnection: false,
      boundaryWall: false,
      gatedCommunity: false
    },
    nearbyAmenities: [{ name: '', distance: '', type: 'school' }],
    legal: {
      registryStatus: 'pending',
      registryNumber: '',
      approvalStatus: 'pending',
      rera_approved: false,
      rera_number: ''
    },
    media: { images: [], videos: [] },
    description: '',
    highlights: [''],
    internalNotes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
  const [validationErrors, setValidationErrors] = useState([]);

  // Handle basic fields
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  // Handle nested object changes
  const handleNestedChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  // Handle site location fields
  const handleSiteLocationChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      siteLocation: {
        ...prev.siteLocation,
        [field]: value
      }
    }));
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  // Handle address changes
  const handleAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      siteLocation: {
        ...prev.siteLocation,
        address: {
          ...prev.siteLocation.address,
          [field]: value
        }
      }
    }));
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  // Handle coordinates changes
  const handleCoordinatesChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      siteLocation: {
        ...prev.siteLocation,
        coordinates: {
          ...prev.siteLocation.coordinates,
          [field]: value
        }
      }
    }));
  };

  // Handle amenity changes
  const handleAmenityChange = (index, field, value) => {
    const updated = [...formData.nearbyAmenities];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, nearbyAmenities: updated }));
  };

  const addAmenity = () => {
    setFormData(prev => ({
      ...prev,
      nearbyAmenities: [...prev.nearbyAmenities, { name: '', distance: '', type: 'school' }]
    }));
  };

  const removeAmenity = (index) => {
    if (formData.nearbyAmenities.length > 1) {
      setFormData(prev => ({
        ...prev,
        nearbyAmenities: prev.nearbyAmenities.filter((_, i) => i !== index)
      }));
    }
  };

  // Handle highlights
  const addHighlight = () => {
    setFormData(prev => ({
      ...prev,
      highlights: [...prev.highlights, '']
    }));
  };

  const updateHighlight = (index, value) => {
    const updated = [...formData.highlights];
    updated[index] = value;
    setFormData(prev => ({ ...prev, highlights: updated }));
  };

  const removeHighlight = (index) => {
    if (formData.highlights.length > 1) {
      setFormData(prev => ({
        ...prev,
        highlights: prev.highlights.filter((_, i) => i !== index)
      }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const errors = [];

    if (!formData.plotName?.trim()) {
      errors.push('Plot Name is required');
    }
    if (!formData.plotNumber?.trim()) {
      errors.push('Plot Number is required');
    }
    if (!formData.size.value || formData.size.value <= 0) {
      errors.push('Size Value must be greater than 0');
    }
    if (!formData.siteLocation.siteName?.trim()) {
      errors.push('Site Name is required');
    }
    if (!formData.siteLocation.address.city?.trim()) {
      errors.push('City is required');
    }
    if (!formData.siteLocation.address.state?.trim()) {
      errors.push('State is required');
    }
    if (!formData.pricing.basePrice || formData.pricing.basePrice <= 0) {
      errors.push('Base Price must be greater than 0');
    }
    if (!formData.pricing.totalPrice || formData.pricing.totalPrice <= 0) {
      errors.push('Total Price must be greater than 0');
    }
    if (formData.pricing.totalPrice && formData.pricing.basePrice && 
        Number(formData.pricing.totalPrice) < Number(formData.pricing.basePrice)) {
      errors.push('Total Price cannot be less than Base Price');
    }

    return errors;
  };

  // Clean payload before submission
  const cleanPayload = (data) => {
    const payload = JSON.parse(JSON.stringify(data));

    // Remove empty highlights
    payload.highlights = payload.highlights.filter(h => h && h.trim());
    if (payload.highlights.length === 0) {
      delete payload.highlights;
    }

    // Remove empty amenities
    payload.nearbyAmenities = payload.nearbyAmenities.filter(
      a => a.name && a.name.trim() && a.distance
    );
    if (payload.nearbyAmenities.length === 0) {
      delete payload.nearbyAmenities;
    }

    // Remove empty coordinates if not provided
    if (!payload.siteLocation.coordinates.latitude || !payload.siteLocation.coordinates.longitude) {
      delete payload.siteLocation.coordinates;
    }

    // Remove empty dimensions if not provided
    if (!payload.dimensions.length || !payload.dimensions.width) {
      delete payload.dimensions;
    }

    // Remove empty optional fields
    Object.keys(payload).forEach(key => {
      if (payload[key] === '' || payload[key] === null || payload[key] === undefined) {
        delete payload[key];
      }
    });

    // Clean nested objects
    ['siteLocation', 'pricing', 'features', 'legal'].forEach(section => {
      if (payload[section]) {
        Object.keys(payload[section]).forEach(key => {
          if (payload[section][key] === '' || payload[section][key] === null || payload[section][key] === undefined) {
            delete payload[section][key];
          }
        });
      }
    });

    // Clean address
    if (payload.siteLocation?.address) {
      Object.keys(payload.siteLocation.address).forEach(key => {
        if (payload.siteLocation.address[key] === '' || 
            payload.siteLocation.address[key] === null || 
            payload.siteLocation.address[key] === undefined) {
          delete payload.siteLocation.address[key];
        }
      });
    }

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage({ type: '', text: '' });
    setValidationErrors([]);

    try {
      // Validate form
      const errors = validateForm();
      if (errors.length > 0) {
        setValidationErrors(errors);
        setSubmitMessage({ 
          type: 'error', 
          text: 'Please fix the validation errors below' 
        });
        setIsSubmitting(false);
        return;
      }

      // Clean and prepare payload
      const payload = cleanPayload(formData);

      // Retrieve the access token
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          message: 'Failed to parse error response' 
        }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Plot created successfully:', result);
      setSubmitMessage({ 
        type: 'success', 
        text: 'Plot created successfully! Redirecting...' 
      });

      // Reset form after 2 seconds
      setTimeout(() => {
        window.location.href = '/plots'; // Or use navigate if available
      }, 2000);

    } catch (error) {
      console.error('Error creating plot:', error);
      setSubmitMessage({ 
        type: 'error', 
        text: error.message || 'An error occurred while creating the plot.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Plot</CardTitle>
          <CardDescription>
            Fill in the details for the new plot. Fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitMessage.text && (
            <div className={`mb-4 p-4 rounded-md flex items-start gap-3 ${
              submitMessage.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium">{submitMessage.text}</p>
              </div>
            </div>
          )}

          {validationErrors.length > 0 && (
            <div className="mb-4 p-4 rounded-md bg-red-50 border border-red-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-red-800 mb-2">Please fix the following errors:</p>
                  <ul className="list-disc list-inside space-y-1 text-red-700 text-sm">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Plot Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Home className="h-5 w-5" />
                Basic Plot Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="plotName">Plot Name *</Label>
                  <Input
                    id="plotName"
                    name="plotName"
                    value={formData.plotName}
                    onChange={handleChange}
                    placeholder="e.g., Green Valley Plot"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="plotNumber">Plot Number *</Label>
                  <Input
                    id="plotNumber"
                    name="plotNumber"
                    value={formData.plotNumber}
                    onChange={handleChange}
                    placeholder="e.g., A-101"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sizeValue">Size Value *</Label>
                  <Input
                    id="sizeValue"
                    type="number"
                    value={formData.size.value}
                    onChange={(e) => handleNestedChange('size', 'value', e.target.value)}
                    placeholder="e.g., 1000"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="sizeUnit">Size Unit *</Label>
                  <Select
                    value={formData.size.unit}
                    onValueChange={(value) => handleNestedChange('size', 'unit', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sqft">Square Feet</SelectItem>
                      <SelectItem value="sqm">Square Meter</SelectItem>
                      <SelectItem value="sqyd">Square Yard</SelectItem>
                      <SelectItem value="acre">Acre</SelectItem>
                      <SelectItem value="hectare">Hectare</SelectItem>
                      <SelectItem value="gaj">Gaj</SelectItem>
                      <SelectItem value="bigha">Bigha</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Dimensions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Ruler className="h-5 w-5" />
                Dimensions (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="length">Length</Label>
                  <Input
                    id="length"
                    type="number"
                    value={formData.dimensions.length}
                    onChange={(e) => handleNestedChange('dimensions', 'length', e.target.value)}
                    placeholder="e.g., 50"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="width">Width</Label>
                  <Input
                    id="width"
                    type="number"
                    value={formData.dimensions.width}
                    onChange={(e) => handleNestedChange('dimensions', 'width', e.target.value)}
                    placeholder="e.g., 20"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="dimUnit">Dimension Unit</Label>
                  <Select
                    value={formData.dimensions.unit}
                    onValueChange={(value) => handleNestedChange('dimensions', 'unit', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ft">Feet</SelectItem>
                      <SelectItem value="m">Meters</SelectItem>
                      <SelectItem value="yd">Yards</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="siteName">Site Name *</Label>
                  <Input
                    id="siteName"
                    value={formData.siteLocation.siteName}
                    onChange={(e) => handleSiteLocationChange('siteName', e.target.value)}
                    placeholder="e.g., Green Valley Estates"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phase">Phase</Label>
                  <Input
                    id="phase"
                    value={formData.siteLocation.phase}
                    onChange={(e) => handleSiteLocationChange('phase', e.target.value)}
                    placeholder="e.g., Phase 1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sector">Sector</Label>
                  <Input
                    id="sector"
                    value={formData.siteLocation.sector}
                    onChange={(e) => handleSiteLocationChange('sector', e.target.value)}
                    placeholder="e.g., Sector 15"
                  />
                </div>
                <div>
                  <Label htmlFor="block">Block</Label>
                  <Input
                    id="block"
                    value={formData.siteLocation.block}
                    onChange={(e) => handleSiteLocationChange('block', e.target.value)}
                    placeholder="e.g., Block A"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="street">Street</Label>
                  <Input
                    id="street"
                    value={formData.siteLocation.address.street}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    placeholder="e.g., Main Street"
                  />
                </div>
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.siteLocation.address.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    placeholder="e.g., Mumbai"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={formData.siteLocation.address.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    placeholder="e.g., Maharashtra"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={formData.siteLocation.address.pincode}
                    onChange={(e) => handleAddressChange('pincode', e.target.value)}
                    placeholder="e.g., 400001"
                    maxLength={6}
                    pattern="[0-9]{6}"
                  />
                </div>
                <div>
                  <Label htmlFor="googleMapsLink">Google Maps Link</Label>
                  <Input
                    id="googleMapsLink"
                    value={formData.siteLocation.googleMapsLink}
                    onChange={(e) => handleSiteLocationChange('googleMapsLink', e.target.value)}
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.siteLocation.coordinates.latitude}
                    onChange={(e) => handleCoordinatesChange('latitude', e.target.value)}
                    placeholder="e.g., 19.0760"
                    min="-90"
                    max="90"
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.siteLocation.coordinates.longitude}
                    onChange={(e) => handleCoordinatesChange('longitude', e.target.value)}
                    placeholder="e.g., 72.8777"
                    min="-180"
                    max="180"
                  />
                </div>
              </div>
            </div>

            {/* Pricing Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="basePrice">Base Price *</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    value={formData.pricing.basePrice}
                    onChange={(e) => handleNestedChange('pricing', 'basePrice', e.target.value)}
                    placeholder="e.g., 5000000"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="totalPrice">Total Price *</Label>
                  <Input
                    id="totalPrice"
                    type="number"
                    value={formData.pricing.totalPrice}
                    onChange={(e) => handleNestedChange('pricing', 'totalPrice', e.target.value)}
                    placeholder="e.g., 5500000"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="pricePerUnit">Price Per Unit</Label>
                  <Input
                    id="pricePerUnit"
                    type="number"
                    value={formData.pricing.pricePerUnit}
                    onChange={(e) => handleNestedChange('pricing', 'pricePerUnit', e.target.value)}
                    placeholder="e.g., 5000"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="registrationCharges">Registration Charges</Label>
                  <Input
                    id="registrationCharges"
                    type="number"
                    value={formData.pricing.registrationCharges}
                    onChange={(e) => handleNestedChange('pricing', 'registrationCharges', e.target.value)}
                    placeholder="e.g., 50000"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="developmentCharges">Development Charges</Label>
                  <Input
                    id="developmentCharges"
                    type="number"
                    value={formData.pricing.developmentCharges}
                    onChange={(e) => handleNestedChange('pricing', 'developmentCharges', e.target.value)}
                    placeholder="e.g., 100000"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="facing">Facing Direction</Label>
                  <Select
                    value={formData.features.facing}
                    onValueChange={(value) => handleNestedChange('features', 'facing', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select facing" />
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
                  <Label htmlFor="roadWidth">Road Width (ft)</Label>
                  <Input
                    id="roadWidth"
                    type="number"
                    value={formData.features.roadWidth}
                    onChange={(e) => handleNestedChange('features', 'roadWidth', e.target.value)}
                    placeholder="e.g., 40"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="cornerPlot"
                    checked={formData.features.cornerPlot}
                    onCheckedChange={(checked) => handleNestedChange('features', 'cornerPlot', checked)}
                  />
                  <Label htmlFor="cornerPlot">Corner Plot</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="electricity"
                    checked={formData.features.electricityConnection}
                    onCheckedChange={(checked) => handleNestedChange('features', 'electricityConnection', checked)}
                  />
                  <Label htmlFor="electricity">Electricity</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="water"
                    checked={formData.features.waterConnection}
                    onCheckedChange={(checked) => handleNestedChange('features', 'waterConnection', checked)}
                  />
                  <Label htmlFor="water">Water Connection</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="boundary"
                    checked={formData.features.boundaryWall}
                    onCheckedChange={(checked) => handleNestedChange('features', 'boundaryWall', checked)}
                  />
                  <Label htmlFor="boundary">Boundary Wall</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="gatedCommunity"
                    checked={formData.features.gatedCommunity}
                    onCheckedChange={(checked) => handleNestedChange('features', 'gatedCommunity', checked)}
                  />
                  <Label htmlFor="gatedCommunity">Gated Community</Label>
                </div>
              </div>
            </div>

            {/* Nearby Amenities */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Nearby Amenities</h3>
              {formData.nearbyAmenities.map((amenity, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={amenity.name}
                      onChange={(e) => handleAmenityChange(index, 'name', e.target.value)}
                      placeholder="School, Hospital, etc."
                    />
                  </div>
                  <div>
                    <Label>Distance (km)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={amenity.distance}
                      onChange={(e) => handleAmenityChange(index, 'distance', e.target.value)}
                      placeholder="e.g., 2.5"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Select
                      value={amenity.type}
                      onValueChange={(value) => handleAmenityChange(index, 'type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="school">School</SelectItem>
                        <SelectItem value="hospital">Hospital</SelectItem>
                        <SelectItem value="market">Market</SelectItem>
                        <SelectItem value="metro">Metro</SelectItem>
                        <SelectItem value="bus_stop">Bus Stop</SelectItem>
                        <SelectItem value="park">Park</SelectItem>
                        <SelectItem value="mall">Mall</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeAmenity(index)}
                    disabled={formData.nearbyAmenities.length <= 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addAmenity}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Amenity
              </Button>
            </div>

            {/* Legal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Legal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="registryStatus">Registry Status</Label>
                  <Select
                    value={formData.legal.registryStatus}
                    onValueChange={(value) => handleNestedChange('legal', 'registryStatus', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clear">Clear</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="disputed">Disputed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="approvalStatus">Approval Status</Label>
                  <Select
                    value={formData.legal.approvalStatus}
                    onValueChange={(value) => handleNestedChange('legal', 'approvalStatus', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="registryNumber">Registry Number</Label>
                  <Input
                    id="registryNumber"
                    value={formData.legal.registryNumber}
                    onChange={(e) => handleNestedChange('legal', 'registryNumber', e.target.value)}
                    placeholder="e.g., REG123456"
                  />
                </div>
                <div>
                  <Label htmlFor="rera_number">RERA Number</Label>
                  <Input
                    id="rera_number"
                    value={formData.legal.rera_number}
                    onChange={(e) => handleNestedChange('legal', 'rera_number', e.target.value)}
                    placeholder="e.g., RERA123456"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rera_approved"
                  checked={formData.legal.rera_approved}
                  onCheckedChange={(checked) => handleNestedChange('legal', 'rera_approved', checked)}
                />
                <Label htmlFor="rera_approved">RERA Approved</Label>
              </div>
            </div>

            {/* Description and Highlights */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Description & Highlights</h3>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe the plot features, advantages, etc."
                />
              </div>
              <div>
                <Label>Highlights</Label>
                {formData.highlights.map((highlight, index) => (
                  <div key={index} className="flex gap-2 mt-2">
                    <Input
                      value={highlight}
                      onChange={(e) => updateHighlight(index, e.target.value)}
                      placeholder={`Highlight ${index + 1}`}
                    />
                    {formData.highlights.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeHighlight(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2"
                  onClick={addHighlight}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Highlight
                </Button>
              </div>
            </div>

            {/* Internal Notes */}
            <div>
              <Label htmlFor="internalNotes">Internal Notes</Label>
              <Textarea
                id="internalNotes"
                name="internalNotes"
                value={formData.internalNotes}
                onChange={handleChange}
                rows={3}
                placeholder="Any internal notes for reference..."
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Plot...' : 'Create Plot'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePlotForm;