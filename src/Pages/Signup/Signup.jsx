import { useState } from "react";
import {
  Mail,
  Lock,
  User,
  Phone,
  Calendar,
  Home,
  Building,
  IndianRupee,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";

const customFontStyle = {
  fontFamily: "'Neue Montreal Regular', sans-serif",
  fontStyle: "normal",
};

function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    sponsorId: "",
    personalInfo: {
      firstName: "",
      lastName: "",
      phone: "",
      dateOfBirth: "",
      address: "",
    },
    bankDetails: {
      accountNumber: "",
      ifscCode: "",
      accountHolderName: "",
    },
    profileImage: null,
  });
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name in formData.personalInfo) {
      setFormData({
        ...formData,
        personalInfo: { ...formData.personalInfo, [name]: value },
      });
    } else if (name in formData.bankDetails) {
      setFormData({
        ...formData,
        bankDetails: { ...formData.bankDetails, [name]: value },
      });
    } else if (name === "profileImage") {
      setFormData({ ...formData, profileImage: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.sponsorId) newErrors.sponsorId = "Sponsor ID is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email";
    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Minimum 6 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!formData.personalInfo.firstName)
      newErrors.firstName = "First name required";
    if (!formData.personalInfo.lastName)
      newErrors.lastName = "Last name required";
    if (!/^\d{10}$/.test(formData.personalInfo.phone))
      newErrors.phone = "Valid 10-digit phone required";
    if (!formData.personalInfo.dateOfBirth)
      newErrors.dateOfBirth = "Date of birth required";
    if (!formData.personalInfo.address)
      newErrors.address = "Address required";
    if (!/^\d{9,18}$/.test(formData.bankDetails.accountNumber))
      newErrors.accountNumber = "Valid account number required";
    if (!formData.bankDetails.ifscCode)
      newErrors.ifscCode = "IFSC code required";
    if (!formData.bankDetails.accountHolderName)
      newErrors.accountHolderName = "Account holder name required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length) return setErrors(newErrors);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "personalInfo" || key === "bankDetails") {
        Object.entries(value).forEach(([k, v]) =>
          data.append(`${key}[${k}]`, v)
        );
      } else data.append(key, value);
    });

    try {
      const result = await register(data);
      if (result.success) navigate("/login");
      else setErrors({ general: result.message });
    } catch (err) {
      setErrors({ general: "An error occurred during sign up." });
    }
  };

  return (
    <div
      style={customFontStyle}
      className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex justify-center py-10 px-4 md:px-6"
    >
      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 -ml-20 -mt-20 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="fixed bottom-0 right-0 -mr-20 -mb-20 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/50 overflow-hidden flex flex-col md:flex-row relative z-10"
      >
        {/* Left Section (Form) */}
        <div className="w-full md:w-3/5 p-8 md:p-12 lg:p-16 h-full">
          <div className="space-y-2 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Join <span className="text-indigo-600">Shree Jee real estate</span>
            </h1>
            <p className="text-slate-500 font-medium">
              Start your journey to financial freedom today.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Account Info */}
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-indigo-500 uppercase tracking-widest border-b border-indigo-100 pb-2">
                Account Details
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Sponsor ID <span className="text-red-500">*</span></label>
                  <InputField
                    icon={User}
                    name="sponsorId"
                    placeholder="Enter Sponsor ID"
                    value={formData.sponsorId}
                    onChange={handleChange}
                    error={errors.sponsorId}
                    className="bg-white/50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Username</label>
                    <InputField
                      icon={User}
                      name="username"
                      placeholder="Choose a username"
                      value={formData.username}
                      onChange={handleChange}
                      error={errors.username}
                      className="bg-white/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Email</label>
                    <InputField
                      icon={Mail}
                      name="email"
                      type="email"
                      placeholder="you@company.com"
                      value={formData.email}
                      onChange={handleChange}
                      error={errors.email}
                      className="bg-white/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Password</label>
                    <PasswordField
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      showPassword={showPassword}
                      toggle={() => setShowPassword(!showPassword)}
                      error={errors.password}
                      className="bg-white/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Confirm Password</label>
                    <InputField
                      icon={Lock}
                      type="password"
                      name="confirmPassword"
                      placeholder="••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      error={errors.confirmPassword}
                      className="bg-white/50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Personal Info */}
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-indigo-500 uppercase tracking-widest border-b border-indigo-100 pb-2">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  icon={User}
                  name="firstName"
                  placeholder="First Name"
                  value={formData.personalInfo.firstName}
                  onChange={handleChange}
                  error={errors.firstName}
                />
                <InputField
                  icon={User}
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.personalInfo.lastName}
                  onChange={handleChange}
                  error={errors.lastName}
                />
                <InputField
                  icon={Phone}
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.personalInfo.phone}
                  onChange={handleChange}
                  error={errors.phone}
                />
                <InputField
                  icon={Calendar}
                  name="dateOfBirth"
                  type="date"
                  value={formData.personalInfo.dateOfBirth}
                  onChange={handleChange}
                  error={errors.dateOfBirth}
                />
              </div>
              <InputField
                icon={Home}
                name="address"
                placeholder="Full Address"
                value={formData.personalInfo.address}
                onChange={handleChange}
                error={errors.address}
              />
            </div>

            {/* Section 3: Bank Details */}
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-indigo-500 uppercase tracking-widest border-b border-indigo-100 pb-2">
                Bank Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <InputField
                  icon={IndianRupee}
                  name="accountNumber"
                  placeholder="Account No."
                  value={formData.bankDetails.accountNumber}
                  onChange={handleChange}
                  error={errors.accountNumber}
                />
                <InputField
                  icon={Building}
                  name="ifscCode"
                  placeholder="IFSC Code"
                  value={formData.bankDetails.ifscCode}
                  onChange={handleChange}
                  error={errors.ifscCode}
                />
                <InputField
                  icon={User}
                  name="accountHolderName"
                  placeholder="Holder Name"
                  value={formData.bankDetails.accountHolderName}
                  onChange={handleChange}
                  error={errors.accountHolderName}
                />
              </div>
            </div>

            {/* Error Message */}
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {errors.general}
              </motion.div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                className="w-full group bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-indigo-300 flex items-center justify-center gap-2"
              >
                Create Account
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="mt-6 text-center">
                <p className="text-slate-500">
                  Already a partner?{" "}
                  <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-700 hover:underline decoration-2 underline-offset-4">
                    Log in here
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </div>

        {/* Right Section (Visuals) */}
        <div className="hidden md:flex w-2/5 bg-slate-900 relative items-center justify-center p-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 z-10" />

          {/* Background Image with Overlay */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
              alt="Modern Building"
              className="w-full h-full object-cover opacity-30 grayscale mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-slate-900/60" />
          </div>

          <div className="relative z-20 text-white max-w-sm space-y-8">
            <div>
              <h2 className="text-4xl font-bold mb-4 leading-tight">Welcome to the future of <span className="text-indigo-400">Real Estate</span></h2>
              <p className="text-slate-300 text-lg leading-relaxed">Join thousands of successful partners who are reshaping the skylines of Dehradun.</p>
            </div>

            <div className="space-y-4">
              {[
                "Smart Income Tracking",
                "Transparent Growth",
                "Premium Support",
                "Secure Transactions"
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + (i * 0.1) }}
                  className="flex items-center gap-3"
                >
                  <div className="p-1 rounded-full bg-indigo-500/20 text-indigo-300">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-slate-200">{item}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Animated shapes */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-40 -left-40 w-80 h-80 border border-white/10 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute -top-40 -right-40 w-[30rem] h-[30rem] border border-white/5 rounded-full"
          />
        </div>
      </motion.div>
    </div>
  );
}

