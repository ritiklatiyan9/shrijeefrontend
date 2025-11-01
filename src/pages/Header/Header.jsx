import { Search, MapPin, Menu, ChevronDown, Home, Users, Briefcase, Rss, Mail, User, CheckCircle } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleMouseEnter = () => {
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    setTimeout(() => {
      if (!document.querySelector('.property-dropdown:hover') && !document.querySelector('.user-dropdown:hover')) {
        setIsDropdownOpen(false);
      }
    }, 150);
  };

  const handleClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (!isMobileMenuOpen) {
      setIsDropdownOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const showPropertyDropdown = isDropdownOpen || location.pathname.startsWith('/property');
  const showUserDropdown = isDropdownOpen && user;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4">
      <nav className="container mx-auto px-4 py-3 mt-2 bg-white shadow-sm border border-gray-300 rounded-full flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img src="/src/assets/logo.png" alt="Shree Jee Real Estate" className="w-12 h-10 overflow-hidden rounded-full" />
          <Link to="/" className="font-bold text-lg text-red-800">Shree Jee Real Estate</Link>
        </div>

        <nav className={`hidden lg:flex items-center space-x-1 ${isMobileMenuOpen ? 'hidden' : 'flex'}`}>
          <Link to="/" className={`flex items-center space-x-1 text-gray-600 hover:text-purple-600 transition-colors px-3 py-1.5 rounded-full hover:bg-purple-50 ${location.pathname === '/' ? 'text-purple-600 bg-purple-50' : ''}`}>
            <Home size={18} />
            <span>Home</span>
          </Link>
          <Link to="/about" className={`flex items-center space-x-1 text-gray-600 hover:text-purple-600 transition-colors px-3 py-1.5 rounded-full hover:bg-purple-50 ${location.pathname === '/about' ? 'text-purple-600 bg-purple-50' : ''}`}>
            <Users size={18} />
            <span>About us</span>
          </Link>

          <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={handleClick}
              className={`flex items-center space-x-1 text-gray-600 hover:text-purple-600 transition-colors px-3 py-1.5 rounded-full hover:bg-purple-50 ${location.pathname.startsWith('/property') ? 'text-purple-600 bg-purple-50' : ''}`}
              aria-haspopup="true"
              aria-expanded={isDropdownOpen}
            >
              <Briefcase size={18} />
              <span>Property</span>
              <ChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {showPropertyDropdown && (
              <div
                className="property-dropdown absolute left-0 mt-1 w-56 rounded-md bg-white shadow-lg border border-gray-200 z-50 origin-top transition-opacity duration-200"
                onMouseEnter={handleMouseEnter}
              >
                <div className="py-1">
                  <Link
                    to="/property"
                    className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${location.pathname === '/property' ? 'bg-gray-100 font-medium' : ''}`}
                    onClick={closeDropdown}
                  >
                    All Properties
                  </Link>
                  <Link
                    to="/property/residential"
                    className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${location.pathname === '/property/residential' ? 'bg-gray-100 font-medium' : ''}`}
                    onClick={closeDropdown}
                  >
                    Residential
                  </Link>
                  <Link
                    to="/property/commercial"
                    className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${location.pathname === '/property/commercial' ? 'bg-gray-100 font-medium' : ''}`}
                    onClick={closeDropdown}
                  >
                    Commercial
                  </Link>
                  <Link
                    to="/property/plots"
                    className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${location.pathname === '/property/plots' ? 'bg-gray-100 font-medium' : ''}`}
                    onClick={closeDropdown}
                  >
                    Plots / Land
                  </Link>
                  <Link
                    to="/property/rent"
                    className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${location.pathname === '/property/rent' ? 'bg-gray-100 font-medium' : ''}`}
                    onClick={closeDropdown}
                  >
                    Rent / Lease
                  </Link>
                  <Link
                    to="/property/new-projects"
                    className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${location.pathname === '/property/new-projects' ? 'bg-gray-100 font-medium' : ''}`}
                    onClick={closeDropdown}
                  >
                    New Projects
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link to="/agents" className={`flex items-center space-x-1 text-gray-600 hover:text-purple-600 transition-colors px-3 py-1.5 rounded-full hover:bg-purple-50 ${location.pathname === '/agents' ? 'text-purple-600 bg-purple-50' : ''}`}>
            <Users size={18} />
            <span>Agents</span>
          </Link>
          <Link to="/contact" className={`flex items-center space-x-1 text-gray-600 hover:text-purple-600 transition-colors px-3 py-1.5 rounded-full hover:bg-purple-50 ${location.pathname === '/contact' ? 'text-purple-600 bg-purple-50' : ''}`}>
            <Mail size={18} />
            <span>Contact Us</span>
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {user ? (
            <div className="hidden lg:flex items-center space-x-2">
              <div className="relative user-dropdown" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-1 text-gray-600 hover:text-purple-600 transition-colors px-3 py-1.5 rounded-full hover:bg-purple-50"
                >
                  <User size={18} />
                  <span className="truncate max-w-[80px]">{user.name || user.email || 'User'}</span>
                  <ChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {showUserDropdown && (
                  <div
                    className="absolute right-0 mt-1 w-48 rounded-md bg-white shadow-lg border border-gray-200 z-50 origin-top"
                  >
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={closeDropdown}
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={closeDropdown}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/kyc"
                        className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${location.pathname === '/kyc' ? 'bg-gray-100 font-medium' : ''}`}
                        onClick={closeDropdown}
                      >
                        <div className="flex items-center space-x-2">
                          <CheckCircle size={16} />
                          <span>KYC</span>
                        </div>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link to="/login" className="hidden lg:block bg-gradient-to-r from-lime-400 to-blue-500 text-black font-medium px-6 py-2 rounded-full transition-all duration-200 hover:from-lime-500 hover:to-blue-600">
              Login
            </Link>
          )}

          <button
            onClick={toggleMobileMenu}
            className="p-2 text-gray-800 hover:bg-gray-200 rounded-md transition-colors lg:hidden"
          >
            <Menu size={24} />
          </button>

          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-40 lg:hidden">
              <div className="fixed inset-0 bg-black bg-opacity-50" onClick={toggleMobileMenu}></div>
              <div className="fixed top-0 right-0 bottom-0 w-64 max-w-sm bg-white shadow-lg z-50 overflow-y-auto">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center space-x-2">
                      <img src="/src/assets/logo.png" alt="Shree Jee Real Estate" className="w-8 h-8 rounded-full" />
                      <span className="font-semibold text-gray-800">Shree Jee Real Estate</span>
                    </div>
                    <button onClick={toggleMobileMenu} className="p-2 text-gray-600 hover:bg-gray-200 rounded-md">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    <nav className="p-4 space-y-2">
                      <Link
                        to="/"
                        className={`flex items-center space-x-2 w-full text-gray-600 hover:text-purple-600 transition-colors px-3 py-2 rounded-lg ${location.pathname === '/' ? 'text-purple-600 bg-purple-50' : ''}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Home size={20} />
                        <span>Home</span>
                      </Link>
                      <Link
                        to="/about"
                        className={`flex items-center space-x-2 w-full text-gray-600 hover:text-purple-600 transition-colors px-3 py-2 rounded-lg ${location.pathname === '/about' ? 'text-purple-600 bg-purple-50' : ''}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Users size={20} />
                        <span>About us</span>
                      </Link>

                      <div>
                        <button
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className={`flex items-center justify-between w-full text-gray-600 hover:text-purple-600 transition-colors px-3 py-2 rounded-lg ${location.pathname.startsWith('/property') ? 'text-purple-600 bg-purple-50' : ''}`}
                        >
                          <div className="flex items-center space-x-2">
                            <Briefcase size={20} />
                            <span>Property</span>
                          </div>
                          <ChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isDropdownOpen && (
                          <div className="pl-8 mt-1 space-y-1">
                            <Link
                              to="/property"
                              className={`block text-sm text-gray-600 hover:text-purple-600 transition-colors px-3 py-1.5 rounded-lg ${location.pathname === '/property' ? 'text-purple-600 bg-purple-50' : ''}`}
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                setIsDropdownOpen(false);
                              }}
                            >
                              All Properties
                            </Link>
                            <Link
                              to="/property/residential"
                              className={`block text-sm text-gray-600 hover:text-purple-600 transition-colors px-3 py-1.5 rounded-lg ${location.pathname === '/property/residential' ? 'text-purple-600 bg-purple-50' : ''}`}
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                setIsDropdownOpen(false);
                              }}
                            >
                              Residential
                            </Link>
                            <Link
                              to="/property/commercial"
                              className={`block text-sm text-gray-600 hover:text-purple-600 transition-colors px-3 py-1.5 rounded-lg ${location.pathname === '/property/commercial' ? 'text-purple-600 bg-purple-50' : ''}`}
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                setIsDropdownOpen(false);
                              }}
                            >
                              Commercial
                            </Link>
                            <Link
                              to="/property/plots"
                              className={`block text-sm text-gray-600 hover:text-purple-600 transition-colors px-3 py-1.5 rounded-lg ${location.pathname === '/property/plots' ? 'text-purple-600 bg-purple-50' : ''}`}
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                setIsDropdownOpen(false);
                              }}
                            >
                              Plots / Land
                            </Link>
                            <Link
                              to="/property/rent"
                              className={`block text-sm text-gray-600 hover:text-purple-600 transition-colors px-3 py-1.5 rounded-lg ${location.pathname === '/property/rent' ? 'text-purple-600 bg-purple-50' : ''}`}
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                setIsDropdownOpen(false);
                              }}
                            >
                              Rent / Lease
                            </Link>
                            <Link
                              to="/property/new-projects"
                              className={`block text-sm text-gray-600 hover:text-purple-600 transition-colors px-3 py-1.5 rounded-lg ${location.pathname === '/property/new-projects' ? 'text-purple-600 bg-purple-50' : ''}`}
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                setIsDropdownOpen(false);
                              }}
                            >
                              New Projects
                            </Link>
                          </div>
                        )}
                      </div>

                      <Link
                        to="/agents"
                        className={`flex items-center space-x-2 w-full text-gray-600 hover:text-purple-600 transition-colors px-3 py-2 rounded-lg ${location.pathname === '/agents' ? 'text-purple-600 bg-purple-50' : ''}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Users size={20} />
                        <span>Agents</span>
                      </Link>
                      <Link
                        to="/contact"
                        className={`flex items-center space-x-2 w-full text-gray-600 hover:text-purple-600 transition-colors px-3 py-2 rounded-lg ${location.pathname === '/contact' ? 'text-purple-600 bg-purple-50' : ''}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Mail size={20} />
                        <span>Contact Us</span>
                      </Link>

                      {user ? (
                        <>
                          <div className="border-t border-gray-200 my-2"></div>
                          <div className="px-3 py-2 text-sm text-gray-700 truncate">Hi, {user.name || user.email || 'User'}!</div>
                          <Link
                            to="/profile"
                            className="flex items-center space-x-2 w-full text-gray-600 hover:text-purple-600 transition-colors px-3 py-2 rounded-lg"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <User size={20} />
                            <span>My Profile</span>
                          </Link>
                          <Link
                            to="/dashboard"
                            className="flex items-center space-x-2 w-full text-gray-600 hover:text-purple-600 transition-colors px-3 py-2 rounded-lg"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect width="7" height="9" x="3" y="3" rx="1"></rect>
                              <rect width="7" height="5" x="14" y="3" rx="1"></rect>
                              <rect width="7" height="9" x="14" y="12" rx="1"></rect>
                              <rect width="7" height="5" x="3" y="16" rx="1"></rect>
                            </svg>
                            <span>Dashboard</span>
                          </Link>
                          <Link
                            to="/kyc"
                            className={`flex items-center space-x-2 w-full text-gray-600 hover:text-purple-600 transition-colors px-3 py-2 rounded-lg ${location.pathname === '/kyc' ? 'text-purple-600 bg-purple-50' : ''}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <CheckCircle size={20} />
                            <span>KYC</span>
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 w-full text-gray-600 hover:text-red-600 transition-colors px-3 py-2 rounded-lg"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                              <polyline points="16 17 21 12 16 7"></polyline>
                              <line x1="21" x2="9" y1="12" y2="12"></line>
                            </svg>
                            <span>Logout</span>
                          </button>
                        </>
                      ) : (
                        <Link
                          to="/login"
                          className="block bg-gradient-to-r from-lime-400 to-blue-500 text-black font-medium px-6 py-2.5 rounded-full text-center mt-4 transition-all duration-200 hover:from-lime-500 hover:to-blue-600"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Login
                        </Link>
                      )}
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;