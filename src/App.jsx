import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Header from './pages/Header';
import HeroSection from './pages/HeroSection';
import PropertySearch from './pages/PropertySearch';
import NearbyProperties from './pages/NearbyProperties';
import Footer from './pages/Footer'; // Add a simple footer
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
    <div ref={appRef} className="min-h-screen bg-[#F8F9FA] dark:bg-gray-900 font-sans relative overflow-hidden">
      <Header />
      <main className="relative z-10 p-4 md:p-8 lg:p-12">
        <HeroSection />
        <div className="lg:grid lg:grid-cols-3 lg:gap-8 mt-8 lg:mt-16">
          <div className="lg:col-span-2">
            <PropertySearch />
          </div>
          <div className="lg:col-span-1 mt-8 lg:mt-0">
            <NearbyProperties />
          </div>
         
        </div>
         <div className='w-full'>
            <Marquee/>
          </div>
          <div>
            <HorizontalScrollCarousel/>
          </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;