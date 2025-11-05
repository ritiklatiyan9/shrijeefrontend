import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* Column 1: Logo & Tagline */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <span className="font-bold text-xl">Shree Jee Real Estate</span>
          </div>
          <p className="text-gray-400 mb-4">
            Discover properties that match your lifestyle from city condos to suburban homes, we've got you covered.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Facebook size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Twitter size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Instagram size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Linkedin size={20} />
            </a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
          <ul className="space-y-2 text-gray-400">
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
          <div className="space-y-3 text-gray-400">
            <div className="flex items-start space-x-2">
              <MapPin size={16} className="mt-1" />
              <span>New Delhi, India</span>
            </div>
            <div className="flex items-start space-x-2">
              <Phone size={16} className="mt-1" />
              <span>+91-XXXXX-XXXXX</span>
            </div>
            <div className="flex items-start space-x-2">
              <Mail size={16} className="mt-1" />
              <span>info@shreejeerealestate.com</span>
            </div>
          </div>
        </div>

        {/* Column 4: Newsletter / Stats */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Subscribe</h3>
          <p className="text-gray-400 mb-4">Get latest property updates straight to your inbox.</p>
          <form className="flex">
            <input
              type="email"
              placeholder="Your email"
              className="flex-grow px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-r-lg transition-colors"
            >
              →
            </button>
          </form>

          {/* Stats Circles */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-full p-4 text-center">
              <div className="text-2xl font-bold">50+</div>
              <div className="text-xs text-gray-400">Projects Complete</div>
            </div>
            <div className="bg-gray-800 rounded-full p-4 text-center">
              <div className="text-2xl font-bold">$3.5M</div>
              <div className="text-xs text-gray-400">Project Value</div>
            </div>
            <div className="bg-gray-800 rounded-full p-4 text-center col-span-2">
              <div className="text-2xl font-bold">100+</div>
              <div className="text-xs text-gray-400">Expert Teams</div>
            </div>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-gray-800 text-center text-gray-500 text-sm">
        © 2025 Shree Jee Real Estate. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;