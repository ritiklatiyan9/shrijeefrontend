import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Header from './Pages/Header/Header';
import HeroSection from './pages/HeroSection';
import PropertySearch from './pages/PropertySearch';
import NearbyProperties from './pages/NearbyProperties';
import Footer from './Pages/Footer/Footer';// Add a simple footer
import Marquee from './pages/Marquee';
import HorizontalScrollCarousel from './pages/HorizontalScrollCarousel';

function App() {
  const appRef = useRef();

  useEffect(() => {
    // Basic page load animation with GSAP
    gsap.fromTo(appRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    );
  }, []);

  return (
    <div ref={appRef} className="min-h-screen bg-[#F8F9FA] dark:bg-gray-900 font-sans relative overflow-x-hidden"> {/* Added overflow-x-hidden to prevent horizontal scroll if needed */}
      <Header />
      {/* Removed horizontal padding (px-4 md:px-8 lg:px-12) from main */}
      <main className="relative z-10 py-4 md:py-8 lg:py-12"> {/* Kept only vertical padding */}
        <HeroSection />
        {/* Added padding to the container of PropertySearch and NearbyProperties */}
        <div className="lg:grid lg:grid-cols-3 lg:gap-8 mt-8 lg:mt-16 px-4 md:px-8 lg:px-12">
          <div className="lg:col-span-2">
            <PropertySearch />
          </div>
          <div className="lg:col-span-1 mt-8 lg:mt-0">
            <NearbyProperties />
          </div>
        </div>
        {/* Add padding to these sections as needed */}
        <div className='w-full px-4 md:px-8 lg:px-12'> {/* Added padding */}
          <Marquee/>
        </div>
        <div className='px-4 md:px-8 lg:px-12'> {/* Added padding */}
          <HorizontalScrollCarousel/>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;