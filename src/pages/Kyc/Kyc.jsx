// src/pages/KYCPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Upload, CheckCircle, XCircle, AlertCircle, Clock, UserCheck, Loader2, X, Camera, Shield, FileText, Check, X as XIcon, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Progress } from '../../components/ui/progress';
import { Separator } from '../../components/ui/separator';
import { Badge } from '../../components/ui/badge';

const API_BASE_URL = 'https://shreejeebackend.onrender.com/api/v1';

const KYCPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [kycStatus, setKycStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState(null);

  const [formData, setFormData] = useState({
    aadharNumber: '',
    panNumber: '',
    aadharDocument: null,
    panDocument: null,
    additionalDocuments: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [previews, setPreviews] = useState({
    aadhar: null,
    pan: null,
    additional: [],
  });

  // Fetch KYC status
  const fetchKycStatus = async () => {
    if (!user || !user._id) {
      setStatusError("User information not available.");
      setStatusLoading(false);
      return;
    }

    setStatusLoading(true);
    setStatusError(null);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setStatusError("Authentication token not found. Please log in again.");
        setStatusLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/kyc/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        setKycStatus(response.data.data);
      } else {
        setStatusError(response.data.message || "Failed to fetch KYC status.");
      }
    } catch (error) {
      console.error("Error fetching KYC status:", error);
      if (error.response?.status === 401) {
        setStatusError("Session expired. Please log in again.");
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setStatusError(error.response?.data?.message || "An error occurred while fetching KYC status.");
      }
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchKycStatus();
    }
  }, [user]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      if (previews.aadhar) URL.revokeObjectURL(previews.aadhar);
      if (previews.pan) URL.revokeObjectURL(previews.pan);
      previews.additional.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e, docType) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: `${docType.replace('Document', '')} document must be an image file.` });
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB in bytes
        setMessage({ type: 'error', text: `${docType.replace('Document', '')} document size exceeds 5MB.` });
        return;
      }

      setFormData((prevData) => ({
        ...prevData,
        [docType]: file,
      }));

      const previewKey = docType === 'aadharDocument' ? 'aadhar' : 'pan';
      if (previews[previewKey]) {
        URL.revokeObjectURL(previews[previewKey]);
      }

      const newPreviewUrl = URL.createObjectURL(file);
      setPreviews((prevPreviews) => ({
        ...prevPreviews,
        [previewKey]: newPreviewUrl,
      }));

      setMessage({ type: '', text: '' });
    }
  };

  const handleAdditionalFilesChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];

    for (let file of files) {
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: `All additional documents must be image files.` });
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB in bytes
        setMessage({ type: 'error', text: `One or more additional documents exceed 5MB.` });
        return;
      }
      validFiles.push(file);
    }

    setFormData((prevData) => ({
      ...prevData,
      additionalDocuments: [...prevData.additionalDocuments, ...validFiles],
    }));

    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
    setPreviews((prevPreviews) => ({
      ...prevPreviews,
      additional: [...prevPreviews.additional, ...newPreviewUrls],
    }));

    setMessage({ type: '', text: '' });
  };

  const removeAdditionalFile = (indexToRemove) => {
    const updatedFiles = [...formData.additionalDocuments];
    updatedFiles.splice(indexToRemove, 1);
    setFormData((prevData) => ({
      ...prevData,
      additionalDocuments: updatedFiles,
    }));

    const updatedPreviews = [...previews.additional];
    URL.revokeObjectURL(updatedPreviews[indexToRemove]);
    updatedPreviews.splice(indexToRemove, 1);
    setPreviews((prevPreviews) => ({
      ...prevPreviews,
      additional: updatedPreviews,
    }));
  };

  const validateInputs = () => {
    const { aadharNumber, panNumber, aadharDocument, panDocument } = formData;

    const aadharRegex = /^\d{4}-\d{4}-\d{4}$/;
    if (!aadharNumber || !aadharRegex.test(aadharNumber)) {
      setMessage({ type: 'error', text: 'Please enter a valid Aadhar number (format: XXXX-XXXX-XXXX).' });
      return false;
    }

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panNumber || !panRegex.test(panNumber)) {
      setMessage({ type: 'error', text: 'Please enter a valid PAN number (format: ABCDE1234F).' });
      return false;
    }

    if (!aadharDocument) {
      setMessage({ type: 'error', text: 'Please upload your Aadhar document.' });
      return false;
    }
    if (!panDocument) {
      setMessage({ type: 'error', text: 'Please upload your PAN document.' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateInputs()) {
      return;
    }

    if (kycStatus?.verified) {
      setMessage({ type: 'error', text: 'Your KYC is already approved.' });
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);
    setMessage({ type: '', text: '' });

    try {
      setMessage({ type: 'info', text: 'Preparing submission...' });

      // Create FormData for the main submission
      const submissionFormData = new FormData();

      // Append text fields
      submissionFormData.append('aadharNumber', formData.aadharNumber);
      submissionFormData.append('panNumber', formData.panNumber);

      // Append files directly to the same FormData
      if (formData.aadharDocument) {
        submissionFormData.append('aadharDocument', formData.aadharDocument);
      }
      if (formData.panDocument) {
        submissionFormData.append('panDocument', formData.panDocument);
      }
      if (formData.additionalDocuments.length > 0) {
        formData.additionalDocuments.forEach((file) => {
          submissionFormData.append('additionalDocuments', file);
        });
      }

      setMessage({ type: 'info', text: 'Submitting KYC details...' });

      const token = localStorage.getItem('accessToken');
      if (!token) {
        setMessage({ type: 'error', text: 'Authentication token not found. Please log in again.' });
        setIsSubmitting(false);
        return;
      }

      // Submit everything together
      const response = await axios.post(`${API_BASE_URL}/kyc`, submissionFormData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      console.log("KYC submitted successfully:", response.data);
      setMessage({ type: 'success', text: response.data.message || 'KYC documents submitted successfully!' });

      // Reset form and previews after successful submission
      setTimeout(() => {
        setFormData({
          aadharNumber: '',
          panNumber: '',
          aadharDocument: null,
          panDocument: null,
          additionalDocuments: [],
        });

        // Cleanup old preview URLs
        if (previews.aadhar) URL.revokeObjectURL(previews.aadhar);
        if (previews.pan) URL.revokeObjectURL(previews.pan);
        previews.additional.forEach(url => URL.revokeObjectURL(url));

        setPreviews({ aadhar: null, pan: null, additional: [] });
        setUploadProgress(0);
        fetchKycStatus();
      }, 1500);

    } catch (error) {
      console.error("KYC submission error:", error);
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred while submitting your KYC details. Please try again.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderKycStatus = () => {
    if (statusLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-700">Verifying Your Identity</h3>
          <p className="text-gray-500 mt-2">Please wait while we check your KYC status...</p>
        </div>
      );
    }

    if (statusError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="mx-auto text-red-500 w-12 h-12 mb-3" />
          <h3 className="text-lg font-semibold text-red-700">Error</h3>
          <p className="text-red-600 mt-2">{statusError}</p>
        </div>
      );
    }

    if (kycStatus) {
      let status;
      if (kycStatus.verified) {
        status = 'approved';
      } else if (kycStatus.rejectionReason) {
        status = 'rejected';
      } else {
        status = 'pending';
      }

      const statusConfig = {
        approved: {
          text: 'KYC Verified',
          icon: <CheckCircle className="text-green-500 w-16 h-16" />,
          bg: 'bg-green-50',
          textColor: 'text-green-700',
          border: 'border-green-200',
          button: 'bg-green-500 hover:bg-green-600'
        },
        pending: {
          text: 'Verification Pending',
          icon: <Clock className="text-yellow-500 w-16 h-16" />,
          bg: 'bg-yellow-50',
          textColor: 'text-yellow-700',
          border: 'border-yellow-200',
          button: 'bg-yellow-500 hover:bg-yellow-600'
        },
        rejected: {
          text: 'Verification Rejected',
          icon: <XCircle className="text-red-500 w-16 h-16" />,
          bg: 'bg-red-50',
          textColor: 'text-red-700',
          border: 'border-red-200',
          button: 'bg-red-500 hover:bg-red-600'
        },
      };

      const statusInfo = statusConfig[status];

      return (
        <div className={`${statusInfo.bg} ${statusInfo.border} rounded-2xl p-8 text-center`}>
          <div className="flex justify-center mb-4">
            {statusInfo.icon}
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{statusInfo.text}</h2>

          {kycStatus.panNumber && (
            <div className="mt-4 bg-white rounded-lg p-4 shadow-sm">
              <p className="text-gray-600 font-medium">PAN Number</p>
              <p className="text-xl font-bold text-gray-800">{kycStatus.panNumber}</p>
            </div>
          )}

          {kycStatus.aadharNumber && (
            <div className="mt-4 bg-white rounded-lg p-4 shadow-sm">
              <p className="text-gray-600 font-medium">Aadhar Number</p>
              <p className="text-xl font-bold text-gray-800">{kycStatus.aadharNumber}</p>
            </div>
          )}

          {status === 'rejected' && kycStatus.rejectionReason && (
            <div className="mt-6 bg-red-100 rounded-lg p-4">
              <p className="text-red-700 font-medium">Rejection Reason</p>
              <p className="text-red-600 mt-1">{kycStatus.rejectionReason}</p>
            </div>
          )}

          {status === 'approved' && kycStatus.verifiedDate && (
            <div className="mt-6 bg-green-100 rounded-lg p-4">
              <p className="text-green-700 font-medium">Verified On</p>
              <p className="text-green-600 mt-1">{new Date(kycStatus.verifiedDate).toLocaleDateString()}</p>
            </div>
          )}

          {status === 'approved' && (
            <div className="mt-6 bg-green-100 rounded-lg p-4">
              <CheckCircle className="text-green-500 w-8 h-8 mx-auto mb-2" />
              <p className="text-green-700">Your KYC verification is complete and approved. You can now access all features.</p>
            </div>
          )}



          {status === 'rejected' && (
            <div className="mt-6 bg-red-100 rounded-lg p-4">
              <XCircle className="text-red-500 w-8 h-8 mx-auto mb-2" />
              <p className="text-red-700">Your KYC verification was rejected. Please correct the issues and resubmit.</p>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center">
        <div className="flex justify-center mb-4">
          <Shield className="text-blue-500 w-16 h-16" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Complete Your KYC</h2>
        <p className="text-gray-600">Verify your identity to unlock all features</p>
      </div>
    );
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card className="w-[90%] max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-700 mb-4">Please log in to access this page.</p>
            <Button onClick={() => navigate('/login')}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-4 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Identity Verification</h1>
          <p className="text-gray-600 text-lg">Secure and fast KYC process to protect your account</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Status Card */}
          <div className="flex flex-col">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm h-full">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl font-bold text-gray-800">Your KYC Status</CardTitle>
                <CardDescription>Current verification status</CardDescription>
              </CardHeader>
              <CardContent>
                {renderKycStatus()}

                <div className="mt-6 text-center">
                  <Button
                    onClick={fetchKycStatus}
                    disabled={statusLoading}
                    variant="outline"
                    className="w-full"
                  >
                    {statusLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Refreshing...
                      </>
                    ) : (
                      'Refresh Status'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* KYC Form */}
          <div className="flex flex-col">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm h-full">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-800">Complete Your KYC</CardTitle>
                <CardDescription>Fill in your details and upload documents</CardDescription>
              </CardHeader>
              <CardContent>
                {message.text && (
                  <div className={`mb-6 p-4 rounded-lg text-center ${message.type === 'success' ? 'bg-green-100 text-green-700' :
                      message.type === 'error' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                    }`}>
                    {message.type === 'success' && <CheckCircle className="inline mr-2 w-5 h-5" />}
                    {message.type === 'error' && <XCircle className="inline mr-2 w-5 h-5" />}
                    {message.type === 'info' && <Loader2 className="inline mr-2 w-5 h-5 animate-spin" />}
                    {message.text}
                  </div>
                )}

                {isSubmitting && uploadProgress > 0 && (
                  <div className="mb-6">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Uploading: {uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="w-full" />
                  </div>
                )}

                {!(kycStatus && kycStatus.verified) && (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information Section */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <FileText className="mr-2 w-5 h-5" />
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="panNumber" className="text-gray-700">
                            PAN Number <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="panNumber"
                            name="panNumber"
                            value={formData.panNumber}
                            onChange={handleChange}
                            placeholder="ABCDE1234F"
                            className="mt-1 h-12"
                            required
                            disabled={isSubmitting}
                          />
                          <p className="mt-1 text-xs text-gray-500">Format: ABCDE1234F</p>
                        </div>

                        <div>
                          <Label htmlFor="aadharNumber" className="text-gray-700">
                            Aadhar Number <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="aadharNumber"
                            name="aadharNumber"
                            value={formData.aadharNumber}
                            onChange={handleChange}
                            placeholder="1234-5678-9012"
                            className="mt-1 h-12"
                            required
                            disabled={isSubmitting}
                          />
                          <p className="mt-1 text-xs text-gray-500">Format: 1234-5678-9012</p>
                        </div>
                      </div>
                    </div>

                    {/* Document Upload Section */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <Upload className="mr-2 w-5 h-5" />
                        Upload Documents
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* PAN Document */}
                        <div className="space-y-4">
                          <Label className="text-gray-700">
                            Upload PAN Card <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                              <Camera className="w-10 h-10 text-gray-400 mb-2" />
                              <span className="text-sm text-gray-600">Click to Upload</span>
                              <span className="text-xs text-gray-500">JPG, PNG (Max 5MB)</span>
                              <input
                                type="file"
                                id="panDocument"
                                name="panDocument"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, 'panDocument')}
                                className="hidden"
                                required={!formData.panDocument}
                                disabled={isSubmitting}
                              />
                            </label>
                            {previews.pan && (
                              <div className="mt-4 w-full">
                                <img src={previews.pan} alt="PAN Preview" className="w-full h-40 object-cover rounded-lg border" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Aadhar Document */}
                        <div className="space-y-4">
                          <Label className="text-gray-700">
                            Upload Aadhar Card <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                              <Camera className="w-10 h-10 text-gray-400 mb-2" />
                              <span className="text-sm text-gray-600">Click to Upload</span>
                              <span className="text-xs text-gray-500">JPG, PNG (Max 5MB)</span>
                              <input
                                type="file"
                                id="aadharDocument"
                                name="aadharDocument"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, 'aadharDocument')}
                                className="hidden"
                                required={!formData.aadharDocument}
                                disabled={isSubmitting}
                              />
                            </label>
                            {previews.aadhar && (
                              <div className="mt-4 w-full">
                                <img src={previews.aadhar} alt="Aadhar Preview" className="w-full h-40 object-cover rounded-lg border" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Additional Documents */}
                      <div className="mt-6">
                        <Label htmlFor="additionalDocuments" className="text-gray-700">
                          Upload Additional Documents (Optional)
                        </Label>
                        <div className="relative mt-2">
                          <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                            <Upload className="w-6 h-6 text-gray-400 mb-1" />
                            <span className="text-sm text-gray-600">Add More Documents</span>
                            <span className="text-xs text-gray-500">Multiple files supported</span>
                            <input
                              type="file"
                              id="additionalDocuments"
                              name="additionalDocuments"
                              accept="image/*"
                              onChange={handleAdditionalFilesChange}
                              className="hidden"
                              multiple
                              disabled={isSubmitting}
                            />
                          </label>
                        </div>

                        {previews.additional.length > 0 && (
                          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {previews.additional.map((previewUrl, index) => (
                              <div key={index} className="relative group">
                                <img src={previewUrl} alt={`Additional ${index + 1}`} className="w-full h-20 object-cover rounded-lg border" />
                                <Button
                                  type="button"
                                  onClick={() => removeAdditionalFile(index)}
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-1 right-1 h-5 w-5 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  disabled={isSubmitting}
                                >
                                  <XIcon size={12} />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-12 px-8 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 w-full"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'Submit KYC Details'
                        )}
                      </Button>
                    </div>
                  </form>
                )}

                {kycStatus && kycStatus.verified && (
                  <div className="mt-6 p-4 bg-green-100 text-green-700 rounded-lg text-center">
                    <CheckCircle className="inline mr-2 w-5 h-5" />
                    Your KYC is already approved. All features are now accessible.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-start">
            <Info className="text-blue-500 w-6 h-6 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Why KYC is Important</h3>
              <ul className="text-blue-700 space-y-1">
                <li>• Ensures security and prevents fraud</li>
                <li>• Complies with government regulations</li>
                <li>• Enables access to all platform features</li>
                <li>• Protects your account from unauthorized access</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KYCPage;