// Reusable components
const InputField = ({ icon: Icon, error, className = "", ...props }) => (
  <div className="relative group">
    <div className="relative">
      {Icon && (
        <div className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <input
        {...props}
        className={`w-full ${Icon ? "pl-11" : "pl-4"} pr-4 py-3 bg-slate-50 border ${error ? "border-red-300 focus:border-red-500 focus:ring-red-200" : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-200"
          } rounded-xl outline-none focus:ring-4 transition-all duration-200 text-slate-700 placeholder:text-slate-400 font-medium ${className}`}
      />
    </div>
    {error && (
      <span className="absolute -bottom-5 left-1 text-xs text-red-500 font-medium">{error}</span>
    )}
  </div>
);

const PasswordField = ({ showPassword, toggle, error, className = "", ...props }) => (
  <div className="relative group">
    <div className="relative">
      <div className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
        <Lock className="w-5 h-5" />
      </div>
      <input
        type={showPassword ? "text" : "password"}
        placeholder="••••••"
        {...props}
        className={`w-full pl-11 pr-12 py-3 bg-slate-50 border ${error ? "border-red-300 focus:border-red-500 focus:ring-red-200" : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-200"
          } rounded-xl outline-none focus:ring-4 transition-all duration-200 text-slate-700 placeholder:text-slate-400 font-medium ${className}`}
      />
      <button
        type="button"
        onClick={toggle}
        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-indigo-600 transition-colors"
      >
        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
    {error && (
      <span className="absolute -bottom-5 left-1 text-xs text-red-500 font-medium">{error}</span>
    )}
  </div>
);

export default SignUp;
