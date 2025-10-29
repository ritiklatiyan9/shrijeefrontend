import React from 'react';
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ArrowLeft, ArrowRight, Home, Building2, CalendarDays, ChevronDown, Search } from 'lucide-react';

function HeroSection() {
  const heroRef = useRef();
  const searchCardRef = useRef();

  useEffect(() => {
    // GSAP animation for the hero section elements
    gsap.fromTo(heroRef.current,
      { scale: 1.05, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1.5, ease: 'power3.out' }
    );
    gsap.fromTo(searchCardRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, delay: 0.8, ease: 'power2.out' }
    );
  }, []);

  const [date, setDate] = React.useState({
    from: new Date(2024, 7, 28),
    to: new Date(2024, 7, 31),
  });

  return (
    <section ref={heroRef} className="relative h-screen w-full overflow-hidden">
      {/* Background Image - Covers entire section */}
      <div className="absolute inset-0">
        <img
          src="./src/assets/MainLuxuryVilla.jpg"
          alt="Luxury Real Estate Background"
          className="w-full h-full object-cover object-center"
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-4 md:p-8 flex flex-col justify-between h-full">
        {/* Top Left and Right Controls */}
        <div className="flex justify-between items-start w-full">
          <div className="flex items-center space-x-2 text-white/90">
            <button className="p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-colors">
              <ArrowLeft size={20} />
            </button>
            <span className="text-sm">For More Cases</span>
            <span className="font-bold text-base">Property</span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-colors">
              <ArrowLeft size={20} className="text-white" />
            </button>
            <button className="p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-colors">
              <ArrowRight size={20} className="text-white" />
            </button>
          </div>
        </div>

        {/* Search Card Overlay */}
        <div ref={searchCardRef} className="w-full max-w-2xl mx-auto mb-8 bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-2xl">
          <div className="flex items-center space-x-2 text-gray-700 font-semibold text-lg mb-4">
            <CalendarDays size={20} />
            <span>Find Your Dream Property Based On Time</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <button className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-between text-gray-700 bg-white transition-colors">
              <span className="text-sm">28 Aug - 31 Aug 2024</span>
              <ChevronDown size={16} className="opacity-50" />
            </button>

            <button className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-between text-gray-700 bg-white transition-colors">
              <span className="text-sm">Check-out Date</span>
              <ChevronDown size={16} className="opacity-50" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-between text-gray-700 bg-white transition-colors">
              <span className="flex items-center">
                <Home size={16} className="mr-2" /> Buy Villa
              </span>
              <ChevronDown size={16} />
            </button>
            <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-between text-gray-700 bg-white transition-colors">
              <span className="flex items-center">
                <Building2 size={16} className="mr-2" /> Rent Villa
              </span>
              <ChevronDown size={16} />
            </button>
            <button className="bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center rounded-lg py-3 transition-colors">
              <Search size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;

