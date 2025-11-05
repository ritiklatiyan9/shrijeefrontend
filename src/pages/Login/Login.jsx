import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";


const customFontStyle = {
  fontFamily: "'Neue Montreal Regular', sans-serif",
  fontWeight: 600,
  fontStyle: "normal",
};

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Enter a valid email";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Minimum 6 characters required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length) return setErrors(newErrors);

    try {
      const result = await login(formData);
      if (!result.success) setErrors({ general: result.message });
      else navigate("/dashboard");
    } catch {
      setErrors({ general: "An unexpected error occurred. Try again." });
    }
  };

  return (
    <div style={customFontStyle} className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      {/* Left Section */}
      <div className="flex flex-col justify-center items-center md:w-1/2 w-full bg-gray-50 rounded-tr-[60px] rounded-br-[60px] shadow-xl p-10 md:px-16 relative overflow-hidden">
        {/* Decorative blob */}
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-indigo-100 rounded-full blur-3xl opacity-70"></div>

        <div className="relative z-10 text-left w-full mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
            Welcome to{" "}
            <span className="text-indigo-600">Shree Jee Real Estate</span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Sign in to continue your journey with us
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="relative z-10 w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-lg p-6 space-y-6"
        >
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`w-full pl-10 pr-3 py-2.5 border rounded-lg text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-2.5 border rounded-lg text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600 mt-1">{errors.password}</p>
            )}
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center space-x-2 text-gray-700">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Remember me</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Forgot password?
            </Link>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="text-sm bg-red-50 text-red-700 p-2.5 rounded-md border border-red-200">
              {errors.general}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg shadow-md transition transform hover:scale-[1.02]"
          >
            LOGIN
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-indigo-600 hover:text-indigo-500 font-semibold"
          >
            Sign up
          </Link>
        </p>
      </div>

      {/* Right Illustration */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-indigo-950 to-zinc-950 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div>
        <div className="relative z-10 text-center px-8">
          <h2 className="text-white text-4xl font-bold mb-3">
            Empower Your Real Estate Journey
          </h2>
          <p className="text-indigo-100 text-sm max-w-md mx-auto">
            Manage bookings, view reports, and grow your network — all in one
            place with our modern dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
