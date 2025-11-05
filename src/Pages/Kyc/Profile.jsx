
// pages/ProfilePage.jsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
  SheetTrigger
} from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaBuilding, 
  FaCreditCard,
  FaSave,
  FaEdit,
  FaCheckCircle,
  FaTimes,
  FaCopy,
  FaWhatsapp,
  FaTelegram,
  FaUsers,
  FaUniversity,
  FaMoneyBillWave,
  FaQrcode,
  FaChartLine,
  FaCrown,
  FaGift,
  FaHistory,
  FaShieldAlt,
  FaCamera,
  FaCheck,
  FaShareAlt,
  FaSpinner,
  FaSync
} from "react-icons/fa";
import { MdEmail, MdVerified } from "react-icons/md";
import { HiSparkles } from "react-icons/hi";
import { userService } from '../../api/userService';
import { toast } from 'react-hot-toast';



const customFontStyle = {
  fontFamily: "'Neue Montreal Regular', sans-serif",
  fontWeight: 600,
  fontStyle: "normal",
};

const ProfilePage = () => {
  const { user, loading, token: contextToken, updateUser } = useAuth();
  const authToken = contextToken ?? user?.token ?? user?.authToken ?? localStorage.getItem('token') ?? localStorage.getItem('authToken') ?? localStorage.getItem('accessToken');
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isBankSheetOpen, setIsBankSheetOpen] = useState(false);
  const [isPasswordSheetOpen, setIsPasswordSheetOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    bio: ''
  });
  const [bankData, setBankData] = useState({
    accountNumber: '',
    ifscCode: '',
    accountHolderName: '',
    bankName: '',
    branch: '',
    upiId: ''
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [referralLinkCopied, setReferralLinkCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [referrals, setReferrals] = useState([]);
  const [referralsLoading, setReferralsLoading] = useState(false);
  const [referralsError, setReferralsError] = useState(null);
  const [totalReferrals, setTotalReferrals] = useState(0);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.personalInfo?.firstName || '',
        lastName: user.personalInfo?.lastName || '',
        email: user.email || '',
        phone: user.personalInfo?.phone || '',
        address: user.personalInfo?.address || '',
        bio: user.personalInfo?.bio || ''
      });
      setBankData({
        accountNumber: user.bankDetails?.accountNumber || '',
        ifscCode: user.bankDetails?.ifscCode || '',
        accountHolderName: user.bankDetails?.accountHolderName || '',
        bankName: user.bankDetails?.bankName || '',
        branch: user.bankDetails?.branch || '',
        upiId: user.bankDetails?.upiId || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if ((activeTab === 'referrals' || !activeTab) && authToken && user) {
      fetchReferrals();
    }
  }, [activeTab, authToken, user]);

  const fetchReferrals = async () => {
    if (!authToken) {
      setReferralsError("Authentication token missing. Please log in.");
      return;
    }
    setReferralsLoading(true);
    setReferralsError(null);
    try {
      const response = await userService.getMyReferrals();
      if (response && response.data && Array.isArray(response.data.referrals)) {
        setReferrals(response.data.referrals);
        setTotalReferrals(response.data.totalReferrals || response.data.referrals.length);
      } else {
        setReferrals([]);
        setTotalReferrals(0);
      }
    } catch (err) {
      console.error("Failed to fetch referrals:", err);
      setReferralsError(err.response?.data?.message || err.message);
      setReferrals([]);
      setTotalReferrals(0);
    } finally {
      setReferralsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBankChange = (e) => {
    const { name, value } = e.target;
    setBankData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) { // 5MB in bytes
        toast.error('Image size should be less than 5MB');
        return;
      }
      setImageFile(file);
      // Create local preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      // Create FormData object to send file and other data
      const updateData = new FormData();
      updateData.append('firstName', formData.firstName.trim());
      updateData.append('lastName', formData.lastName.trim());
      updateData.append('phone', formData.phone.trim());
      updateData.append('address', formData.address.trim());
      updateData.append('bio', formData.bio?.trim() || '');

      // Only append the file if a new one was selected
      if (imageFile) {
        updateData.append('profileImage', imageFile);
      }

      // Call the API function that handles file upload
      const response = await userService.updateProfile(updateData);

      if (response.success) {
        toast.success('Profile updated successfully!');
        // Update user in context if the updateUser function is available
        if (updateUser && response.data) {
          updateUser(response.data);
        }
        // Reset form state after successful update
        setImageFile(null);
        setImagePreview(null);
        setIsEditSheetOpen(false);
      } else {
        // Handle potential errors from the API response
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || error.message || 'An error occurred while updating the profile.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSubmitBank = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const response = await userService.updateBankDetails(bankData);
      if (response.success) {
        toast.success('Bank details updated successfully!');
        if (updateUser && response.data) {
          updateUser(response.data);
        }
        setIsBankSheetOpen(false);
      }
    } catch (error) {
      console.error("Error updating bank details:", error);
      toast.error(error.response?.data?.message || 'Failed to update bank details');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    setIsUpdating(true);
    try {
      const response = await userService.changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      });
      if (response.success) {
        toast.success('Password changed successfully!');
        setPasswordData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setIsPasswordSheetOpen(false);
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopyReferralCode = () => {
    if (user && user.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      setReferralLinkCopied(true);
      toast.success('Referral code copied!');
      setTimeout(() => setReferralLinkCopied(false), 2000);
    }
  };

  const handleShareVia = (platform) => {
    if (user && user.referralCode) {
      const fullLink = `${process.env.REACT_APP_FRONTEND_URL || 'https://your-frontend-url.com'}/register?ref=${user.referralCode}`;
      const message = `Join this amazing platform using my referral link: ${fullLink}`;
      switch(platform) {
        case 'whatsapp':
          window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
          break;
        case 'telegram':
          window.open(`https://t.me/share/url?url=${encodeURIComponent(fullLink)}&text=${encodeURIComponent(message)}`, '_blank');
          break;
        case 'email':
          window.open(`mailto:?subject=${encodeURIComponent("Join me on this platform!")}&body=${encodeURIComponent(message)}`, '_blank');
          break;
        default:
          break;
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="animate-pulse flex flex-col space-y-6 w-full max-w-5xl px-4">
          <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-1/3"></div>
          <div className="h-96 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <FaShieldAlt className="text-6xl text-gray-400 mb-4" />
        <p className="text-xl text-gray-600">Please log in to view your profile</p>
      </div>
    );
  }

  const getInitials = () => {
    const first = formData.firstName?.charAt(0) || '';
    const last = formData.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };

  const profileCompletion = () => {
    const fields = [
      formData.firstName,
      formData.lastName,
      formData.email,
      formData.phone,
      formData.address,
      bankData.accountNumber,
      bankData.ifscCode,
      bankData.bankName
    ];
    const filledFields = fields.filter(field => field && field.trim() !== '').length;
    return Math.round((filledFields / fields.length) * 100);
  };

  return (
    <div style={customFontStyle} className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Profile Card */}
        <Card className="mb-8 shadow-2xl border-0 bg-gradient-to-br from-white via-blue-50 to-indigo-50 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400 to-indigo-00 rounded-full blur-3xl opacity-10 -z-10"></div>
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar Section */}
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-white shadow-xl ring-4 ring-blue-100">
                  {/* Updated to show existing image or new preview */}
                  <AvatarImage 
                    src={user.personalInfo?.profileImage || imagePreview} 
                    alt={`${formData.firstName} ${formData.lastName}`} 
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-3xl font-bold">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*" // Accept only image files
                  className="hidden"
                />
                {/* Camera icon overlay */}
                <Button
                  size="icon"
                  type="button"
                  onClick={handleImageUpload}
                  className="absolute bottom-0 right-0 rounded-full h-10 w-10 bg-white shadow-lg border-2 border-blue-100 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Change profile picture"
                >
                  <FaCamera className="text-blue-600" />
                </Button>
              </div>
              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <h2 className="text-3xl font-bold text-gray-900">
                    {formData.firstName} {formData.lastName}
                  </h2>
                  {user.isEmailVerified && (
                    <Badge className="bg-blue-500 hover:bg-blue-600 gap-1">
                      <MdVerified className="text-sm" />
                      Verified
                    </Badge>
                  )}
                  {user.status === 'active' && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 gap-1">
                      <FaCrown className="text-sm" />
                      Active
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <FaEnvelope className="text-blue-500" />
                    <span>{formData.email}</span>
                  </div>
                  {formData.phone && (
                    <div className="flex items-center gap-2">
                      <FaPhone className="text-green-500" />
                      <span>{formData.phone}</span>
                    </div>
                  )}
                </div>
                {formData.bio && (
                  <p className="text-gray-600 mb-4 max-w-2xl">{formData.bio}</p>
                )}
                {/* Profile Completion */}
                <div className="space-y-2 max-w-md mx-auto md:mx-0">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 font-medium">Profile Completion</span>
                    <span className="text-blue-600 font-bold">{profileCompletion()}%</span>
                  </div>
                  <Progress value={profileCompletion()} className="h-2" />
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
                  <SheetTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 gap-2">
                      <FaEdit />
                      Edit Profile
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle className="flex items-center gap-2">
                        <FaUser className="text-blue-500" />
                        Edit Profile Information
                      </SheetTitle>
                      <SheetDescription>
                        Update your personal details and bio
                      </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleSubmitProfile} className="space-y-6 py-6">
                      {/* Image Upload Preview Section */}
                      {(imagePreview) && ( // Show preview only if a new image is selected
                        <div className="space-y-2">
                          <Label>New Profile Picture Preview</Label>
                          <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                              <AvatarImage src={imagePreview} alt="Preview" />
                              <AvatarFallback>{getInitials()}</AvatarFallback>
                            </Avatar>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setImageFile(null);
                                setImagePreview(null);
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      )}
                      {/* File Input Trigger Button */}
                      <div className="space-y-2">
                        <Label htmlFor="profileImage" className="flex items-center gap-2">
                          <FaCamera className="text-gray-400 text-xs" />
                          Upload Profile Picture
                        </Label>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleImageUpload}
                          className="w-full"
                        >
                          Select Image
                        </Button>
                        <input
                          id="profileImage"
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageChange}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>
                      {/* Text Inputs */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName" className="flex items-center gap-2">
                              <FaUser className="text-gray-400 text-xs" />
                              First Name
                            </Label>
                            <Input
                              id="firstName"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              placeholder="John"
                              className="focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName" className="flex items-center gap-2">
                              <FaUser className="text-gray-400 text-xs" />
                              Last Name
                            </Label>
                            <Input
                              id="lastName"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleInputChange}
                              placeholder="Doe"
                              className="focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="flex items-center gap-2">
                            <FaEnvelope className="text-gray-400 text-xs" />
                            Email Address
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            disabled // Email typically not editable here
                            className="focus:ring-2 focus:ring-blue-500 bg-gray-50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="flex items-center gap-2">
                            <FaPhone className="text-gray-400 text-xs" />
                            Phone Number
                          </Label>
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="+1 234 567 8900"
                            className="focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address" className="flex items-center gap-2">
                            <FaMapMarkerAlt className="text-gray-400 text-xs" />
                            Address
                          </Label>
                          <Input
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="123 Main St, City, Country"
                            className="focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bio" className="flex items-center gap-2">
                            <HiSparkles className="text-gray-400 text-sm" />
                            Bio
                          </Label>
                          <Textarea
                            id="bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            placeholder="Tell us about yourself..."
                            rows={4}
                            className="focus:ring-2 focus:ring-blue-500 resize-none"
                          />
                        </div>
                      </div>
                      <SheetFooter>
                        <SheetClose asChild>
                          <Button type="button" variant="outline" className="gap-2" disabled={isUpdating}>
                            <FaTimes />
                            Cancel
                          </Button>
                        </SheetClose>
                        <Button 
                          type="submit" 
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 gap-2"
                          disabled={isUpdating}
                        >
                          {isUpdating ? (
                            <>
                              <FaSpinner className="animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <FaSave />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </SheetFooter>
                    </form>
                  </SheetContent>
                </Sheet>
                <Button variant="outline" className="gap-2">
                  <FaShareAlt />
                  Share Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex bg-white shadow-md p-1 rounded-xl">
            <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
              <FaChartLine />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="referrals"
              className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white"
            >
              <FaUsers />
              <span className="hidden sm:inline">Referrals</span>
            </TabsTrigger>
            <TabsTrigger value="banking" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white">
              <FaUniversity />
              <span className="hidden sm:inline">Banking</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white">
              <FaShieldAlt />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Stats Cards */}
             
           
              <Card className="shadow-sm bg-gradient-to-br from-zinc-100 to-green-400 text-black border-2">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-black text-sm font-medium">Current Rank</p>
                      <h3 className="text-3xl font-bold mt-2">{user.rank?.current || 'Bronze'}</h3>
                    </div>
                    <FaGift className="text-5xl text-purple-200 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Personal Information Accordion */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FaUser className="text-blue-500" />
                  Personal Information
                </CardTitle>
                <CardDescription>Your account details and information</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="basic-info">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <FaUser className="text-blue-500" />
                        <span>Basic Information</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-500">First Name</Label>
                          <p className="text-base font-medium">{formData.firstName || 'Not set'}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-500">Last Name</Label>
                          <p className="text-base font-medium">{formData.lastName || 'Not set'}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-500">Email</Label>
                          <p className="text-base font-medium">{formData.email || 'Not set'}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-500">Phone</Label>
                          <p className="text-base font-medium">{formData.phone || 'Not set'}</p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="location">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <FaMapMarkerAlt className="text-red-500" />
                        <span>Location Details</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pt-4 space-y-1">
                        <Label className="text-xs text-gray-500">Address</Label>
                        <p className="text-base font-medium">{formData.address || 'Not set'}</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="account">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <FaShieldAlt className="text-green-500" />
                        <span>Account Status</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-500">Account Type</Label>
                          <Badge className={user.role === 'admin' ? "bg-gradient-to-r from-yellow-400 to-orange-500" : "bg-gray-500"}>
                            {user.role?.toUpperCase() || 'USER'}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-500">Verification Status</Label>
                          <Badge className={user.isEmailVerified ? "bg-green-500" : "bg-gray-500"}>
                            {user.isEmailVerified ? 'Verified' : 'Not Verified'}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-500">Member Since</Label>
                          <p className="text-base font-medium">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-500">Member ID</Label>
                          <p className="text-base font-medium font-mono text-sm">{user.memberId || 'N/A'}</p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Referrals Tab */}
          <TabsContent value="referrals" className="space-y-6">
            <Card className="shadow-xl border-0 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <FaUsers className="text-purple-600" />
                      Your Referral Program
                    </CardTitle>
                    <CardDescription>Share your code and earn rewards</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-gradient-to-r from-purple-900 to-pink-800 text-white text-lg px-4 py-2">
                      <FaGift className="mr-2" />
                      {totalReferrals} Referrals
                    </Badge>
                    <Button
                      onClick={fetchReferrals}
                      disabled={!authToken || referralsLoading}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      {referralsLoading ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaSync />
                      )}
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6 space-y-6">
                {/* Referral Code Section */}
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <Label className="text-lg font-semibold mb-3 block flex items-center gap-2">
                    <FaQrcode className="text-purple-600" />
                    Your Unique Referral Code
                  </Label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      value={user.referralCode || "Generating..."}
                      readOnly
                      className="text-lg font-mono font-bold text-center sm:text-left bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 focus:border-purple-400 flex-1"
                    />
                    <Button
                      onClick={handleCopyReferralCode}
                      className="bg-gradient-to-r from-purple-900 to-pink-900 hover:from-purple-900 hover:to-pink-900 gap-2 min-w-[140px]"
                    >
                      {referralLinkCopied ? (
                        <>
                          <FaCheck /> Copied!
                        </>
                      ) : (
                        <>
                          <FaCopy /> Copy Code
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Share Options */}
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <Label className="text-lg font-semibold mb-4 block flex items-center gap-2">
                    <FaShareAlt className="text-blue-600" />
                    Share Your Link
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Button
                      onClick={() => handleShareVia('whatsapp')}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 gap-2 h-12"
                    >
                      <FaWhatsapp className="text-xl" />
                      WhatsApp
                    </Button>
                    <Button
                      onClick={() => handleShareVia('telegram')}
                      className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 gap-2 h-12"
                    >
                      <FaTelegram className="text-xl" />
                      Telegram
                    </Button>
                    <Button
                      onClick={() => handleShareVia('email')}
                      className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 gap-2 h-12"
                    >
                      <MdEmail className="text-xl" />
                      Email
                    </Button>
                  </div>
                </div>

                {/* Referral Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-6 shadow-md">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm text-gray-600">Active Referrals</Label>
                      <FaCheckCircle className="text-green-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{totalReferrals}</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-md">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm text-gray-600">Total Earned</Label>
                      <FaMoneyBillWave className="text-green-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">₹{user.wallet?.totalEarnings || 0}</p>
                  </div>
                </div>

                {/* How it Works */}
                <Accordion type="single" collapsible className="bg-white rounded-xl shadow-md">
                  <AccordionItem value="how-it-works" className="border-0">
                    <AccordionTrigger className="px-6 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <HiSparkles className="text-yellow-500 text-xl" />
                        <span className="font-semibold">How Referral Program Works</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <ol className="space-y-3 mt-2">
                        <li className="flex items-start gap-3">
                          <Badge className="bg-purple-500 mt-1">1</Badge>
                          <div>
                            <p className="font-medium">Share your unique referral code</p>
                            <p className="text-sm text-gray-600">Copy and share your code with friends and family</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <Badge className="bg-purple-500 mt-1">2</Badge>
                          <div>
                            <p className="font-medium">They sign up using your code</p>
                            <p className="text-sm text-gray-600">New users register with your referral code</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <Badge className="bg-purple-500 mt-1">3</Badge>
                          <div>
                            <p className="font-medium">Earn rewards instantly</p>
                            <p className="text-sm text-gray-600">Get rewards when they complete their first action</p>
                          </div>
                        </li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Referral List Section */}
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-lg font-semibold block flex items-center gap-2">
                      <FaUsers className="text-purple-600" />
                      Referred Users ({referrals.length})
                    </Label>
                    <Button
                      onClick={fetchReferrals}
                      disabled={!authToken || referralsLoading}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      {referralsLoading ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaSync />
                      )}
                      Refresh
                    </Button>
                  </div>
                  {referralsLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <FaSpinner className="animate-spin text-2xl text-purple-600" />
                      <span className="ml-2 text-gray-600">Loading referrals...</span>
                    </div>
                  ) : referralsError ? (
                    <div className="text-center py-4 text-red-600">
                      <p>Error loading referrals: {referralsError}</p>
                      <Button onClick={fetchReferrals} className="mt-2 bg-purple-500 hover:bg-purple-600">
                        Retry
                      </Button>
                    </div>
                  ) : referrals.length === 0 ? (
                    <p className="text-gray-600 text-center py-4">No referrals found yet. Start sharing your referral code!</p>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                      {referrals.map((referral) => (
                        <div key={referral._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={referral.personalInfo?.profileImage} alt={`${referral.personalInfo?.firstName} ${referral.personalInfo?.lastName}`} />
                              <AvatarFallback className="bg-gray-200 text-gray-700">
                                {referral.personalInfo?.firstName?.charAt(0) || 'U'}{referral.personalInfo?.lastName?.charAt(0) || ''}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {referral.personalInfo?.firstName || 'N/A'} {referral.personalInfo?.lastName || ''}
                              </p>
                              <p className="text-sm text-gray-500">{referral.email}</p>
                              <p className="text-xs text-gray-400">ID: {referral.memberId}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Joined:</p>
                            <p className="text-sm">
                              {referral.createdAt ? new Date(referral.createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Banking Tab */}
          <TabsContent value="banking" className="space-y-6">
            <Card className="shadow-xl border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <FaUniversity className="text-green-600" />
                      Banking Information
                    </CardTitle>
                    <CardDescription>Manage your payment and withdrawal details</CardDescription>
                  </div>
                  <Sheet open={isBankSheetOpen} onOpenChange={setIsBankSheetOpen}>
                    <SheetTrigger asChild>
                      <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 gap-2">
                        <FaEdit />
                        Update Banking
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                          <FaCreditCard className="text-green-500" />
                          Update Bank Details
                        </SheetTitle>
                        <SheetDescription>
                          Enter your bank account information for withdrawals
                        </SheetDescription>
                      </SheetHeader>
                      <form onSubmit={handleSubmitBank} className="space-y-6 py-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="accountNumber" className="flex items-center gap-2">
                              <FaCreditCard className="text-gray-400 text-xs" />
                              Account Number
                            </Label>
                            <Input
                              id="accountNumber"
                              name="accountNumber"
                              value={bankData.accountNumber}
                              onChange={handleBankChange}
                              placeholder="Enter account number"
                              className="focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="ifscCode" className="flex items-center gap-2">
                              <FaBuilding className="text-gray-400 text-xs" />
                              IFSC Code
                            </Label>
                            <Input
                              id="ifscCode"
                              name="ifscCode"
                              value={bankData.ifscCode}
                              onChange={handleBankChange}
                              placeholder="XXXX0000000"
                              className="focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="accountHolderName" className="flex items-center gap-2">
                              <FaUser className="text-gray-400 text-xs" />
                              Account Holder Name
                            </Label>
                            <Input
                              id="accountHolderName"
                              name="accountHolderName"
                              value={bankData.accountHolderName}
                              onChange={handleBankChange}
                              placeholder="As per bank records"
                              className="focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bankName" className="flex items-center gap-2">
                              <FaUniversity className="text-gray-400 text-xs" />
                              Bank Name
                            </Label>
                            <Input
                              id="bankName"
                              name="bankName"
                              value={bankData.bankName}
                              onChange={handleBankChange}
                              placeholder="e.g., State Bank of India"
                              className="focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="branch" className="flex items-center gap-2">
                              <FaBuilding className="text-gray-400 text-xs" />
                              Branch Name
                            </Label>
                            <Input
                              id="branch"
                              name="branch"
                              value={bankData.branch}
                              onChange={handleBankChange}
                              placeholder="Branch location"
                              className="focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                          <Separator />
                          <div className="space-y-2">
                            <Label htmlFor="upiId" className="flex items-center gap-2">
                              <FaMoneyBillWave className="text-gray-400 text-xs" />
                              UPI ID (Optional)
                            </Label>
                            <Input
                              id="upiId"
                              name="upiId"
                              value={bankData.upiId}
                              onChange={handleBankChange}
                              placeholder="yourname@upi"
                              className="focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                        </div>
                        <SheetFooter>
                          <SheetClose asChild>
                            <Button type="button" variant="outline" className="gap-2" disabled={isUpdating}>
                              <FaTimes />
                              Cancel
                            </Button>
                          </SheetClose>
                          <Button 
                            type="submit" 
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 gap-2"
                            disabled={isUpdating}
                          >
                            {isUpdating ? (
                              <>
                                <FaSpinner className="animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <FaSave />
                                Save Details
                              </>
                            )}
                          </Button>
                        </SheetFooter>
                      </form>
                    </SheetContent>
                  </Sheet>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="bank-account">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <FaCreditCard className="text-blue-500" />
                        <span>Bank Account Details</span>
                        {bankData.accountNumber && (
                          <Badge className="bg-green-500 ml-2">
                            <FaCheckCircle className="mr-1" />
                            Configured
                          </Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-500">Account Number</Label>
                          <p className="text-base font-mono font-medium">
                            {bankData.accountNumber ? `****${bankData.accountNumber.slice(-4)}` : 'Not set'}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-500">IFSC Code</Label>
                          <p className="text-base font-mono font-medium">{bankData.ifscCode || 'Not set'}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-500">Account Holder</Label>
                          <p className="text-base font-medium">{bankData.accountHolderName || 'Not set'}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-500">Bank Name</Label>
                          <p className="text-base font-medium">{bankData.bankName || 'Not set'}</p>
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <Label className="text-xs text-gray-500">Branch</Label>
                          <p className="text-base font-medium">{bankData.branch || 'Not set'}</p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="upi">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <FaQrcode className="text-purple-500" />
                        <span>UPI Details</span>
                        {bankData.upiId && (
                          <Badge className="bg-green-500 ml-2">
                            <FaCheckCircle className="mr-1" />
                            Configured
                          </Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pt-4 space-y-1">
                        <Label className="text-xs text-gray-500">UPI ID</Label>
                        <p className="text-base font-mono font-medium">{bankData.upiId || 'Not set'}</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="shadow-md border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Available Balance</p>
                      <p className="text-2xl font-bold text-gray-900">₹{user.wallet?.balance || 0}</p>
                    </div>
                    <FaMoneyBillWave className="text-3xl text-blue-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-md border-0 bg-gradient-to-br from-green-50 to-emerald-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Withdrawn</p>
                      <p className="text-2xl font-bold text-gray-900">₹{user.wallet?.totalWithdrawn || 0}</p>
                    </div>
                    <FaCheckCircle className="text-3xl text-green-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-md border-0 bg-gradient-to-br from-orange-50 to-red-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Pending</p>
                      <p className="text-2xl font-bold text-gray-900">₹{user.wallet?.pendingCommissions || 0}</p>
                    </div>
                    <FaHistory className="text-3xl text-orange-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <FaShieldAlt className="text-orange-600" />
                  Account Settings
                </CardTitle>
                <CardDescription>Manage your account preferences and security</CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="security">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <FaShieldAlt className="text-green-500" />
                        <span>Security & Privacy</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-4">
                        <Sheet open={isPasswordSheetOpen} onOpenChange={setIsPasswordSheetOpen}>
                          <SheetTrigger asChild>
                            <Button variant="outline" className="w-full justify-start gap-2">
                              <FaEdit />
                              Change Password
                            </Button>
                          </SheetTrigger>
                          <SheetContent>
                            <SheetHeader>
                              <SheetTitle className="flex items-center gap-2">
                                <FaShieldAlt className="text-green-500" />
                                Change Password
                              </SheetTitle>
                              <SheetDescription>
                                Enter your current password and choose a new one
                              </SheetDescription>
                            </SheetHeader>
                            <form onSubmit={handleSubmitPassword} className="space-y-6 py-6">
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="oldPassword">Current Password</Label>
                                  <Input
                                    id="oldPassword"
                                    name="oldPassword"
                                    type="password"
                                    value={passwordData.oldPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Enter current password"
                                    className="focus:ring-2 focus:ring-green-500"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="newPassword">New Password</Label>
                                  <Input
                                    id="newPassword"
                                    name="newPassword"
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Enter new password"
                                    className="focus:ring-2 focus:ring-green-500"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                  <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Confirm new password"
                                    className="focus:ring-2 focus:ring-green-500"
                                  />
                                </div>
                              </div>
                              <SheetFooter>
                                <SheetClose asChild>
                                  <Button type="button" variant="outline" className="gap-2" disabled={isUpdating}>
                                    <FaTimes />
                                    Cancel
                                  </Button>
                                </SheetClose>
                                <Button 
                                  type="submit" 
                                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 gap-2"
                                  disabled={isUpdating}
                                >
                                  {isUpdating ? (
                                    <>
                                      <FaSpinner className="animate-spin" />
                                      Changing...
                                    </>
                                  ) : (
                                    <>
                                      <FaSave />
                                      Change Password
                                    </>
                                  )}
                                </Button>
                              </SheetFooter>
                            </form>
                          </SheetContent>
                        </Sheet>
                        <Button variant="outline" className="w-full justify-start gap-2" disabled>
                          <FaCheckCircle className="text-green-500" />
                          {user.isEmailVerified ? 'Email Verified' : 'Verify Email'}
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="notifications">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <MdEmail className="text-blue-500" />
                        <span>Notification Preferences</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-4">
                        <div className="flex items-center justify-between">
                          <Label>Email Notifications</Label>
                          <Badge>{user.notifications?.email ? 'Enabled' : 'Disabled'}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>SMS Notifications</Label>
                          <Badge>{user.notifications?.sms ? 'Enabled' : 'Disabled'}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Push Notifications</Label>
                          <Badge>{user.notifications?.push ? 'Enabled' : 'Disabled'}</Badge>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;
