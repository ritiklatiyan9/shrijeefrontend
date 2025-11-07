import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  MdHome, 
  MdLocationOn, 
  MdAttachMoney, 
  MdAdd, 
  MdClose, 
  MdCheckCircle, 
  MdError,
  MdExpandMore,
  MdExpandLess,
  MdStraighten,
  MdApartment,
  MdGavel,
  MdDescription
} from "react-icons/md";
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = 'http://localhost:5000/api/v1/plots/admin/plots';

const CreatePlotForm = () => {
  const { user } = useAuth();
  const [expandedSections, setExpandedSections] = useState({
    dimensions: false,
    coordinates: false,
    features: true,
    amenities: false,
    legal: false,
    highlights: false
  });

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

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

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

  const cleanPayload = (data) => {
    const payload = JSON.parse(JSON.stringify(data));

    payload.highlights = payload.highlights.filter(h => h && h.trim());
    if (payload.highlights.length === 0) {
      delete payload.highlights;
    }

    payload.nearbyAmenities = payload.nearbyAmenities.filter(
      a => a.name && a.name.trim() && a.distance
    );
    if (payload.nearbyAmenities.length === 0) {
      delete payload.nearbyAmenities;
    }

    if (!payload.siteLocation.coordinates.latitude || !payload.siteLocation.coordinates.longitude) {
      delete payload.siteLocation.coordinates;
    }

    if (!payload.dimensions.length || !payload.dimensions.width) {
      delete payload.dimensions;
    }

    Object.keys(payload).forEach(key => {
      if (payload[key] === '' || payload[key] === null || payload[key] === undefined) {
        delete payload[key];
      }
    });

    ['siteLocation', 'pricing', 'features', 'legal'].forEach(section => {
      if (payload[section]) {
        Object.keys(payload[section]).forEach(key => {
          if (payload[section][key] === '' || payload[section][key] === null || payload[section][key] === undefined) {
            delete payload[section][key];
          }
        });
      }
    });

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

      const payload = cleanPayload(formData);

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

      setTimeout(() => {
        window.location.href = '/plots';
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

  const SectionHeader = ({ icon: Icon, title, isExpanded, onToggle, isOptional = false }) => (
    <div 
      className="flex items-center justify-between cursor-pointer py-3 px-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 mb-4"
      onClick={onToggle}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white rounded-lg shadow-sm">
          <Icon className="text-xl text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">
          {title}
          {isOptional && <span className="text-sm text-gray-500 ml-2 font-normal">(Optional)</span>}
        </h3>
      </div>
      {onToggle && (
        isExpanded ? <MdExpandLess className="text-2xl text-gray-600" /> : <MdExpandMore className="text-2xl text-gray-600" />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Card className="shadow-2xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <MdHome className="text-4xl" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold mb-2">Create New Plot</CardTitle>
                <CardDescription className="text-blue-100 text-base">
                  Fill in the details below. Fields marked with <span className="text-red-300 font-semibold">*</span> are required.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8">
            {submitMessage.text && (
              <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 shadow-lg ${
                submitMessage.type === 'success' 
                  ? 'bg-green-50 text-green-800 border-2 border-green-200' 
                  : 'bg-red-50 text-red-800 border-2 border-red-200'
              }`}>
                {submitMessage.type === 'success' ? (
                  <MdCheckCircle className="text-2xl mt-0.5 flex-shrink-0 text-green-600" />
                ) : (
                  <MdError className="text-2xl mt-0.5 flex-shrink-0 text-red-600" />
                )}
                <div className="flex-1">
                  <p className="font-semibold text-lg">{submitMessage.text}</p>
                </div>
              </div>
            )}

            {validationErrors.length > 0 && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border-2 border-red-200 shadow-lg">
                <div className="flex items-start gap-3">
                  <MdError className="text-2xl text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-red-800 mb-3 text-lg">Please fix the following errors:</p>
                    <ul className="space-y-2">
                      {validationErrors.map((error, index) => (
                        <li key={index} className="flex items-start gap-2 text-red-700">
                          <span className="text-red-500 font-bold">•</span>
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Plot Details */}
              <div className="space-y-4">
                <SectionHeader icon={MdHome} title="Basic Plot Details" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="plotName" className="text-base font-semibold text-gray-700">
                      Plot Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="plotName"
                      name="plotName"
                      value={formData.plotName}
                      onChange={handleChange}
                      placeholder="e.g., Green Valley Plot A-101"
                      required
                      className="h-12 text-base border-2 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plotNumber" className="text-base font-semibold text-gray-700">
                      Plot Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="plotNumber"
                      name="plotNumber"
                      value={formData.plotNumber}
                      onChange={handleChange}
                      placeholder="e.g., A-101"
                      required
                      className="h-12 text-base border-2 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="sizeValue" className="text-base font-semibold text-gray-700">
                      Plot Size <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="sizeValue"
                      type="number"
                      value={formData.size.value}
                      onChange={(e) => handleNestedChange('size', 'value', e.target.value)}
                      placeholder="e.g., 1000"
                      required
                      min="0"
                      step="0.01"
                      className="h-12 text-base border-2 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sizeUnit" className="text-base font-semibold text-gray-700">
                      Size Unit <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.size.unit}
                      onValueChange={(value) => handleNestedChange('size', 'unit', value)}
                    >
                      <SelectTrigger className="h-12 text-base border-2 focus:border-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sqft">Square Feet (sq ft)</SelectItem>
                        <SelectItem value="sqm">Square Meter (sq m)</SelectItem>
                        <SelectItem value="sqyd">Square Yard (sq yd)</SelectItem>
                        <SelectItem value="acre">Acre</SelectItem>
                        <SelectItem value="hectare">Hectare</SelectItem>
                        <SelectItem value="gaj">Gaj</SelectItem>
                        <SelectItem value="bigha">Bigha</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Dimensions - Optional */}
              <div className="space-y-4">
                <SectionHeader 
                  icon={MdStraighten} 
                  title="Plot Dimensions" 
                  isExpanded={expandedSections.dimensions}
                  onToggle={() => toggleSection('dimensions')}
                  isOptional
                />
                {expandedSections.dimensions && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pl-4">
                    <div className="space-y-2">
                      <Label htmlFor="length" className="text-base font-medium text-gray-700">Length</Label>
                      <Input
                        id="length"
                        type="number"
                        value={formData.dimensions.length}
                        onChange={(e) => handleNestedChange('dimensions', 'length', e.target.value)}
                        placeholder="e.g., 50"
                        min="0"
                        step="0.01"
                        className="h-11 border-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="width" className="text-base font-medium text-gray-700">Width</Label>
                      <Input
                        id="width"
                        type="number"
                        value={formData.dimensions.width}
                        onChange={(e) => handleNestedChange('dimensions', 'width', e.target.value)}
                        placeholder="e.g., 20"
                        min="0"
                        step="0.01"
                        className="h-11 border-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dimUnit" className="text-base font-medium text-gray-700">Unit</Label>
                      <Select
                        value={formData.dimensions.unit}
                        onValueChange={(value) => handleNestedChange('dimensions', 'unit', value)}
                      >
                        <SelectTrigger className="h-11 border-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ft">Feet (ft)</SelectItem>
                          <SelectItem value="m">Meters (m)</SelectItem>
                          <SelectItem value="yd">Yards (yd)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              {/* Location Details */}
              <div className="space-y-4">
                <SectionHeader icon={MdLocationOn} title="Location Details" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="siteName" className="text-base font-semibold text-gray-700">
                      Site Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="siteName"
                      value={formData.siteLocation.siteName}
                      onChange={(e) => handleSiteLocationChange('siteName', e.target.value)}
                      placeholder="e.g., Green Valley Estates"
                      required
                      className="h-12 text-base border-2 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phase" className="text-base font-medium text-gray-700">Phase</Label>
                    <Input
                      id="phase"
                      value={formData.siteLocation.phase}
                      onChange={(e) => handleSiteLocationChange('phase', e.target.value)}
                      placeholder="e.g., Phase 1"
                      className="h-12 text-base border-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="sector" className="text-base font-medium text-gray-700">Sector</Label>
                    <Input
                      id="sector"
                      value={formData.siteLocation.sector}
                      onChange={(e) => handleSiteLocationChange('sector', e.target.value)}
                      placeholder="e.g., Sector 15"
                      className="h-12 text-base border-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="block" className="text-base font-medium text-gray-700">Block</Label>
                    <Input
                      id="block"
                      value={formData.siteLocation.block}
                      onChange={(e) => handleSiteLocationChange('block', e.target.value)}
                      placeholder="e.g., Block A"
                      className="h-12 text-base border-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="street" className="text-base font-medium text-gray-700">Street Address</Label>
                    <Input
                      id="street"
                      value={formData.siteLocation.address.street}
                      onChange={(e) => handleAddressChange('street', e.target.value)}
                      placeholder="e.g., Main Street"
                      className="h-12 text-base border-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-base font-semibold text-gray-700">
                      City <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="city"
                      value={formData.siteLocation.address.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      placeholder="e.g., Mumbai"
                      required
                      className="h-12 text-base border-2 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-base font-semibold text-gray-700">
                      State <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="state"
                      value={formData.siteLocation.address.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      placeholder="e.g., Maharashtra"
                      required
                      className="h-12 text-base border-2 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode" className="text-base font-medium text-gray-700">Pincode</Label>
                    <Input
                      id="pincode"
                      value={formData.siteLocation.address.pincode}
                      onChange={(e) => handleAddressChange('pincode', e.target.value)}
                      placeholder="e.g., 400001"
                      maxLength={6}
                      pattern="[0-9]{6}"
                      className="h-12 text-base border-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="googleMapsLink" className="text-base font-medium text-gray-700">Google Maps Link</Label>
                    <Input
                      id="googleMapsLink"
                      value={formData.siteLocation.googleMapsLink}
                      onChange={(e) => handleSiteLocationChange('googleMapsLink', e.target.value)}
                      placeholder="https://maps.google.com/..."
                      className="h-12 text-base border-2"
                    />
                  </div>
                </div>

                {/* Coordinates - Collapsible */}
                <div>
                  <button
                    type="button"
                    onClick={() => toggleSection('coordinates')}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mt-2"
                  >
                    {expandedSections.coordinates ? <MdExpandLess /> : <MdExpandMore />}
                    <span>GPS Coordinates (Optional)</span>
                  </button>
                  {expandedSections.coordinates && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4 pl-4">
                      <div className="space-y-2">
                        <Label htmlFor="latitude" className="text-base font-medium text-gray-700">Latitude</Label>
                        <Input
                          id="latitude"
                          type="number"
                          step="any"
                          value={formData.siteLocation.coordinates.latitude}
                          onChange={(e) => handleCoordinatesChange('latitude', e.target.value)}
                          placeholder="e.g., 19.0760"
                          min="-90"
                          max="90"
                          className="h-11 border-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="longitude" className="text-base font-medium text-gray-700">Longitude</Label>
                        <Input
                          id="longitude"
                          type="number"
                          step="any"
                          value={formData.siteLocation.coordinates.longitude}
                          onChange={(e) => handleCoordinatesChange('longitude', e.target.value)}
                          placeholder="e.g., 72.8777"
                          min="-180"
                          max="180"
                          className="h-11 border-2"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing Information */}
              <div className="space-y-4">
                <SectionHeader icon={MdAttachMoney} title="Pricing Information" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="basePrice" className="text-base font-semibold text-gray-700">
                      Base Price (₹) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="basePrice"
                      type="number"
                      value={formData.pricing.basePrice}
                      onChange={(e) => handleNestedChange('pricing', 'basePrice', e.target.value)}
                      placeholder="e.g., 5000000"
                      required
                      min="0"
                      step="0.01"
                      className="h-12 text-base border-2 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalPrice" className="text-base font-semibold text-gray-700">
                      Total Price (₹) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="totalPrice"
                      type="number"
                      value={formData.pricing.totalPrice}
                      onChange={(e) => handleNestedChange('pricing', 'totalPrice', e.target.value)}
                      placeholder="e.g., 5500000"
                      required
                      min="0"
                      step="0.01"
                      className="h-12 text-base border-2 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="pricePerUnit" className="text-base font-medium text-gray-700">Price Per Unit (₹)</Label>
                    <Input
                      id="pricePerUnit"
                      type="number"
                      value={formData.pricing.pricePerUnit}
                      onChange={(e) => handleNestedChange('pricing', 'pricePerUnit', e.target.value)}
                      placeholder="e.g., 5000"
                      min="0"
                      step="0.01"
                      className="h-11 border-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registrationCharges" className="text-base font-medium text-gray-700">Registration Charges (₹)</Label>
                    <Input
                      id="registrationCharges"
                      type="number"
                      value={formData.pricing.registrationCharges}
                      onChange={(e) => handleNestedChange('pricing', 'registrationCharges', e.target.value)}
                      placeholder="e.g., 50000"
                      min="0"
                      step="0.01"
                      className="h-11 border-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="developmentCharges" className="text-base font-medium text-gray-700">Development Charges (₹)</Label>
                    <Input
                      id="developmentCharges"
                      type="number"
                      value={formData.pricing.developmentCharges}
                      onChange={(e) => handleNestedChange('pricing', 'developmentCharges', e.target.value)}
                      placeholder="e.g., 100000"
                      min="0"
                      step="0.01"
                      className="h-11 border-2"
                    />
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <SectionHeader 
                  icon={MdApartment} 
                  title="Plot Features" 
                  isExpanded={expandedSections.features}
                  onToggle={() => toggleSection('features')}
                  isOptional
                />
                {expandedSections.features && (
                  <div className="space-y-6 pl-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="facing" className="text-base font-medium text-gray-700">Facing Direction</Label>
                        <Select
                          value={formData.features.facing}
                          onValueChange={(value) => handleNestedChange('features', 'facing', value)}
                        >
                          <SelectTrigger className="h-11 border-2">
                            <SelectValue placeholder="Select facing direction" />
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
                      <div className="space-y-2">
                        <Label htmlFor="roadWidth" className="text-base font-medium text-gray-700">Road Width (ft)</Label>
                        <Input
                          id="roadWidth"
                          type="number"
                          value={formData.features.roadWidth}
                          onChange={(e) => handleNestedChange('features', 'roadWidth', e.target.value)}
                          placeholder="e.g., 40"
                          min="0"
                          step="0.01"
                          className="h-11 border-2"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <Checkbox
                          id="cornerPlot"
                          checked={formData.features.cornerPlot}
                          onCheckedChange={(checked) => handleNestedChange('features', 'cornerPlot', checked)}
                          className="h-5 w-5"
                        />
                        <Label htmlFor="cornerPlot" className="cursor-pointer font-medium">Corner Plot</Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <Checkbox
                          id="electricity"
                          checked={formData.features.electricityConnection}
                          onCheckedChange={(checked) => handleNestedChange('features', 'electricityConnection', checked)}
                          className="h-5 w-5"
                        />
                        <Label htmlFor="electricity" className="cursor-pointer font-medium">Electricity Connection</Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <Checkbox
                          id="water"
                          checked={formData.features.waterConnection}
                          onCheckedChange={(checked) => handleNestedChange('features', 'waterConnection', checked)}
                          className="h-5 w-5"
                        />
                        <Label htmlFor="water" className="cursor-pointer font-medium">Water Connection</Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <Checkbox
                          id="boundary"
                          checked={formData.features.boundaryWall}
                          onCheckedChange={(checked) => handleNestedChange('features', 'boundaryWall', checked)}
                          className="h-5 w-5"
                        />
                        <Label htmlFor="boundary" className="cursor-pointer font-medium">Boundary Wall</Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <Checkbox
                          id="gatedCommunity"
                          checked={formData.features.gatedCommunity}
                          onCheckedChange={(checked) => handleNestedChange('features', 'gatedCommunity', checked)}
                          className="h-5 w-5"
                        />
                        <Label htmlFor="gatedCommunity" className="cursor-pointer font-medium">Gated Community</Label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Nearby Amenities */}
              <div className="space-y-4">
                <SectionHeader 
                  icon={MdLocationOn} 
                  title="Nearby Amenities" 
                  isExpanded={expandedSections.amenities}
                  onToggle={() => toggleSection('amenities')}
                  isOptional
                />
                {expandedSections.amenities && (
                  <div className="space-y-4 pl-4">
                    {formData.nearbyAmenities.map((amenity, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-4 bg-gray-50 rounded-lg">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Amenity Name</Label>
                          <Input
                            value={amenity.name}
                            onChange={(e) => handleAmenityChange(index, 'name', e.target.value)}
                            placeholder="e.g., School, Hospital"
                            className="h-10 border-2"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Distance (km)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={amenity.distance}
                            onChange={(e) => handleAmenityChange(index, 'distance', e.target.value)}
                            placeholder="e.g., 2.5"
                            min="0"
                            className="h-10 border-2"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Type</Label>
                          <Select
                            value={amenity.type}
                            onValueChange={(value) => handleAmenityChange(index, 'type', value)}
                          >
                            <SelectTrigger className="h-10 border-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="school">School</SelectItem>
                              <SelectItem value="hospital">Hospital</SelectItem>
                              <SelectItem value="market">Market</SelectItem>
                              <SelectItem value="metro">Metro Station</SelectItem>
                              <SelectItem value="bus_stop">Bus Stop</SelectItem>
                              <SelectItem value="park">Park</SelectItem>
                              <SelectItem value="mall">Shopping Mall</SelectItem>
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
                          className="h-10 w-10 border-2 hover:bg-red-50 hover:border-red-300"
                        >
                          <MdClose className="h-5 w-5 text-red-600" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addAmenity}
                      className="w-full sm:w-auto border-2 border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      <MdAdd className="h-5 w-5 mr-2" />
                      Add Amenity
                    </Button>
                  </div>
                )}
              </div>

              {/* Legal Information */}
              <div className="space-y-4">
                <SectionHeader 
                  icon={MdGavel} 
                  title="Legal Information" 
                  isExpanded={expandedSections.legal}
                  onToggle={() => toggleSection('legal')}
                  isOptional
                />
                {expandedSections.legal && (
                  <div className="space-y-6 pl-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="registryStatus" className="text-base font-medium text-gray-700">Registry Status</Label>
                        <Select
                          value={formData.legal.registryStatus}
                          onValueChange={(value) => handleNestedChange('legal', 'registryStatus', value)}
                        >
                          <SelectTrigger className="h-11 border-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="clear">Clear</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="disputed">Disputed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="approvalStatus" className="text-base font-medium text-gray-700">Approval Status</Label>
                        <Select
                          value={formData.legal.approvalStatus}
                          onValueChange={(value) => handleNestedChange('legal', 'approvalStatus', value)}
                        >
                          <SelectTrigger className="h-11 border-2">
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="registryNumber" className="text-base font-medium text-gray-700">Registry Number</Label>
                        <Input
                          id="registryNumber"
                          value={formData.legal.registryNumber}
                          onChange={(e) => handleNestedChange('legal', 'registryNumber', e.target.value)}
                          placeholder="e.g., REG123456"
                          className="h-11 border-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rera_number" className="text-base font-medium text-gray-700">RERA Number</Label>
                        <Input
                          id="rera_number"
                          value={formData.legal.rera_number}
                          onChange={(e) => handleNestedChange('legal', 'rera_number', e.target.value)}
                          placeholder="e.g., RERA123456"
                          className="h-11 border-2"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Checkbox
                        id="rera_approved"
                        checked={formData.legal.rera_approved}
                        onCheckedChange={(checked) => handleNestedChange('legal', 'rera_approved', checked)}
                        className="h-5 w-5"
                      />
                      <Label htmlFor="rera_approved" className="cursor-pointer font-medium">RERA Approved</Label>
                    </div>
                  </div>
                )}
              </div>

              {/* Description & Highlights */}
              <div className="space-y-4">
                <SectionHeader 
                  icon={MdDescription} 
                  title="Description & Highlights" 
                  isExpanded={expandedSections.highlights}
                  onToggle={() => toggleSection('highlights')}
                  isOptional
                />
                {expandedSections.highlights && (
                  <div className="space-y-6 pl-4">
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-base font-medium text-gray-700">Plot Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={5}
                        placeholder="Describe the plot features, advantages, location benefits, and any other relevant information..."
                        className="text-base border-2 resize-none"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-base font-medium text-gray-700">Key Highlights</Label>
                      {formData.highlights.map((highlight, index) => (
                        <div key={index} className="flex gap-3">
                          <Input
                            value={highlight}
                            onChange={(e) => updateHighlight(index, e.target.value)}
                            placeholder={`Highlight ${index + 1}`}
                            className="h-11 border-2"
                          />
                          {formData.highlights.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => removeHighlight(index)}
                              className="h-11 w-11 border-2 hover:bg-red-50 hover:border-red-300"
                            >
                              <MdClose className="h-5 w-5 text-red-600" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addHighlight}
                        className="w-full sm:w-auto border-2 border-blue-300 text-blue-600 hover:bg-blue-50"
                      >
                        <MdAdd className="h-5 w-5 mr-2" />
                        Add Highlight
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Internal Notes */}
              <div className="space-y-2">
                <Label htmlFor="internalNotes" className="text-base font-medium text-gray-700">
                  Internal Notes <span className="text-sm text-gray-500">(For admin reference only)</span>
                </Label>
                <Textarea
                  id="internalNotes"
                  name="internalNotes"
                  value={formData.internalNotes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Any internal notes, reminders, or special instructions for the team..."
                  className="text-base border-2 resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t-2">
                <Button 
                  type="submit" 
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Creating Plot...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <MdCheckCircle className="text-2xl" />
                      Create Plot
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreatePlotForm;