import { Search, MapPin, Menu, ChevronDown } from 'lucide-react';

function Header() {
  return (
    // Removed p-4 from here as it might add unwanted space if the header needs to be flush with the top edge
    // If you need internal spacing, keep it, but ensure parent containers don't add external padding causing gaps
    <header className="relative z-50 flex items-center justify-between p-4 bg-transparent text-white"> 
      {/* Black transparent overlay behind header for visual separation */}
      <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm -z-10"></div>

      {/* Left Section: Logo */}
      <div className="flex items-center space-x-2">
        <div className="w-16 h-12 rounded-full bg-white flex items-center justify-center">
          {/* Corrected class name: w-15 doesn't exist, use w-14 or w-16 */}
          <img className="w-14 object-contain" src="./src/assets/logo.png" alt="Dr.Realtor Logo" /> 
        </div>
        <span className="font-bold text-lg">Dr.Realtor</span>
      </div>

      {/* Middle Section: Navigation (Responsive) */}
      {/* Your navigation code will go here if added later */}

      {/* Right Section: Icons and Location */}
      <div className="flex items-center space-x-4">
        <button className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-md transition-colors">
          <MapPin size={20} />
        </button>
        <button className="bg-orange-500 hover:bg-orange-600 text-white flex items-center space-x-2 rounded-full px-4 py-2 transition-colors">
          <MapPin size={16} />
          <span>Locations</span>
        </button>
        {/* Mobile Menu Toggle */}
        <button className="lg:hidden p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-md transition-colors">
          <Menu size={24} />
        </button>
      </div>
    </header>
  );
}

export default Header;