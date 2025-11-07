// src/Pages/Footer/Footer.jsx
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
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import logo from '../../../public/assets/logo.png'

const customFontStyle = {
  fontFamily: "'Neue Montreal Regular', sans-serif",
  fontWeight: 600,
  fontStyle: "normal",
};

function Footer() {
  return (
    <footer
      style={customFontStyle} // Apply custom font style
      className="relative pt-12 pb-8 px-4 text-white overflow-hidden"
      style={{
        // The background gradient definition starts here
        background: `
          radial-gradient(circle at 15% 30%, rgba(130, 100, 255, 0.4) 0%, transparent 30%),
          radial-gradient(circle at 85% 70%, rgba(100, 80, 200, 0.3) 0%, transparent 30%),
          radial-gradient(circle at 40% 80%, rgba(150, 120, 255, 0.2) 0%, transparent 25%),
          radial-gradient(circle at 60% 20%, rgba(180, 160, 255, 0.25) 0%, transparent 28%),
          linear-gradient(to bottom right, #1E1A3D 0%, #3A2B68 30%, #5C4A9B 60%, #8A7DCB 100%)
        `,
        // Frosted glass effect
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)', // For Safari
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '1rem', // Assuming you want rounded corners like the image
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 p-6 ">

        {/* Column 1: Logo & Tagline */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <img
              src={logo}
              alt="Shree Jee Real Estate"
              className="w-16 h-12 rounded-full  shadow-md"
            />
            <span className="font-bold text-xl">Shree Jee Real Estate</span>
          </div>
          <p className="text-gray-200 mb-4">
            Discover properties that match your lifestyle from city condos to suburban homes, we've got you covered.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              <Facebook size={20} />
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              <Twitter size={20} />
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              <Instagram size={20} />
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              <Linkedin size={20} />
            </a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
          <ul className="space-y-2 text-gray-200">
            <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
            <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
            <li><a href="/property" className="hover:text-white transition-colors">Properties</a></li>
            <li><a href="/agents" className="hover:text-white transition-colors">Agents</a></li>
            <li><a href="/contact" className="hover:text-white transition-colors">Contact Us</a></li>
          </ul>
        </div>

        {/* Column 3: Contact Info */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
          <div className="space-y-3 text-gray-200">
            <div className="flex items-start space-x-2">
              <MapPin size={16} className="mt-1 text-gray-300" />
              <span>New Delhi, India</span>
            </div>
            <div className="flex items-start space-x-2">
              <Phone size={16} className="mt-1 text-gray-300" />
              <span>+91-724 878 3261</span>
            </div>
            <div className="flex items-start space-x-2">
              <Mail size={16} className="mt-1 text-gray-300" />
              <span>info@shreejeerealestate.com</span>
            </div>
          </div>
        </div>

        {/* Column 4: Newsletter / Stats */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Subscribe</h3>
          <p className="text-gray-200 mb-4">Get latest property updates straight to your inbox.</p>
          <form className="flex mb-6">
            <input
              type="email"
              placeholder="Your email"
              className="flex-grow px-4 py-2 bg-white/10 border border-white/20 rounded-l-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button
              type="submit"
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-r-lg transition-all duration-300"
            >
              →
            </button>
          </form>

          {/* Stats Circles */}
          <div className="mt-2 grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-full p-4 text-center backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">50+</div>
              <div className="text-xs text-gray-300">Projects Complete</div>
            </div>
            <div className="bg-white/10 rounded-full p-4 text-center backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">$3.5M</div>
              <div className="text-xs text-gray-300">Project Value</div>
            </div>
            <div className="bg-white/10 rounded-full p-4 text-center col-span-2 backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">100+</div>
              <div className="text-xs text-gray-300">Expert Teams</div>
            </div>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-white/10 text-center text-gray-300 text-sm">
        © 2025 Shree Jee Real Estate. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;