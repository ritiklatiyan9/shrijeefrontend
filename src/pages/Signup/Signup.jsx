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
  Camera,
  Eye,
  EyeOff,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const customFontStyle = {
  fontFamily: "'Neue Montreal Regular', sans-serif",
  fontWeight: 600,
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
    if (!formData.sponsorId)
      newErrors.sponsorId = "Sponsor ID is required";
    if (!formData.email)
      newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email";
    if (!formData.username)
      newErrors.username = "Username is required";
    if (!formData.password)
      newErrors.password = "Password is required";
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
      className="h-full flex flex-col md:flex-row bg-gray-100"
    >
      {/* Left Section (Form) */}
      <div className="flex flex-col justify-start items-center md:w-1/2 w-full bg-gray-50 rounded-tr-[60px] rounded-br-[60px] shadow-xl p-10 md:px-16 py-8 relative overflow-y-auto">
        {/* Decorative blob */}
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-indigo-100 rounded-full blur-3xl opacity-70"></div>

        <div className="relative z-10 text-left w-full mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
            Join{" "}
            <span className="text-indigo-600">Shree Jee Real Estate</span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Create your account to get started
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="relative z-10 w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-lg p-6 md:p-8 space-y-5"
        >
          {/* Sponsor ID */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Sponsor ID <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                name="sponsorId"
                type="text"
                value={formData.sponsorId}
                onChange={handleChange}
                placeholder="Enter your Sponsor ID"
                className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.sponsorId ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
            {errors.sponsorId && (
              <p className="text-sm text-red-600 mt-1">{errors.sponsorId}</p>
            )}
          </div>

          {/* Username & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              icon={User}
              name="username"
              label="Username"
              placeholder="john123"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
            />
            <InputField
              icon={Mail}
              name="email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />
          </div>

          {/* Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PasswordField
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              showPassword={showPassword}
              toggle={() => setShowPassword(!showPassword)}
              error={errors.password}
            />
            <InputField
              icon={Lock}
              type="password"
              name="confirmPassword"
              label="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••"
              error={errors.confirmPassword}
            />
          </div>

          {/* Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              icon={User}
              name="firstName"
              label="First Name"
              placeholder="John"
              value={formData.personalInfo.firstName}
              onChange={handleChange}
              error={errors.firstName}
            />
            <InputField
              icon={User}
              name="lastName"
              label="Last Name"
              placeholder="Doe"
              value={formData.personalInfo.lastName}
              onChange={handleChange}
              error={errors.lastName}
            />
            <InputField
              icon={Phone}
              name="phone"
              label="Phone"
              placeholder="9876543210"
              value={formData.personalInfo.phone}
              onChange={handleChange}
              error={errors.phone}
            />
            <InputField
              icon={Calendar}
              name="dateOfBirth"
              type="date"
              label="Date of Birth"
              value={formData.personalInfo.dateOfBirth}
              onChange={handleChange}
              error={errors.dateOfBirth}
            />
            <InputField
              icon={Home}
              name="address"
              label="Address"
              placeholder="New Delhi, India"
              value={formData.personalInfo.address}
              onChange={handleChange}
              error={errors.address}
            />
          </div>

          {/* Bank Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField
              icon={IndianRupee}
              name="accountNumber"
              label="Account No."
              placeholder="1234567890"
              value={formData.bankDetails.accountNumber}
              onChange={handleChange}
              error={errors.accountNumber}
            />
            <InputField
              icon={Building}
              name="ifscCode"
              label="IFSC Code"
              placeholder="SBIN0001111"
              value={formData.bankDetails.ifscCode}
              onChange={handleChange}
              error={errors.ifscCode}
            />
            <InputField
              icon={User}
              name="accountHolderName"
              label="Account Holder"
              placeholder="John Doe"
              value={formData.bankDetails.accountHolderName}
              onChange={handleChange}
              error={errors.accountHolderName}
            />
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="text-sm bg-red-50 text-red-700 p-2.5 rounded-md border border-red-200">
              {errors.general}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg shadow-md transition transform hover:scale-[1.02]"
          >
            CREATE ACCOUNT
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 mb-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-600 hover:text-indigo-500 font-semibold"
          >
            Sign in
          </Link>
        </p>
      </div>

      {/* Right Illustration */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-indigo-950 to-zinc-950 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div>
        <div className="relative z-10 text-center px-8">
          <h2 className="text-white text-4xl font-bold mb-3">
            Build Your Real Estate Network
          </h2>
          <p className="text-indigo-100 text-sm max-w-md mx-auto">
            Register and start managing your team, bookings, and earnings
            effortlessly.
          </p>
        </div>
      </div>
    </div>
  );
}

// Reusable input field
const InputField = ({
  label,
  name,
  type = "text",
  icon: Icon,
  value,
  onChange,
  placeholder,
  error,
}) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1">
      {label}
    </label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />
    </div>
    {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
  </div>
);

const PasswordField = ({
  label,
  name,
  value,
  onChange,
  showPassword,
  toggle,
  error,
}) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1">
      {label}
    </label>
    <div className="relative">
      <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
      <input
        id={name}
        name={name}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder="••••••"
        className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />
      <button
        type="button"
        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
        onClick={toggle}
      >
        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
    {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
  </div>
);

export default SignUp;