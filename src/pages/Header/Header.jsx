import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaHome,
  FaUserFriends,
  FaBuilding,
  FaMapMarkedAlt,
  FaPhoneAlt,
  FaSignInAlt,
  FaChevronDown,
  FaBars,
  FaTimes,
  FaLandmark,
  FaClipboardList,
  FaWarehouse,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";


const customFontStyle = {
  fontFamily: "'Neue Montreal Regular', sans-serif",
  fontWeight: 600,
  fontStyle: "normal",
};


function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (user && !location.pathname.startsWith("/dashboard")) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, location.pathname, navigate]);

  if (user) return null;

  const navLinks = [
    { name: "Home", path: "/", icon: <FaHome /> },
    { name: "About Us", path: "/about", icon: <FaUserFriends /> },
    {
      name: "Property",
      dropdown: true,
      icon: <FaBuilding />,
      subLinks: [
        { name: "All Properties", path: "/property" },
        { name: "Residential", path: "/property/residential" },
        { name: "Commercial", path: "/property/commercial" },
        { name: "Plots / Land", path: "/property/plots" },
        { name: "Rent / Lease", path: "/property/rent" },
        { name: "New Projects", path: "/property/new-projects" },
      ],
    },
    { name: "Agents", path: "/agents", icon: <FaLandmark /> },
    { name: "Contact Us", path: "/contact", icon: <FaPhoneAlt /> },
  ];

  return (
    <header style={customFontStyle} className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-zinc-900 via-indigo-900 to-zinc-900 shadow-lg">
      <nav className="container mx-auto px-5 py-2 flex justify-between items-center">
        {/* Logo Section */}
        <Link
          to="/"
          className="flex items-center gap-3 text-white hover:opacity-90 transition"
        >
          <img
            src="/src/assets/logo.png"
            alt="Shree Jee Real Estate"
            className="w-16 h-14 rounded-full  shadow-md"
          />
          <span className="font-bold text-xl tracking-wide">
            Shree Jee <span className="text-lime-50">Real Estate</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link, index) =>
            link.dropdown ? (
              <div
                key={index}
                className="relative group"
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <button
                  className={`flex items-center gap-1 text-white px-4 py-2 rounded-full hover:bg-white/20 transition ${
                    location.pathname.startsWith("/property")
                      ? "bg-white/25"
                      : ""
                  }`}
                >
                  {link.icon}
                  <span>{link.name}</span>
                  <FaChevronDown
                    className={`ml-1 transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 mt-2 bg-white rounded-lg shadow-lg w-56 py-2 border border-gray-200"
                    >
                      {link.subLinks.map((sublink, i) => (
                        <Link
                          key={i}
                          to={sublink.path}
                          onClick={() => setIsDropdownOpen(false)}
                          className={`block px-4 py-2 text-sm text-gray-700 hover:bg-purple-100 ${
                            location.pathname === sublink.path
                              ? "bg-purple-50 font-semibold"
                              : ""
                          }`}
                        >
                          {sublink.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                key={index}
                to={link.path}
                className={`flex items-center gap-2 text-white px-4 py-2 rounded-full hover:bg-white/20 transition ${
                  location.pathname === link.path ? "bg-white/25" : ""
                }`}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            )
          )}
        </div>

        {/* Login Button */}
        <div className="hidden lg:block">
          <Link
            to="/login"
            className="bg-lime-400 hover:bg-lime-500 text-black font-medium px-6 py-2 rounded-full transition-all shadow-md hover:shadow-lg"
          >
            <FaSignInAlt className="inline mr-2" />
            Login
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="text-white text-2xl lg:hidden"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <FaBars />
        </button>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            ></motion.div>

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 80 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-purple-700 to-blue-600 text-white">
                <h2 className="text-lg font-semibold">Menu</h2>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {navLinks.map((link, index) =>
                  link.dropdown ? (
                    <div key={index}>
                      <button
                        onClick={() =>
                          setIsDropdownOpen((prev) => !prev)
                        }
                        className="flex justify-between items-center w-full text-gray-700 font-medium py-2 px-3 rounded-lg hover:bg-gray-100 transition"
                      >
                        <div className="flex items-center gap-2">
                          {link.icon}
                          <span>{link.name}</span>
                        </div>
                        <FaChevronDown
                          className={`transition-transform ${
                            isDropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {isDropdownOpen && (
                        <div className="pl-6 mt-1 space-y-1">
                          {link.subLinks.map((sublink, i) => (
                            <Link
                              key={i}
                              to={sublink.path}
                              className="block text-sm py-1.5 px-2 rounded-md hover:bg-gray-100 text-gray-600"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {sublink.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      key={index}
                      to={link.path}
                      className={`flex items-center gap-2 w-full text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-100 transition ${
                        location.pathname === link.path
                          ? "bg-purple-100 text-purple-700"
                          : ""
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.icon}
                      {link.name}
                    </Link>
                  )
                )}

                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block mt-4 bg-gradient-to-r from-lime-400 to-blue-500 text-black text-center font-semibold py-2 rounded-full hover:from-lime-500 hover:to-blue-600 transition"
                >
                  <FaSignInAlt className="inline mr-2" />
                  Login
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Header;
