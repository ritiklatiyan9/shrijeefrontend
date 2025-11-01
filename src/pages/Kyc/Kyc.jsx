import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Upload, CheckCircle, XCircle, AlertCircle, Clock, UserCheck } from 'lucide-react';

const API_BASE_URL = 'http://13.127.229.155:5000/api/v1/users';
const API_KYC_STATUS_URL = 'http://13.127.229.155:5000/api/v1/kyc/status';

const KYCPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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
  const [message, setMessage] = useState({ type: '', text: '' });

  const [previews, setPreviews] = useState({
    aadhar: null,
    pan: null,
    additional: [],
  });

  useEffect(() => {
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
          throw new Error('Authentication token not found.');
        }

        const response = await axios.get(`${API_KYC_STATUS_URL}/${user._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setKycStatus(response.data.data);
        } else {
          setStatusError(response.data.message || "Failed to fetch KYC status.");
        }
      } catch (error) {
        console.error("Error fetching KYC status:", error);
        setStatusError(error.response?.data?.message || "An error occurred while fetching KYC status.");
      } finally {
        setStatusLoading(false);
      }
    };

    fetchKycStatus();
  }, [user]);

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
        setMessage({ type: 'error', text: `${docType} document must be an image file.` });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: `${docType} document size exceeds 5MB.` });
        return;
      }

      setFormData((prevData) => ({
        ...prevData,
        [docType]: file,
      }));

      const newPreviewUrl = URL.createObjectURL(file);
      setPreviews((prevPreviews) => ({
        ...prevPreviews,
        [docType === 'aadharDocument' ? 'aadhar' : 'pan']: newPreviewUrl,
      }));
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
      if (file.size > 5 * 1024 * 1024) {
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
  };

  const removeAdditionalFile = (indexToRemove) => {
    const updatedFiles = [...formData.additionalDocuments];
    updatedFiles.splice(indexToRemove, 1);
    setFormData((prevData) => ({
      ...prevData,
      additionalDocuments: updatedFiles,
    }));

    const updatedPreviews = [...previews.additional];
    updatedPreviews.splice(indexToRemove, 1);
    URL.revokeObjectURL(updatedPreviews[indexToRemove]);
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

  const uploadFileToCloud = async (file) => {
    console.log("Uploading file:", file.name);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `https://cdn.example.com/kyc/${file.name}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateInputs()) {
      return;
    }

    if (kycStatus?.status === 'approved') {
      setMessage({ type: 'error', text: 'Your KYC is already approved. No further action is needed here.' });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const aadharUrl = await uploadFileToCloud(formData.aadharDocument);
      const panUrl = await uploadFileToCloud(formData.panDocument);
      const additionalUrls = await Promise.all(
        formData.additionalDocuments.map(file => uploadFileToCloud(file))
      );

      const payload = {
        aadharNumber: formData.aadharNumber,
        panNumber: formData.panNumber,
        aadharDocument: aadharUrl,
        panDocument: panUrl,
        additionalDocuments: additionalUrls,
      };

      const token = localStorage.getItem('accessToken');
      if (!token) {
        setMessage({ type: 'error', text: 'Authentication token not found. Please log in again.' });
        setIsSubmitting(false);
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/kyc`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log("KYC submitted successfully:", response.data);
      setMessage({ type: 'success', text: response.data.data.message || 'KYC documents submitted successfully!' });

      setTimeout(() => {
        setFormData({
          aadharNumber: '',
          panNumber: '',
          aadharDocument: null,
          panDocument: null,
          additionalDocuments: [],
        });
        setPreviews({ aadhar: null, pan: null, additional: [] });
        fetchKycStatus();
      }, 1500);

    } catch (error) {
      console.error("KYC submission error:", error);
      const errorMessage = error.response?.data?.message || 'An error occurred while submitting your KYC details. Please try again.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

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
        throw new Error('Authentication token not found.');
      }

      const response = await axios.get(`${API_KYC_STATUS_URL}/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setKycStatus(response.data.data);
        setMessage({ type: 'success', text: 'KYC status fetched successfully!' });
      } else {
        setStatusError(response.data.message || "Failed to fetch KYC status.");
      }
    } catch (error) {
      console.error("Error fetching KYC status:", error);
      setStatusError(error.response?.data?.message || "An error occurred while fetching KYC status.");
    } finally {
      setStatusLoading(false);
    }
  };

  const renderKycStatus = () => {
    if (statusLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-lg mb-6 text-center">
          <Clock className="animate-spin mr-0 mb-2 text-blue-500 w-8 h-8" />
          <span className="text-blue-700 font-medium">Checking KYC Status...</span>
        </div>
      );
    }

    if (statusError) {
      return (
        <div className="p-4 bg-red-100 text-red-700 rounded-md mb-6 text-center">
          <AlertCircle className="inline mr-2 w-5 h-5" />
          Error: {statusError}
        </div>
      );
    }

    if (kycStatus) {
      const { status, remarks, approvedAt } = kycStatus;
      let statusText = '';
      let statusIcon = null;
      let bgColor = '';
      let textColor = '';

      switch (status) {
        case 'approved':
          statusText = 'KYC Approved';
          statusIcon = <CheckCircle className="text-green-500 mr-2 w-5 h-5" />;
          bgColor = 'bg-green-100';
          textColor = 'text-green-700';
          break;
        case 'pending':
          statusText = 'KYC Pending';
          statusIcon = <Clock className="text-yellow-500 mr-2 w-5 h-5" />;
          bgColor = 'bg-yellow-100';
          textColor = 'text-yellow-700';
          break;
        case 'rejected':
          statusText = 'KYC Rejected';
          statusIcon = <XCircle className="text-red-500 mr-2 w-5 h-5" />;
          bgColor = 'bg-red-100';
          textColor = 'text-red-700';
          break;
        default:
          statusText = 'Unknown Status';
          statusIcon = <AlertCircle className="text-gray-500 mr-2 w-5 h-5" />;
          bgColor = 'bg-gray-100';
          textColor = 'text-gray-700';
      }

      return (
        <div className={`p-4 rounded-md mb-6 ${bgColor} ${textColor} text-center`}>
          <div className="flex items-center justify-center">
            {statusIcon}
            <h2 className="text-lg font-semibold">{statusText}</h2>
          </div>
          {status === 'rejected' && remarks && (
            <p className="mt-2 text-left"><strong>Remarks:</strong> {remarks}</p>
          )}
          {status === 'approved' && approvedAt && (
            <p className="mt-2 text-left"><strong>Approved On:</strong> {new Date(approvedAt).toLocaleString()}</p>
          )}
          {status === 'approved' && (
            <div className="mt-4 p-3 bg-green-50 rounded-md border border-green-200 text-left">
              <p className="text-green-700">Your KYC verification is complete and approved. You can now access all features.</p>
            </div>
          )}
          {status === 'pending' && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-md border border-yellow-200 text-left">
              <p className="text-yellow-700">Your KYC documents have been submitted and are under review. Please check back later.</p>
            </div>
          )}
          {status === 'rejected' && (
            <div className="mt-4 p-3 bg-red-50 rounded-md border border-red-200 text-left">
              <p className="text-red-700">Your KYC verification was rejected. Please correct the issues mentioned in the remarks and resubmit.</p>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="p-4 rounded-md mb-6 bg-blue-100 text-blue-700 text-center">
        <div className="flex items-center justify-center">
          <UserCheck className="mr-2 w-5 h-5" />
          <h2 className="text-lg font-semibold">KYC Not Submitted</h2>
        </div>
        <p className="mt-2">Please fill out the form below to submit your KYC documents.</p>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-md mt-6 sm:mt-24">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 text-center">Complete Your KYC Verification</h1>
      <p className="text-gray-600 mb-4 text-center">
        Please provide your PAN and Aadhar details along with the required documents to verify your identity.
        This is mandatory for all users.
      </p>

      {renderKycStatus()}

      <div className="mb-6 text-center">
        <button
          onClick={fetchKycStatus}
          disabled={statusLoading}
          className={`py-2 px-4 rounded-md text-white font-medium ${
            statusLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          } transition-colors duration-200`}
        >
          {statusLoading ? 'Fetching Status...' : 'Fetch KYC Status'}
        </button>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-md text-center ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle className="inline mr-2 w-5 h-5" /> : <XCircle className="inline mr-2 w-5 h-5" />}
          {message.text}
        </div>
      )}

      {kycStatus?.status !== 'approved' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PAN Number */}
          <div className="w-full">
            <label htmlFor="panNumber" className="block text-sm font-medium text-gray-700 mb-1">
              PAN Number
            </label>
            <input
              type="text"
              id="panNumber"
              name="panNumber"
              value={formData.panNumber}
              onChange={handleChange}
              placeholder="ABCDE1234F"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            <p className="mt-1 text-xs text-gray-500">Format: ABCDE1234F (5 letters, 4 digits, 1 letter)</p>
          </div>

          {/* Aadhar Number */}
          <div className="w-full">
            <label htmlFor="aadharNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Aadhar Number
            </label>
            <input
              type="text"
              id="aadharNumber"
              name="aadharNumber"
              value={formData.aadharNumber}
              onChange={handleChange}
              placeholder="1234-5678-9012"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            <p className="mt-1 text-xs text-gray-500">Format: 1234-5678-9012 (4 digits, hyphen, 4 digits, hyphen, 4 digits)</p>
          </div>

          {/* PAN Document Upload */}
          <div className="w-full">
            <label htmlFor="panDocument" className="block text-sm font-medium text-gray-700 mb-1">
              Upload PAN Card (Image)
            </label>
            <div className="flex flex-col items-center">
              <label className="flex flex-col items-center justify-center w-full sm:w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 max-w-xs">
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-xs text-gray-500 mt-1">Click to Upload</span>
                <input
                  type="file"
                  id="panDocument"
                  name="panDocument"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'panDocument')}
                  className="hidden"
                  required
                />
              </label>
              {previews.pan && (
                <div className="relative mt-4 w-full sm:w-auto">
                  <img src={previews.pan} alt="PAN Preview" className="w-full sm:w-32 h-32 object-cover rounded-md border max-w-xs mx-auto" />
                </div>
              )}
            </div>
          </div>

          {/* Aadhar Document Upload */}
          <div className="w-full">
            <label htmlFor="aadharDocument" className="block text-sm font-medium text-gray-700 mb-1">
              Upload Aadhar Card (Image)
            </label>
            <div className="flex flex-col items-center">
              <label className="flex flex-col items-center justify-center w-full sm:w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 max-w-xs">
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-xs text-gray-500 mt-1">Click to Upload</span>
                <input
                  type="file"
                  id="aadharDocument"
                  name="aadharDocument"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'aadharDocument')}
                  className="hidden"
                  required
                />
              </label>
              {previews.aadhar && (
                <div className="relative mt-4 w-full sm:w-auto">
                  <img src={previews.aadhar} alt="Aadhar Preview" className="w-full sm:w-32 h-32 object-cover rounded-md border max-w-xs mx-auto" />
                </div>
              )}
            </div>
          </div>

          {/* Additional Documents Upload */}
          <div className="w-full">
            <label htmlFor="additionalDocuments" className="block text-sm font-medium text-gray-700 mb-1">
              Upload Additional Documents (Optional)
            </label>
            <div className="flex flex-col items-center">
              <label className="flex flex-col items-center justify-center w-full sm:w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 max-w-xs">
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-xs text-gray-500 mt-1">Add More</span>
                <input
                  type="file"
                  id="additionalDocuments"
                  name="additionalDocuments"
                  accept="image/*"
                  onChange={handleAdditionalFilesChange}
                  className="hidden"
                  multiple
                />
              </label>
              {previews.additional.length > 0 && (
                <div className="mt-4 w-full flex flex-wrap justify-center gap-2">
                  {previews.additional.map((previewUrl, index) => (
                    <div key={index} className="relative w-24 h-24">
                      <img src={previewUrl} alt={`Additional ${index + 1}`} className="w-full h-full object-cover rounded-md border" />
                      <button
                        type="button"
                        onClick={() => removeAdditionalFile(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-700"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="w-full">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-md text-white font-medium ${
                isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
              } transition-colors duration-200`}
            >
              {isSubmitting ? 'Submitting KYC...' : 'Submit KYC Details'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default KYCPage;